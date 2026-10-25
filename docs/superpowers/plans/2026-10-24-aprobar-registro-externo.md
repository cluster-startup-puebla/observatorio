# Aprobar el registro externo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Quien se registra desde la landing, sin enlace de invitación, termina el onboarding y ve “Tu pase te llegará por correo” hasta que el superadmin lo acepte. La ficha deja trazado que llegó de un lugar desconocido.

**Architecture:** No se crea contacto de CRM ni se toca al organismo. El alta sin token ya guarda `companies.sector_source = 'path'` en `src/lib/onboarding/save-empresario.ts`. Esa fila es el rastro: la etiqueta visible de `path` pasa a “Lugar desconocido”. Dos columnas nuevas, `admitted_at` y `admitted_by`, guardan quién aceptó y cuándo. Si `path` no tiene `admitted_at`, el pase, los asistentes y los logos esperan. La función `approve_external_signup` solo la puede ejecutar el superadmin. Quien ya terminó por la landing antes de esta migración queda aceptado y no pierde el pase.

**Tech Stack:** Next.js 16 App Router, Supabase Postgres, vitest. Archivos `.ts` y `.tsx` de menos de 90 líneas. Avisos con el patrón que ya usa el detalle de empresas (`text-mark`), sin `alert`.

---

## Fuera de este plan

- El directorio en memoria. La app viva usa Supabase.
- Enviar el correo. La pantalla solo lo anuncia, con el `PendingNotice` que ya existe.
- Rechazar un registro externo.
- Crear un organismo, un contacto `enlace` o un valor nuevo en `contact_source`.
- Mover a pendiente a quien ya tiene empresa `path`. La migración los marca aceptados.
- El CRM del organismo, el tablero y `approve_link_signup`.
- Emitir el QR del pase. Aceptado, sigue `AccessPass`.

## Mapa de archivos

- Crear: `src/lib/admin/empresas/external-approval.ts`
- Crear: `src/lib/admin/empresas/external-approval.test.ts`
- Crear: `supabase/migrations/20261024230000_external_signup_columns.sql`
- Crear: `supabase/migrations/20261024230100_approve_external_signup.sql`
- Crear: `src/app/api/admin/empresas/[id]/aceptar/route.ts`
- Crear: `src/lib/onboarding/external-pass-state.ts`
- Modificar: `src/lib/admin/empresas/sector-source.ts`
- Modificar: `src/lib/admin/empresas/list.ts`
- Modificar: `src/lib/admin/empresas/list.test.ts`
- Modificar: `src/app/admin/empresas/empresas-list.tsx`
- Modificar: `src/lib/admin/empresas/detail.ts`
- Modificar: `src/app/admin/empresas/[id]/page.tsx`
- Modificar: `src/app/onboarding/supabase-screen.tsx`
- Modificar: `src/lib/admin/empresas/attending.ts`
- Modificar: `src/lib/admin/empresas/attending.test.ts`
- Modificar: `src/lib/admin/empresas/load-attending.ts`
- Modificar: `src/lib/admin/empresas/load-event-logos.ts`

---

### Task 1: El alta sin enlace se llama lugar desconocido y espera aceptación

**Files:**
- Create: `src/lib/admin/empresas/external-approval.ts`
- Create: `src/lib/admin/empresas/external-approval.test.ts`
- Modify: `src/lib/admin/empresas/sector-source.ts`

`path` sigue siendo el valor guardado. La etiqueta deja de decir “Por la ruta del sector”. `link` y `chosen` no esperan esta aprobación.

- [ ] **Step 1: Escribir el test que falla**

