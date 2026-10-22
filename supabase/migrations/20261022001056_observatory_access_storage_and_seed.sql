create or replace function private.current_role()
returns public.account_role
language sql
stable
security definer
set search_path = ''
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function private.current_organization_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select organization_id from public.profiles where id = auth.uid()
$$;

create or replace function private.is_superadmin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(private.current_role() = 'superadmin', false)
$$;

revoke all on schema private from public;
grant usage on schema private to authenticated, service_role;
revoke all on all functions in schema private from public, anon;
grant execute on all functions in schema private to authenticated, service_role;

alter table public.sectors enable row level security;
alter table public.sector_pages enable row level security;
alter table public.sessions enable row level security;
alter table public.session_topics enable row level security;
alter table public.content_blocks enable row level security;
alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.crm_contacts enable row level security;
alter table public.crm_events enable row level security;
alter table public.link_copies enable row level security;
alter table public.media_assets enable row level security;
alter table public.passes enable row level security;
alter table public.arrivals enable row level security;
alter table public.instrument_sections enable row level security;
alter table public.section_bands enable row level security;
alter table public.integral_bands enable row level security;
alter table public.questions enable row level security;
alter table public.question_options enable row level security;
alter table public.question_conditions enable row level security;
alter table public.response_choices enable row level security;
alter table public.outbox_messages enable row level security;

alter table public.sectors force row level security;
alter table public.sector_pages force row level security;
alter table public.sessions force row level security;
alter table public.session_topics force row level security;
alter table public.content_blocks force row level security;
alter table public.organizations force row level security;
alter table public.profiles force row level security;
alter table public.companies force row level security;
alter table public.crm_contacts force row level security;
alter table public.crm_events force row level security;
alter table public.link_copies force row level security;
alter table public.media_assets force row level security;
alter table public.passes force row level security;
alter table public.arrivals force row level security;
alter table public.instrument_sections force row level security;
alter table public.section_bands force row level security;
alter table public.integral_bands force row level security;
alter table public.questions force row level security;
alter table public.question_options force row level security;
alter table public.question_conditions force row level security;
alter table public.response_choices force row level security;
alter table public.outbox_messages force row level security;

grant select on public.sectors to anon, authenticated;
grant select on public.sector_pages to anon, authenticated;
grant select on public.sessions to anon, authenticated;
grant select on public.session_topics to anon, authenticated;
grant select on public.content_blocks to anon, authenticated;
grant select on public.instrument_sections to anon, authenticated;
grant select on public.section_bands to anon, authenticated;
grant select on public.integral_bands to anon, authenticated;
grant select on public.questions to anon, authenticated;
grant select on public.question_options to anon, authenticated;
grant select on public.question_conditions to anon, authenticated;
grant select on public.organizations to anon, authenticated;

grant select, insert, update, delete on public.sectors to authenticated;
grant select, insert, update, delete on public.sector_pages to authenticated;
grant select, insert, update, delete on public.sessions to authenticated;
grant select, insert, update, delete on public.session_topics to authenticated;
grant select, insert, update, delete on public.content_blocks to authenticated;
grant select, insert, update, delete on public.organizations to authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.companies to authenticated;
grant select, insert, update, delete on public.crm_contacts to authenticated;
grant select, insert, update, delete on public.crm_events to authenticated;
grant select, insert, update, delete on public.link_copies to authenticated;
grant select, insert, update, delete on public.media_assets to authenticated;
grant select, insert, update, delete on public.passes to authenticated;
grant select, insert, update, delete on public.arrivals to authenticated;
grant select, insert, update, delete on public.instrument_sections to authenticated;
grant select, insert, update, delete on public.section_bands to authenticated;
grant select, insert, update, delete on public.integral_bands to authenticated;
grant select, insert, update, delete on public.questions to authenticated;
grant select, insert, update, delete on public.question_options to authenticated;
grant select, insert, update, delete on public.question_conditions to authenticated;
grant select, insert, update, delete on public.response_choices to authenticated;
grant select, insert, update, delete on public.outbox_messages to authenticated;

