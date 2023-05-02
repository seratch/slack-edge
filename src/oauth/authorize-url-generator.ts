import { SlackOAuthEnv } from "../app-env";

export function generateAuthorizeUrl<E extends SlackOAuthEnv>(
  state: string,
  env: E,
  team: string | undefined = undefined
): string {
  let url = `https://slack.com/oauth/v2/authorize?state=${state}`;
  url += `&client_id=${env.SLACK_CLIENT_ID}`;
  url += `&scope=${env.SLACK_BOT_SCOPES}`;
  if (env.SLACK_USER_SCOPES) {
    url += `&user_scope=${env.SLACK_USER_SCOPES}`;
  }
  if (env.SLACK_REDIRECT_URI) {
    url += `&redirect_uri=${env.SLACK_REDIRECT_URI}`;
  }
  if (team) {
    url += `&team=${team}`;
  }
  return url;
}