```ts
import { describe, expect, it } from "vitest";
import { externalApprovalLabel, waitsForExternalApproval } from "./external-approval";
import { sectorSourceLabel } from "./sector-source";

describe("registro externo", () => {
  it("path se lee como lugar desconocido", () => {
    expect(sectorSourceLabel("path")).toBe("Lugar desconocido");
    expect(sectorSourceLabel("link")).toBe("Por el enlace del organismo");
    expect(sectorSourceLabel("chosen")).toBe("Lo eligió la persona");
  });

  it("solo path sin fecha de aceptación espera al superadmin", () => {
    expect(waitsForExternalApproval("path", null)).toBe(true);
    expect(waitsForExternalApproval("path", "2026-10-24T00:00:00Z")).toBe(false);
    expect(waitsForExternalApproval("link", null)).toBe(false);
    expect(waitsForExternalApproval("chosen", null)).toBe(false);
  });

  it("la ficha distingue pendiente, aceptada y lo que no aplica", () => {
    expect(externalApprovalLabel("path", null)).toBe("Pendiente");
    expect(externalApprovalLabel("path", "2026-10-24T00:00:00Z")).toBe("Aceptada");
    expect(externalApprovalLabel("link", null)).toBe("No aplica");
  });
});
```

- [ ] **Step 2: Correr el test y verlo fallar**

Run: `npx vitest run src/lib/admin/empresas/external-approval.test.ts`

Expected: FAIL porque `./external-approval` no existe.

- [ ] **Step 3: Implementar la regla y cambiar la etiqueta**

`src/lib/admin/empresas/sector-source.ts`, la entrada `path`:

```ts
{ value: "path", label: "Lugar desconocido" },
```

`src/lib/admin/empresas/external-approval.ts`:

```ts
export function waitsForExternalApproval(source: string, admittedAt: string | null) {
  return source === "path" && !admittedAt;
}

export function externalApprovalLabel(source: string, admittedAt: string | null) {
  if (source !== "path") return "No aplica";
  return admittedAt ? "Aceptada" : "Pendiente";
}
```

- [ ] **Step 4: Correr el test y verlo pasar**

Run: `npx vitest run src/lib/admin/empresas/external-approval.test.ts`

Expected: PASS, 3 tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/admin/empresas/external-approval.ts src/lib/admin/empresas/external-approval.test.ts src/lib/admin/empresas/sector-source.ts
git commit -m "$(cat <<'EOF'
feat: el alta sin enlace queda como lugar desconocido

EOF
)"
```

---

### Task 2: La empresa guarda quién aceptó, y las que ya existen siguen aceptadas

**Files:**
- Create: `supabase/migrations/20261024230000_external_signup_columns.sql`
- Modify: `src/lib/admin/empresas/external-approval.test.ts`

No se aplica en el proyecto remoto. El archivo queda en el repo para correrlo a mano, antes que la función de la tarea 3.

- [ ] **Step 1: Agregar el assert del archivo SQL al test**

Al final del `describe`, antes del cierre:

```ts
  it("las columnas dejan aceptadas a las empresas path que ya existen", () => {
    const sql = readFileSync("supabase/migrations/20261024230000_external_signup_columns.sql", "utf8");
    expect(sql).toContain("add column admitted_at timestamptz");
    expect(sql).toContain("add column admitted_by uuid references public.profiles (id) on delete set null");
    expect(sql).toContain("where sector_source = 'path'");
    expect(sql).toContain("admitted_at = clock_timestamp()");
  });
```

Importar `readFileSync` desde `node:fs` en la primera línea del test.

- [ ] **Step 2: Correr el test y verlo fallar**

Run: `npx vitest run src/lib/admin/empresas/external-approval.test.ts`

Expected: FAIL porque el archivo SQL no existe.

- [ ] **Step 3: Escribir la migración**

`supabase/migrations/20261024230000_external_signup_columns.sql`:

```sql
alter table public.companies
  add column admitted_at timestamptz,
  add column admitted_by uuid references public.profiles (id) on delete set null;

comment on column public.companies.admitted_at is
  'Cuándo el superadmin aceptó un registro sin enlace. Null con sector_source path significa que sigue pendiente.';

comment on column public.companies.admitted_by is
  'Perfil del superadmin que aceptó. Null en las empresas path que ya existían al prender la regla.';

update public.companies
set admitted_at = clock_timestamp()
where sector_source = 'path'
  and admitted_at is null;
```

El `update` corre en la misma migración, así que solo marca las filas que ya están. Un alta posterior inserta `admitted_at` null. `saveEmpresarioProfile` no manda estas columnas, y el upsert no las pisa.

- [ ] **Step 4: Correr el test y verlo pasar**

Run: `npx vitest run src/lib/admin/empresas/external-approval.test.ts`

Expected: PASS, 4 tests.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20261024230000_external_signup_columns.sql src/lib/admin/empresas/external-approval.test.ts
git commit -m "$(cat <<'EOF'
feat: la empresa externa guarda la aceptación sin quitar el pase ya dado

EOF
)"
```

