import { SlackAppEnv } from "../app-env.ts";
import { PreAuthorizeSlackMiddlewareRequest } from "../request/request.ts";
import { AuthorizeResult } from "./authorize-result.ts";

/**
 * The function that resolves the OAuth token associated with an incoming request.
 */
export type Authorize<E extends SlackAppEnv = SlackAppEnv> = (
  req: PreAuthorizeSlackMiddlewareRequest<E>,
) => Promise<AuthorizeResult>;
