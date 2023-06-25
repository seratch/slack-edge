export enum PayloadType {
  BlockAction = "block_actions",
  BlockSuggestion = "block_suggestion",
  MessageShortcut = "message_action",
  GlobalShortcut = "shortcut",
  EventsAPI = "event_callback",
  ViewSubmission = "view_submission",
  ViewClosed = "view_closed",
  // Note that Slash command payloads do not have "type" property
}