grant select on public.crm_contact_status to authenticated;
grant select on public.methodology_progress to authenticated;
grant select on public.event_conversion to authenticated;

create policy sectors_public_read on public.sectors
  for select to anon, authenticated
  using (true);

create policy sectors_superadmin_write on public.sectors
  for all to authenticated
  using (private.is_superadmin())
  with check (private.is_superadmin());

create policy sector_pages_public_read on public.sector_pages
  for select to anon, authenticated
  using (true);

create policy sector_pages_superadmin_write on public.sector_pages
  for all to authenticated
  using (private.is_superadmin())
  with check (private.is_superadmin());

create policy sessions_public_read on public.sessions
  for select to anon, authenticated
  using (true);

create policy sessions_superadmin_write on public.sessions
  for all to authenticated
  using (private.is_superadmin())
  with check (private.is_superadmin());

create policy session_topics_public_read on public.session_topics
  for select to anon, authenticated
  using (true);

create policy session_topics_superadmin_write on public.session_topics
  for all to authenticated
  using (private.is_superadmin())
  with check (private.is_superadmin());

create policy content_blocks_public_read on public.content_blocks
  for select to anon, authenticated
  using (true);

create policy content_blocks_superadmin_write on public.content_blocks
  for all to authenticated
  using (private.is_superadmin())
  with check (private.is_superadmin());

create policy instrument_sections_public_read on public.instrument_sections
  for select to anon, authenticated
  using (true);

create policy instrument_sections_superadmin_write on public.instrument_sections
  for all to authenticated
  using (private.is_superadmin())
  with check (private.is_superadmin());

create policy section_bands_public_read on public.section_bands
  for select to anon, authenticated
  using (true);

create policy section_bands_superadmin_write on public.section_bands
  for all to authenticated
  using (private.is_superadmin())
  with check (private.is_superadmin());

create policy integral_bands_public_read on public.integral_bands
  for select to anon, authenticated
  using (true);

create policy integral_bands_superadmin_write on public.integral_bands
  for all to authenticated
  using (private.is_superadmin())
  with check (private.is_superadmin());

create policy questions_public_read on public.questions
  for select to anon, authenticated
  using (true);

create policy questions_superadmin_write on public.questions
  for all to authenticated
  using (private.is_superadmin())
  with check (private.is_superadmin());

create policy question_options_public_read on public.question_options
  for select to anon, authenticated
  using (true);

create policy question_options_superadmin_write on public.question_options
  for all to authenticated
  using (private.is_superadmin())
  with check (private.is_superadmin());

create policy question_conditions_public_read on public.question_conditions
  for select to anon, authenticated
  using (true);

create policy question_conditions_superadmin_write on public.question_conditions
  for all to authenticated
  using (private.is_superadmin())
  with check (private.is_superadmin());

create policy organizations_public_brand on public.organizations
  for select to anon
  using (brand_completed_at is not null);

create policy organizations_authenticated_brand on public.organizations
  for select to authenticated
  using (brand_completed_at is not null or private.is_superadmin());

create policy organizations_member_read on public.organizations
  for select to authenticated
  using (id = private.current_organization_id());

create policy organizations_director_update on public.organizations
  for update to authenticated
  using (
    private.current_role() = 'director'
    and id = private.current_organization_id()
  )
  with check (
    private.current_role() = 'director'
    and id = private.current_organization_id()
  );

create policy organizations_superadmin_write on public.organizations
  for all to authenticated
  using (private.is_superadmin())
  with check (private.is_superadmin());

create policy profiles_select_own on public.profiles
  for select to authenticated
  using (id = auth.uid() or private.is_superadmin());

create policy profiles_select_same_org on public.profiles
  for select to authenticated
  using (
    organization_id is not null
    and organization_id = private.current_organization_id()
    and private.current_role() in ('director', 'capturista', 'invitador')
  );

create policy profiles_select_desk on public.profiles
  for select to authenticated
  using (
    private.current_role() in ('superadmin', 'moderador')
    and exists (
      select 1 from public.passes where passes.profile_id = profiles.id
    )
  );