---

### Task 3: Solo el superadmin acepta un registro de lugar desconocido

**Files:**
- Create: `supabase/migrations/20261024230100_approve_external_signup.sql`
- Modify: `src/lib/admin/empresas/external-approval.test.ts`

No escribe `crm_events`. No mira el organismo. No se aplica en remoto.

- [ ] **Step 1: Agregar el assert de la función**

```ts
  it("aceptar un externo solo lo puede el superadmin y deja fecha y autor", () => {
    const sql = readFileSync("supabase/migrations/20261024230100_approve_external_signup.sql", "utf8");
    expect(sql).toContain("function public.approve_external_signup(company_id uuid)");
    expect(sql).toContain("private.is_superadmin()");
    expect(sql).toContain("src is distinct from 'path'");
    expect(sql).toContain("already is not null");
    expect(sql).toContain("admitted_by = auth.uid()");
    expect(sql).not.toContain("crm_events");
    expect(sql).toContain("grant execute on function public.approve_external_signup(uuid) to authenticated");
  });
```

- [ ] **Step 2: Correr el test y verlo fallar**

Run: `npx vitest run src/lib/admin/empresas/external-approval.test.ts`

Expected: FAIL porque la segunda migración no existe.

- [ ] **Step 3: Escribir la función**

`supabase/migrations/20261024230100_approve_external_signup.sql`:

```sql
create or replace function public.approve_external_signup(company_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  src text;
  already timestamptz;
begin
  if auth.uid() is null then
    raise exception 'sin sesión';
  end if;
  if not (select private.is_superadmin()) then
    raise exception 'solo el superadmin acepta un registro externo';
  end if;
  select sector_source, admitted_at into src, already
  from public.companies
  where id = company_id;
  if src is distinct from 'path' then
    raise exception 'no llegó por un lugar desconocido';
  end if;
  if already is not null then
    raise exception 'ya está aceptada';
  end if;
  update public.companies
  set admitted_at = clock_timestamp(),
      admitted_by = auth.uid()
  where id = company_id;
end;
$$;

revoke all on function public.approve_external_signup(uuid) from public;
grant execute on function public.approve_external_signup(uuid) to authenticated;
```

- [ ] **Step 4: Correr el test y verlo pasar**

Run: `npx vitest run src/lib/admin/empresas/external-approval.test.ts`

Expected: PASS, 5 tests.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20261024230100_approve_external_signup.sql src/lib/admin/empresas/external-approval.test.ts
git commit -m "$(cat <<'EOF'
feat: el superadmin acepta el registro que llegó de un lugar desconocido

EOF
)"
```

---

### Task 4: La lista de empresas muestra la llegada y si falta aceptar

**Files:**
- Modify: `src/lib/admin/empresas/list.ts`
- Modify: `src/lib/admin/empresas/list.test.ts`
- Modify: `src/app/admin/empresas/empresas-list.tsx`

El superadmin encuentra a los pendientes sin entrar al CRM.

- [ ] **Step 1: Extender el test de la lista**

Dentro del test `"la lista lee companies y el tamaño"`, después de `expect(list).toContain("employee_band")`:

```ts
    expect(list).toContain("admitted_at");
    expect(list).toContain("externalApprovalLabel");
    expect(list).toContain("sectorSourceLabel");
```

- [ ] **Step 2: Correr el test y verlo fallar**

Run: `npx vitest run src/lib/admin/empresas/list.test.ts`

Expected: FAIL porque `list.ts` no contiene `admitted_at`.

- [ ] **Step 3: Devolver las dos columnas**

En `src/lib/admin/empresas/list.ts`, importar:

```ts
import { externalApprovalLabel } from "./external-approval";
import { sectorSourceLabel } from "./sector-source";
```

El `select` queda:

```ts
    .select("id, legal_name, employee_band, sector_id, sector_source, admitted_at, referral_source, sectors(name)")
