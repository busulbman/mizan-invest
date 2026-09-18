/**
 * ============================================
 * SUPABASE CLIENT
 * ============================================
 *
 * The single Supabase client for the whole app. Import it as
 * `import { supabase } from '@/lib/supabase'` — never call
 * `createClient` anywhere else, or the app ends up with two auth
 * sessions that disagree with each other.
 *
 * KEYS
 * Only the two EXPO_PUBLIC_ variables are read here. Those are the
 * publishable (anon) credentials, which are safe to ship inside the
 * app bundle because Row Level Security — not key secrecy — is what
 * protects the data.
 *
 * The service_role / secret key must NEVER appear in this file, in any
 * other client file, or in an EXPO_PUBLIC_ variable. Anything prefixed
 * EXPO_PUBLIC_ is inlined into the JavaScript bundle at build time and
 * can be read by anyone who downloads the app. Admin keys belong in a
 * server-side Edge Function.
 *
 * SESSION STORAGE
 * Sessions persist in `expo-sqlite/kv-store` (SQLite-backed, an
 * AsyncStorage-compatible drop-in), so a signed-in user stays signed in
 * across app restarts. On web there is no SQLite file, so the client
 * falls back to its own localStorage default.
 *
 * STARTUP SAFETY — DO NOT MAKE THIS MODULE THROW
 * This file is imported by AuthContext, which is imported by the root
 * layout, so it is evaluated while the JS bundle is still being loaded —
 * before React renders anything and before any error boundary exists.
 * A `throw` at this point is not a red box in a release build: React
 * Native escalates it through RCTFatal / RCTExceptionsManager, which
 * calls abort() and the app dies with SIGABRT about a third of a second
 * after launch.
 *
 * That is exactly what happened in TestFlight build 5. `.env` is
 * gitignored, so it is not in the archive EAS builds from; both
 * EXPO_PUBLIC_ variables were therefore undefined in the production
 * bundle and this module threw on import. It could never reproduce in
 * development, where the dev server loads `.env` and a throw only shows
 * a red box.
 *
 * Missing configuration is now reported, not fatal. The client is still
 * constructed — against an unroutable host — so every call fails as an
 * ordinary network error that callers already handle, and the app still
 * reaches a usable screen.
 */

import 'react-native-url-polyfill/auto';

import { AppState, Platform } from 'react-native';
import Storage from 'expo-sqlite/kv-store';
import { createClient } from '@supabase/supabase-js';

const isWeb = Platform.OS === 'web';

/**
 * Read literally, not through a helper or a computed key — Expo only
 * inlines `process.env.EXPO_PUBLIC_*` when it can see the full name in
 * the source at build time.
 */
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/**
 * Whether real credentials were compiled into this bundle.
 *
 * Callers can use this to skip work that is certain to fail, and the
 * value is a build-time fact: `EXPO_PUBLIC_*` is inlined by Metro, so it
 * cannot change at runtime.
 */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

if (!isSupabaseConfigured) {
  // Loud, but not fatal. See the STARTUP SAFETY note above: throwing here
  // aborts the process in a release build.
  console.error(
    '[supabase] Not configured: EXPO_PUBLIC_SUPABASE_URL and/or ' +
      'EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY are missing from this build. ' +
      'Locally, add them to .env. For EAS builds, set them as EAS ' +
      'environment variables — a gitignored .env is NOT uploaded to EAS. ' +
      'The app will run, but every Supabase request will fail.'
  );
}

/**
 * Placeholders used only when configuration is missing.
 *
 * `.invalid` is reserved by RFC 2606 and can never resolve, so a
 * misconfigured build fails fast and offline instead of quietly talking
 * to some other host. The string is still a syntactically valid URL,
 * which matters: `createClient` validates its argument and would throw
 * on a malformed one — reintroducing the very crash this avoids.
 */
const UNCONFIGURED_URL = 'https://unconfigured.invalid';
const UNCONFIGURED_KEY = 'unconfigured';

export const supabase = createClient(
  supabaseUrl ?? UNCONFIGURED_URL,
  supabasePublishableKey ?? UNCONFIGURED_KEY,
  {
    auth: {
      // Web has its own localStorage default; SQLite is native-only.
      storage: isWeb ? undefined : Storage,
      persistSession: true,
      autoRefreshToken: true,

      // Session-in-URL detection is a browser OAuth-redirect concern. On
      // a native app there is no URL to parse, and leaving it on makes
      // the client misread deep links.
      detectSessionInUrl: isWeb,
    },
  }
);

/**
 * Refresh tokens only while the app is in the foreground.
 *
 * Without this, the timer keeps firing in the background, wastes
 * battery, and can leave the session mid-refresh when iOS suspends the
 * process. The browser manages its own visibility, so this is native
 * only.
 */
if (!isWeb) {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}

export default supabase;
