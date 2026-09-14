/**
 * ============================================
 * CURRENCY & PRICE FORMATTING
 * ============================================
 *
 * Listing prices are stored in USD. The user picks a display currency
 * and every price on screen is converted through this module.
 *
 * DEMO ONLY — the rates below are fixed constants. There is no live FX
 * API and none should be added for the partner demo; the UI labels the
 * rates as demo values (`demoExchangeRate` translation key).
 *
 * Never build a price string by hand in a screen. Use `formatPrice`
 * (compact, for cards) or `formatPriceFull` (exact, for detail views) so
 * the symbol, separators and rounding stay consistent everywhere.
 */

export type CurrencyCode = 'USD' | 'TRY' | 'RUB';

export const CURRENCY_ORDER: CurrencyCode[] = ['USD', 'TRY', 'RUB'];

interface CurrencyDefinition {
  code: CurrencyCode;
  symbol: string;
  /** Units of this currency per 1 USD */
  rate: number;
  /** Thousands separator used by the currency's home locale */
  groupSeparator: string;
  /** Symbol goes before the number for all three supported currencies */
  symbolFirst: boolean;
}

export const currencies: Record<CurrencyCode, CurrencyDefinition> = {
  USD: { code: 'USD', symbol: '$', rate: 1, groupSeparator: ',', symbolFirst: true },
  TRY: { code: 'TRY', symbol: '₺', rate: 47, groupSeparator: '.', symbolFirst: true },
  RUB: { code: 'RUB', symbol: '₽', rate: 86, groupSeparator: ' ', symbolFirst: true },
};

/** Converts a USD amount into the target currency */
export function convert(usd: number, currency: CurrencyCode): number {
  return usd * currencies[currency].rate;
}

/** Groups an integer with the currency's own separator */
function group(value: number, separator: string): string {
  return Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, separator);
}

function withSymbol(body: string, def: CurrencyDefinition): string {
  return def.symbolFirst ? `${def.symbol}${body}` : `${body} ${def.symbol}`;
}

/**
 * Exact price — "$250,000", "₺11.750.000", "₽21 500 000".
 * Used where the number itself is the content (detail header, filters).
 */
export function formatPriceFull(usd: number, currency: CurrencyCode = 'USD'): string {
  const def = currencies[currency];
  return withSymbol(group(convert(usd, currency), def.groupSeparator), def);
}

/**
 * Compact price — "$250K", "₺11.8M".
 * Used on cards, where a full nine-digit rouble figure would overflow
 * the row. Always pair with `numberOfLines={1}`.
 */
export function formatPrice(usd: number, currency: CurrencyCode = 'USD'): string {
  const def = currencies[currency];
  const value = convert(usd, currency);

  if (value >= 1_000_000_000) {
    return withSymbol(`${(value / 1_000_000_000).toFixed(1)}B`, def);
  }
  if (value >= 1_000_000) {
    return withSymbol(`${(value / 1_000_000).toFixed(1)}M`, def);
  }
  if (value >= 1_000) {
    return withSymbol(`${Math.round(value / 1_000)}K`, def);
  }
  return withSymbol(group(value, def.groupSeparator), def);
}

/** Monthly rental income — "$4,800" plus the caller's own "/mo" label */
export function formatIncome(usd: number, currency: CurrencyCode = 'USD'): string {
  return formatPriceFull(usd, currency);
}

/** Human-readable demo rate line, e.g. "1 USD = 47 TRY" */
export function rateLabel(currency: CurrencyCode): string {
  if (currency === 'USD') return '1 USD = 1 USD';
  return `1 USD = ${currencies[currency].rate} ${currency}`;
}
