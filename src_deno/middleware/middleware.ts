import { SlackAppEnv } from "../app-env.ts";
import {
  PreAuthorizeSlackMiddlewareRequest,
  SlackMiddlewareRequest,
} from "../request/request.ts";
import { SlackResponse } from "../response/response.ts";

/**
 * Middleware to run prior to authorize() function call.
 */
export type PreAuthorizeMiddleware<E extends SlackAppEnv = SlackAppEnv> = (
  req: PreAuthorizeSlackMiddlewareRequest<E>,
) => Promise<SlackResponse | void>;

/**
 * Middleware to run after authorize() function call.
 */
export type Middleware<E extends SlackAppEnv = SlackAppEnv> = (
  req: SlackMiddlewareRequest<E>,
) => Promise<SlackResponse | void>;
