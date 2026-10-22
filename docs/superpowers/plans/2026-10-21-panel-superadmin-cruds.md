# Panel del superadmin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** El superadmin opera todas las acciones del observatorio desde un panel con lista y detalle.

**Architecture:** Misma forma que ordina-panel-screen y ordina-panel-detail-page (página servidor, lista, detalle con header y tabs en ?tab=), pero el backend es Supabase del proyecto LevantamientoDeNecesidades, NO Keystone, NO Apollo, NO GraphQL. El navegador no llama a Supabase directo: pasa por route handlers en src/app/api/admin que leen la sesión de superadmin (src/lib/auth/require-superadmin.ts y src/lib/supabase/auth-session.ts). Cada archivo .ts/.tsx nuevo debe quedar en 90 líneas o menos.

**Tech Stack:** Next.js 16 App Router, shadcn Sidebar ya instalado, Supabase Auth + Postgres, Vitest.

---

## Por qué no se corre el scaffold de ordina

El script `python3 .claude/skills/ordina-panel-screen/scripts/scaffold_screen.py` (y el de detalle) genera queries GraphQL, servicios Apollo, mutations de Keystone y un soft delete con `deleted: true`. Este repo no tiene Keystone, ni Apollo, ni GraphQL, ni una columna `deleted`. Correrlo crearía archivos que no compilan y un borrado que el esquema no tiene. Se copia solo la forma de las pantallas: página servidor, lista de 10, detalle con header y tabs en `?tab=`, y las escrituras del navegador por route handlers.

## Reglas de datos

- No hay columna `deleted`. No se inventa soft delete. Ningún route handler exporta `DELETE` para `profiles` ni `organizations`.
- El estatus CRM no es una columna de `crm_contacts`. Es el último `crm_events`, leído por la vista `crm_contact_status`. La máquina es `applyCrmEvent` en `src/lib/crm-status.ts`. El insert lo vuelve a vigilar el trigger `private.enforce_crm_transition`.
- Bronce, Plata y Oro se calculan con `calculateIntegralResult`. No se guardan en `response_choices`.
- Correo y contraseña viven en `auth.users`. El listado lee `profiles.email`. Ningún `select` pide la contraseña.
- El rol vive en `profiles.role`. El alta pública sigue en `roleForSignup` (`src/lib/supabase/auth.ts`): `superadmin`, `moderador`, `capturista` e `invitador` que lleguen por ahí salen `empresario`. El panel crea esos tres roles de staff por otro camino, `staffDraft`.
- `director`, `capturista` e `invitador` exigen `organization_id`. `superadmin`, `moderador` y `empresario` lo llevan nulo (`profiles_org_matches_role`).
- Páginas nuevas: `export const instant = false`. Leen cookies. No editar `src/components/admin/nav.ts`, `src/components/admin/sidebar.tsx`, `src/components/admin/shell.tsx`, `src/components/site/site-frame.tsx` ni `src/components/ui/**`.
- `src/app/admin/[modulo]/page.tsx` se queda. Cada módulo agrega su carpeta estática (`src/app/admin/cuentas/page.tsx`), que en el App Router gana sobre `[modulo]`.
- La página servidor llama al loader. El formulario del navegador hace POST al route handler. El handler empieza con `await requireSuperadmin()` y usa el mismo comando.
- Cliente de datos: `adminDb()` con el JWT de la cookie (`createSupabaseWithAccess`). `createSupabaseAdmin()` solo para `auth.admin.createUser` al crear staff, después de `requireSuperadmin()`.
- Con `AUTH_PROVIDER=memory` (Playwright) `adminDb()` devuelve `null` y la lista sale vacía. No redirigir `/admin/correo` ni `/mesa`: `e2e/mesa.spec.ts` entra sin sesión.

## Mapa

| Módulo | Href en `nav.ts` | Lista | Detalle | Tareas |
| --- | --- | --- | --- | --- |
| Contrato | `/admin` ya existe | paginación 10 y `?tab=` | header + tabs | 1 |
| Cuentas | `/admin/cuentas` | `profiles` | empresa, pase, respuestas, correos | 2, 3 |
| Organismos | `/admin/organismos` | `organizations` | miembros, CRM, enlace, logo | 4, 5 |
| Empresas | `/admin/empresas` | `companies` | sector, tamaño, respuestas, pase | 6, 7 |
| CRM | `/admin/crm` | `crm_contacts` + vista de estatus | hechos, sin columna status | 8, 9 |
| Invitaciones | `/admin/invitaciones` | `crm_contacts.source` excel o manual | alta y confirmar | 10, 11 |
| Pases | `/admin/pases` | `passes` + `arrivals` | QR y una llegada | 12, 13 |
| Sectores | `/admin/sectores` | `sectors` | titular y cuerpo | 14, 15 |
| Sesiones | `/admin/sesiones` | `sessions` | temas, asistentes, una `is_current` | 16, 17 |
| Metodología | `/admin/metodologia` | `instrument_sections` | instrumento y nivel calculado | 18, 19 |
| Medios | `/admin/medios` | `media_assets` | logo, contenido, pase | 20, 21 |
| Bandeja | `/admin/bandeja` | `outbox_messages` | un mensaje y reintento | 22, 23 |
| Correo masivo | `/admin/correo` | quien terminó el perfil | un envío `open_innovation` | 24, 25 |
| Mesa | `/mesa` | formulario que ya existe | un escaneo | 26, 27 |

## Archivos del contrato (tarea 1)

| Archivo | Responsabilidad |
| --- | --- |
| `src/lib/admin/page-query.ts` | Página 1-based, 10 filas, `from`/`to` para `.range`. |
| `src/lib/admin/tab-query.ts` | Tab de `?tab=` o el de respaldo. |
| `src/lib/admin/admin-db.ts` | `requireSuperadmin` + cliente con el access token. |
| `src/components/admin/data-list.tsx` | Tabla de la lista. No vive en `components/ui`. |
| `src/components/admin/detail-frame.tsx` | Header y links `?tab=`. |
| `src/app/api/admin/route.ts` | Prueba viva de que el handler llama `requireSuperadmin`. |

---

### Task 1: Contrato de lista, detalle y sesión

**Files:**
- Create: `src/lib/admin/page-query.ts`
- Create: `src/lib/admin/tab-query.ts`
- Create: `src/lib/admin/admin-db.ts`
- Create: `src/lib/admin/contract.test.ts`
- Create: `src/components/admin/data-list.tsx`
- Create: `src/components/admin/detail-frame.tsx`
- Create: `src/app/api/admin/route.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { pageQuery } from "./page-query";
import { tabQuery } from "./tab-query";

describe("contrato del panel", () => {
  it("pide 10 filas y un tab desconocido cae al primero", () => {
    expect(pageQuery(undefined)).toEqual({ page: 1, from: 0, to: 9, size: 10 });
    expect(pageQuery("2")).toEqual({ page: 2, from: 10, to: 19, size: 10 });
    expect(pageQuery("0")).toEqual({ page: 1, from: 0, to: 9, size: 10 });
    expect(pageQuery("no")).toEqual({ page: 1, from: 0, to: 9, size: 10 });
    expect(tabQuery("crm", ["miembros", "crm"], "miembros")).toBe("crm");
    expect(tabQuery("borrar", ["miembros", "crm"], "miembros")).toBe("miembros");
    expect(tabQuery(undefined, ["empresa", "pase"], "empresa")).toBe("empresa");
  });

  it("el handler del panel llama a requireSuperadmin", () => {
    const source = readFileSync("src/app/api/admin/route.ts", "utf8");
    expect(source).toContain("await requireSuperadmin()");
    expect(source).toContain("pageQuery");
    expect(source).not.toMatch(/export async function DELETE/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/admin/contract.test.ts`

Expected: FAIL. No existe `./page-query`.

- [ ] **Step 3: Write minimal implementation**

`src/lib/admin/page-query.ts`

```ts
export const pageSize = 10;

export function pageQuery(raw: string | undefined) {
  const parsed = Number(raw);
  const page = Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
  const from = (page - 1) * pageSize;
  return { page, from, to: from + pageSize - 1, size: pageSize };
}
```

`src/lib/admin/tab-query.ts`

```ts
export function tabQuery(raw: string | undefined, allowed: readonly string[], fallback: string) {
  if (raw && allowed.includes(raw)) return raw;
  return fallback;
}
```

`src/lib/admin/admin-db.ts`

```ts
import "server-only";

import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import {
  createSupabaseWithAccess,
  readAccessToken,
  usesSupabaseAuth,
} from "@/lib/supabase/auth-session";

export async function adminDb() {
  await requireSuperadmin();
  if (!usesSupabaseAuth()) return null;
  const token = await readAccessToken();
  if (!token) return null;
  return createSupabaseWithAccess(token);
}
```

`src/components/admin/data-list.tsx`

```tsx
export function DataList({
  title,
  lead,
  columns,
  rows,
  page,
  basePath,
  error,
  children,
}: {
  title: string;
  lead: string;
  columns: { key: string; label: string }[];
  rows: Record<string, string>[];
  page: number;
  basePath: string;
  error?: string;
  children?: React.ReactNode;
}) {
  return (
    <main className="px-8 py-8">
      <h1 className="text-h1 text-ink">{title}</h1>
      <p className="mt-2 max-w-2xl text-body text-ink-secondary">{lead}</p>
      {error ? <p className="mt-4 text-small text-mark">{error}</p> : null}
      {children}
      {rows.length === 0 ? <p className="mt-8 text-body text-ink">Sin filas.</p> : null}
      {rows.length > 0 ? (
        <table className="mt-8 w-full text-left">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-2 py-2 text-small text-ink-secondary">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-line">
                {columns.map((column) => (
                  <td key={column.key} className="px-2 py-3 text-body text-ink">
                    {row[column.key] ?? ""}
                  </td>
                ))}
                <td className="px-2 py-3">
                  <a className="text-link" href={`${basePath}/${row.id}`}>
                    Abrir
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
      <p className="mt-4 text-small text-ink-secondary" data-testid="pagina">
        {page}
      </p>
      {page > 1 ? <a href={`${basePath}?page=${page - 1}`}>Anterior</a> : null}
      <a className="ml-4 text-link" href={`${basePath}?page=${page + 1}`}>
        Siguiente
      </a>
    </main>
  );
}
```

`src/components/admin/detail-frame.tsx`

```tsx
export function DetailFrame({
  title,
  backHref,
  facts,
  tabs,
  active,
  children,
}: {
  title: string;
  backHref: string;
  facts: { label: string; value: string }[];
  tabs: { value: string; label: string }[];
  active: string;
  children: React.ReactNode;
}) {
  return (
    <main className="px-8 py-8">
      <a className="text-body text-link" href={backHref}>
        Volver
      </a>
      <h1 className="mt-4 text-h1 text-ink">{title}</h1>
      <dl className="mt-6 grid gap-3 sm:grid-cols-2">
        {facts.map((fact) => (
          <div key={fact.label} className="rounded-xl border border-line bg-elevated px-4 py-3">
            <dt className="text-small text-ink-secondary">{fact.label}</dt>
            <dd className="text-body text-ink">{fact.value || "—"}</dd>
          </div>
        ))}
      </dl>
      <nav className="mt-8 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <a
            key={tab.value}
            href={`?tab=${tab.value}`}
            data-testid={`tab-${tab.value}`}
            className={tab.value === active ? "btn btn-primary" : "btn"}
          >
            {tab.label}
          </a>
        ))}
      </nav>
      <div className="mt-6">{children}</div>
    </main>
  );
}
```

`src/app/api/admin/route.ts`

```ts
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import { pageQuery } from "@/lib/admin/page-query";
import { tabQuery } from "@/lib/admin/tab-query";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  await requireSuperadmin();
  const page = pageQuery(request.nextUrl.searchParams.get("page") ?? undefined);
  const tab = tabQuery(request.nextUrl.searchParams.get("tab") ?? undefined, ["ficha"], "ficha");
  return Response.json({ page: page.page, size: page.size, tab });
}
```

Si `data-list.tsx` o `detail-frame.tsx` pasan de 90 líneas, corta el markup en un archivo hermano en el mismo paso. No sigas con el archivo largo.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/admin/contract.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/admin/page-query.ts src/lib/admin/tab-query.ts src/lib/admin/admin-db.ts src/lib/admin/contract.test.ts src/components/admin/data-list.tsx src/components/admin/detail-frame.tsx src/app/api/admin/route.ts
git commit -m "$(cat <<'EOF'
feat: contrato de lista y detalle del panel

EOF
)"
```

---

### Task 2: Lista de cuentas

**Files:**
- Create: `src/lib/admin/cuentas/staff-draft.ts`
- Create: `src/lib/admin/cuentas/list.ts`
- Create: `src/lib/admin/cuentas/create-staff.ts`
- Create: `src/lib/admin/cuentas/list.test.ts`
- Create: `src/app/api/admin/cuentas/route.ts`
- Create: `src/app/admin/cuentas/staff-form.tsx`
- Create: `src/app/admin/cuentas/page.tsx`

Href: `/admin/cuentas`. Tabla `profiles`. Columnas visibles: nombre, correo (`profiles.email`), rol, perfil terminado. No se lee la contraseña. El formulario crea solo moderador, capturista e invitador.

- [ ] **Step 1: Write the failing test**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { roleForSignup } from "@/lib/supabase/auth";
import { staffDraft } from "./staff-draft";

describe("lista de cuentas", () => {
  it("el panel crea staff y el alta pública no", () => {
    expect(roleForSignup("moderador")).toBe("empresario");
    expect(roleForSignup("capturista")).toBe("empresario");
    expect(roleForSignup("invitador")).toBe("empresario");
    expect(roleForSignup("superadmin")).toBe("empresario");
    expect(staffDraft({ role: "moderador", organizationId: "" })).toEqual({
      ok: true,
      role: "moderador",
      organizationId: null,
    });
    expect(staffDraft({ role: "capturista", organizationId: "" })).toEqual({
      ok: false,
      reason: "ese rol exige organismo",
    });
    expect(staffDraft({ role: "invitador", organizationId: "org-1" })).toEqual({
      ok: true,
      role: "invitador",
      organizationId: "org-1",
    });
    expect(staffDraft({ role: "superadmin", organizationId: "" }).ok).toBe(false);
    expect(staffDraft({ role: "empresario", organizationId: "" }).ok).toBe(false);
    expect(staffDraft({ role: "director", organizationId: "org-1" }).ok).toBe(false);
  });

  it("la lista lee profiles y el handler no borra", () => {
    const list = readFileSync("src/lib/admin/cuentas/list.ts", "utf8");
    const route = readFileSync("src/app/api/admin/cuentas/route.ts", "utf8");
    expect(list).toContain('.from("profiles")');
    expect(list).toContain("full_name");
    expect(list).toContain("email");
    expect(list).toContain("role");
    expect(list).toContain(".range(page.from, page.to)");
    expect(list).not.toContain("password");
    expect(route).toContain("await requireSuperadmin()");
    expect(route).not.toMatch(/export async function DELETE/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/admin/cuentas/list.test.ts`

Expected: FAIL. No existe `./staff-draft`.

- [ ] **Step 3: Write minimal implementation**

`src/lib/admin/cuentas/staff-draft.ts`

```ts
const staffRoles = ["moderador", "capturista", "invitador"] as const;
type StaffRole = (typeof staffRoles)[number];

export function staffDraft(input: { role: string; organizationId: string }) {
  if (!staffRoles.includes(input.role as StaffRole)) {
    return { ok: false as const, reason: "ese rol no se crea aquí" };
  }
  const role = input.role as StaffRole;
  const organizationId = input.organizationId.trim();
  if (role === "moderador") return { ok: true as const, role, organizationId: null };
  if (!organizationId) return { ok: false as const, reason: "ese rol exige organismo" };
  return { ok: true as const, role, organizationId };
}
```

`src/lib/admin/cuentas/list.ts`

```ts
import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { pageQuery } from "@/lib/admin/page-query";

export async function listCuentas(rawPage: string | undefined) {
  const page = pageQuery(rawPage);
  const db = await adminDb();
  if (!db) return { page: page.page, rows: [] as Record<string, string>[], orgs: [] as { id: string; name: string }[] };
  const profiles = await db
    .from("profiles")
    .select("id, full_name, email, role, onboarded_at")
    .order("created_at", { ascending: false })
    .range(page.from, page.to);
  if (profiles.error) throw new Error(profiles.error.message);
  const orgs = await db.from("organizations").select("id, name").order("name");
  if (orgs.error) throw new Error(orgs.error.message);
  return {
    page: page.page,
    rows: (profiles.data ?? []).map((row) => ({
      id: row.id,
      full_name: row.full_name ?? "",
      email: row.email ?? "",
      role: row.role,
      onboarded_at: row.onboarded_at ? "Terminado" : "Sin terminar",
    })),
    orgs: (orgs.data ?? []).map((org) => ({ id: org.id, name: org.name ?? org.id })),
  };
}
```

`src/lib/admin/cuentas/create-staff.ts`

```ts
import "server-only";

import { accountErrors } from "@/lib/account-draft";
import { adminDb } from "@/lib/admin/admin-db";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { staffDraft } from "./staff-draft";

export async function createStaff(form: FormData) {
  const email = String(form.get("email") ?? "");
  const password = String(form.get("password") ?? "");
  const draft = staffDraft({
    role: String(form.get("role") ?? ""),
    organizationId: String(form.get("organization_id") ?? ""),
  });
  if (!draft.ok) return draft;
  const errors = accountErrors({ email, password });
  if (errors) return { ok: false as const, reason: errors.email ?? errors.password ?? "datos inválidos" };
  const admin = createSupabaseAdmin();
  const created = await admin.auth.admin.createUser({
    email: email.trim().toLowerCase(),
    password,
    email_confirm: true,
  });
  if (created.error || !created.data.user) {
    return { ok: false as const, reason: created.error?.message ?? "no se creó la cuenta" };
  }
  const db = await adminDb();
  if (!db) {
    await admin.auth.admin.deleteUser(created.data.user.id);
    return { ok: false as const, reason: "sin sesión de supabase" };
  }
  const inserted = await db.from("profiles").insert({
    id: created.data.user.id,
    role: draft.role,
    email: email.trim().toLowerCase(),
    organization_id: draft.organizationId,
  });
  if (inserted.error) {
    await admin.auth.admin.deleteUser(created.data.user.id);
    return { ok: false as const, reason: inserted.error.message };
  }
  return { ok: true as const, id: created.data.user.id };
}
```

`deleteUser` aquí solo deshace un `auth.users` que quedó sin fila en `profiles`. No borra un perfil.

`src/app/api/admin/cuentas/route.ts`

```ts
import { createStaff } from "@/lib/admin/cuentas/create-staff";
import { listCuentas } from "@/lib/admin/cuentas/list";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  await requireSuperadmin();
  const body = await listCuentas(request.nextUrl.searchParams.get("page") ?? undefined);
  return Response.json(body);
}

export async function POST(request: NextRequest) {
  await requireSuperadmin();
  const result = await createStaff(await request.formData());
  const path = result.ok ? "/admin/cuentas" : `/admin/cuentas?error=${encodeURIComponent(result.reason)}`;
  return NextResponse.redirect(new URL(path, request.url));
}
```

`src/app/admin/cuentas/staff-form.tsx`

```tsx
export function StaffForm({ orgs, error }: { orgs: { id: string; name: string }[]; error: string }) {
  return (
    <form action="/api/admin/cuentas" method="post" className="mt-8 grid max-w-xl gap-3">
      {error ? <p className="text-small text-mark">{error}</p> : null}
      <label className="grid gap-1 text-small text-ink" htmlFor="email">
        Correo
        <input id="email" name="email" type="email" className="rounded-lg border border-line px-3 py-2" />
      </label>
      <label className="grid gap-1 text-small text-ink" htmlFor="password">
        Contraseña
        <input id="password" name="password" type="password" className="rounded-lg border border-line px-3 py-2" />
      </label>
      <label className="grid gap-1 text-small text-ink" htmlFor="role">
        Rol
        <select id="role" name="role" className="rounded-lg border border-line px-3 py-2">
          <option value="moderador">Moderador</option>
          <option value="capturista">Capturista</option>
          <option value="invitador">Invitador</option>
        </select>
      </label>
      <label className="grid gap-1 text-small text-ink" htmlFor="organization_id">
        Organismo
        <select id="organization_id" name="organization_id" className="rounded-lg border border-line px-3 py-2">
          <option value="">Ninguno</option>
          {orgs.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name}
            </option>
          ))}
        </select>
      </label>
      <button className="btn btn-primary" type="submit">
        Crear cuenta de staff
      </button>
    </form>
  );
}
```

`src/app/admin/cuentas/page.tsx`

```tsx
import { DataList } from "@/components/admin/data-list";
import { StaffForm } from "@/app/admin/cuentas/staff-form";
import { listCuentas } from "@/lib/admin/cuentas/list";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

export default async function CuentasPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; error?: string }>;
}) {
  await requireSuperadmin();
  const params = await searchParams;
  const data = await listCuentas(params.page);
  return (
    <DataList
      title="Cuentas"
      lead="Perfiles de los seis roles. El alta pública no elige staff."
      columns={[
        { key: "full_name", label: "Nombre" },
        { key: "email", label: "Correo" },
        { key: "role", label: "Rol" },
        { key: "onboarded_at", label: "Perfil" },
      ]}
      rows={data.rows}
      page={data.page}
      basePath="/admin/cuentas"
      error={params.error}
    >
      <StaffForm orgs={data.orgs} error={params.error ?? ""} />
    </DataList>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/admin/cuentas/list.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/admin/cuentas/staff-draft.ts src/lib/admin/cuentas/list.ts src/lib/admin/cuentas/create-staff.ts src/lib/admin/cuentas/list.test.ts src/app/api/admin/cuentas/route.ts src/app/admin/cuentas/staff-form.tsx src/app/admin/cuentas/page.tsx
git commit -m "$(cat <<'EOF'
feat: lista de cuentas del superadmin

EOF
)"
```

---

### Task 3: Detalle de cuentas

**Files:**
- Create: `src/lib/admin/cuentas/role-change.ts`
- Create: `src/lib/admin/cuentas/detail.ts`
- Create: `src/lib/admin/cuentas/detail.test.ts`
- Create: `src/app/api/admin/cuentas/[id]/route.ts`
- Create: `src/app/admin/cuentas/[id]/page.tsx`
- Create: `src/app/admin/cuentas/[id]/role-form.tsx`

Tabs: `empresa`, `pase`, `respuestas`, `correos`. La acción de esta pantalla es cambiar el rol. No hay botón de borrar.

- [ ] **Step 1: Write the failing test**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { roleChange } from "./role-change";

