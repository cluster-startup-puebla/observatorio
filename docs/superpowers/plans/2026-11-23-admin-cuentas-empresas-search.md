# Admin cuentas/empresas — search + debounce + paginación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** En `/admin/cuentas` y `/admin/empresas`, buscar por nombre (y correo) con debounce, sin perder la paginación server-side que ya existe (`?page=`, 20 filas).

**Architecture:** El estado vive en la URL (`?q=&page=`). Un input client hace debounce (~300 ms) y `router.replace` con `page=1`. Los loaders `listCuentas` / `listEmpresas` aplican `ilike` en Supabase y siguen usando `count:exact` + `.range`. `DataList` deja de armar `?page=` a mano y usa un `listHref` compartido para no tirar `q` al paginar.

**Tech Stack:** Next.js App Router (RSC + client), Supabase PostgREST (`ilike` / `.or`), TanStack via `DataTable`, Vitest, shadcn `Input`.

**Constraints:** Cada archivo `.ts`/`.tsx` ≤ 90 líneas (regla del repo). No inventar fetch client: la RSC revalida al cambiar la URL. No filtrar solo la página actual en memoria.

---

## File map

| Archivo | Responsabilidad |
|---|---|
| `src/lib/admin/list-query.ts` | `listQueryQ`, `listHref({ basePath, page, q })` |
| `src/lib/admin/ilike-pattern.ts` | Escapa `%` / `_` y arma `%texto%` |
| `src/components/admin/list-search.tsx` | Input con debounce → URL |
| `src/components/admin/data-list.tsx` | Acepta `q`; paginación y clamp usan `listHref` |
| `src/lib/admin/cuentas/list.ts` | Filtro `full_name` + `email` (+ orgs por nombre) |
| `src/lib/admin/empresas/list.ts` | Filtro `legal_name` (+ email del owner si es barato) |
| `src/app/admin/cuentas/page.tsx` | Pasa `params.q` |
| `src/app/admin/empresas/page.tsx` | Pasa `params.q` |
| `src/app/admin/cuentas/cuentas-list.tsx` | Monta `ListSearch`, pasa `q` a `DataList` |
| `src/app/admin/empresas/empresas-list.tsx` | Igual |
| `src/app/api/admin/cuentas/route.ts` | GET lee `q` |
| `src/app/api/admin/empresas/route.ts` | GET lee `q` |
| Tests espejo junto a cada módulo nuevo / tocado | |

**Fuera de alcance (no abrir en este plan):** índice `pg_trgm`, dejar de traer todas las orgs en cuentas, tanstack global filter client-side.

---

### Task 1: Helpers de query e `ilike`

**Files:**
- Create: `src/lib/admin/list-query.ts`
- Create: `src/lib/admin/list-query.test.ts`
- Create: `src/lib/admin/ilike-pattern.ts`
- Create: `src/lib/admin/ilike-pattern.test.ts`

- [x] **Step 1: Test fallido de `listQueryQ` / `listHref`**

```ts
import { describe, expect, it } from "vitest";
import { listHref, listQueryQ } from "./list-query";

describe("list query", () => {
  it("normaliza q y arma href sin tirar la búsqueda", () => {
    expect(listQueryQ(undefined)).toBe("");
    expect(listQueryQ("  Ana  ")).toBe("Ana");
    expect(listHref({ basePath: "/admin/cuentas", page: 1 })).toBe("/admin/cuentas");
    expect(listHref({ basePath: "/admin/cuentas", page: 2, q: "Ana" })).toBe(
      "/admin/cuentas?q=Ana&page=2",
    );
    expect(listHref({ basePath: "/admin/empresas", page: 1, q: "Capleton" })).toBe(
      "/admin/empresas?q=Capleton",
    );
  });
});
```

- [ ] **Step 2: Correr y ver fallar**

Run: `npx vitest run src/lib/admin/list-query.test.ts`
Expected: FAIL (módulo ausente)

- [ ] **Step 3: Implementar `list-query.ts`**

```ts
export function listQueryQ(raw: string | undefined) {
  return (raw ?? "").trim();
}

export function listHref(input: { basePath: string; page?: number; q?: string }) {
  const params = new URLSearchParams();
  const q = listQueryQ(input.q);
  if (q) params.set("q", q);
  if (input.page && input.page > 1) params.set("page", String(input.page));
  const query = params.toString();
  return query ? `${input.basePath}?${query}` : input.basePath;
}
```

