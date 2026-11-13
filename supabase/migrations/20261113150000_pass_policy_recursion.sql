create or replace function private.profile_has_pass(target uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.passes where profile_id = target);
$$;

revoke all on function private.profile_has_pass(uuid) from public, anon;
grant execute on function private.profile_has_pass(uuid) to authenticated;

drop policy profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select to authenticated
  using (
    id = (select auth.uid())
    or (select private.is_superadmin())
    or (
      organization_id is not null
      and organization_id = (select private.current_organization_id())
      and (select private.current_role()) in ('director', 'capturista', 'invitador')
    )
    or (
      (select private.current_role()) = 'moderador'
      and (select private.profile_has_pass(id))
    )
  );

notify pgrst, 'reload schema';
