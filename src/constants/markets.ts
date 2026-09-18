import type { TranslationKey } from '@/constants/translations';

export type MarketCode = 'sa' | 'ae' | null;

export const MARKET_CODES = ['sa', 'ae'] as const;

export const MARKET_OPTIONS: ReadonlyArray<{
  code: MarketCode;
  countryKey: TranslationKey;
  flag: string;
  detailsKey: TranslationKey;
}> = [
  { code: 'sa', countryKey: 'countrySa', flag: '🇸🇦', detailsKey: 'marketSaudiDetails' },
  { code: 'ae', countryKey: 'countryAe', flag: '🇦🇪', detailsKey: 'marketUaeDetails' },
  { code: null, countryKey: 'allMarkets', flag: '🌍', detailsKey: 'marketAllDetails' },
];

export function isMarketCode(value: unknown): value is MarketCode {
  return value === 'sa' || value === 'ae' || value === null;
}
