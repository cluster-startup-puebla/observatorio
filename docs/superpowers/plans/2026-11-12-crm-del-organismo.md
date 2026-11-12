# CRM del organismo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** En `/admin/organismos/[id]?tab=crm` se ve la tabla de contactos de ese organismo: nombre, empresa, correo, origen en español, estatus, y un Abrir hacia la ficha del contacto. El pie dice el total y pagina de 20 en 20.

**Architecture:** La ficha sigue siendo `DetailFrame`. No se porta el detalle de Ordina (GraphQL, Apollo, Cards grises ni `/dashboard`). De esas reglas se toma lo que sí cabe aquí: el tab vive en `?tab=crm`, el dato se lee en el servidor, el tab reutiliza las columnas del CRM ya existente, y el conteo del tab sale de `count: "exact"`. La consulta pagina y no carga todos los contactos dentro de `loadOrganismo`. Editar y borrar se quedan en `/admin/crm`, porque esas rutas regresan allá y sacarían al superadmin de la ficha.

**Tech Stack:** Next.js 16 App Router, Supabase, `DataTable`, vitest. Cada `.ts` o `.tsx` editado se queda en 90 líneas o menos. No hay migración SQL. Los avisos siguen en Alert, toast o AlertDialog. Esta tabla no muestra un error de formulario.

---

## Reglas que sí se aplican

- El tab activo queda en la URL. Cambiar de tab usa `?tab=`, así que la página del CRM no se arrastra a Miembros.
- La página del CRM conserva el tab: `?tab=crm` y, desde la 2, `?tab=crm&page=2`.
- Vacío: «Este organismo no tiene contactos.» No un `<ul>` en blanco.
- Sin estatus, la celda dice «—».
- Origen en español: Enlace, Excel, Manual. Estatus con `crmLabel` (Cargado, Contactado, Confirmó, Registrado, Llegó, No).
- Abrir lleva a `/admin/crm/[id]`.
- El conteo del tab CRM es el total de contactos, no las filas de la página. Si es 0, no se pinta el número.
- Archivos de 90 líneas o menos.

## Fuera de este plan

- Rehacer el header como la Card de Ordina, con Avatar, iconos y grid gris.
- Pulir Miembros, Enlace y Logo.
- Alta, edición o borrado de contactos desde esta ficha.
- La vista de tarjetas y los filtros de estatus u origen.
- Cambiar `/admin/crm`.

## Mapa de archivos

- Modificar: `src/lib/crm-label.ts`
- Crear: `src/lib/admin/organismos/crm.ts`
- Crear: `src/lib/admin/organismos/crm.test.ts`
- Crear: `src/app/admin/organismos/[id]/crm-tab.tsx`
- Modificar: `src/app/admin/organismos/[id]/page.tsx`
- Modificar: `src/app/admin/organismos/[id]/tabs.tsx`
- Modificar: `src/components/admin/detail-frame.tsx`
- Modificar: `src/lib/admin/organismos/detail.ts`
- Modificar: `src/lib/admin/organismos/memory.ts`

---

### Task 1: Leer una página de contactos del organismo

**Files:**
- Modify: `src/lib/crm-label.ts`
- Create: `src/lib/admin/organismos/crm.ts`
- Test: `src/lib/admin/organismos/crm.test.ts`

La consulta filtra `organization_id`, pide el conteo exacto y traduce origen y estatus. No embebe otra tabla en el `select` que cuenta.

- [ ] **Step 1: Escribir el test que falla**