create policy profiles_insert_empresario on public.profiles
  for insert to authenticated
  with check (
    id = auth.uid()
    and role = 'empresario'
    and organization_id is null
  );

create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and role = private.current_role()
    and organization_id is not distinct from private.current_organization_id()
  );

create policy profiles_superadmin_write on public.profiles
  for all to authenticated
  using (private.is_superadmin())
  with check (private.is_superadmin());

create policy companies_own on public.companies
  for all to authenticated
  using (profile_id = auth.uid() or private.is_superadmin())
  with check (profile_id = auth.uid() or private.is_superadmin());

create policy crm_contacts_org_read on public.crm_contacts
  for select to authenticated
  using (
    private.is_superadmin()
    or (
      organization_id = private.current_organization_id()
      and private.current_role() in ('director', 'capturista', 'invitador')
    )
  );

create policy crm_contacts_org_insert on public.crm_contacts
  for insert to authenticated
  with check (
    private.is_superadmin()
    or (
      organization_id = private.current_organization_id()
      and private.current_role() in ('director', 'capturista', 'invitador')
    )
  );

create policy crm_contacts_org_update on public.crm_contacts
  for update to authenticated
  using (
    private.is_superadmin()
    or (
      organization_id = private.current_organization_id()
      and private.current_role() in ('director', 'capturista')
    )
  )
  with check (
    private.is_superadmin()
    or (
      organization_id = private.current_organization_id()
      and private.current_role() in ('director', 'capturista')
    )
  );

create policy crm_events_org_read on public.crm_events
  for select to authenticated
  using (
    private.is_superadmin()
    or exists (
      select 1
      from public.crm_contacts
      where crm_contacts.id = crm_events.contact_id
        and crm_contacts.organization_id = private.current_organization_id()
        and private.current_role() in ('director', 'capturista', 'invitador')
    )
    or (
      event = 'llegar'
      and private.current_role() = 'moderador'
    )
  );

create policy crm_events_cargar on public.crm_events
  for insert to authenticated
  with check (
    event = 'cargar'
    and (
      private.is_superadmin()
      or exists (
        select 1
        from public.crm_contacts
        where crm_contacts.id = crm_events.contact_id
          and crm_contacts.organization_id = private.current_organization_id()
          and private.current_role() in ('director', 'capturista', 'invitador')
      )
    )
  );

create policy crm_events_follow_up on public.crm_events
  for insert to authenticated
  with check (
    event in ('contactar', 'rechazar')
    and (
      private.is_superadmin()
      or exists (
        select 1
        from public.crm_contacts
        where crm_contacts.id = crm_events.contact_id
          and crm_contacts.organization_id = private.current_organization_id()
          and private.current_role() in ('director', 'capturista')
      )
    )
  );

create policy crm_events_arrival on public.crm_events
  for insert to authenticated
  with check (
    event = 'llegar'
    and private.current_role() in ('superadmin', 'moderador')
  );

create policy link_copies_read on public.link_copies
  for select to authenticated
  using (
    private.is_superadmin()
    or (
      organization_id = private.current_organization_id()
      and private.current_role() in ('director', 'capturista', 'invitador')
    )
  );

create policy link_copies_insert on public.link_copies
  for insert to authenticated
  with check (
    actor_id = auth.uid()
    and (
      private.is_superadmin()
      or (
        organization_id = private.current_organization_id()
        and private.current_role() in ('director', 'invitador')
      )
    )
  );

create policy media_select on public.media_assets
  for select to authenticated
  using (
    private.is_superadmin()
    or uploaded_by = auth.uid()
    or profile_id = auth.uid()
    or (
      purpose = 'organization_logo'
      and organization_id = private.current_organization_id()
      and private.current_role() = 'director'
    )
    or (
      purpose = 'pass_qr'
      and private.current_role() = 'moderador'
    )
  );

create policy media_logo_write on public.media_assets
  for insert to authenticated
  with check (
    purpose = 'organization_logo'
    and uploaded_by = auth.uid()
    and organization_id = private.current_organization_id()
    and private.current_role() = 'director'
  );

