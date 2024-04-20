import { DataSubmissionView } from "./view-objects";

/**
 * view_closed payload data
 */
export interface ViewClosed {
  type: "view_closed";
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
  is_cleared: boolean;
  is_enterprise_install?: boolean;
  enterprise?: { id: string; name: string };
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
