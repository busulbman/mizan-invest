-- Public partner profile capability: languages are safe catalogue metadata;
-- applicant phone/email remain exclusively on partner_applications.
alter table public.partners
  add column if not exists languages public.app_language[] not null default array['en']::public.app_language[];

alter table public.partners
  add constraint partners_languages_count check (cardinality(languages) between 1 and 4) not valid;
alter table public.partners validate constraint partners_languages_count;

create or replace function public.tg_partner_application_sync_public_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'approved'
     and old.status = 'pending'
     and new.partner_id is not null then
    perform set_config('mizan.internal', 'on', true);
    update public.partners
      set languages = new.languages
      where id = new.partner_id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_partner_application_sync_public_profile on public.partner_applications;
create trigger trg_partner_application_sync_public_profile
  after update of status, partner_id on public.partner_applications
  for each row execute function public.tg_partner_application_sync_public_profile();

revoke execute on function public.tg_partner_application_sync_public_profile() from public, anon, authenticated;
