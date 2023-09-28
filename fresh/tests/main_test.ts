import { ServerContext, Status } from "../server.ts";
import {
  assert,
  assertEquals,
  assertMatch,
  assertStringIncludes,
  delay,
  puppeteer,
  retry,
} from "./deps.ts";
import manifest from "./fixture/fresh.gen.ts";
import options from "./fixture/options.ts";
import { BUILD_ID } from "../src/server/build_id.ts";
import {
  assertSelector,
  assertTextMany,
  parseHtml,
  startFreshServer,
  waitForText,
  withFakeServe,
  withPageName,
} from "./test_utils.ts";

const ctx = await ServerContext.fromManifest(manifest, options);
const handler = ctx.handler();

Deno.test("/ page prerender", async () => {
  const resp = await handler(new Request("https://fresh.deno.dev/"));
  assert(resp);
  assertEquals(resp.status, Status.OK);
  assertEquals(resp.headers.get("content-type"), "text/html; charset=utf-8");
  assertEquals(resp.headers.get("server"), "fresh test server");
  const body = await resp.text();
  assertStringIncludes(body, `<html lang="en">`);
  assertStringIncludes(body, "test_default.js");
  assertStringIncludes(body, "<p>Hello!</p>");
  assertStringIncludes(body, "<p>Viewing JIT render.</p>");
  assertStringIncludes(body, `>{"v":[[{"message":"Hello!"}],[]]}</script>`);
  assertStringIncludes(
    body,
    '<meta name="description" content="Hello world!"/>',
  );
  assertStringIncludes(
    body,
    '<meta name="generator" content="The freshest framework!"/>',
  );
  assert(
    !body.includes("specialTag"),
    `Expected actual: "${body}" to not contain: "specialTag"`,
  );
  assertStringIncludes(body, `<link rel="modulepreload"`);
});

Deno.test("/props/123 page prerender", async () => {
  const resp = await handler(new Request("https://fresh.deno.dev/props/123"));
  assert(resp);
  assertEquals(resp.status, Status.OK);
  assertEquals(resp.headers.get("content-type"), "text/html; charset=utf-8");
  const body = await resp.text();
  const doc = parseHtml(body);
  const data = JSON.parse(doc.querySelector("body > div")!.textContent!);

  assertEquals(data, {
    "params": { "id": "123" },
    "url": "https://fresh.deno.dev/props/123",
    "route": "/props/:id",
    "state": { "root": "root_mw" },
  });
});

Deno.test("/greet/[name] page prerender", async () => {
  const resp = await handler(new Request("https://fresh.deno.dev/bar"));
  assert(resp);
  assertEquals(resp.status, Status.OK);
  assertEquals(resp.headers.get("content-type"), "text/html; charset=utf-8");
  const body = await resp.text();
  assertStringIncludes(body, "<div>Hello bar</div>");
});

Deno.test("/api/head_override - HEAD", async () => {
  const req = new Request("https://fresh.deno.dev/api/head_override", {
    method: "HEAD",
  });
  const resp = await handler(req);
  assert(resp);
  assertEquals(resp.status, Status.NoContent);
  assertEquals(resp.body, null);
  assertEquals(
    resp.headers.get("content-type"),
    "text/html; charset=utf-8",
  );
});

Deno.test("/api/get_only - HEAD fallback", async () => {
  const req = new Request("https://fresh.deno.dev/api/get_only", {
    method: "HEAD",
  });
  const resp = await handler(req);
  assert(resp);
  assertEquals(resp.status, Status.OK);
  assertEquals(resp.body, null);
  assertEquals(
    resp.headers.get("content-type"),
    "application/json; charset=utf-8",
  );
});

Deno.test("/intercept - GET html", async () => {
  const req = new Request("https://fresh.deno.dev/intercept", {
    headers: { "accept": "text/html" },
  });
  const resp = await handler(req);
  assert(resp);
  assertEquals(resp.status, Status.OK);
  const body = await resp.text();
  assertStringIncludes(body, "<div>This is HTML</div>");
});

