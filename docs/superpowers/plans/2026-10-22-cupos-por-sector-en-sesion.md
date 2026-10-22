# Plan: sectores y cupo por sector en la sesión (v1)

Fecha: 2026-10-22. Solo plan; no hay código ni migración aplicada.
Referencia: `Foro Puebla x Puebla - Distribución general.pdf` (13 sectores, 120 invitados, 11 nov 2026, Quinta Real).

## 1. Hueco actual

`public.sessions` guarda lugar, formato, horario, `capacity_min`/`capacity_max` globales, público e incluye. No existe vínculo sesión↔sector ni cupo por sector. El superadmin no puede decir «esta sesión abarca Automotriz (22) y Agroindustria (18)…», y el total (120) no sale de ninguna distribución.

Hallazgos que condicionan el plan:

- `companies.sector_id` es el único lugar donde el sector se usa de verdad (`crm_contacts.sector_id` y `link_copies.sector_id` también). `passes` y `arrivals` **no** tienen sector ni `session_id`: «asistentes» de la sesión = `arrivals` si `is_current` (`attendeesFor` en `src/lib/admin/sesiones/current.ts`). Hoy solo hay una sesión vigente (`sessions_one_current_idx`).
- El catálogo de sectores vive en **dos** lugares: tabla `sectors` (14, seed en `20261022001056_…`) y la lista estática `diagnosticIndustries` (`src/content/diagnostico-tmec.ts` → `src/lib/sectors.ts`) que manda en `/[sector]`, el registro público y los tests.
- El catálogo **no coincide** con el PDF:
  - Faltan en BD: **Agroindustria** y **Gastronomía**.
  - Sobran vs PDF (irían con cupo 0): Química, Minerales no metálicos, Tecnología y servicios de TI.
  - Nombres distintos: Automotriz→`automotriz-y-autopartes`, Alimentos→`alimentos-y-bebidas`, Muebles→`mueble-y-madera`, Plásticos→`plasticos-y-hule`, Artes Gráficas→`artes-graficas-y-empaque`, Médico hospitalario→`dispositivos-medicos` (el más cercano; confirmar con negocio).
- El seed de la sesión vigente dice cupo 15–30 y ese «15 a 30 empresas» está hardcodeado en `src/app/register/page.tsx`, `src/components/landing/sections/register-form.tsx` y `src/app/aviso-de-privacidad/page.tsx`. El PDF habla de 120.
- `sessions` no tiene fecha (el PDF dice 11 nov 2026). Fuera de alcance, pero conviene saberlo.
- `docs/superpowers/` no tiene nada sobre cupos por sector; `docs/planeacion-funcionalidad.md` solo dice «Superadmin… cupo».

## 2. Recomendación v1

**Sí:** tabla `session_sector_quotas (session_id, sector_id, capacity)`; edición en el sheet de crear/editar sesión; total derivado; pestaña «Sectores» en el detalle; alinear el catálogo de BD con el PDF (agregar 2 sectores, sin renombrar ni borrar).

**No:** desglose por tipo de empresa/tamaño (v2), validación de cupo al registrar, `session_id` en companies/passes, cambios al catálogo estático de landing.

**Por qué no v2 ahora:** `employee_band` ya existe (`1_10`, `11_50`, `51_250`, `250_plus` ↔ Micro/Pequeña/Mediana/Grande), pero «tipo de empresa» (~45 valores del PDF) no tiene catálogo ni columna en `companies`, así que no se podría contar contra ese cupo. El PDF además lo marca como «propuesta, no cifras oficiales»: el resumen por sector es lo que el superadmin necesita editar primero. v2 = tabla hija `session_sector_quota_slices (quota_id, company_type text, employee_band, capacity)` con suma = cupo del sector, cuando exista el catálogo de tipos.

**Decisiones**

| Tema | Decisión |
| --- | --- |
| `capacity_max` | Se **deriva**: al guardar cupos, `capacity_max = suma`. Si la sesión no tiene cupos (legado), el input sigue editable. `capacity_min` sigue manual y debe ser ≤ total. |
| Atomicidad | RPC `set_session_quotas(p_session_id, p_quotas jsonb)` (security invoker, RLS aplica) que reemplaza filas y actualiza `capacity_max` en una transacción (mismo patrón que `create_staff_account`). supabase-js no hace transacciones. |
| 0 | Cupo 0 o vacío = el sector no abarca; no se guarda fila. |
| Semilla | **No** sembrar los 120 en la migración. Sesiones nuevas nacen vacías. Botón «Usar distribución del Foro Puebla x Puebla» en el sheet que precarga los inputs desde `src/content/foro-puebla.ts`; el superadmin revisa y guarda. Así no se pisa en silencio el 15–30 público de la sesión vigente. |
| Lectura | Pública (anon + authenticated), igual que `sessions` y `session_topics`. Escritura: solo superadmin. |

