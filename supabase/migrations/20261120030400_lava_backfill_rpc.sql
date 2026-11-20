create or replace function public.backfill_lavas()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  counts jsonb := '{"perfil":0,"evaluacion":0,"llegada":0,"consent":0,"reto":0}'::jsonb;
  awarded integer;
  r record;
begin
  if auth.uid() is null or not (select private.is_superadmin()) then
    raise exception 'solo superadmin';
  end if;

  for r in
    select c.id as company_id
    from public.companies c
    where coalesce(trim(c.website), '') <> ''
      and exists (
        select 1 from public.media_assets m
        where m.profile_id = c.profile_id and m.purpose = 'company_logo'
      )
  loop
    awarded := public.award_lavas(r.company_id, 'perfil_completo', 'perfil', 'backfill', null, null);
    if awarded > 0 then
      counts := jsonb_set(counts, '{perfil}', to_jsonb((counts->>'perfil')::int + 1));
    end if;
  end loop;

  for r in
    select c.id as company_id, run.instrument_id
    from public.methodology_v2_runs run
    join public.companies c on c.profile_id = run.profile_id
    where run.phase = 'done' and run.score is not null
  loop
    awarded := public.award_lavas(
      r.company_id, 'evaluacion_terminada', 'eval:' || r.instrument_id::text, 'backfill', null, null
    );
    if awarded > 0 then
      counts := jsonb_set(counts, '{evaluacion}', to_jsonb((counts->>'evaluacion')::int + 1));
    end if;
  end loop;

  for r in
    select c.id as company_id, a.profile_id
    from public.arrivals a
    join public.companies c on c.profile_id = a.profile_id
  loop
    awarded := public.award_lavas(
      r.company_id, 'asistencia_llego', r.profile_id::text, 'backfill', null, null
    );
    if awarded > 0 then
      counts := jsonb_set(counts, '{llegada}', to_jsonb((counts->>'llegada')::int + 1));
    end if;
  end loop;

  for r in
    select c.id as company_id, ic.profile_id
    from public.innovation_consents ic
    join public.companies c on c.profile_id = ic.profile_id
    where ic.accepted_at is not null
  loop
    awarded := public.award_lavas(
      r.company_id, 'innovacion_aceptada', r.profile_id::text, 'backfill', null, null
    );
    if awarded > 0 then
      counts := jsonb_set(counts, '{consent}', to_jsonb((counts->>'consent')::int + 1));
    end if;
  end loop;

  if to_regclass('public.challenges') is not null then
    for r in
      execute $q$
        select c.company_id, c.id
        from public.challenges c
        where c.status is distinct from 'borrador'
          and c.status is distinct from 'oculto'
      $q$
    loop
      awarded := public.award_lavas(
        r.company_id, 'reto_publicado', r.id::text, 'backfill', null, null
      );
      if awarded > 0 then
        counts := jsonb_set(counts, '{reto}', to_jsonb((counts->>'reto')::int + 1));
      end if;
    end loop;
  end if;

  return counts;
end;
$$;

revoke all on function public.backfill_lavas() from public, anon;
grant execute on function public.backfill_lavas() to authenticated;
