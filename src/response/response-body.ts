import {
  AnyMessageBlock,
  MessageAttachment,
  MessageMetadata,
  AnyTextField,
  ModalView,
} from "slack-web-api-client";

export interface MessageResponse {
  response_type?: "ephemeral" | "in_channel";
  text: string;
  blocks?: AnyMessageBlock[];
  attachments?: MessageAttachment[];
  metadata?: MessageMetadata;
  thread_ts?: string;
}

export interface ViewUpdateResponse {
  response_action: "update";
  view: ModalView;
}

export interface ViewPushResponse {
  response_action: "push";
  view: ModalView;
}

export interface ViewClearResponse {
  response_action: "clear";
}

export interface ViewErrorsResponse {
  response_action: "errors";
  errors: { [blockId: string]: string };
}

export type ViewResponses =
  | ViewUpdateResponse
  | ViewPushResponse
  | ViewClearResponse
  | ViewErrorsResponse;

export interface Option {
  value: string;
  text: AnyTextField;
}

export interface OptionGroup {
  label: AnyTextField;
  options: Option[];
}

export interface OptionsResponse {
  options: Option[];
}
export interface OptionGroupsResponse {
  option_groups: OptionGroup[];
}

export type OptionsResponses = OptionsResponse | OptionGroupsResponse;
