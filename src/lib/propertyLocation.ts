/**
 * ============================================
 * PROPERTY LOCATION
 * ============================================
 *
 * The ONE place the app asks where a property is.
 *
 * WHY A LAYER AND NOT AN RPC CALL PER SCREEN
 * Raw `properties.latitude` / `longitude` are not granted to any client role
 * (migration 20260928100000), so `property_location()` is the only read path
 * that exists. Funnelling every screen through this module means the privacy
 * decision lives in one reviewable place: no screen can accidentally reach past
 * it, and adding a new screen cannot reopen the hole.
 *
 * WHAT THE CLIENT IS AND IS NOT TRUSTED WITH
 * The database decides precision, not the caller. An investor asking about an
 * `approximate` listing is GIVEN a generalised cell centre — the exact point is
 * never transmitted, so there is nothing for the UI to leak even if it tried.
 * `displayKind` is the server's instruction about how the answer may be drawn:
 *
 *   'exact'  a real point            -> a pin is honest
 *   'area'   a generalised centre    -> MUST be drawn as an area, never a pin
 *   'city'   no property point       -> city only
 *
 * Screens branch on `displayKind`, never on `precision`, because only
 * `displayKind` reflects what this caller actually received.
 */

import { supabase } from '@/lib/supabase';

/** Mirrors the `public.location_precision` enum. */
export const LOCATION_PRECISIONS = ['exact', 'approximate', 'city_only'] as const;
export type LocationPrecision = (typeof LOCATION_PRECISIONS)[number];

/** What the caller is permitted to draw. Decided server-side. */
export type LocationDisplayKind = 'exact' | 'area' | 'city';

export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface PropertyLocation {
  propertyId: string;
  /** The partner's stated intent. Public — an investor may know it is vague. */
  precision: LocationPrecision;
  /** How THIS caller's answer may be rendered. */
  displayKind: LocationDisplayKind;
  /**
   * For 'exact' the true point; for 'area' a generalised cell centre; for
   * 'city' null. Never the raw point of an approximate listing.
   */
  display: LatLng | null;
  /** Metres. > 0 only for 'area', where it is the circle that must be drawn. */
  radiusM: number;
  /** City centroid. Public knowledge, and the fallback when there is no point. */
  city: LatLng | null;
}

/** A numeric column arrives as a JSON number, but never assume it. */
function coord(latitude: unknown, longitude: unknown): LatLng | null {
  const lat = Number(latitude);
  const lng = Number(longitude);
  if (latitude === null || longitude === null) return null;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { latitude: lat, longitude: lng };
}

/**
 * Reads one property's location.
 *
 * `null` means "no location for you": an unknown id, a listing this caller may
 * not see, or an unpublished one seen by a non-owner. The function returns zero
 * rows for all of those deliberately, so they are indistinguishable from here —
 * the UI must not try to tell them apart either.
 */
export async function getPropertyLocation(propertyId: string): Promise<PropertyLocation | null> {
  const { data, error } = await supabase.rpc('property_location', { p_property_id: propertyId });
  if (error) throw new Error(`[getPropertyLocation] ${error.message}`);

  // `returns table` arrives as an array; zero rows is the "not allowed" answer.
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return null;

  return {
    propertyId: String(row.property_id),
    precision: row.location_precision as LocationPrecision,
    displayKind: row.display_kind as LocationDisplayKind,
    display: coord(row.display_latitude, row.display_longitude),
    radiusM: Number(row.radius_m ?? 0),
    city: coord(row.city_latitude, row.city_longitude),
  };
}

/**
 * ============================================
 * MAP REGIONS
 * ============================================
 */
export interface MapRegion extends LatLng {
  latitudeDelta: number;
  longitudeDelta: number;
}

/** Tight on a building. */
export const ZOOM_POINT = 0.006;
/** Wide enough that a ~790 m circle sits comfortably inside the frame. */
export const ZOOM_AREA = 0.05;
/** A city overview. */
export const ZOOM_CITY = 0.14;

export function regionFor(center: LatLng, delta: number): MapRegion {
  return {
    latitude: center.latitude,
    longitude: center.longitude,
    latitudeDelta: delta,
    longitudeDelta: delta,
  };
}

/**
 * The region to open at, and null when there is nothing safe to show.
 *
 * Null is a real and ordinary case — a city seeded without a centroid, or a
 * listing predating coordinates entirely — and callers must render text instead
 * of a map rather than guessing at a location or crashing on NaN.
 */
export function regionForLocation(location: PropertyLocation | null): MapRegion | null {
  if (!location) return null;
  if (location.displayKind === 'exact' && location.display) {
    return regionFor(location.display, ZOOM_POINT);
  }
  if (location.displayKind === 'area' && location.display) {
    return regionFor(location.display, ZOOM_AREA);
  }
  if (location.city) return regionFor(location.city, ZOOM_CITY);
  return null;
}
