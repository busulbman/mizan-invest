/**
 * ============================================
 * BACK NAVIGATION
 * ============================================
 *
 * ROOT CAUSE OF THE "BACK GOES TO EXPLORE" BUG
 *
 * Settings, Profile, Favorites, Notifications, Partner application and
 * Property detail are NOT stack screens. They are declared as `Tabs.Screen` in
 * `(main)/_layout.tsx` and merely hidden from the bar with `href: null`.
 *
 * That has two consequences that together produced the bug:
 *
 *   1. `router.push('/(main)/settings')` is a TAB SWITCH, not a stack push, so
 *      there is no stack entry to pop.
 *   2. `router.back()` inside a tab navigator is resolved by the navigator's
 *      `backBehavior`. React Navigation's default is `firstRoute` — the FIRST
 *      screen declared in the navigator. In this app that is `explore`.
 *
 * So `canGoBack()` returned true and `back()` dutifully went to Explore. No
 * amount of `canGoBack()` guarding could have fixed it, because the guard was
 * never the thing that was wrong.
 *
 * THE FIX, IN TWO PARTS
 *
 *   a. `(main)/_layout.tsx` now sets `backBehavior="history"`, so a tab-level
 *      back returns to the previously visited tab instead of the first one.
 *      This is what makes Home → Property → Back land on Home and
 *      Explore → Property → Back land on Explore.
 *
 *   b. Screens with exactly ONE entry point do not rely on history at all —
 *      they name their parent through `goToParent`. For those screens the
 *      logical parent IS the previous screen, so this is both deterministic
 *      and correct, and it cannot be knocked off course by tab history.
 *
 * Explore is never a fallback anywhere. The generic safe root is Home.
 */

import { router } from 'expo-router';

/** Routes that may be used as a parent or a no-history fallback. */
export type BackTarget =
  | '/(main)/home'
  | '/(main)/profile'
  | '/(main)/settings'
  | '/(partner)/dashboard'
  | '/(partner)/properties'
  | '/(admin)/dashboard';

/**
 * Back for a screen with a single, known parent.
 *
 * Deliberately NOT `router.back()`. Inside the (main) tab navigator `back()`
 * is interpreted by `backBehavior` rather than by a real stack, so naming the
 * destination is the only way to be certain. `replace` rather than `push` so
 * the parent does not stack up on repeated visits.
 */
export function goToParent(parent: BackTarget): void {
  router.replace(parent);
}

/**
 * Back for a screen reachable from several places.
 *
 * Real history wins when it exists — that is what keeps
 * Home → Property → Back on Home and Explore → Property → Back on Explore.
 * The fallback only covers a cold start or a deep link straight onto the
 * screen, where there is genuinely nothing behind it.
 */
export function goBackOr(fallback: BackTarget): void {
  if (router.canGoBack()) {
    router.back();
    return;
  }

  router.replace(fallback);
}

/** Customer-facing default. Home, never Explore. */
export function goBackOrHome(): void {
  goBackOr('/(main)/home');
}
