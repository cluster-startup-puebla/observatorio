# Empresas por sector Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** El superadmin abre `/admin/alimentos-y-bebidas` (y cualquier otro slug de sector) y ve las empresas de ese sector.

**Architecture:** No se crea `src/app/admin/[sector]`. Ese nivel ya lo ocupa `src/app/admin/[modulo]/page.tsx`, y Next no admite dos carpetas dinámicas hermanas. Las carpetas fijas (`/admin/empresas`, `/admin/sectores`, …) ganan sobre `[modulo]`, así que un slug de sector cae en `[modulo]`. Esa página, si el segmento no es un módulo, busca el sector por `slug` y lista sus empresas. Un sector sin cupo en la sesión, como Educación, también se lista. La página es un Server Component con `export const instant = false`. No se usa `force-dynamic`.

**Tech Stack:** Next.js 16, React Server Components, Supabase desde `adminDb()`, `DataList`, Vitest.

---

## Lo que hay hoy

`src/app/admin/[modulo]/page.tsx` exige superadmin y, si `adminModules` no tiene esa llave, responde 404. Los slugs reales (`alimentos-y-bebidas`, `educacion`, `plasticos-y-hule`) no son módulos, así que hoy 404.

`/admin/empresas` lista todas las empresas, paginadas de 20, con logo, razón social, tamaño, sector, quién convocó, llegada y aprobación. La fila sale de `toEmpresaRow`. El detalle sigue en `/admin/empresas/[id]`.

`companies.sector_id` apunta a `sectors`. `sectors.slug` es único. No hace falta migración.

## Archivos

- Crear: `src/lib/admin/sectores/segment.ts` — decide módulo, sector o 404.
- Crear: `src/lib/admin/sectores/segment.test.ts`
- Crear: `src/lib/admin/sectores/companies.ts` — carga el sector y sus empresas.
- Crear: `src/lib/admin/sectores/companies.test.ts`
- Crear: `src/app/admin/[modulo]/sector-companies.tsx` — la tabla.
- Modificar: `src/app/admin/[modulo]/page.tsx`

Cada archivo nuevo cabe en menos de 90 líneas. No se toca la lista general de `/admin/empresas`.

## Regla de la ruta

```ts
export type AdminSegment = "module" | "sector" | "missing";

export function adminSegment(slug: string, moduleKeys: readonly string[], sectorExists: boolean): AdminSegment {
  if (moduleKeys.includes(slug)) return "module";
  if (sectorExists) return "sector";
  return "missing";
}
```

Si algún día un slug de sector se llama igual que un módulo, gana el módulo. Hoy ninguno coincide.

La lista incluye toda empresa con ese `sector_id`, esté o no el sector en `session_sector_quotas`. Corporativo HAMA debe aparecer en `/admin/educacion`.

La razón social enlaza a `/admin/empresas/[id]`. No se repite la columna Sector.

## Task 1: Decidir el segmento

**Files:**
- Create: `src/lib/admin/sectores/segment.ts`
- Test: `src/lib/admin/sectores/segment.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { adminSegment } from "./segment";

const modules = ["empresas", "sectores"];

describe("segmento del admin", () => {
  it("un módulo gana aunque también exista un sector", () => {
    expect(adminSegment("empresas", modules, true)).toBe("module");
  });

  it("un slug de sector abre su lista", () => {
    expect(adminSegment("educacion", modules, true)).toBe("sector");
  });

  it("un slug desconocido no abre nada", () => {
    expect(adminSegment("no-existe", modules, false)).toBe("missing");
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `npx vitest run src/lib/admin/sectores/segment.test.ts`

Expected: FAIL because `./segment` does not exist.

- [ ] **Step 3: Write the function**

Put `adminSegment` in `src/lib/admin/sectores/segment.ts` exactly as in the rule above. Export the type too.

- [ ] **Step 4: Run the test and confirm it passes**

Run: `npx vitest run src/lib/admin/sectores/segment.test.ts`

Expected: 3 passed.

## Task 2: Cargar las empresas del sector

**Files:**
- Create: `src/lib/admin/sectores/companies.ts`
- Test: `src/lib/admin/sectores/companies.test.ts`

- [ ] **Step 1: Write the failing source test**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("empresas de un sector", () => {
  const source = readFileSync("src/lib/admin/sectores/companies.ts", "utf8");

  it("busca el sector por slug y pagina sus empresas", () => {
    expect(source).toContain('.from("sectors")');
    expect(source).toContain('.eq("slug", slug)');
    expect(source).toContain('.from("companies")');
    expect(source).toContain('.eq("sector_id", sector.id)');
    expect(source).toContain('.order("legal_name")');
    expect(source).toContain(".range(page.from, page.to)");
    expect(source).toContain('{ count: "exact" }');
    expect(source).toContain("toEmpresaRow");
    expect(source).not.toContain("session_sector_quotas");
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `npx vitest run src/lib/admin/sectores/companies.test.ts`

Expected: FAIL because the file does not exist.

- [ ] **Step 3: Write the loader**

```ts
import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { pageQuery } from "@/lib/admin/page-query";
import { companyOwner } from "@/lib/admin/empresas/company-owner";
import { ownerEmail } from "@/lib/admin/empresas/convener";
import { toEmpresaRow, type EmpresaSource } from "@/lib/admin/empresas/empresa-row";
import { loadLinkContacts } from "@/lib/admin/empresas/link-contacts";