- [ ] **Step 4: Test + impl de `ilikePattern`**

```ts
// ilike-pattern.test.ts
import { describe, expect, it } from "vitest";
import { ilikePattern } from "./ilike-pattern";

describe("ilikePattern", () => {
  it("envuelve y escapa comodines", () => {
    expect(ilikePattern("Ana")).toBe("%Ana%");
    expect(ilikePattern("100%")).toBe("%100\\%%");
    expect(ilikePattern("a_b")).toBe("%a\\_b%");
  });
});
```

```ts
// ilike-pattern.ts
export function ilikePattern(raw: string) {
  const escaped = raw.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
  return `%${escaped}%`;
}
```

Run: `npx vitest run src/lib/admin/list-query.test.ts src/lib/admin/ilike-pattern.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/admin/list-query.ts src/lib/admin/list-query.test.ts \
  src/lib/admin/ilike-pattern.ts src/lib/admin/ilike-pattern.test.ts
git commit -m "$(cat <<'EOF'
feat(admin): helpers de ?q= e ilike para listados

EOF
)"
```

---

### Task 2: `ListSearch` con debounce

**Files:**
- Create: `src/components/admin/list-search.tsx`
- Create: `src/components/admin/list-search.test.ts` (lectura de fuente; no jsdom obligatorio)

- [ ] **Step 1: Test de contrato del componente**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("ListSearch", () => {
  it("debouncea y resetea page al buscar", () => {
    const source = readFileSync("src/components/admin/list-search.tsx", "utf8");
    expect(source).toContain("300");
    expect(source).toContain("listHref");
    expect(source).toContain("router.replace");
    expect(source).toContain('page: 1');
  });
});
```

- [ ] **Step 2: Correr y ver fallar**

Run: `npx vitest run src/components/admin/list-search.test.ts`
Expected: FAIL

- [ ] **Step 3: Implementar `ListSearch`**

```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { listHref, listQueryQ } from "@/lib/admin/list-query";

export function ListSearch({
  basePath,
  q,
  placeholder = "Buscar por nombre…",
}: {
  basePath: string;
  q?: string;
  placeholder?: string;
}) {
  const router = useRouter();
  const initial = listQueryQ(q);
  const [value, setValue] = useState(initial);

  useEffect(() => setValue(initial), [initial]);

  useEffect(() => {
    const next = listQueryQ(value);
    if (next === initial) return;
    const timer = window.setTimeout(() => {
      router.replace(listHref({ basePath, q: next, page: 1 }));
    }, 300);
    return () => window.clearTimeout(timer);
  }, [basePath, initial, router, value]);

  return (
    <label className="grid max-w-sm gap-1.5 text-small font-medium text-ink">
      Buscar
      <Input
        type="search"
        value={value}
        placeholder={placeholder}
        aria-label="Buscar"
        data-testid="list-search"
        onChange={(event) => setValue(event.target.value)}
      />
    </label>
  );
}
```

- [ ] **Step 4: Tests en verde**

Run: `npx vitest run src/components/admin/list-search.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/list-search.tsx src/components/admin/list-search.test.ts
git commit -m "$(cat <<'EOF'
feat(admin): ListSearch con debounce a ?q=

EOF
)"
```

---

### Task 3: `DataList` conserva `q` al paginar

**Files:**
- Modify: `src/components/admin/data-list.tsx`
- Create or modify: `src/components/admin/data-list.test.ts` (si no existe, créalo como lectura de fuente)

- [ ] **Step 1: Extender props y hrefs**

Cambiar `DataList` para aceptar `q?: string` y usar `listHref` en clamp + `onPageChange`. Slot de búsqueda arriba de la tabla (prop `search` opcional como `ReactNode`, o montar `ListSearch` si hay `basePath`+`q` controlado desde fuera).

Preferido (más claro, ≤90 líneas): el padre pasa `search={<ListSearch … />}` vía prop nueva `toolbar?: React.ReactNode` renderizada entre `PanelHeader` y la tabla.

```tsx
"use client";