Deno.test("/intercept - GET text", async () => {
  const req = new Request("https://fresh.deno.dev/intercept", {
    headers: { "accept": "text/plain" },
  });
  const resp = await handler(req);
  assert(resp);
  assertEquals(resp.status, Status.OK);
  const body = await resp.text();
  assertEquals(body, "This is plain text");
});

Deno.test("/intercept - POST", async () => {
  const req = new Request("https://fresh.deno.dev/intercept", {
    method: "POST",
  });
  const resp = await handler(req);
  assert(resp);
  assertEquals(resp.status, Status.OK);
  const body = await resp.text();
  assertEquals(body, "POST response");
});

Deno.test("/intercept - DELETE", async () => {
  const req = new Request("https://fresh.deno.dev/intercept", {
    method: "DELETE",
  });
  const resp = await handler(req);
  assert(resp);
  assertEquals(resp.status, Status.MethodNotAllowed);
});

Deno.test("/intercept_args - GET html", async () => {
  const req = new Request("https://fresh.deno.dev/intercept_args", {
    headers: { "accept": "text/html" },
  });
  const resp = await handler(req);
  assert(resp);
  assertEquals(resp.status, Status.OK);
  const body = await resp.text();
  assertStringIncludes(body, "<div>intercepted</div>");
});

Deno.test("/status_overwrite", async () => {
  const req = new Request("https://fresh.deno.dev/status_overwrite", {
    headers: { "accept": "text/html" },
  });
  const resp = await handler(req);
  assert(resp);
  assertEquals(resp.status, Status.Unauthorized);
  assertEquals(resp.headers.get("x-some-header"), "foo");
  const body = await resp.text();
  assertStringIncludes(body, "<div>This is HTML</div>");
});

Deno.test("/api/get_only - NOTAMETHOD", async () => {
  const resp = await handler(
    new Request("https://fresh.deno.dev/api/get_only", {
      method: "NOTAMETHOD",
    }),
  );
  assert(resp);
  assertEquals(resp.status, Status.MethodNotAllowed);
});

Deno.test("/api/xyz not found", async () => {
  const resp = await handler(new Request("https://fresh.deno.dev/api/xyz"));
  assert(resp);
  assertEquals(resp.status, Status.NotFound);
  const body = await resp.text();
  assertStringIncludes(body, "404 not found: /api/xyz");
});

Deno.test("/static page prerender", async () => {
  const resp = await handler(new Request("https://fresh.deno.dev/static"));
  assert(resp);
  assertEquals(resp.status, Status.OK);
  assertEquals(resp.headers.get("content-type"), "text/html; charset=utf-8");
  const body = await resp.text();
  assert(!body.includes(`main.js`));
  assert(!body.includes(`island-test.js`));
  assertStringIncludes(body, "<p>This is a static page.</p>");
  assertStringIncludes(body, `src="/image.png?__frsh_c=`);
  assert(!body.includes("__FRSH_ISLAND_PROPS"));
});

Deno.test("/books/:id page - /books/123", async () => {
  const resp = await handler(new Request("https://fresh.deno.dev/books/123"));
  assert(resp);
  assertEquals(resp.status, Status.OK);
  assertEquals(resp.headers.get("content-type"), "text/html; charset=utf-8");
  const body = await resp.text();
  assertStringIncludes(body, "<div>Book 123</div>");
});

Deno.test("/books/:id page - /books/abc", async () => {
  const resp = await handler(new Request("https://fresh.deno.dev/books/abc"));
  assert(resp);
  assertEquals(resp.status, Status.NotFound);
});

