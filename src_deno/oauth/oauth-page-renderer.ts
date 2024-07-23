import { OAuthErrorCode } from "./error-codes.ts";
import { escapeHtml } from "./escape-html.ts";

interface OAuthStartPageRendererArgs {
  url: string;
  immediateRedirect: boolean;
}
/**
 * Start page (/slack/install) content renderer.
 */
export type OAuthStartPageRenderer = (
  args: OAuthStartPageRendererArgs,
) => Promise<string>;

/**
 * Generates an HTML data for the /slack/install page.
 * @param url the URL to start the OAuth flow
 * @returns HTML data
 */
// deno-lint-ignore require-await
export async function renderDefaultOAuthStartPage(
  { url, immediateRedirect }: OAuthStartPageRendererArgs,
) {
  const meta = immediateRedirect
    ? `<meta http-equiv="refresh" content="2;url=${escapeHtml(url)}'" />`
    : "";
  return (
    "<html>" +
    "<head>" +
    meta +
    "<title>Redirecting to Slack ...</title>" +
    "</head>" +
    '<body>Redirecting to the Slack OAuth page ... Click <a href="' +
    escapeHtml(url) +
    '">here</a> to continue.</body>' +
    "</html>"
  );
}

interface OAuthErrorPageRendererArgs {
  installPath: string;
  reason: OAuthErrorCode;
}
/**
 * Error page content renderer.
 */
export type OAuthErrorPageRenderer = (
  args: OAuthErrorPageRendererArgs,
) => Promise<string>;

/**
 * Generates an HTML data indicating an error for the /slack/oauth_redirect page.
 * @param installPath the path to start the OAuth flow again
 * @param reason the error reason code
 * @returns HTML data
 */
// deno-lint-ignore require-await
export async function renderDefaultOAuthErrorPage(
  { installPath, reason }: OAuthErrorPageRendererArgs,
) {
  return (
    '<html><head><style>body {{ padding: 10px 15px; font-family: verdana; text-align: center; }}</style></head><body><h2>Oops, Something Went Wrong!</h2><p>Please try again from <a href="' +
    escapeHtml(installPath) +
    '">here</a> or contact the app owner (reason: ' +
    escapeHtml(reason.message) +
    ")</p></body></html>"
  );
}

interface OAuthCompletionPageRendererArgs {
  appId: string;
  teamId: string;
  isEnterpriseInstall: boolean | undefined;
  enterpriseUrl: string | undefined;
}
/**
 * Error page content renderer.
 */
export type OAuthCompletionPageRenderer = (
  args: OAuthCompletionPageRendererArgs,
) => Promise<string>;

/**
 * Generates an HTML data indicating app installation successfully completed for the /slack/oauth_redirect page.
 * @param appId the app's ID
 * @param teamId workspace ID to head to
 * @param isEnterpriseInstall org-wide installation or not
 * @param enterpriseUrl the management console URL for Enterprise Grid admins
 * @returns HTML data
 */
// deno-lint-ignore require-await
export async function renderDefaultOAuthCompletionPage({
  appId,
  teamId,
  isEnterpriseInstall,
  enterpriseUrl,
}: OAuthCompletionPageRendererArgs) {
  let url = `slack://app?team=${teamId}&id=${appId}`;
  if (isEnterpriseInstall && enterpriseUrl !== undefined) {
    url =
      `${enterpriseUrl}manage/organization/apps/profile/${appId}/workspaces/add"`;
  }
  const browserUrl = `https://app.slack.com/client/${teamId}`;
  return (
    '<html><head><meta http-equiv="refresh" content="0; URL=' +
    escapeHtml(url) +
    '"><style>body {{ padding: 10px 15px; font-family: verdana; text-align: center; }}</style></head><body><h2>Thank you!</h2><p>Redirecting to the Slack App... click <a href="' +
    escapeHtml(url) +
    '">here</a>. If you use the browser version of Slack, click <a href="' +
    escapeHtml(browserUrl) +
    '" target="_blank">this link</a> instead.</p></body></html>'
  );
}
