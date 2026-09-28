/**
 * ============================================
 * PROPERTY FORM
 * ============================================
 *
 * The single listing form. Add Property and Edit Property both render this, so
 * the two cannot drift apart again — previously Add collected 10 fields and
 * Edit collected 17, which forced a partner to create a half-empty draft and
 * then discover the rest.
 *
 * TYPE-DRIVEN
 * Which fields appear is decided by `propertyFields.ts`, not by this
 * component. Choosing Land removes bedrooms, bathrooms, parking, year built,
 * pool and garden, because those have no answer for a plot. Hiding is purely
 * presentational: those columns are NOT NULL DEFAULT 0, so a hidden field
 * persists the column default and no constraint is relaxed.
 *
 * VALIDATION LIVES HERE
 * `missingForSubmit` and `toPropertyInput` are exported from this module, so
 * both screens validate identically by construction rather than by discipline.
 *
 * NOT THE SECURITY BOUNDARY
 * `editable` only decides whether controls are offered. RLS plus the guard
 * trigger decide what the database accepts; a listing in pending_review,
 * published or archived is refused server-side regardless of what this
 * component renders.
 */

import { useCallback } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { AppIcon, BottomSheet, Button, SheetOption } from '@/components/ui';
import type { TranslationKey } from '@/constants/translations';
import { useLanguage } from '@/context/LanguageContext';
import { makeStyles, useTheme } from '@/context/ThemeContext';
import { displayNumeric, parseNumericInput, toNumber } from '@/lib/numberInput';
import { MapPointPicker } from '@/components/map';
import { CONTACT_INFO_ERROR, type CreatePartnerPropertyInput, type PartnerPlace } from '@/lib/partner';
import {
  LOCATION_PRECISIONS,
  regionFor,
  ZOOM_CITY,
  ZOOM_POINT,
  type LatLng,
  type LocationPrecision,
} from '@/lib/propertyLocation';
import {
  CURRENCIES,
  clearHiddenFields,
  LISTING_STATUS_LABEL_KEYS,
  LISTING_STATUSES,
  PROPERTY_TYPES,
  profileFor,
  showsAnyFeature,
  showsField,
  TYPE_LABEL_KEYS,
  type Currency,
  type ListingStatus,
  type PropertyType,
} from '@/lib/propertyFields';

/** Every value is held as a string so partially-typed input is never lost. */
export interface PropertyFormValues {
  countryId: string;
  cityId: string;
  propertyType: PropertyType;
  listingStatus: ListingStatus;
  currency: Currency;
  title: string;
  description: string;
  price: string;
  area: string;
  bedrooms: string;
  bathrooms: string;
  parking: string;
  yearBuilt: string;
  hasPool: boolean;
  hasSecurity: boolean;
  hasGarden: boolean;
  hasSeaView: boolean;
  hasCityView: boolean;
  highlights: string[];
  /** How precisely investors may be shown this location. */
  locationPrecision: LocationPrecision;
  /** The REAL point. Null until the partner places one, and for city_only. */
  point: LatLng | null;
}

export function emptyPropertyForm(): PropertyFormValues {
  return {
    countryId: '',
    cityId: '',
    propertyType: 'apartment',
    listingStatus: 'available',
    currency: 'SAR',
    title: '',
    description: '',
    price: '',
    area: '',
    bedrooms: '0',
    bathrooms: '1',
    parking: '0',
    yearBuilt: '',
    hasPool: false,
    hasSecurity: false,
    hasGarden: false,
    hasSeaView: false,
    hasCityView: false,
    highlights: [],
    // Matches the column default. The safer of the two map-bearing options:
    // a partner who never touches this setting does not publish an exact point.
    locationPrecision: 'approximate',
    point: null,
  };
}

/**
 * Fields the review queue needs before a listing is worth an admin's time.
 *
 * Type-aware: Land is never asked for a bedroom count it does not display.
 * Returns translation keys so the caller renders them in the user's language.
 */
