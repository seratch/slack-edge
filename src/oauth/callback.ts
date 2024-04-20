import { OAuthV2AccessResponse } from "slack-web-api-client";
import { InvalidStateParameter, OAuthErrorCode } from "./error-codes";
import { Installation } from "./installation";
import {
  renderDefaultCompletionPage,
  renderDefaultErrorPage,
  renderDefaultStartPage,
} from "./oauth-page-renderer";
import { LoggingEnv } from "../app-env";

/**
 * beforeInstallation args
 */
export interface BeforeInstallationArgs {
  env: LoggingEnv;
  request: Request;
}

/**
 * beforeInstallation hook
 */
export type BeforeInstallation = (
  args: BeforeInstallationArgs,
) => Promise<Response | undefined | void>;

/**
 * afterInstallation args
 */
export interface AfterInstallationArgs {
  env: LoggingEnv;
  installation: Installation;
  request: Request;
}

/**
 * afterInstallation hook
 */
export type AfterInstallation = (
  args: AfterInstallationArgs,
) => Promise<Response | undefined | void>;

/**
 * onStateValidationError args
 */
export interface OnStateValidationErrorArgs {
  env: LoggingEnv;
  startPath: string;
  request: Request;
}

/**
 * onStateValidationError hook
 */
export type OnStateValidationError = (
  args: OnStateValidationErrorArgs,
) => Promise<Response>;

/**
 * The default onStateValidationError implementation.
 * @param startPath the path to start the OAuth flow again
 * @returns response
 */
// deno-lint-ignore require-await
export const defaultOnStateValidationError: OnStateValidationError = async ({
  startPath,
}) => {
  return new Response(
    renderDefaultErrorPage(startPath, InvalidStateParameter),
    {
      status: 400,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    },
  );
};

/**
 * onFailure args
 */
export interface OnFailureArgs {
  env: LoggingEnv;
  startPath: string;
  reason: OAuthErrorCode;
  request: Request;
}

/**
 * onFailure hook
 */
export type OnFailure = (args: OnFailureArgs) => Promise<Response>;

/**
 * The default onFailure implementation.
 * @param startPath the path to start the OAuth flow again
 * @param reason the error reason code
 * @returns response
 */
// deno-lint-ignore require-await
export const defaultOnFailure: OnFailure = async ({ startPath, reason }) => {
  return new Response(renderDefaultErrorPage(startPath, reason), {
    status: 400,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
};

/**
 * OAuthStart args
 */
export interface OAuthStartArgs {
  env: LoggingEnv;
  authorizeUrl: string;
  stateCookieName: string;
  stateValue: string;
  request: Request;
}

/**
 * OAuthStart hook
 */
export type OAuthStart = (args: OAuthStartArgs) => Promise<Response>;

/**
 * The default OAuthStart implementation.
 * @param authorizeUrl the authorize URL to redirect the installing user
 * @param stateCookieName cookie name used for the state parameter validation
 * @param stateValue state parameter string data
 * @returns response
 */
// deno-lint-ignore require-await
export const defaultOAuthStart: OAuthStart = async ({
  authorizeUrl,
  stateCookieName,
  stateValue,
}) => {
  return new Response(renderDefaultStartPage(authorizeUrl), {
    status: 302,
    headers: {
      Location: authorizeUrl,
      "Set-Cookie": `${stateCookieName}=${stateValue}; Secure; HttpOnly; Path=/; Max-Age=300`,
      "Content-Type": "text/html; charset=utf-8",
    },
  });
};

/**
 * OAuthCallback args
 */
export interface OAuthCallbackArgs {
  env: LoggingEnv;
  oauthAccess: OAuthV2AccessResponse;
  enterpriseUrl: string | undefined;
  stateCookieName: string;
  request: Request;
}

/**
 * OAuthCallback hook
 */
export type OAuthCallback = (args: OAuthCallbackArgs) => Promise<Response>;

/**
 * The default OAuthCallback implementation.
 * @param oauthAccess oauth.v2.access API response
 * @param enterpriseUrl the management console URL for Enterprise Grid admins
 * @param stateCookieName cookie name used for the state parameter validation
 * @returns response
 */
// deno-lint-ignore require-await
export const defaultOAuthCallback: OAuthCallback = async ({
  oauthAccess,
  enterpriseUrl,
  stateCookieName,
}) => {
  return new Response(
    renderDefaultCompletionPage(
      oauthAccess.app_id!,
      oauthAccess.team?.id!,
      oauthAccess.is_enterprise_install,
      enterpriseUrl,
    ),
    {
      status: 200,
      headers: {
        "Set-Cookie": `${stateCookieName}=deleted; Secure; HttpOnly; Path=/; Max-Age=0`,
        "Content-Type": "text/html; charset=utf-8",
      },
    },
  );
};
