import { Middleware, PreAuthorizeMiddleware } from "./middleware.ts";

/**
 * Built-in middleware to handle url_verification requests.
 * @param req request
 * @returns response if needed
 */
// deno-lint-ignore require-await
export const urlVerification: PreAuthorizeMiddleware = async (req) => {
  if (req.body.type === "url_verification") {
    return { status: 200, body: req.body.challenge };
  }
};

const eventTypesToKeep = ["member_joined_channel", "member_left_channel"];

/**
 * Built-in middleware bypass self-generated events for preventing an infinite loop of self-responses.
 * @param req request
 * @returns response if needed
 */
export function ignoringSelfEvents(
  ignoreSelfAssistantMessageEvents: boolean,
): Middleware {
  // deno-lint-ignore require-await
  return async (req) => {
    if (req.body.event) {
      if (eventTypesToKeep.includes(req.body.event.type)) {
        return;
      }
      const auth = req.context.authorizeResult;
      const isSelfEvent = auth.botId === req.body.event.bot_id ||
        auth.botUserId === req.context.userId;
      if (isSelfEvent) {
        if (
          ignoreSelfAssistantMessageEvents &&
          req.body.event.type === "message" &&
          req.body.event.channel_type === "im"
        ) {
          // Assistant#botMessage handles this pattern
          return;
        }
        return { status: 200, body: "" };
      }
    }
  };
}
