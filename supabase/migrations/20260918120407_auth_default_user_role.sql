-- =============================================================================
-- MIZAN INVEST — PHASE 4A
-- Every email/password signup receives the least-privileged application role.
--
-- `public.user_roles` remains the sole authorization source.  In particular,
-- no role is ever accepted from raw_user_meta_data, because a signed-in user
-- may change that metadata themselves.
-- =============================================================================

create or replace function public.tg_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name text;
begin
  v_name := nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), '');

  if v_name is not null and char_length(v_name) > 120 then
    v_name := left(v_name, 120);
  end if;

  if public.contains_contact_info(v_name) then
    v_name := null;
  end if;

  insert into public.profiles (id, full_name)
  values (new.id, v_name)
  on conflict (id) do nothing;

  -- This is deliberately a fixed, least-privileged role.  Partner and admin
  -- assignments stay server-authoritative in public.user_roles and cannot be
  -- supplied at signup or written from the mobile client.
  insert into public.user_roles (user_id, role)
  values (new.id, 'user'::public.app_role)
  on conflict (user_id, role) where revoked_at is null do nothing;

  return new;
end;
$$;