Crear `src/lib/admin/organismos/crm.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { crmSourceLabel } from "@/lib/crm-label";

describe("crm de un organismo", () => {
  it("traduce el origen y deja el estatus vacío en guion", () => {
    expect(crmSourceLabel("enlace")).toBe("Enlace");
    expect(crmSourceLabel("excel")).toBe("Excel");
    expect(crmSourceLabel("manual")).toBe("Manual");
    expect(crmSourceLabel("otro")).toBe("otro");
  });

  it("la lista pagina los contactos de un organismo", () => {
    const source = readFileSync("src/lib/admin/organismos/crm.ts", "utf8");
    expect(source).toContain('.from("crm_contacts")');
    expect(source).toContain('.eq("organization_id", orgId)');
    expect(source).toContain('{ count: "exact" }');
    expect(source).toContain(".range(page.from, page.to)");
    expect(source).toContain("crm_contact_status");
    expect(source).toContain("crmSourceLabel");
    expect(source).toContain("crmLabel");
    expect(source).toContain('|| "—"');
  });
});
```

- [ ] **Step 2: Correr el test y verlo fallar**

Run: `npx vitest run src/lib/admin/organismos/crm.test.ts`

Expected: FAIL porque `crmSourceLabel` y `crm.ts` no existen.

- [ ] **Step 3: Traducir el origen**

Al final de `src/lib/crm-label.ts`, agregar:

```ts
const sources: Record<string, string> = {
  enlace: "Enlace",
  excel: "Excel",
  manual: "Manual",
};

export function crmSourceLabel(source: string) {
  return sources[source] ?? source;
}
```

- [ ] **Step 4: Consultar la página**

Crear `src/lib/admin/organismos/crm.ts`:

```ts
import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { pageQuery } from "@/lib/admin/page-query";
import { crmLabel, crmSourceLabel } from "@/lib/crm-label";

export async function listOrganismoCrm(orgId: string, rawPage: string | undefined) {
  const page = pageQuery(rawPage);
  const db = await adminDb();
  if (!db) return { page: page.page, rows: [] as Record<string, string>[], total: 0 };
  const contacts = await db
    .from("crm_contacts")
    .select("id, nombre, empresa, email, source", { count: "exact" })
    .eq("organization_id", orgId)
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
    total: contacts.count ?? 0,
    rows: (contacts.data ?? []).map((row) => ({
      id: row.id,
      nombre: row.nombre,
      empresa: row.empresa,
      email: row.email,
      source: crmSourceLabel(row.source),
      status: crmLabel(byContact.get(row.id) ?? "") || "—",
    })),
  };
}
```

Contar las líneas. Si `crm.ts` pasa de 90, mueve el armado de filas a `src/lib/admin/organismos/crm-rows.ts`. No lo partas si se queda en 90 o menos.

- [ ] **Step 5: Correr el test y verlo pasar**

Run: `npx vitest run src/lib/admin/organismos/crm.test.ts`

Expected: PASS, 2 tests.

- [ ] **Step 6: Commit**

```bash
git add src/lib/crm-label.ts src/lib/admin/organismos/crm.ts src/lib/admin/organismos/crm.test.ts
git commit -m "$(cat <<'EOF'
feat: page one organization's CRM contacts

EOF
)"
```

---

### Task 2: Pintar la tabla en la pestaña CRM

**Files:**
- Create: `src/app/admin/organismos/[id]/crm-tab.tsx`
- Modify: `src/app/admin/organismos/[id]/page.tsx`
- Modify: `src/app/admin/organismos/[id]/tabs.tsx`
- Test: `src/lib/admin/organismos/crm.test.ts`

La tabla no trae alta, edición ni borrado. Abrir va a la ficha del contacto. El paginador no pierde `tab=crm`.

- [ ] **Step 1: Escribir el test que falla**

En `src/lib/admin/organismos/crm.test.ts`, agregar:

```ts
it("la pestaña CRM abre el contacto y conserva el tab", () => {
  const tab = readFileSync("src/app/admin/organismos/[id]/crm-tab.tsx", "utf8");
  const page = readFileSync("src/app/admin/organismos/[id]/page.tsx", "utf8");
  const screen = readFileSync("src/app/admin/organismos/[id]/tabs.tsx", "utf8");
  expect(tab).toContain("href={`/admin/crm/${row.original.id}`}");
  expect(tab).toContain("Este organismo no tiene contactos.");
  expect(tab).toContain("?tab=crm&page=");
  expect(tab).not.toContain("deleteAction");
  expect(page).toContain("listOrganismoCrm");
  expect(page).toContain("OrganismoCrmTab");
  expect(screen).not.toContain("data.contacts");
});
```

