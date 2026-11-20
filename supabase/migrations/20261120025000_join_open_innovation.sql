create or replace function public.open_innovation_joined()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.innovation_consents
    where profile_id = auth.uid()
      and accepted_at is not null
  );
$$;

create or replace function public.join_open_innovation(raw_token text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'no autenticado';
  end if;
  if raw_token is null
    or char_length(raw_token) < 43
    or char_length(raw_token) > 80
    or raw_token !~ '^[A-Za-z0-9_-]+$' then
    raise exception 'token';
  end if;
  insert into public.innovation_consents (profile_id, token, accepted_at)
  values (uid, raw_token, now())
  on conflict (profile_id) do update
    set accepted_at = coalesce(public.innovation_consents.accepted_at, excluded.accepted_at);
end;
$$;

revoke all on function public.open_innovation_joined() from public, anon;
grant execute on function public.open_innovation_joined() to authenticated;

revoke all on function public.join_open_innovation(text) from public, anon;
grant execute on function public.join_open_innovation(text) to authenticated;
