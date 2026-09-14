# Mizan Invest — Database

Version-controlled PostgreSQL schema for the Mizan Invest platform, running on
Supabase.

> **Phase 1 status: written, NOT applied.**
> No migration in this directory has been run against any database. Nothing has
> touched the remote Supabase project.

---

## Migration order

Files apply in ascending numeric order. **The order is load-bearing** — several
files depend on objects created by earlier ones.

| Step | File | Creates | Depends on |
|---|---|---|---|
| 01 | `20260914000100_extensions_and_enums.sql` | `citext`, `pg_trgm`, 15 enum types | — |
| 02 | `20260914000200_helpers_and_triggers.sql` | `tg_set_updated_at`, `contains_contact_info`, `array_contains_contact_info`, `lead_source_requires_contact`, `client_fingerprint` | 01 (enums) |
| 03 | `20260914000300_identity.sql` | `profiles`, `user_roles`, **role helpers**, `auth.users` → `profiles` trigger | 02 |
| 04 | `20260914000400_geo.sql` | `countries`, `cities`, + translations | 02 |
| 05 | `20260914000500_partners.sql` | `partners`, `partner_translations`, `partner_members`, **partner helpers**, `private.partner_private` | 03, 04 |
| 06 | `20260914000600_fx.sql` | `fx_rates` | 01 |
| 07 | `20260914000700_properties.sql` | `properties`, `property_translations`, `property_media`, guards, indexes | 02–06 |
| 08 | `20260914000800_favorites.sql` | `favorites`, `merge_guest_favorites()` | 07 |
| 09 | `20260914000900_leads.sql` | `leads`, `create_lead()` | 07 |
| 10 | `20260914001000_rls.sql` | All grants and RLS policies | 03–09 |
| 11 | `20260914001100_seed_reference_data.sql` | Saudi Arabia + UAE, 11 cities, FX | 04, 06 |

Timestamps are deterministic and one minute apart (`00:01:00` … `00:11:00` on
2026-09-14). They encode nothing but order.

### Why helper functions are split across files

PostgreSQL validates `LANGUAGE sql` function bodies at `CREATE` time
(`check_function_bodies = on`). A SQL function that reads a table which does not
exist yet **fails to create**. So:

- `is_admin()`, `has_role()`, `is_super_admin()` read `user_roles` → defined in **step 03**
- `my_partner_ids()`, `is_member_of_partner()` read `partner_members` → defined in **step 05**

`PL/pgSQL` bodies are only syntax-checked at create time, which is why the
trigger functions can safely reference tables created later in the same file.

---

## 🚨 NEVER run `db reset` against production

```
supabase db reset     # DROPS THE ENTIRE DATABASE AND RE-RUNS EVERY MIGRATION
```

This destroys **every property, every user, and every lead**. It is a *local
development* command only.

Before running any Supabase CLI command, confirm which project is linked:

```bash
supabase projects list      # the linked project is marked
supabase status             # local stack only
```

Other commands that must never point at production:

| Command | Why |
|---|---|
| `supabase db reset` | Drops and recreates everything |
| `psql ... -c 'DROP ...'` | Bypasses every guard in this schema |
| `supabase db push --linked` while linked to prod, unreviewed | Applies untested DDL |

`leads` has a `BEFORE DELETE` trigger that blocks row deletion even for
`service_role`. **It does not stop `DROP TABLE`.** Commission history is
protected by backups, not by triggers.

---

## Environment separation

Three **separate Supabase projects**. Never develop against production.

| Environment | Purpose | Who applies migrations |
|---|---|---|
| **local** | `supabase start`, day-to-day work, `db reset` freely | any developer |
| **staging** | Full rehearsal. Mirrors production schema. Disposable data. | any developer |
| **production** | Real users, real listings, real leads | one named owner, after staging passes |

A migration reaches production only after it has been applied cleanly to
staging **and** the verification queries below have passed there.

---

## How migrations should eventually be applied

Nothing here is applied yet. When approved, the intended sequence is:

