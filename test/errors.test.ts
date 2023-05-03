import { assert, test, describe } from "vitest";
import { ConfigError, AuthorizeError } from "../src/index";

describe("Errors", () => {
  test("ConfigError", () => {
    const error = new ConfigError("test");
    assert.equal(error.toString(), "ConfigError: test");
  });
  test("AuthorizeError", () => {
    const error = new AuthorizeError("test");
    assert.equal(error.toString(), "AuthorizeError: test");
  });
});
