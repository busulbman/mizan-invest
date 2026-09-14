-- =============================================================================
-- MIZAN INVEST — PHASE 1 · STEP 01 of 11
-- 20260914000100_extensions_and_enums.sql
-- Extensions and enum types
-- =============================================================================
-- Idempotent for extensions. Enum creation is NOT idempotent by design: if
-- this file has already been applied, the migration runner must skip it
-- rather than re-run it.
--
-- ENUMS ARE FORWARD-ONLY.
--   Adding a value later is safe:      ALTER TYPE public.app_language ADD VALUE 'de';
--   Removing a value is NOT possible without a table rewrite. Be generous now.
-- =============================================================================

create extension if not exists citext  with schema extensions;
create extension if not exists pg_trgm with schema extensions;

-- -----------------------------------------------------------------------------
-- Authorization
-- -----------------------------------------------------------------------------
-- 'guest' is deliberately absent: a guest is the ABSENCE of a session
-- (auth.uid() IS NULL). Storing a guest role would be a lie.
create type public.app_role as enum ('user', 'partner', 'admin', 'super_admin');

create type public.partner_member_role as enum ('owner', 'manager', 'agent');

-- -----------------------------------------------------------------------------
-- Localisation
-- -----------------------------------------------------------------------------
create type public.app_language as enum ('en', 'ru', 'ar', 'tr');

create type public.currency_code as enum
  ('USD', 'SAR', 'AED', 'TRY', 'RUB', 'EUR', 'GBP');

-- -----------------------------------------------------------------------------
-- Property
-- -----------------------------------------------------------------------------
create type public.property_type as enum
  ('apartment', 'villa', 'land', 'commercial');

create type public.listing_status as enum
  ('available', 'reserved', 'sold');

create type public.publication_status as enum
  ('draft', 'pending_review', 'published', 'unpublished', 'archived');

-- Exact coordinates of a high-value property are a physical-security concern
-- for the occupant. Guests receive a fuzzed point.
create type public.location_precision as enum
  ('exact', 'approximate', 'city_only');

create type public.risk_level     as enum ('low', 'medium', 'high');
create type public.market_trend   as enum ('up', 'stable', 'down');
create type public.metrics_source as enum ('manual', 'model', 'partner_claimed');

create type public.media_type as enum
  ('image', 'video', 'floor_plan', 'document');

-- -----------------------------------------------------------------------------
-- Leads
-- -----------------------------------------------------------------------------
-- 'reel' is pre-reserved so the Phase 11 Reels feature needs no enum migration.
create type public.lead_source as enum (
  'interested_button',
  'whatsapp',
  'phone_call',
  'reel',
  'share',
  'property_detail',
  'search_result',
  'notification',
  'web',
  'other'
);

create type public.lead_status as enum (
  'new',
  'contacted',
  'qualified',
  'matched_to_partner',
  'closed_won',
  'closed_lost',
  'spam'
);

-- Separates a tap-through attribution record (no contact details needed)
-- from a full inquiry (needs a reply path when the user is not signed in).
create type public.lead_kind as enum ('attribution', 'inquiry');
