/**
 * Error code representing an error that can occur during the OAuth flow.
 */
export interface OAuthErrorCode {
  code: string;
  message: string;
}

/**
 * The state parameter is invalid.
 */
export const InvalidStateParameter: OAuthErrorCode = {
  code: "invalid-state",
  message: "The state parameter is missing or invalid",
};

/**
 * The code parameter is missing.
 */
export const MissingCode: OAuthErrorCode = {
  code: "missing-code",
  message: "The code parameter is missing",
};

/**
 * The app installation failed for some reason.
 */
export const InstallationError: OAuthErrorCode = {
  code: "installation-error",
  message: "The installation process failed",
};

/**
 * The InstallationStore throwed an excetion.
 */
export const InstallationStoreError: OAuthErrorCode = {
  code: "installation-store-error",
  message: "Saving the installation data failed",
};

/**
 * Failed to render the pre-defined completion page.
 */
export const CompletionPageError: OAuthErrorCode = {
  code: "completion-page-failure",
  message: "Rendering the completion page failed",
};

/**
 * Something was wrong with OpenID Connect (Sign in with Slack).
 */
export const OpenIDConnectError: OAuthErrorCode = {
  code: "oidc-error",
  message: "The OpenID Connect process failed",
};
