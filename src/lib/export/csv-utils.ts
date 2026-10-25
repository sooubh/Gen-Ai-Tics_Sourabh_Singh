/**
 * CSV Sanitization and Escaping Utility
 * Defends against CSV Formula Injection (DDE attacks)
 */
export function escapeCsvField(val: any): string {
  if (val === undefined || val === null) return '""';
  let str = String(val).replace(/"/g, '""');
  // Formula injection defense - detects formula triggers even if preceded by whitespace
  // Covers =, +, -, @, \t, \r, %, |
  if (/^\s*[=+\-@\t\r%|]/.test(str)) {
    str = "'" + str;
  }
  return `"${str}"`;
}