```

En el objeto que arma cada fila, conservar las llaves actuales y agregar:

```ts
        llegada: sectorSourceLabel(row.sector_source ?? ""),
        aprobacion: externalApprovalLabel(row.sector_source ?? "", row.admitted_at),
```

En `src/app/admin/empresas/empresas-list.tsx`, las columnas quedan:

```tsx
      columns={[
        { key: "legal_name", label: "Razón social" },
        { key: "employee_band", label: "Tamaño" },
        { key: "sector_name", label: "Sector" },
        { key: "llegada", label: "Llegada" },
        { key: "aprobacion", label: "Aprobación" },
      ]}
```

`list.ts` debe seguir debajo de 90 líneas. Hoy tiene 33.

- [ ] **Step 4: Correr el test y verlo pasar**

Run: `npx vitest run src/lib/admin/empresas/list.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/admin/empresas/list.ts src/lib/admin/empresas/list.test.ts src/app/admin/empresas/empresas-list.tsx
git commit -m "$(cat <<'EOF'
feat: la lista de empresas muestra el lugar desconocido y si falta aceptar

EOF
)"
```

---

### Task 5: La ficha deja aceptar y guarda el rastro en pantalla

**Files:**
- Create: `src/app/api/admin/empresas/[id]/aceptar/route.ts`
- Modify: `src/lib/admin/empresas/detail.ts`
- Modify: `src/app/admin/empresas/[id]/page.tsx`
- Modify: `src/lib/admin/empresas/detail.test.ts`

La ruta nueva evita el `POST` del archivo `[id]/route.ts`. El test de ese archivo exige que ahí no haya `POST`.

- [ ] **Step 1: Afirmar la ruta y la lectura**

En `src/lib/admin/empresas/detail.test.ts`, agregar:

```ts
  it("la ficha lee la aceptación y el botón vive en su propia ruta", () => {
    const source = readFileSync("src/lib/admin/empresas/detail.ts", "utf8");
    const page = readFileSync("src/app/admin/empresas/[id]/page.tsx", "utf8");
    const route = readFileSync("src/app/api/admin/empresas/[id]/aceptar/route.ts", "utf8");
    expect(source).toContain("admitted_at");
    expect(source).toContain("externalApprovalLabel");
    expect(page).toContain("/aceptar");
    expect(page).toContain("Aceptar");
    expect(route).toContain('rpc("approve_external_signup"');
    expect(route).toContain("requireSuperadmin()");
  });
```

- [ ] **Step 2: Correr el test y verlo fallar**

Run: `npx vitest run src/lib/admin/empresas/detail.test.ts`

Expected: FAIL porque la ruta `aceptar` no existe.

- [ ] **Step 3: Leer la aceptación y mostrar el botón**

En `src/lib/admin/empresas/detail.ts`, importar `externalApprovalLabel` desde `./external-approval`. Sumar `admitted_at, admitted_by` al `select` de `companies`. Después de armar `sector`, `answers` y `pass`, si hay `admitted_by`, leer el correo:

```ts
  const admitter = company.data.admitted_by
    ? await db.from("profiles").select("email").eq("id", company.data.admitted_by).maybeSingle()
    : { data: null, error: null };
  if (admitter.error) throw new Error(admitter.error.message);
```

En `company`, agregar:

```ts
      admitted_at: company.data.admitted_at,
      approval_label: externalApprovalLabel(company.data.sector_source, company.data.admitted_at),
      admitted_by_email: admitter.data?.email ?? "",
```

`detail.ts` queda debajo de 90 líneas con este query adentro. Hoy tiene 35.

En `src/app/admin/empresas/[id]/page.tsx`, en `facts`, después de “Cómo llegó el sector”:

```tsx
        { label: "Aprobación", value: data.company.approval_label },
        {
          label: "Aceptó",
          value: data.company.admitted_by_email || "Nadie",
        },
```

“Cómo llegó el sector” ya muestra `source_label`. Para `path` eso es “Lugar desconocido”. Debajo del error, y solo si falta aceptar:

```tsx
      {data.company.sector_source === "path" && !data.company.admitted_at ? (
        <form action={`/api/admin/empresas/${id}/aceptar`} method="post" className="mt-4">
          <button className="btn btn-primary" type="submit">Aceptar</button>
        </form>
      ) : null}