describe("detalle de cuentas", () => {
  it("cambiar rol respeta el organismo y no borra el perfil", () => {
    expect(roleChange({ role: "moderador", organizationId: "org-1" })).toEqual({
      ok: false,
      reason: "ese rol no lleva organismo",
    });
    expect(roleChange({ role: "capturista", organizationId: "" })).toEqual({
      ok: false,
      reason: "ese rol exige organismo",
    });
    expect(roleChange({ role: "invitador", organizationId: "org-1" })).toEqual({
      ok: true,
      role: "invitador",
      organizationId: "org-1",
    });
    expect(roleChange({ role: "empresario", organizationId: "" })).toEqual({
      ok: true,
      role: "empresario",
      organizationId: null,
    });
    expect(roleChange({ role: "otro", organizationId: "" }).ok).toBe(false);
  });

  it("el detalle trae empresa, pase, respuestas y correos", () => {
    const source = readFileSync("src/lib/admin/cuentas/detail.ts", "utf8");
    const route = readFileSync("src/app/api/admin/cuentas/[id]/route.ts", "utf8");
    expect(source).toContain('.from("companies")');
    expect(source).toContain('.from("passes")');
    expect(source).toContain('.from("response_choices")');
    expect(source).toContain('.from("outbox_messages")');
    expect(source).not.toContain("password");
    expect(route).toContain("await requireSuperadmin()");
    expect(route).not.toMatch(/export async function DELETE/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/admin/cuentas/detail.test.ts`

Expected: FAIL. No existe `./role-change`.

- [ ] **Step 3: Write minimal implementation**

`src/lib/admin/cuentas/role-change.ts`

```ts
const roles = ["superadmin", "moderador", "empresario", "director", "capturista", "invitador"] as const;
type Role = (typeof roles)[number];

export function roleChange(input: { role: string; organizationId: string }) {
  if (!roles.includes(input.role as Role)) return { ok: false as const, reason: "rol inválido" };
  const role = input.role as Role;
  const needsOrg = role === "director" || role === "capturista" || role === "invitador";
  const organizationId = input.organizationId.trim();
  if (needsOrg && !organizationId) return { ok: false as const, reason: "ese rol exige organismo" };
  if (!needsOrg && organizationId) return { ok: false as const, reason: "ese rol no lleva organismo" };
  return { ok: true as const, role, organizationId: needsOrg ? organizationId : null };
}
```

`src/lib/admin/cuentas/detail.ts`

```ts
import "server-only";

import { adminDb } from "@/lib/admin/admin-db";

export async function loadCuenta(id: string) {
  const db = await adminDb();
  if (!db) return null;
  const profile = await db
    .from("profiles")
    .select("id, full_name, email, role, job_title, whatsapp, organization_id, onboarded_at")
    .eq("id", id)
    .maybeSingle();
  if (profile.error) throw new Error(profile.error.message);
  if (!profile.data) return null;
  const [company, pass, answers, mail, orgs] = await Promise.all([
    db.from("companies").select("legal_name, employee_band, sector_id").eq("profile_id", id).maybeSingle(),
    db.from("passes").select("profile_id, issued_at, image_asset_id").eq("profile_id", id).maybeSingle(),
    db.from("response_choices").select("question_id, option_value, rank").eq("profile_id", id),
    db.from("outbox_messages").select("id, kind, subject, to_email, created_at").eq("profile_id", id),
    db.from("organizations").select("id, name").order("name"),
  ]);
  for (const result of [company, pass, answers, mail, orgs]) {
    if (result.error) throw new Error(result.error.message);
  }
  return {
    profile: profile.data,
    company: company.data,
    pass: pass.data,
    answers: answers.data ?? [],
    mail: mail.data ?? [],
    orgs: orgs.data ?? [],
  };
}
```

`src/app/api/admin/cuentas/[id]/route.ts`

```ts
import { loadCuenta } from "@/lib/admin/cuentas/detail";
import { roleChange } from "@/lib/admin/cuentas/role-change";
import { adminDb } from "@/lib/admin/admin-db";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  await requireSuperadmin();
  const { id } = await context.params;
  const row = await loadCuenta(id);
  if (!row) return Response.json({ error: "no encontrada" }, { status: 404 });
  return Response.json(row);
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  await requireSuperadmin();
  const { id } = await context.params;
  const form = await request.formData();
  const next = roleChange({
    role: String(form.get("role") ?? ""),
    organizationId: String(form.get("organization_id") ?? ""),
  });
  const back = `/admin/cuentas/${id}`;
  if (!next.ok) return NextResponse.redirect(new URL(`${back}?error=${encodeURIComponent(next.reason)}`, request.url));
  const db = await adminDb();
  if (!db) return NextResponse.redirect(new URL(`${back}?error=sin%20sesi%C3%B3n`, request.url));
  const updated = await db.from("profiles").update({ role: next.role, organization_id: next.organizationId }).eq("id", id);
  if (updated.error) return NextResponse.redirect(new URL(`${back}?error=${encodeURIComponent(updated.error.message)}`, request.url));
  return NextResponse.redirect(new URL(back, request.url));
}
```

`src/app/admin/cuentas/[id]/role-form.tsx`

```tsx
const roles = ["superadmin", "moderador", "empresario", "director", "capturista", "invitador"];

export function RoleForm({
  id,
  role,
  organizationId,
  orgs,
}: {
  id: string;
  role: string;
  organizationId: string;
  orgs: { id: string; name: string | null }[];
}) {
  return (
    <form action={`/api/admin/cuentas/${id}`} method="post" className="grid max-w-md gap-3">
      <label className="grid gap-1 text-small" htmlFor="role">
        Rol
        <select id="role" name="role" defaultValue={role} className="rounded-lg border border-line px-3 py-2">
          {roles.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-small" htmlFor="organization_id">
        Organismo
        <select id="organization_id" name="organization_id" defaultValue={organizationId} className="rounded-lg border border-line px-3 py-2">
          <option value="">Ninguno</option>
          {orgs.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name ?? org.id}
            </option>
          ))}
        </select>
      </label>
      <button className="btn btn-primary" type="submit">
        Cambiar rol
      </button>
    </form>
  );
}
```

`src/app/admin/cuentas/[id]/page.tsx`

```tsx
import { notFound } from "next/navigation";
import { DetailFrame } from "@/components/admin/detail-frame";
import { RoleForm } from "@/app/admin/cuentas/[id]/role-form";
import { tabQuery } from "@/lib/admin/tab-query";
import { loadCuenta } from "@/lib/admin/cuentas/detail";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

const tabs = [
  { value: "empresa", label: "Empresa" },
  { value: "pase", label: "Pase" },
  { value: "respuestas", label: "Respuestas" },
  { value: "correos", label: "Correos" },
];

export default async function CuentaDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; error?: string }>;
}) {
  await requireSuperadmin();
  const { id } = await params;
  const query = await searchParams;
  const data = await loadCuenta(id);
  if (!data) notFound();
  const active = tabQuery(query.tab, tabs.map((tab) => tab.value), "empresa");
  const profile = data.profile;
  return (
    <DetailFrame
      title={profile.full_name || profile.email || id}
      backHref="/admin/cuentas"
      facts={[
        { label: "Correo", value: profile.email ?? "" },
        { label: "Rol", value: profile.role },
        { label: "Puesto", value: profile.job_title ?? "" },
        { label: "WhatsApp", value: profile.whatsapp ?? "" },
      ]}
      tabs={tabs}
      active={active}
    >
      {query.error ? <p className="mb-4 text-small text-mark">{query.error}</p> : null}
      <RoleForm id={id} role={profile.role} organizationId={profile.organization_id ?? ""} orgs={data.orgs} />
      {active === "empresa" ? <p className="mt-4">{data.company?.legal_name ?? "Sin empresa."}</p> : null}
      {active === "pase" ? <p className="mt-4">{data.pass ? "Pase emitido." : "Sin pase."}</p> : null}
      {active === "respuestas" ? (
        <ul className="mt-4">
          {data.answers.map((row) => (
            <li key={`${row.question_id}-${row.option_value}`}>
              {row.question_id}: {row.option_value}
            </li>
          ))}
        </ul>
      ) : null}
      {active === "correos" ? (
        <ul className="mt-4">
          {data.mail.map((row) => (
            <li key={row.id}>
              {row.kind}: {row.subject}
            </li>
          ))}
        </ul>
      ) : null}
    </DetailFrame>
  );
}
```

Si `page.tsx` pasa de 90 líneas, mueve el switch de tabs a `src/app/admin/cuentas/[id]/tabs.tsx` en este mismo paso.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/admin/cuentas/detail.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/admin/cuentas/role-change.ts src/lib/admin/cuentas/detail.ts src/lib/admin/cuentas/detail.test.ts src/app/api/admin/cuentas/[id]/route.ts src/app/admin/cuentas/[id]/page.tsx src/app/admin/cuentas/[id]/role-form.tsx
git commit -m "$(cat <<'EOF'
feat: detalle de cuenta con rol, empresa, pase y correos

EOF
)"
```

---

### Task 4: Lista de organismos

**Files:**
- Create: `src/lib/admin/organismos/organization-patch.ts`
- Create: `src/lib/admin/organismos/list.ts`
- Create: `src/lib/admin/organismos/list.test.ts`
- Create: `src/app/api/admin/organismos/route.ts`
- Create: `src/app/admin/organismos/page.tsx`

Href: `/admin/organismos`. Tabla `organizations`. Columnas: nombre, color, marca. No se borra el organismo.

- [ ] **Step 1: Write the failing test**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { organizationPatch } from "./organization-patch";

