import { SlackAppEnv } from "../app-env";
import { SlackRequest } from "../request/request";
import { MessageResponse } from "../response/response-body";
import { AckResponse } from "./handler";

/**
 * Returned data from an ack function for message events.
 */
export type MessageAckResponse = AckResponse | MessageResponse;

/**
 * The set of ack and lazy handlers.
 */
export interface SlackMessageHandler<E extends SlackAppEnv, Payload> {
  ack(request: SlackRequest<E, Payload>): Promise<MessageAckResponse>;
  lazy(request: SlackRequest<E, Payload>): Promise<void>;
}
