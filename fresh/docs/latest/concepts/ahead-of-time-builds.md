---
description: |
  Fresh optimize assets ahead of time, which makes pages load way quicker.
---

Fresh enables you to pre-optimize frontend assets before the code is deployed.
During that process the code for Islands will be compressed and optimized, so
that Fresh can send as little code as possible to the browser. Depending on the
amount of code an island needs, this process can take several seconds if done on
the fly serverside.

Doing those optimizations ahead-of-time and deploying the already optimized
assets alongside with your code, allows Fresh to treat them as like any other
static file and can serve it immediately without any further processing. On
pages with islands, having to do no processing greatly speeds up page load
times.

## Creating an optimized build

To have Fresh optimize all the assets, run one of the following commands:

```sh
# As a task in newer Fresh projects
deno task build
# or invoke it manually
deno run -A dev.ts build
```

This will create a `_fresh` folder in the project directory. That folder
contains the optimized assets and a `snapshot.json` file which includes some
metadata for Fresh.

> ℹ️ The `_fresh` folder should not be committed to the repository. Add an entry
> in the `.gitignore` file to ensure that it is not committed. Create that file
> at the root of your git repository if not present.
>
> ```gitignore .gitignore
> # Ignore fresh build directory
> _fresh/
> ```

## Running Fresh with optimized assets

When Fresh is started in non-development mode (usually via `main.ts`), Fresh
will automatically pick up optimized assets when a `_fresh` folder exists. If
found, Fresh will print the following message to the terminal:

```sh Terminal output
Using snapshot found at /path/to/project/_fresh
```

## Deploying an optimized Fresh project

To generate optimized assets whenever you push changes to the `main` branch of
your project, copy the following GitHub action and add it under
`.github/workflows/deploy.yml` in your project.

```yml .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
  pull_request:
    branches: main

jobs:
  deploy:
    name: Deploy
    runs-on: ubuntu-latest

    permissions:
      id-token: write # Needed for auth with Deno Deploy
      contents: read # Needed to clone the repository

    steps:
      - name: Clone repository
        uses: actions/checkout@v3

      - name: Install Deno
        uses: denoland/setup-deno@v1
        with:
          deno-version: v1.x

      - name: Build step
        run: "deno task build" # 📝 Update the build command(s) if necessary

      - name: Upload to Deno Deploy
        uses: denoland/deployctl@v1
        with:
          project: "example-project" # 📝 Update the deploy project name if necessary
          entrypoint: "./main.ts" # 📝 Update the entrypoint if necessary
```

> ℹ️ **Important:** The project name here must match the project name you've
> picked in Deno Deploy.

On the Deno Deploy side change the GitHub integration mode to GitHub Actions.
You need to unlink first, if you have an existing project that's linked with the
"Automatic" mode.

![Deno Deploy UI screenshot that shows the project dropdown and highlights the GitHub Action option](/docs/deno-deploy-gh-action.jpg)

Once this is set up you're ready for your next deployment. Whenever a new PR is
merged into the `main` branch on GitHub the deploy action will be executed and
deploy the optimized assets to Deno Deploy.

## Migrating existing projects with Plugins

If you're using Fresh plugins, extract them into a `fresh.config.ts` file, so
that both the `dev.ts` and `main.ts` script have access to them.

```ts fresh.config.ts
import { defineConfig } from "$fresh/server.ts";
import twindPlugin from "$fresh/plugins/twind.ts";
import twindConfig from "./twind.config.ts";

export default defineConfig({
  plugins: [twindPlugin(twindConfig)],
});
```

```ts main.ts
import { start } from "$fresh/server.ts";
import manifest from "./fresh.gen.ts";
import config from "./fresh.config.ts";

await start(manifest, config);
```

```ts dev.ts
import dev from "$fresh/dev.ts";
import config from "./fresh.config.ts";

await dev(import.meta.url, "./main.ts", config);
```
