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
    request: Request | undefined
  ): Promise<void> {
    throw new Error();
  }

  async findBotInstallation(
    query: InstallationStoreQuery
  ): Promise<Installation | undefined> {
    throw new Error();
  }

  async findUserInstallation(
    query: InstallationStoreQuery
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
});
