import { SlackApp } from "../src_deno/mod.ts";

const app = new SlackApp({
  env: {
    SLACK_BOT_TOKEN: Deno.env.get("SLACK_BOT_TOKEN"),
    SLACK_APP_TOKEN: Deno.env.get("SLACK_APP_TOKEN"),
    SLACK_LOGGING_LEVEL: "DEBUG",
  },
});

// -----------------------
// Events API

app.event("app_mention", async ({ context, payload }) => {
  console.log(payload);
  await context.say({ text: "Hey!" });
});

app.message("hey", async ({ context }) => {
  await context.say({ text: "Hey!" });
});
app.event("message", async () => {});

// -----------------------
// Shortcuts

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
  },
);

// -----------------------
// Slash commands

app.command("/hello", async () => "Hello!");

// -----------------------
// Remote functions

app.function("hello", async ({ context, payload }) => {
  const user_id = payload.inputs.user_id;
  await context.client.chat.postMessage({
    text: "Hey!",
    channel: user_id,
    blocks: [
      {
        type: "section",
        text: { type: "mrkdwn", text: "Hey! Please click this:" },
        accessory: {
          type: "button",
          text: { type: "plain_text", text: "Let's go!" },
          value: "1",
          action_id: "remote-function-button",
        },
      },
    ],
  });
});
app.action(
  "remote-function-button",
  async () => {},
  async ({ context, payload }) => {
    const { client } = context;
    await client.views.open({
      trigger_id: context.triggerId,
      view: {
        type: "modal",
        callback_id: "remote-function-modal",
        title: { type: "plain_text", text: "Remote Function" },
        submit: { type: "plain_text", text: "Submit" },
        blocks: [
          {
            type: "input",
            element: {
              type: "plain_text_input",
              action_id: "plain_text_input-action",
            },
            label: { type: "plain_text", text: "Text" },
          },
        ],
      },
    });
    await client.chat.update({
      channel: payload.container.channel_id,
      ts: payload.container.message_ts,
      text: "Thank you!",
    });
  },
);
app.view(
  "remote-function-modal",
  async () => {
    // Returning nothing does not work for remote functions
    return { response_action: "clear" };
  },
  async ({ context, payload }) => {
    const user_id = payload.function_data!.inputs.user_id;
    const { client } = context;
    await client.functions.completeSuccess({
      function_execution_id: context.functionExecutionId,
      outputs: { user_id },
    });
  },
);

// -----------------------
// Start this app

// export SLACK_APP_TOKEN=
// export SLACK_BOT_TOKEN=
// deno run --watch --allow-net --allow-env test/test-socket-mode-app-deno.ts
await app.connect();
setTimeout(() => {}, Number.MAX_SAFE_INTEGER);
