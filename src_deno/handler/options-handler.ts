import { SlackAppEnv } from "../app-env.ts";
import { SlackRequest } from "../request/request.ts";
import { SlackOptionsResponse } from "../response/response.ts";

export type OptionsAckResponse = SlackOptionsResponse;

export interface SlackOptionsHandler<E extends SlackAppEnv, Payload> {
  ack(request: SlackRequest<E, Payload>): Promise<OptionsAckResponse>;
  // Note that a block_suggestion response must be done synchronously.
  // That's why we don't support lazy functions for the pattern.
}