create policy media_logo_update on public.media_assets
  for update to authenticated
  using (
    purpose = 'organization_logo'
    and organization_id = private.current_organization_id()
    and private.current_role() = 'director'
  )
  with check (
    purpose = 'organization_logo'
    and organization_id = private.current_organization_id()
    and private.current_role() = 'director'
  );

create policy media_pass_write on public.media_assets
  for insert to authenticated
  with check (
    purpose = 'pass_qr'
    and profile_id = auth.uid()
    and uploaded_by = auth.uid()
    and exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.onboarded_at is not null
    )
  );

create policy media_content_write on public.media_assets
  for all to authenticated
  using (purpose = 'content_image' and private.is_superadmin())
  with check (purpose = 'content_image' and private.is_superadmin());

create policy media_superadmin_all on public.media_assets
  for all to authenticated
  using (private.is_superadmin())
  with check (private.is_superadmin());

create policy passes_select on public.passes
  for select to authenticated
  using (
    profile_id = auth.uid()
    or private.current_role() in ('superadmin', 'moderador')
  );

create policy passes_insert_own on public.passes
  for insert to authenticated
  with check (profile_id = auth.uid());

create policy arrivals_select on public.arrivals
  for select to authenticated
  using (
    profile_id = auth.uid()
    or private.current_role() in ('superadmin', 'moderador')
  );

create policy arrivals_insert_desk on public.arrivals
  for insert to authenticated
  with check (
    scanned_by = auth.uid()
    and private.current_role() in ('superadmin', 'moderador')
  );

create policy responses_own on public.response_choices
  for all to authenticated
  using (profile_id = auth.uid() or private.is_superadmin())
  with check (
    (profile_id = auth.uid() and private.current_role() = 'empresario')
    or private.is_superadmin()
  );

create policy responses_panel_read on public.response_choices
  for select to authenticated
  using (private.current_role() in ('superadmin', 'moderador'));

create policy outbox_superadmin_read on public.outbox_messages
  for select to authenticated
  using (private.is_superadmin());

create policy outbox_open_innovation_insert on public.outbox_messages
  for insert to authenticated
  with check (
    kind = 'open_innovation'
    and created_by = auth.uid()
    and private.is_superadmin()
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'organization-logos',
    'organization-logos',
    false,
    2097152,
    array['image/png', 'image/jpeg', 'image/webp']
  ),
  (
    'pass-images',
    'pass-images',
    false,
    524288,
    array['image/png']
  ),
  (
    'content-images',
    'content-images',
    false,
    4194304,
    array['image/png', 'image/jpeg', 'image/webp']
  )
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy storage_logo_director_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'organization-logos'
    and (storage.foldername(name))[1] = private.current_organization_id()::text
    and private.current_role() = 'director'
  );

create policy storage_logo_director_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'organization-logos'
    and (storage.foldername(name))[1] = private.current_organization_id()::text
    and private.current_role() = 'director'
  );

create policy storage_logo_director_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'organization-logos'
    and (storage.foldername(name))[1] = private.current_organization_id()::text
    and private.current_role() = 'director'
  )
  with check (
    bucket_id = 'organization-logos'
    and (storage.foldername(name))[1] = private.current_organization_id()::text
    and private.current_role() = 'director'
  );

create policy storage_logo_director_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'organization-logos'
    and (storage.foldername(name))[1] = private.current_organization_id()::text
    and private.current_role() = 'director'
  );

create policy storage_pass_owner_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'pass-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy storage_pass_owner_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'pass-images'
    and (storage.foldername(name))[1] = auth.uid()::text
    and exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.onboarded_at is not null
    )
  );

create policy storage_pass_owner_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'pass-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'pass-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy storage_pass_desk_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'pass-images'
    and private.current_role() in ('superadmin', 'moderador')
  );

create policy storage_superadmin_all on storage.objects
  for all to authenticated
  using (
    bucket_id in ('organization-logos', 'pass-images', 'content-images')
    and private.is_superadmin()
  )
  with check (
    bucket_id in ('organization-logos', 'pass-images', 'content-images')
    and private.is_superadmin()
  );

