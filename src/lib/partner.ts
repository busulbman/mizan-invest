/**
 * Partner and management data access.
 *
 * Privileged state transitions intentionally use RPCs. Direct writes here are
 * limited to a partner's own draft and its English translation; RLS and the
 * database trigger enforce that boundary independently of this client code.
 */
import { supabase } from '@/lib/supabase';

export type PartnerApplicationStatus = 'pending' | 'approved' | 'rejected';
export type PartnerPropertyStatus = 'draft' | 'pending_review' | 'published' | 'unpublished' | 'archived';

export interface PartnerApplicationInput {
  applicantType: 'individual' | 'company';
  displayName: string;
  countryId: string;
  cityId?: string | null;
  languages: ('en' | 'ru' | 'ar' | 'tr')[];
  phone?: string;
  email?: string;
  about?: string;
  message?: string;
}

export interface PartnerApplication {
  id: string;
  applicantType: 'individual' | 'company';
  displayName: string;
  countryId: string;
  cityId: string | null;
  languages: ('en' | 'ru' | 'ar' | 'tr')[];
  status: PartnerApplicationStatus;
  rejectionReason: string | null;
  partnerId: string | null;
  createdAt: string;
  reviewedAt: string | null;
  // Only returned to the applicant or an admin by database RLS.
  phone?: string | null;
  email?: string | null;
  about?: string | null;
  message?: string | null;
}

export interface PartnerPlace {
  id: string;
  name: string;
  countryId?: string;
  countryCode?: string;
}

export interface PartnerPropertySummary {
  id: string;
  referenceCode: string;
  publicationStatus: PartnerPropertyStatus;
  title: string;
  priceAmount: number;
  priceCurrency: string;
  cityName: string;
  rejectionReason: string | null;
  submittedAt: string | null;
  updatedAt: string;
  /** Signed cover URL, resolved lazily by the list screen. */
  coverUrl?: string | null;
}

/** Every field the partner edit form can write. Mirrors CreatePartnerPropertyInput. */
export interface PartnerPropertyDetail extends CreatePartnerPropertyInput {
  id: string;
  referenceCode: string;
  publicationStatus: PartnerPropertyStatus;
  rejectionReason: string | null;
  submittedAt: string | null;
  updatedAt: string;
}

/** A partner may only add media to, or edit, a listing in one of these states. */
export function isEditableStatus(status: PartnerPropertyStatus): boolean {
  return status === 'draft' || status === 'unpublished';
}

export interface CreatePartnerPropertyInput {
  partnerId: string;
  countryId: string;
  cityId: string;
  propertyType: 'apartment' | 'villa' | 'land' | 'commercial';
  listingStatus: 'available' | 'reserved' | 'sold';
  price: number;
  priceCurrency: 'USD' | 'SAR' | 'AED' | 'TRY' | 'RUB' | 'EUR' | 'GBP';
  bedrooms: number;
  bathrooms: number;
  areaSqm?: number | null;
  parkingSpaces?: number;
  hasPool?: boolean;
  hasSecurity?: boolean;
  hasGarden?: boolean;
  hasSeaView?: boolean;
  hasCityView?: boolean;
  yearBuilt?: number | null;
  title: string;
  description?: string;
}

function fail(error: { message: string } | null, label: string): void {
  if (error) throw new Error(`[${label}] ${error.message}`);
}

function mapApplication(row: Record<string, unknown>): PartnerApplication {
  return {
    id: String(row.id),
    applicantType: row.applicant_type as PartnerApplication['applicantType'],
    displayName: String(row.display_name),
    countryId: String(row.country_id),
    cityId: row.city_id as string | null,
    languages: (row.languages ?? []) as PartnerApplication['languages'],
    status: row.status as PartnerApplicationStatus,
    rejectionReason: row.rejection_reason as string | null,
    partnerId: row.partner_id as string | null,
    createdAt: String(row.created_at),
    reviewedAt: row.reviewed_at as string | null,
    phone: row.phone as string | null,
    email: row.email as string | null,
    about: row.about as string | null,
    message: row.message as string | null,
  };
}

