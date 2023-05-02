export interface OAuthErrorCode {
  code: string;
  message: string;
}

export const InvalidStateParameter: OAuthErrorCode = {
  code: "invalid-state",
  message: "The state parameter is missing or invalid",
};

export const MissingCode: OAuthErrorCode = {
  code: "missing-code",
  message: "The code parameter is missing",
};

export const InstallationError: OAuthErrorCode = {
  code: "installation-error",
  message: "The installation process failed",
};

export const InstallationStoreError: OAuthErrorCode = {
  code: "installation-store-error",
  message: "Saving the installation data failed",
};

export const CompletionPageError: OAuthErrorCode = {
  code: "completion-page-failure",
  message: "Rendering the completion page failed",
};

export const OpenIDConnectError: OAuthErrorCode = {
  code: "oidc-error",
  message: "The OpenID Connect process failed",
};
