import {
  BotMessageEvent,
  FileShareMessageEvent,
  GenericMessageEvent,
  ThreadBroadcastMessageEvent,
} from "../request/payload/event";

export const isPostedMessageEvent = (event: {
  type: string;
  subtype?: string;
}): event is
  | GenericMessageEvent
  | BotMessageEvent
  | FileShareMessageEvent
  | ThreadBroadcastMessageEvent => {
  return (
    event.subtype === undefined ||
    event.subtype === "bot_message" ||
    event.subtype === "file_share" ||
    event.subtype === "thread_broadcast"
  );
};
