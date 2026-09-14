/**
 * Public company contact endpoints. These values intentionally come from Expo
 * public environment variables: they are not secrets, but they must never be
 * substituted with a broker's private contact details.
 */

function normalizeE164(value: string | undefined): string | null {
  const normalized = value?.trim().replace(/[\s()-]/g, '') ?? '';
  return /^\+[1-9]\d{7,14}$/.test(normalized) ? normalized : null;
}

// Keep these literal so Expo can inline them in native bundles.
const companyWhatsApp = normalizeE164(process.env.EXPO_PUBLIC_COMPANY_WHATSAPP);
const companyPhone = normalizeE164(process.env.EXPO_PUBLIC_COMPANY_PHONE);

export const CompanyContact = {
  whatsapp: companyWhatsApp,
  phone: companyPhone,
} as const;

export function companyWhatsAppUrl(message: string): string | null {
  if (!CompanyContact.whatsapp) return null;

  const number = CompanyContact.whatsapp.slice(1);
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
