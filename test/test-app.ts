import { SlackApp } from "../src/app";
import { SocketModeClient } from "../src/socket-mode/socket-mode-client";

const app = new SlackApp({
  env: {
    SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN,
    SLACK_APP_TOKEN: process.env.SLACK_APP_TOKEN!,
    SLACK_LOGGING_LEVEL: "DEBUG",
  },
  socketMode: true,
});
app.message("hey", async ({ context }) => {
  await context.say({ text: "Hey!" });
});

const client = new SocketModeClient(app);
await client.connect();

const server = Bun.serve({
  port: 3000,
  fetch(req) {
    return new Response(`Bun!`);
  },
});
