import { InvalidStateParameter, OAuthErrorCode } from "./error-codes.ts";
import { Installation } from "./installation.ts";
import { renderErrorPage } from "./oauth-page-renderer.ts";

export type BeforeInstallation = (
  req: Request,
) => Promise<Response | undefined | void>;

export type AfterInstallation = (
  installation: Installation,
  req: Request,
) => Promise<Response | undefined | void>;

export type OnStateValidationError = (
  startPath: string,
  req: Request,
) => Promise<Response>;

// deno-lint-ignore require-await
export const defaultOnStateValidationError = async (
  startPath: string,
  // deno-lint-ignore no-unused-vars
  req: Request,
) => {
  return new Response(renderErrorPage(startPath, InvalidStateParameter), {
    status: 400,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
};

export type OnFailure = (
  startPath: string,
  reason: OAuthErrorCode,
  req: Request,
) => Promise<Response>;

// deno-lint-ignore require-await
export const defaultOnFailure = async (
  startPath: string,
  reason: OAuthErrorCode,
  // deno-lint-ignore no-unused-vars
  req: Request,
) => {
  return new Response(renderErrorPage(startPath, reason), {
    status: 400,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
};
