## Slack Edge

[![npm version](https://badge.fury.io/js/slack-edge.svg)](https://badge.fury.io/js/slack-edge) 

The **slack-edge** library is a Slack app development framework designed specifically for the following runtimes:

* [Cloudflare Workers](https://workers.cloudflare.com/)
* [Vercel Edge Functions](https://vercel.com/docs/concepts/functions/edge-functions/quickstart)

This framework draws significant inspiration from Slack's [Bolt framework](https://api.slack.com/tools/bolt), but its design does not strictly follow the [bolt-js](https://github.com/slackapi/bolt-js) blueprint.

Key differences include:

* _TypeScript focused_: Enhances type safety and clarifies typings for developers
* _Lazy listener enabled_: [bolt-python's lazy listener feature](https://slack.dev/bolt-python/concepts#lazy-listeners) is provided out of the box
* _Zero additional dependencies_: No other dependencies required beyond TypeScript types and [slack-web-api-client](https://github.com/seratch/slack-web-api-client) (our fetch-function-based Slack API client)

## Getting Started

You can use **slack-edge** for two different platforms.

### Cloudflare Workers

The only additional thing you need to do is to add [the **slack-cloudflare-workers** package](https://github.com/seratch/slack-cloudflare-workers) to your Cloudflare Workers app project. The **slack-cloudflare-workers** package enhances **slack-edge** with Cloudflare Workers-specific features, such as KV-based installation stores.

```bash
npm install -g wrangler
npx wrangler generate my-slack-app
cd my-slack-app
npm i slack-cloudflare-workers
```

A simple app that handles a slash command can be structured like this:

```typescript
import { SlackApp, SlackAppEnv } from "slack-cloudflare-workers";

export default {
  async fetch(
    request: Request,
    env: SlackAppEnv,
    ctx: ExecutionContext
  ): Promise<Response> {
    const app = new SlackApp({ env })
      .command("/hello-cf-workers",
        async (req) => {
          // sync handler, which is resposible to ack the request
          return ":wave: This app runs on Cloudflare Workers!";
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

When you run `wrangler dev --port 3000`, your app process spins up, and it starts handling API requests at `http://localhost:3000/slack/events`. You may want to run ngrok or something equivalent to forward public endpoint requests to this local app process.

Refer to https://github.com/seratch/slack-cloudflare-workers/blob/main/docs/index.md for further guidance.

### Vercel Edge Functions

Create a new project by following these steps:

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

If you use ngrok or something equivalent, you may want to run `ngrok http 3000 --subdomain your-domain` in a different terminal window.

We are currently working on the **slack-vercel-edge-functions** package, which offers Vercel-specific features in addition to the core ones provided by **slack-edge**. Until its release, please use slack-edge directly and implement the missing features on your own as necessary.
