-- Inserta directo en lava_ledger (no llama award_lavas: ahí auth.uid() es null en el accept anónimo).
create or replace function public.award_lavas_for_consent(raw_token text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  pid uuid;
  cid uuid;
  base integer;
  boost boolean;
  mult numeric;
  flat integer;
  awarded integer;
  inserted integer;
begin
  if raw_token is null
    or char_length(raw_token) < 43
    or char_length(raw_token) > 80
    or raw_token !~ '^[A-Za-z0-9_-]+$' then
    return 0;
  end if;

  select ic.profile_id into pid
  from public.innovation_consents ic
  where ic.token = raw_token
    and ic.accepted_at is not null;
  if pid is null then return 0; end if;

  select c.id into cid from public.companies c where c.profile_id = pid;
  if cid is null then return 0; end if;

  select a.base_value, a.eia_boost into base, boost
  from public.lava_actions a
  where a.code = 'innovacion_aceptada' and a.active = true;
  if base is null then return 0; end if;

  select c.multiplier, c.flat_bonus into mult, flat
  from public.lava_boost_config c where c.id = 1;

  -- Al aceptar, la empresa ya es EIA: aplica boost si la acción lo pide.
  if boost then
    awarded := round(base * coalesce(mult, 1))::integer + coalesce(flat, 0);
  else
    awarded := base;
  end if;

  insert into public.lava_ledger
    (company_id, action_code, amount, ref_key, origen, created_by)
  values
    (cid, 'innovacion_aceptada', awarded, pid::text, 'live', pid)
  on conflict (company_id, action_code, ref_key) do nothing;

  get diagnostics inserted = row_count;
  if inserted = 0 then return 0; end if;
  return awarded;
end;
$$;

revoke all on function public.award_lavas_for_consent(text) from public;
grant execute on function public.award_lavas_for_consent(text) to anon, authenticated;