describe("lista de organismos", () => {
  it("acepta nombre y color hex y no marca la marca sin logo", () => {
    expect(organizationPatch({ name: "A", brandColor: "#1B3A5C" }).ok).toBe(false);
    expect(organizationPatch({ name: "CANACINTRA", brandColor: "azul" }).ok).toBe(false);
    expect(organizationPatch({ name: "CANACINTRA", brandColor: "#1B3A5C" })).toEqual({
      ok: true,
      name: "CANACINTRA",
      brand_color: "#1B3A5C",
    });
  });

  it("la lista lee organizations y no exporta DELETE", () => {
    const list = readFileSync("src/lib/admin/organismos/list.ts", "utf8");
    const route = readFileSync("src/app/api/admin/organismos/route.ts", "utf8");
    expect(list).toContain('.from("organizations")');
    expect(list).toContain("name");
    expect(list).toContain("brand_color");
    expect(list).toContain("brand_completed_at");
    expect(list).toContain(".range(page.from, page.to)");
    expect(route).toContain("await requireSuperadmin()");
    expect(route).not.toMatch(/export async function DELETE/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/admin/organismos/list.test.ts`

Expected: FAIL. No existe `./organization-patch`.

- [ ] **Step 3: Write minimal implementation**

`src/lib/admin/organismos/organization-patch.ts`

```ts
export function organizationPatch(input: { name: string; brandColor: string }) {
  const name = input.name.trim();
  if (name.length < 2 || name.length > 160) return { ok: false as const, reason: "nombre inválido" };
  const brandColor = input.brandColor.trim();
  if (!/^#[0-9A-Fa-f]{6}$/.test(brandColor)) return { ok: false as const, reason: "color inválido" };
  return { ok: true as const, name, brand_color: brandColor };
}
```

`src/lib/admin/organismos/list.ts`

```ts
import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { pageQuery } from "@/lib/admin/page-query";

export async function listOrganismos(rawPage: string | undefined) {
  const page = pageQuery(rawPage);
  const db = await adminDb();
  if (!db) return { page: page.page, rows: [] as Record<string, string>[] };
  const result = await db
    .from("organizations")
    .select("id, name, brand_color, brand_completed_at")
    .order("created_at", { ascending: false })
    .range(page.from, page.to);
  if (result.error) throw new Error(result.error.message);
  return {
    page: page.page,
    rows: (result.data ?? []).map((row) => ({
      id: row.id,
      name: row.name ?? "",
      brand_color: row.brand_color ?? "",
      brand_completed_at: row.brand_completed_at ? "Lista" : "Incompleta",
    })),
  };
}
```

`src/app/api/admin/organismos/route.ts`

```ts
import { listOrganismos } from "@/lib/admin/organismos/list";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  await requireSuperadmin();
  const body = await listOrganismos(request.nextUrl.searchParams.get("page") ?? undefined);
  return Response.json(body);
}
```

`src/app/admin/organismos/page.tsx`

```tsx
import { DataList } from "@/components/admin/data-list";
import { listOrganismos } from "@/lib/admin/organismos/list";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

export default async function OrganismosPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireSuperadmin();
  const params = await searchParams;
  const data = await listOrganismos(params.page);
  return (
    <DataList
      title="Organismos"
      lead="Quien convoca: marca, miembros y enlaces."
      columns={[
        { key: "name", label: "Nombre" },
        { key: "brand_color", label: "Color" },
        { key: "brand_completed_at", label: "Marca" },
      ]}
      rows={data.rows}
      page={data.page}
      basePath="/admin/organismos"
    />
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/admin/organismos/list.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/admin/organismos/organization-patch.ts src/lib/admin/organismos/list.ts src/lib/admin/organismos/list.test.ts src/app/api/admin/organismos/route.ts src/app/admin/organismos/page.tsx
git commit -m "$(cat <<'EOF'
feat: lista de organismos del panel

EOF
)"
```

---

### Task 5: Detalle de organismos

**Files:**
- Create: `src/lib/admin/organismos/brand.ts`
- Create: `src/lib/admin/organismos/detail.ts`
- Create: `src/lib/admin/organismos/detail.test.ts`
- Create: `src/app/api/admin/organismos/[id]/route.ts`
- Create: `src/app/api/admin/organismos/[id]/logo/route.ts`
- Create: `src/app/api/admin/organismos/[id]/enlace/route.ts`
- Create: `src/app/admin/organismos/[id]/page.tsx`

Tabs: `miembros`, `crm`, `enlace`, `logo`. El logo es `media_assets` con `purpose = organization_logo` y la ruta de `logoObjectPath`. El enlace visible es `/${sectorSlug}?${token}` (`sealRef`). No se pone `brand_completed_at` si falta nombre, color o logo: el trigger `organizations_require_brand` lo rechaza.

- [ ] **Step 1: Write the failing test**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { brandStamp, eventPath } from "./brand";

describe("detalle de organismos", () => {
  it("la marca queda incompleta sin logo y el enlace lleva el sector", () => {
    expect(brandStamp({ name: "CANACINTRA", brandColor: "#1B3A5C", hasLogo: false })).toBeNull();
    expect(brandStamp({ name: null, brandColor: "#1B3A5C", hasLogo: true })).toBeNull();
    const stamped = brandStamp({ name: "CANACINTRA", brandColor: "#1B3A5C", hasLogo: true });
    expect(typeof stamped).toBe("string");
    expect(eventPath("turismo", "abc")).toBe("/turismo?abc");
  });

  it("el detalle lee miembros, crm, copias y logo", () => {
    const source = readFileSync("src/lib/admin/organismos/detail.ts", "utf8");
    const route = readFileSync("src/app/api/admin/organismos/[id]/route.ts", "utf8");
    expect(source).toContain('.from("profiles")');
    expect(source).toContain('.from("crm_contacts")');
    expect(source).toContain('.from("link_copies")');
    expect(source).toContain("organization_logo");
    expect(route).toContain("await requireSuperadmin()");
    expect(route).not.toMatch(/export async function DELETE/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/admin/organismos/detail.test.ts`

Expected: FAIL. No existe `./brand`.

- [ ] **Step 3: Write minimal implementation**

`src/lib/admin/organismos/brand.ts`

```ts
export function brandStamp(input: { name: string | null; brandColor: string | null; hasLogo: boolean }) {
  if (!input.name || !input.brandColor || !input.hasLogo) return null;
  return new Date().toISOString();
}

export function eventPath(sectorSlug: string, token: string) {
  return `/${sectorSlug}?${token}`;
}
```

`src/lib/admin/organismos/detail.ts`

```ts
import "server-only";

import { adminDb } from "@/lib/admin/admin-db";

export async function loadOrganismo(id: string) {
  const db = await adminDb();
  if (!db) return null;
  const org = await db.from("organizations").select("id, name, brand_color, brand_completed_at").eq("id", id).maybeSingle();
  if (org.error) throw new Error(org.error.message);
  if (!org.data) return null;
  const [members, contacts, copies, logo, sectors] = await Promise.all([
    db.from("profiles").select("id, full_name, email, role").eq("organization_id", id),
    db.from("crm_contacts").select("id, nombre, empresa, email, source").eq("organization_id", id),
    db.from("link_copies").select("id, sector_id, created_at").eq("organization_id", id),
    db.from("media_assets").select("id, object_path, content_type").eq("organization_id", id).eq("purpose", "organization_logo").maybeSingle(),
    db.from("sectors").select("id, slug, name").order("position"),
  ]);
  for (const result of [members, contacts, copies, logo, sectors]) {
    if (result.error) throw new Error(result.error.message);
  }
  return { org: org.data, members: members.data ?? [], contacts: contacts.data ?? [], copies: copies.data ?? [], logo: logo.data, sectors: sectors.data ?? [] };
}
```

`src/app/api/admin/organismos/[id]/route.ts`

```ts
import { adminDb } from "@/lib/admin/admin-db";
import { brandStamp } from "@/lib/admin/organismos/brand";
import { loadOrganismo } from "@/lib/admin/organismos/detail";
import { organizationPatch } from "@/lib/admin/organismos/organization-patch";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  await requireSuperadmin();
  const { id } = await context.params;
  const row = await loadOrganismo(id);
  if (!row) return Response.json({ error: "no encontrado" }, { status: 404 });
  return Response.json(row);
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  await requireSuperadmin();
  const { id } = await context.params;
  const form = await request.formData();
  const patch = organizationPatch({ name: String(form.get("name") ?? ""), brandColor: String(form.get("brand_color") ?? "") });
  const back = `/admin/organismos/${id}`;
  if (!patch.ok) return NextResponse.redirect(new URL(`${back}?error=${encodeURIComponent(patch.reason)}`, request.url));
  const db = await adminDb();
  if (!db) return NextResponse.redirect(new URL(`${back}?error=sin%20sesi%C3%B3n`, request.url));
  const logo = await db.from("media_assets").select("id").eq("organization_id", id).eq("purpose", "organization_logo").maybeSingle();
  const stamp = brandStamp({ name: patch.name, brandColor: patch.brand_color, hasLogo: Boolean(logo.data) });
  const updated = await db.from("organizations").update({ name: patch.name, brand_color: patch.brand_color, brand_completed_at: stamp }).eq("id", id);
  if (updated.error) return NextResponse.redirect(new URL(`${back}?error=${encodeURIComponent(updated.error.message)}`, request.url));
  return NextResponse.redirect(new URL(back, request.url));
}
```

`src/app/api/admin/organismos/[id]/logo/route.ts`

```ts
import { adminDb } from "@/lib/admin/admin-db";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import { logoObjectPath } from "@/lib/storage-assets";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  await requireSuperadmin();
  const { id } = await context.params;
  const form = await request.formData();
  const file = form.get("logo");
  const back = `/admin/organismos/${id}?tab=logo`;
  if (!(file instanceof File)) return NextResponse.redirect(new URL(`${back}&error=falta%20el%20archivo`, request.url));
  if (file.size > 2_097_152) return NextResponse.redirect(new URL(`${back}&error=pasa%20de%202%20MB`, request.url));
  let objectPath = "";
  try {
    objectPath = logoObjectPath(id, file.type);
  } catch (error) {
    const message = error instanceof Error ? error.message : "tipo de imagen no permitido";
    return NextResponse.redirect(new URL(`${back}&error=${encodeURIComponent(message)}`, request.url));
  }
  const db = await adminDb();
  if (!db) return NextResponse.redirect(new URL(`${back}&error=sin%20sesi%C3%B3n`, request.url));
  const uploaded = await db.storage.from("organization-logos").upload(objectPath, file, { upsert: true, contentType: file.type });
  if (uploaded.error) return NextResponse.redirect(new URL(`${back}&error=${encodeURIComponent(uploaded.error.message)}`, request.url));
  const existing = await db.from("media_assets").select("id").eq("organization_id", id).eq("purpose", "organization_logo").maybeSingle();
  const payload = { object_path: objectPath, content_type: file.type, byte_size: file.size };
  const saved = existing.data
    ? await db.from("media_assets").update(payload).eq("id", existing.data.id)
    : await db.from("media_assets").insert({ ...payload, purpose: "organization_logo", bucket_id: "organization-logos", organization_id: id });
  if (saved.error) return NextResponse.redirect(new URL(`${back}&error=${encodeURIComponent(saved.error.message)}`, request.url));
  return NextResponse.redirect(new URL(back, request.url));
}
```

`src/app/api/admin/organismos/[id]/enlace/route.ts`

```ts
import { adminDb } from "@/lib/admin/admin-db";
import { eventPath } from "@/lib/admin/organismos/brand";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import { readSuperadmin } from "@/lib/auth/require-superadmin";
import { sealRef } from "@/lib/ref-token";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  await requireSuperadmin();
  const account = await readSuperadmin();
  const { id } = await context.params;
  const form = await request.formData();
  const sectorId = String(form.get("sector_id") ?? "");
  const back = `/admin/organismos/${id}?tab=enlace`;
  const db = await adminDb();
  if (!db || !account) return NextResponse.redirect(new URL(`${back}&error=sin%20sesi%C3%B3n`, request.url));
  const sector = await db.from("sectors").select("slug").eq("id", sectorId).maybeSingle();
  if (!sector.data) return NextResponse.redirect(new URL(`${back}&error=sector%20inv%C3%A1lido`, request.url));
  const actor = await db.from("profiles").select("id").eq("email", account.email).maybeSingle();
  if (!actor.data) return NextResponse.redirect(new URL(`${back}&error=sin%20actor`, request.url));
  const token = sealRef(id, process.env.REF_SECRET ?? "");
  const inserted = await db.from("link_copies").insert({ organization_id: id, sector_id: sectorId, actor_id: actor.data.id });
  if (inserted.error) return NextResponse.redirect(new URL(`${back}&error=${encodeURIComponent(inserted.error.message)}`, request.url));
  const path = eventPath(sector.data.slug, token);
  return NextResponse.redirect(new URL(`${back}&enlace=${encodeURIComponent(path)}`, request.url));
}
```

`src/app/admin/organismos/[id]/page.tsx`

```tsx
import { notFound } from "next/navigation";
import { DetailFrame } from "@/components/admin/detail-frame";
import { tabQuery } from "@/lib/admin/tab-query";
import { loadOrganismo } from "@/lib/admin/organismos/detail";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

const tabs = [
  { value: "miembros", label: "Miembros" },
  { value: "crm", label: "CRM" },
  { value: "enlace", label: "Enlace" },
  { value: "logo", label: "Logo" },
];

export default async function OrganismoDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; error?: string; enlace?: string }>;
}) {
  await requireSuperadmin();
  const { id } = await params;
  const query = await searchParams;
  const data = await loadOrganismo(id);
  if (!data) notFound();
  const active = tabQuery(query.tab, tabs.map((tab) => tab.value), "miembros");
  return (
    <DetailFrame
      title={data.org.name ?? id}
      backHref="/admin/organismos"
      facts={[
        { label: "Color", value: data.org.brand_color ?? "" },
        { label: "Marca", value: data.org.brand_completed_at ? "Lista" : "Incompleta" },
      ]}
      tabs={tabs}
      active={active}
    >
      {query.error ? <p className="text-small text-mark">{query.error}</p> : null}
      <form action={`/api/admin/organismos/${id}`} method="post" className="mt-4 grid max-w-md gap-3">
        <input name="name" defaultValue={data.org.name ?? ""} className="rounded-lg border border-line px-3 py-2" />
        <input name="brand_color" defaultValue={data.org.brand_color ?? ""} className="rounded-lg border border-line px-3 py-2" />
        <button className="btn btn-primary" type="submit">Guardar nombre y color</button>
      </form>
      {active === "miembros" ? <ul className="mt-4">{data.members.map((row) => <li key={row.id}>{row.role}: {row.email}</li>)}</ul> : null}
      {active === "crm" ? <ul className="mt-4">{data.contacts.map((row) => <li key={row.id}>{row.email} · {row.source}</li>)}</ul> : null}
      {active === "enlace" ? (
        <form action={`/api/admin/organismos/${id}/enlace`} method="post" className="mt-4 grid gap-3">
          <select name="sector_id">{data.sectors.map((sector) => <option key={sector.id} value={sector.id}>{sector.name}</option>)}</select>
          <button className="btn btn-primary" type="submit">Copiar enlace del evento</button>
          {query.enlace ? <p data-testid="enlace-evento">{query.enlace}</p> : null}
          <p>{data.copies.length} copias</p>
        </form>
      ) : null}
      {active === "logo" ? (
        <form action={`/api/admin/organismos/${id}/logo`} method="post" encType="multipart/form-data" className="mt-4 grid gap-3">
          <p>{data.logo?.object_path ?? "Sin logo."}</p>
          <input name="logo" type="file" accept="image/png,image/jpeg,image/webp" />
          <button className="btn btn-primary" type="submit">Subir logo</button>
        </form>
      ) : null}
    </DetailFrame>
  );
}
```

Si `page.tsx` pasa de 90 líneas, mueve cada tab a `src/app/admin/organismos/[id]/tabs.tsx` en este paso.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/admin/organismos/detail.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/admin/organismos/brand.ts src/lib/admin/organismos/detail.ts src/lib/admin/organismos/detail.test.ts src/app/api/admin/organismos/[id]/route.ts src/app/api/admin/organismos/[id]/logo/route.ts src/app/api/admin/organismos/[id]/enlace/route.ts src/app/admin/organismos/[id]/page.tsx
git commit -m "$(cat <<'EOF'
feat: detalle de organismo con miembros, CRM, enlace y logo

EOF
)"
```

---

### Task 6: Lista de empresas

**Files:**
- Create: `src/lib/admin/empresas/band-label.ts`
- Create: `src/lib/admin/empresas/list.ts`
- Create: `src/lib/admin/empresas/list.test.ts`
- Create: `src/app/api/admin/empresas/route.ts`
- Create: `src/app/admin/empresas/page.tsx`

Href: `/admin/empresas`. Tabla `companies`. Columnas: razón social, banda `employee_band`, sector. No se borra la empresa.

- [ ] **Step 1: Write the failing test**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { bandLabel } from "./band-label";

describe("lista de empresas", () => {
  it("traduce la banda guardada", () => {
    expect(bandLabel("1_10")).toBe("1–10");
    expect(bandLabel("11_50")).toBe("11–50");
    expect(bandLabel("51_250")).toBe("51–250");
    expect(bandLabel("250_plus")).toBe("250+");
    expect(bandLabel("otra")).toBe("");
  });

  it("la lista lee companies y el tamaño", () => {
    const list = readFileSync("src/lib/admin/empresas/list.ts", "utf8");
    const route = readFileSync("src/app/api/admin/empresas/route.ts", "utf8");
    expect(list).toContain('.from("companies")');
    expect(list).toContain("legal_name");
    expect(list).toContain("employee_band");
    expect(list).toContain("sector_id");
    expect(list).toContain(".range(page.from, page.to)");
    expect(route).toContain("await requireSuperadmin()");
    expect(route).not.toMatch(/export async function DELETE/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/admin/empresas/list.test.ts`

Expected: FAIL. No existe `./band-label`.

- [ ] **Step 3: Write minimal implementation**

`src/lib/admin/empresas/band-label.ts`

```ts
const labels: Record<string, string> = {
  "1_10": "1–10",
  "11_50": "11–50",
  "51_250": "51–250",
  "250_plus": "250+",
};

export function bandLabel(value: string) {
  return labels[value] ?? "";
}
```

`src/lib/admin/empresas/list.ts`

```ts
import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { pageQuery } from "@/lib/admin/page-query";
import { bandLabel } from "./band-label";

export async function listEmpresas(rawPage: string | undefined) {
  const page = pageQuery(rawPage);
  const db = await adminDb();
  if (!db) return { page: page.page, rows: [] as Record<string, string>[] };
  const result = await db
    .from("companies")
    .select("id, legal_name, employee_band, sector_id, sectors(name)")
    .order("legal_name")
    .range(page.from, page.to);
  if (result.error) throw new Error(result.error.message);
  return {
    page: page.page,
    rows: (result.data ?? []).map((row) => {
      const sector = row.sectors as { name?: string } | { name?: string }[] | null;
      const name = Array.isArray(sector) ? sector[0]?.name : sector?.name;
      return {
        id: row.id,
        legal_name: row.legal_name,
        employee_band: bandLabel(row.employee_band),
        sector_id: name ?? row.sector_id,
      };
    }),
  };
}
```

`src/app/api/admin/empresas/route.ts`

```ts
import { listEmpresas } from "@/lib/admin/empresas/list";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  await requireSuperadmin();
  return Response.json(await listEmpresas(request.nextUrl.searchParams.get("page") ?? undefined));
}
```

`src/app/admin/empresas/page.tsx`

```tsx
import { DataList } from "@/components/admin/data-list";
import { listEmpresas } from "@/lib/admin/empresas/list";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

export default async function EmpresasPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requireSuperadmin();
  const params = await searchParams;
  const data = await listEmpresas(params.page);
  return (
    <DataList
      title="Empresas"
      lead="La empresa del empresario y su perfil."
      columns={[
        { key: "legal_name", label: "Razón social" },
        { key: "employee_band", label: "Tamaño" },
        { key: "sector_id", label: "Sector" },
      ]}
      rows={data.rows}
      page={data.page}
      basePath="/admin/empresas"
    />
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/admin/empresas/list.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/admin/empresas/band-label.ts src/lib/admin/empresas/list.ts src/lib/admin/empresas/list.test.ts src/app/api/admin/empresas/route.ts src/app/admin/empresas/page.tsx
git commit -m "$(cat <<'EOF'
feat: lista de empresas del panel

EOF
)"
```

---

### Task 7: Detalle de empresas

**Files:**
- Create: `src/lib/admin/empresas/tabs.ts`
- Create: `src/lib/admin/empresas/detail.ts`
- Create: `src/lib/admin/empresas/detail.test.ts`
- Create: `src/app/api/admin/empresas/[id]/route.ts`
- Create: `src/app/admin/empresas/[id]/page.tsx`

Tabs: `sector`, `tamano`, `respuestas`, `pase`. Las respuestas y el pase salen del `profile_id` de la empresa. Esta pantalla no escribe y no borra.

- [ ] **Step 1: Write the failing test**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { tabQuery } from "@/lib/admin/tab-query";
import { companyTabs } from "./tabs";

describe("detalle de empresas", () => {
  it("abre en sector y conserva tamaño, respuestas y pase", () => {
    const values = companyTabs.map((tab) => tab.value);
    expect(values).toEqual(["sector", "tamano", "respuestas", "pase"]);
    expect(tabQuery(undefined, values, "sector")).toBe("sector");
    expect(tabQuery("pase", values, "sector")).toBe("pase");
    expect(tabQuery("borrar", values, "sector")).toBe("sector");
  });

  it("el detalle lee sector, banda, respuestas y pase", () => {
    const source = readFileSync("src/lib/admin/empresas/detail.ts", "utf8");
    const route = readFileSync("src/app/api/admin/empresas/[id]/route.ts", "utf8");
    expect(source).toContain('.from("companies")');
    expect(source).toContain("employee_band");
    expect(source).toContain('.from("sectors")');
    expect(source).toContain('.from("response_choices")');
    expect(source).toContain('.from("passes")');
    expect(route).toContain("await requireSuperadmin()");
    expect(route).not.toMatch(/export async function DELETE/);
    expect(route).not.toMatch(/export async function POST/);
    expect(route).not.toMatch(/export async function PATCH/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/admin/empresas/detail.test.ts`

Expected: FAIL. No existe `./tabs`.

- [ ] **Step 3: Write minimal implementation**

`src/lib/admin/empresas/tabs.ts`

```ts
export const companyTabs = [
  { value: "sector", label: "Sector" },
  { value: "tamano", label: "Tamaño" },
  { value: "respuestas", label: "Respuestas" },
  { value: "pase", label: "Pase" },
] as const;
```

`src/lib/admin/empresas/detail.ts`

```ts
import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { bandLabel } from "./band-label";

export async function loadEmpresa(id: string) {
  const db = await adminDb();
  if (!db) return null;
  const company = await db
    .from("companies")
    .select("id, legal_name, employee_band, sector_id, sector_source, profile_id, referral_source")
    .eq("id", id)
    .maybeSingle();
  if (company.error) throw new Error(company.error.message);
  if (!company.data) return null;
  const [sector, answers, pass] = await Promise.all([
    db.from("sectors").select("name, slug").eq("id", company.data.sector_id).maybeSingle(),
    db.from("response_choices").select("question_id, option_value, rank").eq("profile_id", company.data.profile_id),
    db.from("passes").select("issued_at, image_asset_id").eq("profile_id", company.data.profile_id).maybeSingle(),
  ]);
  for (const result of [sector, answers, pass]) {
    if (result.error) throw new Error(result.error.message);
  }
  return {
    company: { ...company.data, employee_label: bandLabel(company.data.employee_band) },
    sector: sector.data,
    answers: answers.data ?? [],
    pass: pass.data,
  };
}
```

`src/app/api/admin/empresas/[id]/route.ts`

```ts
import { loadEmpresa } from "@/lib/admin/empresas/detail";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import type { NextRequest } from "next/server";

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  await requireSuperadmin();
  const { id } = await context.params;
  const row = await loadEmpresa(id);
  if (!row) return Response.json({ error: "no encontrada" }, { status: 404 });
  return Response.json(row);
}
```

`src/app/admin/empresas/[id]/page.tsx`

```tsx
import { notFound } from "next/navigation";
import { DetailFrame } from "@/components/admin/detail-frame";
import { tabQuery } from "@/lib/admin/tab-query";
import { loadEmpresa } from "@/lib/admin/empresas/detail";
import { companyTabs } from "@/lib/admin/empresas/tabs";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

export default async function EmpresaDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  await requireSuperadmin();
  const { id } = await params;
  const query = await searchParams;
  const data = await loadEmpresa(id);
  if (!data) notFound();
  const active = tabQuery(query.tab, companyTabs.map((tab) => tab.value), "sector");
  return (
    <DetailFrame
      title={data.company.legal_name}
      backHref="/admin/empresas"
      facts={[
        { label: "Sector", value: data.sector?.name ?? "" },
        { label: "Tamaño", value: data.company.employee_label },
        { label: "Cómo llegó el sector", value: data.company.sector_source },
        { label: "Referencia", value: data.company.referral_source },
      ]}
      tabs={[...companyTabs]}
      active={active}
    >
      {active === "sector" ? <p>{data.sector?.slug}</p> : null}
      {active === "tamano" ? <p>{data.company.employee_band}</p> : null}
      {active === "respuestas" ? (
        <ul>
          {data.answers.map((row) => (
            <li key={`${row.question_id}-${row.option_value}`}>{row.question_id}: {row.option_value}</li>
          ))}
        </ul>
      ) : null}
      {active === "pase" ? <p>{data.pass ? "Pase emitido." : "Sin pase."}</p> : null}
    </DetailFrame>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/admin/empresas/detail.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/admin/empresas/tabs.ts src/lib/admin/empresas/detail.ts src/lib/admin/empresas/detail.test.ts src/app/api/admin/empresas/[id]/route.ts src/app/admin/empresas/[id]/page.tsx
git commit -m "$(cat <<'EOF'
feat: detalle de empresa con sector, tamaño, respuestas y pase

EOF
)"
```

---

### Task 8: Lista de CRM

**Files:**
- Create: `src/lib/admin/crm/attach-status.ts`
- Create: `src/lib/admin/crm/list.ts`
- Create: `src/lib/admin/crm/list.test.ts`
- Create: `src/app/api/admin/crm/route.ts`
- Create: `src/app/admin/crm/page.tsx`

Href: `/admin/crm`. La lista lee `crm_contacts` (nombre, empresa, email, source) y pega el estatus desde `crm_contact_status`. El contacto no tiene columna de estatus.

- [ ] **Step 1: Write the failing test**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { attachStatus } from "./attach-status";

describe("lista de CRM", () => {
  it("el estatus sale del último hecho, no del contacto", () => {
    const rows = attachStatus(
      [{ id: "c1", email: "ana@norte.mx" }, { id: "c2", email: "sin@hecho.mx" }],
      [{ contact_id: "c1", status: "cargado" }],
    );
    expect(rows).toEqual([
      { id: "c1", email: "ana@norte.mx", status: "cargado" },
      { id: "c2", email: "sin@hecho.mx", status: "" },
    ]);
    expect(rows[0]).not.toHaveProperty("deleted");
  });

  it("la lista no escribe status en crm_contacts", () => {
    const list = readFileSync("src/lib/admin/crm/list.ts", "utf8");
    const route = readFileSync("src/app/api/admin/crm/route.ts", "utf8");
    expect(list).toContain('.from("crm_contacts")');
    expect(list).toContain('.from("crm_contact_status")');
    expect(list).toContain("nombre");
    expect(list).toContain("empresa");
    expect(list).toContain("email");
    expect(list).toContain("source");
    expect(list).not.toContain(".update(");
    expect(route).toContain("await requireSuperadmin()");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/admin/crm/list.test.ts`

Expected: FAIL. No existe `./attach-status`.

- [ ] **Step 3: Write minimal implementation**

`src/lib/admin/crm/attach-status.ts`

```ts
export function attachStatus(
  contacts: { id: string; email: string }[],
  events: { contact_id: string; status: string }[],
) {
  const byContact = new Map(events.map((event) => [event.contact_id, event.status]));
  return contacts.map((contact) => ({
    id: contact.id,
    email: contact.email,
    status: byContact.get(contact.id) ?? "",
  }));
}
```

`src/lib/admin/crm/list.ts`

```ts
import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { pageQuery } from "@/lib/admin/page-query";
import { crmLabel } from "@/lib/crm-label";

export async function listCrm(rawPage: string | undefined) {
  const page = pageQuery(rawPage);
  const db = await adminDb();
  if (!db) return { page: page.page, rows: [] as Record<string, string>[] };
  const contacts = await db
    .from("crm_contacts")
    .select("id, nombre, empresa, email, source, organization_id")
    .order("created_at", { ascending: false })
    .range(page.from, page.to);
  if (contacts.error) throw new Error(contacts.error.message);
  const ids = (contacts.data ?? []).map((row) => row.id);
  const status = ids.length
    ? await db.from("crm_contact_status").select("contact_id, status").in("contact_id", ids)
    : { data: [], error: null };
  if (status.error) throw new Error(status.error.message);
  const byContact = new Map((status.data ?? []).map((row) => [row.contact_id, row.status ?? ""]));
  return {
    page: page.page,
    rows: (contacts.data ?? []).map((row) => ({
      id: row.id,
      nombre: row.nombre,
      empresa: row.empresa,
      email: row.email,
      source: row.source,
      status: crmLabel(byContact.get(row.id) ?? ""),
    })),
  };
}
```

`src/app/api/admin/crm/route.ts`

```ts
import { listCrm } from "@/lib/admin/crm/list";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  await requireSuperadmin();
  return Response.json(await listCrm(request.nextUrl.searchParams.get("page") ?? undefined));
}
```

`src/app/admin/crm/page.tsx`

```tsx
import { DataList } from "@/components/admin/data-list";
import { listCrm } from "@/lib/admin/crm/list";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

export default async function CrmPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requireSuperadmin();
  const params = await searchParams;
  const data = await listCrm(params.page);
  return (
    <DataList
      title="CRM"
      lead="Contactos de todos los organismos. El estatus sale de los hechos."
      columns={[
        { key: "nombre", label: "Nombre" },
        { key: "empresa", label: "Empresa" },
        { key: "email", label: "Correo" },
        { key: "source", label: "Origen" },
        { key: "status", label: "Estatus" },
      ]}
      rows={data.rows}
      page={data.page}
      basePath="/admin/crm"
    />
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/admin/crm/list.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/admin/crm/attach-status.ts src/lib/admin/crm/list.ts src/lib/admin/crm/list.test.ts src/app/api/admin/crm/route.ts src/app/admin/crm/page.tsx
git commit -m "$(cat <<'EOF'
feat: lista de CRM con estatus del último hecho

EOF
)"
```

---

### Task 9: Detalle de CRM

**Files:**
- Create: `src/lib/admin/crm/next-event.ts`
- Create: `src/lib/admin/crm/detail.ts`
- Create: `src/lib/admin/crm/detail.test.ts`
- Create: `src/app/api/admin/crm/[id]/route.ts`
- Create: `src/app/api/admin/crm/[id]/evento/route.ts`
- Create: `src/app/admin/crm/[id]/page.tsx`

Hechos que el panel puede escribir: `contactar`, `rechazar`, `confirmar`, `registrar`, `llegar`. Se insertan en `crm_events`. No se hace `update` de un status en `crm_contacts`.

- [ ] **Step 1: Write the failing test**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { nextCrmInsert } from "./next-event";

describe("detalle de CRM", () => {
  it("contactar, rechazar, confirmar, registrar y llegar insertan un hecho", () => {
    expect(nextCrmInsert("cargado", "contactar")).toEqual({ ok: true, event: "contactar" });
    expect(nextCrmInsert("cargado", "rechazar")).toEqual({ ok: true, event: "rechazar" });
    expect(nextCrmInsert("contactado", "confirmar")).toEqual({ ok: true, event: "confirmar" });
    expect(nextCrmInsert("confirmo", "registrar")).toEqual({ ok: true, event: "registrar" });
    expect(nextCrmInsert("registrado", "llegar")).toEqual({ ok: true, event: "llegar" });
    expect(nextCrmInsert("cargado", "llegar")).toEqual({ ok: false, reason: "transición inválida" });
    expect(nextCrmInsert("llego", "rechazar").ok).toBe(false);
    const allowed = nextCrmInsert("cargado", "contactar");
    expect(allowed).not.toHaveProperty("status");
  });

  it("el handler inserta crm_events y no actualiza el contacto", () => {
    const source = readFileSync("src/app/api/admin/crm/[id]/evento/route.ts", "utf8");
    expect(source).toContain("await requireSuperadmin()");
    expect(source).toContain('.from("crm_events")');
    expect(source).toContain(".insert(");
    expect(source).not.toContain('.from("crm_contacts").update');
    expect(source).not.toMatch(/export async function DELETE/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/admin/crm/detail.test.ts`

Expected: FAIL. No existe `./next-event`.

- [ ] **Step 3: Write minimal implementation**

`src/lib/admin/crm/next-event.ts`

```ts
import { applyCrmEvent, type CrmEvent, type CrmStatus } from "@/lib/crm-status";

const panelEvents = ["contactar", "rechazar", "confirmar", "registrar", "llegar"] as const;
type PanelEvent = (typeof panelEvents)[number];

export function nextCrmInsert(status: CrmStatus | null, event: string) {
  if (!panelEvents.includes(event as PanelEvent)) {
    return { ok: false as const, reason: "hecho inválido" };
  }
  const next = applyCrmEvent(status, event as CrmEvent);
  if (!next.ok) return { ok: false as const, reason: next.reason };
  return { ok: true as const, event: event as PanelEvent };
}
```

`src/lib/admin/crm/detail.ts`

```ts
import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { crmLabel } from "@/lib/crm-label";

export async function loadCrm(id: string) {
  const db = await adminDb();
  if (!db) return null;
  const contact = await db
    .from("crm_contacts")
    .select("id, nombre, empresa, email, source, organization_id, sector_id, profile_id")
    .eq("id", id)
    .maybeSingle();
  if (contact.error) throw new Error(contact.error.message);
  if (!contact.data) return null;
  const [events, status] = await Promise.all([
    db.from("crm_events").select("id, event, occurred_at, actor_id").eq("contact_id", id).order("occurred_at", { ascending: false }),
    db.from("crm_contact_status").select("status").eq("contact_id", id).maybeSingle(),
  ]);
  if (events.error) throw new Error(events.error.message);
  if (status.error) throw new Error(status.error.message);
  return {
    contact: contact.data,
    status: crmLabel(status.data?.status ?? ""),
    statusCode: (status.data?.status ?? null) as string | null,
    events: events.data ?? [],
  };
}
```

`src/app/api/admin/crm/[id]/route.ts`

```ts
import { loadCrm } from "@/lib/admin/crm/detail";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import type { NextRequest } from "next/server";

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  await requireSuperadmin();
  const { id } = await context.params;
  const row = await loadCrm(id);
  if (!row) return Response.json({ error: "no encontrado" }, { status: 404 });
  return Response.json(row);
}
```

`src/app/api/admin/crm/[id]/evento/route.ts`

```ts
import { adminDb } from "@/lib/admin/admin-db";
import { loadCrm } from "@/lib/admin/crm/detail";
import { nextCrmInsert } from "@/lib/admin/crm/next-event";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import { readSuperadmin } from "@/lib/auth/require-superadmin";
import type { CrmStatus } from "@/lib/crm-status";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  await requireSuperadmin();
  const account = await readSuperadmin();
  const { id } = await context.params;
  const form = await request.formData();
  const current = await loadCrm(id);
  const back = `/admin/crm/${id}?tab=hechos`;
  if (!current) return NextResponse.redirect(new URL(`${back}&error=no%20encontrado`, request.url));
  const next = nextCrmInsert((current.statusCode as CrmStatus | null) ?? null, String(form.get("event") ?? ""));
  if (!next.ok) return NextResponse.redirect(new URL(`${back}&error=${encodeURIComponent(next.reason)}`, request.url));
  const db = await adminDb();
  if (!db || !account) return NextResponse.redirect(new URL(`${back}&error=sin%20sesi%C3%B3n`, request.url));
  const actor = await db.from("profiles").select("id").eq("email", account.email).maybeSingle();
  const inserted = await db.from("crm_events").insert({
    contact_id: id,
    event: next.event,
    actor_id: actor.data?.id ?? null,
  });
  if (inserted.error) return NextResponse.redirect(new URL(`${back}&error=${encodeURIComponent(inserted.error.message)}`, request.url));
  return NextResponse.redirect(new URL(back, request.url));
}
```

`src/app/admin/crm/[id]/page.tsx`

```tsx
import { notFound } from "next/navigation";
import { DetailFrame } from "@/components/admin/detail-frame";
import { tabQuery } from "@/lib/admin/tab-query";
import { loadCrm } from "@/lib/admin/crm/detail";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

const tabs = [
  { value: "ficha", label: "Ficha" },
  { value: "hechos", label: "Hechos" },
];
const actions = ["contactar", "rechazar", "confirmar", "registrar", "llegar"];

export default async function CrmDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; error?: string }>;
}) {
  await requireSuperadmin();
  const { id } = await params;
  const query = await searchParams;
  const data = await loadCrm(id);
  if (!data) notFound();
  const active = tabQuery(query.tab, tabs.map((tab) => tab.value), "ficha");
  return (
    <DetailFrame
      title={data.contact.nombre}
      backHref="/admin/crm"
      facts={[
        { label: "Empresa", value: data.contact.empresa },
        { label: "Correo", value: data.contact.email },
        { label: "Origen", value: data.contact.source },
        { label: "Estatus", value: data.status },
      ]}
      tabs={tabs}
      active={active}
    >
      {query.error ? <p className="text-small text-mark">{query.error}</p> : null}
      {active === "ficha" ? <p>El estatus no se guarda en el contacto.</p> : null}
      {active === "hechos" ? (
        <div className="grid gap-4">
          <ul>
            {data.events.map((row) => (
              <li key={row.id}>{row.event}</li>
            ))}
          </ul>
          {actions.map((event) => (
            <form key={event} action={`/api/admin/crm/${id}/evento`} method="post">
              <input type="hidden" name="event" value={event} />
              <button className="btn" type="submit">{event}</button>
            </form>
          ))}
        </div>
      ) : null}
    </DetailFrame>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/admin/crm/detail.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/admin/crm/next-event.ts src/lib/admin/crm/detail.ts src/lib/admin/crm/detail.test.ts src/app/api/admin/crm/[id]/route.ts src/app/api/admin/crm/[id]/evento/route.ts src/app/admin/crm/[id]/page.tsx
git commit -m "$(cat <<'EOF'
feat: hechos de CRM sin guardar el estatus en el contacto

EOF
)"
```

---

### Task 10: Lista de invitaciones

**Files:**
- Create: `src/lib/admin/invitaciones/sheet.ts`
- Create: `src/lib/admin/invitaciones/list.ts`
- Create: `src/lib/admin/invitaciones/save-sheet.ts`
- Create: `src/lib/admin/invitaciones/list.test.ts`
- Create: `src/app/api/admin/invitaciones/route.ts`
- Create: `src/app/admin/invitaciones/upload-form.tsx`
- Create: `src/app/admin/invitaciones/page.tsx`

Href: `/admin/invitaciones`. Filas de `crm_contacts` con `source` `excel` o `manual`. El CSV es el de `parseInviteSheet` (`nombre,empresa,correo`). No se agrega un parser xlsx. Cada fila nueva lleva el hecho `cargar`. Si el organismo ya tiene ese correo, se actualiza la fila y no se inserta otro `cargar` (el trigger lo rechazaría).

- [ ] **Step 1: Write the failing test**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { inviteSave, invitesFromSheet } from "./sheet";

describe("lista de invitaciones", () => {
  it("el excel entra como source excel y el hecho cargar", () => {
    const parsed = invitesFromSheet(
      [
        ["nombre", "empresa", "correo"],
        ["Ana", "Norte", "ana@norte.mx"],
      ],
      "org-1",
    );
    expect(parsed.errors).toEqual([]);
    expect(parsed.contacts).toEqual([
      {
        organization_id: "org-1",
        nombre: "Ana",
        empresa: "Norte",
        email: "ana@norte.mx",
        source: "excel",
        event: "cargar",
      },
    ]);
    expect(invitesFromSheet([["mal"]], "org-1").contacts).toEqual([]);
    expect(inviteSave(false)).toBe("insert");
    expect(inviteSave(true)).toBe("update");
  });

  it("la lista filtra excel y manual", () => {
    const list = readFileSync("src/lib/admin/invitaciones/list.ts", "utf8");
    const route = readFileSync("src/app/api/admin/invitaciones/route.ts", "utf8");
    expect(list).toContain('.from("crm_contacts")');
    expect(list).toContain('"excel"');
    expect(list).toContain('"manual"');
    expect(list).toContain(".range(page.from, page.to)");
    expect(route).toContain("await requireSuperadmin()");
    expect(route).not.toMatch(/export async function DELETE/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/admin/invitaciones/list.test.ts`

Expected: FAIL. No existe `./sheet`.

- [ ] **Step 3: Write minimal implementation**

`src/lib/admin/invitaciones/sheet.ts`

```ts
import { parseInviteSheet } from "@/lib/invite-sheet";

export function csvRows(text: string) {
  return text
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
    .map((line) => line.split(",").map((cell) => cell.trim()));
}

export function invitesFromSheet(rows: string[][], organizationId: string) {
  const parsed = parseInviteSheet(rows);
  return {
    errors: parsed.errors,
    contacts: parsed.ok.map((row) => ({
      organization_id: organizationId,
      nombre: row.nombre,
      empresa: row.empresa,
      email: row.correo,
      source: "excel" as const,
      event: "cargar" as const,
    })),
  };
}

export function inviteSave(hasContact: boolean) {
  return hasContact ? "update" : "insert";
}
```

`src/lib/admin/invitaciones/list.ts`

```ts
import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { pageQuery } from "@/lib/admin/page-query";

export async function listInvitaciones(rawPage: string | undefined) {
  const page = pageQuery(rawPage);
  const db = await adminDb();
  if (!db) return { page: page.page, rows: [] as Record<string, string>[], orgs: [] as { id: string; name: string }[] };
  const contacts = await db
    .from("crm_contacts")
    .select("id, nombre, empresa, email, source, organization_id")
    .in("source", ["excel", "manual"])
    .order("created_at", { ascending: false })
    .range(page.from, page.to);
  if (contacts.error) throw new Error(contacts.error.message);
  const orgs = await db.from("organizations").select("id, name").order("name");
  if (orgs.error) throw new Error(orgs.error.message);
  return {
    page: page.page,
    rows: (contacts.data ?? []).map((row) => ({
      id: row.id,
      nombre: row.nombre,
      empresa: row.empresa,
      email: row.email,
      source: row.source,
    })),
    orgs: (orgs.data ?? []).map((org) => ({ id: org.id, name: org.name ?? org.id })),
  };
}
```

`src/lib/admin/invitaciones/save-sheet.ts`

```ts
import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { readSuperadmin } from "@/lib/auth/require-superadmin";
import { csvRows, inviteSave, invitesFromSheet } from "./sheet";

export async function saveInviteSheet(form: FormData) {
  const organizationId = String(form.get("organization_id") ?? "");
  const file = form.get("archivo");
  if (!organizationId || !(file instanceof File)) return { ok: false as const, reason: "faltan organismo o archivo" };
  const parsed = invitesFromSheet(csvRows(await file.text()), organizationId);
  if (parsed.errors.length) return { ok: false as const, reason: parsed.errors[0]?.reason ?? "archivo inválido" };
  const db = await adminDb();
  const account = await readSuperadmin();
  if (!db || !account) return { ok: false as const, reason: "sin sesión" };
  const actor = await db.from("profiles").select("id").eq("email", account.email).maybeSingle();
  for (const contact of parsed.contacts) {
    const existing = await db.from("crm_contacts").select("id").eq("organization_id", organizationId).eq("email", contact.email).maybeSingle();
    if (existing.error) return { ok: false as const, reason: existing.error.message };
    if (inviteSave(Boolean(existing.data)) === "update" && existing.data) {
      const updated = await db.from("crm_contacts").update({ nombre: contact.nombre, empresa: contact.empresa }).eq("id", existing.data.id);
      if (updated.error) return { ok: false as const, reason: updated.error.message };
      continue;
    }
    const inserted = await db.from("crm_contacts").insert({
      organization_id: organizationId,
      nombre: contact.nombre,
      empresa: contact.empresa,
      email: contact.email,
      source: contact.source,
    }).select("id").single();
    if (inserted.error) return { ok: false as const, reason: inserted.error.message };
    const event = await db.from("crm_events").insert({ contact_id: inserted.data.id, event: contact.event, actor_id: actor.data?.id ?? null });
    if (event.error) return { ok: false as const, reason: event.error.message };
  }
  return { ok: true as const };
}
```

Si `save-sheet.ts` pasa de 90 líneas, mueve el ciclo a `src/lib/admin/invitaciones/write-contact.ts`.

`src/app/api/admin/invitaciones/route.ts`

```ts
import { listInvitaciones } from "@/lib/admin/invitaciones/list";
import { saveInviteSheet } from "@/lib/admin/invitaciones/save-sheet";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  await requireSuperadmin();
  return Response.json(await listInvitaciones(request.nextUrl.searchParams.get("page") ?? undefined));
}

export async function POST(request: NextRequest) {
  await requireSuperadmin();
  const result = await saveInviteSheet(await request.formData());
  const path = result.ok ? "/admin/invitaciones" : `/admin/invitaciones?error=${encodeURIComponent(result.reason)}`;
  return NextResponse.redirect(new URL(path, request.url));
}
```

`src/app/admin/invitaciones/upload-form.tsx`

```tsx
export function UploadForm({ orgs }: { orgs: { id: string; name: string }[] }) {
  return (
    <form action="/api/admin/invitaciones" method="post" encType="multipart/form-data" className="mt-8 grid max-w-xl gap-3">
      <label className="grid gap-1 text-small" htmlFor="organization_id">
        Organismo
        <select id="organization_id" name="organization_id" className="rounded-lg border border-line px-3 py-2">
          {orgs.map((org) => (
            <option key={org.id} value={org.id}>{org.name}</option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-small" htmlFor="archivo">
        Archivo de invitaciones
        <input id="archivo" name="archivo" type="file" accept=".csv,text/csv" />
      </label>
      <button className="btn btn-primary" type="submit">Subir plantilla</button>
    </form>
  );
}
```

`src/app/admin/invitaciones/page.tsx`

```tsx
import { UploadForm } from "@/app/admin/invitaciones/upload-form";
import { DataList } from "@/components/admin/data-list";
import { listInvitaciones } from "@/lib/admin/invitaciones/list";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

export default async function InvitacionesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; error?: string }>;
}) {
  await requireSuperadmin();
  const params = await searchParams;
  const data = await listInvitaciones(params.page);
  return (
    <DataList
      title="Invitaciones"
      lead="Carga de Excel y alta a mano."
      columns={[
        { key: "nombre", label: "Nombre" },
        { key: "empresa", label: "Empresa" },
        { key: "email", label: "Correo" },
        { key: "source", label: "Origen" },
      ]}
      rows={data.rows}
      page={data.page}
      basePath="/admin/invitaciones"
      error={params.error}
    >
      <UploadForm orgs={data.orgs} />
    </DataList>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/admin/invitaciones/list.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/admin/invitaciones/sheet.ts src/lib/admin/invitaciones/list.ts src/lib/admin/invitaciones/save-sheet.ts src/lib/admin/invitaciones/list.test.ts src/app/api/admin/invitaciones/route.ts src/app/admin/invitaciones/upload-form.tsx src/app/admin/invitaciones/page.tsx
git commit -m "$(cat <<'EOF'
feat: carga de invitaciones desde la plantilla

EOF
)"
```

---

### Task 11: Detalle de invitaciones

**Files:**
- Create: `src/lib/admin/invitaciones/manual.ts`
- Create: `src/lib/admin/invitaciones/detail.ts`
- Create: `src/lib/admin/invitaciones/detail.test.ts`
- Create: `src/app/api/admin/invitaciones/manual/route.ts`
- Create: `src/app/api/admin/invitaciones/[id]/route.ts`
- Create: `src/app/admin/invitaciones/[id]/page.tsx`

El alta a mano usa `source: "manual"` y el hecho `cargar`. Confirmar inserta `crm_events.event = confirmar` solo si `nextCrmInsert` lo permite. No se guarda status en el contacto.

- [ ] **Step 1: Write the failing test**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { manualInvite } from "./manual";

describe("detalle de invitaciones", () => {
  it("el alta a mano queda en source manual y cargar", () => {
    expect(manualInvite({ nombre: "Luis", empresa: "Sur", correo: "luis@sur.mx", organizationId: "org-1" })).toEqual({
      ok: true,
      contact: {
        organization_id: "org-1",
        nombre: "Luis",
        empresa: "Sur",
        email: "luis@sur.mx",
        source: "manual",
        event: "cargar",
      },
    });
    expect(manualInvite({ nombre: "", empresa: "Sur", correo: "luis@sur.mx", organizationId: "org-1" }).ok).toBe(false);
  });

  it("confirmar escribe el hecho y no una columna status", () => {
    const source = readFileSync("src/app/api/admin/invitaciones/[id]/route.ts", "utf8");
    expect(source).toContain("await requireSuperadmin()");
    expect(source).toContain("confirmar");
    expect(source).toContain('.from("crm_events")');
    expect(source).not.toContain("status:");
    expect(source).not.toMatch(/export async function DELETE/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/admin/invitaciones/detail.test.ts`

Expected: FAIL. No existe `./manual`.

- [ ] **Step 3: Write minimal implementation**

`src/lib/admin/invitaciones/manual.ts`

```ts
import { parseInviteSheet } from "@/lib/invite-sheet";

export function manualInvite(input: { nombre: string; empresa: string; correo: string; organizationId: string }) {
  const parsed = parseInviteSheet([
    ["nombre", "empresa", "correo"],
    [input.nombre, input.empresa, input.correo],
  ]);
  const row = parsed.ok[0];
  if (!input.organizationId || !row || parsed.errors.length) {
    return { ok: false as const, reason: parsed.errors[0]?.reason ?? "fila inválida" };
  }
  return {
    ok: true as const,
    contact: {
      organization_id: input.organizationId,
      nombre: row.nombre,
      empresa: row.empresa,
      email: row.correo,
      source: "manual" as const,
      event: "cargar" as const,
    },
  };
}
```

`src/lib/admin/invitaciones/detail.ts`

```ts
import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { crmLabel } from "@/lib/crm-label";

export async function loadInvitacion(id: string) {
  const db = await adminDb();
  if (!db) return null;
  const contact = await db
    .from("crm_contacts")
    .select("id, nombre, empresa, email, source, organization_id")
    .eq("id", id)
    .in("source", ["excel", "manual"])
    .maybeSingle();
  if (contact.error) throw new Error(contact.error.message);
  if (!contact.data) return null;
  const status = await db.from("crm_contact_status").select("status").eq("contact_id", id).maybeSingle();
  if (status.error) throw new Error(status.error.message);
  return { contact: contact.data, statusCode: status.data?.status ?? null, status: crmLabel(status.data?.status ?? "") };
}
```

`src/app/api/admin/invitaciones/manual/route.ts`

```ts
import { adminDb } from "@/lib/admin/admin-db";
import { manualInvite } from "@/lib/admin/invitaciones/manual";
import { inviteSave } from "@/lib/admin/invitaciones/sheet";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import { readSuperadmin } from "@/lib/auth/require-superadmin";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  await requireSuperadmin();
  const account = await readSuperadmin();
  const form = await request.formData();
  const draft = manualInvite({
    nombre: String(form.get("nombre") ?? ""),
    empresa: String(form.get("empresa") ?? ""),
    correo: String(form.get("correo") ?? ""),
    organizationId: String(form.get("organization_id") ?? ""),
  });
  if (!draft.ok) return NextResponse.redirect(new URL(`/admin/invitaciones?error=${encodeURIComponent(draft.reason)}`, request.url));
  const db = await adminDb();
  if (!db || !account) return NextResponse.redirect(new URL("/admin/invitaciones?error=sin%20sesi%C3%B3n", request.url));
  const existing = await db.from("crm_contacts").select("id").eq("organization_id", draft.contact.organization_id).eq("email", draft.contact.email).maybeSingle();
  if (inviteSave(Boolean(existing.data)) === "update" && existing.data) {
    await db.from("crm_contacts").update({ nombre: draft.contact.nombre, empresa: draft.contact.empresa }).eq("id", existing.data.id);
    return NextResponse.redirect(new URL(`/admin/invitaciones/${existing.data.id}`, request.url));
  }
  const inserted = await db.from("crm_contacts").insert({
    organization_id: draft.contact.organization_id,
    nombre: draft.contact.nombre,
    empresa: draft.contact.empresa,
    email: draft.contact.email,
    source: draft.contact.source,
  }).select("id").single();
  if (inserted.error || !inserted.data) {
    return NextResponse.redirect(new URL(`/admin/invitaciones?error=${encodeURIComponent(inserted.error?.message ?? "no se guardó")}`, request.url));
  }
  const actor = await db.from("profiles").select("id").eq("email", account.email).maybeSingle();
  await db.from("crm_events").insert({ contact_id: inserted.data.id, event: "cargar", actor_id: actor.data?.id ?? null });
  return NextResponse.redirect(new URL(`/admin/invitaciones/${inserted.data.id}`, request.url));
}
```

`src/app/api/admin/invitaciones/[id]/route.ts`

```ts
import { adminDb } from "@/lib/admin/admin-db";
import { loadInvitacion } from "@/lib/admin/invitaciones/detail";
import { nextCrmInsert } from "@/lib/admin/crm/next-event";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import { readSuperadmin } from "@/lib/auth/require-superadmin";
import type { CrmStatus } from "@/lib/crm-status";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  await requireSuperadmin();
  const { id } = await context.params;
  const row = await loadInvitacion(id);
  if (!row) return Response.json({ error: "no encontrada" }, { status: 404 });
  return Response.json(row);
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  await requireSuperadmin();
  const account = await readSuperadmin();
  const { id } = await context.params;
  const current = await loadInvitacion(id);
  const back = `/admin/invitaciones/${id}`;
  if (!current) return NextResponse.redirect(new URL(`${back}?error=no%20encontrada`, request.url));
  const next = nextCrmInsert((current.statusCode as CrmStatus | null) ?? null, "confirmar");
  if (!next.ok) return NextResponse.redirect(new URL(`${back}?error=${encodeURIComponent(next.reason)}`, request.url));
  const db = await adminDb();
  if (!db || !account) return NextResponse.redirect(new URL(`${back}?error=sin%20sesi%C3%B3n`, request.url));
  const actor = await db.from("profiles").select("id").eq("email", account.email).maybeSingle();
  const inserted = await db.from("crm_events").insert({ contact_id: id, event: "confirmar", actor_id: actor.data?.id ?? null });
  if (inserted.error) return NextResponse.redirect(new URL(`${back}?error=${encodeURIComponent(inserted.error.message)}`, request.url));
  return NextResponse.redirect(new URL(back, request.url));
}
```

`src/app/admin/invitaciones/[id]/page.tsx`

```tsx
import { notFound } from "next/navigation";
import { DetailFrame } from "@/components/admin/detail-frame";
import { tabQuery } from "@/lib/admin/tab-query";
import { loadInvitacion } from "@/lib/admin/invitaciones/detail";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

const tabs = [{ value: "ficha", label: "Ficha" }];

export default async function InvitacionDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; tab?: string }>;
}) {
  await requireSuperadmin();
  const { id } = await params;
  const query = await searchParams;
  const data = await loadInvitacion(id);
  if (!data) notFound();
  const active = tabQuery(query.tab, ["ficha"], "ficha");
  return (
    <DetailFrame
      title={data.contact.nombre}
      backHref="/admin/invitaciones"
      facts={[
        { label: "Empresa", value: data.contact.empresa },
        { label: "Correo", value: data.contact.email },
        { label: "Origen", value: data.contact.source },
        { label: "Estatus", value: data.status },
      ]}
      tabs={tabs}
      active={active}
    >
      {query.error ? <p className="text-small text-mark">{query.error}</p> : null}
      <form action="/api/admin/invitaciones/manual" method="post" className="grid max-w-md gap-3">
        <input name="organization_id" type="hidden" value={data.contact.organization_id} />
        <label className="grid gap-1 text-small" htmlFor="nombre">Nombre<input id="nombre" name="nombre" /></label>
        <label className="grid gap-1 text-small" htmlFor="empresa">Empresa<input id="empresa" name="empresa" /></label>
        <label className="grid gap-1 text-small" htmlFor="correo">Correo del invitado<input id="correo" name="correo" type="email" /></label>
        <button className="btn" type="submit">Crear invitación</button>
      </form>
      <form action={`/api/admin/invitaciones/${id}`} method="post" className="mt-4">
        <button className="btn btn-primary" type="submit">Confirmar</button>
      </form>
    </DetailFrame>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/admin/invitaciones/detail.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/admin/invitaciones/manual.ts src/lib/admin/invitaciones/detail.ts src/lib/admin/invitaciones/detail.test.ts src/app/api/admin/invitaciones/manual/route.ts src/app/api/admin/invitaciones/[id]/route.ts src/app/admin/invitaciones/[id]/page.tsx
git commit -m "$(cat <<'EOF'
feat: alta manual de invitación y confirmar

EOF
)"
```

---

### Task 12: Lista de pases y llegadas

**Files:**
- Create: `src/lib/admin/pases/arrival.ts`
- Create: `src/lib/admin/pases/list.ts`
- Create: `src/lib/admin/pases/list.test.ts`
- Create: `src/app/api/admin/pases/route.ts`
- Create: `src/app/admin/pases/page.tsx`

Href: `/admin/pases`. El id de la fila es `passes.profile_id`. La lista muestra si ya hay fila en `arrivals`.

- [ ] **Step 1: Write the failing test**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { canMarkArrival } from "./arrival";

describe("lista de pases", () => {
  it("sin pase no llega y un segundo escaneo no repite", () => {
    expect(canMarkArrival({ hasPass: false, hasArrival: false })).toEqual({ ok: false, reason: "sin qr" });
    expect(canMarkArrival({ hasPass: true, hasArrival: false })).toEqual({ ok: true });
    expect(canMarkArrival({ hasPass: true, hasArrival: true })).toEqual({ ok: false, reason: "ya llegó" });
  });

  it("la lista lee passes y arrivals", () => {
    const list = readFileSync("src/lib/admin/pases/list.ts", "utf8");
    const route = readFileSync("src/app/api/admin/pases/route.ts", "utf8");
    expect(list).toContain('.from("passes")');
    expect(list).toContain('.from("arrivals")');
    expect(list).toContain("profile_id");
    expect(list).toContain(".range(page.from, page.to)");
    expect(route).toContain("await requireSuperadmin()");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/admin/pases/list.test.ts`

Expected: FAIL. No existe `./arrival`.

- [ ] **Step 3: Write minimal implementation**

`src/lib/admin/pases/arrival.ts`

```ts
export function canMarkArrival(input: { hasPass: boolean; hasArrival: boolean }) {
  if (!input.hasPass) return { ok: false as const, reason: "sin qr" };
  if (input.hasArrival) return { ok: false as const, reason: "ya llegó" };
  return { ok: true as const };
}
```

`src/lib/admin/pases/list.ts`

```ts
import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { pageQuery } from "@/lib/admin/page-query";

export async function listPases(rawPage: string | undefined) {
  const page = pageQuery(rawPage);
  const db = await adminDb();
  if (!db) return { page: page.page, rows: [] as Record<string, string>[] };
  const passes = await db
    .from("passes")
    .select("profile_id, image_asset_id, issued_at")
    .order("issued_at", { ascending: false })
    .range(page.from, page.to);
  if (passes.error) throw new Error(passes.error.message);
  const ids = (passes.data ?? []).map((row) => row.profile_id);
  const arrivals = ids.length
    ? await db.from("arrivals").select("profile_id, scanned_at").in("profile_id", ids)
    : { data: [], error: null };
  if (arrivals.error) throw new Error(arrivals.error.message);
  const arrived = new Set((arrivals.data ?? []).map((row) => row.profile_id));
  return {
    page: page.page,
    rows: (passes.data ?? []).map((row) => ({
      id: row.profile_id,
      profile_id: row.profile_id,
      issued_at: row.issued_at,
      llegada: arrived.has(row.profile_id) ? "Llegó" : "Sin escanear",
    })),
  };
}
```

`src/app/api/admin/pases/route.ts`

```ts
import { listPases } from "@/lib/admin/pases/list";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  await requireSuperadmin();
  return Response.json(await listPases(request.nextUrl.searchParams.get("page") ?? undefined));
}
```

`src/app/admin/pases/page.tsx`

```tsx
import { DataList } from "@/components/admin/data-list";
import { listPases } from "@/lib/admin/pases/list";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

export default async function PasesPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requireSuperadmin();
  const params = await searchParams;
  const data = await listPases(params.page);
  return (
    <DataList
      title="Pases y llegadas"
      lead="El QR del perfil y el escaneo de la mesa."
      columns={[
        { key: "profile_id", label: "Perfil" },
        { key: "issued_at", label: "Emitido" },
        { key: "llegada", label: "Llegada" },
      ]}
      rows={data.rows}
      page={data.page}
      basePath="/admin/pases"
    />
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/admin/pases/list.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/admin/pases/arrival.ts src/lib/admin/pases/list.ts src/lib/admin/pases/list.test.ts src/app/api/admin/pases/route.ts src/app/admin/pases/page.tsx
git commit -m "$(cat <<'EOF'
feat: lista de pases y llegadas

EOF
)"
```

---

### Task 13: Detalle de pases y llegadas

**Files:**
- Create: `src/lib/admin/pases/scan.ts`
- Create: `src/lib/admin/pases/detail.ts`
- Create: `src/lib/admin/pases/detail.test.ts`
- Create: `src/app/api/admin/pases/[id]/route.ts`
- Create: `src/app/api/admin/pases/[id]/llegada/route.ts`
- Create: `src/app/admin/pases/[id]/page.tsx`

El QR se muestra con `passObjectPath(profileId)` (`pass-images/{profileId}/pass.png`). Marcar llegada inserta una fila en `arrivals` (la llave es `profile_id`, una sola vez). Si el perfil está en un CRM y `applyCrmEvent` acepta `llegar`, el mismo acto inserta ese hecho. No se cambia `scanDeskAction`: el e2e de `/mesa` sigue diciendo `transición inválida` en el segundo escaneo de memoria.

- [ ] **Step 1: Write the failing test**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { passObjectPath } from "@/lib/storage-assets";
import { arrivalPlan } from "./scan";

const profileId = "11111111-1111-4111-8111-111111111111";

describe("detalle de pases", () => {
  it("muestra el png del pase y escribe llegar solo si el CRM lo permite", () => {
    expect(passObjectPath(profileId)).toBe(`${profileId}/pass.png`);
    expect(arrivalPlan({ hasPass: true, hasArrival: false, crmStatus: "registrado" })).toEqual({
      ok: true,
      insertArrival: true,
      crmEvent: "llegar",
    });
    expect(arrivalPlan({ hasPass: true, hasArrival: false, crmStatus: "cargado" })).toEqual({
      ok: false,
      reason: "transición inválida",
    });
    expect(arrivalPlan({ hasPass: true, hasArrival: true, crmStatus: "llego" })).toEqual({
      ok: false,
      reason: "ya llegó",
    });
    expect(arrivalPlan({ hasPass: false, hasArrival: false, crmStatus: null })).toEqual({
      ok: false,
      reason: "sin qr",
    });
    expect(arrivalPlan({ hasPass: true, hasArrival: false, crmStatus: null })).toEqual({
      ok: true,
      insertArrival: true,
      crmEvent: null,
    });
  });

  it("la llegada inserta arrivals y, si aplica, crm_events", () => {
    const source = readFileSync("src/app/api/admin/pases/[id]/llegada/route.ts", "utf8");
    expect(source).toContain("await requireSuperadmin()");
    expect(source).toContain('.from("arrivals")');
    expect(source).toContain('.from("crm_events")');
    expect(source).toContain("arrivalPlan");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/admin/pases/detail.test.ts`

Expected: FAIL. No existe `./scan`.

- [ ] **Step 3: Write minimal implementation**

`src/lib/admin/pases/scan.ts`

```ts
import { applyCrmEvent, type CrmStatus } from "@/lib/crm-status";

export function arrivalPlan(input: { hasPass: boolean; hasArrival: boolean; crmStatus: CrmStatus | null }) {
  if (!input.hasPass) return { ok: false as const, reason: "sin qr" };
  if (input.hasArrival) return { ok: false as const, reason: "ya llegó" };
  if (input.crmStatus === null) return { ok: true as const, insertArrival: true, crmEvent: null };
  const crm = applyCrmEvent(input.crmStatus, "llegar");
  if (!crm.ok) return { ok: false as const, reason: crm.reason };
  return { ok: true as const, insertArrival: true, crmEvent: "llegar" as const };
}
```

`src/lib/admin/pases/detail.ts`

```ts
import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { passObjectPath } from "@/lib/storage-assets";

export async function loadPase(profileId: string) {
  const db = await adminDb();
  if (!db) return null;
  const pass = await db.from("passes").select("profile_id, image_asset_id, issued_at").eq("profile_id", profileId).maybeSingle();
  if (pass.error) throw new Error(pass.error.message);
  if (!pass.data) return null;
  const [arrival, profile, contact, asset] = await Promise.all([
    db.from("arrivals").select("profile_id, scanned_at").eq("profile_id", profileId).maybeSingle(),
    db.from("profiles").select("full_name, email").eq("id", profileId).maybeSingle(),
    db.from("crm_contacts").select("id").eq("profile_id", profileId).maybeSingle(),
    db.from("media_assets").select("object_path").eq("id", pass.data.image_asset_id).maybeSingle(),
  ]);
  for (const result of [arrival, profile, contact, asset]) {
    if (result.error) throw new Error(result.error.message);
  }
  let crmStatus: string | null = null;
  if (contact.data) {
    const current = await db.from("crm_contact_status").select("status").eq("contact_id", contact.data.id).maybeSingle();
    if (current.error) throw new Error(current.error.message);
    crmStatus = current.data?.status ?? null;
  }
  return {
    pass: pass.data,
    path: asset.data?.object_path ?? passObjectPath(profileId),
    arrival: arrival.data,
    profile: profile.data,
    contactId: contact.data?.id ?? null,
    crmStatus,
  };
}
```

`src/app/api/admin/pases/[id]/route.ts`

```ts
import { loadPase } from "@/lib/admin/pases/detail";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import type { NextRequest } from "next/server";

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  await requireSuperadmin();
  const { id } = await context.params;
  const row = await loadPase(id);
  if (!row) return Response.json({ error: "sin qr" }, { status: 404 });
  return Response.json(row);
}
```

`src/app/api/admin/pases/[id]/llegada/route.ts`

```ts
import { adminDb } from "@/lib/admin/admin-db";
import { loadPase } from "@/lib/admin/pases/detail";
import { arrivalPlan } from "@/lib/admin/pases/scan";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import { readSuperadmin } from "@/lib/auth/require-superadmin";
import type { CrmStatus } from "@/lib/crm-status";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  await requireSuperadmin();
  const account = await readSuperadmin();
  const { id } = await context.params;
  const back = `/admin/pases/${id}`;
  const current = await loadPase(id);
  if (!current) return NextResponse.redirect(new URL(`${back}?error=sin%20qr`, request.url));
  const plan = arrivalPlan({
    hasPass: true,
    hasArrival: Boolean(current.arrival),
    crmStatus: (current.crmStatus as CrmStatus | null) ?? null,
  });
  if (!plan.ok) return NextResponse.redirect(new URL(`${back}?error=${encodeURIComponent(plan.reason)}`, request.url));
  const db = await adminDb();
  if (!db || !account) return NextResponse.redirect(new URL(`${back}?error=sin%20sesi%C3%B3n`, request.url));
  const actor = await db.from("profiles").select("id").eq("email", account.email).maybeSingle();
  if (!actor.data) return NextResponse.redirect(new URL(`${back}?error=sin%20actor`, request.url));
  const arrival = await db.from("arrivals").insert({ profile_id: id, scanned_by: actor.data.id });
  if (arrival.error) return NextResponse.redirect(new URL(`${back}?error=${encodeURIComponent(arrival.error.message)}`, request.url));
  if (plan.crmEvent && current.contactId) {
    const event = await db.from("crm_events").insert({ contact_id: current.contactId, event: plan.crmEvent, actor_id: actor.data.id });
    if (event.error) return NextResponse.redirect(new URL(`${back}?error=${encodeURIComponent(event.error.message)}`, request.url));
  }
  return NextResponse.redirect(new URL(back, request.url));
}
```

`src/app/admin/pases/[id]/page.tsx`

```tsx
import { notFound } from "next/navigation";
import { DetailFrame } from "@/components/admin/detail-frame";
import { tabQuery } from "@/lib/admin/tab-query";
import { loadPase } from "@/lib/admin/pases/detail";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

const tabs = [
  { value: "qr", label: "QR" },
  { value: "llegada", label: "Llegada" },
];

export default async function PaseDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; error?: string }>;
}) {
  await requireSuperadmin();
  const { id } = await params;
  const query = await searchParams;
  const data = await loadPase(id);
  if (!data) notFound();
  const active = tabQuery(query.tab, tabs.map((tab) => tab.value), "qr");
  return (
    <DetailFrame
      title={data.profile?.full_name || data.profile?.email || id}
      backHref="/admin/pases"
      facts={[
        { label: "Ruta", value: data.path },
        { label: "Emitido", value: data.pass.issued_at },
        { label: "Llegada", value: data.arrival?.scanned_at ?? "" },
      ]}
      tabs={tabs}
      active={active}
    >
      {query.error ? <p className="text-small text-mark">{query.error}</p> : null}
      {active === "qr" ? <p data-testid="ruta-pase">{data.path}</p> : null}
      {active === "llegada" ? (
        <form action={`/api/admin/pases/${id}/llegada`} method="post">
          <button className="btn btn-primary" type="submit" disabled={Boolean(data.arrival)}>
            Marcar que llegó
          </button>
        </form>
      ) : null}
    </DetailFrame>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/admin/pases/detail.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/admin/pases/scan.ts src/lib/admin/pases/detail.ts src/lib/admin/pases/detail.test.ts src/app/api/admin/pases/[id]/route.ts src/app/api/admin/pases/[id]/llegada/route.ts src/app/admin/pases/[id]/page.tsx
git commit -m "$(cat <<'EOF'
feat: ver el QR y marcar una sola llegada

EOF
)"
```

---

### Task 14: Lista de sectores

**Files:**
- Create: `src/lib/admin/sectores/list.ts`
- Create: `src/lib/admin/sectores/list.test.ts`
- Create: `src/app/api/admin/sectores/route.ts`
- Create: `src/app/admin/sectores/page.tsx`

Href: `/admin/sectores`. Tabla `sectors`: `slug`, `name`, `position`.

- [ ] **Step 1: Write the failing test**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("lista de sectores", () => {
  it("lee slug, nombre y posición", () => {
    const list = readFileSync("src/lib/admin/sectores/list.ts", "utf8");
    const route = readFileSync("src/app/api/admin/sectores/route.ts", "utf8");
    expect(list).toContain('.from("sectors")');
    expect(list).toContain("slug");
    expect(list).toContain("name");
    expect(list).toContain("position");
    expect(list).toContain(".range(page.from, page.to)");
    expect(route).toContain("await requireSuperadmin()");
    expect(route).not.toMatch(/export async function DELETE/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/admin/sectores/list.test.ts`

Expected: FAIL. No existe `src/lib/admin/sectores/list.ts`.

- [ ] **Step 3: Write minimal implementation**

`src/lib/admin/sectores/list.ts`

```ts
import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { pageQuery } from "@/lib/admin/page-query";

export async function listSectores(rawPage: string | undefined) {
  const page = pageQuery(rawPage);
  const db = await adminDb();
  if (!db) return { page: page.page, rows: [] as Record<string, string>[] };
  const result = await db.from("sectors").select("id, slug, name, position").order("position").range(page.from, page.to);
  if (result.error) throw new Error(result.error.message);
  return {
    page: page.page,
    rows: (result.data ?? []).map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      position: String(row.position),
    })),
  };
}
```

`src/app/api/admin/sectores/route.ts`

```ts
import { listSectores } from "@/lib/admin/sectores/list";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  await requireSuperadmin();
  return Response.json(await listSectores(request.nextUrl.searchParams.get("page") ?? undefined));
}
```

`src/app/admin/sectores/page.tsx`

```tsx
import { DataList } from "@/components/admin/data-list";
import { listSectores } from "@/lib/admin/sectores/list";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

export default async function SectoresPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requireSuperadmin();
  const params = await searchParams;
  const data = await listSectores(params.page);
  return (
    <DataList
      title="Sectores"
      lead="El catálogo y el mensaje de la landing, solo si ya está escrito."
      columns={[
        { key: "name", label: "Nombre" },
        { key: "slug", label: "Ruta" },
        { key: "position", label: "Orden" },
      ]}
      rows={data.rows}
      page={data.page}
      basePath="/admin/sectores"
    />
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/admin/sectores/list.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/admin/sectores/list.ts src/lib/admin/sectores/list.test.ts src/app/api/admin/sectores/route.ts src/app/admin/sectores/page.tsx
git commit -m "$(cat <<'EOF'
feat: lista de sectores del panel

EOF
)"
```

---

### Task 15: Detalle de sectores

**Files:**
- Create: `src/lib/admin/sectores/headline.ts`
- Modify: `src/lib/supabase-directory.ts` (solo el método `sectorMessage`)
- Create: `src/lib/admin/sectores/detail.ts`
- Create: `src/lib/admin/sectores/detail.test.ts`
- Create: `src/app/api/admin/sectores/[id]/route.ts`
- Create: `src/app/admin/sectores/[id]/page.tsx`

Tabs: `ficha` (`slug`, `name`, `position`) y `pagina` (`sector_pages.headline`, `sector_pages.body`). Si `headline` queda vacío se guarda `null`. `landingMessage` devuelve `null` y `Hero` (`src/components/landing/sections/hero.tsx`) deja el h1 de siempre. No edites `hero.tsx`.

- [ ] **Step 1: Write the failing test**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { headlineForStore, landingMessage } from "./headline";

describe("detalle de sectores", () => {
  it("sin titular la landing no recibe mensaje", () => {
    expect(headlineForStore("  ")).toBeNull();
    expect(headlineForStore("El sector")).toBe("El sector");
    expect(landingMessage({ headline: null, body: "Cuerpo" })).toBeNull();
    expect(landingMessage({ headline: "  ", body: "Cuerpo" })).toBeNull();
    expect(landingMessage({ headline: "El sector", body: "Cuerpo" })).toEqual({
      headline: "El sector",
      body: "Cuerpo",
    });
  });

  it("el detalle lee sector_pages y no cambia el h1 por su cuenta", () => {
    const source = readFileSync("src/lib/admin/sectores/detail.ts", "utf8");
    const route = readFileSync("src/app/api/admin/sectores/[id]/route.ts", "utf8");
    const hero = readFileSync("src/components/landing/sections/hero.tsx", "utf8");
    expect(source).toContain('.from("sector_pages")');
    expect(source).toContain("headline");
    expect(source).toContain("body");
    expect(route).toContain("await requireSuperadmin()");
    expect(route).toContain("headlineForStore");
    expect(hero).toContain("message.headline");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/admin/sectores/detail.test.ts`

Expected: FAIL. No existe `./headline`.

- [ ] **Step 3: Write minimal implementation**

`src/lib/admin/sectores/headline.ts`

```ts
export function headlineForStore(raw: string) {
  const text = raw.trim();
  return text.length ? text : null;
}

export function landingMessage(page: { headline: string | null; body: string | null }) {
  const headline = page.headline?.trim() ?? "";
  if (!headline) return null;
  return { headline, body: page.body?.trim() ?? "" };
}
```

En `src/lib/supabase-directory.ts`, reemplaza `sectorMessage: notImplemented` por esta función dentro del objeto que regresa `createSupabaseDirectory`:

```ts
async sectorMessage(slug: string) {
  const sector = await client.from("sectors").select("id").eq("slug", slug).maybeSingle();
  if (sector.error) throw new Error(sector.error.message);
  if (!sector.data) return null;
  const page = await client.from("sector_pages").select("headline, body").eq("sector_id", sector.data.id).maybeSingle();
  if (page.error) throw new Error(page.error.message);
  if (!page.data) return null;
  return landingMessage(page.data);
},
```

Importa `landingMessage` desde `@/lib/admin/sectores/headline`. `supabase-directory.ts` hoy tiene 47 líneas; con este método sigue debajo de 90. El directorio de memoria no cambia: sin fila, `sectorMessage` sigue en `null`.

`src/lib/admin/sectores/detail.ts`

```ts
import "server-only";

import { adminDb } from "@/lib/admin/admin-db";

export async function loadSector(id: string) {
  const db = await adminDb();
  if (!db) return null;
  const sector = await db.from("sectors").select("id, slug, name, position").eq("id", id).maybeSingle();
  if (sector.error) throw new Error(sector.error.message);
  if (!sector.data) return null;
  const page = await db.from("sector_pages").select("headline, body").eq("sector_id", id).maybeSingle();
  if (page.error) throw new Error(page.error.message);
  return { sector: sector.data, page: page.data };
}
```

`src/app/api/admin/sectores/[id]/route.ts`

```ts
import { adminDb } from "@/lib/admin/admin-db";
import { loadSector } from "@/lib/admin/sectores/detail";
import { headlineForStore } from "@/lib/admin/sectores/headline";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  await requireSuperadmin();
  const { id } = await context.params;
  const row = await loadSector(id);
  if (!row) return Response.json({ error: "no encontrado" }, { status: 404 });
  return Response.json(row);
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  await requireSuperadmin();
  const { id } = await context.params;
  const form = await request.formData();
  const headline = headlineForStore(String(form.get("headline") ?? ""));
  const body = String(form.get("body") ?? "").trim();
  const db = await adminDb();
  const back = `/admin/sectores/${id}?tab=pagina`;
  if (!db) return NextResponse.redirect(new URL(`${back}&error=sin%20sesi%C3%B3n`, request.url));
  const saved = await db.from("sector_pages").upsert({ sector_id: id, headline, body: body || null });
  if (saved.error) return NextResponse.redirect(new URL(`${back}&error=${encodeURIComponent(saved.error.message)}`, request.url));
  return NextResponse.redirect(new URL(back, request.url));
}
```

`src/app/admin/sectores/[id]/page.tsx`

```tsx
import { notFound } from "next/navigation";
import { DetailFrame } from "@/components/admin/detail-frame";
import { tabQuery } from "@/lib/admin/tab-query";
import { loadSector } from "@/lib/admin/sectores/detail";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

const tabs = [
  { value: "ficha", label: "Ficha" },
  { value: "pagina", label: "Página" },
];

export default async function SectorDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; error?: string }>;
}) {
  await requireSuperadmin();
  const { id } = await params;
  const query = await searchParams;
  const data = await loadSector(id);
  if (!data) notFound();
  const active = tabQuery(query.tab, tabs.map((tab) => tab.value), "ficha");
  return (
    <DetailFrame
      title={data.sector.name}
      backHref="/admin/sectores"
      facts={[
        { label: "Ruta", value: data.sector.slug },
        { label: "Orden", value: String(data.sector.position) },
        { label: "Titular", value: data.page?.headline ?? "" },
      ]}
      tabs={tabs}
      active={active}
    >
      {query.error ? <p className="text-small text-mark">{query.error}</p> : null}
      {active === "ficha" ? <p>/{data.sector.slug}</p> : null}
      {active === "pagina" ? (
        <form action={`/api/admin/sectores/${id}`} method="post" className="grid max-w-xl gap-3">
          <label className="grid gap-1 text-small" htmlFor="headline">
            Titular
            <input id="headline" name="headline" defaultValue={data.page?.headline ?? ""} />
          </label>
          <label className="grid gap-1 text-small" htmlFor="body">
            Cuerpo
            <textarea id="body" name="body" defaultValue={data.page?.body ?? ""} />
          </label>
          <button className="btn btn-primary" type="submit">Guardar página</button>
        </form>
      ) : null}
    </DetailFrame>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/admin/sectores/detail.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/admin/sectores/headline.ts src/lib/admin/sectores/detail.ts src/lib/admin/sectores/detail.test.ts src/lib/supabase-directory.ts src/app/api/admin/sectores/[id]/route.ts src/app/admin/sectores/[id]/page.tsx
git commit -m "$(cat <<'EOF'
feat: titular de sector que la landing usa solo si existe

EOF
)"
```

---

### Task 16: Lista de sesiones

**Files:**
- Create: `src/lib/admin/sesiones/list.ts`
- Create: `src/lib/admin/sesiones/list.test.ts`
- Create: `src/app/api/admin/sesiones/route.ts`
- Create: `src/app/admin/sesiones/page.tsx`

Href: `/admin/sesiones`. Tabla `sessions`: `venue`, `format_name`, `starts_local`, `ends_local`, `is_current`.

- [ ] **Step 1: Write the failing test**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("lista de sesiones", () => {
  it("lee la sesión y marca cuál es la vigente", () => {
    const list = readFileSync("src/lib/admin/sesiones/list.ts", "utf8");
    const route = readFileSync("src/app/api/admin/sesiones/route.ts", "utf8");
    expect(list).toContain('.from("sessions")');
    expect(list).toContain("venue");
    expect(list).toContain("format_name");
    expect(list).toContain("starts_local");
    expect(list).toContain("ends_local");
    expect(list).toContain("is_current");
    expect(list).toContain(".range(page.from, page.to)");
    expect(route).toContain("await requireSuperadmin()");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/admin/sesiones/list.test.ts`

Expected: FAIL. No existe `src/lib/admin/sesiones/list.ts`.

- [ ] **Step 3: Write minimal implementation**

`src/lib/admin/sesiones/list.ts`

```ts
import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { pageQuery } from "@/lib/admin/page-query";

export async function listSesiones(rawPage: string | undefined) {
  const page = pageQuery(rawPage);
  const db = await adminDb();
  if (!db) return { page: page.page, rows: [] as Record<string, string>[] };
  const result = await db
    .from("sessions")
    .select("id, venue, format_name, starts_local, ends_local, is_current")
    .order("is_current", { ascending: false })
    .range(page.from, page.to);
  if (result.error) throw new Error(result.error.message);
  return {
    page: page.page,
    rows: (result.data ?? []).map((row) => ({
      id: row.id,
      venue: row.venue,
      format_name: row.format_name,
      starts_local: row.starts_local,
      ends_local: row.ends_local,
      is_current: row.is_current ? "Vigente" : "",
    })),
  };
}
```

`src/app/api/admin/sesiones/route.ts`

```ts
import { adminDb } from "@/lib/admin/admin-db";
import { listSesiones } from "@/lib/admin/sesiones/list";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  await requireSuperadmin();
  return Response.json(await listSesiones(request.nextUrl.searchParams.get("page") ?? undefined));
}

export async function POST(request: NextRequest) {
  await requireSuperadmin();
  const form = await request.formData();
  const db = await adminDb();
  if (!db) return NextResponse.redirect(new URL("/admin/sesiones?error=sin%20sesi%C3%B3n", request.url));
  const inserted = await db.from("sessions").insert({
    venue: String(form.get("venue") ?? "").trim(),
    format_name: String(form.get("format_name") ?? "").trim(),
    starts_local: String(form.get("starts_local") ?? ""),
    ends_local: String(form.get("ends_local") ?? ""),
    capacity_min: Number(form.get("capacity_min") ?? 0),
    capacity_max: Number(form.get("capacity_max") ?? 0),
    audience: String(form.get("audience") ?? "").trim(),
    includes: String(form.get("includes") ?? "").trim(),
    is_current: false,
  }).select("id").single();
  if (inserted.error || !inserted.data) {
    return NextResponse.redirect(new URL(`/admin/sesiones?error=${encodeURIComponent(inserted.error?.message ?? "no se creó")}`, request.url));
  }
  return NextResponse.redirect(new URL(`/admin/sesiones/${inserted.data.id}`, request.url));
}
```

`src/app/admin/sesiones/page.tsx`

```tsx
import { DataList } from "@/components/admin/data-list";
import { listSesiones } from "@/lib/admin/sesiones/list";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

export default async function SesionesPage({ searchParams }: { searchParams: Promise<{ page?: string; error?: string }> }) {
  await requireSuperadmin();
  const params = await searchParams;
  const data = await listSesiones(params.page);
  return (
    <DataList
      title="Sesiones"
      lead="La sesión del sector y sus temas."
      columns={[
        { key: "venue", label: "Lugar" },
        { key: "format_name", label: "Formato" },
        { key: "starts_local", label: "Empieza" },
        { key: "ends_local", label: "Termina" },
        { key: "is_current", label: "Vigente" },
      ]}
      rows={data.rows}
      page={data.page}
      basePath="/admin/sesiones"
      error={params.error}
    >
      <form action="/api/admin/sesiones" method="post" className="mt-8 grid max-w-xl gap-3">
        <input name="venue" placeholder="Lugar" required />
        <input name="format_name" placeholder="Formato" required />
        <input name="starts_local" type="time" required />
        <input name="ends_local" type="time" required />
        <input name="capacity_min" type="number" min={1} defaultValue={8} />
        <input name="capacity_max" type="number" min={1} defaultValue={12} />
        <input name="audience" placeholder="Público" required />
        <input name="includes" placeholder="Incluye" required />
        <button className="btn btn-primary" type="submit">Crear sesión</button>
      </form>
    </DataList>
  );
}
```

Si `page.tsx` pasa de 90 líneas, mueve el formulario a `src/app/admin/sesiones/create-form.tsx`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/admin/sesiones/list.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/admin/sesiones/list.ts src/lib/admin/sesiones/list.test.ts src/app/api/admin/sesiones/route.ts src/app/admin/sesiones/page.tsx
git commit -m "$(cat <<'EOF'
feat: lista de sesiones del panel

EOF
)"
```

---

### Task 17: Detalle de sesiones

**Files:**
- Create: `src/lib/admin/sesiones/current.ts`
- Create: `src/lib/admin/sesiones/detail.ts`
- Create: `src/lib/admin/sesiones/detail.test.ts`
- Create: `src/app/api/admin/sesiones/[id]/route.ts`
- Create: `src/app/api/admin/sesiones/[id]/temas/route.ts`
- Create: `src/app/admin/sesiones/[id]/page.tsx`

Tabs: `ficha`, `temas` (`session_topics`), `asistentes`. Los asistentes son filas de `arrivals` y solo se listan en la sesión con `is_current`, porque `arrivals` no tiene `session_id`. Al marcar vigente, primero se apagan las otras (`sessions_one_current_idx` no admite dos).

- [ ] **Step 1: Write the failing test**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { attendeesFor, currentFlip, topicDraft } from "./current";

describe("detalle de sesiones", () => {
  it("deja una sola vigente y los asistentes van con ella", () => {
    expect(currentFlip([{ id: "a", isCurrent: true }, { id: "b", isCurrent: false }], "b", true)).toEqual({
      clearIds: ["a"],
      setId: "b",
      isCurrent: true,
    });
    expect(currentFlip([{ id: "a", isCurrent: true }], "a", false)).toEqual({
      clearIds: [],
      setId: "a",
      isCurrent: false,
    });
    expect(attendeesFor(true, [{ profile_id: "p1" }])).toEqual([{ profile_id: "p1" }]);
    expect(attendeesFor(false, [{ profile_id: "p1" }])).toEqual([]);
    expect(topicDraft({ title: "Datos", position: 1 })).toEqual({ ok: true, title: "Datos", position: 1 });
    expect(topicDraft({ title: " ", position: 1 }).ok).toBe(false);
    expect(topicDraft({ title: "Datos", position: 0 }).ok).toBe(false);
  });

  it("el handler limpia is_current antes de encender la nueva", () => {
    const source = readFileSync("src/app/api/admin/sesiones/[id]/route.ts", "utf8");
    expect(source).toContain("await requireSuperadmin()");
    expect(source).toContain("currentFlip");
    expect(source).toContain('.from("sessions")');
    expect(source).toContain("is_current");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/admin/sesiones/detail.test.ts`

Expected: FAIL. No existe `./current`.

- [ ] **Step 3: Write minimal implementation**

`src/lib/admin/sesiones/current.ts`

```ts
export function currentFlip(
  rows: { id: string; isCurrent: boolean }[],
  id: string,
  wantCurrent: boolean,
) {
  if (!wantCurrent) return { clearIds: [] as string[], setId: id, isCurrent: false };
  return {
    clearIds: rows.filter((row) => row.isCurrent && row.id !== id).map((row) => row.id),
    setId: id,
    isCurrent: true,
  };
}

export function attendeesFor<T>(isCurrent: boolean, rows: T[]) {
  return isCurrent ? rows : [];
}

export function topicDraft(input: { title: string; position: number }) {
  const title = input.title.trim();
  if (!title) return { ok: false as const, reason: "falta el título" };
  if (!Number.isInteger(input.position) || input.position < 1) {
    return { ok: false as const, reason: "posición inválida" };
  }
  return { ok: true as const, title, position: input.position };
}
```

`src/lib/admin/sesiones/detail.ts`

```ts
import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { attendeesFor } from "./current";

export async function loadSesion(id: string) {
  const db = await adminDb();
  if (!db) return null;
  const session = await db.from("sessions").select("id, venue, format_name, starts_local, ends_local, capacity_min, capacity_max, audience, includes, is_current, time_zone").eq("id", id).maybeSingle();
  if (session.error) throw new Error(session.error.message);
  if (!session.data) return null;
  const [topics, arrivals, all] = await Promise.all([
    db.from("session_topics").select("id, position, title").eq("session_id", id).order("position"),
    db.from("arrivals").select("profile_id, scanned_at").order("scanned_at", { ascending: false }),
    db.from("sessions").select("id, is_current"),
  ]);
  for (const result of [topics, arrivals, all]) {
    if (result.error) throw new Error(result.error.message);
  }
  return {
    session: session.data,
    topics: topics.data ?? [],
    attendees: attendeesFor(session.data.is_current, arrivals.data ?? []),
    rows: (all.data ?? []).map((row) => ({ id: row.id, isCurrent: row.is_current })),
  };
}
```

`src/app/api/admin/sesiones/[id]/route.ts`

```ts
import { adminDb } from "@/lib/admin/admin-db";
import { currentFlip } from "@/lib/admin/sesiones/current";
import { loadSesion } from "@/lib/admin/sesiones/detail";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  await requireSuperadmin();
  const { id } = await context.params;
  const row = await loadSesion(id);
  if (!row) return Response.json({ error: "no encontrada" }, { status: 404 });
  return Response.json(row);
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  await requireSuperadmin();
  const { id } = await context.params;
  const form = await request.formData();
  const back = `/admin/sesiones/${id}`;
  const current = await loadSesion(id);
  if (!current) return NextResponse.redirect(new URL(`${back}?error=no%20encontrada`, request.url));
  const flip = currentFlip(current.rows, id, form.get("is_current") === "on");
  const db = await adminDb();
  if (!db) return NextResponse.redirect(new URL(`${back}?error=sin%20sesi%C3%B3n`, request.url));
  if (flip.clearIds.length) {
    const cleared = await db.from("sessions").update({ is_current: false }).in("id", flip.clearIds);
    if (cleared.error) return NextResponse.redirect(new URL(`${back}?error=${encodeURIComponent(cleared.error.message)}`, request.url));
  }
  const updated = await db.from("sessions").update({
    venue: String(form.get("venue") ?? current.session.venue),
    format_name: String(form.get("format_name") ?? current.session.format_name),
    starts_local: String(form.get("starts_local") ?? current.session.starts_local),
    ends_local: String(form.get("ends_local") ?? current.session.ends_local),
    capacity_min: Number(form.get("capacity_min") ?? current.session.capacity_min),
    capacity_max: Number(form.get("capacity_max") ?? current.session.capacity_max),
    audience: String(form.get("audience") ?? current.session.audience),
    includes: String(form.get("includes") ?? current.session.includes),
    is_current: flip.isCurrent,
  }).eq("id", flip.setId);
  if (updated.error) return NextResponse.redirect(new URL(`${back}?error=${encodeURIComponent(updated.error.message)}`, request.url));
  return NextResponse.redirect(new URL(back, request.url));
}
```

`src/app/api/admin/sesiones/[id]/temas/route.ts`

```ts
import { adminDb } from "@/lib/admin/admin-db";
import { topicDraft } from "@/lib/admin/sesiones/current";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  await requireSuperadmin();
  const { id } = await context.params;
  const form = await request.formData();
  const back = `/admin/sesiones/${id}?tab=temas`;
  const draft = topicDraft({ title: String(form.get("title") ?? ""), position: Number(form.get("position") ?? 0) });
  if (!draft.ok) return NextResponse.redirect(new URL(`${back}&error=${encodeURIComponent(draft.reason)}`, request.url));
  const db = await adminDb();
  if (!db) return NextResponse.redirect(new URL(`${back}&error=sin%20sesi%C3%B3n`, request.url));
  const inserted = await db.from("session_topics").insert({ session_id: id, title: draft.title, position: draft.position });
  if (inserted.error) return NextResponse.redirect(new URL(`${back}&error=${encodeURIComponent(inserted.error.message)}`, request.url));
  return NextResponse.redirect(new URL(back, request.url));
}
```

`src/app/admin/sesiones/[id]/page.tsx`

```tsx
import { notFound } from "next/navigation";
import { DetailFrame } from "@/components/admin/detail-frame";
import { tabQuery } from "@/lib/admin/tab-query";
import { loadSesion } from "@/lib/admin/sesiones/detail";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

const tabs = [
  { value: "ficha", label: "Ficha" },
  { value: "temas", label: "Temas" },
  { value: "asistentes", label: "Asistentes" },
];

export default async function SesionDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; error?: string }>;
}) {
  await requireSuperadmin();
  const { id } = await params;
  const query = await searchParams;
  const data = await loadSesion(id);
  if (!data) notFound();
  const active = tabQuery(query.tab, tabs.map((tab) => tab.value), "ficha");
  const session = data.session;
  return (
    <DetailFrame
      title={session.venue}
      backHref="/admin/sesiones"
      facts={[
        { label: "Formato", value: session.format_name },
        { label: "Horario", value: `${session.starts_local}–${session.ends_local}` },
        { label: "Cupo", value: `${session.capacity_min}–${session.capacity_max}` },
        { label: "Vigente", value: session.is_current ? "Sí" : "No" },
      ]}
      tabs={tabs}
      active={active}
    >
      {query.error ? <p className="text-small text-mark">{query.error}</p> : null}
      {active === "ficha" ? (
        <form action={`/api/admin/sesiones/${id}`} method="post" className="grid max-w-xl gap-3">
          <input name="venue" defaultValue={session.venue} />
          <input name="format_name" defaultValue={session.format_name} />
          <input name="starts_local" type="time" defaultValue={session.starts_local} />
          <input name="ends_local" type="time" defaultValue={session.ends_local} />
          <input name="capacity_min" type="number" defaultValue={session.capacity_min} />
          <input name="capacity_max" type="number" defaultValue={session.capacity_max} />
          <input name="audience" defaultValue={session.audience} />
          <input name="includes" defaultValue={session.includes} />
          <label><input name="is_current" type="checkbox" defaultChecked={session.is_current} /> Vigente</label>
          <button className="btn btn-primary" type="submit">Guardar sesión</button>
        </form>
      ) : null}
      {active === "temas" ? (
        <div>
          <ul>{data.topics.map((topic) => <li key={topic.id}>{topic.position}. {topic.title}</li>)}</ul>
          <form action={`/api/admin/sesiones/${id}/temas`} method="post" className="mt-4 grid gap-3">
            <input name="position" type="number" min={1} />
            <input name="title" />
            <button className="btn" type="submit">Agregar tema</button>
          </form>
        </div>
      ) : null}
      {active === "asistentes" ? (
        <ul>{data.attendees.map((row) => <li key={row.profile_id}>{row.profile_id}</li>)}</ul>
      ) : null}
    </DetailFrame>
  );
}
```

Si `page.tsx` pasa de 90 líneas, mueve el formulario de la ficha a `src/app/admin/sesiones/[id]/ficha-form.tsx`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/admin/sesiones/detail.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/admin/sesiones/current.ts src/lib/admin/sesiones/detail.ts src/lib/admin/sesiones/detail.test.ts src/app/api/admin/sesiones/[id]/route.ts src/app/api/admin/sesiones/[id]/temas/route.ts src/app/admin/sesiones/[id]/page.tsx
git commit -m "$(cat <<'EOF'
feat: temas, asistentes y una sola sesión vigente

EOF
)"
```

---

### Task 18: Lista de metodología

**Files:**
- Create: `src/lib/admin/metodologia/range-kind.ts`
- Create: `src/lib/admin/metodologia/list.ts`
- Create: `src/lib/admin/metodologia/list.test.ts`
- Create: `src/app/api/admin/metodologia/route.ts`
- Create: `src/app/admin/metodologia/page.tsx`

Href: `/admin/metodologia`. Tabla `instrument_sections`: `id`, `name`, `position`, `range_kind` (`high` o `low`). El id de la sección es texto (`infraestructura`), no uuid.

- [ ] **Step 1: Write the failing test**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { rangeKind } from "./range-kind";

describe("lista de metodología", () => {
  it("solo acepta high o low", () => {
    expect(rangeKind("high")).toBe("high");
    expect(rangeKind("low")).toBe("low");
    expect(rangeKind("media")).toBeNull();
  });

  it("la lista lee instrument_sections", () => {
    const list = readFileSync("src/lib/admin/metodologia/list.ts", "utf8");
    const route = readFileSync("src/app/api/admin/metodologia/route.ts", "utf8");
    expect(list).toContain('.from("instrument_sections")');
    expect(list).toContain("name");
    expect(list).toContain("position");
    expect(list).toContain("range_kind");
    expect(list).toContain(".range(page.from, page.to)");
    expect(route).toContain("await requireSuperadmin()");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/admin/metodologia/list.test.ts`

Expected: FAIL. No existe `./range-kind`.

- [ ] **Step 3: Write minimal implementation**

`src/lib/admin/metodologia/range-kind.ts`

```ts
export function rangeKind(value: string) {
  if (value === "high" || value === "low") return value;
  return null;
}
```

`src/lib/admin/metodologia/list.ts`

```ts
import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { pageQuery } from "@/lib/admin/page-query";

export async function listMetodologia(rawPage: string | undefined) {
  const page = pageQuery(rawPage);
  const db = await adminDb();
  if (!db) return { page: page.page, rows: [] as Record<string, string>[] };
  const result = await db
    .from("instrument_sections")
    .select("id, name, position, range_kind")
    .order("position")
    .range(page.from, page.to);
  if (result.error) throw new Error(result.error.message);
  return {
    page: page.page,
    rows: (result.data ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      position: String(row.position),
      range_kind: row.range_kind,
    })),
  };
}
```

`src/app/api/admin/metodologia/route.ts`

```ts
import { listMetodologia } from "@/lib/admin/metodologia/list";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  await requireSuperadmin();
  return Response.json(await listMetodologia(request.nextUrl.searchParams.get("page") ?? undefined));
}
```

`src/app/admin/metodologia/page.tsx`

```tsx
import { DataList } from "@/components/admin/data-list";
import { listMetodologia } from "@/lib/admin/metodologia/list";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

export default async function MetodologiaPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requireSuperadmin();
  const params = await searchParams;
  const data = await listMetodologia(params.page);
  return (
    <DataList
      title="Metodología"
      lead="Secciones, bandas, preguntas, opciones y condiciones."
      columns={[
        { key: "name", label: "Sección" },
        { key: "position", label: "Orden" },
        { key: "range_kind", label: "Rango" },
      ]}
      rows={data.rows}
      page={data.page}
      basePath="/admin/metodologia"
    >
      <p className="mt-6">
        <a className="text-link" href="/admin/metodologia/integral">Bandas integrales</a>
      </p>
    </DataList>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/admin/metodologia/list.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/admin/metodologia/range-kind.ts src/lib/admin/metodologia/list.ts src/lib/admin/metodologia/list.test.ts src/app/api/admin/metodologia/route.ts src/app/admin/metodologia/page.tsx
git commit -m "$(cat <<'EOF'
feat: lista de secciones del instrumento

EOF
)"
```

---

### Task 19: Detalle de metodología

**Files:**
- Create: `src/lib/admin/metodologia/level.ts`
- Create: `src/lib/admin/metodologia/detail.ts`
- Create: `src/lib/admin/metodologia/detail.test.ts`
- Create: `src/app/api/admin/metodologia/[id]/route.ts`
- Create: `src/app/api/admin/metodologia/integral/route.ts`
- Create: `src/app/admin/metodologia/[id]/page.tsx`
- Create: `src/app/admin/metodologia/integral/page.tsx`

Tabs de la sección: `bandas` (`section_bands`), `preguntas` (`questions`), `opciones` (`question_options`), `condiciones` (`question_conditions`), `nivel`. La ruta estática `/admin/metodologia/integral` edita `integral_bands` y gana sobre `[id]`. El nivel se calcula. No se escribe en `response_choices`.

- [ ] **Step 1: Write the failing test**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { levelFromChoices } from "./level";

describe("detalle de metodología", () => {
  it("calcula Bronce y no guarda el nivel", () => {
    const rows = Array.from({ length: 17 }, (_, index) => ({
      question_id: index + 1,
      option_value: "a",
      rank: null,
    }));
    rows.push({ question_id: 18, option_value: "falta_materiales", rank: 1 });
    const level = levelFromChoices(rows);
    expect(level.category).toBe("Bronce");
    expect(level.totalScore).toBe(23);
    expect(level.stored).toBe(false);
    expect(level).not.toHaveProperty("level_name");
  });

  it("el detalle lee bandas, preguntas, opciones y condiciones", () => {
    const source = readFileSync("src/lib/admin/metodologia/detail.ts", "utf8");
    const route = readFileSync("src/app/api/admin/metodologia/[id]/route.ts", "utf8");
    expect(source).toContain('.from("section_bands")');
    expect(source).toContain('.from("questions")');
    expect(source).toContain('.from("question_options")');
    expect(source).toContain('.from("question_conditions")');
    expect(source).toContain('.from("response_choices")');
    expect(source).not.toContain("level_name");
    expect(route).toContain("await requireSuperadmin()");
  });
});
```

17 respuestas `a` suman 17. La prioridad con rango 1 en `falta_materiales` suma 6. Total 23, dentro de Bronce (18–53) en `INTEGRAL_RANGES`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/admin/metodologia/detail.test.ts`

Expected: FAIL. No existe `./level`.

- [ ] **Step 3: Write minimal implementation**

`src/lib/admin/metodologia/level.ts`

```ts
import { calculateIntegralResult, type AnswerValue } from "@/lib/methodology/score";

export function levelFromChoices(rows: { question_id: number; option_value: string; rank: number | null }[]) {
  const grouped = new Map<number, { option_value: string; rank: number | null }[]>();
  for (const row of rows) {
    const list = grouped.get(row.question_id) ?? [];
    list.push(row);
    grouped.set(row.question_id, list);
  }
  const answers: Record<number, AnswerValue> = {};
  for (const [id, list] of grouped) {
    if (list.some((row) => row.rank !== null)) {
      const ranked: Record<string, number> = {};
      for (const row of list) if (row.rank) ranked[row.option_value] = row.rank;
      answers[id] = ranked;
    } else {
      answers[id] = list[0]?.option_value ?? "";
    }
  }
  const result = calculateIntegralResult(answers);
  return { category: result.category, totalScore: result.totalScore, stored: false as const };
}
```

`src/lib/admin/metodologia/detail.ts`

```ts
import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { levelFromChoices } from "./level";

export async function loadSeccion(id: string) {
  const db = await adminDb();
  if (!db) return null;
  const section = await db.from("instrument_sections").select("id, name, position, range_kind").eq("id", id).maybeSingle();
  if (section.error) throw new Error(section.error.message);
  if (!section.data) return null;
  const questions = await db.from("questions").select("id, position, prompt, kind").eq("section_id", id).order("position");
  if (questions.error) throw new Error(questions.error.message);
  const ids = (questions.data ?? []).map((row) => row.id);
  const [bands, options, conditions, choices] = await Promise.all([
    db.from("section_bands").select("level, min_score, max_score, riesgo, reto").eq("section_id", id),
    ids.length ? db.from("question_options").select("question_id, value, label, position, points, severity").in("question_id", ids) : Promise.resolve({ data: [], error: null }),
    ids.length ? db.from("question_conditions").select("question_id, depends_on_question_id, expected_value").in("question_id", ids) : Promise.resolve({ data: [], error: null }),
    ids.length ? db.from("response_choices").select("profile_id, question_id, option_value, rank").in("question_id", ids) : Promise.resolve({ data: [], error: null }),
  ]);
  for (const result of [bands, options, conditions, choices]) {
    if (result.error) throw new Error(result.error.message);
  }
  return {
    section: section.data,
    bands: bands.data ?? [],
    questions: questions.data ?? [],
    options: options.data ?? [],
    conditions: conditions.data ?? [],
    level: levelFromChoices(choices.data ?? []),
  };
}
```

`src/lib/admin/metodologia/save-section.ts`

```ts
import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { rangeKind } from "./range-kind";

export async function saveSection(id: string, form: FormData) {
  const db = await adminDb();
  if (!db) return { ok: false as const, reason: "sin sesión" };
  const accion = String(form.get("accion") ?? "");
  if (accion === "seccion") {
    const kind = rangeKind(String(form.get("range_kind") ?? ""));
    if (!kind) return { ok: false as const, reason: "rango inválido" };
    const saved = await db.from("instrument_sections").update({
      name: String(form.get("name") ?? ""),
      range_kind: kind,
    }).eq("id", id);
    if (saved.error) return { ok: false as const, reason: saved.error.message };
  }
  if (accion === "pregunta") {
    const saved = await db.from("questions").update({ prompt: String(form.get("prompt") ?? "") }).eq("id", Number(form.get("question_id"))).eq("section_id", id);
    if (saved.error) return { ok: false as const, reason: saved.error.message };
  }
  if (accion === "opcion") {
    const saved = await db.from("question_options").update({
      label: String(form.get("label") ?? ""),
      points: form.get("points") ? Number(form.get("points")) : null,
      severity: form.get("severity") ? Number(form.get("severity")) : null,
    }).eq("question_id", Number(form.get("question_id"))).eq("value", String(form.get("value") ?? ""));
    if (saved.error) return { ok: false as const, reason: saved.error.message };
  }
  if (accion === "banda") {
    const saved = await db.from("section_bands").update({
      min_score: Number(form.get("min_score")),
      max_score: Number(form.get("max_score")),
      riesgo: String(form.get("riesgo") ?? ""),
      reto: String(form.get("reto") ?? ""),
    }).eq("section_id", id).eq("level", String(form.get("level") ?? ""));
    if (saved.error) return { ok: false as const, reason: saved.error.message };
  }
  if (accion === "condicion") {
    const saved = await db.from("question_conditions").insert({
      question_id: Number(form.get("question_id")),
      depends_on_question_id: Number(form.get("depends_on_question_id")),
      expected_value: String(form.get("expected_value") ?? ""),
    });
    if (saved.error) return { ok: false as const, reason: saved.error.message };
  }
  return { ok: true as const };
}
```

`saveSection` no escribe `response_choices` ni un nivel.

`src/app/api/admin/metodologia/[id]/route.ts`

```ts
import { loadSeccion } from "@/lib/admin/metodologia/detail";
import { saveSection } from "@/lib/admin/metodologia/save-section";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  await requireSuperadmin();
  const { id } = await context.params;
  const row = await loadSeccion(id);
  if (!row) return Response.json({ error: "no encontrada" }, { status: 404 });
  return Response.json(row);
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  await requireSuperadmin();
  const { id } = await context.params;
  const form = await request.formData();
  const tab = String(form.get("tab") ?? "preguntas");
  const back = `/admin/metodologia/${id}?tab=${tab}`;
  const saved = await saveSection(id, form);
  if (!saved.ok) return NextResponse.redirect(new URL(`${back}&error=${encodeURIComponent(saved.reason)}`, request.url));
  return NextResponse.redirect(new URL(back, request.url));
}
```

`src/app/api/admin/metodologia/integral/route.ts`

```ts
import { adminDb } from "@/lib/admin/admin-db";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  await requireSuperadmin();
  const form = await request.formData();
  const db = await adminDb();
  const back = "/admin/metodologia/integral";
  if (!db) return NextResponse.redirect(new URL(`${back}?error=sin%20sesi%C3%B3n`, request.url));
  const saved = await db.from("integral_bands").update({
    min_score: Number(form.get("min_score")),
    max_score: Number(form.get("max_score")),
    riesgo: String(form.get("riesgo") ?? ""),
    reto: String(form.get("reto") ?? ""),
  }).eq("level", String(form.get("level") ?? ""));
  if (saved.error) return NextResponse.redirect(new URL(`${back}?error=${encodeURIComponent(saved.error.message)}`, request.url));
  return NextResponse.redirect(new URL(back, request.url));
}
```

`src/app/admin/metodologia/integral/page.tsx`

```tsx
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import { adminDb } from "@/lib/admin/admin-db";

export const instant = false;

export default async function IntegralPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await requireSuperadmin();
  const query = await searchParams;
  const db = await adminDb();
  const bands = db ? await db.from("integral_bands").select("level, min_score, max_score, riesgo, reto") : { data: [], error: null };
  if (bands.error) throw new Error(bands.error.message);
  return (
    <main className="px-8 py-8">
      <a className="text-link" href="/admin/metodologia">Volver</a>
      <h1 className="mt-4 text-h1 text-ink">Bandas integrales</h1>
      {query.error ? <p className="text-small text-mark">{query.error}</p> : null}
      <ul className="mt-6 grid gap-4">
        {(bands.data ?? []).map((band) => (
          <li key={band.level}>
            <form action="/api/admin/metodologia/integral" method="post" className="grid max-w-xl gap-2">
              <p>{band.level}</p>
              <input type="hidden" name="level" value={band.level} />
              <input name="min_score" type="number" defaultValue={band.min_score} />
              <input name="max_score" type="number" defaultValue={band.max_score} />
              <input name="riesgo" defaultValue={band.riesgo} />
              <input name="reto" defaultValue={band.reto} />
              <button className="btn" type="submit">Guardar banda</button>
            </form>
          </li>
        ))}
      </ul>
    </main>
  );
}
```

`src/app/admin/metodologia/[id]/page.tsx`

```tsx
import { notFound } from "next/navigation";
import { DetailFrame } from "@/components/admin/detail-frame";
import { tabQuery } from "@/lib/admin/tab-query";
import { SectionForms } from "@/app/admin/metodologia/[id]/forms";
import { loadSeccion } from "@/lib/admin/metodologia/detail";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

const tabs = [
  { value: "bandas", label: "Bandas" },
  { value: "preguntas", label: "Preguntas" },
  { value: "opciones", label: "Opciones" },
  { value: "condiciones", label: "Condiciones" },
  { value: "nivel", label: "Nivel" },
];

export default async function SeccionDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; error?: string }>;
}) {
  await requireSuperadmin();
  const { id } = await params;
  const query = await searchParams;
  const data = await loadSeccion(id);
  if (!data) notFound();
  const active = tabQuery(query.tab, tabs.map((tab) => tab.value), "bandas");
  return (
    <DetailFrame
      title={data.section.name}
      backHref="/admin/metodologia"
      facts={[
        { label: "Orden", value: String(data.section.position) },
        { label: "Rango", value: data.section.range_kind },
        { label: "Nivel calculado", value: `${data.level.category} (${data.level.totalScore})` },
      ]}
      tabs={tabs}
      active={active}
    >
      {query.error ? <p className="text-small text-mark">{query.error}</p> : null}
      <SectionForms id={id} section={data.section} questions={data.questions} options={data.options} bands={data.bands} />
      {active === "bandas" ? <ul>{data.bands.map((band) => <li key={band.level}>{band.level}: {band.min_score}–{band.max_score}</li>)}</ul> : null}
      {active === "preguntas" ? <ul>{data.questions.map((question) => <li key={question.id}>{question.position}. {question.prompt}</li>)}</ul> : null}
      {active === "opciones" ? <ul>{data.options.map((option) => <li key={`${option.question_id}-${option.value}`}>{option.label}</li>)}</ul> : null}
      {active === "condiciones" ? <ul>{data.conditions.map((row) => <li key={`${row.question_id}-${row.expected_value}`}>{row.question_id} si {row.expected_value}</li>)}</ul> : null}
      {active === "nivel" ? <p data-testid="nivel-calculado">{data.level.category}</p> : null}
    </DetailFrame>
  );
}
```

`src/app/admin/metodologia/[id]/forms.tsx`

```tsx
export function SectionForms({
  id,
  section,
  questions,
  options,
  bands,
}: {
  id: string;
  section: { name: string; range_kind: string };
  questions: { id: number; prompt: string }[];
  options: { question_id: number; value: string; label: string }[];
  bands: { level: string; min_score: number; max_score: number; riesgo: string; reto: string }[];
}) {
  const action = `/api/admin/metodologia/${id}`;
  return (
    <div className="grid max-w-xl gap-6">
      <form action={action} method="post" className="grid gap-2">
        <input type="hidden" name="accion" value="seccion" />
        <input type="hidden" name="tab" value="bandas" />
        <input name="name" defaultValue={section.name} />
        <input name="range_kind" defaultValue={section.range_kind} />
        <button className="btn" type="submit">Guardar sección</button>
      </form>
      {questions.map((question) => (
        <form key={question.id} action={action} method="post" className="grid gap-2">
          <input type="hidden" name="accion" value="pregunta" />
          <input type="hidden" name="tab" value="preguntas" />
          <input type="hidden" name="question_id" value={question.id} />
          <input name="prompt" defaultValue={question.prompt} />
          <button className="btn" type="submit">Guardar pregunta</button>
        </form>
      ))}
      {options.map((option) => (
        <form key={`${option.question_id}-${option.value}`} action={action} method="post" className="grid gap-2">
          <input type="hidden" name="accion" value="opcion" />
          <input type="hidden" name="tab" value="opciones" />
          <input type="hidden" name="question_id" value={option.question_id} />
          <input type="hidden" name="value" value={option.value} />
          <input name="label" defaultValue={option.label} />
          <input name="points" type="number" />
          <input name="severity" type="number" />
          <button className="btn" type="submit">Guardar opción</button>
        </form>
      ))}
      {bands.map((band) => (
        <form key={band.level} action={action} method="post" className="grid gap-2">
          <input type="hidden" name="accion" value="banda" />
          <input type="hidden" name="tab" value="bandas" />
          <input type="hidden" name="level" value={band.level} />
          <input name="min_score" type="number" defaultValue={band.min_score} />
          <input name="max_score" type="number" defaultValue={band.max_score} />
          <input name="riesgo" defaultValue={band.riesgo} />
          <input name="reto" defaultValue={band.reto} />
          <button className="btn" type="submit">Guardar banda</button>
        </form>
      ))}
      <form action={action} method="post" className="grid gap-2">
        <input type="hidden" name="accion" value="condicion" />
        <input type="hidden" name="tab" value="condiciones" />
        <input name="question_id" type="number" />
        <input name="depends_on_question_id" type="number" />
        <input name="expected_value" />
        <button className="btn" type="submit">Agregar condición</button>
      </form>
    </div>
  );
}
```

El tab `nivel` no tiene botón de guardar. `forms.tsx` queda en menos de 90 líneas.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/admin/metodologia/detail.test.ts`

Expected: PASS. `category` es `Bronce` y `totalScore` es 23.

- [ ] **Step 5: Commit**

```bash
git add src/lib/admin/metodologia/level.ts src/lib/admin/metodologia/detail.ts src/lib/admin/metodologia/save-section.ts src/lib/admin/metodologia/detail.test.ts src/app/api/admin/metodologia/[id]/route.ts src/app/api/admin/metodologia/integral/route.ts src/app/admin/metodologia/[id]/page.tsx src/app/admin/metodologia/[id]/forms.tsx src/app/admin/metodologia/integral/page.tsx
git commit -m "$(cat <<'EOF'
feat: editar el instrumento y mostrar el nivel calculado

EOF
)"
```

---

### Task 20: Lista de medios

**Files:**
- Modify: `src/lib/storage-assets.ts` (agregar `contentObjectPath`)
- Create: `src/lib/admin/medios/target.ts`
- Create: `src/lib/admin/medios/list.ts`
- Create: `src/lib/admin/medios/list.test.ts`
- Create: `src/app/api/admin/medios/route.ts`
- Create: `src/app/admin/medios/page.tsx`

Href: `/admin/medios`. Tabla `media_assets`. Propósitos: `organization_logo`, `content_image`, `pass_qr`.

- [ ] **Step 1: Write the failing test**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { mediaByteLimit, mediaTarget } from "./target";

const id = "11111111-1111-4111-8111-111111111111";

describe("lista de medios", () => {
  it("arma la ruta de logo, pase e imagen de contenido", () => {
    expect(mediaTarget({ purpose: "organization_logo", organizationId: id, contentType: "image/png" })).toEqual({
      bucket: "organization-logos",
      path: `${id}/logo.png`,
    });
    expect(mediaTarget({ purpose: "pass_qr", profileId: id, contentType: "image/png" })).toEqual({
      bucket: "pass-images",
      path: `${id}/pass.png`,
    });
    expect(mediaTarget({ purpose: "content_image", slug: "objetivo", filename: "foto.png", contentType: "image/png" })).toEqual({
      bucket: "content-images",
      path: "objetivo/foto.png",
    });
    expect(mediaByteLimit("organization_logo")).toBe(2_097_152);
    expect(mediaByteLimit("pass_qr")).toBe(524_288);
    expect(mediaByteLimit("content_image")).toBe(4_194_304);
    expect(() => mediaTarget({ purpose: "pass_qr", profileId: id, contentType: "image/jpeg" })).toThrow("el pase es png");
  });

  it("la lista lee media_assets", () => {
    const list = readFileSync("src/lib/admin/medios/list.ts", "utf8");
    const route = readFileSync("src/app/api/admin/medios/route.ts", "utf8");
    expect(list).toContain('.from("media_assets")');
    expect(list).toContain("purpose");
    expect(list).toContain("bucket_id");
    expect(list).toContain("object_path");
    expect(list).toContain(".range(page.from, page.to)");
    expect(route).toContain("await requireSuperadmin()");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/admin/medios/list.test.ts`

Expected: FAIL. No existe `./target`.

- [ ] **Step 3: Write minimal implementation**

Al final de `src/lib/storage-assets.ts`:

```ts
export function contentObjectPath(slug: string, filename: string) {
  if (!/^[a-z0-9-]+$/.test(slug)) throw new Error("slug inválido");
  if (!/^[a-z0-9.-]+\.(png|jpg|webp)$/.test(filename)) throw new Error("archivo inválido");
  return `${slug}/${filename}`;
}
```

`src/lib/admin/medios/target.ts`

```ts
import { contentObjectPath, logoObjectPath, passObjectPath } from "@/lib/storage-assets";

const limits = {
  organization_logo: 2_097_152,
  pass_qr: 524_288,
  content_image: 4_194_304,
} as const;

export function mediaByteLimit(purpose: keyof typeof limits) {
  return limits[purpose];
}

export function mediaTarget(input: {
  purpose: keyof typeof limits;
  organizationId?: string;
  profileId?: string;
  slug?: string;
  filename?: string;
  contentType: string;
}) {
  if (input.purpose === "organization_logo") {
    if (!input.organizationId) throw new Error("falta el organismo");
    return { bucket: "organization-logos", path: logoObjectPath(input.organizationId, input.contentType) };
  }
  if (input.purpose === "pass_qr") {
    if (!input.profileId) throw new Error("falta el perfil");
    if (input.contentType !== "image/png") throw new Error("el pase es png");
    return { bucket: "pass-images", path: passObjectPath(input.profileId) };
  }
  if (!input.slug || !input.filename) throw new Error("falta el bloque");
  return { bucket: "content-images", path: contentObjectPath(input.slug, input.filename) };
}
```

`src/lib/admin/medios/list.ts`

```ts
import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { pageQuery } from "@/lib/admin/page-query";

export async function listMedios(rawPage: string | undefined) {
  const page = pageQuery(rawPage);
  const db = await adminDb();
  if (!db) return { page: page.page, rows: [] as Record<string, string>[] };
  const result = await db
    .from("media_assets")
    .select("id, purpose, bucket_id, object_path, content_type, byte_size")
    .order("created_at", { ascending: false })
    .range(page.from, page.to);
  if (result.error) throw new Error(result.error.message);
  return {
    page: page.page,
    rows: (result.data ?? []).map((row) => ({
      id: row.id,
      purpose: row.purpose,
      bucket_id: row.bucket_id,
      object_path: row.object_path,
      content_type: row.content_type,
      byte_size: String(row.byte_size),
    })),
  };
}
```

`src/app/api/admin/medios/route.ts`

```ts
import { listMedios } from "@/lib/admin/medios/list";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  await requireSuperadmin();
  return Response.json(await listMedios(request.nextUrl.searchParams.get("page") ?? undefined));
}
```

`src/app/admin/medios/page.tsx`

```tsx
import { DataList } from "@/components/admin/data-list";
import { listMedios } from "@/lib/admin/medios/list";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

export default async function MediosPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requireSuperadmin();
  const params = await searchParams;
  const data = await listMedios(params.page);
  return (
    <DataList
      title="Medios"
      lead="Logos, imágenes de contenido y pases. Los bytes están en Storage."
      columns={[
        { key: "purpose", label: "Uso" },
        { key: "bucket_id", label: "Bucket" },
        { key: "object_path", label: "Ruta" },
        { key: "byte_size", label: "Bytes" },
      ]}
      rows={data.rows}
      page={data.page}
      basePath="/admin/medios"
    />
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/admin/medios/list.test.ts src/lib/storage-assets.test.ts`

Expected: PASS. Los tests viejos de `logoObjectPath` y `passObjectPath` siguen verdes.

- [ ] **Step 5: Commit**

```bash
git add src/lib/storage-assets.ts src/lib/admin/medios/target.ts src/lib/admin/medios/list.ts src/lib/admin/medios/list.test.ts src/app/api/admin/medios/route.ts src/app/admin/medios/page.tsx
git commit -m "$(cat <<'EOF'
feat: lista de medios con las rutas de Storage

EOF
)"
```

---

### Task 21: Detalle de medios

**Files:**
- Create: `src/lib/admin/medios/detail.ts`
- Create: `src/lib/admin/medios/detail.test.ts`
- Create: `src/app/api/admin/medios/[id]/route.ts`
- Create: `src/app/admin/medios/[id]/page.tsx`

Reemplazar sube los bytes al bucket de `mediaTarget` y actualiza la ficha (`byte_size`, `content_type`, `object_path`). No guarda los bytes en Postgres.

- [ ] **Step 1: Write the failing test**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("detalle de medios", () => {
  it("el reemplazo usa el bucket del propósito", () => {
    const source = readFileSync("src/app/api/admin/medios/[id]/route.ts", "utf8");
    const detail = readFileSync("src/lib/admin/medios/detail.ts", "utf8");
    expect(source).toContain("await requireSuperadmin()");
    expect(source).toContain("mediaTarget");
    expect(source).toContain("mediaByteLimit");
    expect(source).toContain(".storage");
    expect(source).toContain('.from("media_assets")');
    expect(detail).toContain("organization_logo");
    expect(detail).toContain("content_image");
    expect(detail).toContain("pass_qr");
    expect(source).not.toContain("bytea");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/admin/medios/detail.test.ts`

Expected: FAIL. No existe el route.

- [ ] **Step 3: Write minimal implementation**

`src/lib/admin/medios/detail.ts`

```ts
import "server-only";

import { adminDb } from "@/lib/admin/admin-db";

export async function loadMedio(id: string) {
  const db = await adminDb();
  if (!db) return null;
  const asset = await db
    .from("media_assets")
    .select("id, purpose, bucket_id, object_path, content_type, byte_size, organization_id, profile_id, content_block_slug")
    .eq("id", id)
    .maybeSingle();
  if (asset.error) throw new Error(asset.error.message);
  if (!asset.data) return null;
  if (!["organization_logo", "content_image", "pass_qr"].includes(asset.data.purpose)) return null;
  return asset.data;
}
```

`src/app/api/admin/medios/[id]/route.ts`

```ts
import { adminDb } from "@/lib/admin/admin-db";
import { loadMedio } from "@/lib/admin/medios/detail";
import { mediaByteLimit, mediaTarget } from "@/lib/admin/medios/target";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  await requireSuperadmin();
  const { id } = await context.params;
  const row = await loadMedio(id);
  if (!row) return Response.json({ error: "no encontrado" }, { status: 404 });
  return Response.json(row);
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  await requireSuperadmin();
  const { id } = await context.params;
  const form = await request.formData();
  const file = form.get("archivo");
  const back = `/admin/medios/${id}`;
  const current = await loadMedio(id);
  if (!current || !(file instanceof File)) return NextResponse.redirect(new URL(`${back}?error=falta%20el%20archivo`, request.url));
  const purpose = current.purpose as "organization_logo" | "pass_qr" | "content_image";
  if (file.size > mediaByteLimit(purpose)) return NextResponse.redirect(new URL(`${back}?error=archivo%20grande`, request.url));
  const target = mediaTarget({
    purpose,
    organizationId: current.organization_id ?? undefined,
    profileId: current.profile_id ?? undefined,
    slug: current.content_block_slug ?? undefined,
    filename: String(form.get("filename") ?? ""),
    contentType: file.type,
  });
  const db = await adminDb();
  if (!db) return NextResponse.redirect(new URL(`${back}?error=sin%20sesi%C3%B3n`, request.url));
  const uploaded = await db.storage.from(target.bucket).upload(target.path, file, { upsert: true, contentType: file.type });
  if (uploaded.error) return NextResponse.redirect(new URL(`${back}?error=${encodeURIComponent(uploaded.error.message)}`, request.url));
  const saved = await db.from("media_assets").update({ object_path: target.path, content_type: file.type, byte_size: file.size }).eq("id", id);
  if (saved.error) return NextResponse.redirect(new URL(`${back}?error=${encodeURIComponent(saved.error.message)}`, request.url));
  return NextResponse.redirect(new URL(back, request.url));
}
```

`mediaTarget` usa `filename` solo en `content_image`. Logo y pase arman la ruta con `logoObjectPath` y `passObjectPath`. En el formulario del detalle agrega `<input name="filename" placeholder="foto.png" />` y en el route pasa `filename: String(form.get("filename") ?? "")`.

`src/app/admin/medios/[id]/page.tsx`

```tsx
import { notFound } from "next/navigation";
import { DetailFrame } from "@/components/admin/detail-frame";
import { tabQuery } from "@/lib/admin/tab-query";
import { loadMedio } from "@/lib/admin/medios/detail";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

const tabs = [{ value: "archivo", label: "Archivo" }];

export default async function MedioDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; error?: string }>;
}) {
  await requireSuperadmin();
  const { id } = await params;
  const query = await searchParams;
  const data = await loadMedio(id);
  if (!data) notFound();
  const active = tabQuery(query.tab, ["archivo"], "archivo");
  return (
    <DetailFrame
      title={data.purpose}
      backHref="/admin/medios"
      facts={[
        { label: "Bucket", value: data.bucket_id },
        { label: "Ruta", value: data.object_path },
        { label: "Tipo", value: data.content_type },
        { label: "Bytes", value: String(data.byte_size) },
      ]}
      tabs={tabs}
      active={active}
    >
      {query.error ? <p className="text-small text-mark">{query.error}</p> : null}
      <form action={`/api/admin/medios/${id}`} method="post" encType="multipart/form-data" className="grid gap-3">
        <input name="filename" placeholder="foto.png" />
        <input name="archivo" type="file" accept="image/png,image/jpeg,image/webp" />
        <button className="btn btn-primary" type="submit">Reemplazar</button>
      </form>
    </DetailFrame>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/admin/medios/detail.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/admin/medios/detail.ts src/lib/admin/medios/detail.test.ts src/app/api/admin/medios/[id]/route.ts src/app/admin/medios/[id]/page.tsx
git commit -m "$(cat <<'EOF'
feat: reemplazar logo, imagen o pase desde el panel

EOF
)"
```

---

### Task 22: Lista de bandeja

**Files:**
- Create: `src/lib/admin/bandeja/kinds.ts`
- Create: `src/lib/admin/bandeja/list.ts`
- Create: `src/lib/admin/bandeja/list.test.ts`
- Create: `src/app/api/admin/bandeja/route.ts`
- Create: `src/app/admin/bandeja/page.tsx`

Href: `/admin/bandeja`. Tabla `outbox_messages`. Kinds: `password`, `event_pass`, `open_innovation`. El asunto sale de `mailFor` en `src/lib/outbox-message.ts`.

- [ ] **Step 1: Write the failing test**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { outboxRow } from "./kinds";

describe("lista de bandeja", () => {
  it("arma los tres asuntos de la planeación", () => {
    expect(outboxRow("password", "ana@norte.mx")).toEqual({
      kind: "password",
      to_email: "ana@norte.mx",
      subject: "Crea tu contraseña para la sesión",
    });
    expect(outboxRow("event_pass", "ana@norte.mx").subject).toBe("Tu pase para la sesión ya está listo");
    expect(outboxRow("open_innovation", "ana@norte.mx").subject).toBe(
      "¿Quieres ser una empresa de innovación abierta?",
    );
    expect(() => outboxRow("password", " ")).toThrow("correo inválido");
  });

  it("la lista filtra por kind", () => {
    const list = readFileSync("src/lib/admin/bandeja/list.ts", "utf8");
    const route = readFileSync("src/app/api/admin/bandeja/route.ts", "utf8");
    expect(list).toContain('.from("outbox_messages")');
    expect(list).toContain("password");
    expect(list).toContain("event_pass");
    expect(list).toContain("open_innovation");
    expect(list).toContain(".range(page.from, page.to)");
    expect(route).toContain("await requireSuperadmin()");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/admin/bandeja/list.test.ts`

Expected: FAIL. No existe `./kinds`.

- [ ] **Step 3: Write minimal implementation**

`src/lib/admin/bandeja/kinds.ts`

```ts
import { mailFor } from "@/lib/outbox-message";

const kinds = ["password", "event_pass", "open_innovation"] as const;
export type MailKind = (typeof kinds)[number];

export function mailKind(value: string | undefined): MailKind | null {
  if (value && kinds.includes(value as MailKind)) return value as MailKind;
  return null;
}

export function outboxRow(kind: MailKind, email: string) {
  const mail = mailFor(kind, email);
  return { kind: mail.kind, to_email: mail.to, subject: mail.subject };
}
```

`src/lib/admin/bandeja/list.ts`

```ts
import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { pageQuery } from "@/lib/admin/page-query";
import { mailKind } from "./kinds";

export async function listBandeja(rawPage: string | undefined, rawKind: string | undefined) {
  const page = pageQuery(rawPage);
  const kind = mailKind(rawKind);
  const db = await adminDb();
  if (!db) return { page: page.page, rows: [] as Record<string, string>[] };
  let query = db
    .from("outbox_messages")
    .select("id, kind, to_email, subject, created_at")
    .order("created_at", { ascending: false })
    .range(page.from, page.to);
  if (kind) query = query.eq("kind", kind);
  const result = await query;
  if (result.error) throw new Error(result.error.message);
  return {
    page: page.page,
    rows: (result.data ?? []).map((row) => ({
      id: row.id,
      kind: row.kind,
      to_email: row.to_email,
      subject: row.subject,
      created_at: row.created_at,
    })),
  };
}
```

`src/app/api/admin/bandeja/route.ts`

```ts
import { listBandeja } from "@/lib/admin/bandeja/list";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  await requireSuperadmin();
  const params = request.nextUrl.searchParams;
  return Response.json(await listBandeja(params.get("page") ?? undefined, params.get("kind") ?? undefined));
}
```

`src/app/admin/bandeja/page.tsx`

```tsx
import { DataList } from "@/components/admin/data-list";
import { listBandeja } from "@/lib/admin/bandeja/list";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

const filters = [
  { href: "/admin/bandeja", label: "Todos" },
  { href: "/admin/bandeja?kind=password", label: "Contraseña" },
  { href: "/admin/bandeja?kind=event_pass", label: "Pase" },
  { href: "/admin/bandeja?kind=open_innovation", label: "Innovación abierta" },
];

export default async function BandejaPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; kind?: string }>;
}) {
  await requireSuperadmin();
  const params = await searchParams;
  const data = await listBandeja(params.page, params.kind);
  return (
    <DataList
      title="Bandeja"
      lead="Los tres correos: contraseña, pase e innovación abierta."
      columns={[
        { key: "kind", label: "Tipo" },
        { key: "to_email", label: "Para" },
        { key: "subject", label: "Asunto" },
      ]}
      rows={data.rows}
      page={data.page}
      basePath="/admin/bandeja"
    >
      <nav className="mt-6 flex gap-3">
        {filters.map((filter) => (
          <a key={filter.href} className="text-link" href={filter.href}>{filter.label}</a>
        ))}
      </nav>
    </DataList>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/admin/bandeja/list.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/admin/bandeja/kinds.ts src/lib/admin/bandeja/list.ts src/lib/admin/bandeja/list.test.ts src/app/api/admin/bandeja/route.ts src/app/admin/bandeja/page.tsx
git commit -m "$(cat <<'EOF'
feat: lista de la bandeja por tipo de correo

EOF
)"
```

---

### Task 23: Detalle de bandeja

**Files:**
- Create: `src/lib/admin/bandeja/retry.ts`
- Create: `src/lib/admin/bandeja/detail.ts`
- Create: `src/lib/admin/bandeja/detail.test.ts`
- Create: `src/app/api/admin/bandeja/[id]/route.ts`
- Create: `src/app/admin/bandeja/[id]/page.tsx`

Reintentar inserta otra fila en `outbox_messages` con el mismo kind, destinatario y asunto de `mailFor`. No abre SMTP.

- [ ] **Step 1: Write the failing test**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { retryRow } from "./retry";

describe("detalle de bandeja", () => {
  it("el reintento copia kind y asunto, y no abre correo", () => {
    expect(retryRow({ kind: "event_pass", to_email: "ana@norte.mx", profile_id: "p1", contact_id: null })).toEqual({
      kind: "event_pass",
      to_email: "ana@norte.mx",
      subject: "Tu pase para la sesión ya está listo",
      profile_id: "p1",
      contact_id: null,
    });
    expect(retryRow({ kind: "password", to_email: "ana@norte.mx", profile_id: null, contact_id: "c1" }).subject).toBe(
      "Crea tu contraseña para la sesión",
    );
  });

  it("el handler inserta en outbox_messages", () => {
    const source = readFileSync("src/app/api/admin/bandeja/[id]/route.ts", "utf8");
    expect(source).toContain("await requireSuperadmin()");
    expect(source).toContain("retryRow");
    expect(source).toContain('.from("outbox_messages")');
    expect(source).toContain(".insert(");
    expect(source).not.toContain("smtp");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/admin/bandeja/detail.test.ts`

Expected: FAIL. No existe `./retry`.

- [ ] **Step 3: Write minimal implementation**

`src/lib/admin/bandeja/retry.ts`

```ts
import { outboxRow, type MailKind } from "./kinds";

export function retryRow(input: {
  kind: MailKind;
  to_email: string;
  profile_id: string | null;
  contact_id: string | null;
}) {
  const mail = outboxRow(input.kind, input.to_email);
  return {
    kind: mail.kind,
    to_email: mail.to_email,
    subject: mail.subject,
    profile_id: input.profile_id,
    contact_id: input.contact_id,
  };
}
```

`src/lib/admin/bandeja/detail.ts`

```ts
import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { mailKind } from "./kinds";

export async function loadMensaje(id: string) {
  const db = await adminDb();
  if (!db) return null;
  const row = await db
    .from("outbox_messages")
    .select("id, kind, to_email, subject, profile_id, contact_id, created_at")
    .eq("id", id)
    .maybeSingle();
  if (row.error) throw new Error(row.error.message);
  if (!row.data || !mailKind(row.data.kind)) return null;
  return row.data;
}
```

`src/app/api/admin/bandeja/[id]/route.ts`

```ts
import { adminDb } from "@/lib/admin/admin-db";
import { loadMensaje } from "@/lib/admin/bandeja/detail";
import { mailKind } from "@/lib/admin/bandeja/kinds";
import { retryRow } from "@/lib/admin/bandeja/retry";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  await requireSuperadmin();
  const { id } = await context.params;
  const row = await loadMensaje(id);
  if (!row) return Response.json({ error: "no encontrado" }, { status: 404 });
  return Response.json(row);
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  await requireSuperadmin();
  const { id } = await context.params;
  const current = await loadMensaje(id);
  const back = `/admin/bandeja/${id}`;
  const kind = current ? mailKind(current.kind) : null;
  if (!current || !kind) return NextResponse.redirect(new URL(`${back}?error=no%20encontrado`, request.url));
  const db = await adminDb();
  if (!db) return NextResponse.redirect(new URL(`${back}?error=sin%20sesi%C3%B3n`, request.url));
  const inserted = await db.from("outbox_messages").insert(retryRow({
    kind,
    to_email: current.to_email,
    profile_id: current.profile_id,
    contact_id: current.contact_id,
  })).select("id").single();
  if (inserted.error || !inserted.data) {
    return NextResponse.redirect(new URL(`${back}?error=${encodeURIComponent(inserted.error?.message ?? "no se reintentó")}`, request.url));
  }
  return NextResponse.redirect(new URL(`/admin/bandeja/${inserted.data.id}`, request.url));
}
```

`src/app/admin/bandeja/[id]/page.tsx`

```tsx
import { notFound } from "next/navigation";
import { DetailFrame } from "@/components/admin/detail-frame";
import { tabQuery } from "@/lib/admin/tab-query";
import { loadMensaje } from "@/lib/admin/bandeja/detail";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

const tabs = [{ value: "mensaje", label: "Mensaje" }];

export default async function MensajeDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; error?: string }>;
}) {
  await requireSuperadmin();
  const { id } = await params;
  const query = await searchParams;
  const data = await loadMensaje(id);
  if (!data) notFound();
  const active = tabQuery(query.tab, ["mensaje"], "mensaje");
  return (
    <DetailFrame
      title={data.subject}
      backHref="/admin/bandeja"
      facts={[
        { label: "Tipo", value: data.kind },
        { label: "Para", value: data.to_email },
        { label: "Asunto", value: data.subject },
      ]}
      tabs={tabs}
      active={active}
    >
      {query.error ? <p className="text-small text-mark">{query.error}</p> : null}
      <form action={`/api/admin/bandeja/${id}`} method="post">
        <button className="btn btn-primary" type="submit">Reintentar envío</button>
      </form>
    </DetailFrame>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/admin/bandeja/detail.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/admin/bandeja/retry.ts src/lib/admin/bandeja/detail.ts src/lib/admin/bandeja/detail.test.ts src/app/api/admin/bandeja/[id]/route.ts src/app/admin/bandeja/[id]/page.tsx
git commit -m "$(cat <<'EOF'
feat: reintentar un mensaje de la bandeja

EOF
)"
```

---

### Task 24: Correo masivo en el panel

**Files:**
- Create: `src/lib/admin/correo/audience.ts`
- Create: `src/lib/admin/correo/audience.test.ts`
- Create: `src/app/api/admin/correo/route.ts`
- Modify: `src/app/admin/correo/page.tsx`

Href que ya está en `nav.ts`: `/admin/correo`. No se reescribe `nav.ts`. La página ya existe y el e2e `e2e/mesa.spec.ts` exige el botón `Enviar innovación abierta`, el `data-testid="encolados"` y que `?rol=moderador` oculte el botón. No llames `requireSuperadmin()` en esta página: con `AUTH_PROVIDER=memory` no hay sesión y el e2e se iría a `/admin/login`. El route sí llama `requireSuperadmin()`. El envío sigue saliendo solo a perfiles con `onboarded_at`.

- [ ] **Step 1: Write the failing test**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { innovationRecipients } from "./audience";

describe("correo masivo", () => {
  it("solo encola a quien terminó el perfil", () => {
    const rows = innovationRecipients([
      { email: "ana@norte.mx", onboarded_at: "2026-10-21T00:00:00Z" },
      { email: "beto@sur.mx", onboarded_at: null },
      { email: null, onboarded_at: "2026-10-21T00:00:00Z" },
    ]);
    expect(rows).toEqual([
      {
        kind: "open_innovation",
        to_email: "ana@norte.mx",
        subject: "¿Quieres ser una empresa de innovación abierta?",
      },
    ]);
  });

  it("la página conserva el botón del e2e y el route exige superadmin", () => {
    const page = readFileSync("src/app/admin/correo/page.tsx", "utf8");
    const route = readFileSync("src/app/api/admin/correo/route.ts", "utf8");
    expect(page).toContain("Enviar innovación abierta");
    expect(page).toContain('data-testid="encolados"');
    expect(page).toContain("sendInnovationAction");
    expect(page).not.toContain("requireSuperadmin");
    expect(route).toContain("await requireSuperadmin()");
    expect(route).toContain("innovationRecipients");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/admin/correo/audience.test.ts`

Expected: FAIL. No existe `./audience`.

- [ ] **Step 3: Write minimal implementation**

`src/lib/admin/correo/audience.ts`

```ts
import { outboxRow } from "@/lib/admin/bandeja/kinds";

export function innovationRecipients(profiles: { email: string | null; onboarded_at: string | null }[]) {
  return profiles
    .filter((profile) => profile.onboarded_at && profile.email)
    .map((profile) => outboxRow("open_innovation", profile.email ?? ""));
}
```

`src/app/api/admin/correo/route.ts`

```ts
import { adminDb } from "@/lib/admin/admin-db";
import { innovationRecipients } from "@/lib/admin/correo/audience";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  await requireSuperadmin();
  const db = await adminDb();
  if (!db) return NextResponse.redirect(new URL("/admin/correo?error=sin%20sesi%C3%B3n", request.url));
  const profiles = await db.from("profiles").select("id, email, onboarded_at");
  if (profiles.error) {
    return NextResponse.redirect(new URL(`/admin/correo?error=${encodeURIComponent(profiles.error.message)}`, request.url));
  }
  const mails = innovationRecipients(profiles.data ?? []);
  const byEmail = new Map((profiles.data ?? []).map((row) => [row.email, row.id]));
  if (mails.length) {
    const inserted = await db.from("outbox_messages").insert(
      mails.map((mail) => ({
        kind: mail.kind,
        to_email: mail.to_email,
        subject: mail.subject,
        profile_id: byEmail.get(mail.to_email) ?? null,
      })),
    );
    if (inserted.error) {
      return NextResponse.redirect(new URL(`/admin/correo?error=${encodeURIComponent(inserted.error.message)}`, request.url));
    }
  }
  return NextResponse.redirect(new URL("/admin/correo?enviado=1", request.url));
}
```

En `src/app/admin/correo/page.tsx` deja el resto de la página como está (`Kicker`, el h1, el párrafo, `can`, el botón `Enviar innovación abierta` y `data-testid="encolados"`). Cambia solo el import y el `action` del formulario:

```tsx
import { usesSupabaseAuth } from "@/lib/supabase/auth-session";

const mailAction = usesSupabaseAuth() ? "/api/admin/correo" : sendInnovationAction;
```

```tsx
<form action={mailAction}>
```

Sigue habiendo un solo botón con ese nombre. Con `AUTH_PROVIDER=memory`, `usesSupabaseAuth()` es falso y el e2e sigue en `sendInnovationAction`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/admin/correo/audience.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/admin/correo/audience.ts src/lib/admin/correo/audience.test.ts src/app/api/admin/correo/route.ts src/app/admin/correo/page.tsx
git commit -m "$(cat <<'EOF'
feat: el correo masivo del panel solo sale a perfiles terminados

EOF
)"
```

---

### Task 25: Detalle de un correo masivo

**Files:**
- Create: `src/lib/admin/correo/detail.ts`
- Create: `src/lib/admin/correo/detail.test.ts`
- Create: `src/app/api/admin/correo/[id]/route.ts`
- Create: `src/app/admin/correo/[id]/page.tsx`

`/admin/correo/[id]` muestra una fila `open_innovation`. No reenvía a quien no terminó el perfil.

- [ ] **Step 1: Write the failing test**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { innovationDetail } from "./detail";

describe("detalle del correo masivo", () => {
  it("solo abre un mensaje de innovación abierta con su asunto", () => {
    expect(innovationDetail({
      kind: "open_innovation",
      subject: "¿Quieres ser una empresa de innovación abierta?",
      to_email: "ana@norte.mx",
    })).toEqual({
      to: "ana@norte.mx",
      subject: "¿Quieres ser una empresa de innovación abierta?",
    });
    expect(innovationDetail({ kind: "password", subject: "Crea tu contraseña para la sesión", to_email: "ana@norte.mx" })).toBeNull();
    expect(innovationDetail(null)).toBeNull();
  });

  it("el handler exige superadmin", () => {
    const source = readFileSync("src/app/api/admin/correo/[id]/route.ts", "utf8");
    expect(source).toContain("await requireSuperadmin()");
    expect(source).toContain("innovationDetail");
    expect(source).not.toMatch(/export async function POST/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/admin/correo/detail.test.ts`

Expected: FAIL. No existe `./detail`.

- [ ] **Step 3: Write minimal implementation**

`src/lib/admin/correo/detail.ts`

```ts
import { mailFor } from "@/lib/outbox-message";

export function innovationDetail(row: { kind: string; subject: string; to_email: string } | null) {
  if (!row || row.kind !== "open_innovation") return null;
  const expected = mailFor("open_innovation", row.to_email);
  if (row.subject !== expected.subject) return null;
  return { to: expected.to, subject: expected.subject };
}
```

`src/app/api/admin/correo/[id]/route.ts`

```ts
import { adminDb } from "@/lib/admin/admin-db";
import { innovationDetail } from "@/lib/admin/correo/detail";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import type { NextRequest } from "next/server";

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  await requireSuperadmin();
  const { id } = await context.params;
  const db = await adminDb();
  if (!db) return Response.json({ error: "sin sesión" }, { status: 401 });
  const row = await db.from("outbox_messages").select("id, kind, subject, to_email, created_at").eq("id", id).maybeSingle();
  if (row.error) return Response.json({ error: row.error.message }, { status: 500 });
  const detail = innovationDetail(row.data);
  if (!detail) return Response.json({ error: "no es innovación abierta" }, { status: 404 });
  return Response.json({ ...detail, id, created_at: row.data?.created_at });
}
```

`src/app/admin/correo/[id]/page.tsx`

```tsx
import { notFound } from "next/navigation";
import { DetailFrame } from "@/components/admin/detail-frame";
import { adminDb } from "@/lib/admin/admin-db";
import { innovationDetail } from "@/lib/admin/correo/detail";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

export default async function CorreoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireSuperadmin();
  const { id } = await params;
  const db = await adminDb();
  if (!db) notFound();
  const row = await db.from("outbox_messages").select("kind, subject, to_email, created_at").eq("id", id).maybeSingle();
  const detail = innovationDetail(row.data);
  if (!detail) notFound();
  return (
    <DetailFrame
      title={detail.subject}
      backHref="/admin/correo"
      facts={[
        { label: "Para", value: detail.to },
        { label: "Asunto", value: detail.subject },
        { label: "Encolado", value: row.data?.created_at ?? "" },
      ]}
      tabs={[{ value: "mensaje", label: "Mensaje" }]}
      active="mensaje"
    >
      <p>Este aviso solo se encola para quien ya terminó el perfil.</p>
    </DetailFrame>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/admin/correo/detail.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/admin/correo/detail.ts src/lib/admin/correo/detail.test.ts src/app/api/admin/correo/[id]/route.ts src/app/admin/correo/[id]/page.tsx
git commit -m "$(cat <<'EOF'
feat: detalle de un correo de innovación abierta

EOF
)"
```

---

### Task 26: Mesa enlazada al panel

**Files:**
- Create: `src/lib/admin/mesa/href.ts`
- Create: `src/lib/admin/mesa/href.test.ts`
- Modify: `src/app/mesa/page.tsx`

El href ya está en `src/components/admin/nav.ts`: `/mesa`. No edites ese archivo. No muevas la mesa a `/admin/mesa`. No llames `requireSuperadmin()` en la página: `e2e/mesa.spec.ts` entra sin sesión, llena `Código QR`, pulsa `Registrar llegada` y lee `bienvenida` y `estatus`. El formulario sigue en `scanDeskAction`.

- [ ] **Step 1: Write the failing test**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { adminLinks } from "@/components/admin/nav";
import { mesaHref } from "./href";

describe("mesa del panel", () => {
  it("usa el href que el sidebar ya tiene", () => {
    expect(mesaHref).toBe("/mesa");
    expect(adminLinks.find((link) => link.label === "Mesa")?.href).toBe(mesaHref);
  });

  it("la página conserva el escaneo del e2e", () => {
    const page = readFileSync("src/app/mesa/page.tsx", "utf8");
    expect(page).toContain("scanDeskAction");
    expect(page).toContain("Código QR");
    expect(page).toContain("Registrar llegada");
    expect(page).toContain('data-testid="bienvenida"');
    expect(page).toContain('data-testid="estatus"');
    expect(page).not.toContain("requireSuperadmin");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/admin/mesa/href.test.ts`

Expected: FAIL. No existe `./href`.

- [ ] **Step 3: Write minimal implementation**

`src/lib/admin/mesa/href.ts`

```ts
export const mesaHref = "/mesa";
```

En `src/app/mesa/page.tsx`, debajo del párrafo y antes del formulario, agrega el vínculo de regreso al panel. No quites el form, los testid ni `scanDeskAction`.

```tsx
import { mesaHref } from "@/lib/admin/mesa/href";

// dentro del grid, antes del form
<a href="/admin">Volver al panel</a>
<p data-testid="mesa-href">{mesaHref}</p>
```

`mesaHref` es `"/mesa"`. El párrafo solo documenta la ruta que el sidebar ya usa.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/admin/mesa/href.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/admin/mesa/href.ts src/lib/admin/mesa/href.test.ts src/app/mesa/page.tsx
git commit -m "$(cat <<'EOF'
feat: la mesa queda enlazada desde el panel

EOF
)"
```

---

### Task 27: Detalle del escaneo en la mesa

**Files:**
- Create: `src/lib/admin/mesa/record.ts`
- Create: `src/lib/admin/mesa/record.test.ts`
- Create: `src/app/api/admin/mesa/route.ts`
- Create: `src/app/mesa/[profileId]/page.tsx`

El escaneo de Supabase inserta `arrivals` una vez y, si el CRM está en `registrado`, inserta `crm_events.event = llegar`. Usa `arrivalPlan` de `src/lib/admin/pases/scan.ts`. El route llama `requireSuperadmin()`. La página `/mesa` del e2e no cambia de action. El detalle `/mesa/[profileId]` muestra el resultado cuando ya hay fila en `arrivals`.

- [ ] **Step 1: Write the failing test**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { recordArrival } from "./record";

describe("escaneo de la mesa", () => {
  it("escribe la llegada y el hecho llegar cuando el CRM está registrado", () => {
    expect(recordArrival({ hasPass: true, hasArrival: false, crmStatus: "registrado", profileId: "p1", scannedBy: "admin" })).toEqual({
      ok: true,
      arrival: { profile_id: "p1", scanned_by: "admin" },
      crmEvent: "llegar",
    });
    expect(recordArrival({ hasPass: true, hasArrival: true, crmStatus: "llego", profileId: "p1", scannedBy: "admin" })).toEqual({
      ok: false,
      reason: "ya llegó",
    });
    expect(recordArrival({ hasPass: false, hasArrival: false, crmStatus: null, profileId: "p1", scannedBy: "admin" })).toEqual({
      ok: false,
      reason: "sin qr",
    });
  });

  it("el handler inserta arrivals y el hecho llegar", () => {
    const source = readFileSync("src/app/api/admin/mesa/route.ts", "utf8");
    expect(source).toContain("await requireSuperadmin()");
    expect(source).toContain("recordArrival");
    expect(source).toContain('.from("arrivals")');
    expect(source).toContain('.from("crm_events")');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/admin/mesa/record.test.ts`

Expected: FAIL. No existe `./record`.

- [ ] **Step 3: Write minimal implementation**

`src/lib/admin/mesa/record.ts`

```ts
import type { CrmStatus } from "@/lib/crm-status";
import { arrivalPlan } from "@/lib/admin/pases/scan";

export function recordArrival(input: {
  hasPass: boolean;
  hasArrival: boolean;
  crmStatus: CrmStatus | null;
  profileId: string;
  scannedBy: string;
}) {
  const plan = arrivalPlan({
    hasPass: input.hasPass,
    hasArrival: input.hasArrival,
    crmStatus: input.crmStatus,
  });
  if (!plan.ok) return plan;
  return {
    ok: true as const,
    arrival: { profile_id: input.profileId, scanned_by: input.scannedBy },
    crmEvent: plan.crmEvent,
  };
}
```

`src/app/api/admin/mesa/route.ts`

```ts
import { adminDb } from "@/lib/admin/admin-db";
import { recordArrival } from "@/lib/admin/mesa/record";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import { readSuperadmin } from "@/lib/auth/require-superadmin";
import type { CrmStatus } from "@/lib/crm-status";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  await requireSuperadmin();
  const account = await readSuperadmin();
  const form = await request.formData();
  const profileId = String(form.get("codigo") ?? "").trim();
  const back = "/mesa";
  const db = await adminDb();
  if (!db || !account || !profileId) return NextResponse.redirect(new URL(`${back}?error=sin%20qr`, request.url));
  const [pass, arrival, actor, contact] = await Promise.all([
    db.from("passes").select("profile_id").eq("profile_id", profileId).maybeSingle(),
    db.from("arrivals").select("profile_id").eq("profile_id", profileId).maybeSingle(),
    db.from("profiles").select("id").eq("email", account.email).maybeSingle(),
    db.from("crm_contacts").select("id").eq("profile_id", profileId).maybeSingle(),
  ]);
  let crmStatus: CrmStatus | null = null;
  if (contact.data) {
    const status = await db.from("crm_contact_status").select("status").eq("contact_id", contact.data.id).maybeSingle();
    crmStatus = (status.data?.status as CrmStatus | null) ?? null;
  }
  const plan = recordArrival({
    hasPass: Boolean(pass.data),
    hasArrival: Boolean(arrival.data),
    crmStatus,
    profileId,
    scannedBy: actor.data?.id ?? "",
  });
  if (!plan.ok) return NextResponse.redirect(new URL(`${back}?codigo=${profileId}&error=${encodeURIComponent(plan.reason)}`, request.url));
  const inserted = await db.from("arrivals").insert(plan.arrival);
  if (inserted.error) return NextResponse.redirect(new URL(`${back}?error=${encodeURIComponent(inserted.error.message)}`, request.url));
  if (plan.crmEvent && contact.data) {
    await db.from("crm_events").insert({ contact_id: contact.data.id, event: plan.crmEvent, actor_id: actor.data?.id ?? null });
  }
  const profile = await db.from("profiles").select("full_name").eq("id", profileId).maybeSingle();
  return NextResponse.redirect(new URL(`/mesa/${profileId}?nombre=${encodeURIComponent(profile.data?.full_name ?? "")}`, request.url));
}
```

`src/app/mesa/[profileId]/page.tsx`

```tsx
import { notFound } from "next/navigation";
import { mesaHref } from "@/lib/admin/mesa/href";

export const instant = false;

export default async function MesaDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ profileId: string }>;
  searchParams: Promise<{ nombre?: string }>;
}) {
  const { profileId } = await params;
  const query = await searchParams;
  if (!profileId) notFound();
  return (
    <section className="container-site py-10">
      <a href={mesaHref}>Volver a la mesa</a>
      <h1 className="text-h1 text-ink">Llegada</h1>
      <p data-testid="bienvenida">Bienvenida, {query.nombre || profileId}</p>
      <p data-testid="estatus">Llegó</p>
    </section>
  );
}
```

No pongas `requireSuperadmin` en esta página. El e2e no la visita. El POST que escribe `arrivals` sí lo exige.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/admin/mesa/record.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/admin/mesa/record.ts src/lib/admin/mesa/record.test.ts src/app/api/admin/mesa/route.ts src/app/mesa/[profileId]/page.tsx
git commit -m "$(cat <<'EOF'
feat: el escaneo de la mesa escribe llegada y el hecho llegar

EOF
)"
```

---
