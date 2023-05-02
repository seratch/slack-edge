import {
  SlackAppContext,
  PreAuthorizeSlackAppContext,
  SlackAppContextWithRespond,
  SlackAppContextWithOptionalRespond,
  SlackAppContextWithChannelId,
} from "../context/context";
import { SlackAppEnv } from "../app-env";

export interface SlackMiddlewareRequestBase<E extends SlackAppEnv> {
  env: E;
  context: PreAuthorizeSlackAppContext;
  body: Record<string, any>;
  retryNum?: number;
  retryReason?: string;
  rawBody: string;
  headers: Headers;
}

export type PreAuthorizeSlackMiddlwareRequest<E extends SlackAppEnv> =
  SlackMiddlewareRequestBase<E> & {
    context: PreAuthorizeSlackAppContext;
  };

export type SlackMiddlwareRequest<E extends SlackAppEnv> =
  SlackMiddlewareRequestBase<E> & {
    context: SlackAppContext;
  };

export type SlackRequest<
  E extends SlackAppEnv,
  Payload
> = SlackMiddlwareRequest<E> & {
  payload: Payload;
};

export type SlackRequestWithChannelId<
  E extends SlackAppEnv,
  Payload
> = SlackMiddlwareRequest<E> & {
  context: SlackAppContextWithChannelId;
  payload: Payload;
};

export type SlackRequestWithRespond<
  E extends SlackAppEnv,
  Payload
> = SlackMiddlwareRequest<E> & {
  context: SlackAppContextWithRespond;
  payload: Payload;
};

export type SlackRequestWithOptionalRespond<
  E extends SlackAppEnv,
  Payload
> = SlackMiddlwareRequest<E> & {
  context: SlackAppContextWithOptionalRespond;
  payload: Payload;
};