## 3. Schema (esbozo)

Migración nueva: `supabase/migrations/20261022xxxxxx_session_sector_quotas.sql`.

```sql
-- 1) Catálogo alineado al PDF (no renombra ni borra: companies y /[sector] dependen de los slugs)
insert into public.sectors (slug, name, position) values
  ('agroindustria', 'Agroindustria', 15),
  ('gastronomia',   'Gastronomía',   16);

-- 2) Cupos
create table public.session_sector_quotas (
  session_id uuid not null references public.sessions (id) on delete cascade,
  sector_id  uuid not null references public.sectors  (id) on delete restrict,
  capacity   integer not null check (capacity > 0),
  primary key (session_id, sector_id)
);
create index session_sector_quotas_sector_idx on public.session_sector_quotas (sector_id);
comment on table public.session_sector_quotas is
  'Invitados por sector en una sesión. Sin fila = el sector no abarca. sessions.capacity_max es la suma cuando hay filas.';

-- 3) RLS (patrón de 20261022001056 + 20261022003655: una policy por comando)
alter table public.session_sector_quotas enable row level security;
alter table public.session_sector_quotas force row level security;
grant select on public.session_sector_quotas to anon, authenticated;
grant select, insert, update, delete on public.session_sector_quotas to authenticated;
create policy session_sector_quotas_public_read on public.session_sector_quotas
  for select to anon, authenticated using (true);
create policy session_sector_quotas_superadmin_insert on public.session_sector_quotas
  for insert to authenticated with check ((select private.is_superadmin()));
-- … _update y _delete igual, con (select private.is_superadmin())

-- 4) RPC: valida superadmin, reemplaza filas, sincroniza capacity_max
create function public.set_session_quotas(p_session_id uuid, p_quotas jsonb)
returns integer language plpgsql security invoker set search_path = '' as $$
-- delete de la sesión; insert desde jsonb_to_recordset (sector_id, capacity > 0);
-- total = sum; si total < capacity_min => raise exception 'cupo_menor_al_minimo';
-- update sessions set capacity_max = total where id = p_session_id and total > 0;
-- return total
$$;
```

Notas: `on delete restrict` en sector (borrar un sector con cupos falla; mapear el mensaje de `removeBy('sectors')` a español). Aplicar con `apply_migration` y correr `get_advisors` (RLS, índices) después.

## 4. Pantallas / API a tocar

Crear:
- `supabase/migrations/…_session_sector_quotas.sql`
- `src/lib/admin/sesiones/quotas.ts` — `quotaDraft(form, sectorIds)`: puro, entero ≥ 0, sector válido, total ≥ `capacity_min`, razones en español. Con test.
- `src/lib/admin/sesiones/save-quotas.ts` — llama la RPC y traduce errores.
- `src/lib/admin/sesiones/choices.ts` — sectores (`id, name`, orden `position`) para el form (patrón `empresas/choices.ts`).
- `src/app/admin/sesiones/quota-fields.tsx` (client) + `use-quota-total.ts` — lista de sectores con input numérico `quota.<sector_id>`, total vivo, botón de precarga.
- `src/content/foro-puebla.ts` — `slug → cupo` del PDF (13 filas, suma 120; test que lo verifique).
- `src/app/admin/sesiones/[id]/cupos-tab.tsx` — tabla Sector / Cupo (v1.1: Inscritos).

