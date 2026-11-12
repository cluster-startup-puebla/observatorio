# Conteo completo de las tablas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cada tabla del panel pide el conteo real, muestra 20 filas por página y el pie dice el total, por ejemplo «17 registros · página 1 de 1».

**Architecture:** `pageSize` pasa de 10 a 20. Cada lista de Supabase pide `{ count: "exact" }` en la misma consulta que ya pagina, y devuelve `total`. `DataList` y el CRM calculan las páginas con `pageCount(total)`. Ya no adivinan que hay otra página porque la actual vino llena. `data-table.tsx` no se toca: ya imprime `total` y `totalPages`, y tiene más de 90 líneas. `read-pages.ts` se queda en 1000: eso alimenta el tablero, no estas tablas.

**Tech Stack:** Next.js 16 App Router, Supabase `count: "exact"`, vitest. Cada `.ts` o `.tsx` editado se queda en 90 líneas o menos.

---

## Fuera de este plan

- Cambiar el tamaño de página del tablero (`src/lib/admin/tablero/read-pages.ts`).
- Paginar la vista de tarjetas del CRM. Esa vista sigue pidiendo todas las filas con `all: true`.
- Un selector para que la persona elija 10, 20 o 50.

## Mapa de archivos

- Modificar: `src/lib/admin/page-query.ts`
- Modificar: `src/lib/admin/contract.test.ts`
- Crear: `src/lib/admin/page-count.test.ts`
- Modificar: `src/components/admin/data-list.tsx`
- Modificar: `src/app/admin/crm/crm-list.tsx`
- Modificar: `src/app/admin/crm/page.tsx`
- Modificar: `src/lib/admin/crm/list.ts`
- Modificar: `src/lib/admin/organismos/memory.ts`
- Modificar las listas y sus pantallas que usan `DataList`.

---

### Task 1: Veinte filas y el número de páginas

**Files:**
- Modify: `src/lib/admin/page-query.ts`
- Modify: `src/lib/admin/contract.test.ts`
- Create: `src/lib/admin/page-count.test.ts`

- [ ] **Step 1: Escribir el test que falla**

Reemplazar las expectativas de tamaño en `src/lib/admin/contract.test.ts`:

```ts
expect(pageQuery(undefined)).toEqual({ page: 1, from: 0, to: 19, size: 20 });
expect(pageQuery("2")).toEqual({ page: 2, from: 20, to: 39, size: 20 });
expect(pageQuery("0")).toEqual({ page: 1, from: 0, to: 19, size: 20 });
expect(pageQuery("no")).toEqual({ page: 1, from: 0, to: 19, size: 20 });
```

Cambiar el nombre del caso a «pide 20 filas y un tab desconocido cae al primero».

Crear `src/lib/admin/page-count.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { pageCount } from "./page-query";

describe("páginas de una tabla", () => {
  it("cuenta páginas de 20 y deja una página vacía en cero", () => {
    expect(pageCount(0)).toBe(1);
    expect(pageCount(17)).toBe(1);
    expect(pageCount(20)).toBe(1);
    expect(pageCount(21)).toBe(2);
    expect(pageCount(40)).toBe(2);
  });
});
```

- [ ] **Step 2: Correr los tests y verlos fallar**

Run: `npx vitest run src/lib/admin/contract.test.ts src/lib/admin/page-count.test.ts`

Expected: FAIL. `pageQuery` sigue en 10 y `pageCount` no existe.

- [ ] **Step 3: Implementar**

`src/lib/admin/page-query.ts` queda así:

```ts
export const pageSize = 20;

export function pageQuery(raw: string | undefined) {
  const parsed = Number(raw);
  const page = Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
  const from = (page - 1) * pageSize;
  return { page, from, to: from + pageSize - 1, size: pageSize };
}

export function pageCount(total: number) {
  if (total < 1) return 1;
  return Math.ceil(total / pageSize);
}
```

- [ ] **Step 4: Correr los tests**

