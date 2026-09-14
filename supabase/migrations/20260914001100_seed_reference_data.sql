-- =============================================================================
-- MIZAN INVEST — PHASE 1 · STEP 11 of 11
-- 20260914001100_seed_reference_data.sql
-- Reference data: Saudi Arabia + UAE
-- =============================================================================
-- LOCKED DECISION: V1 markets are Saudi Arabia and UAE. Turkey is NOT seeded.
-- The schema is generic, so adding Turkey later is INSERT-only - no migration,
-- no DDL:
--
--   insert into public.countries (iso2, iso3, flag_emoji, phone_code, sort_order)
--   values ('tr', 'tur', '(TR flag)', '+90', 30);
--   ... plus its country_translations and cities rows.
--
-- Fully idempotent: safe to re-run. No UPDATE, no DELETE, no destructive
-- statement anywhere in this file.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Countries
-- -----------------------------------------------------------------------------
insert into public.countries (iso2, iso3, flag_emoji, phone_code, sort_order)
values
  ('sa', 'sau', '🇸🇦', '+966', 10),
  ('ae', 'are', '🇦🇪', '+971', 20)
on conflict (iso2) do nothing;

insert into public.country_translations (country_id, language, name)
select c.id, v.language::public.app_language, v.name
from public.countries c
join (values
  ('sa', 'en', 'Saudi Arabia'),
  ('sa', 'ru', 'Саудовская Аравия'),
  ('sa', 'ar', 'المملكة العربية السعودية'),
  ('sa', 'tr', 'Suudi Arabistan'),
  ('ae', 'en', 'United Arab Emirates'),
  ('ae', 'ru', 'Объединённые Арабские Эмираты'),
  ('ae', 'ar', 'الإمارات العربية المتحدة'),
  ('ae', 'tr', 'Birleşik Arap Emirlikleri')
) as v(iso2, language, name) on v.iso2 = c.iso2
on conflict (country_id, language) do nothing;

-- -----------------------------------------------------------------------------
-- Cities
-- -----------------------------------------------------------------------------
insert into public.cities (country_id, slug, latitude, longitude, sort_order)
select c.id, v.slug, v.lat, v.lng, v.sort_order
from public.countries c
join (values
  ('sa', 'riyadh',          24.713552, 46.675297, 10),
  ('sa', 'jeddah',          21.485811, 39.192505, 20),
  ('sa', 'madinah',         24.470901, 39.612236, 30),
  ('sa', 'makkah',          21.389082, 39.857910, 40),
  ('sa', 'dammam',          26.392665, 49.977714, 50),
  ('sa', 'al-khobar',       26.279445, 50.208824, 60),
  ('ae', 'dubai',           25.204849, 55.270782, 10),
  ('ae', 'abu-dhabi',       24.453884, 54.377343, 20),
  ('ae', 'sharjah',         25.346255, 55.420933, 30),
  ('ae', 'ajman',           25.405216, 55.513641, 40),
  ('ae', 'ras-al-khaimah',  25.789501, 55.942600, 50)
) as v(iso2, slug, lat, lng, sort_order) on v.iso2 = c.iso2
on conflict (country_id, slug) do nothing;

insert into public.city_translations (city_id, language, name)
select ci.id, v.language::public.app_language, v.name
from public.cities ci
join (values
  ('riyadh',         'en', 'Riyadh'),
  ('riyadh',         'ru', 'Эр-Рияд'),
  ('riyadh',         'ar', 'الرياض'),
  ('riyadh',         'tr', 'Riyad'),
  ('jeddah',         'en', 'Jeddah'),
  ('jeddah',         'ru', 'Джидда'),
  ('jeddah',         'ar', 'جدة'),
  ('jeddah',         'tr', 'Cidde'),
  ('madinah',        'en', 'Madinah'),
  ('madinah',        'ru', 'Медина'),
  ('madinah',        'ar', 'المدينة المنورة'),
  ('madinah',        'tr', 'Medine'),
  ('makkah',         'en', 'Makkah'),
  ('makkah',         'ru', 'Мекка'),
  ('makkah',         'ar', 'مكة المكرمة'),
  ('makkah',         'tr', 'Mekke'),
  ('dammam',         'en', 'Dammam'),
  ('dammam',         'ru', 'Даммам'),
  ('dammam',         'ar', 'الدمام'),
  ('dammam',         'tr', 'Dammam'),
  ('al-khobar',      'en', 'Al Khobar'),
  ('al-khobar',      'ru', 'Эль-Хубар'),
  ('al-khobar',      'ar', 'الخبر'),
  ('al-khobar',      'tr', 'Khobar'),
  ('dubai',          'en', 'Dubai'),
  ('dubai',          'ru', 'Дубай'),
  ('dubai',          'ar', 'دبي'),
  ('dubai',          'tr', 'Dubai'),
  ('abu-dhabi',      'en', 'Abu Dhabi'),
  ('abu-dhabi',      'ru', 'Абу-Даби'),
  ('abu-dhabi',      'ar', 'أبو ظبي'),
  ('abu-dhabi',      'tr', 'Abu Dabi'),
  ('sharjah',        'en', 'Sharjah'),
  ('sharjah',        'ru', 'Шарджа'),
  ('sharjah',        'ar', 'الشارقة'),
  ('sharjah',        'tr', 'Şarika'),
  ('ajman',          'en', 'Ajman'),
  ('ajman',          'ru', 'Аджман'),
  ('ajman',          'ar', 'عجمان'),
  ('ajman',          'tr', 'Acman'),
  ('ras-al-khaimah', 'en', 'Ras Al Khaimah'),
  ('ras-al-khaimah', 'ru', 'Рас-эль-Хайма'),
  ('ras-al-khaimah', 'ar', 'رأس الخيمة'),
  ('ras-al-khaimah', 'tr', 'Re''sülhayme')
) as v(slug, language, name) on v.slug = ci.slug
on conflict (city_id, language) do nothing;

-- -----------------------------------------------------------------------------
-- FX rates
-- -----------------------------------------------------------------------------
-- SAR and AED are USD-pegged, so those two are exact rather than estimates.
-- The rest are placeholders and MUST be replaced by a real feed before any
-- non-USD/SAR/AED listing is published.
insert into public.fx_rates (base, quote, rate, as_of, source)
values
  ('USD', 'SAR',  3.75000000, current_date, 'SAMA peg'),
  ('USD', 'AED',  3.67250000, current_date, 'CBUAE peg'),
  ('USD', 'TRY', 42.00000000, current_date, 'placeholder - replace'),
  ('USD', 'RUB', 86.00000000, current_date, 'placeholder - replace'),
  ('USD', 'EUR',  0.92000000, current_date, 'placeholder - replace'),
  ('USD', 'GBP',  0.79000000, current_date, 'placeholder - replace')
on conflict (base, quote, as_of) do nothing;
