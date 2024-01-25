## Slack Edge

[![npm version](https://badge.fury.io/js/slack-edge.svg)](https://badge.fury.io/js/slack-edge) 
[![deno module](https://shield.deno.dev/x/slack_edge)](https://deno.land/x/slack_edge)

The **slack-edge** library is a Slack app development framework designed specifically for the following runtimes:

* [Cloudflare Workers](https://workers.cloudflare.com/)
* [Vercel Edge Functions](https://vercel.com/docs/concepts/functions/edge-functions/quickstart)

This framework draws significant inspiration from Slack's [Bolt framework](https://api.slack.com/tools/bolt), but its design does not strictly follow the [bolt-js](https://github.com/slackapi/bolt-js) blueprint.

Key differences include:

* **Edge function ready**: Out-of-the-box edge function (e.g., Cloudflare Workers) support
* **TypeScript focused**: Enhances type safety and clarifies typings for developers
* **Lazy listener enabled**: [bolt-python's lazy listener feature](https://slack.dev/bolt-python/concepts#lazy-listeners) is provided out of the box
* **Zero additional dependencies**: No other dependencies required beyond TypeScript types and [slack-web-api-client](https://github.com/seratch/slack-web-api-client) (our fetch-function-based Slack API client)

## Getting Started

Currently, you can use this library for two different platforms.

### Cloudflare Workers

[Cloudflare Workers](https://workers.cloudflare.com/) is an edge function platform for quickly deploying an app.

The only additional thing you need to do is to add [the **slack-cloudflare-workers** package](https://github.com/seratch/slack-cloudflare-workers) to your Cloudflare Workers app project. The **slack-cloudflare-workers** package enhances **slack-edge** with Cloudflare Workers-specific features, such as KV-based installation stores.

```bash
npm install -g wrangler@latest
npx wrangler generate my-slack-app
cd my-slack-app
npm i slack-cloudflare-workers@latest
```

A simple app that handles a slash command can be structured like this:

```typescript
import { SlackApp, SlackEdgeAppEnv } from "slack-cloudflare-workers";

export default {
  async fetch(
    request: Request,
    env: SlackEdgeAppEnv,
    ctx: ExecutionContext
  ): Promise<Response> {
    const app = new SlackApp({ env })
      .command("/hello-cf-workers",
        async (req) => {
          // sync handler, which is resposible to ack the request
          return ":wave: This app runs on Cloudflare Workers!";
          // If you don't have anything to do here, the function doesn't need to return anything
          // This means in that case, simply having `async () => {}` works for you
        },
        async ({ context: { respond } }) => {
          // Lazy listener, which can be executed asynchronously
          // You can do whatever may take longer than 3 seconds here
          await respond({ text: "This is an async reply. How are you doing?" });
        }
      );
    return await app.run(request, ctx);
  },
};
```

Also, before running this app, don't forget to create a `.dev.vars` file with your env variables for local development:

```
SLACK_SIGNING_SECRET=....
SLACK_BOT_TOKEN=xoxb-...
SLACK_LOGGING_LEVEL=DEBUG
```

When you run `wrangler dev --port 3000`, your app process spins up, and it starts handling API requests at `http://localhost:3000/slack/events`. You may want to run Cloudflare Tunnel or something equivalent to forward public endpoint requests to this local app process.

Refer to https://github.com/seratch/slack-cloudflare-workers/blob/main/docs/index.md for further guidance.

### Vercel Edge Functions

[Vercel Edge Functions](https://vercel.com/docs/functions/edge-functions) is an edge function platform, which is part of [Vercel](https://vercel.com/)'s Frontend Cloud.

Create a new Next.js project w/ slack-edge library by following these steps:

```bash
npx create-next-app@latest --typescript
cd your-app-name
npm i slack-edge
```

Create a new source file `pages/api/slack.ts` that contains the following code:

```typescript
import type { NextFetchEvent, NextRequest } from "next/server";
import { SlackApp } from "slack-edge";

export const config = {
  runtime: "edge",
};

const app = new SlackApp({
  env: {
    SLACK_SIGNING_SECRET: process.env.SLACK_SIGNING_SECRET!,
    SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN!,
    SLACK_LOGGING_LEVEL: "DEBUG",
  },
});

app.command("/hello-edge",
  async (req) => {
    // sync handler, which is resposible to ack the request
    return ":wave: This app runs on Vercel Edge Function platform!";
    // If you don't have anything to do here, the function doesn't need to return anything
    // This means in that case, simply having `async () => {}` works for you
  },
  async ({ context: { respond } }) => {
    // Lazy listener, which can be executed asynchronously
    // You can do whatever may take longer than 3 seconds here
    await respond({ text: "This is an async reply. How are you doing?" });
  }
);

export default async function handler(
  req: NextRequest,
  context: NextFetchEvent
) {
  return await app.run(req, context);
}
```

With this code, your **Request URL** for handling requests from Slack API server will be `https://{your public domain}/api/slack` instead of `/slack/events`.

Lastly, you can run the app by following these steps:

```bash
export SLACK_SIGNING_SECRET="your value here"
export SLACK_BOT_TOKEN="your value here"
npm run dev
```

If you use Cloudflare Tunnel or something equivalent, you may want to run `cloudflared tunnel --url http://localhost:3000` in a different terminal window.

We are currently working on the **slack-vercel-edge-functions** package, which offers Vercel-specific features in addition to the core ones provided by **slack-edge**. Until its release, please use slack-edge directly and implement the missing features on your own as necessary.

### Run Your App with Deno / Bun

This library is available not only for edge function use cases but also for novel JavaScript runtime use cases. Specifically, you can run an app with [Deno](https://deno.com/) and [Bun](https://bun.sh/), both of which are up-and-coming JS runtimes. To learn more about this, please check the example files under the `./test` directory.

#### Run with Bun

```typescript
import { SlackApp } from "slack-edge";

const app = new SlackApp({
  env: {
    SLACK_SIGNING_SECRET: process.env.SLACK_SIGNING_SECRET!,
    SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN,
    SLACK_LOGGING_LEVEL: "DEBUG",
  },
});

// Add listeners here

export default {
  port: 3000,
  async fetch(request) {
    return await app.run(request);
  },
};
```

You can run the app by:

```bash
# Terminal A
bun run --watch my-app.ts
# Terminal B
brew install cloudflare/cloudflare/cloudflared
cloudflared tunnel --url http://localhost:3000
```

#### Run with Deno

```typescript
import { SlackApp } from "https://deno.land/x/slack_edge@0.9.2/mod.ts";

const app = new SlackApp({
  env: {
    SLACK_SIGNING_SECRET: Deno.env.get("SLACK_SIGNING_SECRET"),
    SLACK_BOT_TOKEN: Deno.env.get("SLACK_BOT_TOKEN"),
    SLACK_LOGGING_LEVEL: "DEBUG",
  },
});

// Add listeners here

import { serve } from "https://deno.land/std@0.211.0/http/server.ts";
await serve(
  async (request) => {
    return await app.run(request);
  },
  { port: 3000 }
);
```

You can run the app by:

```bash
# Terminal A
deno run --watch --allow-net --allow-env my-app.ts
# Terminal B
brew install cloudflare/cloudflare/cloudflared
cloudflared tunnel --url http://localhost:3000
```

#### Run with Deno (Socket Mode)

**Important Notice:** The Socket Mode support provided by slack-edge is still experimental and is not designed to handle reconnections for production-grade applications. It is recommended to use this mode only for local development and testing purposes.

Thanks to Deno's stable WebSocket implementation, you can quickly and easily run a Socket Mode app too!

```typescript
import { SlackApp } from "https://deno.land/x/slack_edge@0.9.2/mod.ts";

const app = new SlackApp({
  env: {
    SLACK_BOT_TOKEN: Deno.env.get("SLACK_BOT_TOKEN"),
    SLACK_APP_TOKEN: Deno.env.get("SLACK_APP_TOKEN"),
    SLACK_LOGGING_LEVEL: "DEBUG",
  },
});

// Add listeners here

await app.connect();
setTimeout(() => {}, Number.MAX_SAFE_INTEGER);
```

You can run this app by `deno run --watch --allow-net --allow-env my-app.ts`.


#### Run with Node.js (Stable Socket Mode)

If you need a stable Socket Mode integration, we recommend using `@slack/socket-mode` along with this package. With Node 20+, the following example works for you:

```typescript
// npm i slack-edge @slack/socket-mode
import {
  SlackApp,
  fromSocketModeToRequest,
  buildSimpleExecutionContext,
  fromResponseToSocketModePayload,
} from "slack-edge";

const app = new SlackApp({
  socketMode: true,
  env: {
    SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN!,
    SLACK_APP_TOKEN: process.env.SLACK_APP_TOKEN!,
    SLACK_LOGGING_LEVEL: "DEBUG",
  },
});

// Add listeners here
app.command("/hello", async ({}) => {
  return "Hi!";
});

import { SocketModeClient } from "@slack/socket-mode";
import { LogLevel } from "@slack/logger";

// Start a Socket Mode client
(async () => {
  const socketMode = new SocketModeClient({
    appToken: process.env.SLACK_APP_TOKEN!,
    logLevel: LogLevel.DEBUG,
  });
  socketMode.on("slack_event", async ({ body, ack, retry_num, retry_reason }) => {
      const response = await app.run(
        fromSocketModeToRequest({
          body,
          retryNum: retry_num,
          retryReason: retry_reason,
        }),
      );
      await ack(await fromResponseToSocketModePayload({ response }));
  });
  await socketMode.start();
})();
```

### Reference

#### Middleware

This framework offers ways to globally customize your app's behavior, like you do when developing web apps. A common example is to attach extra data to the `context` object for following listeners.

|Pattern|Description|
|-|-|
|app.beforeAuthorize|The passed function does something before calling `authorize()` function. If this method returns `SlackResponse`, the following middleware and listeners won't be executed.|
|app.afterAuthorize / app.use / app.middleware|The passed function does something right after calling `authorize()` function. If this method returns `SlackResponse`, the following middleware and listeners won't be executed.|

#### `ack` / `lazy` Functions

You may be unfamiliar with the "lazy listener" concept in this framework. To learn more about it, please read bolt-python's documentation: https://slack.dev/bolt-python/concepts#lazy-listeners

The `ack` function must complete within 3 seconds, while the `lazy` function can perform time-consuming tasks. It's important to note that not all request handlers support the ack or lazy functions. For more information, please refer to the following table, which covers all the patterns in detail.

Starting from v0.9, if desired, you can execute lazy listeners after the completion of their ack function. To customize the behavior in this manner, you can pass `startLazyListenerAfterAck: true` as one of the arguments in the `App` constructor.

|Pattern|Description|`ack` function|`lazy` function|
|-|-|-|-|
|app.command|The passed function handles a slash command request pattern. If the function returns a message, the message will be posted in the channel where the end-user invoked the command.|◯|◯|
|app.event|The passed function asynchronously does something when an Events API request that matches the constraints comes in. Please note that manually acknowledge a request is unsupported. You can pass only one function, which can be executed as a lazy listener.|x|◯|
|app.function [**experimental**]|The passed function asynchronously does something when a "function_executed" event request that matches the constraints comes in. Please note that manually acknowledge a request is unsupported. You can pass only one function, which can be executed as a lazy listener. Also, this feature is still in beta so that the details could be changed on the Slack plaform side until it's GAed.|x|◯|
|app.message / app.anyMessage|The passed function asynchronously does something when an a message event comes in. Please note that manually acknowledge a request is unsupported. You can pass only one function, which can be executed as a lazy listener. If the message pattern argument can be any of string, regexp, and undefined. When you pass undefined, the listener matches all messages.|x|◯|
|app.shortcut / app.globalShortcut / app.messageShortcut|The passed function handles a global/message shortcut request pattern. Please note that returning a message text in the `ack` function does not work for shortcuts. Instead, you can use `context.respond` for it.|◯|◯|
|app.action|The passed function handles a user interaction on a Block Kit component such as button clicks, item selection in a select menu, and so on.|◯|◯|
|app.options|The passed function handles an external data source reqeust for Block Kit select menus. You cannnot respond to this request pattern asynchronously, so slack-edge enables developers to pass only `ack` function, which must complete within 3 seconds, here.|◯|x|
|app.view / app.viewSubmission / app.viewClosed|The passed function handles either a modal data submission or the "Close" button click event. `ack` function can return various `response_action`s (errors, update, push, clear) and their associated data. If you want to simply close the modal, you don't need to return anything.|◯|◯|
