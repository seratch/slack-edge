import { EventRequest, MessageEventHandler } from "../app.ts";
import { SlackAppEnv } from "../app-env.ts";
import {
  BlockAction,
  BlockElementActions,
  BlockElementTypes,
} from "../request/payload/block-action.ts";
import { BlockSuggestion } from "../request/payload/block-suggestion.ts";
import { GlobalShortcut } from "../request/payload/global-shortcut.ts";
import { MessageShortcut } from "../request/payload/message-shortcut.ts";
import { SlashCommand } from "../request/payload/slash-command.ts";
import { ViewClosed } from "../request/payload/view-closed.ts";
import { ViewSubmission } from "../request/payload/view-submission.ts";
import {
  SlackRequest,
  SlackRequestWithOptionalRespond,
  SlackRequestWithRespond,
} from "../request/request.ts";
import { SlackResponse } from "../response/response.ts";
import { MessageAckResponse } from "./message-handler.ts";
import { OptionsAckResponse } from "./options-handler.ts";
import { ViewAckResponse } from "./view-handler.ts";

export type AckResponse = SlackResponse | string | void;

export interface SlackHandler<E extends SlackAppEnv, Payload> {
  ack(request: SlackRequest<E, Payload>): Promise<AckResponse>;
  lazy(request: SlackRequest<E, Payload>): Promise<void>;
}

// ----------------------------------------
// Slash commands
// ----------------------------------------

export type SlashCommandAckHandler<E extends SlackAppEnv = SlackAppEnv> = (
  req: SlackRequestWithRespond<E, SlashCommand>,
) => Promise<MessageAckResponse>;

export type SlashCommandLazyHandler<E extends SlackAppEnv = SlackAppEnv> = (
  req: SlackRequestWithRespond<E, SlashCommand>,
) => Promise<void>;

// ----------------------------------------
// Events API
// ----------------------------------------

export type EventLazyHandler<
  Type extends string,
  E extends SlackAppEnv = SlackAppEnv,
> = (req: EventRequest<E, Type>) => Promise<void>;

export type MessageEventLazyHandler<E extends SlackAppEnv = SlackAppEnv> =
  MessageEventHandler<E>;

// ----------------------------------------
// Shortcuts
// ----------------------------------------

export type ShortcutAckHandler<E extends SlackAppEnv = SlackAppEnv> = (
  req:
    | SlackRequest<E, GlobalShortcut>
    | SlackRequestWithRespond<E, MessageShortcut>,
) => Promise<AckResponse>;

export type GlobalShortcutAckHandler<E extends SlackAppEnv = SlackAppEnv> = (
  req: SlackRequest<E, GlobalShortcut>,
) => Promise<AckResponse>;

export type MessageShortcutAckHandler<E extends SlackAppEnv = SlackAppEnv> = (
  req: SlackRequestWithRespond<E, MessageShortcut>,
) => Promise<AckResponse>;

export type ShortcutLazyHandler<E extends SlackAppEnv = SlackAppEnv> = (
  req:
    | SlackRequest<E, GlobalShortcut>
    | SlackRequestWithRespond<E, MessageShortcut>,
) => Promise<void>;

export type GlobalShortcutLazyHandler<E extends SlackAppEnv = SlackAppEnv> = (
  req: SlackRequest<E, GlobalShortcut>,
) => Promise<void>;

export type MessageShortcutLazyHandler<E extends SlackAppEnv = SlackAppEnv> = (
  req: SlackRequestWithRespond<E, MessageShortcut>,
) => Promise<void>;

// ----------------------------------------
// Block Kit actions
// ----------------------------------------

export type BlockActionAckHandler<
  T extends BlockElementTypes,
  E extends SlackAppEnv = SlackAppEnv,
  A extends BlockAction<
    Extract<BlockElementActions, { type: T }>
  > = BlockAction<Extract<BlockElementActions, { type: T }>>,
> = (req: SlackRequestWithOptionalRespond<E, A>) => Promise<AckResponse>;

export type BlockActionLazyHandler<
  T extends BlockElementTypes,
  E extends SlackAppEnv = SlackAppEnv,
  A extends BlockAction<
    Extract<BlockElementActions, { type: T }>
  > = BlockAction<Extract<BlockElementActions, { type: T }>>,
> = (req: SlackRequestWithOptionalRespond<E, A>) => Promise<void>;

export type BlockSuggestionAckHandler<E extends SlackAppEnv = SlackAppEnv> = (
  req: SlackRequest<E, BlockSuggestion>,
) => Promise<OptionsAckResponse>;

// ----------------------------------------
// View submission/closed
// ----------------------------------------

export type ViewAckHandler<E extends SlackAppEnv = SlackAppEnv> = (
  req:
    | SlackRequestWithOptionalRespond<E, ViewSubmission>
    | SlackRequest<E, ViewClosed>,
) => Promise<ViewAckResponse>;

export type ViewSubmissionAckHandler<E extends SlackAppEnv = SlackAppEnv> = (
  req: SlackRequestWithOptionalRespond<E, ViewSubmission>,
) => Promise<ViewAckResponse>;

export type ViewClosedAckHandler<E extends SlackAppEnv = SlackAppEnv> = (
  req: SlackRequest<E, ViewClosed>,
) => Promise<ViewAckResponse>;

export type ViewLazyHandler<E extends SlackAppEnv = SlackAppEnv> = (
  req:
    | SlackRequestWithOptionalRespond<E, ViewSubmission>
    | SlackRequest<E, ViewClosed>,
) => Promise<void>;

export type ViewSubmissionLazyHandler<E extends SlackAppEnv = SlackAppEnv> = (
  req: SlackRequestWithOptionalRespond<E, ViewSubmission>,
) => Promise<void>;

export type ViewClosedLazyHandler<E extends SlackAppEnv = SlackAppEnv> = (
  req: SlackRequest<E, ViewClosed>,
) => Promise<void>;
