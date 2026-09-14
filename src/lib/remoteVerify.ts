/**
 * ============================================
 * REMOTE CONNECTION VERIFICATION
 * ============================================
 *
 * A read-only smoke test against the production Supabase project. It proves
 * three things at once:
 *
 *   1. the client in `@/lib/supabase` reaches the remote project
 *   2. RLS lets an anonymous caller read published listings
 *   3. the listing -> translation -> partner joins resolve
 *
 * It runs once from the root layout and writes only to the development
 * console. Nothing here reads or replaces `mockData.ts`.
 *
 * Everything is SELECT-only. There is no insert, update or delete path here.
 */

import { getPublishedProperties, type RemoteProperty } from '@/lib/properties';

export interface VerifyResult {
  ok: boolean;
  rows: RemoteProperty[];
  error: string | null;
}

/**
 * Runs the query and prints the result. Console output only — this function
 * deliberately renders nothing and mutates no state.
 */
export async function logPublishedProperties(): Promise<VerifyResult> {
  console.log('[remote-verify] querying published properties…');

  try {
    const rows = await getPublishedProperties('en');

    console.log(`[remote-verify] ${rows.length} mapped published listing(s)`);
    rows.forEach((row, index) => {
      console.log(
        `[remote-verify] ${index + 1}. ${row.id}` +
          ` | ${row.title}` +
          ` | partner: ${row.partner.name}` +
          ` | ${row.price} ${row.priceCurrency}` +
          ` | ${row.city.name}, ${row.country.name}`
      );
    });

    return { ok: true, rows, error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[remote-verify] FAILED:', message);
    return { ok: false, rows: [], error: message };
  }
}
