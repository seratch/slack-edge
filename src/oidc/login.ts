import {
  OpenIDConnectTokenResponse,
  OpenIDConnectUserInfoResponse,
} from "slack-web-api-client";

export interface Login {
  enterprise_id?: string;
  team_id: string;
  user_id: string;
  name?: string;
  email?: string;
  picture?: string;

  access_token: string;
  refresh_token?: string; // token rotation
  token_expires_at?: number; // token rotation (epoch time seconds)
}

export function toLogin(
  token: OpenIDConnectTokenResponse,
  userInfo: OpenIDConnectUserInfoResponse
): Login {
  return {
    enterprise_id: userInfo["https://slack.com/enterprise_id"],
    team_id: userInfo["https://slack.com/team_id"]!,
    user_id: userInfo["https://slack.com/user_id"]!,
    email: userInfo.email,
    picture: userInfo.picture,
    access_token: token.access_token!,
    refresh_token: token.refresh_token,
    token_expires_at: token.expires_in
      ? new Date().getTime() / 1000 + token.expires_in
      : undefined,
  };
}
