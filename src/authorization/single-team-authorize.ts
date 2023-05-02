import { AuthorizeError } from "../errors";
import {
  SlackAPIClient,
  AuthTestResponse,
  SlackAPIError,
} from "slack-web-api-client";
import { Authorize } from "./authorize";

export const singleTeamAuthorize: Authorize = async (req) => {
  // This authorize function supports only the bot token for a workspace
  const botToken = req.env.SLACK_BOT_TOKEN!;
  const client = new SlackAPIClient(botToken);
  try {
    const response: AuthTestResponse = await client.auth.test();
    const scopes = response.headers.get("x-oauth-scopes") ?? "";
    return {
      botToken,
      enterpriseId: response.enterprise_id,
      teamId: response.team_id,
      team: response.team,
      url: response.url,
      botId: response.bot_id!,
      botUserId: response.user_id!,
      userId: response.user_id,
      user: response.user,
      botScopes: scopes.split(","),
      userToken: undefined, // As mentioned above, user tokens are not supported in this module
      userScopes: undefined, // As mentioned above, user tokens are not supported in this module
    };
  } catch (e) {
    throw new AuthorizeError(
      `Failed to call auth.test API due to ${(e as SlackAPIError).message}`
    );
  }
};
