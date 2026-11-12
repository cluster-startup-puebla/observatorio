# Logo en la tabla de empresas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** En `/admin/empresas`, la primera columna es el logo guardado de esa empresa. Si no hay archivo, la celda muestra «—».

**Architecture:** `DataList` ya pinta una columna `image` con `FallbackImage`, igual que Organismos. El archivo vive en `media_assets` con `purpose = 'company_logo'`, ligado al `profile_id` de la empresa, dentro del bucket privado `company-logos`. La lista no embebe `media_assets` en el `select` que cuenta: eso inflaría el total. Pide los logos de los perfiles de la página en una segunda consulta y pone `/api/admin/empresas/{id}/logo` solo cuando hay archivo. Esa ruta hoy responde 404 si `show_logo_on_event` es falso; el panel debe ver el archivo aunque el empresario no haya pedido mostrarlo el día del evento. Las pantallas del evento no cambian: solo piden esa URL cuando el check está prendido.

**Tech Stack:** Next.js 16 App Router, Supabase, `FallbackImage`, vitest. Cada `.ts` o `.tsx` editado se queda en 90 líneas o menos. No hay migración SQL.

---

## Fuera de este plan

- Subir, reemplazar o borrar el logo desde la tabla.
- Una columna para el check «mostrar el día del evento». Eso ya está en el detalle.
- Cambiar quién aparece en la pestaña de logos de la sesión (`loadEventLogos` sigue exigiendo el check y un lugar confirmado).
- Hacer público el bucket `company-logos`.
- Tocar `src/components/ui/data-table.tsx` ni `src/components/admin/data-columns.tsx`. La celda de 32 px ya existe.

## Mapa de archivos

- Crear: `src/lib/admin/empresas/company-logo-src.ts`
- Crear: `src/lib/admin/empresas/company-logo-src.test.ts`
- Modificar: `src/app/api/admin/empresas/[id]/logo/route.ts`
- Modificar: `src/lib/admin/empresas/list.ts`
- Modificar: `src/lib/admin/empresas/list.test.ts`
- Modificar: `src/app/admin/empresas/empresas-list.tsx`

---

### Task 1: Decidir la URL del logo

**Files:**
- Create: `src/lib/admin/empresas/company-logo-src.ts`
- Test: `src/lib/admin/empresas/company-logo-src.test.ts`

Sin archivo, la celda no pide una imagen. Con archivo, apunta a la ruta que ya descarga el bucket.

- [ ] **Step 1: Escribir el test que falla**

Crear `src/lib/admin/empresas/company-logo-src.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { companyLogoSrc } from "./company-logo-src";

describe("logo de la empresa en la tabla", () => {
  it("omite la imagen cuando no hay archivo", () => {
    expect(companyLogoSrc("c1", false)).toBe("");
  });

  it("apunta a la ruta del panel cuando el archivo existe", () => {
    expect(companyLogoSrc("c1", true)).toBe("/api/admin/empresas/c1/logo");
  });
});
```

- [ ] **Step 2: Correr el test y verlo fallar**

Run: `npx vitest run src/lib/admin/empresas/company-logo-src.test.ts`

Expected: FAIL porque `company-logo-src` no existe.

- [ ] **Step 3: Implementar la URL**

Crear `src/lib/admin/empresas/company-logo-src.ts`:

```ts
export function companyLogoSrc(companyId: string, hasFile: boolean) {
  if (!hasFile) return "";
  return `/api/admin/empresas/${companyId}/logo`;
}
```

- [ ] **Step 4: Correr el test y verlo pasar**

Run: `npx vitest run src/lib/admin/empresas/company-logo-src.test.ts`

Expected: PASS, 2 tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/admin/empresas/company-logo-src.ts src/lib/admin/empresas/company-logo-src.test.ts
git commit -m "$(cat <<'EOF'
feat: point a company row at its stored logo

