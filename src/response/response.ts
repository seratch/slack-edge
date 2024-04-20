import {
  MessageResponse,
  AnyOptionsResponse,
  AnyViewResponse,
} from "./response-body";

/**
 * Response from ack function.
 */
export interface SlackResponse {
  status?: number;
  contentType?: string;
  // deno-lint-ignore no-explicit-any
  body?: string | MessageResponse | Record<string, any>;
}

/**
 * Response for view_submission requests.
 */
export type SlackViewResponse =
  | (SlackResponse & {
      body: "" | AnyViewResponse;
    })
  | ""
  | AnyViewResponse
  | undefined
  | void;

/**
 * Response for block_suggestion requests.
 */
export type SlackOptionsResponse =
  | (SlackResponse & {
      body: AnyOptionsResponse;
    })
  | AnyOptionsResponse;

/**
 * Builds a complete HTTP response data
 * @param slackResponse slack-edge's response representation
 * @returns an HTTP response
 */
export function toCompleteResponse(
  slackResponse:
    | SlackResponse
    | MessageResponse
    | SlackViewResponse
    | SlackOptionsResponse
    | string
    | void,
): Response {
  if (!slackResponse) {
    return new Response("", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }
  if (typeof slackResponse === "string") {
    return new Response(slackResponse, {
      status: 200,
      headers: { "Content-Type": "text/plain;charset=utf-8" },
    });
  }
  let completeResponse: SlackResponse = {};
  if (
    Object.prototype.hasOwnProperty.call(slackResponse, "text") ||
    Object.prototype.hasOwnProperty.call(slackResponse, "blocks")
  ) {
    completeResponse = { status: 200, body: slackResponse as MessageResponse };
  } else if (
    Object.prototype.hasOwnProperty.call(slackResponse, "response_action")
  ) {
    completeResponse = { status: 200, body: slackResponse };
  } else if (
    Object.prototype.hasOwnProperty.call(slackResponse, "options") ||
    Object.prototype.hasOwnProperty.call(slackResponse, "option_groups")
  ) {
    completeResponse = { status: 200, body: slackResponse };
  } else {
    completeResponse = slackResponse as SlackResponse;
  }
  const status = completeResponse.status ? completeResponse.status : 200;
  let contentType = completeResponse.contentType
    ? completeResponse.contentType
    : "text/plain;charset=utf-8";
  let bodyString = "";
  if (typeof completeResponse.body === "object") {
    contentType = "application/json;charset=utf-8";
    bodyString = JSON.stringify(completeResponse.body);
  } else {
    bodyString = completeResponse.body || "";
  }
  return new Response(bodyString, {
    status,
    headers: { "Content-Type": contentType },
  });
}
