import {
  PreAuthorizeSlackAppContext,
  SlackAppContext,
  SlackAppContextWithChannelId,
  SlackAppContextWithOptionalRespond,
  SlackAppContextWithRespond,
} from "../context/context.ts";
import { SlackAppEnv } from "../app-env.ts";

/**
 * Basic request data representation.
 */
export interface SlackMiddlewareRequestBase<E extends SlackAppEnv> {
  env: E;
  context: PreAuthorizeSlackAppContext;
  // deno-lint-ignore no-explicit-any
  body: Record<string, any>;
  retryNum?: number;
  retryReason?: string;
  rawBody: string;
  headers: Headers;
}

/**
 * Request data representation available for middleware before authorize() call.
 */
export type PreAuthorizeSlackMiddlewareRequest<E extends SlackAppEnv> =
  & SlackMiddlewareRequestBase<E>
  & {
    context: PreAuthorizeSlackAppContext;
  };

/**
 * Request data representation available for middleware after authorize() call.
 */
export type SlackMiddlewareRequest<E extends SlackAppEnv> =
  & SlackMiddlewareRequestBase<E>
  & {
    context: SlackAppContext;
  };

/**
 * Request data representation available for listeners.
 */
export type SlackRequest<E extends SlackAppEnv, Payload> =
  & SlackMiddlewareRequest<E>
  & {
    payload: Payload;
  };

/**
 * Request data representation including channel_id available for listeners.
 */
export type SlackRequestWithChannelId<E extends SlackAppEnv, Payload> =
  & SlackMiddlewareRequest<E>
  & {
    context: SlackAppContextWithChannelId;
    payload: Payload;
  };

/**
 * Request data representation w/ response_url available for listeners.
 */
export type SlackRequestWithRespond<E extends SlackAppEnv, Payload> =
  & SlackMiddlewareRequest<E>
  & {
    context: SlackAppContextWithRespond;
    payload: Payload;
  };

/**
 * Request data representation w/ response_url available for listeners.
 */
export type SlackRequestWithOptionalRespond<E extends SlackAppEnv, Payload> =
  & SlackMiddlewareRequest<E>
  & {
    context: SlackAppContextWithOptionalRespond;
    payload: Payload;
  };
