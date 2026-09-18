-- MIZAN INVEST — Fictional production demo data
--
-- This is an INSERT-only, idempotent seed script. It intentionally does not
-- alter schema, policies, existing properties, existing partners, or leads.
-- Reference codes and partner slugs are stable idempotency keys; re-running
-- the script does not create duplicate demo records.
--
-- The listings below are fictional seed content, not copied sale listings.
-- No partner contact details, coordinates, or storage paths are included.

begin;

-- 1. Public partner records. Contact data deliberately stays out of public
--    partners and private.partner_private is never touched.
insert into public.partners (
  slug,
  display_name,
  country_id,
  rating,
  verified,
  is_active
)
select
  v.slug,
  v.display_name,
  c.id,
  v.rating,
  v.verified,
  true
from (
  values
    ('mizan-demo-hejaz-horizons', 'Hejaz Horizons', 'sa', 4.8::numeric, true),
    ('mizan-demo-najd-foundations', 'Najd Foundations', 'sa', 4.4::numeric, false),
    ('mizan-demo-crescent-key', 'Crescent Key Properties', 'ae', 4.7::numeric, true),
    ('mizan-demo-canal-axis', 'Canal Axis Realty', 'ae', 4.3::numeric, false)
) as v(slug, display_name, country_iso2, rating, verified)
join public.countries c on c.iso2 = v.country_iso2
on conflict (slug) do nothing;

