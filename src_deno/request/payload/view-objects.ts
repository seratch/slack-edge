import {
  AnyActionBlockElementType,
  AnyModalBlock,
  PlainTextField,
  RichTextBlock,
} from "https://deno.land/x/slack_web_api_client@0.3.1/mod.ts";

export interface ViewStateSelectedOption {
  text: PlainTextField;
  value: string;
}

export interface ViewStateValue {
  type: AnyActionBlockElementType;
  value?: string;
  selected_date?: string;
  selected_time?: string;
  selected_date_time?: number;
  selected_conversation?: string;
  selected_channel?: string;
  selected_user?: string;
  selected_option?: ViewStateSelectedOption;
  selected_conversations?: string[];
  selected_channels?: string[];
  selected_users?: string[];
  selected_options?: ViewStateSelectedOption[];
  timezone?: string; // timepicker
  rich_text_value?: RichTextBlock; // rich_text_input
}

export interface DataSubmissionView {
  id: string;
  callback_id: string;
  team_id: string;
  app_installed_team_id?: string;
  app_id: string | null;
  bot_id: string;
  title: PlainTextField;
  type: string;
  blocks: AnyModalBlock[];
  close: PlainTextField | null;
  submit: PlainTextField | null;
  state: {
    values: {
      [blockId: string]: {
        [actionId: string]: ViewStateValue;
      };
    };
  };
  hash: string;
  private_metadata: string;
  root_view_id: string | null;
  previous_view_id: string | null;
  clear_on_close: boolean;
  notify_on_close: boolean;
  external_id?: string;
}
