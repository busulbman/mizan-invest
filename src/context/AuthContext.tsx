/**
 * Central authenticated identity and authorization state.
 *
 * Roles are fetched from public.user_roles, which is protected by RLS and is
 * never inferred from email addresses or editable Auth metadata. A partner
 * must have both the partner role and an active partner_members row.
 */

import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import * as Linking from 'expo-linking';
import type { EmailOtpType, Session, User } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';

export type AppRole = 'user' | 'partner' | 'admin' | 'super_admin';

export interface Profile {
  id: string;
  fullName: string | null;
  avatarPath: string | null;
  preferredLanguage: string;
  preferredCurrency: string;
}

export interface PartnerMembership {
  id: string;
  partnerId: string;
  memberRole: 'owner' | 'manager' | 'agent';
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  roles: AppRole[];
  partnerMemberships: PartnerMembership[];
  isAuthenticated: boolean;
  isAdmin: boolean;
  isPartner: boolean;
  isLoading: boolean;
  refresh: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (input: { email: string; password: string; fullName?: string }) => Promise<{ needsEmailConfirmation: boolean; error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
  sendPasswordReset: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (password: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function authRedirectUrl(path: string): string {
  return Linking.createURL(path);
}

function asAppRole(role: string): AppRole | null {
  return role === 'user' || role === 'partner' || role === 'admin' || role === 'super_admin'
    ? role
    : null;
}

function parseAuthUrl(url: string) {
  // Implicit-flow tokens are returned in the URL fragment. Expo Linking only
  // exposes normal query parameters, so normalize the fragment first.
  const normalized = url.includes('#') ? url.replace('#', '?') : url;
  return Linking.parse(normalized).queryParams ?? {};
}

export function AuthProvider({ children }: PropsWithChildren) {
  const mountedRef = useRef(true);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [partnerMemberships, setPartnerMemberships] = useState<PartnerMembership[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const clearIdentity = useCallback(() => {
    if (!mountedRef.current) return;
    setUser(null);
    setSession(null);
    setProfile(null);
    setRoles([]);
    setPartnerMemberships([]);
    setIsLoading(false);
  }, []);

  const loadIdentity = useCallback(async (nextSession: Session | null) => {
    if (!nextSession) {
      clearIdentity();
      return;
    }

    if (mountedRef.current) {
      setIsLoading(true);
      setSession(nextSession);
    }

    // Do not trust the session's embedded user object for identity. This
    // verifies the access token with Auth before issuing RLS-protected reads.
    //
    // Wrapped because this is on the startup path: the root layout renders a
    // blank placeholder until isLoading clears, so a THROWN network error
    // (unreachable host, DNS failure, an unconfigured build) would strand the
    // app on that placeholder rather than showing a signed-out screen.
    let userData;
    try {
      const result = await supabase.auth.getUser();
      if (result.error || !result.data.user) {
        clearIdentity();
        return;
      }
      userData = result.data;
    } catch (error) {
      console.warn('[auth] Could not verify the session; continuing signed out.', error);
      clearIdentity();
      return;
    }

    const authenticatedUser = userData.user;
    // Promise.all rejects on the first failure, so this is guarded for the same
    // reason as above — a rejection here would leave isLoading stuck true.
    let profileResult;
    let rolesResult;
    let membershipsResult;
    try {
      [profileResult, rolesResult, membershipsResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, full_name, avatar_path, preferred_language, preferred_currency')
          .eq('id', authenticatedUser.id)
          .maybeSingle(),
        supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', authenticatedUser.id)
          .is('revoked_at', null),
        supabase
          .from('partner_members')
          .select('id, partner_id, member_role')
          .eq('user_id', authenticatedUser.id)
          .eq('is_active', true),
      ]);
    } catch (error) {
      // Fail closed on authorization: the person stays signed in, but holds no
      // management role in the UI until a read succeeds.
      console.warn('[auth] Identity reads failed; continuing with no roles.', error);
      if (mountedRef.current) {
        setUser(authenticatedUser);
        setSession(nextSession);
        setProfile(null);
        setRoles([]);
        setPartnerMemberships([]);
        setIsLoading(false);
      }
      return;
    }

    // An authorization read error is fail-closed: the person remains signed
    // in, but is granted no management role in the app UI.
    const nextRoles = rolesResult.error
      ? []
      : (rolesResult.data ?? [])
          .map((row) => asAppRole(row.role))
          .filter((role): role is AppRole => role !== null);
    const nextMemberships = membershipsResult.error
      ? []
      : (membershipsResult.data ?? []).map((row) => ({
          id: row.id,
          partnerId: row.partner_id,
          memberRole: row.member_role as PartnerMembership['memberRole'],
        }));

    if (!mountedRef.current) return;

    setUser(authenticatedUser);
    setSession(nextSession);
    setProfile(
      profileResult.data
        ? {
            id: profileResult.data.id,
            fullName: profileResult.data.full_name,
            avatarPath: profileResult.data.avatar_path,
            preferredLanguage: profileResult.data.preferred_language,
            preferredCurrency: profileResult.data.preferred_currency,
          }
        : null,
    );
    setRoles(nextRoles);
    setPartnerMemberships(nextMemberships);
    setIsLoading(false);
  }, [clearIdentity]);

  const refresh = useCallback(async () => {
    // Never rejects: callers use this for a pull-to-refresh or a soft restart,
    // and an unhandled rejection there would be a startup-path hazard again.
    try {
      const { data } = await supabase.auth.getSession();
      await loadIdentity(data.session);
    } catch (error) {
      console.warn('[auth] Refresh failed; leaving identity unchanged.', error);
    }
  }, [loadIdentity]);

  const handleInboundAuthUrl = useCallback(async (url: string) => {
    const params = parseAuthUrl(url);
    const code = typeof params.code === 'string' ? params.code : null;
    const accessToken = typeof params.access_token === 'string' ? params.access_token : null;
    const refreshToken = typeof params.refresh_token === 'string' ? params.refresh_token : null;
    const tokenHash = typeof params.token_hash === 'string' ? params.token_hash : null;
    const type = typeof params.type === 'string' ? params.type as EmailOtpType : null;

    if (code) {
      await supabase.auth.exchangeCodeForSession(code);
      return;
    }

    if (tokenHash && type) {
      await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
      return;
    }

    if (accessToken && refreshToken) {
      await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    // Every entry point into loadIdentity gets a catch. An unhandled rejection
    // on this path would leave isLoading true and the app on a blank screen.
    void supabase.auth
      .getSession()
      .then(({ data }) => loadIdentity(data.session))
      .catch((error) => {
        console.warn('[auth] Could not read the stored session; continuing signed out.', error);
        clearIdentity();
      });

    const { data: subscriptionData } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void loadIdentity(nextSession).catch(() => clearIdentity());
    });
    const linkingSubscription = Linking.addEventListener('url', ({ url }) => {
      void handleInboundAuthUrl(url);
    });
    void Linking.getInitialURL().then((url) => {
      if (url) void handleInboundAuthUrl(url);
    });

    return () => {
      mountedRef.current = false;
      subscriptionData.subscription.unsubscribe();
      linkingSubscription.remove();
    };
  }, [clearIdentity, handleInboundAuthUrl, loadIdentity]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (!error) await loadIdentity(data.session);
    return { error: error ? new Error(error.message) : null };
  }, [loadIdentity]);

  const signUp = useCallback(async ({ email, password, fullName }: { email: string; password: string; fullName?: string }) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: fullName?.trim() ? { full_name: fullName.trim() } : undefined,
        emailRedirectTo: authRedirectUrl('auth-complete'),
      },
    });
    if (!error && data.session) await loadIdentity(data.session);
    return { needsEmailConfirmation: !error && !data.session, error: error ? new Error(error.message) : null };
  }, [loadIdentity]);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) clearIdentity();
    return { error: error ? new Error(error.message) : null };
  }, [clearIdentity]);

  const sendPasswordReset = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: authRedirectUrl('reset-password'),
    });
    return { error: error ? new Error(error.message) : null };
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    return { error: error ? new Error(error.message) : null };
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const isAdmin = roles.includes('admin') || roles.includes('super_admin');
    return {
      user,
      session,
      profile,
      roles,
      partnerMemberships,
      isAuthenticated: user !== null && session !== null,
      isAdmin,
      isPartner: roles.includes('partner') && partnerMemberships.length > 0,
      isLoading,
      refresh,
      signIn,
      signUp,
      signOut,
      sendPasswordReset,
      updatePassword,
    };
  }, [partnerMemberships, profile, refresh, roles, sendPasswordReset, session, signIn, signOut, signUp, isLoading, updatePassword, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
