import {
  AnyMessageBlock,
  AnyOption,
  Confirm,
  MessageAttachment,
  MessageMetadata,
  PlainTextField,
} from "https://deno.land/x/slack_web_api_client@0.10.5/mod.ts";
import { DataSubmissionView, ViewStateValue } from "./view-objects.ts";
import { BotProfile } from "./event.ts";

/**
 * block_actions payload data
 */
export interface BlockAction<A extends BlockElementAction> {
  type: "block_actions";
  actions: A[];
  team: {
    id: string;
    domain: string;
    enterprise_id?: string;
    enterprise_name?: string;
  } | null;
  user: {
    id: string;
    name: string;
    team_id?: string;
  };
  channel?: {
    id: string;
    name: string;
  };
  message?: {
    type: "message";
    user?: string;
    ts: string;
    thread_ts?: string;
    text?: string;
    metadata?: MessageMetadata;
    blocks?: AnyMessageBlock[];
    attachments?: MessageAttachment[];
    bot_id?: string;
    bot_profile?: BotProfile;
    edited?: {
      user: string;
      ts: string;
    };
    // deno-lint-ignore no-explicit-any
    [key: string]: any;
  };
  view?: DataSubmissionView;
  state?: {
    values: {
      [blockId: string]: {
        [actionId: string]: ViewStateValue;
      };
    };
  };
  token: string;
  response_url: string;
  trigger_id: string;
  api_app_id: string;
  container: {
    type: string;
    message_ts?: string;
    attachment_id?: number;
    channel_id?: string;
    view_id?: string;
    text?: string;
    is_ephemeral?: boolean;
    is_app_unfurl?: boolean;
    app_unfurl_url?: string;
    thread_ts?: string;
  };
  app_unfurl?: {
    id: string;
    fallback: string;
    bot_id: string;
    app_unfurl_url: string;
    is_app_unfurl: boolean;
    app_id: string;
  };
  is_enterprise_install?: boolean;
  enterprise?: {
    id: string;
    name: string;
  };
  // remote functions
  bot_access_token?: string;
  function_data?: {
    execution_id: string;
    function: { callback_id: string };
    inputs: {
      // deno-lint-ignore no-explicit-any
      [key: string]: any;
    };
  };
  interactivity?: {
    interactivity_pointer: string;
    interactor: { id: string; secret: string };
  };
}

export interface BlockElementAction<T extends string = string> {
  type: T;
  block_id: string;
  action_id: string;
  action_ts: string;
}

export interface ButtonAction extends BlockElementAction<"button"> {
  value: string;
  text: PlainTextField;
  url?: string;
  confirm?: Confirm;
  accessibility_label?: string;
}

export interface StaticSelectAction
  extends BlockElementAction<"static_select"> {
  selected_option: {
    text: PlainTextField;
    value: string;
  };
  initial_option?: AnyOption;
  placeholder?: PlainTextField;
  confirm?: Confirm;
}

export interface MultiStaticSelectAction
  extends BlockElementAction<"multi_static_select"> {
  selected_options: {
    text: PlainTextField;
    value: string;
  }[];
  initial_options?: AnyOption[];
  placeholder?: PlainTextField;
  confirm?: Confirm;
}

export interface UsersSelectAction extends BlockElementAction<"users_select"> {
  selected_user: string;
  initial_user?: string;
  placeholder?: PlainTextField;
  confirm?: Confirm;
}

export interface MultiUsersSelectAction
  extends BlockElementAction<"multi_users_select"> {
  selected_users: string[];
  initial_users?: string[];
  placeholder?: PlainTextField;
  confirm?: Confirm;
}

export interface ConversationsSelectAction
  extends BlockElementAction<"conversations_select"> {
  selected_conversation: string;
  initial_conversation?: string;
  placeholder?: PlainTextField;
  confirm?: Confirm;
}

export interface MultiConversationsSelectAction
  extends BlockElementAction<"multi_conversations_select"> {
  selected_conversations: string[];
  initial_conversations?: string[];
  placeholder?: PlainTextField;
  confirm?: Confirm;
}

export interface ChannelsSelectAction
  extends BlockElementAction<"channels_select"> {
  selected_channel: string;
  initial_channel?: string;
  placeholder?: PlainTextField;
  confirm?: Confirm;
}

export interface MultiChannelsSelectAction
  extends BlockElementAction<"multi_channels_select"> {
  selected_channels: string[];
  initial_channels?: string[];
  placeholder?: PlainTextField;
  confirm?: Confirm;
}

export interface ExternalSelectAction
  extends BlockElementAction<"external_select"> {
  selected_option?: AnyOption;
  initial_option?: AnyOption;
  placeholder?: PlainTextField;
  min_query_length?: number;
  confirm?: Confirm;
}

export interface MultiExternalSelectAction
  extends BlockElementAction<"multi_external_select"> {
  selected_options?: AnyOption[];
  initial_options?: AnyOption[];
  placeholder?: PlainTextField;
  min_query_length?: number;
  confirm?: Confirm;
}

export interface OverflowAction extends BlockElementAction<"overflow"> {
  selected_option: {
    text: PlainTextField;
    value: string;
  };
  confirm?: Confirm;
}

export interface DatepickerAction extends BlockElementAction<"datepicker"> {
  selected_date: string | null;
  initial_date?: string;
  placeholder?: PlainTextField;
  confirm?: Confirm;
}

export interface RadioButtonsAction
  extends BlockElementAction<"radio_buttons"> {
  selected_option: AnyOption | null;
  initial_option?: AnyOption;
  confirm?: Confirm;
}

export interface CheckboxesAction extends BlockElementAction<"checkboxes"> {
  selected_options: AnyOption[];
  initial_options?: AnyOption[];
  confirm?: Confirm;
}

export interface PlainTextInputAction
  extends BlockElementAction<"plain_text_input"> {
  value: string;
}

export type BlockElementActions =
  | ButtonAction
  | StaticSelectAction
  | MultiStaticSelectAction
  | UsersSelectAction
  | MultiUsersSelectAction
  | ConversationsSelectAction
  | MultiConversationsSelectAction
  | ChannelsSelectAction
  | MultiChannelsSelectAction
  | ExternalSelectAction
  | MultiExternalSelectAction
  | OverflowAction
  | DatepickerAction
  | RadioButtonsAction
  | CheckboxesAction
  | PlainTextInputAction;

export type BlockElementTypes = BlockElementActions["type"];