Deno.test("/i18n{/:lang}?/lang page - /i18n/lang", async () => {
  const resp = await handler(new Request("https://fresh.deno.dev/i18n/lang"));
  assert(resp);
  assertEquals(resp.status, Status.OK);
  assertEquals(resp.headers.get("content-type"), "text/html; charset=utf-8");
  const body = await resp.text();
  assertStringIncludes(body, "<div>Hello</div>");
});

Deno.test("/i18n{/:lang}?/lang page - /i18n/en/lang", async () => {
  const resp = await handler(
    new Request("https://fresh.deno.dev/i18n/en/lang"),
  );
  assert(resp);
  assertEquals(resp.status, Status.OK);
  assertEquals(resp.headers.get("content-type"), "text/html; charset=utf-8");
  const body = await resp.text();
  assertStringIncludes(body, "<div>Hello en</div>");
});

Deno.test("redirect /pages/fresh/ to /pages/fresh", async () => {
  const resp = await handler(
    new Request("https://fresh.deno.dev/pages/fresh/"),
  );
  assert(resp);
  assertEquals(resp.status, Status.TemporaryRedirect);
  assertEquals(
    resp.headers.get("location"),
    "/pages/fresh",
  );
});

Deno.test("redirect /pages/////fresh///// to /pages/////fresh", async () => {
  const resp = await handler(
    new Request("https://fresh.deno.dev/pages/////fresh/////"),
  );
  assert(resp);
  assertEquals(resp.status, Status.TemporaryRedirect);
  assertEquals(
    resp.headers.get("location"),
    "/pages/////fresh",
  );
});

Deno.test("redirect /pages/////fresh/ to /pages/////fresh", async () => {
  const resp = await handler(
    new Request("https://fresh.deno.dev/pages/////fresh/"),
  );
  assert(resp);
  assertEquals(resp.status, Status.TemporaryRedirect);
  assertEquals(
    resp.headers.get("location"),
    "/pages/////fresh",
  );
});

Deno.test("no redirect for /pages/////fresh", async () => {
  const resp = await handler(
    new Request("https://fresh.deno.dev/pages/////fresh"),
  );
  assert(resp);
  assertEquals(resp.status, Status.NotFound);
});

Deno.test("/failure", async () => {
  const resp = await handler(new Request("https://fresh.deno.dev/failure"));
  assert(resp);
  assertEquals(resp.status, Status.InternalServerError);
  const body = await resp.text();
  assert(body.includes("500 internal error: it errored!"));
  assertStringIncludes(
    body,
    `<meta name="generator" content="The freshest framework!"/>`,
  );
});

Deno.test("/foo/:path*", async () => {
  const resp = await handler(new Request("https://fresh.deno.dev/foo/bar/baz"));
  assert(resp);
  assertEquals(resp.status, Status.OK);
  const body = await resp.text();
  assert(body.includes("bar/baz"));
});

Deno.test("static files in custom directory", async () => {
  const newCtx = await ServerContext.fromManifest(manifest, {
    ...options,
    staticDir: "./custom_static",
  });
  const newRouter = (req: Request) => {
    return newCtx.handler()(req, {
      remoteAddr: {
        transport: "tcp",
        hostname: "127.0.0.1",
        port: 80,
      },
    });
  };

  const resp = await newRouter(
    new Request("https://fresh.deno.dev/custom.txt"),
  );
  assertEquals(resp.status, Status.OK);
  const body = await resp.text();
  assert(body.startsWith("dir"));
});

