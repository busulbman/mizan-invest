-- =============================================================================
-- MIZAN INVEST — PHASE 5 · STEP 1
-- 20260928100000_coordinate_privacy.sql
-- Coordinate privacy: properties.latitude / properties.longitude
-- =============================================================================
-- THE PROBLEM THIS FIXES
--   20260914001000_rls.sql granted SELECT on the WHOLE properties table to anon
--   and authenticated, and relied on the row policy properties_read_published
--   to protect the data. RLS filters WHICH ROWS a client may read. It has no
--   opinion whatsoever about WHICH COLUMNS. So any client holding the public
--   publishable key could do all three of these against every published
--   listing, regardless of its location_precision:
--
--     GET /properties?select=latitude,longitude          -> 200, values
--     GET /properties?select=id&latitude=gt.24           -> 200  (filter)
--     GET /properties?select=id&order=longitude.asc      -> 200  (sort)
--
--   Filter and sort access is the worse half: even with the value hidden from
--   the response, a range filter can be binary-searched to recover a
--   coordinate to arbitrary precision. No amount of care in the app could have
--   prevented that, because it never needed the app's cooperation.
--
--   Until now this leaked nothing only because every coordinate in the table
--   was NULL. Phase 5 is the feature that fills those columns, so the hole had
--   to close BEFORE the partner map picker existed, not after.
--
-- WHY COLUMN GRANTS ALONE CANNOT SOLVE IT
--   Column privileges are per Postgres ROLE. Investors, partners and admins are
--   all the single role `authenticated`. There is therefore no grant that gives
--   a partner the coordinates of their own listing while denying an investor the
--   coordinates of that same published listing. The distinction is per USER and
--   per ROW, so the read has to be mediated by a function that can see both.
--
-- THE SHAPE OF THE FIX
--   1. Raw latitude/longitude become unreadable through REST for every client
--      role, by replacing the table-wide SELECT grant with an explicit
--      column list that omits exactly those two columns.
--   2. public.property_location() becomes the ONLY read path, and decides
--      server-side how precise an answer each caller has earned.
--
--   INSERT and UPDATE are untouched, so a partner still WRITES coordinates
--   normally. Write-only, read-mediated is the correct asymmetry here: the
--   partner supplies the point, the database decides who may see it.
--
--   No row policy is altered. No column is added, renamed or dropped. No data
--   is modified. Nothing is dropped except the two grants being replaced.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. Replace the table-wide SELECT grant with an explicit column list
-- -----------------------------------------------------------------------------
-- !!! MAINTENANCE WARNING !!!
-- This list is EXHAUSTIVE and hand-written. A column added to public.properties
-- in a later migration is NOT readable by clients until it is added here. That
-- fails CLOSED - a new column is invisible rather than accidentally public -
-- which is the safe direction, but it does mean:
--
--   ANY FUTURE MIGRATION THAT ADDS A CLIENT-READABLE COLUMN TO properties MUST
--   ALSO GRANT SELECT ON IT HERE.
--
-- latitude and longitude are absent DELIBERATELY. Adding them back to this list
-- re-opens the exact hole described above. Use property_location() instead.
revoke select on public.properties from anon, authenticated;

grant select (
  id,
  reference_code,
  partner_id,
  city_id,
  country_id,
  property_type,
  listing_status,
  publication_status,
  price_amount,
  price_currency,
  price_usd_cents,
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
  -- The PRECISION is public on purpose: an investor is entitled to know that a
  -- location is approximate. Concealing that would be the dishonest option -
  -- it is the coordinates that are private, not the fact of their vagueness.
  location_precision,
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
  metrics_source,
  metrics_updated_at,
  favorite_count,
  published_at,
  created_by,
  created_at,
  updated_at,
  deleted_at,
  submitted_at,
  reviewed_at,
  reviewed_by,
  rejection_reason
) on public.properties to anon, authenticated;


