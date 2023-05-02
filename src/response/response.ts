import {
  MessageResponse,
  OptionsResponses,
  ViewClearResponse,
  ViewErrorsResponse,
  ViewPushResponse,
  ViewUpdateResponse,
} from "./response-body";

export interface SlackResponse {
  status?: number;
  contentType?: string;
  body?: string | MessageResponse | Record<string, any>;
}

export type SlackViewResponse =
  | (SlackResponse & {
      body:
        | ""
        | ViewClearResponse
        | ViewErrorsResponse
        | ViewPushResponse
        | ViewUpdateResponse;
    })
  | ""
  | ViewClearResponse
  | ViewErrorsResponse
  | ViewPushResponse
  | ViewUpdateResponse;

export type SlackOptionsResponse = SlackResponse & {
  body: OptionsResponses;
};

export function toCompleteResponse(
  slackResponse:
    | SlackResponse
    | MessageResponse
    | SlackViewResponse
    | string
    | void
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
    slackResponse.hasOwnProperty("text") ||
    slackResponse.hasOwnProperty("blocks")
  ) {
    completeResponse = { status: 200, body: slackResponse as MessageResponse };
  } else if (slackResponse.hasOwnProperty("response_action")) {
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