insert into public.sectors (slug, name, position)
values
  ('automotriz-y-autopartes', 'Automotriz y autopartes', 1),
  ('dispositivos-medicos', 'Dispositivos médicos', 2),
  ('textil-y-confeccion', 'Textil y confección', 3),
  ('alimentos-y-bebidas', 'Alimentos y bebidas', 4),
  ('mueble-y-madera', 'Mueble y madera', 5),
  ('metalmecanica', 'Metalmecánica', 6),
  ('construccion', 'Construcción', 7),
  ('quimica', 'Química', 8),
  ('artes-graficas-y-empaque', 'Artes gráficas y empaque', 9),
  ('plasticos-y-hule', 'Plásticos y hule', 10),
  ('minerales-no-metalicos', 'Minerales no metálicos', 11),
  ('tecnologia-y-servicios-de-ti', 'Tecnología y servicios de TI', 12),
  ('turismo', 'Turismo', 13),
  ('logistica', 'Logística', 14);

insert into public.sessions (
  venue,
  format_name,
  starts_local,
  ends_local,
  capacity_min,
  capacity_max,
  audience,
  includes,
  is_current
)
values (
  'Quinta Real, Puebla',
  'Desayuno ejecutivo',
  '08:00',
  '12:00',
  15,
  30,
  'Dueños, dirección general, operaciones o TI',
  'Desayuno durante la ponencia',
  true
);

insert into public.session_topics (session_id, position, title)
select id, topic.position, topic.title
from public.sessions
cross join (
  values
    (1, 'Infraestructura y digitalización'),
    (2, 'Situación del equipo productivo'),
    (3, 'Gestión financiera y costos'),
    (4, 'Operación, paros y calidad')
) as topic (position, title)
where is_current;

insert into public.content_blocks (slug, title, body)
values
  (
    'objetivo',
    'Lo que Puebla no sabe que necesita, tu empresa puede decirlo primero.',
    'Participa en la sesión de tu sector, ayuda a construir el primer Observatorio Tecnológico del estado y sé de los primeros en probar las soluciones que surjan, en tu propia empresa.'
  ),
  (
    'via-partners',
    'Puebla ante el T-MEC',
    'Cifras, gráficas y la estrategia del diagnóstico de VIA Partners. Para quien quiere leerlo antes de la sesión.'
  );

insert into public.instrument_sections (id, name, position, range_kind)
values
  ('infraestructura', 'Infraestructura y digitalización', 1, 'high'),
  ('equipo_productivo', 'Situación del equipo productivo', 2, 'low'),
  ('financiera', 'Gestión financiera y costos', 3, 'low'),
  ('operacion', 'Operación, paros y calidad', 4, 'high');

insert into public.section_bands (section_id, level, min_score, max_score, riesgo, reto)
select
  band.section_id,
  band.level::public.level_name,
  band.min_score,
  band.max_score,
  copy.riesgo,
  copy.reto
from (
  values
    ('infraestructura', 'bronce', 5, 12),
    ('infraestructura', 'plata', 13, 22),
    ('infraestructura', 'oro', 23, 30),
    ('operacion', 'bronce', 5, 12),
    ('operacion', 'plata', 13, 22),
    ('operacion', 'oro', 23, 30),
    ('equipo_productivo', 'bronce', 4, 10),
    ('equipo_productivo', 'plata', 11, 18),
    ('equipo_productivo', 'oro', 19, 24),
    ('financiera', 'bronce', 4, 10),
    ('financiera', 'plata', 11, 18),
    ('financiera', 'oro', 19, 24)
) as band (section_id, level, min_score, max_score)
join (
  values
    (
      'bronce',
      'La operación depende de registros sueltos y de la persona que los recuerda.',
      'Dejar un registro mínimo que otra persona pueda retomar.'
    ),
    (
      'plata',
      'Hay método, pero se corta cuando cambia el turno o el proveedor.',
      'Volver repetible lo que ya funciona en los mejores días.'
    ),
    (
      'oro',
      'El riesgo principal es dejar de medir lo que ya está estable.',
      'Sostener el nivel y compartir la práctica con el sector.'
    )
) as copy (level, riesgo, reto) on copy.level = band.level;

