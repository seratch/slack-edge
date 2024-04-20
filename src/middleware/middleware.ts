import { SlackAppEnv } from "../app-env";
import {
  PreAuthorizeSlackMiddlewareRequest,
  SlackMiddlewareRequest,
} from "../request/request";
import { SlackResponse } from "../response/response";

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
