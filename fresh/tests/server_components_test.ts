import { assertEquals } from "./deps.ts";
import {
  assertSelector,
  assertTextMany,
  withFakeServe,
  withFresh,
  withPageName,
} from "./test_utils.ts";
import { Status } from "../server.ts";

Deno.test({
  name: "render async server component",

  async fn() {
    await withFakeServe(
      "./tests/fixture_server_components/main.ts",
      async (server) => {
        const doc = await server.getHtml(`/basic`);
        assertTextMany(doc, "h1", ["it works"]);
      },
    );
  },
});

Deno.test({
  name: "uses returned response",

  async fn() {
    await withFakeServe(
      "./tests/fixture_server_components/main.ts",
      async (server) => {
        const res = await server.get(`/response`);
        const text = await res.text();
        assertEquals(text, "it works");
      },
    );
  },
});

Deno.test({
  name: "revives islands in async server component",

  async fn() {
    await withPageName(
      "./tests/fixture_server_components/main.ts",
      async (page, address) => {
        await page.goto(`${address}/island`);

        await page.waitForSelector("button");
        let text = await page.$eval("button", (el) => el.textContent);
        assertEquals(text, "update 0");

        await page.click("button");
        text = await page.$eval("button", (el) => el.textContent);
        assertEquals(text, "update 1");
      },
    );
  },
});

Deno.test({
  name: "passes context to server component",

  async fn() {
    await withFresh(
      "./tests/fixture_server_components/main.ts",
      async (address) => {
        const res = await fetch(`${address}/context/foo`);
        const json = await res.json();

        assertEquals(typeof json.localAddr, "object");
        assertEquals(typeof json.remoteAddr, "object");
        json.localAddr.port = 8000;
        json.remoteAddr.port = 8000;

        assertEquals(
          json,
          {
            localAddr: {
              hostname: "localhost",
              port: 8000,
              transport: "tcp",
            },
            remoteAddr: {
              hostname: "localhost",
              port: 8000,
              transport: "tcp",
            },
            renderNotFound: "AsyncFunction",
            url: `${address}/context/foo`,
            route: "/context/:id",
            params: {
              id: "foo",
            },
            state: {},
          },
        );
      },
    );
  },
});

Deno.test({
  name: "can call context.renderNotFound()",

  async fn() {
    await withFakeServe(
      "./tests/fixture_server_components/main.ts",
      async (server) => {
        const res = await server.get(`/fail`);

        assertEquals(res.status, Status.NotFound);
        const html = await res.text();
        assertEquals(html, "Not found.");
      },
    );
  },
});

Deno.test({
  name: "works with async plugins",

  async fn() {
    await withPageName(
      "./tests/fixture_server_components/main.ts",
      async (page, address) => {
        await page.goto(`${address}/twind`);
        await page.waitForSelector("h1");

        const text = await page.$eval("h1", (el) => el.textContent);
        assertEquals(text, "it works");

        // Check that CSS was applied accordingly
        const color = await page.$eval("h1", (el) => {
          return window.getComputedStyle(el).color;
        });
        assertEquals(color, "rgb(220, 38, 38)");
      },
    );
  },
});

Deno.test({
  name: "renders async app template",

  async fn() {
    await withFakeServe(
      "./tests/fixture_async_app/main.ts",
      async (server) => {
        const doc = await server.getHtml(``);
        assertSelector(doc, "html > body > .app > .layout > .page");
      },
    );
  },
});

Deno.test("define helpers", async () => {
  await withFakeServe(
    "./tests/fixture_define_helpers/main.ts",
    async (server) => {
      const doc = await server.getHtml(``);
      assertSelector(doc, "html > body > .app > .layout > .page");
      assertTextMany(doc, "p", ["Layout: it works", "Page: it works"]);
    },
  );
});
