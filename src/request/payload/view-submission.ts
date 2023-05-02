import { DataSubmissionView } from "./view-objects";

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
}