Run: `npx vitest run src/lib/admin/contract.test.ts src/lib/admin/page-count.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/admin/page-query.ts src/lib/admin/contract.test.ts src/lib/admin/page-count.test.ts
git commit -m "$(cat <<'EOF'
feat: page admin tables at 20 rows

EOF
)"
```

---

### Task 2: El pie usa el total, no las filas de la página

**Files:**
- Modify: `src/components/admin/data-list.tsx`
- Test: `src/lib/admin/page-count.test.ts`

`total={rows.length}` es el defecto de hoy. Por eso la página 1 dice 10 y la página 2 dice 7. El componente debe recibir el total del catálogo.

- [ ] **Step 1: Escribir el test que falla**

Agregar en `src/lib/admin/page-count.test.ts`:

```ts
import { readFileSync } from "node:fs";

it("la lista pinta el total y no adivina otra página", () => {
  const source = readFileSync("src/components/admin/data-list.tsx", "utf8");
  expect(source).toContain("pageCount(total)");
  expect(source).toContain("total={total}");
  expect(source).toContain("limit={pageSize}");
  expect(source).not.toContain("rows.length");
  expect(source).toContain("router.replace");
});
```

- [ ] **Step 2: Correr el test y verlo fallar**

Run: `npx vitest run src/lib/admin/page-count.test.ts`

Expected: FAIL porque `data-list.tsx` usa `rows.length`.

- [ ] **Step 3: Implementar**

En `src/components/admin/data-list.tsx`, importar `useEffect` desde `react` y `pageCount, pageSize` desde `@/lib/admin/page-query`.

Agregar `total` a las props, tipo `number`. Calcular:

```tsx
const pages = pageCount(total);

useEffect(() => {
  if (page > pages) router.replace(`${basePath}?page=${pages}`);
}, [basePath, page, pages, router]);
```

En `DataTable`:

```tsx
page={page}
totalPages={pages}
total={total}
limit={pageSize}
```

Quitar `const totalPages = rows.length >= 10 ? page + 1 : page`.

Si `page=2` y el total cabe en una página, el efecto regresa a `?page=1`. Eso evita la página vacía al pasar de 10 a 20.

- [ ] **Step 4: Correr el test**

Run: `npx vitest run src/lib/admin/page-count.test.ts`

Expected: PASS. `data-list.tsx` sigue en 90 líneas o menos.

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/data-list.tsx src/lib/admin/page-count.test.ts
git commit -m "$(cat <<'EOF'
feat: show the full row count under admin tables