export async function submitPartnerApplication(input: PartnerApplicationInput): Promise<string> {
  const { data, error } = await supabase.rpc('submit_partner_application', {
    p_applicant_type: input.applicantType,
    p_display_name: input.displayName.trim(),
    p_country_id: input.countryId,
    p_city_id: input.cityId ?? null,
    p_languages: input.languages,
    p_phone: input.phone?.trim() || null,
    p_email: input.email?.trim() || null,
    p_about: input.about?.trim() || null,
    p_message: input.message?.trim() || null,
  });
  fail(error, 'submit_partner_application');
  return String(data);
}

export async function getMyPartnerApplications(): Promise<PartnerApplication[]> {
  const { data, error } = await supabase
    .from('partner_applications')
    .select('id, applicant_type, display_name, country_id, city_id, languages, status, rejection_reason, partner_id, created_at, reviewed_at')
    .order('created_at', { ascending: false });
  fail(error, 'getMyPartnerApplications');
  return (data ?? []).map((row) => mapApplication(row));
}

export async function getCountriesForPartnerForm(): Promise<PartnerPlace[]> {
  const { data, error } = await supabase
    .from('countries')
    .select('id, iso2, country_translations!inner(language, name)')
    .eq('country_translations.language', 'en')
    .eq('is_active', true)
    .order('iso2');
  fail(error, 'getCountriesForPartnerForm');
  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.country_translations?.[0]?.name ?? row.iso2.toUpperCase(),
    countryCode: row.iso2,
  }));
}

export async function getCitiesForPartnerForm(countryId: string): Promise<PartnerPlace[]> {
  const { data, error } = await supabase
    .from('cities')
    .select('id, country_id, city_translations!inner(language, name)')
    .eq('country_id', countryId)
    .eq('city_translations.language', 'en')
    .eq('is_active', true)
    .order('slug');
  fail(error, 'getCitiesForPartnerForm');
  return (data ?? []).map((row) => ({ id: row.id, name: row.city_translations?.[0]?.name ?? row.id, countryId: row.country_id }));
}

export async function getPartnerProperties(partnerId: string, status?: PartnerPropertyStatus): Promise<PartnerPropertySummary[]> {
  let query = supabase
    .from('properties')
    .select('id, reference_code, publication_status, price_amount, price_currency, rejection_reason, submitted_at, updated_at, property_translations!inner(language, title), cities!inner(city_translations!inner(language, name))')
    .eq('partner_id', partnerId)
    .eq('property_translations.language', 'en')
    .eq('cities.city_translations.language', 'en')
    .is('deleted_at', null)
    .order('updated_at', { ascending: false });
  if (status) query = query.eq('publication_status', status);
  const { data, error } = await query;
  fail(error, 'getPartnerProperties');
  return (data ?? []).map((row) => ({
    id: row.id,
    referenceCode: row.reference_code,
    publicationStatus: row.publication_status as PartnerPropertyStatus,
    title: row.property_translations?.[0]?.title ?? row.reference_code,
    priceAmount: Number(row.price_amount),
    priceCurrency: row.price_currency,
    cityName: row.cities?.[0]?.city_translations?.[0]?.name ?? '—',
    rejectionReason: row.rejection_reason,
    submittedAt: row.submitted_at,
    updatedAt: row.updated_at,
  }));
}

export async function createPartnerDraft(input: CreatePartnerPropertyInput): Promise<string> {
  const minorUnits = Math.round(input.price * 100);
  if (!Number.isFinite(minorUnits) || minorUnits <= 0) throw new Error('A valid positive price is required.');
  const { data: property, error: propertyError } = await supabase
    .from('properties')
    .insert({
      partner_id: input.partnerId,
      country_id: input.countryId,
      city_id: input.cityId,
      property_type: input.propertyType,
      listing_status: input.listingStatus,
      publication_status: 'draft',
      price_amount: minorUnits,
      price_currency: input.priceCurrency,
      bedrooms: input.bedrooms,
      bathrooms: input.bathrooms,
      area_sqm: input.areaSqm ?? null,
      parking_spaces: input.parkingSpaces ?? 0,
      has_pool: input.hasPool ?? false,
      has_security: input.hasSecurity ?? false,
      has_garden: input.hasGarden ?? false,
      has_sea_view: input.hasSeaView ?? false,
      has_city_view: input.hasCityView ?? false,
      year_built: input.yearBuilt ?? null,
    })
    .select('id')
    .single();
  fail(propertyError, 'createPartnerDraft');
  if (!property) throw new Error('[createPartnerDraft] Draft was not returned by the database.');

  const { error: translationError } = await supabase.from('property_translations').insert({
    property_id: property.id,
    language: 'en',
    title: input.title.trim(),
    description: input.description?.trim() || null,
  });
  fail(translationError, 'createPartnerDraftTranslation');
  return property.id;
}

