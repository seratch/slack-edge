import { assert, test, describe } from "vitest";
import {
  fromResponseToSocketModePayload,
  fromSocketModeToRequest,
} from "../src/index";

describe("Socket Mode", () => {
  describe("fromSocketModeToRequest", () => {
    test("no url", async () => {
      const request = fromSocketModeToRequest({
        body: {},
        retryNum: undefined,
        retryReason: undefined,
      });
      assert.exists(request);
      assert.deepEqual(request?.url, "wss://localhost/");
      assert.deepEqual(await request?.json(), {});
      const headers: Record<string, string | null> = {};
      for (const h of request!.headers.keys()) {
        headers[h] = request!.headers.get(h);
      }
      assert.deepEqual(headers, { "content-type": "application/json" });
    });
    test("url and command", async () => {
      const request = fromSocketModeToRequest({
        url: "https://example.com",
        body: { command: "/foo" },
        retryNum: undefined,
        retryReason: undefined,
      });
      assert.exists(request);
      assert.deepEqual(request?.url, "https://example.com/");
      assert.deepEqual(await request?.json(), { command: "/foo" });
      const headers: Record<string, string | null> = {};
      for (const h of request!.headers.keys()) {
        headers[h] = request!.headers.get(h);
      }
      assert.deepEqual(headers, { "content-type": "application/json" });
    });
    test("event and retry attributes", async () => {
      const request = fromSocketModeToRequest({
        body: { event: { type: "app_mention" } },
        retryNum: "1",
        retryReason: "timeout",
      });
      assert.exists(request);
      assert.deepEqual(await request?.json(), {
        event: { type: "app_mention" },
      });
      const headers: Record<string, string | null> = {};
      for (const h of request!.headers.keys()) {
        headers[h] = request!.headers.get(h);
      }
      assert.deepEqual(headers, {
        "content-type": "application/json",
        "x-slack-retry-num": "1",
        "x-slack-retry-reason": "timeout",
      });
    });
  });

  describe("fromResponseToSocketModePayload", () => {
    test("200 ok; body is an empty body", async () => {
      const payload = await fromResponseToSocketModePayload({
        response: new Response("", {
          status: 200,
        }),
      });
      assert.deepEqual(payload, {});
    });
    test("200 ok; body is a string", async () => {
      const payload = await fromResponseToSocketModePayload({
        response: new Response("Thank you!", {
          status: 200,
        }),
      });
      assert.deepEqual(payload, { text: "Thank you!" });
    });
    test("200 ok; body is a string w/ text/plain type", async () => {
      const payload = await fromResponseToSocketModePayload({
        response: new Response("Thank you!", {
          status: 200,
          headers: { "content-type": "text/plain; charset=utf-8" },
        }),
      });
      assert.deepEqual(payload, { text: "Thank you!" });
    });
    test("200 ok; body is an object w/ application/json type", async () => {
      const payload = await fromResponseToSocketModePayload({
        response: new Response(JSON.stringify({ text: "Thank you!" }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      });
      assert.deepEqual(payload, { text: "Thank you!" });
    });
    test("404 not found", async () => {
      const payload = await fromResponseToSocketModePayload({
        response: new Response("not found", {
          status: 404,
        }),
      });
      assert.deepEqual(payload, { text: "not found" });
    });
    test("500 internal error", async () => {
      const payload = await fromResponseToSocketModePayload({
        response: new Response("something is wrong!", {
          status: 500,
        }),
      });
      assert.deepEqual(payload, { text: "something is wrong!" });
    });
  });
});
