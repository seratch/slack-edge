/**
 * Escapes special characters in HTML data for security.
 * @param input input string
 * @returns safe string
 */
export function escapeHtml(input: string | undefined | null): string {
  if (input) {
    return input.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(
      />/g,
      "&gt;",
    ).replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
  }
  return "";
}
