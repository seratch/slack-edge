export interface GlobalShortcut {
  type: "shortcut";
  callback_id: string;
  trigger_id: string;
  user: {
    id: string;
    username: string;
    team_id: string;
  };
  team: {
    id: string;
    domain: string;
    enterprise_id?: string;
    enterprise_name?: string;
  } | null;
  token: string;
  action_ts: string;
  is_enterprise_install?: boolean;
  enterprise?: { id: string; name: string };
}
