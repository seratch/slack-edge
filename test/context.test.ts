import { assert, test, describe } from "vitest";
import {
  extractFunctionBotAccessToken,
  extractFunctionExecutionId,
  extractTriggerId,
} from "../src/index";

const event = {
  token: "xxx",
  team_id: "T03E94MJU",
  api_app_id: "A066CAXU6M7",
  event: {
    type: "function_executed",
    function: {
      id: "Fn066NMABPPA",
      callback_id: "hello",
      title: "Hello",
      description: "Hello world!",
      type: "app",
      input_parameters: [
        {
          type: "slack#/types/user_id",
          name: "user_id",
          description: "Who to send it",
          title: "User",
          is_required: true,
          hint: "Select a user in the workspace",
        },
      ],
      output_parameters: [
        {
          type: "slack#/types/user_id",
          name: "user_id",
          description: "Who to send it",
          title: "User",
          is_required: true,
          hint: "Select a user in the workspace",
        },
      ],
      app_id: "A066CAXU6M7",
      date_created: 1700112606,
      date_updated: 1700112606,
      date_deleted: 0,
      form_enabled: false,
    },
    inputs: {
      user_id: "U03E94MK0",
    },
    function_execution_id: "Fx0666JDAMB4",
    workflow_execution_id: "Wx0666JD9V8S",
    event_ts: "1700200704.806249",
    bot_access_token: "xwfp-valid",
  },
  type: "event_callback",
  event_id: "Ev065S2PV3FZ",
  event_time: 1700200704,
};
const blockAction = {
  type: "block_actions",
  team: { id: "T03E94MJU", domain: "seratch" },
  user: { id: "U03E94MK0", name: "seratch", team_id: "T03E94MJU" },
  channel: { id: "D065ZJQQQAE", name: "directmessage" },
  message: {
    bot_id: "B065SV9Q70W",
    type: "message",
    text: "hey!",
    user: "U066C7XNE6M",
    ts: "1700455285.968429",
    app_id: "A065ZJM410S",
    blocks: [
      {
        type: "actions",
        block_id: "b",
        elements: [
          {
            type: "button",
            action_id: "a",
            text: { type: "plain_text", text: "Click this!", emoji: true },
            value: "clicked",
          },
        ],
      },
    ],
    team: "T03E94MJU",
  },
  container: {
    type: "message",
    message_ts: "1700455285.968429",
    channel_id: "D065ZJQQQAE",
    is_ephemeral: false,
  },
  actions: [
    {
      block_id: "b",
      action_id: "a",
      type: "button",
      text: { type: "plain_text", text: "Click this!", emoji: true },
      value: "clicked",
      action_ts: "1700455293.945608",
    },
  ],
  api_app_id: "A065ZJM410S",
  state: { values: {} },
  bot_access_token: "xwfp-valid",
  function_data: {
    execution_id: "Fx066J3N9ME0",
    function: { callback_id: "hello" },
    inputs: { amount: 1, message: "hey", user_id: "U03E94MK0" },
  },
  interactivity: {
    interactor: {
      secret: "secret",
      id: "U03E94MK0",
    },
    interactivity_pointer: "111.222.333",
  },
};

