-- Llegadas: aceptar pase legacy o RSVP confirmado con rsvp_passes.
create or replace function private.require_arrival_pass()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if exists (select 1 from public.passes where profile_id = new.profile_id) then
    return new;
  end if;
  if exists (
    select 1
    from public.session_rsvps as r
    join public.rsvp_passes as rp on rp.rsvp_id = r.id
    where r.profile_id = new.profile_id
      and r.status = 'confirmed'
  ) then
    return new;
  end if;
  raise exception 'sin qr';
end;
$$;
