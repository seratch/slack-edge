import { OAuthErrorCode } from "./error-codes";
import { escapeHtml } from "./escape-html";

export function renderStartPage(url: string) {
  return (
    '<html><head><meta http-equiv="refresh" content="2;url=' +
    escapeHtml(url) +
    '" /><title>Redirecting to Slack ...</title></head><body>Redirecting to the Slack OAuth page ... Click <a href="' +
    escapeHtml(url) +
    '">here</a> to continue.</body></html>'
  );
}

export function renderErrorPage(installPath: string, reason: OAuthErrorCode) {
  return (
    '<html><head><style>body {{ padding: 10px 15px; font-family: verdana; text-align: center; }}</style></head><body><h2>Oops, Something Went Wrong!</h2><p>Please try again from <a href="' +
    escapeHtml(installPath) +
    '">here</a> or contact the app owner (reason: ' +
    escapeHtml(reason.message) +
    ")</p></body></html>"
  );
}

export function renderCompletionPage(
  appId: string,
  teamId: string,
  isEnterpriseInstall: boolean | undefined,
  enterpriseUrl: string | undefined
) {
  let url = `slack://app?team=${teamId}&id=${appId}`;
  if (isEnterpriseInstall && enterpriseUrl !== undefined) {
    url = `${enterpriseUrl}manage/organization/apps/profile/${appId}/workspaces/add"`;
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
