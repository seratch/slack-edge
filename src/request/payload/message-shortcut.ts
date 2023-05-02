export interface MessageShortcut {
  type: "message_action";
  callback_id: string;
  trigger_id: string;
  message_ts: string;
  response_url: string;
  message: {
    type: "message";
    user?: string;
    ts: string;
    text?: string;
    [key: string]: any;
  };
  user: {
    id: string;
    name: string;
    team_id?: string;
    username?: string;
  };
  channel: {
    id: string;
    name: string;
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
  enterprise?: {
    id: string;
    name: string;
  };
}
