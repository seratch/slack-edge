import {
  AnyActionBlockElementType,
  AnyModalBlock,
  PlainTextField,
  RichTextBlock,
} from "https://deno.land/x/slack_web_api_client@0.8.0/mod.ts";

export interface ViewStateSelectedOption {
  text: PlainTextField;
  value: string;
}

export interface UploadedFile {
  id: string;
  created: number;
  timestamp: number;
  name: string;
  title: string;
  filetype: string;
  mimetype: string;
  permalink: string;
  url_private: string;
  url_private_download: string;
  user: string;
  user_team: string;
  username?: string;
  access?: string;
  alt_txt?: string;
  app_id?: string;
  app_name?: string;
  bot_id?: string;
  channel_actions_count?: number;
  channel_actions_ts?: string;
  channels?: string[];
  comments_count?: number;
  converted_pdf?: string;
  deanimate?: string;
  deanimate_gif?: string;
  display_as_bot?: boolean;
  duration_ms?: number;
  edit_link?: string;
  editable?: boolean;
  editor?: string;
  external_id?: string;
  external_type?: string;
  external_url?: string;
  file_access?: string;
  groups?: string[];
  has_more?: boolean;
  has_more_shares?: boolean;
  has_rich_preview?: boolean;
  hls?: string;
  hls_embed?: string;
  image_exif_rotation?: number;
  ims?: string[];
  is_channel_space?: boolean;
  is_external?: boolean;
  is_public?: boolean;
  is_starred?: boolean;
  last_editor?: string;
  last_read?: number;
  lines?: number;
  lines_more?: number;
  linked_channel_id?: string;
  media_display_type?: string;
  mode?: string;
  mp4?: string;
  mp4_low?: string;
  non_owner_editable?: boolean;
  num_stars?: number;
  org_or_workspace_access?: string;
  original_attachment_count?: number;
  original_h?: number;
  original_w?: number;
  permalink_public?: string;
  pinned_to?: string[];
  pjpeg?: string;
  plain_text?: string;
  pretty_type?: string;
  preview?: string;
  preview_highlight?: string;
  preview_is_truncated?: boolean;
  preview_plain_text?: string;
  private_channels_with_file_access_count?: number;
  public_url_shared?: boolean;
  simplified_html?: string;
  size?: number;
  source_team?: string;
  subject?: string;
  subtype?: string;
  thumb_1024?: string;
  thumb_1024_gif?: string;
  thumb_1024_h?: string;
  thumb_1024_w?: string;
  thumb_160?: string;
  thumb_160_gif?: string;
  thumb_160_h?: string;
  thumb_160_w?: string;
  thumb_360?: string;
  thumb_360_gif?: string;
  thumb_360_h?: string;
  thumb_360_w?: string;
  thumb_480?: string;
  thumb_480_gif?: string;
  thumb_480_h?: string;
  thumb_480_w?: string;
  thumb_64?: string;
  thumb_64_gif?: string;
  thumb_64_h?: string;
  thumb_64_w?: string;
  thumb_720?: string;
  thumb_720_gif?: string;
  thumb_720_h?: string;
  thumb_720_w?: string;
  thumb_80?: string;
  thumb_800?: string;
  thumb_800_gif?: string;
  thumb_800_h?: string;
  thumb_800_w?: string;
  thumb_80_gif?: string;
  thumb_80_h?: string;
  thumb_80_w?: string;
  thumb_960?: string;
  thumb_960_gif?: string;
  thumb_960_h?: string;
  thumb_960_w?: string;
  thumb_gif?: string;
  thumb_pdf?: string;
  thumb_pdf_h?: string;
  thumb_pdf_w?: string;
  thumb_tiny?: string;
  thumb_video?: string;
  thumb_video_h?: number;
  thumb_video_w?: number;
  updated?: number;
  url_static_preview?: string;
  vtt?: string;
}

export interface ViewStateValue {
  type: AnyActionBlockElementType;
  value?: string;
  selected_date?: string;
  selected_time?: string;
  selected_date_time?: number;
  selected_conversation?: string;
  selected_channel?: string;
  selected_user?: string;
  selected_option?: ViewStateSelectedOption;
  selected_conversations?: string[];
  selected_channels?: string[];
  selected_users?: string[];
  selected_options?: ViewStateSelectedOption[];
  timezone?: string; // timepicker
  rich_text_value?: RichTextBlock; // rich_text_input
  files?: UploadedFile[];
}

export interface DataSubmissionView {
  id: string;
  callback_id: string;
  team_id: string;
  app_installed_team_id?: string;
  app_id: string | null;
  bot_id: string;
  title: PlainTextField;
  type: string;
  blocks: AnyModalBlock[];
  close: PlainTextField | null;
  submit: PlainTextField | null;
  state: {
    values: {
      [blockId: string]: {
        [actionId: string]: ViewStateValue;
      };
    };
  };
  hash: string;
  private_metadata: string;
  root_view_id: string | null;
  previous_view_id: string | null;
  clear_on_close: boolean;
  notify_on_close: boolean;
  external_id?: string;
}
