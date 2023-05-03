import { assert, test, describe } from "vitest";
import { SlackApp } from "../src/index";

describe("SlackApp", () => {
  test("initialization", () => {
    const app = new SlackApp({
      env: { SLACK_SIGNING_SECRET: "", SLACK_BOT_TOKEN: "xoxb-" },
    });
    assert.exists(app.client);
  });
});
