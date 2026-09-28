/**
 * Grouped numeric text input.
 *
 * A price like 56000000 is unreadable while typing it. These helpers show
 * 56,000,000 in the field while keeping a plain numeric string as the value
 * that reaches Supabase — the display format never becomes the stored value.
 *
 * Deliberately small: digit grouping only. No locale-specific separators, no
 * currency symbols in the field, no decimal handling beyond a single point.
 * `price_amount` is a bigint of minor units and `area_sqm` is numeric, so the
 * parse side must stay exact and boring.
 */

/** Strips grouping and anything that is not a digit or a single decimal point. */
export function parseNumericInput(text: string): string {
  const cleaned = text.replace(/[^0-9.]/g, '');
  const firstDot = cleaned.indexOf('.');
  if (firstDot === -1) return cleaned;
  // Keep only the first decimal point; later ones are typing noise.
  return cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, '');
}

/** Adds thousands separators to the integer part, leaving any decimals alone. */
export function formatGrouped(value: string): string {
  if (!value) return '';
  const [whole, decimals] = value.split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  // A trailing "." is preserved so the separator does not disappear mid-typing.
  if (decimals === undefined) return value.endsWith('.') ? `${grouped}.` : grouped;
  return `${grouped}.${decimals}`;
}

/**
 * What a grouped field should display for a stored raw value.
 *
 * Integers are grouped; a value still being typed ("56000000.") keeps its
 * trailing point so the caret does not jump.
 */
export function displayNumeric(raw: string): string {
  return formatGrouped(parseNumericInput(raw));
}

/** Finite, non-negative number from a raw field value, or null. */
export function toNumber(raw: string): number | null {
  if (!raw.trim()) return null;
  const parsed = Number(parseNumericInput(raw));
  return Number.isFinite(parsed) ? parsed : null;
}
