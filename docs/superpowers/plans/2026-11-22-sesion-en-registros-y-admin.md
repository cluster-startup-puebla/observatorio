# Sesión en registros públicos y filtros admin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cada registro público (y lo que se vuelca a empresa/pase) queda casado con una `sessions.id`, y `/admin/registros`, `/admin` y `/admin/crm` filtran de verdad por la sesión elegida.

**Architecture:** Hoy `session_interest` es texto libre (“qué te interesa”) y no identifica el evento. Se agrega `session_id` nullable en `public_registrations` (y se propaga a `companies` / outbox al aceptar). El registro desde Disruptors guarda el UUID de esa sesión. El selector `?sesion=` del admin deja de afectar solo una gráfica de cupos: lista de registros, tablero y CRM leen el mismo parámetro y acotan datos a esa convocatoria.

**Tech Stack:** Next.js App Router, Supabase SQL/RPC, Vitest. Archivos `.ts`/`.tsx` ≤ 90 líneas. Migraciones vía MCP `apply_migration` en `jnshenkmexsxiylpqhdh` + archivo en `supabase/migrations/`.

**Rama:** `develop`.

---

## Diagnóstico (por qué “no cambia la data”)

| Zona | Qué hace hoy `?sesion=` | Qué falta |
|------|-------------------------|-----------|
| `/admin` tablero | Solo `loadCupos(sesion)`. KPIs CRM y logos son globales (`loadTablero()` sin sesión). | Pasar sesión a todo el board o dejar KPIs globales explícitos y filtrar cupos + registros derivados. |
| `/admin/registros` | Sin filtro de sesión. No hay columna de sesión. | FK + filtro + columna. |
| `/admin/crm` | Filtros `vista` / `estado` / `origen`. Sin sesión. | Filtrar contactos/empresas por `companies.session_id` (o join vía registro volcado). |
| `/registro` | No envía sesión. Disruptors solo cambia copy. | Resolver UUID de Disruptors (o `?sesion=`) y persistirlo. |

**No reutilizar `session_interest` como FK.** Ese campo se queda como motivación; la identidad del evento es `session_id`.

Referencias: `docs/deuda-tecnica-sesion-del-pase.md`, `docs/superpowers/plans/2026-10-22-cupos-por-sector-en-sesion.md`.

---

## File map

| Unidad | Responsabilidad |
|--------|-----------------|
| Migración `session_id` en registros (+ RPC) | Persistencia al registrar / aceptar |
| `companies.session_id` | Filtro CRM/tablero por empresa |
| `/registro` + actions | Escribir `session_id` |
| `listRegistros` + UI | Columna + `?sesion=` |
| Tablero `load*` | Cupos + conteos coherentes con sesión |
| CRM `list` + query | `?sesion=` |
| Selector compartido | Un control reutilizable en las 3 pantallas |

---

### Task 1: Migración — `public_registrations.session_id`

**Files:**
- Create: `supabase/migrations/20261123020000_registration_session_id.sql`
- Test: `src/lib/admin/registros/session-sql.test.ts` (lee el SQL)

- [ ] **Step 1: Test que espera la columna y el RPC**

```ts
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

const sql = readFileSync(
  "supabase/migrations/20261123020000_registration_session_id.sql",
  "utf8",
);

it("liga registro público a sessions", () => {
  expect(sql).toContain("alter table public.public_registrations");
  expect(sql).toContain("session_id uuid");
  expect(sql).toContain("references public.sessions");
  expect(sql).toContain("start_public_registration");
});
```

- [ ] **Step 2: Correr test (falla sin migración)**

Run: `npx vitest run src/lib/admin/registros/session-sql.test.ts`

- [ ] **Step 3: SQL**

```sql
alter table public.public_registrations
  add column if not exists session_id uuid references public.sessions (id) on delete set null;

create index if not exists public_registrations_session_id_idx
  on public.public_registrations (session_id);

-- Extender start_public_registration: parámetro p_session_id uuid default null
-- Validar exists (select 1 from sessions where id = p_session_id) cuando no es null
-- Insertar session_id en el insert inicial (o update en finish si preferís)
-- Mantener session_interest como texto libre

comment on column public.public_registrations.session_id is
  'Sesión/evento al que se registró. Distinto de session_interest (texto libre).';
```

Aplicar con MCP `apply_migration` nombre `registration_session_id` y guardar el mismo SQL en el archivo.

- [ ] **Step 4: Vitest verde + commit**

