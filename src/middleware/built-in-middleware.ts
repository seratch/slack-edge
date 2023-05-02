import { PreAuthorizeMiddleware, Middleware } from "./middleware";

export const urlVerification: PreAuthorizeMiddleware = async (req) => {
  if (req.body.type === "url_verification") {
    return { status: 200, body: req.body.challenge };
  }
};

const eventTypesToKeep = ["member_joined_channel", "member_left_channel"];

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