`readFileSync` ya está importado en ese archivo.

- [ ] **Step 2: Correr el test y verlo fallar**

Run: `npx vitest run src/lib/admin/organismos/crm.test.ts`

Expected: FAIL porque `crm-tab.tsx` no existe.

- [ ] **Step 3: Crear la tabla**

Crear `src/app/admin/organismos/[id]/crm-tab.tsx`:

```tsx
"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { columnDef, type DataRow } from "@/components/admin/data-columns";
import { DataTable } from "@/components/ui/data-table";
import { pageCount } from "@/lib/admin/page-query";

const columns = [
  { key: "nombre", label: "Nombre" },
  { key: "empresa", label: "Empresa" },
  { key: "email", label: "Correo" },
  { key: "source", label: "Origen" },
  { key: "status", label: "Estatus" },
];

export function OrganismoCrmTab({
  id,
  rows,
  page,
  total,
}: {
  id: string;
  rows: DataRow[];
  page: number;
  total: number;
}) {
  const router = useRouter();
  const pages = pageCount(total);
  const href = (next: number) => (next > 1 ? `/admin/organismos/${id}?tab=crm&page=${next}` : `/admin/organismos/${id}?tab=crm`);
  const tableColumns: ColumnDef<DataRow>[] = [
    ...columns.map((column) => columnDef(column)),
    {
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => (
        <Link className="text-link" href={`/admin/crm/${row.original.id}`}>
          Abrir
        </Link>
      ),
    },
  ];

  useEffect(() => {
    if (page > pages) router.replace(href(pages));
  }, [page, pages, router, id]);

  return (
    <DataTable
      data={rows}
      columns={tableColumns}
      page={page}
      totalPages={pages}
      total={total}
      emptyMessage="Este organismo no tiene contactos."
      onPageChange={(next) => router.push(href(next))}
    />
  );
}
```

Revisa el efecto. `href` cambia en cada render y no debe ir en las dependencias si eso dispara el replace de más. Las dependencias de arriba son las que el archivo debe tener. Si el linter pide `href`, envuelve `href` en el efecto como función interna. El archivo debe quedar en 90 líneas o menos. Si se pasa, mueve `columns` a `src/app/admin/organismos/[id]/crm-columns.ts`.

- [ ] **Step 4: Montarla solo en la pestaña CRM**

En `src/app/admin/organismos/[id]/page.tsx`:

- Agrega `page?: string` al tipo de `searchParams`.
- Importa `listOrganismoCrm` y `OrganismoCrmTab`.
- Cuando `active === "crm"`, espera `listOrganismoCrm(id, query.page)` y renderiza `OrganismoCrmTab` con `id`, `rows`, `page` y `total`.
- En las otras pestañas sigue `OrganismoTabs`.

En `src/app/admin/organismos/[id]/tabs.tsx`:

- Borra el bloque `if (active === "crm")` y la propiedad `contacts` del tipo.
- El archivo no debe volver a leer `data.contacts`.

- [ ] **Step 5: Correr el test y verlo pasar**

Run: `npx vitest run src/lib/admin/organismos/crm.test.ts src/lib/admin/organismos/detail.test.ts`

Expected: PASS. El detalle todavía contiene `.from("crm_contacts")` porque el conteo de la tarea 3 aún no reemplaza esa lectura. Si este paso ya no la tiene, no la borres hasta la tarea 3.

- [ ] **Step 6: Commit**

```bash
git add src/app/admin/organismos/[id]/crm-tab.tsx src/app/admin/organismos/[id]/page.tsx src/app/admin/organismos/[id]/tabs.tsx src/lib/admin/organismos/crm.test.ts
git commit -m "$(cat <<'EOF'
feat: show an organization's contacts on its CRM tab

EOF
)"
```

