-- Mesa: resolver QR de RSVP confirmado sin depender solo de mesa_rsvp_guest.
create or replace function public.mesa_lookup_code(p_code text)
returns table (
  kind text,
  rsvp_id uuid,
  profile_id uuid
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  code uuid;
  rid uuid;
  pid uuid;
begin
  if auth.uid() is null then
    return;
  end if;
  if (select private.current_role()) not in (
    'superadmin'::public.account_role,
    'moderador'::public.account_role
  ) then
    return;
  end if;

  begin
    code := nullif(btrim(p_code), '')::uuid;
  exception
    when invalid_text_representation then
      return;
  end;
  if code is null then
    return;
  end if;

  select r.id, r.profile_id into rid, pid
  from public.session_rsvps as r
  where r.id = code
    and r.status = 'confirmed';
  if rid is not null then
    kind := 'rsvp';
    rsvp_id := rid;
    profile_id := pid;
    return next;
    return;
  end if;

  if exists (select 1 from public.profiles as p where p.id = code) then
    kind := 'profile';
    rsvp_id := null;
    profile_id := code;
    return next;
  end if;
end;
$$;

revoke all on function public.mesa_lookup_code(text) from public, anon;
grant execute on function public.mesa_lookup_code(text) to authenticated;