export async function listSectorCompanies(slug: string, rawPage: string | undefined) {
  const page = pageQuery(rawPage);
  const db = await adminDb();
  if (!db) return null;
  const sector = await db.from("sectors").select("id, name, slug").eq("slug", slug).maybeSingle();
  if (sector.error) throw new Error(sector.error.message);
  if (!sector.data) return null;
  const result = await db
    .from("companies")
    .select(
      `id, legal_name, employee_band, sector_id, sector_source, admitted_at, referral_source, profile_id, sectors(name), owner:${companyOwner}(email)`,
      { count: "exact" },
    )
    .eq("sector_id", sector.data.id)
    .order("legal_name")
    .range(page.from, page.to);
  if (result.error) throw new Error(result.error.message);
  const data = result.data ?? [];
  const profileIds = data.map((row) => row.profile_id);
  const emails = data
    .map((row) => ownerEmail(row.owner as { email?: string } | { email?: string }[] | null))
    .filter(Boolean);
  const assets = profileIds.length
    ? await db.from("media_assets").select("profile_id").eq("purpose", "company_logo").in("profile_id", profileIds)
    : { data: [], error: null };
  if (assets.error) throw new Error(assets.error.message);
  const links = await loadLinkContacts(db, emails);
  const withLogo = new Set((assets.data ?? []).map((asset) => asset.profile_id));
  return {
    sector: sector.data,
    page: page.page,
    total: result.count ?? 0,
    rows: data.map((row) => toEmpresaRow(row as EmpresaSource, withLogo, links)),
  };
}
```

If this file passes 90 lines, move the asset and contact lookup into `src/lib/admin/sectores/company-extras.ts` and keep `listSectorCompanies` as the query plus the map.

- [ ] **Step 4: Run the test and confirm it passes**

Run: `npx vitest run src/lib/admin/sectores/companies.test.ts src/lib/admin/empresas/list.test.ts`

Expected: both files pass. The general empresas list is unchanged.

## Task 3: Pintar la lista en `/admin/[slug]`

**Files:**
- Create: `src/app/admin/[modulo]/sector-companies.tsx`
- Modify: `src/app/admin/[modulo]/page.tsx`
- Test: `src/lib/admin/sectores/companies.test.ts` (add one assertion)

- [ ] **Step 1: Extend the source test**

Add this case to `companies.test.ts`:

```ts
it("la página del módulo abre el sector y conserva el módulo", () => {
  const page = readFileSync("src/app/admin/[modulo]/page.tsx", "utf8");
  const screen = readFileSync("src/app/admin/[modulo]/sector-companies.tsx", "utf8");
  expect(page).toContain("export const instant = false");
  expect(page).toContain("adminSegment");
  expect(page).toContain("listSectorCompanies");
  expect(page).toContain("notFound()");
  expect(screen).toContain('href={`/admin/empresas/${row.id}`}');
  expect(screen).toContain("Razón social");
  expect(screen).not.toContain('label: "Sector"');
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `npx vitest run src/lib/admin/sectores/companies.test.ts`

Expected: FAIL on the page assertions.

- [ ] **Step 3: Write the screen**

`sector-companies.tsx` is a client component. It receives `name`, `slug`, `rows`, `page` and `total`. It renders `DataList` with `basePath={`/admin/${slug}`}`, lead `Empresas de este sector.`, and these columns: Logo, Razón social, Tamaño, Convocó, Llegada, Aprobación. The name column uses `render` and a `Link` to `/admin/empresas/${row.id}`. There is no create form and no `rowActions`.

- [ ] **Step 4: Branch the module page**

Keep the current module markup. Before it:

```ts
const kind = adminSegment(modulo, Object.keys(adminModules), false);
```

Do not call `adminSegment` with `sectorExists: false` and then stop. The page must load the sector only when the segment is not a module:

```ts
if (!adminModules[modulo]) {
  const data = await listSectorCompanies(modulo, query.page);
  if (!data) notFound();
  return (
    <SectorCompanies
      name={data.sector.name}
      slug={data.sector.slug}
      rows={data.rows}
      page={data.page}
      total={data.total}
    />
  );
}
```

`searchParams` is `Promise<{ page?: string }>`. `export const instant = false` stays. `requireSuperadmin()` stays first.

- [ ] **Step 5: Run the tests**

Run: `npx vitest run src/lib/admin/sectores/segment.test.ts src/lib/admin/sectores/companies.test.ts`

Expected: all passed.

- [ ] **Step 6: Check the live page**

With the app on `http://localhost:3000`, signed in as superadmin:

- `/admin/educacion` shows Corporativo HAMA and the title Educación.
- `/admin/alimentos-y-bebidas` shows the companies of that sector, including Licorera del Sur.
- A name opens `/admin/empresas/[id]`.
- `/admin/no-existe` is 404.
- `/admin/empresas` is still the full list.

## Fuera de este plan

Luis Aguirre y Jacqueline Patiño no aparecen en estas listas. Su correo es de director y todavía no tienen fila en `companies`. Esta pantalla solo lee empresas ya creadas.
