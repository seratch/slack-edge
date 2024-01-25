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
  const socketMode = new SocketModeClient({
    appToken: process.env.SLACK_APP_TOKEN!,
    logLevel: LogLevel.DEBUG,
  });
  socketMode.on(
    "slack_event",
    async ({ body, ack, retry_num, retry_reason }) => {
      const request = fromSocketModeToRequest({
        body,
        retryNum: retry_num,
        retryReason: retry_reason,
      });
      if (!request) {
        return;
      }
      const response = await app.run(request);
      await ack(await fromResponseToSocketModePayload({ response }));
    },
  );
  await socketMode.start();
})();
