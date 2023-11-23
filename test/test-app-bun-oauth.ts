import { SlackAPIClient } from "slack-web-api-client";
import {
  Authorize,
  SlackOAuthApp,
  SlackOAuthEnv,
  AuthorizeError,
  Installation,
  InstallationStore,
  InstallationStoreQuery,
} from "../src/index";

class FileInstallationStore implements InstallationStore<SlackOAuthEnv> {
  async save(
    installation: Installation,
    _request: Request | undefined,
  ): Promise<void> {
    await Bun.write(
      `./tmp/${installation.team_id}.json`,
      JSON.stringify(installation),
    );
    await Bun.write(
      `./tmp/${installation.team_id}-${installation.user_id}.json`,
      JSON.stringify(installation),
    );
  }
  async findBotInstallation(
    query: InstallationStoreQuery,
  ): Promise<Installation | undefined> {
    return await Bun.file(`./tmp/${query.teamId}.json`).json();
  }
  async findUserInstallation(
    query: InstallationStoreQuery,
  ): Promise<Installation | undefined> {
    return await Bun.file(`./tmp/${query.teamId}-${query.userId}.json`).json();
  }
  toAuthorize(): Authorize<SlackOAuthEnv> {
    return async (req) => {
      // Note that this implementation supports only bot token resolution
      const installation = await this.findBotInstallation(req.context);
      if (installation) {
        const client = new SlackAPIClient();
        const authTest = await client.auth.test({
          token: installation.bot_token,
        });
        return {
          enterpriseId: installation?.enterprise_id,
          teamId: installation?.team_id,
          botId: authTest.bot_id,
          botUserId: installation.bot_user_id,
          botToken: installation.bot_token,
          botScopes: installation.bot_scopes,
        };
      }
      throw new AuthorizeError(
        `Failed to resolve the associated installation: ${req.context.teamId}`,
      );
    };
  }
}

const app = new SlackOAuthApp({
  env: {
    SLACK_SIGNING_SECRET: process.env.SLACK_SIGNING_SECRET!,
    SLACK_CLIENT_ID: process.env.SLACK_CLIENT_ID!,
    SLACK_CLIENT_SECRET: process.env.SLACK_CLIENT_SECRET!,
    SLACK_BOT_SCOPES: "app_mentions:read,chat:write,channels:history,commands",
    SLACK_LOGGING_LEVEL: "DEBUG",
  },
  installationStore: new FileInstallationStore(),
});

app.event("app_mention", async ({ context, payload }) => {
  console.log(payload);
  await context.say({ text: "Hey!" });
});

app.message("hey", async ({ context }) => {
  await context.say({ text: "Hey!" });
});
app.event("message", async () => {});

app.shortcut(
  "hello",
  async () => {},
  async ({ context, payload }) => {
    await context.client.views.open({
      trigger_id: payload.trigger_id,
      view: {
        type: "modal",
        callback_id: "foo",
        title: { type: "plain_text", text: "My App" },
        close: { type: "plain_text", text: "Cancel" },
        blocks: [
          {
            type: "section",
            text: {
              type: "plain_text",
              text: "This is a plain text section block.",
            },
          },
        ],
      },
    });
  },
);

// bun run --watch test/test-app-bun-oauth.ts
// brew install cloudflare/cloudflare/cloudflared
// cloudflared tunnel --url http://localhost:3000
export default {
  port: 3000,
  async fetch(request) {
    return await app.run(request);
  },
};