const viewSubmission = {
  type: "view_submission",
  team: { id: "T03E94MJU", domain: "seratch" },
  user: { id: "U03E94MK0", name: "seratch", team_id: "T03E94MJU" },
  view: {
    id: "V06696WA4AJ",
    team_id: "T03E94MJU",
    app_id: "A065ZJM410S",
    app_installed_team_id: "T03E94MJU",
    bot_id: "B065SV9Q70W",
    title: { type: "plain_text", text: "Remote Function test", emoji: false },
    type: "modal",
    blocks: [
      {
        type: "input",
        block_id: "text-block",
        label: { type: "plain_text", text: "Text", emoji: true },
        optional: false,
        dispatch_action: false,
        element: {
          type: "plain_text_input",
          action_id: "text-action",
          multiline: true,
          dispatch_action_config: { trigger_actions_on: ["on_enter_pressed"] },
        },
      },
    ],
    close: { type: "plain_text", text: "Close", emoji: false },
    submit: { type: "plain_text", text: "Submit", emoji: false },
    state: {
      values: {
        "text-block": {
          "text-action": { type: "plain_text_input", value: "test" },
        },
      },
    },
    hash: "1700459685.0WtNlzdn",
    private_metadata: "",
    callback_id: "remote-function-view",
    root_view_id: "V06696WA4AJ",
    clear_on_close: false,
    notify_on_close: true,
    external_id: "",
  },
  api_app_id: "A065ZJM410S",
  bot_access_token: "xwfp-valid",
  function_data: {
    execution_id: "Fx066UEY3X1P",
    function: { callback_id: "hello" },
    inputs: { amount: 1, message: "hey", user_id: "U03E94MK0" },
  },
  interactivity: {
    interactor: {
      secret: "secret",
      id: "U03E94MK0",
    },
    interactivity_pointer: "111.222.333",
  },
};

const viewClosed = {
  type: "view_closed",
  team: { id: "T03E94MJU", domain: "seratch" },
  user: { id: "U03E94MK0", name: "seratch", team_id: "T03E94MJU" },
  view: {
    id: "V0661A0RMRV",
    team_id: "T03E94MJU",
    app_id: "A065ZJM410S",
    app_installed_team_id: "T03E94MJU",
    bot_id: "B065SV9Q70W",
    title: { type: "plain_text", text: "Remote Function test", emoji: false },
    type: "modal",
    blocks: [
      {
        type: "input",
        block_id: "text-block",
        label: { type: "plain_text", text: "Text", emoji: true },
        optional: false,
        dispatch_action: false,
        element: {
          type: "plain_text_input",
          action_id: "text-action",
          multiline: true,
          dispatch_action_config: { trigger_actions_on: ["on_enter_pressed"] },
        },
      },
    ],
    close: { type: "plain_text", text: "Close", emoji: false },
    submit: { type: "plain_text", text: "Submit", emoji: false },
    state: { values: {} },
    hash: "1700459664.VVRFycXs",
    private_metadata: "",
    callback_id: "remote-function-view",
    root_view_id: "V0661A0RMRV",
    clear_on_close: false,
    notify_on_close: true,
    external_id: "",
  },
  api_app_id: "A065ZJM410S",
  is_cleared: false,
  bot_access_token: "xwfp-valid",
  function_data: {
    execution_id: "Fx066CTQP0CV",
    function: { callback_id: "hello" },
    inputs: { amount: 1, message: "hey", user_id: "U03E94MK0" },
  },
};

describe("Context", () => {
  test("functionExecutionId", () => {
    assert.equal(extractFunctionExecutionId(event), "Fx0666JDAMB4");
    assert.equal(extractFunctionExecutionId(blockAction), "Fx066J3N9ME0");
    assert.equal(extractFunctionExecutionId(viewSubmission), "Fx066UEY3X1P");
    assert.equal(extractFunctionExecutionId(viewClosed), "Fx066CTQP0CV");
  });

  test("functionBotAccessToken", () => {
    assert.equal(extractFunctionBotAccessToken(event), "xwfp-valid");
    assert.equal(extractFunctionBotAccessToken(blockAction), "xwfp-valid");
    assert.equal(extractFunctionBotAccessToken(viewSubmission), "xwfp-valid");
    assert.equal(extractFunctionBotAccessToken(viewClosed), "xwfp-valid");
  });

  test("triggerId", () => {
    assert.equal(extractTriggerId(event), undefined);
    assert.equal(extractTriggerId(blockAction), "111.222.333");
    assert.equal(extractTriggerId(viewSubmission), "111.222.333");
    assert.equal(extractTriggerId(viewClosed), undefined);
  });
});
