interface fromSocketModeToRequestArgs {
  url?: string;
  body: Record<string, unknown>;
  retryNum?: string;
  retryReason?: string;
}
/**
 * Converts a raw Socket Mode message data to slack-edge's request data.
 * @param message Socket Mode message data
 * @returns slack-edge's request representation
 */
export function fromSocketModeToRequest({ url, body, retryNum, retryReason }: fromSocketModeToRequestArgs): Request | undefined {
  if (!body) {
    return undefined;
  }
  const payload = JSON.stringify(body);
  const headers: Record<string, string> = {
    "content-type": "application/json",
  };
  if (retryNum) {
    headers["x-slack-retry-num"] = retryNum;
  }
  if (retryReason) {
    headers["x-slack-retry-reason"] = retryReason;
  }
  const options = {
    method: "POST",
    headers: new Headers(headers),
    body: new Blob([payload]).stream(),
    duplex: "half", // required when running on Node.js runtime
  };
  return new Request(url ?? "wss://localhost", options);
}

interface fromResponseToSocketModePayloadArgs {
  response: Response;
}
/**
 * Converts slack-edge's response representation to a Socket Mode message.
 * @param response slack-edge's response representation
 * @returns WebSocket message data
 */
export async function fromResponseToSocketModePayload({ response }: fromResponseToSocketModePayloadArgs): Promise<Record<string, unknown>> {
  let message: Record<string, unknown> = {};
  if (response.body) {
    const contentType = response.headers.get("Content-Type");
    if (contentType && contentType.startsWith("text/plain")) {
      const text = await response.text();
      if (text) {
        message = { text };
      }
    } else {
      message = await response.json();
    }
  }
  return message;
}