-- -----------------------------------------------------------------------------
-- 2. The mediated read path
-- -----------------------------------------------------------------------------
-- HOW "approximate" IS GENERALISED
--   The stored point is snapped to the CENTRE OF A FIXED ~1.1 km GRID CELL.
--
--   Deterministic, and that is the whole point. The obvious alternative - add a
--   random offset - is fake privacy: an attacker who calls the RPC repeatedly
--   averages the noise away and recovers the true point to arbitrary accuracy.
--   A fixed grid returns the identical value forever, so repetition yields
--   nothing at all. It also groups nearby listings onto the same displayed
--   point, which helps rather than hurts.
--
--   The honest statement of what is disclosed: the property is somewhere inside
--   a 0.01 deg cell. radius_m reports the half-diagonal of that cell (~790 m)
--   so the UI can draw a circle that genuinely contains the property instead of
--   implying a precision it does not have.
--
-- WHY SECURITY DEFINER
--   It must read columns the caller is now forbidden to read, and call
--   my_partner_ids() / is_admin(), which are revoked from anon and
--   authenticated. It runs as the owner and re-derives authorization itself.
--
-- WHY NO DYNAMIC SQL
--   There is nothing to build at runtime. Everything here is a static query,
--   so the injection surface is zero by construction.
create or replace function public.property_location(p_property_id uuid)
returns table (
  property_id        uuid,
  -- NOT named `precision`. PRECISION is a col_name_keyword in PostgreSQL, and
  -- a RETURNS TABLE column is parsed as a param_name, whose grammar production
  -- (type_function_name) admits IDENT, unreserved_keyword and
  -- type_func_name_keyword but NOT col_name_keyword. It is therefore legal as a
  -- table column name and illegal here - which is why `precision` parses fine
  -- on properties.location_precision but fails with "syntax error at or near
  -- precision" in this position. Keep this name a plain identifier.
  --
  -- Every reference to it in the body below is qualified (`v_row.`/`p.`), so it
  -- never collides with the same-named column under plpgsql variable
  -- resolution.
  location_precision public.location_precision,
  -- 'exact' - a real point, safe to pin
  -- 'area'  - a generalised cell centre, must be drawn as an area
  -- 'city'  - no property point at all, city centroid only
  display_kind       text,
  display_latitude   numeric,
  display_longitude  numeric,
  radius_m           integer,
  city_latitude      numeric,
  city_longitude     numeric
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  -- 0.01 deg of latitude is ~1.11 km. In the Gulf and Turkiye latitudes this
  -- project serves (21-42 deg N) 0.01 deg of longitude is ~0.8-1.0 km, so one
  -- cell size for both axes stays acceptably square. Changing this constant
  -- changes what every existing approximate listing displays.
  k_cell    constant numeric := 0.01;
  -- Half-diagonal of the cell, in metres: 0.01 * 111320 * sqrt(2) / 2.
  k_radius  constant integer := 790;
  v_row     record;
  v_privileged boolean;
begin
  select p.id, p.partner_id, p.publication_status, p.deleted_at,
         p.latitude, p.longitude, p.location_precision,
         c.latitude  as city_lat,
         c.longitude as city_lng
    into v_row
    from public.properties p
    join public.cities c on c.id = p.city_id
   where p.id = p_property_id;

  -- Unknown id: no row. Never distinguishable from "not allowed to see it".
  if not found then
    return;
  end if;

  -- Admin, or an ACTIVE member of the owning partner. my_partner_ids() already
  -- filters partner_members.is_active, so a deactivated member is not
  -- privileged here.
  v_privileged := public.is_admin()
               or v_row.partner_id in (select public.my_partner_ids());

  if v_privileged then
    -- Raw stored values, whatever the precision and whatever the publication
    -- status. The partner authored this point and the admin must be able to
    -- review it truthfully; generalising it for them would make review
    -- meaningless.
    return query select
      v_row.id,
      v_row.location_precision,
      (case when v_row.latitude is null then 'city' else 'exact' end)::text,
      v_row.latitude,
      v_row.longitude,
      0,
      v_row.city_lat,
      v_row.city_lng;
    return;
  end if;

  -- Everyone else may see a location only for a live listing. A draft or a
  -- listing awaiting review returns nothing - the same empty result as an
  -- unknown id.
  if v_row.publication_status <> 'published' or v_row.deleted_at is not null then
    return;
  end if;

  -- A published listing with no coordinates (every pre-Phase-5 row) degrades to
  -- its city. This is the normal case for existing data, not an error.
  if v_row.latitude is null or v_row.longitude is null then
    return query select
      v_row.id, v_row.location_precision, 'city'::text,
      null::numeric, null::numeric, 0, v_row.city_lat, v_row.city_lng;
    return;
  end if;

  if v_row.location_precision = 'exact' then
    return query select
      v_row.id, v_row.location_precision, 'exact'::text,
      v_row.latitude, v_row.longitude, 0, v_row.city_lat, v_row.city_lng;

  elsif v_row.location_precision = 'approximate' then
    -- Grid-cell centre. floor() then add half a cell: stable, and independent
    -- of how many times it is asked for.
    return query select
      v_row.id, v_row.location_precision, 'area'::text,
      floor(v_row.latitude  / k_cell) * k_cell + k_cell / 2,
      floor(v_row.longitude / k_cell) * k_cell + k_cell / 2,
      k_radius,
      v_row.city_lat, v_row.city_lng;

  else
    -- city_only: the stored point is not disclosed in any form, not even
    -- generalised.
    return query select
      v_row.id, v_row.location_precision, 'city'::text,
      null::numeric, null::numeric, 0, v_row.city_lat, v_row.city_lng;
  end if;
end;
$$;

comment on function public.property_location(uuid) is
  'The ONLY read path for property coordinates. Raw latitude/longitude are not '
  'granted to anon or authenticated on the table itself, so this function - not '
  'the client - decides how precise an answer each caller receives. See '
  'migration 20260928100000 for the reasoning.';

-- REVOKE FROM PUBLIC alone does NOT undo Supabase's default anon/authenticated
-- grants, so all three are named explicitly before anything is granted back.
revoke execute on function public.property_location(uuid) from public, anon, authenticated;
grant  execute on function public.property_location(uuid) to anon, authenticated;