Deno.test("static file - by file path", async () => {
  const resp = await handler(new Request("https://fresh.deno.dev/foo.txt"));
  assertEquals(resp.status, Status.OK);
  const body = await resp.text();
  assert(body.startsWith("bar"));
  const etag = resp.headers.get("etag");
  assert(etag);
  // The etag is not weak, because this did not go through content encoding, so
  // this is not a real server.
  assert(!etag.startsWith("W/"), "etag should be weak");
  assertEquals(resp.headers.get("content-type"), "text/plain");

  const resp2 = await handler(
    new Request("https://fresh.deno.dev/foo.txt", {
      headers: {
        "if-none-match": etag,
      },
    }),
  );
  assertEquals(resp2.status, Status.NotModified);
  assertEquals(resp2.headers.get("etag"), etag);
  assertEquals(resp2.headers.get("content-type"), "text/plain");

  const resp3 = await handler(
    new Request("https://fresh.deno.dev/foo.txt", {
      headers: {
        "if-none-match": `W/${etag}`,
      },
    }),
  );
  assertEquals(resp3.status, Status.NotModified);
  assertEquals(resp3.headers.get("etag"), etag);
  assertEquals(resp3.headers.get("content-type"), "text/plain");
});

Deno.test("HEAD request", async () => {
  // Static file
  const resp = await handler(
    new Request("https://fresh.deno.dev/foo.txt", {
      method: "HEAD",
    }),
  );
  assertEquals(resp.status, Status.OK);
  const body = await resp.text();
  assertEquals(body, "");

  // route
  const resp2 = await handler(
    new Request("https://fresh.deno.dev/books/123", {
      method: "HEAD",
    }),
  );
  assert(resp2);
  assertEquals(resp2.status, Status.OK);
  const body2 = await resp2.text();
  assertEquals(body2, "");
});

Deno.test("static file - by 'hashed' path", async () => {
  // Check that the file path have the BUILD_ID
  const resp = await handler(
    new Request("https://fresh.deno.dev/assetsCaching"),
  );
  const body = await resp.text();
  const imgFilePath = body.match(/img id="img-with-hashing" src="(.*?)"/)?.[1];
  assert(imgFilePath);
  assert(imgFilePath.includes(`?__frsh_c=${BUILD_ID}`));

  // check the static file is served correctly under its cacheable route
  const resp2 = await handler(
    new Request(`https://fresh.deno.dev${imgFilePath}`),
  );
  const _ = await resp2.text();
  assertEquals(resp2.status, Status.OK);
  assertEquals(
    resp2.headers.get("cache-control"),
    "public, max-age=31536000, immutable",
  );

  const resp3 = await handler(
    new Request(`https://fresh.deno.dev${imgFilePath}`, {
      headers: {
        "if-none-match": resp2.headers.get("etag")!,
      },
    }),
  );
  assertEquals(resp3.status, Status.NotModified);

  // ensure asset hook is not applied on file explicitly excluded with attribute
  const imgFilePathWithNoCache = body.match(
    /img id="img-without-hashing" src="(.*?)"/,
  )?.[1];
  assert(imgFilePathWithNoCache);
  assert(
    !imgFilePathWithNoCache.includes(BUILD_ID),
    "img-without-hashing",
  );

  // ensure asset hook is applied on img within an island
  const imgInIsland = body.match(/img id="img-in-island" src="(.*?)"/)?.[1];
  assert(imgInIsland);
  assert(imgInIsland.includes(BUILD_ID), "img-in-island");

  // verify that the asset hook is applied to the srcset
  const imgInIslandSrcSet = body.match(/srcset="(.*?)"/)?.[1];
  assert(imgInIslandSrcSet);
  assert(
    imgInIslandSrcSet.includes(BUILD_ID),
    "img-in-island-srcset",
  );

  // verify that the asset hook is not applied to img outside reference out of the static folder
  const imgMissing = body.match(/img id="img-missing" src="(.*?)"/)?.[1];
  assert(imgMissing);
  assert(
    !imgMissing.includes(BUILD_ID),
    "Applying hash on unknown asset",
  );
});

Deno.test("/params/:path*", async () => {
  const resp = await handler(
    new Request("https://fresh.deno.dev/params/bar/baz"),
  );
  assert(resp);
  assertEquals(resp.status, Status.OK);
  const body = await resp.text();
  assertEquals(body, "bar/baz");
});

