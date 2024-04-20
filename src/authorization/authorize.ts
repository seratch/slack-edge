import { SlackAppEnv } from "../app-env";
import { PreAuthorizeSlackMiddlewareRequest } from "../request/request";
import { AuthorizeResult } from "./authorize-result";

/**
 * The function that resolves the OAuth token associated with an incoming request.
 */
export type Authorize<E extends SlackAppEnv = SlackAppEnv> = (
  req: PreAuthorizeSlackMiddlewareRequest<E>,
) => Promise<AuthorizeResult>;
