import { SlackAppEnv } from "../app-env";
import {
  PreAuthorizeSlackMiddlwareRequest,
  SlackMiddlwareRequest,
} from "../request/request";
import { SlackResponse } from "../response/response";

export type PreAuthorizeMiddleware<E extends SlackAppEnv = SlackAppEnv> = (
  req: PreAuthorizeSlackMiddlwareRequest<E>
) => Promise<SlackResponse | void>;

export type Middleware<E extends SlackAppEnv = SlackAppEnv> = (
  req: SlackMiddlwareRequest<E>
) => Promise<SlackResponse | void>;
