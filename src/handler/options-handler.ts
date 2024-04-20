import { SlackAppEnv } from "../app-env";
import { SlackRequest } from "../request/request";
import { SlackOptionsResponse } from "../response/response";

/**
 * Returned data from an ack function for block_suggestion requests.
 */
export type OptionsAckResponse = SlackOptionsResponse;

/**
 * Handler for block_suggestion requests.
 */
export interface SlackOptionsHandler<E extends SlackAppEnv, Payload> {
  ack(request: SlackRequest<E, Payload>): Promise<OptionsAckResponse>;
  // Note that a block_suggestion response must be done synchronously.
  // That's why we don't support lazy functions for the pattern.
}
