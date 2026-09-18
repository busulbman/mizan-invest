-- Keep anonymous published-media reads free of authenticated-only helpers.
-- A combined OR policy could attempt to evaluate my_partner_ids()/is_admin()
-- for anon signed-URL requests, whose EXECUTE privilege is deliberately absent.
drop policy if exists property_media_objects_select on storage.objects;

create policy property_media_objects_select_published on storage.objects
  for select to anon, authenticated
  using (
    bucket_id = 'property-media'
    and exists (
      select 1
      from public.property_media pm
      join public.properties p on p.id = pm.property_id
      where pm.storage_bucket = storage.objects.bucket_id
        and pm.storage_path = storage.objects.name
        and pm.deleted_at is null
        and p.publication_status = 'published'
        and p.deleted_at is null
    )
  );

create policy property_media_objects_select_partner on storage.objects
  for select to authenticated
  using (
    bucket_id = 'property-media'
    and exists (
      select 1 from public.properties p
      where p.id::text = (storage.foldername(storage.objects.name))[1]
        and p.partner_id in (select public.my_partner_ids())
    )
  );

create policy property_media_objects_select_admin on storage.objects
  for select to authenticated
  using (bucket_id = 'property-media' and public.is_admin());
