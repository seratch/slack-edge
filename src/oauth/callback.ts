import { InvalidStateParameter, OAuthErrorCode } from "./error-codes";
import { Installation } from "./installation";
import { renderErrorPage } from "./oauth-page-renderer";

export type BeforeInstallation = (
  req: Request
) => Promise<Response | undefined | void>;

export type AfterInstallation = (
  installation: Installation,
  req: Request
) => Promise<Response | undefined | void>;

export type OnStateValidationError = (
  startPath: string,
  req: Request
) => Promise<Response>;

export const defaultOnStateValidationError = async (
  startPath: string,
  req: Request
) => {
  return new Response(renderErrorPage(startPath, InvalidStateParameter), {
    status: 400,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
};

export type OnFailure = (
  startPath: string,
  reason: OAuthErrorCode,
  req: Request
) => Promise<Response>;

export const defaultOnFailure = async (
  startPath: string,
  reason: OAuthErrorCode,
  req: Request
) => {
  return new Response(renderErrorPage(startPath, reason), {
    status: 400,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
};
