import { AuthorizeError } from "slack-edge";
import { SlackApp, SlackAPIError, AssistantThreadContext } from "../../../src/index"; // "slack-edge"

type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR";
const logLevel = (process.env.SLACK_APP_LOG_LEVEL || "DEBUG") as LogLevel;

export const app = new SlackApp({
  socketMode: true,
  ignoreSelfAssistantMessageEvents: false,
  env: {
    SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN!,
    SLACK_APP_TOKEN: process.env.SLACK_APP_TOKEN!,
    SLACK_LOGGING_LEVEL: logLevel,
  },
  // authorizeErrorHandler testing
  // authorize: async () => { throw new AuthorizeError("test") },
  // authorizeErrorHandler: async () => new Response("", { status: 200}),
});

app.assistantThreadStarted(async ({ context: { threadContext, say, setSuggestedPrompts, channelId, threadTs } }) => {
  if (threadContext?.channel_id) {
    await say({
      text: "Hello, how can I help you today?",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "Hello, how can I help you today?",
          },
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              action_id: "assistant-summarize-channel",
              text: { type: "plain_text", text: "Summarize the channel" },
              value: JSON.stringify({ channelId, threadTs, threadContext }),
            },
            {
              type: "button",
              action_id: "assistant-generate-random-numbers",
              text: { type: "plain_text", text: "Generate random numbers" },
              value: JSON.stringify({ channelId, threadTs, threadContext }),
            },
          ],
        },
      ],
    });
  } else {
    await say({ text: "Hello, how can I help you today?" });
    await setSuggestedPrompts({
      title: "New chat",
      prompts: ["What does SLACK stand for?"],
    });
  }
});

app.assistantUserMessage(async ({ context: { setStatus, say, threadContextStore, channelId, threadTs } }) => {
  await setStatus({ status: "is typing..." });
  const threadContext = await threadContextStore.find({
    channel_id: channelId,
    thread_ts: threadTs,
  });
  if (threadContext?.channel_id) {
    await say({
      text: `OK, I will do more research on <#${threadContext.channel_id}> history, and will update you once it's done!`,
      metadata: {
        event_type: "assistant_summarize_channel",
        event_payload: { ...threadContext },
      },
    });
  } else {
    await say({
      text: "Sorry, I couldn't understand your comment. Could you say it in a different way?",
    });
  }
});

app.assistantBotMessage(async ({ payload, context: { client, setStatus, say } }) => {
  if (payload.metadata?.event_type === "assistant_summarize_channel") {
    await setStatus({ status: "is analyzing the channel content..." });
    const channel = payload.metadata.event_payload.channel_id as string;
    try {
      const messages = (await client.conversations.history({ channel, limit: 5 })).messages;
      await setStatus({ status: "is working on the summary..." });
      await new Promise((r) => setTimeout(r, 1000));
      // TODO: better work with LLM
      const summary = messages?.map((m) => m.text?.substring(0, 100) + "...").join(", ");
      if (messages) {
        await say({ text: `Here you are!: ${summary}` });
      } else {
        await say({ text: ":warning: Something went wrong!" });
      }
    } catch (e: unknown) {
      if ((e as SlackAPIError).error === "not_in_channel") {
        await say({
          text: `:warning: Invite this app's bot user to <#${channel}> first.`,
        });
      } else {
        await say({ text: `:warning: Something went wrong! ${e}` });
      }
    }
  } else if (payload.metadata?.event_type === "assistant_random_numbers") {
    await setStatus({ status: "is selecting numbers..." });
    await new Promise((r) => setTimeout(r, 1000));
    const numbers = "3,10,57,72,89";
    await say({ text: `Here you are!:\n${numbers}` });
  } else {
    // nothing to do; when you enhance here, be careful not to cause infinite loop
  }
});

app.action<"button">("assistant-summarize-channel", async ({ payload, context: { client } }) => {
  if ("message" in payload && payload.message.metadata) {
    const threadContext = payload.message.metadata.event_payload as unknown as AssistantThreadContext;
    await client.views.open({
      trigger_id: payload.trigger_id,
      view: {
        type: "modal",
        title: { type: "plain_text", text: "My Assistant" },
        close: { type: "plain_text", text: "Close" },
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `Got it! I will start analyzing <#${threadContext.channel_id}>! I will update you once it's done!`,
            },
          },
        ],
      },
    });
    await client.chat.postMessage({
      channel: payload.channel.id,
      thread_ts: payload.message.thread_ts,
      text: `OK, I will do more research on <#${threadContext.channel_id}> history, and will update you once it's done!`,
      metadata: {
        event_type: "assistant_summarize_channel", // triggers the next operation within botMessage handler
        event_payload: { ...threadContext },
      },
    });
  }
});
app.action<"button">("assistant-generate-random-numbers", async ({ payload, context: { client } }) => {
  if ("message" in payload && payload.message.metadata) {
    const threadContext = payload.message.metadata.event_payload as unknown as AssistantThreadContext;
    await client.chat.postMessage({
      channel: payload.channel.id,
      thread_ts: payload.message.thread_ts,
      text: "OK, I will generarte random numbers for you!",
      metadata: {
        event_type: "assistant_random_numbers", // triggers the next operation within botMessage handler
        event_payload: { ...threadContext },
      },
    });
  }
});

app.event("app_home_opened", async ({ payload, context: { client, actorUserId } }) => {
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
});

app.event("app_mention", async ({ context: { say, actorUserId } }) => {
  // do anything async here
  await say({
    text: `Hi <@${actorUserId}>!`,
    blocks: [
      {
        type: "section",
        text: { type: "mrkdwn", text: `Hi <@${actorUserId}>!` },
        accessory: {
          type: "button",
          action_id: "button-click",
          text: { type: "plain_text", text: "Click this" },
          value: "clicked",
        },
      },
    ],
  });
});

app.action<"button">("button-click", async ({}) => {});

app.message("attachment", async ({ context: { say, actorUserId } }) => {
  await say({
    text: "Hello!",
    attachments: [
      {
        blocks: [
          {
            type: "section",
            text: { type: "mrkdwn", text: `Hi <@${actorUserId}>!` },
            accessory: {
              type: "button",
              action_id: "attachment-button-click",
              text: { type: "plain_text", text: "Click this" },
              value: "clicked",
            },
          },
        ],
      },
    ],
  });
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
