import { SlackApp } from "../src/app";

const app = new SlackApp({
  env: {
    SLACK_SIGNING_SECRET: process.env.SLACK_SIGNING_SECRET!,
    SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN,
    SLACK_LOGGING_LEVEL: "DEBUG",
  },
  // startLazyListenerAfterAck: true,
});

app.event("app_mention", async ({ context, payload }) => {
  console.log(payload);
  await context.say({ text: "Hey!" });
});

app.message("hey", async ({ context }) => {
  await context.say({ text: "Hey!" });
});
app.event("message", async () => {});

app.shortcut(
  "hello",
  async () => {},
  async ({ context, payload }) => {
    await context.client.views.open({
      trigger_id: payload.trigger_id,
      view: {
        type: "modal",
        callback_id: "foo",
        title: { type: "plain_text", text: "My App" },
        close: { type: "plain_text", text: "Cancel" },
        blocks: [
          {
            type: "section",
            text: {
              type: "plain_text",
              text: "This is a plain text section block.",
            },
          },
        ],
      },
    });
  },
);

// Enable startLazyListenerAfterAck: true for testing this
app.shortcut(
  "ack-then-lazy",
  async () => {
    console.log("ack() started...");
    const sleep = (seconds: number) => {
      return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
    };
    await sleep(2);
    console.log("ack() is done!");
  },
  async () => {
    console.log("lazy() is called!");
  },
);

// bun run --watch test/test-app-bun.ts
// brew install cloudflare/cloudflare/cloudflared
// cloudflared tunnel --url http://localhost:3000
export default {
  port: 3000,
  async fetch(request) {
    return await app.run(request);
  },
};
