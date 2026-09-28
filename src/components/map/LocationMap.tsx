/**
 * ============================================
 * LOCATION MAP (READ-ONLY)
 * ============================================
 *
 * Renders whatever `property_location()` decided this caller may see. Shared by
 * the investor detail screen and admin review so there is exactly one place
 * where a location becomes pixels.
 *
 * IT BRANCHES ON displayKind, NEVER ON precision
 * `precision` is the partner's intent; `displayKind` is what the SERVER handed
 * this caller. For an investor looking at an `approximate` listing those differ
 * on purpose — precision says 'approximate', displayKind says 'area', and only
 * the second describes the data actually in hand. Branching on precision would
 * be how a pin ends up drawn on a point that was never meant to be precise.
 *
 *   'exact' -> Marker. A pin is honest here and nowhere else.
 *   'area'  -> Circle only, NO marker. The centre is a generalised cell centre,
 *              not the property; a pin on it would assert a precision the data
 *              does not have, which is the exact dishonesty this feature exists
 *              to prevent.
 *   'city'  -> neither. The map is simply centred on the city.
 *
 * NO MAP IS BETTER THAN A WRONG MAP
 * A null region (a city seeded without a centroid, a listing older than
 * coordinates) renders the textual fallback instead. Feeding NaN to MapView
 * gives a map of the Atlantic, which reads as real and is worse than nothing.
 *
 * Gestures are disabled: this sits inside a vertical ScrollView, and a
 * pan-enabled map would swallow the scroll.
 */

import { Text, View } from 'react-native';
import MapView, { Circle, Marker } from 'react-native-maps';

import { AppIcon } from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';
import { makeStyles, useTheme } from '@/context/ThemeContext';
import { regionForLocation, type PropertyLocation } from '@/lib/propertyLocation';

export interface LocationMapProps {
  location: PropertyLocation | null;
  /** Human place name, always shown — it is the fallback when there is no map. */
  placeLabel: string;
  /** Explains WHY the map looks the way it does. Hidden when empty. */
  note?: string;
  height?: number;
}

export function LocationMap({ location, placeLabel, note, height = 200 }: LocationMapProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useLanguage();

  const region = regionForLocation(location);

  if (!region || !location) {
    return (
      <View style={styles.fallback}>
        <AppIcon name="location" size="md" color={colors.textMuted} />
        <Text style={styles.fallbackPlace} numberOfLines={2}>
          {placeLabel}
        </Text>
        <Text style={styles.fallbackNote}>{t('locationMapUnavailable')}</Text>
      </View>
    );
  }

  const point = location.display;

  return (
    <View style={styles.wrap}>
      <View style={[styles.mapBox, { height }]}>
        <MapView
          style={styles.map}
          initialRegion={region}
          scrollEnabled={false}
          zoomEnabled={false}
          rotateEnabled={false}
          pitchEnabled={false}
          // Never the device's location: this screen is about the PROPERTY, and
          // the app requests no location permission at all.
          showsUserLocation={false}
          showsMyLocationButton={false}
        >
          {location.displayKind === 'exact' && point ? (
            <Marker coordinate={point} pinColor={colors.error} />
          ) : null}

          {location.displayKind === 'area' && point ? (
            <Circle
              center={point}
              radius={location.radiusM}
              strokeColor={colors.accent}
              fillColor="rgba(191,155,74,0.20)"
              strokeWidth={2}
            />
          ) : null}
        </MapView>
      </View>

      <View style={styles.caption}>
        <AppIcon name="location" size="xs" color={colors.textSecondary} />
        <Text style={styles.captionText} numberOfLines={2}>
          {placeLabel}
        </Text>
      </View>
      {note ? <Text style={styles.note}>{note}</Text> : null}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  wrap: { gap: 8 },
  mapBox: {
    overflow: 'hidden',
    borderRadius: t.borderRadius.lg,
    borderWidth: 1,
    borderColor: t.colors.border,
    backgroundColor: t.colors.surfaceAlt,
  },
  map: { flex: 1 },
  caption: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  captionText: { flex: 1, minWidth: 0, ...t.typography.caption, color: t.colors.textSecondary },
  note: { ...t.typography.tiny, color: t.colors.textMuted, lineHeight: 16 },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: t.spacing.lg,
    paddingHorizontal: t.spacing.md,
    borderRadius: t.borderRadius.lg,
    borderWidth: 1,
    borderColor: t.colors.border,
    backgroundColor: t.colors.surfaceAlt,
  },
  fallbackPlace: { ...t.typography.bodyBold, color: t.colors.text, textAlign: 'center' },
  fallbackNote: { ...t.typography.tiny, color: t.colors.textMuted, textAlign: 'center' },
}));
