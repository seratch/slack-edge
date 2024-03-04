import { SlackApp } from "../../../src/index"; // "slack-edge"

type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR";
const logLevel = (process.env.SLACK_APP_LOG_LEVEL || "DEBUG") as LogLevel;

export const app = new SlackApp({
  socketMode: true,
  env: {
    SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN!,
    SLACK_APP_TOKEN: process.env.SLACK_APP_TOKEN!,
    SLACK_LOGGING_LEVEL: logLevel,
  },
});

app.event(
  "app_home_opened",
  async ({ payload, context: { client, actorUserId } }) => {
    // do anything async here
    if (payload.tab === "home") {
      await client.views.publish({
        user_id: actorUserId!,
        view: {
          type: "home",
          blocks: [
            {
              type: "section",
              text: { type: "mrkdwn", text: `Hi <@${actorUserId}>!` },
            },
          ],
        },
      });
    }
  },
);

app.event("app_mention", async ({ context: { say, actorUserId } }) => {
  // do anything async here
  await say({ text: `Hi <@${actorUserId}>!` });
});

app.message("hello", async ({ context: { say } }) => {
  await say({ text: "Hello!" });
});
app.anyMessage(async () => {});

app.event("reaction_added", async ({ context: { say }, payload }) => {
  await say({ text: "Hello!", thread_ts: payload.item.ts });
});

app.command("/run-test-app", async ({ context: { respond } }) => {
  await respond({
    text: "Hey, this is an ephemeral message sent using response_url :wave:",
  });

  return "Hey, what's up?";
  // If you want to send a message visible to everyone, you can pass response_type
  // return { text: "Hey, what's up?", response_type: "in_channel" };
});

app.shortcut(
  "global_example",
  async ({}) => {}, // ack the request within 3 seconds
  async ({ context: { client, triggerId, actorUserId } }) => {
    // do anything async here
    await client.views.open({
      trigger_id: triggerId!,
      view: {
        type: "modal",
        callback_id: "test-modal",
        title: { type: "plain_text", text: "TestApp" },
        submit: { type: "plain_text", text: "Submit" },
        close: { type: "plain_text", text: "Close" },
        notify_on_close: true,
        blocks: [
          {
            type: "section",
            text: { type: "mrkdwn", text: `Hi <@${actorUserId}>!` },
          },
        ],
      },
    });
  },
);

app.shortcut(
  "message_example",
  async ({}) => {
    return;
  }, // ack the request within 3 seconds
  async ({ context: { client, triggerId, actorUserId } }) => {
    // do anything async here
    await client.views.open({
      trigger_id: triggerId!,
      view: {
        type: "modal",
        callback_id: "test-modal",
        title: { type: "plain_text", text: "TestApp" },
        submit: { type: "plain_text", text: "Submit" },
        close: { type: "plain_text", text: "Close" },
        notify_on_close: true,
        blocks: [
          {
            type: "section",
            text: { type: "mrkdwn", text: `Hi <@${actorUserId}>!` },
          },
        ],
      },
    });
  },
);

app.view("test-modal", async ({}) => {
  return {
    response_action: "update",
    view: {
      type: "modal",
      callback_id: "test-modal",
      title: { type: "plain_text", text: "TestApp" },
      close: { type: "plain_text", text: "Close" },
      blocks: [
        {
          type: "section",
          text: { type: "mrkdwn", text: "Thank you!" },
        },
      ],
    },
  };
});
