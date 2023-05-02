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