EOF
)"
```

---

### Task 2: Entregar el archivo aunque el check del evento esté apagado

**Files:**
- Modify: `src/app/api/admin/empresas/[id]/logo/route.ts`
- Test: `src/lib/admin/empresas/company-logo-src.test.ts`

La ruta sigue exigiendo superadmin y un `company_logo`. Deja de leer `show_logo_on_event`. El detalle y la pestaña de la sesión solo renderizan esta URL cuando ese check ya es verdadero, así que no muestran logos nuevos.

- [ ] **Step 1: Escribir el test que falla**

Agregar este caso a `src/lib/admin/empresas/company-logo-src.test.ts`:

```ts
import { readFileSync } from "node:fs";

it("el panel entrega el archivo sin pedir el check del evento", () => {
  const route = readFileSync("src/app/api/admin/empresas/[id]/logo/route.ts", "utf8");
  expect(route).toContain("await requireSuperadmin()");
  expect(route).toContain('eq("purpose", "company_logo")');
  expect(route).toContain('.from("company-logos")');
  expect(route).not.toContain("show_logo_on_event");
});
```

El import de `readFileSync` va junto a los imports del archivo, no dentro del `describe`.

- [ ] **Step 2: Correr el test y verlo fallar**

Run: `npx vitest run src/lib/admin/empresas/company-logo-src.test.ts`

Expected: FAIL porque la ruta todavía contiene `show_logo_on_event`.

- [ ] **Step 3: Quitar el check de la ruta**

Reemplazar `src/app/api/admin/empresas/[id]/logo/route.ts` por:

```ts
import { adminDb } from "@/lib/admin/admin-db";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  await requireSuperadmin();
  const { id } = await context.params;
  const db = await adminDb();
  if (!db) return new Response(null, { status: 404 });
  const company = await db.from("companies").select("profile_id").eq("id", id).maybeSingle();
  if (!company.data?.profile_id) return new Response(null, { status: 404 });
  const asset = await db
    .from("media_assets")
    .select("object_path, content_type")
    .eq("profile_id", company.data.profile_id)
    .eq("purpose", "company_logo")
    .maybeSingle();
  if (!asset.data?.object_path) return new Response(null, { status: 404 });
  const file = await db.storage.from("company-logos").download(asset.data.object_path);
  if (file.error || !file.data) return new Response(null, { status: 404 });
  return new Response(file.data, {
    headers: { "Content-Type": asset.data.content_type, "Cache-Control": "private, no-store" },
  });
}
```

- [ ] **Step 4: Correr el test y verlo pasar**

Run: `npx vitest run src/lib/admin/empresas/company-logo-src.test.ts`

Expected: PASS, 3 tests.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/admin/empresas/[id]/logo/route.ts src/lib/admin/empresas/company-logo-src.test.ts
git commit -m "$(cat <<'EOF'
feat: serve a company logo even when the event check is off

EOF
)"
```

---

### Task 3: Poner el logo como primera columna

**Files:**
- Modify: `src/lib/admin/empresas/list.ts`
- Modify: `src/lib/admin/empresas/list.test.ts`
- Modify: `src/app/admin/empresas/empresas-list.tsx`

La segunda consulta usa solo los `profile_id` de la página. Una empresa sin fila `company_logo` queda con `logo: ""` y `FallbackImage` pinta «—».

- [ ] **Step 1: Escribir el test que falla**

En `src/lib/admin/empresas/list.test.ts`, dentro del caso «la lista lee companies y el tamaño», agregar:

```ts
expect(list).toContain("profile_id");
expect(list).toContain('.from("media_assets")');
expect(list).toContain('eq("purpose", "company_logo")');
expect(list).toContain("companyLogoSrc");
expect(list).not.toContain("media_assets(");
const screen = readFileSync("src/app/admin/empresas/empresas-list.tsx", "utf8");
const logo = screen.indexOf('{ key: "logo", label: "Logo", image: true }');
const name = screen.indexOf('{ key: "legal_name", label: "Razón social" }');
expect(logo).toBeGreaterThan(-1);
expect(logo).toBeLessThan(name);
```

`readFileSync` ya está importado en ese archivo.

- [ ] **Step 2: Correr el test y verlo fallar**

Run: `npx vitest run src/lib/admin/empresas/list.test.ts`

Expected: FAIL porque `list.ts` no llama `companyLogoSrc` y la pantalla no tiene la columna `logo`.

