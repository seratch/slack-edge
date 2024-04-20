import { LoggingEnv } from "../app-env";
import {
  SlackAPIClient,
  OpenIDConnectTokenResponse,
} from "slack-web-api-client";
import { prettyPrint } from "slack-web-api-client";

/**
 * OpenIDConnectCallback args
 */
export interface OpenIDConnectCallbackArgs {
  env: LoggingEnv;
  token: OpenIDConnectTokenResponse;
  request: Request;
}

/**
 * OpenIDConnectCallback hook
 */
export type OpenIDConnectCallback = (
  args: OpenIDConnectCallbackArgs,
) => Promise<Response>;

/**
 * The default OpenIDConnectCallback implementation.
 * @param env env variables
 * @param token
 * @returns response
 */
export const defaultOpenIDConnectCallback: OpenIDConnectCallback = async ({
  env,
  token,
}) => {
  const client = new SlackAPIClient(token.access_token, {
    logLevel: env.SLACK_LOGGING_LEVEL,
  });
  const userInfo = await client.openid.connect.userInfo();
  const body = `<html><head><style>body {{ padding: 10px 15px; font-family: verdana; text-align: center; }}</style></head><body><h1>It works!</h1><p>This is the default handler. To change this, pass \`oidc: { callback: async (token, req) => new Response("TODO") }\` to your SlackOAuthApp constructor.</p><pre>${prettyPrint(
    userInfo,
  )}</pre></body></html>`;

  return new Response(body, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
};
