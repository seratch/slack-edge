import { SlackAppEnv } from "../app-env.ts";
import { SlackRequest } from "../request/request.ts";
import { MessageResponse } from "../response/response-body.ts";
import { AckResponse } from "./handler.ts";

export type MessageAckResponse = AckResponse | MessageResponse;

export interface SlackMessageHandler<E extends SlackAppEnv, Payload> {
  ack(request: SlackRequest<E, Payload>): Promise<MessageAckResponse>;
  lazy(request: SlackRequest<E, Payload>): Promise<void>;
}