- [ ] **Step 3: Pedir los logos de la página**

Reemplazar `src/lib/admin/empresas/list.ts` por:

```ts
import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { pageQuery } from "@/lib/admin/page-query";
import { bandLabel } from "./band-label";
import { companyLogoSrc } from "./company-logo-src";
import { externalApprovalLabel } from "./external-approval";
import { sectorSourceLabel } from "./sector-source";

export async function listEmpresas(rawPage: string | undefined) {
  const page = pageQuery(rawPage);
  const db = await adminDb();
  if (!db) return { page: page.page, rows: [] as Record<string, string>[], total: 0 };
  const result = await db
    .from("companies")
    .select("id, legal_name, employee_band, sector_id, sector_source, admitted_at, referral_source, profile_id, sectors(name)", { count: "exact" })
    .order("legal_name")
    .range(page.from, page.to);
  if (result.error) throw new Error(result.error.message);
  const data = result.data ?? [];
  const profileIds = data.map((row) => row.profile_id);
  const assets = profileIds.length
    ? await db.from("media_assets").select("profile_id").eq("purpose", "company_logo").in("profile_id", profileIds)
    : { data: [], error: null };
  if (assets.error) throw new Error(assets.error.message);
  const withLogo = new Set((assets.data ?? []).map((asset) => asset.profile_id));
  return {
    page: page.page,
    total: result.count ?? 0,
    rows: data.map((row) => {
      const sector = row.sectors as { name?: string } | { name?: string }[] | null;
      const name = Array.isArray(sector) ? sector[0]?.name : sector?.name;
      return {
        id: row.id,
        logo: companyLogoSrc(row.id, withLogo.has(row.profile_id)),
        legal_name: row.legal_name,
        employee_band: bandLabel(row.employee_band),
        band: row.employee_band,
        sector_name: name ?? "",
        sector_id: row.sector_id,
        referral_source: row.referral_source ?? "",
        sector_source: row.sector_source ?? "",
        llegada: sectorSourceLabel(row.sector_source ?? ""),
        aprobacion: externalApprovalLabel(row.sector_source ?? "", row.admitted_at),
      };
    }),
  };
}
```

Contar las líneas. Si pasan de 90, mover la consulta de `media_assets` a `src/lib/admin/empresas/page-logos.ts` y dejar `list.ts` llamándola. No partir el archivo si se queda en 90 o menos.

- [ ] **Step 4: Declarar la columna antes de la razón social**

En `src/app/admin/empresas/empresas-list.tsx`, el arreglo `columns` queda así:

```tsx
columns={[
  { key: "logo", label: "Logo", image: true },
  { key: "legal_name", label: "Razón social" },
  { key: "employee_band", label: "Tamaño" },
  { key: "sector_name", label: "Sector" },
  { key: "llegada", label: "Llegada" },
  { key: "aprobacion", label: "Aprobación" },
]}
```

No pases `imageAltKey`. Sin archivo, `FallbackImage` muestra «—», no el nombre de la empresa.

- [ ] **Step 5: Correr los tests**

Run: `npx vitest run src/lib/admin/empresas/list.test.ts src/lib/admin/empresas/company-logo-src.test.ts`

Expected: PASS.

- [ ] **Step 6: Verlo en el navegador**

Con la sesión de superadmin abierta, entra a `http://localhost:3000/admin/empresas`.

- La primera columna se llama Logo y queda antes de Razón social.
- Una empresa con `company_logo` muestra la imagen de 32 px.
- Una empresa sin archivo muestra «—» en esa celda.
- El pie sigue diciendo el total de empresas, no el número de logos.
- Abre una empresa que tenga el check apagado y archivo guardado: la tabla muestra el logo; el detalle sigue sin la imagen grande, porque esa pantalla todavía exige el check.

- [ ] **Step 7: Commit**

```bash
git add src/lib/admin/empresas/list.ts src/lib/admin/empresas/list.test.ts src/app/admin/empresas/empresas-list.tsx
git commit -m "$(cat <<'EOF'
feat: show the company logo as the first admin column

EOF
)"
```

Si el step 3 creó `page-logos.ts`, inclúyelo en este `git add`.