Deno.test("/connInfo", async () => {
  const resp = await handler(new Request("https://fresh.deno.dev/connInfo"));
  assert(resp);
  assertEquals(resp.status, Status.OK);
  const body = await resp.text();
  assertEquals(body, "localhost");
});

Deno.test("state in page props", async () => {
  const resp = await handler(
    new Request("https://fresh.deno.dev/state-in-props"),
  );
  assert(resp);
  assertEquals(resp.status, Status.OK);
  assertEquals(resp.headers.get("content-type"), "text/html; charset=utf-8");
  const body = await resp.text();
  assertStringIncludes(
    body,
    '<meta name="generator" content="The freshest framework!"/>',
  );
  assertStringIncludes(body, "specialTag");
  assertStringIncludes(body, "LOOK, I AM SET FROM MIDDLEWARE");
});

Deno.test({
  name: "/middleware - root",
  fn: async () => {
    const resp = await handler(
      new Request("https://fresh.deno.dev/middleware_root"),
    );
    assert(resp);
    assertEquals(resp.status, Status.OK);
    const body = await resp.text();
    assertStringIncludes(body, "root_mw");
    assert(!body.includes("layer1_mw"));
  },
});

Deno.test({
  name: "/middleware - mixedHandler(cors)",
  fn: async () => {
    const resp = await handler(
      new Request("https://fresh.deno.dev/middleware_root", {
        method: "OPTIONS",
      }),
    );
    assert(resp);

    // test cors handler
    assertEquals(resp.status, Status.NoContent);
  },
});

Deno.test({
  name: "/middleware - mixedHandler(log)",
  fn: async () => {
    const resp = await handler(
      new Request("https://fresh.deno.dev/middleware_root"),
    );
    assert(resp);
    assertEquals(resp.status, Status.OK);

    // test log handler
    const latency = resp.headers.get("latency");
    assert(latency);
    assert(+latency >= 0, `latency=${latency}ms `);
  },
});

Deno.test({
  name: "/middleware - layer 2 middleware",
  fn: async () => {
    const resp = await handler(
      new Request("https://fresh.deno.dev/layeredMdw/layer2/abc"),
    );
    assert(resp);
    assertEquals(resp.status, Status.OK);
    const body = await resp.text();
    assertStringIncludes(body, "root_mw");
    assertStringIncludes(body, "layer1_mw");
    assertStringIncludes(body, "layer2_mw");
    // layered 2 should not run layer 3 middleware
    assert(!body.includes("layer3_mw"));

    const resp1 = await handler(
      new Request("https://fresh.deno.dev/layeredMdw/layer2-no-mw/without_mw"),
    );
    assert(resp1);
    assertEquals(resp1.status, Status.OK);
    const body1 = await resp1.text();
    assertStringIncludes(body1, "root_mw");
    assertStringIncludes(body1, "layer1_mw");
    // layered 2 should not run layer 2 or 3 middleware
    assert(!body1.includes("layer2_mw"));
    assert(!body1.includes("layer3_mw"));
  },
});

Deno.test({
  name: "/middleware - layer 2 middleware at index",
  fn: async () => {
    const resp = await handler(
      new Request("https://fresh.deno.dev/layeredMdw/layer2"),
    );
    assert(resp);
    assertEquals(resp.status, Status.OK);
    const body = await resp.text();
    assertStringIncludes(body, "root_mw");
    assertStringIncludes(body, "layer1_mw");
    assertStringIncludes(body, "layer2_mw");
    // layered 2 should not run layer 3 middleware
    assert(!body.includes("layer3_mw"));

    const resp1 = await handler(
      new Request("https://fresh.deno.dev/layeredMdw/layer2-no-mw/without_mw"),
    );
    assert(resp1);
    assertEquals(resp1.status, Status.OK);
    const body1 = await resp1.text();
    assertStringIncludes(body1, "root_mw");
    assertStringIncludes(body1, "layer1_mw");
    // layered 2 should not run layer 2 or 3 middleware
    assert(!body1.includes("layer2_mw"));
    assert(!body1.includes("layer3_mw"));
  },
});

