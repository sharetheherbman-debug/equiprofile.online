/**
 * HTML escape / sanitisation utilities
 * Used to prevent XSS when rendering user-supplied content in HTML emails
 * or when echoing user input back in responses.
 */

const HTML_ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
};

/**
 * Escape HTML special characters.
 * Use before inserting user-supplied strings into HTML templates.
 */
export function sanitizeHtml(input: string): string {
  return input.replace(/[&<>"']/g, (c) => HTML_ESCAPE_MAP[c] ?? c);
}
