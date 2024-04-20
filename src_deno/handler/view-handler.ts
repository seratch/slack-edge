import { SlackAppEnv } from "../app-env.ts";
import { SlackRequest } from "../request/request.ts";
import { SlackViewResponse } from "../response/response.ts";

/**
 * Returned data from an ack function for modal view related requests.
 */
export type ViewAckResponse = SlackViewResponse | void;

/**
 * Handler for view_submission/view_closed requests.
 */
export type SlackViewHandler<E extends SlackAppEnv, Payload> = {
  ack(request: SlackRequest<E, Payload>): Promise<ViewAckResponse>;
  lazy(request: SlackRequest<E, Payload>): Promise<void>;
};
