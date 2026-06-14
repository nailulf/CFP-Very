// Neutralize spreadsheet formula/CSV injection. Under the Sheets USER_ENTERED input
// mode, a value beginning with =, +, -, @ (or a leading control char) is interpreted
// as a live formula. Prefixing such values with an apostrophe forces plain text; the
// apostrophe itself is not displayed. Apply to any user-supplied cell value.
export function sanitizeCell(value: string): string {
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
}