EOF
)"
```

---

### Task 3: Cada lista de Supabase devuelve el conteo

**Files:**
- Modify: `src/lib/admin/sectores/list.ts`
- Modify: `src/lib/admin/empresas/list.ts`
- Modify: `src/lib/admin/medios/list.ts`
- Modify: `src/lib/admin/metodologia/list.ts`
- Modify: `src/lib/admin/pases/list.ts`
- Modify: `src/lib/admin/bandeja/list.ts`
- Modify: `src/lib/admin/innovacion/list.ts`
- Modify: `src/lib/admin/invitaciones/list.ts`
- Modify: `src/lib/admin/cuentas/list.ts`
- Modify: `src/lib/admin/sesiones/list.ts`
- Modify: `src/lib/admin/organismos/list.ts`
- Modify: `src/lib/admin/organismos/memory.ts`
- Test: `src/lib/admin/sectores/list.test.ts` y el test de cada lista que ya lee el archivo

El conteo va en la misma consulta cuando el embed es a lo más uno. `sector_pages` es uno a uno. `sectors(name)` en empresas también. `session_sector_quotas` y `media_assets` son uno a muchos: un `count` junto a ese embed puede contar los hijos. Esas dos listas piden el conteo aparte, sin el embed.

- [ ] **Step 1: Escribir el test que falla**

En `src/lib/admin/sectores/list.test.ts`, dentro del caso existente, agregar:

```ts
expect(list).toContain('{ count: "exact" }');
expect(list).toContain("total: result.count ?? 0");
expect(list).toContain("total: 0");
```

Repetir la misma expectativa de `count: "exact"` en los tests que ya leen estas listas: `empresas/list.test.ts`, `medios/list.test.ts`, `pases/list.test.ts`, `bandeja/list.test.ts`, `invitaciones/list.test.ts`, `cuentas/list.test.ts`. Si el archivo no tiene test, no lo crees solo para la frase.

Para sesiones, en `src/lib/admin/sesiones/list.test.ts` agregar:

```ts
expect(list).toContain('.from("sessions")');
expect(list).toContain('{ count: "exact", head: true }');
expect(list).toContain("total");
```

Para organismos, en `src/lib/admin/organismos/list.test.ts` agregar:

```ts
expect(list).toContain('{ count: "exact", head: true }');
expect(list).toContain("total");
```

Y en un caso nuevo del mismo archivo, o en `page-count.test.ts` si organismos no lee `memory.ts`:

```ts
const memory = readFileSync("src/lib/admin/organismos/memory.ts", "utf8");
expect(memory).toContain("total: all.length");
```

- [ ] **Step 2: Correr un test y verlo fallar**

Run: `npx vitest run src/lib/admin/sectores/list.test.ts`

Expected: FAIL porque `list.ts` no contiene `{ count: "exact" }`.

- [ ] **Step 3: Pedir el conteo en cada retorno**

En cada lista de una sola consulta, el `select` recibe el conteo y los dos retornos incluyen `total`. Ejemplo de sectores. El mismo cambio aplica a empresas, medios, metodología, pases, bandeja, innovación, invitaciones y cuentas: conservar columnas, orden y `.range(page.from, page.to)`.

```ts
if (!db) return { page: page.page, rows: [] as Record<string, string>[], total: 0 };
const result = await db
  .from("sectors")
  .select("id, slug, name, position, sector_pages(headline, body)", { count: "exact" })
  .order("position")
  .range(page.from, page.to);
```

El objeto que ya regresan las filas suma `total: result.count ?? 0`. Invitaciones y cuentas también regresan `orgs`; el `total` se agrega al lado, no reemplaza `orgs`. Si el retorno sin base de datos ya trae `orgs: []`, agregar `total: 0` ahí también.

Sesiones, antes del `select` con cupos:

```ts
const counted = await db.from("sessions").select("id", { count: "exact", head: true });
if (counted.error) throw new Error(counted.error.message);
```

El retorno sin base de datos y el retorno con filas incluyen `total: counted.count ?? 0`. El `select` largo de la sesión no lleva `count`.

Organismos, antes del `select` con `media_assets`:

```ts
const counted = await db.from("organizations").select("id", { count: "exact", head: true });
if (counted.error) throw new Error(counted.error.message);
```

Retornos con `total: 0` o `total: counted.count ?? 0`. El `select` de las filas no lleva `count`.

Memoria, en `memoryListOrganismos`:

```ts
return { page: page.page, rows: all.slice(page.from, page.to + 1).map(row), total: all.length };
```

- [ ] **Step 4: Correr los tests de listas**

Run: `npx vitest run src/lib/admin/sectores/list.test.ts src/lib/admin/empresas/list.test.ts src/lib/admin/medios/list.test.ts src/lib/admin/pases/list.test.ts src/lib/admin/bandeja/list.test.ts src/lib/admin/invitaciones/list.test.ts src/lib/admin/cuentas/list.test.ts src/lib/admin/sesiones/list.test.ts src/lib/admin/organismos/list.test.ts src/lib/admin/page-count.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/admin/sectores/list.ts src/lib/admin/empresas/list.ts src/lib/admin/medios/list.ts src/lib/admin/metodologia/list.ts src/lib/admin/pases/list.ts src/lib/admin/bandeja/list.ts src/lib/admin/innovacion/list.ts src/lib/admin/invitaciones/list.ts src/lib/admin/cuentas/list.ts src/lib/admin/sesiones/list.ts src/lib/admin/organismos/list.ts src/lib/admin/organismos/memory.ts src/lib/admin/sectores/list.test.ts src/lib/admin/empresas/list.test.ts src/lib/admin/medios/list.test.ts src/lib/admin/pases/list.test.ts src/lib/admin/bandeja/list.test.ts src/lib/admin/invitaciones/list.test.ts src/lib/admin/cuentas/list.test.ts src/lib/admin/sesiones/list.test.ts src/lib/admin/organismos/list.test.ts src/lib/admin/page-count.test.ts
git commit -m "$(cat <<'EOF'
feat: return the full count from each admin list

