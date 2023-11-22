import {
  isDebugLogEnabled,
  SlackAPIClient,
} from "https://deno.land/x/slack_web_api_client@0.7.2/mod.ts";
import { SlackApp } from "../app.ts";
import { ConfigError, SocketModeError } from "../errors.ts";
import { ExecutionContext } from "../execution-context.ts";
import { SlackSocketModeAppEnv } from "../app-env.ts";

// TODO: Implement proper reconnection logic
// TODO: Add connection monitor like 1st party SDKs do
// TODO: Add Bun support (the runtime does not work well with Socket Mode)
export class SocketModeClient {
  public app: SlackApp<SlackSocketModeAppEnv>;
  public appLevelToken: string;
  public ws: WebSocket | undefined;

  constructor(
    // deno-lint-ignore no-explicit-any
    app: SlackApp<any>,
  ) {
    if (!app.socketMode) {
      throw new ConfigError(
        "socketMode: true must be set for running with Socket Mode",
      );
    }
    if (!app.appLevelToken) {
      throw new ConfigError(
        "appLevelToken must be set for running with Socket Mode",
      );
    }
    this.app = app as SlackApp<SlackSocketModeAppEnv>;
    this.appLevelToken = app.appLevelToken;

    console.warn(
      "WARNING: The Socket Mode support provided by slack-edge is still experimental and is not designed to handle reconnections for production-grade applications. It is recommended to use this mode only for local development and testing purposes.",
    );
  }

  async connect() {
    const client = new SlackAPIClient(this.appLevelToken);
    try {
      const newConnection = await client.apps.connections.open();
      this.ws = new WebSocket(newConnection.url!);
    } catch (e) {
      throw new SocketModeError(
        `Failed to establish a new WSS connection: ${e}`,
      );
    }
    if (this.ws) {
      const ws = this.ws;
      // deno-lint-ignore require-await
      ws.onopen = async (ev) => {
        // TODO: make this customizable
        if (isDebugLogEnabled(app.env.SLACK_LOGGING_LEVEL)) {
          console.log(
            `Now the Socket Mode client is connected to Slack: ${
              JSON.stringify(
                ev,
              )
            }`,
          );
        }
      };
      // deno-lint-ignore require-await
      ws.onclose = async (ev) => {
        // TODO: make this customizable
        if (isDebugLogEnabled(app.env.SLACK_LOGGING_LEVEL)) {
          console.log(
            `The Socket Mode client is disconnected from Slack: ${
              JSON.stringify(
                ev,
              )
            }`,
          );
        }
      };
      // deno-lint-ignore require-await
      ws.onerror = async (e) => {
        // TODO: make this customizable
        console.error(
          `An error was thrown by the Socket Mode connection: ${e}`,
        );
      };

      const app = this.app;
      ws.onmessage = async (ev) => {
        try {
          if (
            ev.data &&
            typeof ev.data === "string" &&
            ev.data.startsWith("{")
          ) {
            const data = JSON.parse(ev.data);
            if (data.type === "hello") {
              if (isDebugLogEnabled(app.env.SLACK_LOGGING_LEVEL)) {
                console.log(`*** Received hello data ***\n ${ev.data}`);
              }
              return;
            }
            const payload = JSON.stringify(data.payload);
            console.log(payload);
            const request: Request = new Request(ws.url, {
              method: "POST",
              headers: new Headers({ "content-type": "application/json" }),
              body: new Blob([payload]).stream(),
            });
            const context: ExecutionContext = {
              // deno-lint-ignore require-await
              waitUntil: async (promise) => {
                promise
                  .then((res) => {
                    const result = res ? ": " + res : "";
                    console.info(
                      `Completed a lazy listener execution${result}`,
                    );
                  })
                  .catch((err) => {
                    console.error(`Failed to run a lazy listener: ${err}`);
                  });
              },
            };
            const response = await app.run(request, context);
            // deno-lint-ignore no-explicit-any
            let ack: any = { envelope_id: data.envelope_id };
            if (response.body) {
              const contentType = response.headers.get("Content-Type");
              if (contentType && contentType.startsWith("text/plain")) {
                const text = await response.text();
                ack = { envelope_id: data.envelope_id, payload: { text } };
              } else {
                const json = await response.json();
                ack = { envelope_id: data.envelope_id, payload: { ...json } };
              }
            }
            ws.send(JSON.stringify(ack));
          } else {
            if (isDebugLogEnabled(app.env.SLACK_LOGGING_LEVEL)) {
              console.log(`*** Received non-JSON data ***\n ${ev.data}`);
            }
          }
        } catch (e) {
          console.error(`Failed to handle a WebSocke message: ${e}`);
        }
      };
    }
  }

  // deno-lint-ignore require-await
  async disconnect(): Promise<void> {
    if (this.ws) {
      this.ws.close();
      this.ws = undefined;
    }
  }
}
