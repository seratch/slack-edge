import { SlackAppEnv } from "../app-env.ts";
import { SlackRequest } from "../request/request.ts";
import { SlackViewResponse } from "../response/response.ts";

export type ViewAckResponse = SlackViewResponse | void;

export type SlackViewHandler<E extends SlackAppEnv, Payload> = {
  ack(request: SlackRequest<E, Payload>): Promise<ViewAckResponse>;
  lazy(request: SlackRequest<E, Payload>): Promise<void>;
};
