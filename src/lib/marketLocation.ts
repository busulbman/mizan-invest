/** One-time, foreground-only market suggestion. Coordinates are never stored. */

import * as Location from 'expo-location';

import type { MarketCode } from '@/constants/markets';

export interface MarketLocationSuggestion {
  market: MarketCode;
  permissionGranted: boolean;
}

export async function suggestMarketFromDevice(): Promise<MarketLocationSuggestion> {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (permission.status !== 'granted') {
    return { market: null, permissionGranted: false };
  }

  // This object remains scoped to this function and is discarded immediately
  // after reverse geocoding. No latitude/longitude enters state or storage.
  const position = await Location.getCurrentPositionAsync({});
  const addresses = await Location.reverseGeocodeAsync({
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  });
  const country = addresses[0]?.isoCountryCode?.toLowerCase();

  return {
    market: country === 'sa' || country === 'ae' ? country : null,
    permissionGranted: true,
  };
}
