/**
 * The whole payload data.
 */
export interface SlackRequestBody {
  type?: string;

  // slash commands
  command?: string;

  // event_callback
  event?: {
    type: string;
    subtype?: string;
    text?: string;
  };
  event_id?: string;
  event_time?: number;
  api_app_id?: string;
  enterprise_id?: string;
  team_id?: string;
  is_ext_shared_channel?: boolean;
  authorizations?: EventApiAuthorization[];
  token?: string; // legacy verification token

  // shortcut, message_action
  callback_id?: string;

  // block_actions
  actions: {
    type: string;
    block_id: string;
    action_id: string;
  }[];

  // block_suggestion
  block_id?: string;
  action_id?: string;

  // view_submission / view_closed
  view?: {
    callback_id: string;
  };
}

export interface EventApiAuthorization {
  enterprise_id: string | null;
  team_id: string | null;
  user_id: string;
  is_bot: boolean;
  is_enterprise_install?: boolean;
}