Deno.test({
  name: "/middleware - layer 3 middleware",
  fn: async () => {
    // layered 3 should contain layer 3 middleware data
    const resp = await handler(
      new Request("https://fresh.deno.dev/layeredMdw/layer2/layer3/abc"),
    );
    assert(resp);
    assertEquals(resp.status, Status.OK);
    const body = await resp.text();
    assertStringIncludes(body, "root_mw");
    assertStringIncludes(body, "layer1_mw");
    assertStringIncludes(body, "layer3_mw");
    assertEquals(resp.headers.get("layer3"), "fresh test server layer3");
    // the below ensure that the middlewware are applied in the correct order.
    // i.e response header set from layer3 middleware is overwritten
    // by the response header in layer 0
    assertEquals(resp.headers.get("server"), "fresh test server");
  },
});

Deno.test({
  name: "/middleware - should pass state through all middlewares",
  fn: async () => {
    const resp = await handler(
      new Request("https://fresh.deno.dev/state-middleware/foo"),
    );
    assert(resp);
    assertEquals(resp.status, Status.OK);

    const body = await resp.text();
    const doc = parseHtml(body);
    assertEquals(JSON.parse(doc.querySelector("pre")!.textContent!), {
      handler1: "it works",
      handler2: "it works",
      handler3: "it works",
    });
  },
});

Deno.test({
  name: "/middleware - middlewareParams",
  fn: async () => {
    const resp = await handler(
      new Request(
        "https://fresh.deno.dev/layeredMdw/layer2-with-params/tenant1/resource1",
      ),
    );
    assert(resp);
    assertEquals(resp.status, Status.OK);
    const _body = await resp.text();
    // assert that outer has access to all params
    assertEquals(
      resp.headers.get("middlewareParams_outer"),
      JSON.stringify({ tenantId: "tenant1", id: "resource1" }),
    );
    // assert that inner also has access to all params
    assertEquals(
      resp.headers.get("middlewareParams_inner"),
      JSON.stringify({ tenantId: "tenant1", id: "resource1" }),
    );
    assertEquals(resp.headers.get("server"), "fresh test server");
  },
});

Deno.test({
  name: "middleware nesting order",
  fn: async () => {
    const resp = await handler(
      new Request(
        "https://fresh.deno.dev/layeredMdw/nesting/acme/production/abc",
      ),
    );
    assert(resp);
    assertEquals(resp.status, Status.OK);
    const body = await resp.text();
    assertStringIncludes(body, "<div>1234</div>");
  },
});

Deno.test({
  name: "/not_found",
  fn: async () => {
    const resp = await handler(new Request("https://fresh.deno.dev/not_found"));
    assert(resp);
    assertEquals(resp.status, 404);
    const body = await resp.text();
    assertStringIncludes(body, "404 not found: /not_found");
    assertStringIncludes(body, "Hello Dino");
    assertStringIncludes(body, "State root: root_mw");
  },
});

Deno.test("middleware destination", async (t) => {
  await t.step("static", async () => {
    const resp = await handler(new Request("https://fresh.deno.dev/foo.txt"));
    assert(resp);
    assertEquals(resp.headers.get("destination"), "static");
    await resp.body?.cancel();
  });

  await t.step("route", async () => {
    const resp = await handler(new Request("https://fresh.deno.dev/"));
    assert(resp);
    assertEquals(resp.headers.get("destination"), "route");
    await resp.body?.cancel();
  });

  await t.step("notFound", async () => {
    const resp = await handler(new Request("https://fresh.deno.dev/bar/bar"));
    assert(resp);
    assertEquals(resp.headers.get("destination"), "notFound");
    await resp.body?.cancel();
  });
});

