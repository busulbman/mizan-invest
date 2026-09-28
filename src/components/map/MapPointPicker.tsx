/**
 * ============================================
 * MAP POINT PICKER (PARTNER)
 * ============================================
 *
 * How a partner says where their property is: tap the map, or drag the pin.
 *
 * NO TYPED COORDINATES
 * There is deliberately no latitude/longitude text field. Asking a partner to
 * type 24.713552 invites a transposed digit that silently relocates a listing
 * to another country, and it is unusable on a phone.
 *
 * NO GPS, EVER
 * This picker never asks where the DEVICE is. A partner listing a villa is
 * usually sitting in an office somewhere else entirely, so the device position
 * is not merely unhelpful, it is misleading — and the app requests no location
 * permission at all. `expo-location` is not involved on this path.
 *
 * THE POINT STORED HERE IS ALWAYS THE REAL ONE
 * Even for `approximate`, the partner marks the true location and the DATABASE
 * generalises it for investors. Generalising at input time would destroy the
 * data the admin needs in order to review the listing, and would let the app —
 * rather than the server — decide a privacy question.
 */

import { Text, View } from 'react-native';
import MapView, { MapPressEvent, Marker, MarkerDragStartEndEvent } from 'react-native-maps';

import { AppIcon } from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';
import { makeStyles, useTheme } from '@/context/ThemeContext';
import type { LatLng, MapRegion } from '@/lib/propertyLocation';

export interface MapPointPickerProps {
  /** The chosen point, or null when nothing has been placed yet. */
  value: LatLng | null;
  onChange: (next: LatLng) => void;
  /** Where to open. Null means there is nothing sensible to show. */
  region: MapRegion | null;
  editable: boolean;
  height?: number;
}

export function MapPointPicker({ value, onChange, region, editable, height = 260 }: MapPointPickerProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useLanguage();

  // No city centroid and no existing pin: there is no honest starting view.
  // Saying so beats opening on a default that looks like a real answer — and
  // the draft still saves, because location is not required to save a draft.
  if (!region) {
    return (
      <View style={styles.fallback}>
        <AppIcon name="location" size="md" color={colors.textMuted} />
        <Text style={styles.fallbackText}>{t('mapNeedsCityFirst')}</Text>
      </View>
    );
  }

  const handlePress = (event: MapPressEvent) => {
    if (!editable) return;
    onChange(event.nativeEvent.coordinate);
  };

  const handleDragEnd = (event: MarkerDragStartEndEvent) => {
    if (!editable) return;
    onChange(event.nativeEvent.coordinate);
  };

  return (
    <View style={styles.wrap}>
      <View style={[styles.mapBox, { height }]}>
        <MapView
          style={styles.map}
          initialRegion={region}
          onPress={handlePress}
          showsUserLocation={false}
          showsMyLocationButton={false}
          toolbarEnabled={false}
        >
          {value ? (
            <Marker
              coordinate={value}
              draggable={editable}
              onDragEnd={handleDragEnd}
              pinColor={colors.error}
            />
          ) : null}
        </MapView>
      </View>

      <Text style={styles.hint}>
        {!editable ? t('locationLocked') : value ? t('mapAdjustHint') : t('mapTapToPlaceHint')}
      </Text>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  wrap: { gap: 6 },
  mapBox: {
    overflow: 'hidden',
    borderRadius: t.borderRadius.md,
    borderWidth: 1,
    borderColor: t.colors.border,
    backgroundColor: t.colors.surfaceAlt,
  },
  map: { flex: 1 },
  hint: { ...t.typography.tiny, color: t.colors.textMuted, lineHeight: 16 },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: t.spacing.lg,
    paddingHorizontal: t.spacing.md,
    borderRadius: t.borderRadius.md,
    borderWidth: 1,
    borderColor: t.colors.border,
    backgroundColor: t.colors.surfaceAlt,
  },
  fallbackText: { ...t.typography.caption, color: t.colors.textSecondary, textAlign: 'center' },
}));