EOF
)"
```

---

### Task 4: Pasar el total a cada pantalla

**Files:**
- Modify: `src/app/admin/sectores/sectores-list.tsx`
- Modify: `src/app/admin/sectores/page.tsx`
- Modify: `src/app/admin/empresas/empresas-list.tsx` y `src/app/admin/empresas/page.tsx`
- Modify: `src/app/admin/medios/medios-list.tsx` y `src/app/admin/medios/page.tsx`
- Modify: `src/app/admin/metodologia/metodologia-list.tsx` y `src/app/admin/metodologia/page.tsx`
- Modify: `src/app/admin/pases/pases-list.tsx` y `src/app/admin/pases/page.tsx`
- Modify: `src/app/admin/bandeja/bandeja-list.tsx` y `src/app/admin/bandeja/page.tsx`
- Modify: `src/app/admin/innovacion/innovacion-list.tsx` y `src/app/admin/innovacion/page.tsx`
- Modify: `src/app/admin/invitaciones/invitaciones-list.tsx` y `src/app/admin/invitaciones/page.tsx`
- Modify: `src/app/admin/cuentas/cuentas-list.tsx` y `src/app/admin/cuentas/page.tsx`
- Modify: `src/app/admin/sesiones/sesiones-list.tsx` y `src/app/admin/sesiones/page.tsx`
- Modify: `src/app/admin/organismos/organismos-list.tsx` y `src/app/admin/organismos/page.tsx`
- Test: `src/lib/admin/page-count.test.ts`

- [ ] **Step 1: Escribir el test que falla**

Agregar:

```ts
it("cada pantalla del panel entrega el total a su lista", () => {
  const pages = [
    "src/app/admin/sectores/page.tsx",
    "src/app/admin/empresas/page.tsx",
    "src/app/admin/medios/page.tsx",
    "src/app/admin/metodologia/page.tsx",
    "src/app/admin/pases/page.tsx",
    "src/app/admin/bandeja/page.tsx",
    "src/app/admin/innovacion/page.tsx",
    "src/app/admin/invitaciones/page.tsx",
    "src/app/admin/cuentas/page.tsx",
    "src/app/admin/sesiones/page.tsx",
    "src/app/admin/organismos/page.tsx",
  ];
  for (const path of pages) {
    expect(readFileSync(path, "utf8")).toContain("total={data.total}");
  }
});
```

- [ ] **Step 2: Correr el test y verlo fallar**

Run: `npx vitest run src/lib/admin/page-count.test.ts`

Expected: FAIL en la primera pantalla, que todavía no pasa `total`.

- [ ] **Step 3: Pasar `total` en la cadena**

En cada `*List`, agregar `total: number` a las props y `total={total}` en `DataList`. El resto de las props se queda.

En cada `page.tsx`, donde ya se llama al list, agregar `total={data.total}`.

Ejemplo de sectores:

```tsx
return <SectoresList rows={data.rows} page={data.page} total={data.total} error={params.error} images={images} />;
```

```tsx
export function SectoresList({ rows, page, total, error, images }: { rows: Record<string, string>[]; page: number; total: number; error?: string; images: { id: string }[] }) {
```

Y dentro, `<DataList ... total={total}>`.

Si un `*List` pasa de 90 líneas al agregar la prop, mover solo el arreglo `columns` a un archivo vecino con el mismo nombre y el sufijo `-columns.ts`. No partas la página.

- [ ] **Step 4: Correr el test**

Run: `npx vitest run src/lib/admin/page-count.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/admin/sectores src/app/admin/empresas src/app/admin/medios src/app/admin/metodologia src/app/admin/pases src/app/admin/bandeja src/app/admin/innovacion src/app/admin/invitaciones src/app/admin/cuentas src/app/admin/sesiones src/app/admin/organismos src/lib/admin/page-count.test.ts
git commit -m "$(cat <<'EOF'
feat: pass each admin table its full row count

EOF
)"
```

---

### Task 5: El CRM cuenta lo filtrado

**Files:**
- Modify: `src/lib/admin/crm/list.ts`
- Modify: `src/app/admin/crm/crm-list.tsx`
- Modify: `src/app/admin/crm/page.tsx`
- Test: `src/lib/admin/page-count.test.ts`

El conteo respeta origen y estatus. La vista de tarjetas sigue trayendo todas las filas. El pie de la tabla usa el total filtrado. Si `?page=` se pasa del final, se conserva la vista y los filtros.

- [ ] **Step 1: Escribir el test que falla**

```ts
it("el CRM cuenta la consulta filtrada y el pie usa ese total", () => {
  const list = readFileSync("src/lib/admin/crm/list.ts", "utf8");
  const screen = readFileSync("src/app/admin/crm/crm-list.tsx", "utf8");
  const page = readFileSync("src/app/admin/crm/page.tsx", "utf8");
  expect(list).toContain('{ count: "exact" }');
  expect(list).toContain("total: 0");
  expect(list).toContain("total: contacts.count ?? 0");
  expect(screen).toContain("pageCount(total)");
  expect(screen).toContain("total={total}");
  expect(screen).not.toContain("rows.length >= 10");
  expect(page).toContain("total={data.total}");
});
```

- [ ] **Step 2: Correr el test y verlo fallar**

Run: `npx vitest run src/lib/admin/page-count.test.ts`

Expected: FAIL porque `crm/list.ts` no pide el conteo.

- [ ] **Step 3: Implementar**

En `listCrm`, los tres retornos tempranos (`!db`, `ids.length === 0`) incluyen `total: 0`.

La consulta de contactos pide el conteo en el `select` actual:

```ts
.select("id, nombre, empresa, email, source, organization_id", { count: "exact" })
```

Los filtros de origen y estatus se quedan antes del `range`. El retorno final incluye `total: contacts.count ?? 0`.

En `CrmList`, agregar `total: number`. Importar `pageCount` y `pageSize`. `const pages = pageCount(total)`.

```tsx
useEffect(() => {
  if (page > pages) router.replace(crmHref({ vista, estado, origen, page: pages }));
}, [estado, origen, page, pages, router, vista]);
```

En `DataTable`:

```tsx
page={page}
totalPages={pages}
total={total}
limit={pageSize}
```

Quitar `rows.length >= 10` y `limit={10}`.

En `src/app/admin/crm/page.tsx`, pasar `total={data.total}`.

`crm-list.tsx` tiene 75 líneas. Con el efecto cabe en 90. Si no cabe, mover `columns` a `src/app/admin/crm/crm-columns.ts`.

- [ ] **Step 4: Correr los tests del panel**

Run: `npx vitest run src/lib/admin/page-count.test.ts src/lib/admin/contract.test.ts src/lib/admin/crm`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/admin/crm/list.ts src/app/admin/crm/crm-list.tsx src/app/admin/crm/page.tsx src/lib/admin/page-count.test.ts
git commit -m "$(cat <<'EOF'
feat: count the filtered CRM instead of the current page

EOF
)"
```

---

## Qué se prueba a mano

1. En `/admin/sectores`, el pie dice «17 registros · página 1 de 1». Las 17 filas se ven sin pasar de página.
2. Abrir `/admin/sectores?page=2` regresa a la página 1, porque 17 cabe en 20.
3. Una lista con más de 20 filas, si existe, dice «página 1 de N» y la página 2 muestra el resto, no otro 20 inventado.
4. El CRM en tabla, con un filtro de origen, cuenta solo esos contactos.
5. La vista de tarjetas del CRM sigue mostrando todos los contactos filtrados.