Deno.test({
  name: "middleware catch error",
  fn: async () => {
    const resp = await handler(
      new Request(
        "https://fresh.deno.dev/middleware-error-handler",
      ),
    );
    assert(resp);
    assertEquals(resp.status, Status.InternalServerError);
    const body = await resp.text();
    assertStringIncludes(
      body,
      "500 internal error: don't show the full error for security purposes",
    );
  },
});

Deno.test("jsx pragma works", async (t) => {
  // Preparation
  const { serverProcess, lines, address } = await startFreshServer({
    args: ["run", "-A", "./tests/fixture_jsx_pragma/main.ts"],
  });

  await delay(100);

  await t.step("ssr", async () => {
    const resp = await fetch(address);
    assertEquals(resp.status, Status.OK);
    const text = await resp.text();
    assertStringIncludes(text, "Hello World");
    assertStringIncludes(text, "ssr");
  });

  const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
  const page = await browser.newPage();

  await page.goto(address, {
    waitUntil: "networkidle2",
  });

  await t.step("island is revived", async () => {
    await page.waitForSelector("#csr");
  });

  await browser.close();

  serverProcess.kill("SIGTERM");
  await serverProcess.status;

  // Drain the lines stream
  for await (const _ of lines) { /* noop */ }
});

Deno.test("preloading javascript files", async () => {
  // Preparation
  const { serverProcess, lines, address } = await startFreshServer({
    args: ["run", "-A", "./tests/fixture/main.ts"],
  });

  const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
  const page = await browser.newPage();

  try {
    // request js file to start esbuild execution
    await page.goto(address, {
      waitUntil: "networkidle2",
    });

    await delay(5000); // wait running esbuild

    await page.goto(address, {
      waitUntil: "networkidle2",
    });

    const preloads: string[] = await page.$$eval(
      'link[rel="modulepreload"]',
      (elements) => elements.map((element) => element.getAttribute("href")),
    );

    assert(
      preloads.some((url) => url.match(/\/_frsh\/js\/.*\/main\.js/)),
      "preloads does not include main.js",
    );
    assert(
      preloads.some((url) => url.match(/\/_frsh\/js\/.*\/island-.*\.js/)),
      "preloads does not include island-*.js",
    );
    assert(
      preloads.some((url) => url.match(/\/_frsh\/js\/.*\/chunk-.*\.js/)),
      "preloads does not include chunk-*.js",
    );
  } finally {
    await browser.close();

    serverProcess.kill("SIGTERM");
    await serverProcess.status;

    // Drain the lines stream
    for await (const _ of lines) { /* noop */ }
  }
});

Deno.test("PORT environment variable", async () => {
  const PORT = "8765";
  // Preparation
  const { serverProcess, lines } = await startFreshServer({
    args: ["run", "-A", "./tests/fixture/main.ts"],
    env: { PORT },
  });

  await delay(100);

  const resp = await fetch("http://localhost:" + PORT);
  await resp.body?.cancel();
  assert(resp);
  assertEquals(resp.status, Status.OK);
  await resp.body!.cancel();

  serverProcess.kill("SIGTERM");
  await serverProcess.status;

  // Drain the lines stream
  for await (const _ of lines) { /* noop */ }
});

Deno.test(
  "throw on route export 'handlers' instead of 'handler'",
  async () => {
    const result = await new Deno.Command(Deno.execPath(), {
      args: ["run", "-A", "./tests/fixture_invalid_handlers/main.ts"],
      stderr: "piped",
      stdout: "piped",
    }).output();

    assertEquals(result.code, 1);

    const text = new TextDecoder().decode(result.stderr);
    assertMatch(text, /Did you mean "handler"\?/);
  },
);