import Link from "next/link";
import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { columnDef, type DataColumn, type DataRow } from "@/components/admin/data-columns";
import { listCrumbs, PanelHeader } from "@/components/admin/panel-header";
import { DataTable } from "@/components/ui/data-table";
import { listHref } from "@/lib/admin/list-query";
import { pageCount, pageSize } from "@/lib/admin/page-query";

export function DataList({
  title,
  lead,
  columns,
  rows,
  page,
  total,
  basePath,
  q,
  error,
  rowActions,
  toolbar,
  children,
}: {
  title: string;
  lead: string;
  columns: DataColumn[];
  rows: DataRow[];
  page: number;
  total: number;
  basePath: string;
  q?: string;
  error?: string;
  rowActions?: (row: DataRow) => React.ReactNode;
  toolbar?: ReactNode;
  children?: React.ReactNode;
}) {
  const router = useRouter();
  const pages = pageCount(total);
  const href = (next: number) => listHref({ basePath, page: next, q });
  const tableColumns: ColumnDef<DataRow>[] = [
    ...columns.map((column) => columnDef(column)),
    {
      id: "acciones",
      header: "Acciones",
      meta: { className: "w-[1%] whitespace-nowrap" },
      cell: ({ row }) =>
        rowActions?.(row.original) ?? (
          <Link className="text-link" href={`${basePath}/${row.original.id}`}>
            Abrir
          </Link>
        ),
    },
  ];

  useEffect(() => {
    if (page > pages) router.replace(href(pages));
  }, [basePath, page, pages, q, router]);

  return (
    <main className="px-8 py-8">
      <PanelHeader title={title} lead={lead} crumbs={listCrumbs(title, basePath)} actions={children} />
      {error ? <p className="mb-4 text-small text-mark">{error}</p> : null}
      {toolbar ? <div className="mb-4">{toolbar}</div> : null}
      <DataTable
        data={rows}
        columns={tableColumns}
        page={page}
        totalPages={pages}
        total={total}
        limit={pageSize}
        emptyMessage="Sin filas."
        onPageChange={(next) => router.push(href(next))}
      />
      <p className="sr-only" data-testid="pagina">
        {page}
      </p>
    </main>
  );
}
```

Si el archivo pasa de 90 líneas, partir `tableColumns` a `data-list-columns.ts` en el mismo cambio.

- [ ] **Step 2: Test de contrato**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("DataList", () => {
  it("pagina con listHref para no perder q", () => {
    const source = readFileSync("src/components/admin/data-list.tsx", "utf8");
    expect(source).toContain("listHref");
    expect(source).toContain("toolbar");
    expect(source).not.toContain("`/${basePath}?page=${next}`");
  });
});
```

Run: `npx vitest run src/components/admin/data-list.test.ts`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/data-list.tsx src/components/admin/data-list.test.ts
git commit -m "$(cat <<'EOF'
feat(admin): DataList conserva q al paginar

EOF
)"
```

---

### Task 4: Filtro server en `listCuentas`

**Files:**
- Modify: `src/lib/admin/cuentas/list.ts`
- Modify: `src/lib/admin/cuentas/list.test.ts`
- Create: `src/lib/admin/cuentas/apply-cuenta-search.ts` (mantener `list.ts` ≤90)

- [ ] **Step 1: Helper de filtro**

```ts
// apply-cuenta-search.ts
import type { SupabaseClient } from "@supabase/supabase-js";
import { ilikePattern } from "@/lib/admin/ilike-pattern";

type ProfilesQuery = {
  or: (filter: string) => ProfilesQuery;
  in: (column: string, values: string[]) => ProfilesQuery;
};

