create table public.lava_actions (
  code text primary key,
  label text not null check (char_length(label) between 2 and 80),
  base_value integer not null check (base_value >= 0),
  once boolean not null default false,
  eia_boost boolean not null default true,
  condition_label text not null check (char_length(condition_label) between 2 and 160),
  repeatable_label text not null check (char_length(repeatable_label) between 2 and 40),
  active boolean not null default true,
  sort_order integer not null default 100 check (sort_order > 0),
  updated_at timestamptz not null default now()
);

comment on table public.lava_actions is
  'Catálogo de acciones que otorgan lavas. Editable por superadmin. No define EIA.';

alter table public.lava_actions enable row level security;
alter table public.lava_actions force row level security;

create policy lava_actions_read_authenticated
  on public.lava_actions for select to authenticated
  using (active = true or (select private.is_superadmin()));

create policy lava_actions_superadmin_write
  on public.lava_actions for all to authenticated
  using ((select private.is_superadmin()))
  with check ((select private.is_superadmin()));

grant select on table public.lava_actions to authenticated;
grant insert, update, delete on table public.lava_actions to authenticated;

insert into public.lava_actions
  (code, label, base_value, once, eia_boost, condition_label, repeatable_label, sort_order)
values
  ('perfil_completo', 'Completar perfil (logo + sitio)', 10, true, true,
   'Logo y sitio web en la empresa', 'Una vez', 10),
  ('evaluacion_terminada', 'Terminar evaluación', 25, true, true,
   'Run de metodología terminado con score', 'Una vez por ciclo', 20),
  ('asistencia_llego', 'Asistir a la sesión («Llegó»)', 15, false, true,
   'Mesa escanea el QR / hecho llegar', 'Por sesión', 30),
  ('innovacion_aceptada', 'Aceptar permiso de innovación abierta', 10, true, true,
   'Consentimiento con accepted_at', 'Una vez', 40),
  ('reto_publicado', 'Publicar reto', 20, false, true,
   'Reto publicado (no borrador, no oculto)', 'Por reto', 50),
  ('ajuste_manual', 'Ajuste manual', 0, false, false,
   'Solo superadmin', 'Manual', 90);