```bash
npx vitest run src/lib/admin/registros/session-sql.test.ts
git add supabase/migrations/20261123020000_registration_session_id.sql src/lib/admin/registros/session-sql.test.ts
git commit -m "$(cat <<'EOF'
feat(registros): session_id en public_registrations

Permite casar cada alta pública con la sesión/evento de origen.
EOF
)"
```

---

### Task 2: Migración — `companies.session_id` + aceptar registro

**Files:**
- Create: `supabase/migrations/20261123020100_company_session_id.sql`
- Modify: RPC `accept_public_registration` (mismo archivo o replace)
- Test: `src/lib/admin/registros/accept-session-sql.test.ts`

- [ ] **Step 1: Test SQL**

Esperar `companies.session_id`, copia desde `public_registrations.session_id` al aceptar, e `enqueue_public_pass` / outbox con `session_id` cuando exista.

- [ ] **Step 2: SQL**

```sql
alter table public.companies
  add column if not exists session_id uuid references public.sessions (id) on delete set null;

create index if not exists companies_session_id_idx on public.companies (session_id);

-- En accept_public_registration: al insert/update companies set session_id = row.session_id
-- En enqueue_public_pass (o al aceptar): outbox_messages.session_id = companies.session_id
```

Opcional en esta ola: parametrizar `private.sector_is_full(session_id)` para no chequear solo `is_current` al aceptar Disruptors. Si se deja para después, documentar deuda explícita en el commit message.

- [ ] **Step 3: Commit**

```bash
git commit -m "$(cat <<'EOF'
feat(empresas): session_id al aceptar registro público

La empresa y el pase heredan la sesión del registro.
EOF
)"
```

---

### Task 3: `/registro` escribe la sesión

**Files:**
- Modify: `src/content/disruptors.ts` (exportar slug; opcional helper)
- Create: `src/lib/registro/resolve-session.ts` — resuelve UUID por slug o query
- Modify: `src/app/registro/page.tsx` — pasar `sessionId`
- Modify: `src/app/registro/actions.ts` + `use-registro-submit.ts` — enviar `sessionId` al RPC
- Test: `src/lib/registro/resolve-session.test.ts`

- [ ] **Step 1: Test de resolución**

```ts
it("prioriza ?sesion= y si no usa slug disruptors", () => {
  expect(resolveRegistroSession({ queryId: "abc" })).toEqual({ kind: "id", id: "abc" });
  expect(resolveRegistroSession({}).slug).toBe("28-11-26-disruptors-2026");
});
```

- [ ] **Step 2: En page (server)**

1. Leer `searchParams.sesion` si es UUID.
2. Si no, `sessionBySlug(disruptorsSlug)` (o lookup por `public_slug`).
3. Pasar `sessionId` a `RegistroForm` → hidden input / submit.

- [ ] **Step 3: Action llama RPC con `p_session_id`**

Si el RPC falla por sesión inválida, mostrar error claro en el form (Alert), no `alert()`.

- [ ] **Step 4: Backfill opcional**

SQL one-shot para el registro de prueba de Álvaro si `created_at` ≥ Disruptors publish y `referral_source` contiene Clúster: `update ... set session_id = '<uuid disruptors>' where session_id is null and ...`. Solo con criterio explícito; si duda, dejar null y etiquetar “Sin sesión” en admin.

- [ ] **Step 5: Commit**

```bash
git commit -m "$(cat <<'EOF'
feat(registro): guardar session_id al registrarse a Disruptors

El alta pública queda atada al evento desde el que se entró.
EOF
)"
```

---

### Task 4: Admin registros — columna + filtro

**Files:**
- Modify: `src/lib/admin/registros/list.ts` — select `session_id`, join `sessions(title, session_on, public_slug)`, filtro `.eq("session_id", sesion)` si hay param
- Modify: `src/app/admin/registros/page.tsx` — leer `sesion`
- Modify: `src/app/admin/registros/registros-list.tsx` — columna Sesión
- Create or reuse: `src/components/admin/session-filter.tsx` — GET form `name="sesion"` (mismo patrón que `session-select.tsx` del tablero)
- Test: `src/lib/admin/registros/list.test.ts`

- [ ] **Step 1: Test de lista**

```ts
expect(list).toContain("session_id");
expect(list).toContain("sessions");
expect(page).toContain('params.sesion');
```

- [ ] **Step 2: UI**

- Selector arriba: “Todas las sesiones” + opciones de `loadSessionChoices()`.
- Columna: `title` o `session_on` corto; vacío → “Sin sesión”.
- Al cambiar sesión, preservar `page=1`.

- [ ] **Step 3: Commit**

```bash
git commit -m "$(cat <<'EOF'
feat(admin): filtrar y mostrar sesión en registros públicos

Se ve de qué evento vino cada alta y se puede acotar la lista.
EOF
)"
```

