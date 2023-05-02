import { DataSubmissionView } from "./view-objects";

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
}