```bash
# 1. Local — prove the whole chain from empty
supabase start
supabase db reset                     # safe: local only

# 2. Verify (see queries below), then link staging
supabase link --project-ref <STAGING_REF>
supabase db push

# 3. Verify on staging. Only then, production.
supabase link --project-ref <PRODUCTION_REF>
supabase db push
```

### Before the first production push

1. **Enable PITR** (Point-In-Time Recovery). Daily snapshots alone mean up to
   24 hours of lost leads.
2. **Rehearse a restore** into staging. An untested backup is a hypothesis.
3. Confirm the linked project ref is the one you intend.

### Filename convention

These files use the Supabase CLI's timestamp convention
(`YYYYMMDDHHMMSS_name.sql`), so `supabase db push` and `supabase migration list`
read them correctly and compare cleanly against the remote history table.

**Do not rename them again after the first apply.** The CLI records the
timestamp as the migration version; renaming an already-applied file makes the
CLI treat it as brand new and attempt to re-run it.

---

## Verification queries

Run after applying to any environment.

```sql
-- 1. RLS is enabled on all 15 public tables; FORCE on none.
select c.relname, c.relrowsecurity, c.relforcerowsecurity
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r'
order by c.relrowsecurity, c.relname;

-- 2. partner_private has no route in the API schema.
select count(*) from information_schema.tables
where table_schema = 'public' and table_name = 'partner_private';   -- expect 0

-- 3. No DELETE or INSERT grant on leads for client roles.
select grantee, privilege_type from information_schema.role_table_grants
where table_name = 'leads' and grantee in ('anon','authenticated');
-- expect: SELECT and UPDATE only, for authenticated

-- 4. Contact blocking behaves.
select public.contains_contact_info('Villa with sea view, 2 500 000 AED'); -- false
select public.contains_contact_info('Built 2023, 450 sqm, 12 units');      -- false
select public.contains_contact_info('Call +971 50 123 4567');              -- true
select public.contains_contact_info('email me at a@b.com');                -- true
select public.contains_contact_info('WhatsApp me');                        -- true
```

Then, from the Expo app signed out, using the **publishable** key:

```ts
await supabase.from('partner_private').select('*');  // error / 0 rows
await supabase.from('leads').select('*');            // 0 rows
await supabase.from('leads').insert({ /* ... */ });  // permission denied
await supabase.from('properties').select('*');       // published only
await supabase.rpc('create_lead', {
  p_property_id: '<published uuid>', p_source: 'whatsapp',
});                                                   // returns a reference code
```

---

## Rollback philosophy

**Forward-fix in production. Roll back only before launch.**

| Situation | Action |
|---|---|
| Local or staging, schema wrong | `supabase db reset`, fix the file, re-apply |
| Production, pre-launch, no real data | Documented reverse-order `DROP` is acceptable |
| Production, post-launch | **Never roll back.** Write a new forward migration. |
| Production data damaged | **PITR restore.** Not a rollback script. |

Every file in this directory is `CREATE`, `GRANT` or `REVOKE` only. **There is
not a single `DROP`, `TRUNCATE`, `ALTER … DROP COLUMN`, `UPDATE` or `DELETE`
anywhere in `migrations/`.** The seed is `ON CONFLICT DO NOTHING` throughout and
is safe to re-run.

If a pre-launch rollback is genuinely needed, drop objects in **strict reverse
order** (step 11 → step 01). Two rules:

- **Never `DROP … CASCADE` on `partners` or `properties`** — cascade propagates
  into attribution data.
- **`DROP TABLE public.leads` destroys commission history.** The delete-blocking
  trigger does not stop it.

---

## Data-loss precautions

**A new App Store or TestFlight build can never delete production data.** A
build ships *code*; data lives in Postgres. This is the structural property that
made the move off bundled `mockData.ts` worth doing.

The remaining risks, and what guards each:

| Risk | Guard |
|---|---|
| Accidental lead deletion | No `DELETE` grant · no `DELETE` policy · `BEFORE DELETE` trigger |
| Losing attribution when a property is reassigned | Five `*_snapshot` columns, frozen at insert, immutable on update |
| Deleting a partner with live listings | `ON DELETE RESTRICT` on `properties.partner_id` |
| Deleting a partner with contract terms | `ON DELETE RESTRICT` on `private.partner_private` |
| Lead lost when its property is deleted | `ON DELETE SET NULL` — the lead survives |
| Lead lost when a user deletes their account | `ON DELETE SET NULL` — snapshots remain |
| Orphaned storage files | ⚠️ **Open.** `property_media` CASCADE deletes rows, not files. Reconciliation job is Phase 4/11. |
| Breaking an old app build | Expand/contract only. Never drop a column an in-the-wild build selects. |
| Losing hours of leads | **PITR must be on before the first real user.** |

### Contract stability

`public.create_lead()` is a **public API contract**. Old builds stay installed
for weeks after a release. Add future parameters **with defaults, at the end**.
Never reorder or remove existing ones.

Enum values are **forward-only**: `ALTER TYPE … ADD VALUE` is safe; removing a
value effectively requires a table rewrite.

---

## Function EXECUTE privileges

Supabase's default privileges grant `EXECUTE` directly to `anon` and
`authenticated` when a function is created. **`REVOKE ... FROM PUBLIC` does not
undo that** — the direct grants are separate. Every Phase 1 function is therefore
revoked from `public, anon, authenticated` explicitly and granted back only where
required.

| Role | May execute | Why |
|---|---|---|
| `anon` | `create_lead` | The single guest entry point. Nothing else. |
| `authenticated` | `create_lead` | Signed-in enquiries |
| | `merge_guest_favorites` | Guest → user favorites merge on sign-in |
| | `is_admin`, `is_super_admin`, `my_partner_ids` | Referenced by RLS policies; a policy expression requires the **caller** to hold EXECUTE |
| | `contains_contact_info`, `array_contains_contact_info`, `lead_source_requires_contact` | Referenced by CHECK constraints; a CHECK requires the **writing role** to hold EXECUTE |
| nobody | `has_role`, `is_member_of_partner` | Defined for future use, referenced by no policy |
| nobody | `client_fingerprint` | Called only inside `create_lead` (SECURITY DEFINER) |
| nobody | all 12 `tg_*` | Trigger functions — PostgreSQL refuses a direct call, and firing a trigger does not require caller EXECUTE |

Four behaviours verified empirically on local PostgreSQL 17, not assumed:

1. An RLS policy expression **requires** the caller to hold EXECUTE.
2. A CHECK constraint **requires** the writing role to hold EXECUTE.
3. A trigger function does **not** require the caller to hold EXECUTE.
4. Inside `SECURITY DEFINER`, CHECK functions resolve as the **definer** — which
   is why `anon` needs nothing beyond `create_lead`.

**When adding a function later:** revoke from `public, anon, authenticated`, then
grant back only what is provably required.

---

## Security invariants

These are load-bearing. Do not "simplify" them away.

1. **The publishable key is public.** No protection depends on hiding a table
   name, endpoint, ID, or key.
2. **Roles come only from `public.user_roles`** — never from
   `auth.users.raw_user_meta_data`, which users can write to themselves.
3. **`ENABLE` RLS, never `FORCE`.** `FORCE` removes the table-owner exemption
   and breaks every `SECURITY DEFINER` helper. See the header of the `_rls.sql` migration.
4. **`user_roles` and `partner_members` must never get `FORCE`** — their own
   policies call helpers that read them. `FORCE` causes infinite recursion.
5. **`private.partner_private` is completely closed in Phase 1.** No anon, no
   authenticated, no partner, no admin RPC. Phase 12 will expose it through an
   admin backend that validates the role and writes an audit entry.
6. **`create_lead()` is the only insertion path into `leads`.**
7. **Partners cannot modify:** `verified`, `rating`, `listings_count`, `slug`,
   `is_active`, `deleted_at`, `country_id`, or any platform investment metric.
8. **Every `SECURITY DEFINER` function sets `search_path = ''`** and fully
   qualifies identifiers. Without it, a malicious search path can hijack
   execution.

---

## Not in Phase 1

Deliberately deferred: `reels`, `notifications`, `device_tokens`, `news`,
`property_views`, `lead_events`, `audit_log`, AI tables, analytics tables,
storage buckets, and the partner-facing lead inbox.
