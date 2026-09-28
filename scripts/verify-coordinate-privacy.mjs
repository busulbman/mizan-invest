/**
 * ============================================
 * COORDINATE PRIVACY VERIFICATION
 * ============================================
 * Proves migration 20260928100000 with the SAME credentials an attacker has:
 * the public publishable key and nothing else. No service_role anywhere.
 *
 *   node scripts/verify-coordinate-privacy.mjs
 *
 * The privileged half (partner / admin raw coordinates, and the per-precision
 * value assertions, which need one listing that actually HAS coordinates) runs
 * only when test-account credentials are supplied. Without them those checks
 * report SKIP rather than a misleading PASS:
 *
 *   MIZAN_PARTNER_EMAIL=... MIZAN_PARTNER_PASSWORD=... \
 *   MIZAN_ADMIN_EMAIL=...   MIZAN_ADMIN_PASSWORD=...   \
 *   node scripts/verify-coordinate-privacy.mjs
 */
import { readFileSync } from 'node:fs';

for (const line of readFileSync('.env', 'utf8').split('\n')) {
  const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)$/.exec(line);
  if (m) process.env[m[1]] ??= m[2].trim().replace(/^["']|["']$/g, '');
}
const URL_ = process.env.EXPO_PUBLIC_SUPABASE_URL;
const KEY = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if (!URL_ || !KEY) throw new Error('EXPO_PUBLIC_SUPABASE_URL / _PUBLISHABLE_KEY missing from .env');

let pass = 0, fail = 0, skip = 0;
const ok = (n, d = '') => { pass++; console.log(`  PASS  ${n}${d && '  — ' + d}`); };
const no = (n, d = '') => { fail++; console.log(`  FAIL  ${n}${d && '  — ' + d}`); };
const sk = (n, d = '') => { skip++; console.log(`  SKIP  ${n}${d && '  — ' + d}`); };

const rest = (path, token) =>
  fetch(`${URL_}/rest/v1${path}`, {
    headers: { apikey: KEY, ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });

const rpc = (id, token) =>
  fetch(`${URL_}/rest/v1/rpc/property_location`, {
    method: 'POST',
    headers: {
      apikey: KEY,
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ p_property_id: id }),
  });

async function signIn(email, password) {
  const r = await fetch(`${URL_}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!r.ok) return null;
  return (await r.json()).access_token ?? null;
}

// ---------------------------------------------------------------------------
console.log('\n=== A. anon must NOT reach raw properties.latitude / longitude ===');
/**
 * WHAT COUNTS AS PROOF HERE
 *
 * The assertion is PostgreSQL's SQLSTATE, not the HTTP status. PostgREST maps
 * 42501 (insufficient_privilege) to "403 if authenticated, else 401" — these
 * probes are anonymous, so the correct answer is 401, and an earlier version of
 * this script wrongly demanded exactly 403 and reported FAIL on a migration
 * that had in fact applied perfectly.
 *
 * 42501 is also what distinguishes privilege denial from an authentication
 * problem, which is the other thing a bare 401 could mean: a bad or missing
 * apikey returns {"message":"Invalid API key"} with NO `code` field at all.
 * So a 401 carrying code 42501 is a privilege refusal; a 401 without it is an
 * auth failure and must NOT be mistaken for a pass.
 */
const DENIED_STATUSES = [401, 403];
for (const [name, path] of [
  ['1 direct SELECT latitude,longitude', '/properties?select=id,latitude,longitude&limit=3'],
  ['2 FILTER on latitude (binary-searchable)', '/properties?select=id&latitude=gt.-91&limit=3'],
  ['3 ORDER BY longitude', '/properties?select=id&order=longitude.asc&limit=3'],
]) {
  const r = await rest(path);
  const body = await r.json().catch(() => null);
  const code = body && typeof body === 'object' ? body.code : undefined;

  if (r.status === 200) {
    no(name, 'HTTP 200 — column still reachable');
  } else if (code === '42501' && DENIED_STATUSES.includes(r.status)) {
    ok(name, `HTTP ${r.status} SQLSTATE 42501 — privilege denied`);
  } else if (DENIED_STATUSES.includes(r.status)) {
    // Refused, but for the wrong reason — most likely a key problem, which
    // would make every other check meaningless too.
    no(name, `HTTP ${r.status} but no SQLSTATE 42501 (auth problem, not privilege): ${body?.message ?? '?'}`);
  } else {
    no(name, `unexpected HTTP ${r.status}: ${body?.message ?? '?'}`);
  }
}

// The control that separates "these two columns are denied" from "the whole
// table is denied". PostgreSQL phrases a COLUMN privilege failure as
// "permission denied for table properties", so without this the section above
// would read identically if the re-GRANT had silently not applied.
{
  const r = await rest('/properties?select=id,reference_code,location_precision&limit=1');
  r.ok
    ? ok('3b control: granted columns still readable', 'denial is column-scoped, not table-wide')
    : no('3b control: granted columns still readable', `HTTP ${r.status} — the re-GRANT did not apply`);
}

console.log('\n=== B. anon must still read everything legitimate ===');
{
  const r = await rest('/properties?select=id,reference_code,location_precision,price_amount,city_id&limit=50');
  if (!r.ok) no('4 normal published read', `HTTP ${r.status}`);
  else { ok('4 normal published read'); globalThis.__props = await r.json(); }

  const c = await rest('/cities?select=id,slug,latitude,longitude&limit=50');
  c.ok ? ok('5 city centroids still public') : no('5 city centroids still public', `HTTP ${c.status}`);
  globalThis.__cities = c.ok ? await c.json() : [];
}

console.log('\n=== C. the mediated path, as anon ===');
const props = globalThis.__props ?? [];
const byPrecision = (p) => props.find((x) => x.location_precision === p);

{
  const r = await rpc('00000000-0000-0000-0000-000000000000');
  const body = r.ok ? await r.json() : null;
  Array.isArray(body) && body.length === 0
    ? ok('6 unknown id returns no location row')
    : no('6 unknown id returns no location row', `HTTP ${r.status} ${JSON.stringify(body)}`);
}

for (const precision of ['exact', 'approximate', 'city_only']) {
  const p = byPrecision(precision);
  const label = `7.${precision} RPC never leaks raw coordinates`;
  if (!p) { sk(label, `no published ${precision} listing in this database`); continue; }
  const r = await rpc(p.id);
  if (!r.ok) { no(label, `HTTP ${r.status}`); continue; }
  const [row] = await r.json();
  if (!row) { no(label, 'published listing returned no row'); continue; }

  const cityHasCentroid = row.city_latitude !== null;
  if (precision === 'city_only') {
    row.display_kind === 'city' && row.display_latitude === null
      ? ok(label, `display_kind=city, display coords null, centroid ${cityHasCentroid ? 'present' : 'MISSING'}`)
      : no(label, `expected city/null, got ${JSON.stringify(row)}`);
  } else if (row.display_latitude === null) {
    // Every pre-Phase-5 row. Degrading to the city is correct, not a failure.
    row.display_kind === 'city'
      ? ok(label, 'listing has no coordinates yet; degrades to city centroid')
      : no(label, `expected city for null coords, got ${JSON.stringify(row)}`);
  } else if (precision === 'approximate') {
    // Snapped to a 0.01 deg cell centre => always lands on .xx5
    const snapped = (v) => Math.abs(((Math.abs(v) * 1000) % 10) - 5) < 1e-6;
    snapped(row.display_latitude) && snapped(row.display_longitude) && row.radius_m > 0
      ? ok(label, `generalised to cell centre ${row.display_latitude},${row.display_longitude} r=${row.radius_m}m`)
      : no(label, `NOT generalised: ${JSON.stringify(row)}`);
  } else {
    row.display_kind === 'exact' && row.radius_m === 0
      ? ok(label, `exact point disclosed as permitted`)
      : no(label, `expected exact, got ${JSON.stringify(row)}`);
  }
}

console.log('\n=== D. privileged callers ===');
async function privileged(kind, emailVar, pwVar) {
  const email = process.env[emailVar], pw = process.env[pwVar];
  if (!email || !pw) { sk(`8.${kind} raw coordinates`, `set ${emailVar} / ${pwVar} to run`); return; }
  const token = await signIn(email, pw);
  if (!token) { no(`8.${kind} raw coordinates`, 'sign-in failed'); return; }

  // A row this caller can see that anon cannot: anything not published.
  const r = await rest('/properties?select=id,publication_status,location_precision&publication_status=neq.published&limit=1', token);
  const [row] = r.ok ? await r.json() : [];
  if (!row) { sk(`8.${kind} raw coordinates`, 'no unpublished listing visible to this account'); return; }

  const anonR = await rpc(row.id);
  const anonBody = anonR.ok ? await anonR.json() : null;
  Array.isArray(anonBody) && anonBody.length === 0
    ? ok(`9 unpublished listing invisible to anon`)
    : no(`9 unpublished listing invisible to anon`, JSON.stringify(anonBody));

  const pr = await rpc(row.id, token);
  const [prRow] = pr.ok ? await pr.json() : [];
  if (!prRow) { no(`8.${kind} raw coordinates`, 'privileged caller got no row'); return; }
  prRow.radius_m === 0
    ? ok(`8.${kind} raw coordinates`, `display_kind=${prRow.display_kind}, ungeneralised (radius 0)`)
    : no(`8.${kind} raw coordinates`, `was generalised: ${JSON.stringify(prRow)}`);

  // And the table column is still closed even to this privileged user.
  const direct = await rest(`/properties?select=latitude&id=eq.${row.id}`, token);
  direct.status === 403
    ? ok(`10.${kind} direct column read still refused`, 'HTTP 403 — RPC is the only path')
    : no(`10.${kind} direct column read still refused`, `HTTP ${direct.status}`);
}
await privileged('partner', 'MIZAN_PARTNER_EMAIL', 'MIZAN_PARTNER_PASSWORD');
await privileged('admin', 'MIZAN_ADMIN_EMAIL', 'MIZAN_ADMIN_PASSWORD');

console.log(`\n${fail === 0 ? 'ALL ASSERTED CHECKS PASSED' : 'FAILURES PRESENT'} — pass ${pass}, fail ${fail}, skip ${skip}`);
process.exit(fail === 0 ? 0 : 1);