/**
 * Reads one property with every field the edit form writes.
 *
 * RLS decides visibility: a partner sees only their own rows, so a mistyped or
 * foreign id returns nothing rather than leaking that the listing exists.
 */
export async function getPartnerPropertyDetail(propertyId: string): Promise<PartnerPropertyDetail | null> {
  const { data, error } = await supabase
    .from('properties')
    // One string literal, not a concatenation: supabase-js infers the row type
    // from the literal, and `+` collapses it to an error type.
    .select(
      `id, reference_code, partner_id, country_id, city_id, property_type, listing_status, publication_status,
       price_amount, price_currency, bedrooms, bathrooms, area_sqm, parking_spaces, has_pool, has_security,
       has_garden, has_sea_view, has_city_view, year_built, rejection_reason, submitted_at, updated_at,
       property_translations ( language, title, description )`
    )
    .eq('id', propertyId)
    .is('deleted_at', null)
    .maybeSingle();
  fail(error, 'getPartnerPropertyDetail');
  if (!data) return null;

  const english = (data.property_translations ?? []).find(
    (row: { language: string }) => row.language === 'en'
  );

  return {
    id: data.id,
    referenceCode: data.reference_code,
    publicationStatus: data.publication_status as PartnerPropertyStatus,
    rejectionReason: data.rejection_reason,
    submittedAt: data.submitted_at,
    updatedAt: data.updated_at,
    partnerId: data.partner_id,
    countryId: data.country_id,
    cityId: data.city_id,
    propertyType: data.property_type,
    listingStatus: data.listing_status,
    // Stored as integer minor units; the form works in major units.
    price: Number(data.price_amount) / 100,
    priceCurrency: data.price_currency,
    bedrooms: Number(data.bedrooms ?? 0),
    bathrooms: Number(data.bathrooms ?? 0),
    areaSqm: data.area_sqm === null ? null : Number(data.area_sqm),
    parkingSpaces: Number(data.parking_spaces ?? 0),
    hasPool: Boolean(data.has_pool),
    hasSecurity: Boolean(data.has_security),
    hasGarden: Boolean(data.has_garden),
    hasSeaView: Boolean(data.has_sea_view),
    hasCityView: Boolean(data.has_city_view),
    yearBuilt: data.year_built === null ? null : Number(data.year_built),
    title: english?.title ?? '',
    description: english?.description ?? '',
  };
}

/**
 * Saves an editable draft.
 *
 * `partner_id`, `publication_status`, `verified`, `featured` and every
 * investment metric are deliberately absent from the update payload: the
 * database guard trigger rejects a partner touching them, and sending them
 * would turn a normal save into a permission error.
 */