Si el step 3 creó `crm-columns.ts`, inclúyelo.

---

### Task 3: Mostrar el total en la pestaña

**Files:**
- Modify: `src/components/admin/detail-frame.tsx`
- Modify: `src/lib/admin/organismos/detail.ts`
- Modify: `src/lib/admin/organismos/memory.ts`
- Modify: `src/app/admin/organismos/[id]/page.tsx`
- Test: `src/lib/admin/organismos/crm.test.ts`

El número sale de un conteo sin filas. La ficha ya no descarga todos los contactos para pintar la pestaña.

- [ ] **Step 1: Escribir el test que falla**

En `src/lib/admin/organismos/crm.test.ts`, agregar:

```ts
it("el tab CRM muestra el total y no descarga todas las filas", () => {
  const detail = readFileSync("src/lib/admin/organismos/detail.ts", "utf8");
  const frame = readFileSync("src/components/admin/detail-frame.tsx", "utf8");
  const page = readFileSync("src/app/admin/organismos/[id]/page.tsx", "utf8");
  expect(detail).toContain('{ count: "exact", head: true }');
  expect(detail).toContain("contactCount");
  expect(detail).not.toContain("nombre, empresa, email, source");
  expect(frame).toContain("tab.count");
  expect(page).toContain("count: data.contactCount");
});
```

- [ ] **Step 2: Correr el test y verlo fallar**

Run: `npx vitest run src/lib/admin/organismos/crm.test.ts`

Expected: FAIL porque el detalle todavía selecciona `nombre, empresa, email, source`.

- [ ] **Step 3: Contar sin traer filas**

En `src/lib/admin/organismos/detail.ts`, reemplaza la consulta de contactos por:

```ts
db.from("crm_contacts").select("id", { count: "exact", head: true }).eq("organization_id", id),
```

Guarda el resultado como `contactCount: contacts.count ?? 0`. Quita `contacts: contacts.data ?? []`.

En `src/lib/admin/organismos/memory.ts`, reemplaza `contacts: []` por `contactCount: 0`.

- [ ] **Step 4: Pintar el número solo si hay contactos**

En `src/components/admin/detail-frame.tsx`, el tipo de cada tab acepta `count?: number`. El texto del enlace queda así:

```tsx
{tab.label}
{tab.count ? <span className="ml-2 text-small">{tab.count}</span> : null}
```

En `src/app/admin/organismos/[id]/page.tsx`, el tab CRM queda:

```tsx
{ value: "crm", label: "CRM", count: data.contactCount },
```

Los otros tabs no llevan `count`. Una ficha sin contactos no muestra un 0.

- [ ] **Step 5: Correr los tests**

Run: `npx vitest run src/lib/admin/organismos/crm.test.ts src/lib/admin/organismos/detail.test.ts src/lib/admin/organismos/list.test.ts`

Expected: PASS.

- [ ] **Step 6: Verlo en el navegador**

Con la sesión de superadmin, abre `http://localhost:3000/admin/organismos/79d556b0-8ac7-4aba-a74b-c2debfec57c5?tab=crm`.

- La tabla tiene Nombre, Empresa, Correo, Origen, Estatus y Abrir.
- Origen dice Enlace, no `enlace`.
- Abrir entra a `/admin/crm/` y el id del contacto.
- El tab dice CRM y el total. El pie usa ese mismo total.
- Si hay más de 20, la página 2 sigue en `?tab=crm&page=2`.
- Si caes en `/admin/login`, no inventes credenciales ni leas `.env`. Reporta que el login bloqueó la revisión visual.

- [ ] **Step 7: Commit**

```bash
git add src/components/admin/detail-frame.tsx src/lib/admin/organismos/detail.ts src/lib/admin/organismos/memory.ts src/app/admin/organismos/[id]/page.tsx src/lib/admin/organismos/crm.test.ts
git commit -m "$(cat <<'EOF'
feat: show the contact count on the organization CRM tab

EOF
)"
```
