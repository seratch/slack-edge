import { OAuthV2AccessResponse } from "https://deno.land/x/slack_web_api_client@0.8.0/mod.ts";
import { InvalidStateParameter, OAuthErrorCode } from "./error-codes.ts";
import { Installation } from "./installation.ts";
import {
  renderDefaultCompletionPage,
  renderDefaultErrorPage,
  renderDefaultStartPage,
} from "./oauth-page-renderer.ts";
import { SlackLoggingLevel } from "../app-env.ts";

export interface BeforeInstallationArgs {
  env: SlackLoggingLevel;
  request: Request;
}

export type BeforeInstallation = (
  args: BeforeInstallationArgs,
) => Promise<Response | undefined | void>;

export interface AfterInstallationArgs {
  env: SlackLoggingLevel;
  installation: Installation;
  request: Request;
}

export type AfterInstallation = (
  args: AfterInstallationArgs,
) => Promise<Response | undefined | void>;

export interface OnStateValidationErrorArgs {
  env: SlackLoggingLevel;
  startPath: string;
  request: Request;
}

export type OnStateValidationError = (
  args: OnStateValidationErrorArgs,
) => Promise<Response>;

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

export interface OnFailureArgs {
  env: SlackLoggingLevel;
  startPath: string;
  reason: OAuthErrorCode;
  request: Request;
}

export type OnFailure = (args: OnFailureArgs) => Promise<Response>;

// deno-lint-ignore require-await
export const defaultOnFailure: OnFailure = async ({ startPath, reason }) => {
  return new Response(renderDefaultErrorPage(startPath, reason), {
    status: 400,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
};

export interface OAuthStartArgs {
  env: SlackLoggingLevel;
  authorizeUrl: string;
  stateCookieName: string;
  stateValue: string;
  request: Request;
}

export type OAuthStart = (args: OAuthStartArgs) => Promise<Response>;

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
      "Set-Cookie":
        `${stateCookieName}=${stateValue}; Secure; HttpOnly; Path=/; Max-Age=300`,
      "Content-Type": "text/html; charset=utf-8",
    },
  });
};

export interface OAuthCallbackArgs {
  env: SlackLoggingLevel;
  oauthAccess: OAuthV2AccessResponse;
  enterpriseUrl: string | undefined;
  stateCookieName: string;
  request: Request;
}

export type OAuthCallback = (args: OAuthCallbackArgs) => Promise<Response>;

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
        "Set-Cookie":
          `${stateCookieName}=deleted; Secure; HttpOnly; Path=/; Max-Age=0`,
        "Content-Type": "text/html; charset=utf-8",
      },
    },
  );
};