insert into public.integral_bands (level, min_score, max_score, riesgo, reto)
values
  (
    'bronce',
    18,
    53,
    'La operación depende de registros sueltos y de la persona que los recuerda.',
    'Dejar un registro mínimo que otra persona pueda retomar.'
  ),
  (
    'plata',
    54,
    89,
    'Hay método, pero se corta cuando cambia el turno o el proveedor.',
    'Volver repetible lo que ya funciona en los mejores días.'
  ),
  (
    'oro',
    90,
    108,
    'El riesgo principal es dejar de medir lo que ya está estable.',
    'Sostener el nivel y compartir la práctica con el sector.'
  );

insert into public.questions (id, section_id, position, prompt, kind)
values
  (1, 'infraestructura', 1, '¿Dónde vive hoy el registro de la operación?', 'single'),
  (2, 'infraestructura', 2, '¿La información de producción se puede consultar sin pedirla a una persona?', 'single'),
  (3, 'infraestructura', 3, '¿Los equipos críticos tienen un identificador y un responsable?', 'single'),
  (4, 'infraestructura', 4, '¿Hay respaldo de la información que no cabe perder?', 'single'),
  (5, 'infraestructura', 5, '¿El piso y la oficina ven los mismos números?', 'single'),
  (6, 'equipo_productivo', 1, '¿El equipo principal trabaja dentro de su capacidad real?', 'single'),
  (7, 'equipo_productivo', 2, '¿El mantenimiento se hace antes de que el equipo falle?', 'single'),
  (8, 'equipo_productivo', 3, '¿Hay refacciones críticas sin depender de un solo proveedor?', 'single'),
  (9, 'equipo_productivo', 4, '¿Se mide la disponibilidad del equipo, no solo si arrancó?', 'single'),
  (10, 'financiera', 1, '¿El costo del producto se recalcula cuando cambian los insumos?', 'single'),
  (11, 'financiera', 2, '¿Se distingue el gasto de operar del gasto de crecer?', 'single'),
  (12, 'financiera', 3, '¿La cobranza tiene fecha y responsable?', 'single'),
  (13, 'financiera', 4, '¿Una decisión de precio se puede explicar con números propios?', 'single'),
  (14, 'operacion', 1, '¿Un paro queda registrado con causa y duración?', 'single'),
  (15, 'operacion', 2, '¿La calidad se revisa antes de que el cliente la encuentre?', 'single'),
  (16, 'operacion', 3, '¿El cambio de producto tiene un método, no solo prisa?', 'single'),
  (17, 'operacion', 4, '¿El retrabajo se cuenta aparte de la producción buena?', 'single'),
  (18, 'operacion', 5, 'Ordena la causa que más te frena hoy. El 1 es la más grave.', 'priority');

insert into public.question_options (question_id, value, label, position, points)
values
  (1, 'a', 'Papel/Bitácoras', 1, 1),
  (1, 'b', 'Hojas de cálculo sueltas', 2, 2),
  (1, 'c', 'Un sistema, sin cruce entre áreas', 3, 4),
  (1, 'd', 'Un sistema compartido y al día', 4, 6);

insert into public.question_options (question_id, value, label, position, points)
select questions.id, option.value, option.label, option.position, option.points
from public.questions
cross join (
  values
    ('a', 'Casi no ocurre', 1, 1),
    ('b', 'A veces', 2, 2),
    ('c', 'Casi siempre', 3, 4),
    ('d', 'Siempre, y queda registro', 4, 6)
) as option (value, label, position, points)
where questions.kind = 'single'
  and questions.id <> 1;

insert into public.question_options (question_id, value, label, position, severity)
values
  (18, 'falta_materiales', 'Falta de materiales', 1, 6),
  (18, 'fallas_mecanicas', 'Fallas mecánicas', 2, 4),
  (18, 'personal', 'Personal', 3, 2),
  (18, 'set_ups_lentos', 'Set ups lentos', 4, 1);