Deno.test("rendering custom _500.tsx page for default handlers", async (t) => {
  await withFakeServe("./tests/fixture_custom_500/main.ts", async (server) => {
    await t.step("SSR error is shown", async () => {
      const resp = await server.get("/");
      assertEquals(resp.status, Status.InternalServerError);
      const text = await resp.text();
      assertStringIncludes(text, "Custom 500: Pickle Rick!");
    });

    await t.step("error page is shown with error message", async () => {
      const doc = await server.getHtml("/");
      const text = doc.querySelector(".custom-500")?.textContent!;
      assertStringIncludes(text, "Custom 500: Pickle Rick!");
    });
  });
});

Deno.test("renders error boundary", async () => {
  await withPageName("./tests/fixture/main.ts", async (page, address) => {
    await page.goto(`${address}/error_boundary`);
    const text = await page.$eval("p", (el) => el.textContent);
    assertEquals(text, "it works");
  });
});

Deno.test("Resolves routes with non-latin characters", async () => {
  await withFakeServe("./tests/fixture/main.ts", async (server) => {
    // Check that we can navigate to the page
    const doc = await server.getHtml(`/umlaut-äöüß`);
    assertSelector(doc, "h1");
    assertTextMany(doc, "h1", ["it works"]);

    // Check the manifest
    const mod = (await import("./fixture/fresh.gen.ts")).default;

    assert(
      "./routes/umlaut-äöüß.tsx" in mod.routes,
      "Umlaut route not found",
    );
  });
});

Deno.test("Generate a single nonce value per page", async () => {
  await withFakeServe("./tests/fixture/main.ts", async (server) => {
    const doc = await server.getHtml("/");

    const nonceValues = Array.from(
      new Set(
        Array.from(doc.querySelectorAll("[nonce]")).map((el) =>
          el.getAttribute("nonce")
        ),
      ),
    );

    assertEquals(
      nonceValues.length,
      1,
      `Found more than 1 nonce value per render`,
    );
  });
});

Deno.test("Adds nonce to inline scripts", async () => {
  await withFakeServe("./tests/fixture/main.ts", async (server) => {
    const doc = await server.getHtml(`/nonce_inline`);

    const stateScript = doc.querySelector("#__FRSH_STATE")!;
    const nonce = stateScript.getAttribute("nonce")!;

    const el = doc.querySelector("#inline-script")!;
    const inlineNonce = el.getAttribute("nonce")!;

    assertEquals(inlineNonce, nonce);
  });
});

Deno.test({
  name: "support string based event handlers during SSR",
  async fn() {
    await withPageName("./tests/fixture/main.ts", async (page, address) => {
      await page.goto(`${address}/event_handler_string`);
      await page.waitForSelector("p");
      await page.click("button");

      await waitForText(page, "p", "it works");
    });
  },
});

Deno.test({
  name: "Log error in browser console on string event handlers",
  async fn() {
    await withPageName("./tests/fixture/main.ts", async (page, address) => {
      const logs: { type: string; message: string }[] = [];
      page.on("console", (ev) => {
        logs.push({ type: ev.type(), message: ev.text() });
      });

      page.on("pageerror", (ev) => {
        logs.push({ type: "error", message: ev.toString() });
      });

      await page.goto(`${address}/event_handler_string_island`);
      await page.waitForSelector("p");
      await page.click("button");
      await waitForText(page, "p", "it works");

      await retry(() => {
        for (const item of logs) {
          if (/property should be a function/.test(item.message)) {
            return true;
          }
        }
      });
    });
  },
});

Deno.test("De-duplicates <Head /> nodes by key", async () => {
  await withFakeServe("./tests/fixture/main.ts", async (server) => {
    const res = await server.get(`/head_deduplicate`);
    const html = await res.text();

    assertEquals(Array.from(html.matchAll(/<title>/g)).length, 1);
    assert(/<title>bar<\/title>/.test(html));

    assertEquals(
      Array.from(html.matchAll(/<meta property="og:title"/g)).length,
      1,
    );
    assert(/<meta property="og:title" content="Other title"\/>/.test(html));
  });
});