export function missingForSubmit(values: PropertyFormValues): TranslationKey[] {
  const missing: TranslationKey[] = [];
  if (!values.countryId) missing.push('country');
  if (!values.cityId) missing.push('city');
  if (!values.title.trim()) missing.push('titleField');

  const price = toNumber(values.price);
  if (price === null || price <= 0) missing.push('price');

  const area = toNumber(values.area);
  if (area === null || area <= 0) missing.push(profileFor(values.propertyType).areaLabelKey);

  // A listing that claims an exact or approximate location must actually carry
  // a point: an admin cannot review a precision claim backed by nothing. A
  // city_only listing needs no pin at all — the city IS the location.
  if (values.locationPrecision !== 'city_only' && !values.point) missing.push('propertyPoint');

  return missing;
}

/** The looser rule for saving a draft: only what the database itself refuses. */
export function missingForDraft(values: PropertyFormValues): TranslationKey[] {
  const missing: TranslationKey[] = [];
  if (!values.countryId) missing.push('country');
  if (!values.cityId) missing.push('city');
  if (!values.title.trim()) missing.push('titleField');
  const price = toNumber(values.price);
  if (price === null || price <= 0) missing.push('price');
  return missing;
}

/**
 * Converts form values into the shape the data layer writes.
 *
 * Hidden fields are normalised through `clearHiddenFields` first, so switching
 * a listing from Apartment to Land cannot leave three bedrooms behind on a row
 * whose form no longer shows them.
 */
export function toPropertyInput(
  values: PropertyFormValues
): Omit<CreatePartnerPropertyInput, 'partnerId'> {
  const normalised = clearHiddenFields(values, values.propertyType);
  const area = toNumber(normalised.area);
  const year = toNumber(normalised.yearBuilt);

  return {
    countryId: normalised.countryId,
    cityId: normalised.cityId,
    propertyType: normalised.propertyType,
    listingStatus: normalised.listingStatus,
    price: toNumber(normalised.price) ?? 0,
    priceCurrency: normalised.currency,
    bedrooms: toNumber(normalised.bedrooms) ?? 0,
    bathrooms: toNumber(normalised.bathrooms) ?? 0,
    areaSqm: area,
    parkingSpaces: toNumber(normalised.parking) ?? 0,
    hasPool: normalised.hasPool,
    hasSecurity: normalised.hasSecurity,
    hasGarden: normalised.hasGarden,
    locationPrecision: normalised.locationPrecision,
    // city_only is normalised to NULL in the data layer too; sending it here
    // keeps the form's intent explicit rather than relying on that alone.
    latitude: normalised.locationPrecision === 'city_only' ? null : normalised.point?.latitude ?? null,
    longitude: normalised.locationPrecision === 'city_only' ? null : normalised.point?.longitude ?? null,
    hasSeaView: normalised.hasSeaView,
    hasCityView: normalised.hasCityView,
    yearBuilt: year,
    title: normalised.title,
    description: normalised.description,
    highlights: normalised.highlights,
  };
}

/**
 * Turns a save failure into something a partner can act on.
 *
 * The database refuses a phone number or email address in a title, description
 * or highlight, which is what keeps the broker model intact. That arrives as an
 * unreadable constraint violation, so it is translated here; anything else is
 * shown as-is.
 */
export function describeSaveError(error: unknown, t: (key: TranslationKey) => string): string {
  if (error instanceof Error && error.message === CONTACT_INFO_ERROR) {
    return t('highlightContainsContact');
  }
  return error instanceof Error ? error.message : t('pleaseTryAgain');
}

export type SheetKind = 'country' | 'city' | 'type' | 'currency' | 'listing' | 'precision' | null;

/** User-facing labels. The enum names never reach the screen. */
export const PRECISION_LABEL_KEYS: Record<LocationPrecision, TranslationKey> = {
  exact: 'precisionExact',
  approximate: 'precisionApproximate',
  city_only: 'precisionCityOnly',
};

export const PRECISION_HELP_KEYS: Record<LocationPrecision, TranslationKey> = {
  exact: 'precisionExactHelp',
  approximate: 'precisionApproximateHelp',
  city_only: 'precisionCityOnlyHelp',
};