Modificar:
- `src/app/admin/sesiones/session-fields.tsx` (59 líneas): montar `QuotaFields`; `capacity_max` pasa a solo lectura cuando el total > 0.
- `src/app/admin/sesiones/create-form.tsx` y `[id]/edit-form.tsx`: reciben `sectors` y `quotas`.
- `src/app/admin/sesiones/page.tsx`, `sesiones-list.tsx`, `row-actions.tsx`: pasar `sectors` y `quotasBySession`.
- `src/lib/admin/sesiones/list.ts` y `detail.ts`: leer `session_sector_quotas(sector_id, capacity)`.
- `src/app/api/admin/sesiones/route.ts` (POST): insertar sesión con `capacity_max = suma` → `save-quotas`; si falla, borrar la sesión creada y redirigir con error.
- `src/app/api/admin/sesiones/[id]/route.ts` (POST): tras el update, `save-quotas`.
- `src/app/admin/sesiones/[id]/page.tsx` (**ya tiene 90 líneas**): partir en `ficha-tab`, `temas-tab`, `asistentes-tab` **antes** de agregar el tab «Sectores» y el fact «Cupo» (total + N sectores).
- `src/lib/admin/remove-row.ts`: mensaje amable cuando un sector tiene cupos.

Reglas de UI (skill `admin-screen-polish` + `ui-feedback`): `FormSheet` + `SheetSubmit` sin `disabled`; errores con `Alert`/query `error` (nada de `alert()`); labels de negocio («Invitados por sector», «Total de invitados»); archivos ≤ 90 líneas. Orden de la lista: `position`. Solo input numérico (sin checkbox); vacío = 0.

## 5. Tareas ordenadas (un commit/PR chico cada una)

- [ ] 1. Migración: sectores Agroindustria y Gastronomía + tabla `session_sector_quotas` + RLS + grants + índice.
- [ ] 2. Migración (misma o siguiente): RPC `set_session_quotas`; probar con `execute_sql` como superadmin y como usuario normal; `get_advisors`.
- [ ] 3. `quotas.ts` (`quotaDraft`) + tests (suma, vacío = 0, sector inválido, total < mínimo).
- [ ] 4. `save-quotas.ts` + `choices.ts` + lectura de cupos en `list.ts`/`detail.ts` (con tests de contrato tipo `detail.test.ts`).
- [ ] 5. `quota-fields.tsx` + `use-quota-total.ts` + integración en `session-fields.tsx`, `create-form`, `edit-form`, `page`, `sesiones-list`, `row-actions`.
- [ ] 6. API POST crear y POST editar llaman `save-quotas`; `capacity_max` derivado.
- [ ] 7. Partir `[id]/page.tsx` en tabs (sin cambio de comportamiento).
- [ ] 8. Tab «Sectores» y fact de cupo en el detalle.
- [ ] 9. `src/content/foro-puebla.ts` + botón de precarga (con test de suma = 120).
- [ ] 10. e2e: crear sesión con cupos, ver total y tab; editar y bajar un sector.
- [ ] 11. Doc corta: actualizar `docs/planeacion-funcionalidad.md` (cupo por sector) y anotar v2.
- [ ] 12. (Opcional) alinear `sectors.ts`/`diagnosticIndustries` con los 2 sectores nuevos — ver riesgos; PR aparte.

## 6. Riesgos

1. **Catálogo dual.** Agroindustria y Gastronomía existirían en BD pero no en `src/lib/sectors.ts`: no habría `/agroindustria`, ni opción en el registro público. Mientras no se haga la tarea 12, esos invitados no podrían registrarse por su sector. Decidir si `sectors.ts` pasa a leer de BD.
2. **Mapeo de nombres.** «Médico hospitalario» vs «Dispositivos médicos», y 3 sectores de BD sin cupo en el PDF. Confirmar con negocio antes de aplicar; no renombrar slugs (rompe rutas y tests).
3. **Consistencia del cupo.** `capacity_max` derivado puede chocar con la copy pública «15 a 30 empresas» (3 archivos) y con la constraint `capacity_max >= capacity_min`. Sin RPC atómica quedaría una sesión sin cupos si falla el segundo paso.
4. **Sin vínculo sesión↔registro.** `companies`/`passes`/`arrivals` no tienen `session_id`; «inscritos por sector» solo es válido para la sesión vigente. Si habrá varias sesiones activas, hará falta `session_id` antes de contar.

## 7. Fuera de alcance

- Desglose por tipo de empresa y tamaño (v2).
- Validar o bloquear registros/pases al llegar al cupo; invitaciones por sector; lista de espera.
- `session_id` en `companies`/`passes`/`arrivals`.
- Fecha de la sesión (`sessions` no la tiene).
- Copy de landing/registro dinámico («15 a 30 empresas»).
- Cambios de landing, mesa u onboarding; PDFs por sector y «organismo que convoca».
