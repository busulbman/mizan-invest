-- =============================================================================
-- MIZAN INVEST — PHASE 1 · STEP 08 of 11
-- 20260914000800_favorites.sql
-- favorites + guest merge
-- =============================================================================
-- LOCKED DECISION: guest favorites remain LOCAL (AsyncStorage). On sign-in or
-- account creation the client calls merge_guest_favorites(), which folds them
-- into the server copy idempotently. Nothing a guest saved is ever lost, and
-- FavoritesContext's public API (isFavorite / toggleFavorite) is unchanged, so
-- no screen has to be rewritten.
-- =============================================================================

create table public.favorites (
  user_id     uuid not null references auth.users(id)        on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  created_at  timestamptz not null default now(),

  primary key (user_id, property_id)
);

comment on table public.favorites is
  'Composite PK makes de-duplication STRUCTURAL: a double-tap race cannot '
  'create two rows and the merge RPC is idempotent for free. No surrogate id, '
  'no deleted_at - un-favoriting is a genuine DELETE.';

create index idx_fav_user on public.favorites (user_id, created_at desc);
create index idx_fav_prop on public.favorites (property_id);

-- -----------------------------------------------------------------------------
-- favorite_count maintenance
-- -----------------------------------------------------------------------------
-- Sets mizan.internal so the properties guard permits the counter write.
-- Without it, favoriting a property would raise 42501 and fail outright:
-- auth.uid() is the favoriting USER, who is not an admin.
create or replace function public.tg_favorites_sync_count()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_prop uuid := coalesce(new.property_id, old.property_id);
begin
  perform set_config('mizan.internal', 'on', true);

  update public.properties p
     set favorite_count = (
       select count(*) from public.favorites f where f.property_id = p.id)
   where p.id = v_prop;

  perform set_config('mizan.internal', 'off', true);
  return null;
end;
$$;

create trigger trg_favorites_sync_count
  after insert or delete on public.favorites
  for each row execute function public.tg_favorites_sync_count();

-- -----------------------------------------------------------------------------
-- Guest -> authenticated merge
-- -----------------------------------------------------------------------------
-- SECURITY INVOKER is deliberate: the merge runs under the caller's RLS, so it
-- can only fold in properties the signed-in user is actually allowed to see.
-- A SECURITY DEFINER version would let a guest smuggle unpublished property
-- IDs into their favorites list.
create or replace function public.merge_guest_favorites(p_property_ids uuid[])
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_inserted integer;
begin
  if auth.uid() is null then
    raise exception 'sign in required' using errcode = '42501';
  end if;

  if p_property_ids is null or array_length(p_property_ids, 1) is null then
    return 0;
  end if;

  if array_length(p_property_ids, 1) > 500 then
    raise exception 'too many favorites in one merge' using errcode = '54000';
  end if;

  with candidates as (
    select p.id
    from public.properties p
    where p.id = any(p_property_ids)          -- RLS: visible rows only
  ),
  ins as (
    insert into public.favorites (user_id, property_id)
    select auth.uid(), c.id from candidates c
    on conflict (user_id, property_id) do nothing
    returning 1
  )
  select count(*) into v_inserted from ins;

  return v_inserted;
end;
$$;

revoke execute on function public.tg_favorites_sync_count()     from public, anon, authenticated;
revoke execute on function public.merge_guest_favorites(uuid[]) from public, anon, authenticated;

-- merge_guest_favorites() folds a guest's locally-stored favorites into their
-- server list on first sign-in. It requires a session (it raises if
-- auth.uid() is null), so anon is NOT granted.
grant execute on function public.merge_guest_favorites(uuid[]) to authenticated;

-- tg_favorites_sync_count is a trigger function: exposed to nobody.