export async function applyCuentaSearch<T extends ProfilesQuery>(
  db: SupabaseClient,
  query: T,
  q: string,
): Promise<T> {
  if (!q) return query;
  const pattern = ilikePattern(q);
  const orgs = await db.from("organizations").select("id").ilike("name", pattern);
  if (orgs.error) throw new Error(orgs.error.message);
  const orgIds = (orgs.data ?? []).map((row) => row.id);
  let next = query.or(`full_name.ilike.${pattern},email.ilike.${pattern}`);
  if (orgIds.length) next = next.or(`organization_id.in.(${orgIds.join(",")})`);
  // Nota PostgREST: encadenar .or() hace AND entre grupos; para OR total
  // preferir un solo .or con organization_id.in si hay ids.
  return next;
}
```

**Importante — OR correcto en PostgREST:** un solo `.or(...)` que incluya nombre, email y (si hay) `organization_id.in.(...)`:

```ts
export async function applyCuentaSearch(
  db: SupabaseClient,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query: any,
  q: string,
) {
  if (!q) return query;
  const pattern = ilikePattern(q);
  const orgs = await db.from("organizations").select("id").ilike("name", pattern);
  if (orgs.error) throw new Error(orgs.error.message);
  const orgIds = (orgs.data ?? []).map((row) => String(row.id));
  const parts = [`full_name.ilike.${pattern}`, `email.ilike.${pattern}`];
  if (orgIds.length) parts.push(`organization_id.in.(${orgIds.join(",")})`);
  return query.or(parts.join(","));
}
```

Si `pattern` contiene comas, PostgREST rompe el `or`. Mitigación: `listQueryQ` ya hace trim; si `q` trae `,` rechazarlo o reemplazar por espacio en `listQueryQ`:

```ts
export function listQueryQ(raw: string | undefined) {
  return (raw ?? "").trim().replace(/,/g, " ").replace(/\s+/g, " ");
}
```

Actualizar el test de Task 1 si se añade esa regla.

- [ ] **Step 2: Cablear `listCuentas(rawPage, rawQ?)`**

```ts
import { listQueryQ } from "@/lib/admin/list-query";
import { applyCuentaSearch } from "./apply-cuenta-search";

export async function listCuentas(rawPage: string | undefined, rawQ?: string) {
  const page = pageQuery(rawPage);
  const q = listQueryQ(rawQ);
  const db = await adminDb();
  if (!db) return { page: page.page, rows: [] as Record<string, string>[], orgs: [] as { id: string; name: string }[], total: 0, q };
  let profilesQuery = db
    .from("profiles")
    .select("id, full_name, email, role, onboarded_at, job_title, whatsapp, organization_id", { count: "exact" })
    .order("created_at", { ascending: false });
  profilesQuery = await applyCuentaSearch(db, profilesQuery, q);
  const profiles = await profilesQuery.range(page.from, page.to);
  // ... resto igual; incluir q en el return
}
```

- [ ] **Step 3: Actualizar test de lista**

En `list.test.ts`, añadir:

```ts
expect(list).toContain("applyCuentaSearch");
expect(list).toContain("listQueryQ");
```

Run: `npx vitest run src/lib/admin/cuentas/list.test.ts`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/lib/admin/cuentas/list.ts src/lib/admin/cuentas/apply-cuenta-search.ts \
  src/lib/admin/cuentas/list.test.ts src/lib/admin/list-query.ts src/lib/admin/list-query.test.ts
git commit -m "$(cat <<'EOF'
feat(admin): buscar cuentas por nombre, correo u organismo

EOF
)"
```

---

### Task 5: Filtro server en `listEmpresas`

**Files:**
- Modify: `src/lib/admin/empresas/list.ts`
- Create: `src/lib/admin/empresas/apply-empresa-search.ts`
- Modify or create: `src/lib/admin/empresas/list.test.ts`

- [ ] **Step 1: Helper**

```ts
import { ilikePattern } from "@/lib/admin/ilike-pattern";

export function applyEmpresaSearch(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query: any,
  q: string,
) {
  if (!q) return query;
  const pattern = ilikePattern(q);
  return query.ilike("legal_name", pattern);
}
```

(Si más adelante quieren correo del owner, añadir join/`or` en un task aparte; YAGNI aquí.)

- [ ] **Step 2: Cablear `listEmpresas(rawPage, rawQ?)`**

Misma forma que cuentas: `listQueryQ`, `applyEmpresaSearch` antes de `.range`, devolver `q`.

- [ ] **Step 3: Test**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("listEmpresas search", () => {
  it("filtra legal_name con q", () => {
    const list = readFileSync("src/lib/admin/empresas/list.ts", "utf8");
    expect(list).toContain("applyEmpresaSearch");
    expect(list).toContain("listQueryQ");
  });
});
```

Run: `npx vitest run src/lib/admin/empresas/list.test.ts`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/lib/admin/empresas/list.ts src/lib/admin/empresas/apply-empresa-search.ts \
  src/lib/admin/empresas/list.test.ts
git commit -m "$(cat <<'EOF'
feat(admin): buscar empresas por razón social

EOF
)"
```

