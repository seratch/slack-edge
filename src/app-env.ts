export type SlackAppLogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR";

export interface LoggingEnv {
  SLACK_LOGGING_LEVEL?: SlackAppLogLevel;
}

export type SlackAppEnv = LoggingEnv & {
  SLACK_SIGNING_SECRET?: string;
  SLACK_BOT_TOKEN?: string;
  SLACK_APP_TOKEN?: string;
};

export type SlackEdgeAppEnv = SlackAppEnv & {
  SLACK_SIGNING_SECRET: string;
  SLACK_BOT_TOKEN?: string;
};

export type SlackSocketModeAppEnv = SlackAppEnv & {
  SLACK_SIGNING_SECRET?: string;
  SLACK_BOT_TOKEN?: string;
  SLACK_APP_TOKEN: string;
};

export type SlackAppUserTokenResolutionType = "installer" | "actor";

export type SlackOAuthEnv = (SlackEdgeAppEnv | SlackSocketModeAppEnv) & {
  SLACK_CLIENT_ID: string;
  SLACK_CLIENT_SECRET: string;
  SLACK_BOT_SCOPES: string;
  SLACK_USER_SCOPES?: string;
  SLACK_REDIRECT_URI?: string;
  SLACK_OIDC_SCOPES?: string;
  SLACK_OIDC_REDIRECT_URI?: string;
  SLACK_USER_TOKEN_RESOLUTION?: SlackAppUserTokenResolutionType;
};

export type SlackOIDCEnv = SlackAppEnv & {
  SLACK_CLIENT_ID: string;
  SLACK_CLIENT_SECRET: string;
  SLACK_OIDC_SCOPES?: string;
  SLACK_OIDC_REDIRECT_URI: string;
};

export type SlackOAuthAndOIDCEnv = SlackOAuthEnv & SlackOIDCEnv;
