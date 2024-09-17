import { SlackAppEnv } from "../app-env";
import { isAssitantThreadEvent } from "../context/context";
import { AssistantEventLazyHandler, AssistantMessageEventRequest, AssistantThreadEventRequest, EventLazyHandler } from "../handler/handler";
import { AssistantThreadContextChangedEvent, AssistantThreadStartedEvent } from "../request/payload/event";
import { AssistantThreadContextStore } from "./thread-context-store";

export type AssistantThreadStartedHandler<E extends SlackAppEnv> = AssistantEventLazyHandler<AssistantThreadStartedEvent, E>;

export type AssistantThreadContextChangedHandler<E extends SlackAppEnv> = AssistantEventLazyHandler<AssistantThreadContextChangedEvent, E>;

export type AssistantUserMessageHandler<E extends SlackAppEnv> = (req: AssistantMessageEventRequest<E>) => Promise<void>;

export interface AssistantOptions<E extends SlackAppEnv> {
  threadContextStore?: AssistantThreadContextStore;
  threadStarted?: AssistantThreadStartedHandler<E>;
  threadContextChanged?: AssistantThreadContextChangedHandler<E>;
  userMessage?: AssistantUserMessageHandler<E>;
}

export class Assistant<E extends SlackAppEnv> {
  threadContextStore?: AssistantThreadContextStore;
  threadStartedHandler: EventLazyHandler<"assistant_thread_started", E>;
  threadContextChangedHandler: EventLazyHandler<"assistant_thread_context_changed", E>;
  userMessageHandler: EventLazyHandler<"message", E>;

  constructor(options: AssistantOptions<E> = {}) {
    this.threadContextStore = options.threadContextStore;
    this.threadStartedHandler = async (req) => {
      try {
        if (isAssitantThreadEvent(req.body)) {
          const request = req as unknown as AssistantThreadEventRequest<E, AssistantThreadStartedEvent>;
          if (options.threadStarted) {
            await options.threadStarted(request);
          } else {
            const { say, setSuggestedPrompts } = request.context;
            await say({ text: ":wave: Hi, how can I help you today?" });
            await setSuggestedPrompts({ title: "New chat", prompts: ["What does SLACK stand for?"] });
          }
        }
      } catch (e: unknown) {
        console.error(`Failed to execute threadStartedHandler listener: ${(e as Error).stack}`);
      }
    };
    this.threadContextChangedHandler = async (req) => {
      try {
        if (isAssitantThreadEvent(req.body)) {
          const request = req as unknown as AssistantThreadEventRequest<E, AssistantThreadContextChangedEvent>;
          if (options.threadContextChanged) {
            await options.threadContextChanged(request);
          } else {
            // the defualt implementation
            const { context } = request;
            await context.saveThreadContextStore({ ...request.payload.assistant_thread.context });
          }
        }
      } catch (e: unknown) {
        console.error(`Failed to execute threadContextChangedHandler listener: ${(e as Error).stack}`);
      }
    };
    this.userMessageHandler = async (req) => {
      try {
        if (req.payload.subtype === undefined || req.payload.subtype === "file_share") {
          if (options.userMessage) {
            await options.userMessage(req as AssistantMessageEventRequest<E>);
          }
        }
      } catch (e: unknown) {
        console.error(`Failed to execute userMessageHandler listener: ${(e as Error).stack}`);
      }
    };
  }

  threadStarted(handler: AssistantThreadStartedHandler<E>) {
    this.threadStartedHandler = async (req) => {
      try {
        if (isAssitantThreadEvent(req.body)) {
          await handler(req as unknown as AssistantThreadEventRequest<E, AssistantThreadStartedEvent>);
        }
      } catch (e: unknown) {
        console.error(`Failed to execute threadStartedHandler listener: ${(e as Error).stack}`);
      }
    };
  }
  threadContextChanged(handler: AssistantThreadContextChangedHandler<E>) {
    this.threadContextChangedHandler = async (req) => {
      try {
        if (isAssitantThreadEvent(req.body)) {
          await handler(req as unknown as AssistantThreadEventRequest<E, AssistantThreadContextChangedEvent>);
        }
      } catch (e: unknown) {
        console.error(`Failed to execute threadContextChangedHandler listener: ${(e as Error).stack}`);
      }
    };
  }
  userMessage(handler: AssistantUserMessageHandler<E>) {
    this.userMessageHandler = async (req) => {
      try {
        if (req.payload.subtype === undefined || req.payload.subtype === "file_share") {
          await handler(req as AssistantMessageEventRequest<E>);
        }
      } catch (e: unknown) {
        console.error(`Failed to execute userMessageHandler listener: ${(e as Error).stack}`);
      }
    };
  }
}
