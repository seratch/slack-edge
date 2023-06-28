import { SlackApp } from "../src_deno/mod.ts";

const app = new SlackApp({
  env: {
    SLACK_BOT_TOKEN: Deno.env.get("SLACK_BOT_TOKEN"),
    SLACK_APP_TOKEN: Deno.env.get("SLACK_APP_TOKEN"),
    SLACK_LOGGING_LEVEL: "DEBUG",
  },
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
  }
);

app.command("/hello", async () => "Hello!");

// deno run --watch --allow-net --allow-env test/test-socket-mode-app-deno.ts
await app.connect();
setTimeout(() => {}, Number.MAX_SAFE_INTEGER);
