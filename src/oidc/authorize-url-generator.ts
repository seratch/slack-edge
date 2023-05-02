import { SlackOAuthEnv } from "../app-env";
import { ConfigError } from "../errors";

export function generateOIDCAuthorizeUrl<E extends SlackOAuthEnv>(
  state: string,
  env: E
): string {
  if (!env.SLACK_OIDC_SCOPES) {
    throw new ConfigError(
      "env.SLACK_OIDC_SCOPES must be present when enabling Sign in with Slack (OpenID Connect)"
    );
  }
  if (!env.SLACK_OIDC_REDIRECT_URI) {
    throw new ConfigError(
      "env.SLACK_OIDC_REDIRECT_URI must be present when enabling Sign in with Slack (OpenID Connect)"
    );
  }
  let url = `https://slack.com/openid/connect/authorize?response_type=code&state=${state}`;
  url += `&client_id=${env.SLACK_CLIENT_ID}`;
  url += `&scope=${env.SLACK_OIDC_SCOPES}`;
  url += `&redirect_uri=${env.SLACK_OIDC_REDIRECT_URI}`;
  return url;
}