export async function updatePartnerDraft(
  propertyId: string,
  input: Omit<CreatePartnerPropertyInput, 'partnerId'>
): Promise<void> {
  const minorUnits = Math.round(input.price * 100);
  if (!Number.isFinite(minorUnits) || minorUnits <= 0) throw new Error('A valid positive price is required.');

  const { error: propertyError } = await supabase
    .from('properties')
    .update({
      country_id: input.countryId,
      city_id: input.cityId,
      property_type: input.propertyType,
      listing_status: input.listingStatus,
      price_amount: minorUnits,
      price_currency: input.priceCurrency,
      bedrooms: input.bedrooms,
      bathrooms: input.bathrooms,
      area_sqm: input.areaSqm ?? null,
      parking_spaces: input.parkingSpaces ?? 0,
      has_pool: input.hasPool ?? false,
      has_security: input.hasSecurity ?? false,
      has_garden: input.hasGarden ?? false,
      has_sea_view: input.hasSeaView ?? false,
      has_city_view: input.hasCityView ?? false,
      year_built: input.yearBuilt ?? null,
    })
    .eq('id', propertyId);
  fail(propertyError, 'updatePartnerDraft');

  // upsert on (property_id, language) so a listing that somehow lost its
  // English row is repaired rather than failing the save.
  const { error: translationError } = await supabase
    .from('property_translations')
    .upsert(
      {
        property_id: propertyId,
        language: 'en',
        title: input.title.trim(),
        description: input.description?.trim() || null,
      },
      { onConflict: 'property_id,language' }
    );
  fail(translationError, 'updatePartnerDraftTranslation');
}

export async function submitPropertyForReview(propertyId: string): Promise<void> {
  const { error } = await supabase.rpc('submit_property_for_review', { p_property_id: propertyId });
  fail(error, 'submit_property_for_review');
}

export async function getAdminPartnerApplications(): Promise<PartnerApplication[]> {
  const { data, error } = await supabase
    .from('partner_applications')
    .select('id, applicant_type, display_name, country_id, city_id, languages, phone, email, about, message, status, rejection_reason, partner_id, created_at, reviewed_at')
    .order('created_at', { ascending: true });
  fail(error, 'getAdminPartnerApplications');
  return (data ?? []).map((row) => mapApplication(row));
}

export async function reviewPartnerApplication(id: string, decision: 'approved' | 'rejected', rejectionReason?: string): Promise<string | null> {
  const { data, error } = await supabase.rpc('review_partner_application', {
    p_application_id: id,
    p_decision: decision,
    p_rejection_reason: rejectionReason?.trim() || null,
  });
  fail(error, 'review_partner_application');
  return data ? String(data) : null;
}

export async function getAdminProperties(status?: PartnerPropertyStatus): Promise<PartnerPropertySummary[]> {
  // Admin RLS exposes all rows; properties are grouped by partner only in the
  // management UI, never returned through the public catalogue service.
  let query = supabase
    .from('properties')
    .select('id, reference_code, publication_status, price_amount, price_currency, rejection_reason, submitted_at, updated_at, property_translations!inner(language, title), cities!inner(city_translations!inner(language, name))')
    .eq('property_translations.language', 'en')
    .eq('cities.city_translations.language', 'en')
    .is('deleted_at', null)
    .order('submitted_at', { ascending: true, nullsFirst: false });
  if (status) query = query.eq('publication_status', status);
  const { data, error } = await query;
  fail(error, 'getAdminProperties');
  return (data ?? []).map((row) => ({
    id: row.id, referenceCode: row.reference_code, publicationStatus: row.publication_status as PartnerPropertyStatus,
    title: row.property_translations?.[0]?.title ?? row.reference_code,
    priceAmount: Number(row.price_amount), priceCurrency: row.price_currency,
    cityName: row.cities?.[0]?.city_translations?.[0]?.name ?? '—', rejectionReason: row.rejection_reason,
    submittedAt: row.submitted_at, updatedAt: row.updated_at,
  }));
}

export async function reviewProperty(id: string, decision: 'approved' | 'rejected' | 'archived', rejectionReason?: string): Promise<void> {
  const { error } = await supabase.rpc('review_property', {
    p_property_id: id,
    p_decision: decision,
    p_rejection_reason: rejectionReason?.trim() || null,
  });
  fail(error, 'review_property');
}

export interface ActivityItem { id: string; action: string; entityType: string; entityId: string; createdAt: string; }
export async function getAdminActivity(): Promise<ActivityItem[]> {
  const { data, error } = await supabase.from('activity_log').select('id, action, entity_type, entity_id, created_at').order('created_at', { ascending: false }).limit(100);
  fail(error, 'getAdminActivity');
  return (data ?? []).map((row) => ({ id: row.id, action: row.action, entityType: row.entity_type, entityId: row.entity_id, createdAt: row.created_at }));
}