-- 2. Published listings. Money uses integer minor units. The trigger derives
--    price_usd_cents from the existing SAR/AED FX rates.
with seed (
  reference_code,
  partner_slug,
  country_iso2,
  city_slug,
  property_type,
  listing_status,
  price_amount,
  price_currency,
  bedrooms,
  bathrooms,
  area_sqm,
  parking_spaces,
  has_pool,
  has_security,
  has_garden,
  has_sea_view,
  has_city_view,
  year_built,
  featured,
  verified,
  roi_pct,
  rental_yield_pct,
  monthly_rent_usd_cents,
  amortization_years,
  investment_score,
  growth_score,
  risk_level,
  market_trend,
  published_at,
  created_at
) as (
  values
    ('MZ-DEMO-SA-001', 'mizan-demo-hejaz-horizons', 'sa', 'madinah', 'apartment', 'available', 148000000::bigint, 'SAR', 3::smallint, 3::smallint, 178.00::numeric, 2::smallint, false, true, false, false, true, 2024::smallint, true,  true,  7.10::numeric, 6.40::numeric, 197000::bigint, 14::smallint, 82::smallint, 78::smallint, 'low',    'up',     '2026-09-17 09:00:00+00'::timestamptz, '2026-09-16 09:00:00+00'::timestamptz),
    ('MZ-DEMO-SA-002', 'mizan-demo-najd-foundations', 'sa', 'madinah', 'villa',     'available', 395000000::bigint, 'SAR', 5::smallint, 6::smallint, 515.00::numeric, 3::smallint, true,  true, true,  false, false, 2023::smallint, true,  false, 6.20::numeric, 5.70::numeric, 263000::bigint, 16::smallint, 76::smallint, 72::smallint, 'medium', 'stable', '2026-09-15 11:00:00+00'::timestamptz, '2026-09-14 11:00:00+00'::timestamptz),
    ('MZ-DEMO-SA-003', 'mizan-demo-najd-foundations', 'sa', 'madinah', 'land',      'available', 112000000::bigint, 'SAR', 0::smallint, 0::smallint, 740.00::numeric, 0::smallint, false, false, false, false, false, null,           false, false, 5.80::numeric, null,          null,             18::smallint, 69::smallint, 74::smallint, 'medium', 'up',     '2026-09-10 10:00:00+00'::timestamptz, '2026-09-09 10:00:00+00'::timestamptz),
    ('MZ-DEMO-SA-004', 'mizan-demo-hejaz-horizons', 'sa', 'makkah',  'apartment', 'available', 225000000::bigint, 'SAR', 4::smallint, 4::smallint, 221.00::numeric, 2::smallint, false, true,  false, false, true,  2025::smallint, true,  true,  6.80::numeric, 6.10::numeric, 305000::bigint, 15::smallint, 84::smallint, 80::smallint, 'low',    'up',     '2026-09-16 08:00:00+00'::timestamptz, '2026-09-15 08:00:00+00'::timestamptz),
    ('MZ-DEMO-SA-005', 'mizan-demo-najd-foundations', 'sa', 'makkah',  'commercial','available', 480000000::bigint, 'SAR', 0::smallint, 4::smallint, 640.00::numeric, 8::smallint, false, true,  false, false, true,  2022::smallint, false, false, 7.40::numeric, 6.80::numeric, 853000::bigint, 13::smallint, 79::smallint, 75::smallint, 'medium', 'stable', '2026-09-12 13:00:00+00'::timestamptz, '2026-09-11 13:00:00+00'::timestamptz),
    ('MZ-DEMO-SA-006', 'mizan-demo-hejaz-horizons', 'sa', 'jeddah',  'villa',     'available', 560000000::bigint, 'SAR', 6::smallint, 7::smallint, 690.00::numeric, 4::smallint, true,  true, true,  true,  false, 2021::smallint, false, true,  5.90::numeric, 5.30::numeric, 395000::bigint, 17::smallint, 73::smallint, 70::smallint, 'medium', 'stable', '2026-09-13 12:00:00+00'::timestamptz, '2026-09-12 12:00:00+00'::timestamptz),
    ('MZ-DEMO-SA-007', 'mizan-demo-najd-foundations', 'sa', 'riyadh',  'apartment', 'available', 215000000::bigint, 'SAR', 3::smallint, 3::smallint, 192.00::numeric, 2::smallint, false, true,  false, false, true,  2024::smallint, false, false, 6.60::numeric, 6.00::numeric, 287000::bigint, 15::smallint, 80::smallint, 82::smallint, 'low',    'up',     '2026-09-14 09:30:00+00'::timestamptz, '2026-09-13 09:30:00+00'::timestamptz),
    ('MZ-DEMO-SA-008', 'mizan-demo-najd-foundations', 'sa', 'riyadh',  'land',      'available', 720000000::bigint, 'SAR', 0::smallint, 0::smallint, 1250.00::numeric,0::smallint, false, true,  false, false, false, null,           false, false, 5.40::numeric, null,          null,             20::smallint, 71::smallint, 77::smallint, 'medium', 'up',     '2026-09-11 14:00:00+00'::timestamptz, '2026-09-10 14:00:00+00'::timestamptz),
    ('MZ-DEMO-AE-001', 'mizan-demo-crescent-key',    'ae', 'dubai',   'apartment', 'available', 325000000::bigint, 'AED', 2::smallint, 3::smallint, 156.00::numeric, 1::smallint, true,  true,  false, false, true,  2025::smallint, true,  true,  7.00::numeric, 6.30::numeric, 552000::bigint, 14::smallint, 85::smallint, 83::smallint, 'low',    'up',     '2026-09-17 15:00:00+00'::timestamptz, '2026-09-16 15:00:00+00'::timestamptz),
    ('MZ-DEMO-AE-002', 'mizan-demo-canal-axis',      'ae', 'dubai',   'villa',     'available', 890000000::bigint, 'AED', 5::smallint, 6::smallint, 510.00::numeric, 3::smallint, true,  true,  true,  true,  false, 2024::smallint, true,  false, 5.70::numeric, 5.10::numeric, 1030000::bigint,18::smallint, 78::smallint, 76::smallint, 'medium', 'stable', '2026-09-15 16:00:00+00'::timestamptz, '2026-09-14 16:00:00+00'::timestamptz),
    ('MZ-DEMO-AE-003', 'mizan-demo-crescent-key',    'ae', 'dubai',   'commercial','available', 240000000::bigint, 'AED', 0::smallint, 2::smallint, 184.00::numeric, 2::smallint, false, true,  false, false, true,  2023::smallint, false, true,  7.80::numeric, 7.10::numeric, 509000::bigint, 13::smallint, 81::smallint, 79::smallint, 'medium', 'up',     '2026-09-12 17:00:00+00'::timestamptz, '2026-09-11 17:00:00+00'::timestamptz),
    ('MZ-DEMO-AE-004', 'mizan-demo-crescent-key',    'ae', 'dubai',   'villa',     'available',1275000000::bigint, 'AED', 6::smallint, 7::smallint, 730.00::numeric, 4::smallint, true,  true,  true,  true,  false, 2022::smallint, true,  true,  5.40::numeric, 4.80::numeric, 1668000::bigint,19::smallint, 75::smallint, 73::smallint, 'medium', 'stable', '2026-09-16 18:00:00+00'::timestamptz, '2026-09-15 18:00:00+00'::timestamptz),
    ('MZ-DEMO-AE-005', 'mizan-demo-canal-axis',      'ae', 'dubai',   'apartment', 'available', 195000000::bigint, 'AED', 3::smallint, 3::smallint, 168.00::numeric, 2::smallint, true,  true,  true,  false, false, 2025::smallint, false, false, 6.90::numeric, 6.20::numeric, 431000::bigint, 14::smallint, 83::smallint, 84::smallint, 'low',    'up',     '2026-09-14 19:00:00+00'::timestamptz, '2026-09-13 19:00:00+00'::timestamptz),
    ('MZ-DEMO-AE-006', 'mizan-demo-canal-axis',      'ae', 'dubai',   'land',      'available', 310000000::bigint, 'AED', 0::smallint, 0::smallint, 610.00::numeric, 0::smallint, false, true,  false, false, false, null,           false, false, 6.10::numeric, null,          null,             16::smallint, 74::smallint, 80::smallint, 'medium', 'up',     '2026-09-10 20:00:00+00'::timestamptz, '2026-09-09 20:00:00+00'::timestamptz)
)
insert into public.properties (
  reference_code, partner_id, city_id, country_id, property_type,
  listing_status, publication_status, price_amount, price_currency,
  bedrooms, bathrooms, area_sqm, parking_spaces, has_pool, has_security,
  has_garden, has_sea_view, has_city_view, year_built, location_precision,
  featured, verified, roi_pct, rental_yield_pct, monthly_rent_usd_cents,
  amortization_years, investment_score, growth_score, risk_level, market_trend,
  metrics_source, metrics_updated_at, published_at, created_at
)
select
  s.reference_code, pa.id, ci.id, c.id, s.property_type::public.property_type,
  s.listing_status::public.listing_status, 'published'::public.publication_status,
  s.price_amount, s.price_currency::public.currency_code,
  s.bedrooms, s.bathrooms, s.area_sqm, s.parking_spaces, s.has_pool, s.has_security,
  s.has_garden, s.has_sea_view, s.has_city_view, s.year_built, 'city_only'::public.location_precision,
  s.featured, s.verified, s.roi_pct, s.rental_yield_pct, s.monthly_rent_usd_cents,
  s.amortization_years, s.investment_score, s.growth_score, s.risk_level::public.risk_level,
  s.market_trend::public.market_trend, 'manual'::public.metrics_source, s.created_at,
  s.published_at, s.created_at
