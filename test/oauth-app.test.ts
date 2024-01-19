import { assert, test, describe } from "vitest";
import {
  SlackOAuthApp,
  InstallationStore,
  SlackOAuthEnv,
  Installation,
  InstallationStoreQuery,
  Authorize,
} from "../src/index";

class MemoryInstallationStore implements InstallationStore<SlackOAuthEnv> {
  async save(
    installation: Installation,
    request: Request | undefined,
  ): Promise<void> {
    throw new Error();
  }

  async findBotInstallation(
    query: InstallationStoreQuery,
  ): Promise<Installation | undefined> {
    throw new Error();
  }

  async findUserInstallation(
    query: InstallationStoreQuery,
  ): Promise<Installation | undefined> {
    throw new Error();
  }

  toAuthorize(): Authorize<SlackOAuthEnv> {
    return async (req) => {
      throw new Error();
    };
  }
}

describe("SlackOAuthApp", () => {
  test("Initialization", () => {
    const app = new SlackOAuthApp({
      env: {
        SLACK_CLIENT_ID: "111.222",
        SLACK_CLIENT_SECRET: "xxx",
        SLACK_BOT_SCOPES: "commands,chat:write",
        SLACK_SIGNING_SECRET: "test",
      },
      installationStore: new MemoryInstallationStore(),
    });
    assert.exists(app.client);
  });

  test("Initialization with callback options", () => {
    const app = new SlackOAuthApp({
      env: {
        SLACK_CLIENT_ID: "111.222",
        SLACK_CLIENT_SECRET: "xxx",
        SLACK_BOT_SCOPES: "commands,chat:write",
        SLACK_SIGNING_SECRET: "test",
      },
      installationStore: new MemoryInstallationStore(),
      oauth: {
        start: async ({ authorizeUrl }) => {
          const body = `The url is ${authorizeUrl}`;
          return new Response(body, { status: 200 });
        },
        beforeInstallation: async ({ env, request }) => {},
        afterInstallation: async ({ env, request, installation }) => {},
        callback: async ({}) => {
          return new Response("OK!", { status: 200 });
        },
      },
      oidc: {
        start: async ({ authorizeUrl }) => {
          const body = `The url is ${authorizeUrl}`;
          return new Response(body, { status: 200 });
        },
        callback: async ({}) => {
          return new Response("OK!", { status: 200 });
        },
      },
    });
    assert.exists(app.client);
  });
});