---

### Task 5: Tablero `/admin?sesion=` — data que sí cambia

**Files:**
- Modify: `src/app/admin/page.tsx`
- Modify: `src/lib/admin/tablero/load-cupos.ts` — empresas contadas con `companies.session_id = sesion` (o null-safe: si sesión elegida, solo esas; documentar nulls)
- Modify: `src/lib/admin/tablero/load.ts` / `snapshot.ts` — aceptar `sessionId` opcional; CRM KPIs filtrados vía empresas/contactos con esa sesión **o** mostrar badge “KPIs globales” si se decide no filtrar CRM aún
- Modify: `src/app/admin/tablero/session-select.tsx` — mostrar siempre que haya ≥1 sesión (hoy se oculta con 1)
- Test: `src/lib/admin/tablero/load-cupos.test.ts` (o nuevo)

**Decisión de producto (fijada en este plan):**

1. Cupos: cuotas de la sesión + asientos de empresas con `session_id` = esa sesión.
2. KPIs del tablero (contactos CRM, etc.): filtrar por la misma sesión cuando exista vínculo; si un KPI no tiene FK aún, ocultarlo o etiquetar “sin sesión” en lugar de mentir con totales globales.
3. Selector visible con 1+ sesiones.

- [ ] **Step 1: Tests de cupos con session_id en companies**
- [ ] **Step 2: Implementar filtros**
- [ ] **Step 3: Commit**

```bash
git commit -m "$(cat <<'EOF'
fix(admin): el tablero responde a la sesión elegida

Cupos y métricas dejan de mezclar convocatorias distintas.
EOF
)"
```

---

### Task 6: CRM `/admin/crm?sesion=`

**Files:**
- Modify: `src/lib/admin/crm/query.ts` — parse `sesion`
- Modify: `src/lib/admin/crm/list.ts` — filtrar contactos cuyo `profile_id` → company con `session_id`, o contactos creados vía enlace de esa sesión (`link_copies.session_id`) según el modelo más simple disponible
- Modify: `src/app/admin/crm/page.tsx` — montar `SessionFilter`
- Test: `src/lib/admin/crm/query.test.ts` / `list.test.ts`

**Regla mínima v1:** contacto entra en la sesión si:

- `companies.session_id = sesion` vía `profile_id`, **o**
- existe `link_copies` con ese `session_id` y el email/org del contacto coincide (solo si el join es barato; si no, v1 solo por company).

- [ ] **Step 1: Tests de query + list**
- [ ] **Step 2: UI filtro**
- [ ] **Step 3: Commit**

```bash
git commit -m "$(cat <<'EOF'
feat(crm): filtrar contactos por sesión

El CRM del admin se acota a la convocatoria seleccionada.
EOF
)"
```

---

### Task 7: Selector compartido + humo manual

**Files:**
- Create: `src/components/admin/session-filter.tsx` (si aún no unificó Tasks 4–6)
- Modify: tablero / registros / CRM para importar el mismo componente
- Test: `src/components/admin/session-filter.test.ts` (smoke de `name="sesion"`)

- [ ] **Step 1: Extraer componente único** (evitar tres copias)
- [ ] **Step 2: Checklist manual**

1. Registrar en `/registro` → fila en admin con sesión Disruptors.
2. `/admin/registros?sesion=<uuid disruptors>` muestra a Álvaro; otra sesión no.
3. `/admin?sesion=<uuid>` cambia cupos (y KPIs acordados).
4. `/admin/crm?sesion=<uuid>` cambia la lista.
5. Registro viejo sin `session_id` → “Sin sesión”; filtro “Todas” lo sigue mostrando.

- [ ] **Step 3: Commit final**

```bash
git commit -m "$(cat <<'EOF'
refactor(admin): unificar filtro de sesión en registros, tablero y CRM

Una sola URL param ?sesion= gobierna las tres pantallas.
EOF
)"
```

---

## Fuera de alcance (esta ola)

- Reescribir `session_interest` o usarlo como FK.
- Filtrar `/admin/pases` o `/admin/mesa` (seguir deuda de pases; se puede enlazar después con `outbox_messages.session_id`).
- Multi-sesión en un mismo registro.
- UI organismo para elegir sesión al generar enlace (ya manda `sesion` en URL; persistirla en signup empresario puede ser Task 3b si sobra tiempo).

---

## Orden de ataque

```text
1 → 2 → 3   (dato primero: sin FK el filtro miente)
4           (registros: el dolor que reportaste con Álvaro)
5 → 6       (tablero + CRM)
7           (unificar selector + QA)
```
