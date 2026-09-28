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

import { useAuth } from '@/context/AuthContext';

/**
 * ============================================
 * ROLE-BASED LANDING
 * ============================================
 *
 * Where an authenticated person belongs, decided by the role the SERVER
 * granted them — never by which login screen they happened to open.
 *
 * Before this existed, landing was a property of the route you came from:
 * `investor-login` always pushed to customer Home and `partner-login` always
 * pushed to the Partner dashboard, while `splash` sent every authenticated
 * user to customer Home on any cold start. An admin had no path that reached
 * their own workspace, and a partner signing in through the investor screen
 * landed in the customer app.
 *
 * PRIORITY: admin / super_admin > partner > user.
 * `isAdmin` already covers both admin and super_admin.
 *
 * This is a CONVENIENCE, not a permission. RoleGate remains the authorization
 * boundary and RLS remains the real one; routing someone here grants them
 * nothing they could not already reach.
 */
export type LandingRoute = '/(admin)/dashboard' | '/(partner)/dashboard' | '/(main)/home';

/** Identity flags this helper needs. Kept structural so a freshly resolved
 *  sign-in result can be passed directly, without waiting for a re-render. */
export interface LandingIdentity {
  isAdmin: boolean;
  isPartner: boolean;
}

export function landingRouteForRole(identity: LandingIdentity | null | undefined): LandingRoute {
  if (!identity) return '/(main)/home';
  if (identity.isAdmin) return '/(admin)/dashboard';
  if (identity.isPartner) return '/(partner)/dashboard';
  return '/(main)/home';
}

/**
 * Landing route for the currently loaded identity.
 *
 * Safe against the wrong-workspace flash because the root layout holds every
 * screen behind a placeholder until `isLoading` clears, so roles are already
 * known by the time any screen that calls this can mount.
 *
 * Do NOT use this immediately after `signIn`/`signUp` in the same handler —
 * the hook value is from the previous render and would still be the old role.
 * Those call sites use the identity those functions return instead.
 */
export function useLandingRoute(): LandingRoute {
  const { isAdmin, isPartner } = useAuth();
  return landingRouteForRole({ isAdmin, isPartner });
}

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