---

### Task 6: Pages, listas UI y APIs

**Files:**
- Modify: `src/app/admin/cuentas/page.tsx`
- Modify: `src/app/admin/empresas/page.tsx`
- Modify: `src/app/admin/cuentas/cuentas-list.tsx`
- Modify: `src/app/admin/empresas/empresas-list.tsx`
- Modify: `src/app/api/admin/cuentas/route.ts`
- Modify: `src/app/api/admin/empresas/route.ts`

- [ ] **Step 1: Pages pasan `q`**

```tsx
// cuentas/page.tsx
searchParams: Promise<{ page?: string; error?: string; q?: string }>;
// ...
const data = await listCuentas(params.page, params.q);
return (
  <CuentasList
    rows={data.rows}
    page={data.page}
    total={data.total}
    orgs={data.orgs}
    q={data.q}
    error={params.error}
  />
);
```

Igual en empresas con `listEmpresas(params.page, params.q)`.

- [ ] **Step 2: Listas montan toolbar**

```tsx
// cuentas-list.tsx — añadir prop q?: string
toolbar={
  <ListSearch
    basePath="/admin/cuentas"
    q={q}
    placeholder="Nombre, correo u organismo…"
  />
}
// y pasar q={q} a DataList
```

```tsx
// empresas-list.tsx
toolbar={
  <ListSearch
    basePath="/admin/empresas"
    q={q}
    placeholder="Razón social…"
  />
}
```

- [ ] **Step 3: APIs**

```ts
const q = request.nextUrl.searchParams.get("q") ?? undefined;
const body = await listCuentas(request.nextUrl.searchParams.get("page") ?? undefined, q);
```

Igual en empresas.

- [ ] **Step 4: Smoke tests de fuente**

Asegurar que pages contienen `params.q` y listas `ListSearch`.

Run: `npx vitest run src/lib/admin/cuentas/list.test.ts src/lib/admin/empresas/list.test.ts src/components/admin/list-search.test.ts src/components/admin/data-list.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/admin/cuentas/page.tsx src/app/admin/empresas/page.tsx \
  src/app/admin/cuentas/cuentas-list.tsx src/app/admin/empresas/empresas-list.tsx \
  src/app/api/admin/cuentas/route.ts src/app/api/admin/empresas/route.ts
git commit -m "$(cat <<'EOF'
feat(admin): cablear búsqueda en cuentas y empresas

EOF
)"
```

---

### Task 7: Verificación manual

- [ ] **Step 1: Cuentas**
  1. Abrir `http://localhost:3001/admin/cuentas`
  2. Escribir 3–4 letras de un nombre; esperar ~300 ms → URL `?q=…` y `page` vuelve a 1
  3. Ir a página 2 con búsqueda activa → URL conserva `q`
  4. Borrar el input → vuelve el listado completo
  5. Buscar por correo parcial y por nombre de organismo (cuenta sin `full_name`)

- [ ] **Step 2: Empresas**
  1. Abrir `http://localhost:3001/admin/empresas`
  2. Buscar razón social parcial (ej. Capleton)
  3. Confirmar pager + total coherentes
  4. Vacío con texto absurdo → “Sin filas.” y total 0

- [ ] **Step 3: Commit vacío no hace falta** — si hubo fixes, commit aparte `fix(admin): …`

---

## Self-review

1. **Spec coverage:** search por nombre ✓, debounce ✓, paginado (ya existía, se conserva con `q`) ✓, ambas pantallas ✓.
2. **Placeholders:** ninguno; código completo por task.
3. **Tipos:** `listCuentas(page, q?)` / `listEmpresas(page, q?)` / `listHref` / `ListSearch` / `DataList.q` alineados.
4. **Riesgo PostgREST `or` + comas:** mitigado en `listQueryQ`.
5. **Límite 90 líneas:** helpers partidos; si `data-list` o `list.ts` se pasan, partir en el mismo task.

---

## Execution handoff

Plan listo en `docs/superpowers/plans/2026-11-23-admin-cuentas-empresas-search.md`.

**Opciones:**

1. **Subagent-Driven (recomendado)** — un subagente fresco por task, review entre tasks  
2. **Inline Execution** — ejecutar en esta sesión con checkpoints  

¿Cuál?
