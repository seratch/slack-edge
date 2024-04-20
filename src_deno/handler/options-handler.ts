import { SlackAppEnv } from "../app-env.ts";
import { SlackRequest } from "../request/request.ts";
import { SlackOptionsResponse } from "../response/response.ts";

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
