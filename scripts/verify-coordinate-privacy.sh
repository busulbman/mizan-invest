#!/usr/bin/env bash
# =============================================================================
# Coordinate privacy verification — migration 20260928100000
# =============================================================================
# Runs the ANON half of the privacy battery against whichever Supabase instance
# .env points at, using ONLY the public publishable key. That is the whole
# point: this is the exact access an attacker has.
#
#   ./scripts/verify-coordinate-privacy.sh
#
# Tests 1-3 MUST fail (403) after the migration. If any of them returns 200,
# raw coordinates are still reachable and the migration has not taken effect.
# =============================================================================
set -u
set -a; . ./.env; set +a
U="$EXPO_PUBLIC_SUPABASE_URL/rest/v1"
K="$EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY"

probe() { # name expected_http url
  local code body
  body=$(curl -s -w $'\n%{http_code}' "$U$3" -H "apikey: $K")
  code=$(printf '%s' "$body" | tail -1)
  body=$(printf '%s' "$body" | sed '$d' | head -c 300)
  if [ "$code" = "$2" ]; then printf '  PASS  '; else printf '  FAIL  '; fi
  printf '%-46s HTTP %s (want %s)\n' "$1" "$code" "$2"
  printf '        %s\n' "$body"
}

echo "=== A. anon must NOT reach raw coordinates on properties ==="
probe "1 direct SELECT latitude,longitude"  403 "/properties?select=id,latitude,longitude&limit=3"
probe "2 FILTER on latitude"                403 "/properties?select=id&latitude=gt.-91&limit=3"
probe "3 ORDER BY longitude"                403 "/properties?select=id&order=longitude.asc&limit=3"

echo "=== B. anon must still read everything legitimate ==="
probe "4 normal published read"             200 "/properties?select=id,reference_code,location_precision,price_amount&limit=3"
probe "5 city centroids still public"       200 "/cities?select=slug,latitude,longitude&limit=3"

echo "=== C. the mediated path must work for anon ==="
echo "  (per-precision assertions run in verify-coordinate-privacy.mjs)"
