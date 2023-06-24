import { SlackLoggingLevel } from "../app-env.ts";
import {
  OpenIDConnectTokenResponse,
  SlackAPIClient,
} from "https://deno.land/x/slack_web_api_client@0.3.1/mod.ts";
import { prettyPrint } from "https://deno.land/x/slack_web_api_client@0.3.1/mod.ts";

export type OpenIDConnectCallback = (
  apiResponse: OpenIDConnectTokenResponse,
  req: Request,
) => Promise<Response>;

export function defaultOpenIDConnectCallback(
  env: SlackLoggingLevel,
): OpenIDConnectCallback {
  // deno-lint-ignore no-unused-vars
  return async (token, req) => {
    const client = new SlackAPIClient(token.access_token, {
      logLevel: env.SLACK_LOGGING_LEVEL,
    });
    const userInfo = await client.openid.connect.userInfo();
    const body =
      `<html><head><style>body {{ padding: 10px 15px; font-family: verdana; text-align: center; }}</style></head><body><h1>It works!</h1><p>This is the default handler. To change this, pass \`oidc: { callback: async (token, req) => new Response("TODO") }\` to your SlackOAuthApp constructor.</p><pre>${
        prettyPrint(
          userInfo,
        )
      }</pre></body></html>`;

    return new Response(body, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  };
}