```

`src/app/api/admin/empresas/[id]/aceptar/route.ts`:

```ts
import { adminDb } from "@/lib/admin/admin-db";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  await requireSuperadmin();
  const { id } = await context.params;
  const back = `/admin/empresas/${id}`;
  const db = await adminDb();
  if (!db) {
    return NextResponse.redirect(new URL(`${back}?error=${encodeURIComponent("sin sesión")}`, request.url));
  }
  const approved = await db.rpc("approve_external_signup", { company_id: id });
  if (approved.error) {
    return NextResponse.redirect(new URL(`${back}?error=${encodeURIComponent(approved.error.message)}`, request.url));
  }
  return NextResponse.redirect(new URL(back, request.url));
}
```

La página del detalle debe seguir debajo de 90 líneas. Hoy tiene 52.

- [ ] **Step 4: Correr el test y verlo pasar**

Run: `npx vitest run src/lib/admin/empresas/detail.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/admin/empresas/\[id\]/aceptar/route.ts src/lib/admin/empresas/detail.ts src/app/admin/empresas/\[id\]/page.tsx src/lib/admin/empresas/detail.test.ts
git commit -m "$(cat <<'EOF'
feat: el superadmin acepta la empresa desde su ficha

EOF
)"
```

---

### Task 6: Al terminar el onboarding el pase externo también espera

**Files:**
- Create: `src/lib/onboarding/external-pass-state.ts`
- Modify: `src/app/onboarding/supabase-screen.tsx`
- Modify: `src/lib/admin/empresas/external-approval.test.ts`

La pantalla no cambia. `OnboardingWizard` ya enseña `PendingNotice` cuando `pending` es true. Un enlace pendiente y un alta `path` pendiente se suman: con uno basta para esconder `AccessPass`.

- [ ] **Step 1: Afirmar que la pantalla consulta la empresa**

```ts
  it("el onboarding consulta la empresa del empresario", () => {
    const screen = readFileSync("src/app/onboarding/supabase-screen.tsx", "utf8");
    const state = readFileSync("src/lib/onboarding/external-pass-state.ts", "utf8");
    expect(state).toContain("waitsForExternalApproval");
    expect(state).toContain('.from("companies")');
    expect(screen).toContain("externalPassPending");
    expect(screen).toContain("pendingLink || pendingExternal");
  });
```

- [ ] **Step 2: Correr el test y verlo fallar**

Run: `npx vitest run src/lib/admin/empresas/external-approval.test.ts`

Expected: FAIL porque `external-pass-state.ts` no existe.

- [ ] **Step 3: Leer la empresa propia y combinar las dos esperas**

`src/lib/onboarding/external-pass-state.ts`:

```ts
import "server-only";

import { waitsForExternalApproval } from "@/lib/admin/empresas/external-approval";
import { createSupabaseWithAccess } from "@/lib/supabase/auth-session";

export async function externalPassPending(accessToken: string, profileId: string) {
  const company = await createSupabaseWithAccess(accessToken)
    .from("companies")
    .select("sector_source, admitted_at")
    .eq("profile_id", profileId)
    .maybeSingle();
  if (company.error) throw new Error(company.error.message);
  if (!company.data) return false;
  return waitsForExternalApproval(company.data.sector_source, company.data.admitted_at);
}
```

El empresario ya puede leer su fila por `companies_own`. En `src/app/onboarding/supabase-screen.tsx`, importar `externalPassPending` y reemplazar la línea de `pending`:

```ts
  const pendingLink = onboarded && account.role === "empresario" ? await linkPassPending(token, account.email) : false;
  const pendingExternal = onboarded && account.role === "empresario" ? await externalPassPending(token, account.id) : false;
  const pending = pendingLink || pendingExternal;
```

`supabase-screen.tsx` hoy tiene 62 líneas. Debe quedar debajo de 90.

- [ ] **Step 4: Correr el test y verlo pasar**

Run: `npx vitest run src/lib/admin/empresas/external-approval.test.ts`

Expected: PASS, 6 tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/onboarding/external-pass-state.ts src/app/onboarding/supabase-screen.tsx src/lib/admin/empresas/external-approval.test.ts
git commit -m "$(cat <<'EOF'
feat: el pase de la landing espera a que el superadmin acepte

EOF
)"
```