export interface PropertyFormProps {
  values: PropertyFormValues;
  onChange: (next: PropertyFormValues) => void;
  editable: boolean;
  countries: PartnerPlace[];
  cities: PartnerPlace[];
  /** Called when the country changes so the caller can reload cities. */
  onCountrySelected: (countryId: string) => void;
  sheet: SheetKind;
  onSheetChange: (next: SheetKind) => void;
}

export function PropertyForm({
  values,
  onChange,
  editable,
  countries,
  cities,
  onCountrySelected,
  sheet,
  onSheetChange,
}: PropertyFormProps) {
  const styles = useStyles();
  const { t } = useLanguage();
  const { colors } = useTheme();
  const profile = profileFor(values.propertyType);

  const patch = useCallback(
    (next: Partial<PropertyFormValues>) => onChange({ ...values, ...next }),
    [onChange, values]
  );

  /** Changing type normalises away anything the new type does not collect. */
  const selectType = (propertyType: PropertyType) => {
    onChange(clearHiddenFields({ ...values, propertyType }, propertyType));
    onSheetChange(null);
  };

  /**
   * Changing the city DROPS the pin.
   *
   * A pin belongs to the city it was placed in. Keeping it would leave a
   * listing labelled Jeddah with a point in Riyadh — and because the map opens
   * on the pin, the partner would likely never scroll far enough to notice. The
   * cost of clearing is one extra tap; the cost of keeping is a wrong location
   * that looks deliberate.
   */
  const selectCity = (cityId: string) => {
    const cityChanged = cityId !== values.cityId;
    onChange({ ...values, cityId, point: cityChanged ? null : values.point });
    onSheetChange(null);
  };

  /** Changing country invalidates the city, and therefore the pin too. */
  const selectCountry = (countryId: string) => {
    onChange({ ...values, countryId, cityId: '', point: null });
    onCountrySelected(countryId);
    onSheetChange(null);
  };

  /**
   * Switching to city_only DISCARDS the stored point.
   *
   * The partner is saying this location should not be pinpointed. Retaining a
   * precise coordinate "just in case" would keep data we have promised not to
   * use, and the data layer writes NULL for city_only regardless — so holding
   * it in the form would only mislead the partner about what is saved.
   */
  const selectPrecision = (locationPrecision: LocationPrecision) => {
    const dropPin = locationPrecision === 'city_only';
    onChange({ ...values, locationPrecision, point: dropPin ? null : values.point });
    onSheetChange(null);
  };

  const shows = (field: Parameters<typeof showsField>[1]) => showsField(values.propertyType, field);

  const countryLabel = countries.find((item) => item.id === values.countryId)?.name ?? t('selectCountry');
  const selectedCity = cities.find((item) => item.id === values.cityId);
  const cityLabel = selectedCity?.name ?? t('selectCity');

  /**
   * Where the picker opens: the existing pin when editing, otherwise the city
   * centroid. Null when neither exists — a city seeded without a centroid — and
   * the picker renders a prompt instead of a map rather than inventing a place.
   */
  const pickerRegion = values.point
    ? regionFor(values.point, ZOOM_POINT)
    : selectedCity?.center
      ? regionFor(selectedCity.center, ZOOM_CITY)
      : null;

  return (
    <View style={styles.form}>
      {/* ---------------- Basics ---------------- */}
      <Text style={styles.section}>{t('basicsSection')}</Text>

      <Picker
        label={t('propertyType')}
        value={t(TYPE_LABEL_KEYS[values.propertyType])}
        onPress={() => onSheetChange('type')}
        disabled={!editable}
      />
      <Field
        label={t('titleEnglish')}
        value={values.title}
        onChangeText={(v) => patch({ title: v })}
        editable={editable}
      />
      <Field
        label={t('descriptionEnglish')}
        value={values.description}
        onChangeText={(v) => patch({ description: v })}
        multiline
        editable={editable}
      />

      {/* ---------------- Location ---------------- */}
      <Text style={styles.section}>{t('locationSection')}</Text>
      <Picker label={t('country')} value={countryLabel} onPress={() => onSheetChange('country')} disabled={!editable} />
      <Picker
        label={t('city')}
        value={cityLabel}
        onPress={() => onSheetChange('city')}
        disabled={!editable || !values.countryId}
      />

      <Picker
        label={t('locationVisibility')}
        value={t(PRECISION_LABEL_KEYS[values.locationPrecision])}
        onPress={() => onSheetChange('precision')}
        disabled={!editable}
      />
      <Text style={styles.help}>{t(PRECISION_HELP_KEYS[values.locationPrecision])}</Text>

      {/* city_only needs no pin, so no picker is shown at all — offering one
          would invite a point this listing has promised not to keep. */}
      {values.locationPrecision !== 'city_only' ? (
        <>
          {values.locationPrecision === 'approximate' ? (
            <Text style={styles.privacyNotice}>{t('approximatePrivacyNotice')}</Text>
          ) : null}
          <MapPointPicker
            value={values.point}
            onChange={(point) => patch({ point })}
            region={pickerRegion}
            editable={editable}
          />
        </>
      ) : null}

      {/* ---------------- Pricing ---------------- */}
      <Text style={styles.section}>{t('pricingSection')}</Text>
      <View style={styles.row}>
        <View style={styles.grow}>
          <Field
            label={t('price')}
            value={displayNumeric(values.price)}
            onChangeText={(v) => patch({ price: parseNumericInput(v) })}
            keyboardType="decimal-pad"
            editable={editable}
          />
        </View>
        <View style={styles.narrow}>
          <Picker
            label={t('currency')}
            value={values.currency}
            onPress={() => onSheetChange('currency')}
            disabled={!editable}
          />
        </View>
      </View>
      <Picker
        label={t('availability')}
        value={t(LISTING_STATUS_LABEL_KEYS[values.listingStatus])}
        onPress={() => onSheetChange('listing')}
        disabled={!editable}
      />

      {/* ---------------- Details (type-driven) ---------------- */}
      <Text style={styles.section}>{t('detailsSection')}</Text>

      {/* One column, four meanings: the label follows the type so the stored
          numbers stay comparable across listings. */}
      <Field
        label={t(profile.areaLabelKey)}
        value={displayNumeric(values.area)}
        onChangeText={(v) => patch({ area: parseNumericInput(v) })}
        keyboardType="decimal-pad"
        editable={editable}
      />

      {(shows('bedrooms') || shows('bathrooms')) && (
        <View style={styles.row}>
          {shows('bedrooms') && (
            <View style={styles.grow}>
              <Field
                label={t('bedrooms')}
                value={values.bedrooms}
                onChangeText={(v) => patch({ bedrooms: parseNumericInput(v) })}
                keyboardType="number-pad"
                editable={editable}
              />
            </View>
          )}
          {shows('bathrooms') && (
            <View style={styles.grow}>
              <Field
                label={t('bathrooms')}
                value={values.bathrooms}
                onChangeText={(v) => patch({ bathrooms: parseNumericInput(v) })}
                keyboardType="number-pad"
                editable={editable}
              />
            </View>
          )}
        </View>
      )}

      {(shows('parkingSpaces') || shows('yearBuilt')) && (
        <View style={styles.row}>
          {shows('parkingSpaces') && (
            <View style={styles.grow}>
              <Field
                label={t('parkingSpaces')}
                value={values.parking}
                onChangeText={(v) => patch({ parking: parseNumericInput(v) })}
                keyboardType="number-pad"
                editable={editable}
              />
            </View>
          )}
          {shows('yearBuilt') && (
            <View style={styles.grow}>
              <Field
                label={t('yearBuiltOptional')}
                value={values.yearBuilt}
                onChangeText={(v) => patch({ yearBuilt: parseNumericInput(v) })}
                keyboardType="number-pad"
                editable={editable}
              />
            </View>
          )}
        </View>
      )}

      {/* ---------------- Features (type-driven) ---------------- */}
      {showsAnyFeature(values.propertyType) && (
        <>
          <Text style={styles.section}>{t('features')}</Text>
          <View style={styles.toggles}>
            {shows('hasPool') && (
              <Toggle label={t('pool')} value={values.hasPool} onToggle={() => patch({ hasPool: !values.hasPool })} disabled={!editable} />
            )}
            {shows('hasGarden') && (
              <Toggle label={t('garden')} value={values.hasGarden} onToggle={() => patch({ hasGarden: !values.hasGarden })} disabled={!editable} />
            )}
            {shows('hasSecurity') && (
              <Toggle label={t('security')} value={values.hasSecurity} onToggle={() => patch({ hasSecurity: !values.hasSecurity })} disabled={!editable} />
            )}
            {shows('hasSeaView') && (
              <Toggle label={t('seaView')} value={values.hasSeaView} onToggle={() => patch({ hasSeaView: !values.hasSeaView })} disabled={!editable} />
            )}
            {shows('hasCityView') && (
              <Toggle label={t('cityView')} value={values.hasCityView} onToggle={() => patch({ hasCityView: !values.hasCityView })} disabled={!editable} />
            )}
          </View>
        </>
      )}

      {/* ---------------- Highlights ---------------- */}
      <Text style={styles.section}>{t('highlights')}</Text>
      <Text style={styles.note}>{t('highlightsNote')}</Text>
      {values.highlights.map((entry, index) => (
        <View key={index} style={styles.highlightRow}>
          <View style={styles.grow}>
            <Field
              label=""
              value={entry}
              placeholder={t(profile.highlightsHintKey)}
              onChangeText={(v) => {
                const next = [...values.highlights];
                next[index] = v;
                patch({ highlights: next });
              }}
              editable={editable}
            />
          </View>
          {editable && (
            <Pressable
              onPress={() => patch({ highlights: values.highlights.filter((_, i) => i !== index) })}
              accessibilityRole="button"
              accessibilityLabel={t('remove')}
              hitSlop={8}
              style={styles.highlightRemove}
            >
              <AppIcon name="close" size="xs" color={colors.error} />
            </Pressable>
          )}
        </View>
      ))}
      {editable && values.highlights.length < 12 && (
        <Button
          title={t('addHighlight')}
          variant="secondary"
          size="sm"
          icon="create"
          fullWidth={false}
          onPress={() => patch({ highlights: [...values.highlights, ''] })}
        />
      )}

      {/* ---------------- Sheets ---------------- */}
      <BottomSheet visible={sheet === 'type'} onClose={() => onSheetChange(null)} title={t('propertyType')}>
        {PROPERTY_TYPES.map((item) => (
          <SheetOption
            key={item}
            label={t(TYPE_LABEL_KEYS[item])}
            active={item === values.propertyType}
            onPress={() => selectType(item)}
          />
        ))}
      </BottomSheet>

      <BottomSheet visible={sheet === 'country'} onClose={() => onSheetChange(null)} title={t('country')}>
        {countries.map((item) => (
          <SheetOption
            key={item.id}
            label={item.name}
            active={item.id === values.countryId}
            onPress={() => selectCountry(item.id)}
          />
        ))}
      </BottomSheet>

      <BottomSheet visible={sheet === 'city'} onClose={() => onSheetChange(null)} title={t('city')}>
        {cities.map((item) => (
          <SheetOption
            key={item.id}
            label={item.name}
            active={item.id === values.cityId}
            onPress={() => selectCity(item.id)}
          />
        ))}
      </BottomSheet>

      <BottomSheet
        visible={sheet === 'precision'}
        onClose={() => onSheetChange(null)}
        title={t('locationVisibility')}
      >
        {LOCATION_PRECISIONS.map((item) => (
          <SheetOption
            key={item}
            label={t(PRECISION_LABEL_KEYS[item])}
            active={item === values.locationPrecision}
            onPress={() => selectPrecision(item)}
          />
        ))}
      </BottomSheet>

      <BottomSheet visible={sheet === 'listing'} onClose={() => onSheetChange(null)} title={t('availability')}>
        {LISTING_STATUSES.map((item) => (
          <SheetOption
            key={item}
            label={t(LISTING_STATUS_LABEL_KEYS[item])}
            active={item === values.listingStatus}
            onPress={() => {
              patch({ listingStatus: item });
              onSheetChange(null);
            }}
          />
        ))}
      </BottomSheet>

      <BottomSheet visible={sheet === 'currency'} onClose={() => onSheetChange(null)} title={t('currency')}>
        {CURRENCIES.map((item) => (
          <SheetOption
            key={item}
            label={item}
            active={item === values.currency}
            onPress={() => {
              patch({ currency: item });
              onSheetChange(null);
            }}
          />
        ))}
      </BottomSheet>
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  multiline,
  keyboardType,
  placeholder,
  editable = true,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  multiline?: boolean;
  keyboardType?: 'default' | 'decimal-pad' | 'number-pad';
  placeholder?: string;
  editable?: boolean;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        style={[styles.input, multiline && styles.multiline, !editable && styles.disabled]}
        multiline={multiline}
        keyboardType={keyboardType}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
      />
    </View>
  );
}

