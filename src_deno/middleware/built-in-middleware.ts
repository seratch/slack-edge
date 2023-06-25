import { Middleware, PreAuthorizeMiddleware } from "./middleware.ts";

// deno-lint-ignore require-await
export const urlVerification: PreAuthorizeMiddleware = async (req) => {
  if (req.body.type === "url_verification") {
    return { status: 200, body: req.body.challenge };
  }
};

const eventTypesToKeep = ["member_joined_channel", "member_left_channel"];

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