---

### Task 7: Asistentes y logos no publican a quien sigue pendiente

**Files:**
- Modify: `src/lib/admin/empresas/attending.ts`
- Modify: `src/lib/admin/empresas/attending.test.ts`
- Modify: `src/lib/admin/empresas/load-attending.ts`
- Modify: `src/lib/admin/empresas/load-event-logos.ts`
- Modify: `src/lib/admin/empresas/external-approval.test.ts`

El filtro del enlace no cambia. `linkStatus` null sigue contando como aceptado para el enlace. La espera externa es otra condición.

- [ ] **Step 1: Escribir el test que falla**

En el fixture de `attending.test.ts`, cada fila existente recibe `externalPending: false`. Agregar:

```ts
  it("saca al alta de lugar desconocido que nadie ha aceptado", () => {
    const pending = attendingCompanies(
      [
        { ...rows[0], id: "c1", externalPending: true },
        { ...rows[1], id: "c2", externalPending: false },
      ],
      null,
    );
    expect(pending.rows.map((row) => row.id)).toEqual(["c2"]);
  });
```

En `external-approval.test.ts`:

```ts
  it("asistentes y logos leen la aceptación externa", () => {
    const attending = readFileSync("src/lib/admin/empresas/load-attending.ts", "utf8");
    const logos = readFileSync("src/lib/admin/empresas/load-event-logos.ts", "utf8");
    expect(attending).toContain("waitsForExternalApproval");
    expect(attending).toContain("admitted_at");
    expect(logos).toContain("waitsForExternalApproval");
    expect(logos).toContain("admitted_at");
  });
```

- [ ] **Step 2: Correr los tests y verlos fallar**

Run: `npx vitest run src/lib/admin/empresas/attending.test.ts src/lib/admin/empresas/external-approval.test.ts`

Expected: FAIL. `AttendingInput` todavía no tiene `externalPending`, y los loaders no leen `admitted_at`.

- [ ] **Step 3: Filtrar en la lista y en los dos loaders**

En `AttendingInput` agregar `externalPending: boolean`. En el filtro de `attendingCompanies`, exigir también `!row.externalPending`.

En `load-attending.ts`, el `select` de `companies` suma `sector_source, admitted_at`. Cada fila arma:

```ts
      externalPending: waitsForExternalApproval(String(row.sector_source ?? ""), row.admitted_at ?? null),
```

Importar `waitsForExternalApproval` desde `./external-approval`.

En `load-event-logos.ts`, el `select` suma `sector_source, admitted_at`. Antes de armar `visible`, descartar la fila si `waitsForExternalApproval` es true. El filtro del correo pendiente del enlace se queda.

Los dos loaders siguen debajo de 90 líneas.

- [ ] **Step 4: Correr los tests y verlos pasar**

Run: `npx vitest run src/lib/admin/empresas/attending.test.ts src/lib/admin/empresas/event-logos.test.ts src/lib/admin/empresas/external-approval.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/admin/empresas/attending.ts src/lib/admin/empresas/attending.test.ts src/lib/admin/empresas/load-attending.ts src/lib/admin/empresas/load-event-logos.ts src/lib/admin/empresas/external-approval.test.ts
git commit -m "$(cat <<'EOF'
feat: asistentes y logos esperan la aceptación del registro externo

EOF
)"
```

---

### Task 8: Correr las dos migraciones en Supabase

No hay commit. Las corre quien tiene el proyecto, en este orden:

1. `supabase/migrations/20261024230000_external_signup_columns.sql`
2. `supabase/migrations/20261024230100_approve_external_signup.sql`

Comprobar:

```sql
select proname from pg_proc
join pg_namespace on pg_namespace.oid = pg_proc.pronamespace
where nspname = 'public' and proname = 'approve_external_signup';
```

Debe devolver una fila. Las empresas `path` que ya existían quedan con `admitted_at` lleno y `admitted_by` null. No se actualizan a mano.
