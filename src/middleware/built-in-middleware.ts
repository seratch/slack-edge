import { PreAuthorizeMiddleware, Middleware } from "./middleware";

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
// deno-lint-ignore require-await
export const ignoringSelfEvents: Middleware = async (req) => {
  if (req.body.event) {
    if (eventTypesToKeep.includes(req.body.event.type)) {
      return;
    }
    if (
      req.context.authorizeResult.botId === req.body.event.bot_id ||
      req.context.authorizeResult.botUserId === req.context.userId
    ) {
      return { status: 200, body: "" };
    }
  }
};
