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
 * NOTE: No database tables exist yet. This file only establishes the
 * connection — queries come later.
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

if (!supabaseUrl || !supabasePublishableKey) {
  // Fail loudly at startup rather than with a confusing network error
  // on the first query.
  throw new Error(
    'Supabase is not configured. Add EXPO_PUBLIC_SUPABASE_URL and ' +
      'EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY to your .env file and restart ' +
      'the dev server (env values are inlined at build time).'
  );
}

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
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
});

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