function Picker({
  label,
  value,
  onPress,
  disabled,
}: {
  label: string;
  value: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const styles = useStyles();
  return (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" style={[styles.select, disabled && styles.disabled]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value} numberOfLines={1}>
        {value}
      </Text>
    </Pressable>
  );
}

function Toggle({
  label,
  value,
  onToggle,
  disabled,
}: {
  label: string;
  value: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onToggle}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      style={[styles.toggle, value && styles.toggleOn, disabled && styles.disabled]}
    >
      <AppIcon name={value ? 'check' : 'close'} size="xs" color={value ? colors.onAccent : colors.textMuted} />
      <Text style={[styles.toggleLabel, value && styles.toggleLabelOn]}>{label}</Text>
    </Pressable>
  );
}

const useStyles = makeStyles((t) => ({
  form: { gap: t.spacing.smd },
  section: {
    ...t.typography.label,
    color: t.colors.accent,
    marginTop: t.spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  label: { ...t.typography.label, color: t.colors.textSecondary, marginBottom: 6 },
  note: { ...t.typography.tiny, color: t.colors.textMuted, lineHeight: 16 },
  input: {
    minHeight: 48,
    paddingHorizontal: t.spacing.md,
    borderRadius: t.borderRadius.md,
    borderWidth: 1,
    borderColor: t.colors.border,
    color: t.colors.text,
    backgroundColor: t.colors.surface,
    ...t.typography.body,
  },
  multiline: { minHeight: 100, paddingTop: 12, textAlignVertical: 'top' },
  help: { ...t.typography.tiny, color: t.colors.textMuted, lineHeight: 16, marginTop: -4 },
  privacyNotice: {
    ...t.typography.tiny,
    color: t.colors.text,
    lineHeight: 16,
    padding: t.spacing.sm,
    borderRadius: t.borderRadius.md,
    borderWidth: 1,
    borderColor: t.colors.accent,
    backgroundColor: t.colors.surfaceAlt,
  },
  select: {
    minHeight: 54,
    paddingHorizontal: t.spacing.md,
    justifyContent: 'center',
    borderRadius: t.borderRadius.md,
    borderWidth: 1,
    borderColor: t.colors.border,
    backgroundColor: t.colors.surface,
  },
  value: { ...t.typography.bodyBold, color: t.colors.text },
  row: { flexDirection: 'row', gap: t.spacing.sm },
  grow: { flex: 1, minWidth: 0 },
  narrow: { width: 116 },
  toggles: { flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.sm },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: t.spacing.smd,
    paddingVertical: 9,
    borderRadius: t.borderRadius.full,
    borderWidth: 1,
    borderColor: t.colors.border,
    backgroundColor: t.colors.surface,
  },
  toggleOn: { borderColor: t.colors.accent, backgroundColor: t.colors.accent },
  toggleLabel: { ...t.typography.caption, color: t.colors.textSecondary },
  toggleLabelOn: { color: t.colors.onAccent, fontWeight: '700' },
  highlightRow: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm },
  highlightRemove: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: t.borderRadius.sm,
    borderWidth: 1,
    borderColor: t.colors.border,
    backgroundColor: t.colors.surface,
  },
  disabled: { opacity: 0.5 },
}));

export default PropertyForm;
