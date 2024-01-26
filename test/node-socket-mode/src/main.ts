import { SocketModeClient } from "@slack/socket-mode";
import { LogLevel } from "@slack/logger";
import {
  SlackApp,
  fromSocketModeToRequest,
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
app.command("/hello", async ({}) => {
  return "Hi!";
});
app.anyMessage(async ({ context }) => {
  await context.say({ text: "Hi!" });
});

(async () => {
  const sm = new SocketModeClient({
    appToken: process.env.SLACK_APP_TOKEN!,
    logLevel: LogLevel.DEBUG,
  });
  sm.on(
    "slack_event",
    async ({ body, ack, retry_num: retryNum, retry_reason: retryReason }) => {
      const request = fromSocketModeToRequest({ body, retryNum, retryReason });
      if (!request) {
        return;
      }
      const response = await app.run(request);
      await ack(await fromResponseToSocketModePayload({ response }));
    },
  );
  await sm.start();
})();