from seed s
join public.countries c on c.iso2 = s.country_iso2
join public.cities ci on ci.country_id = c.id and ci.slug = s.city_slug
join public.partners pa on pa.slug = s.partner_slug
on conflict (reference_code) do nothing;

-- 3. English property content. The app's current translation layer falls back
--    to English for other active languages until curated translations arrive.
with seed (reference_code, title, description, highlights) as (
  values
    ('MZ-DEMO-SA-001', 'Al Noor Courtyard Residences', 'A fictional three-bedroom apartment in Madinah designed as premium demo inventory, with a bright living plan and city outlook.', array['178 sqm layout', 'Two parking spaces', '24-hour security']),
    ('MZ-DEMO-SA-002', 'Rawdah Garden Villa', 'A fictional family villa in Madinah with private garden zones, a pool and flexible entertaining rooms for demonstration purposes.', array['515 sqm built area', 'Private garden and pool', 'Five bedrooms']),
    ('MZ-DEMO-SA-003', 'Quba Gateway Land Parcel', 'A fictional city-only land opportunity in Madinah prepared for demo discovery, with a clear 740 sqm site area.', array['740 sqm parcel', 'City-only location', 'Investment metrics included']),
    ('MZ-DEMO-SA-004', 'Al Safa Horizon Apartments', 'A fictional four-bedroom apartment in Makkah with a spacious family layout, controlled access and an elevated city outlook.', array['221 sqm residence', 'Four bedrooms', 'Secure access']),
    ('MZ-DEMO-SA-005', 'Wadi Ibrahim Retail Suites', 'A fictional commercial suite collection in Makkah, designed as demonstration data for yield and property-type filtering.', array['640 sqm commercial space', 'Eight parking spaces', 'Available for investment review']),
    ('MZ-DEMO-SA-006', 'Corniche Vista Villa', 'A fictional Jeddah villa with sea-view amenities, landscaped garden space and a pool, created solely for the Mizan demo catalogue.', array['Sea-view setting', '690 sqm built area', 'Four parking spaces']),
    ('MZ-DEMO-SA-007', 'Al Malqa Parkside Apartment', 'A fictional Riyadh apartment with a park-facing urban plan, security and practical family proportions.', array['192 sqm layout', 'Riyadh city view', 'Two parking spaces']),
    ('MZ-DEMO-SA-008', 'Diriyah Commerce Plot', 'A fictional Riyadh land plot with a 1,250 sqm area, included to demonstrate land discovery and investment sorting.', array['1,250 sqm parcel', 'City-only location', 'Long-term growth profile']),
    ('MZ-DEMO-AE-001', 'Downtown Dubai Skyline Residence', 'A fictional Downtown Dubai apartment with a refined two-bedroom plan, shared pool access and a skyline-facing living area.', array['156 sqm residence', 'Skyline city view', 'Pool and security']),
    ('MZ-DEMO-AE-002', 'Dubai Marina Harbour Villa', 'A fictional Dubai Marina villa with generous family rooms, private garden zones and marina-side amenity positioning.', array['510 sqm built area', 'Private garden and pool', 'Five bedrooms']),
    ('MZ-DEMO-AE-003', 'Business Bay Canal Office', 'A fictional Business Bay commercial office designed for demo filters, with canal-area positioning and investment metrics.', array['184 sqm office', 'Two parking spaces', 'Business Bay setting']),
    ('MZ-DEMO-AE-004', 'Palm Jumeirah Garden Villa', 'A fictional Palm Jumeirah villa with a private pool, garden and sea-view amenity profile for the Mizan demo catalogue.', array['730 sqm built area', 'Sea-view amenity', 'Private pool and garden']),
    ('MZ-DEMO-AE-005', 'Dubai Hills Estate Family Apartment', 'A fictional Dubai Hills Estate family apartment with a garden community setting, secure access and a flexible three-bedroom plan.', array['168 sqm residence', 'Three bedrooms', 'Garden community setting']),
    ('MZ-DEMO-AE-006', 'JVC Courtyard Land Plot', 'A fictional JVC land plot for demo exploration, with a defined 610 sqm area and a city-only location representation.', array['610 sqm parcel', 'City-only location', 'Growth-focused demo inventory'])
)
insert into public.property_translations (
  property_id,
  language,
  title,
  description,
  highlights,
  is_machine_translated
)
select p.id, 'en'::public.app_language, s.title, s.description, s.highlights, false
from seed s
join public.properties p on p.reference_code = s.reference_code
on conflict (property_id, language) do nothing;

commit;
