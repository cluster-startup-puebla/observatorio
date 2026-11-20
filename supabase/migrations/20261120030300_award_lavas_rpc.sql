create or replace function public.award_lavas(
  p_company_id uuid,
  p_action_code text,
  p_ref_key text,
  p_origen text,
  p_note text default null,
  p_manual_amount integer default null
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  base integer;
  boost boolean;
  once_flag boolean;
  mult numeric;
  flat integer;
  is_eia boolean;
  awarded integer;
  inserted integer;
begin
  if uid is null then
    raise exception 'no autenticado';
  end if;
  if p_origen not in ('live', 'backfill', 'manual') then
    raise exception 'origen';
  end if;
  if p_origen = 'manual' and not (select private.is_superadmin()) then
    raise exception 'solo superadmin';
  end if;
  if p_origen = 'backfill' and not (select private.is_superadmin()) then
    raise exception 'solo superadmin';
  end if;

  select a.base_value, a.eia_boost, a.once
    into base, boost, once_flag
  from public.lava_actions a
  where a.code = p_action_code and a.active = true;

  if base is null and p_action_code <> 'ajuste_manual' then
    raise exception 'accion';
  end if;

  if p_action_code = 'ajuste_manual' then
    if p_manual_amount is null then
      raise exception 'monto';
    end if;
    awarded := p_manual_amount;
  else
    select c.multiplier, c.flat_bonus into mult, flat
    from public.lava_boost_config c where c.id = 1;

    select exists (
      select 1
      from public.companies co
      join public.innovation_consents ic on ic.profile_id = co.profile_id
      where co.id = p_company_id
        and ic.accepted_at is not null
    ) into is_eia;

    if boost and is_eia then
      awarded := round(base * coalesce(mult, 1))::integer + coalesce(flat, 0);
    else
      awarded := base;
    end if;
  end if;

  insert into public.lava_ledger
    (company_id, action_code, amount, ref_key, origen, note, created_by)
  values
    (p_company_id, p_action_code, awarded, p_ref_key, p_origen, p_note, uid)
  on conflict (company_id, action_code, ref_key) do nothing;

  get diagnostics inserted = row_count;
  if inserted = 0 then
    return 0;
  end if;
  return awarded;
end;
$$;

revoke all on function public.award_lavas(uuid, text, text, text, text, integer) from public, anon;
grant execute on function public.award_lavas(uuid, text, text, text, text, integer) to authenticated;
