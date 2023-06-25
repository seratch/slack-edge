import { SlackAppEnv } from "../app-env.ts";
import {
  PreAuthorizeSlackMiddlwareRequest,
  SlackMiddlwareRequest,
} from "../request/request.ts";
import { SlackResponse } from "../response/response.ts";

export type PreAuthorizeMiddleware<E extends SlackAppEnv = SlackAppEnv> = (
  req: PreAuthorizeSlackMiddlwareRequest<E>,
) => Promise<SlackResponse | void>;

export type Middleware<E extends SlackAppEnv = SlackAppEnv> = (
  req: SlackMiddlwareRequest<E>,
) => Promise<SlackResponse | void>;
