import { DataSubmissionView } from "./view-objects.ts";

export interface ViewSubmission {
  type: "view_submission";
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
  view: DataSubmissionView;
  api_app_id: string;
  token: string;
  trigger_id: string;
  is_enterprise_install?: boolean;
  enterprise?: {
    id: string;
    name: string;
  };
  response_urls?: {
    block_id: string;
    action_id: string;
    channel_id: string;
    response_url: string;
  }[];
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
