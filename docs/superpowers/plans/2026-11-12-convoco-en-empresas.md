# Quién convocó en la tabla de empresas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** En `/admin/empresas`, una columna llamada Convocó queda inmediatamente antes de Llegada y muestra el organismo que trajo a esa empresa. Si nadie la convocó, la celda dice «—».

**Architecture:** El organismo vive en `crm_contacts.organization_id`. El contacto que convocó es el de `source = 'enlace'` cuyo `email` es el del perfil dueño de la empresa (`companies.profile_id`). La lista no embebe `crm_contacts` en el `select` que cuenta: un correo puede estar en más de un organismo y eso inflaría el total. Pide los contactos de los correos de la página en una segunda consulta. El nombre sale de `organizations(name)`, que es muchos-a-uno y no duplica filas. Varios organismos del mismo correo se unen en una sola celda, ordenados en español. Las invitaciones `excel` y `manual` no llenan esta columna: esa lista es `/admin/invitaciones`.

**Tech Stack:** Next.js 16 App Router, Supabase, vitest. Cada `.ts` o `.tsx` editado se queda en 90 líneas o menos. No hay migración SQL.

---

## Fuera de este plan

- Mostrar el organismo en el detalle de la empresa.
- Filtrar la tabla por organismo.
- Cambiar el texto de Llegada o de Aprobación.
- Contar las invitaciones cargadas por Excel o a mano como convocatoria.
- Tocar `src/components/ui/data-table.tsx` ni `src/components/admin/data-columns.tsx`.

## Mapa de archivos

- Crear: `src/lib/admin/empresas/convener.ts`
- Crear: `src/lib/admin/empresas/convener.test.ts`
- Modificar: `src/lib/admin/empresas/list.ts`
- Modificar: `src/lib/admin/empresas/list.test.ts`
- Modificar: `src/app/admin/empresas/empresas-list.tsx`

---

### Task 1: Nombrar al organismo que convocó

**Files:**
- Create: `src/lib/admin/empresas/convener.ts`
- Test: `src/lib/admin/empresas/convener.test.ts`

El correo se compara en minúsculas. Sin nombre, la celda es «—». Dos organismos del mismo correo se ven juntos, sin repetir el mismo nombre.

- [ ] **Step 1: Escribir el test que falla**

Crear `src/lib/admin/empresas/convener.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { convenerByEmail, convenerLabel, organizationName, ownerEmail } from "./convener";

describe("organismo que convocó", () => {
  it("deja un guion cuando no hay organismo", () => {
    expect(convenerLabel([])).toBe("—");
    expect(convenerLabel(["  "])).toBe("—");
  });

  it("junta los nombres distintos en orden español", () => {
    expect(convenerLabel(["  CANACINTRA Puebla  ", "CANACINTRA Puebla"])).toBe("CANACINTRA Puebla");
    expect(convenerLabel(["CLAUZ Puebla", "CANACINTRA Puebla"])).toBe("CANACINTRA Puebla, CLAUZ Puebla");
  });

  it("lee el correo del dueño en minúsculas", () => {
    expect(ownerEmail(null)).toBe("");
    expect(ownerEmail({ email: " Ana@Org.mx " })).toBe("ana@org.mx");
    expect(ownerEmail([{ email: "ana@org.mx" }])).toBe("ana@org.mx");
  });

  it("lee el nombre aunque el embed venga en arreglo", () => {
    expect(organizationName(null)).toBe("");
    expect(organizationName({ name: "CANACINTRA Puebla" })).toBe("CANACINTRA Puebla");
    expect(organizationName([{ name: "CANACINTRA Puebla" }])).toBe("CANACINTRA Puebla");
  });

  it("agrupa por correo", () => {
    const convened = convenerByEmail([
      { email: "Ana@Org.mx", name: "CLAUZ Puebla" },
      { email: "ana@org.mx", name: "CANACINTRA Puebla" },
    ]);
    expect(convened.get("ana@org.mx")).toBe("CANACINTRA Puebla, CLAUZ Puebla");
    expect(convened.get("otro@org.mx")).toBeUndefined();
  });
});
```

- [ ] **Step 2: Correr el test y verlo fallar**

Run: `npx vitest run src/lib/admin/empresas/convener.test.ts`

Expected: FAIL porque `convener` no existe.

- [ ] **Step 3: Implementar el nombre**

Crear `src/lib/admin/empresas/convener.ts`:

```ts
type Named = { name?: string } | { name?: string }[] | null;
type Owner = { email?: string } | { email?: string }[] | null;

export function convenerLabel(names: string[]) {
  const unique = [...new Set(names.map((name) => name.trim()).filter(Boolean))];
  unique.sort((left, right) => left.localeCompare(right, "es"));
  return unique.length ? unique.join(", ") : "—";
}

export function ownerEmail(owner: Owner) {
  const info = Array.isArray(owner) ? owner[0] : owner;
  return String(info?.email ?? "").trim().toLowerCase();
}

export function organizationName(org: Named) {
  const info = Array.isArray(org) ? org[0] : org;
  return info?.name ?? "";
}

export function convenerByEmail(contacts: { email: string; name: string }[]) {
  const grouped = new Map<string, string[]>();
  for (const contact of contacts) {
    const email = contact.email.trim().toLowerCase();
    if (!email) continue;
    const names = grouped.get(email) ?? [];
    names.push(contact.name);
    grouped.set(email, names);
  }
  return new Map([...grouped].map(([email, names]) => [email, convenerLabel(names)]));
}
```

- [ ] **Step 4: Correr el test y verlo pasar**

Run: `npx vitest run src/lib/admin/empresas/convener.test.ts`

Expected: PASS, 5 tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/admin/empresas/convener.ts src/lib/admin/empresas/convener.test.ts
git commit -m "$(cat <<'EOF'
feat: name the organization that convened a company

EOF
)"
```

---

### Task 2: Mostrar Convocó antes de Llegada

**Files:**
- Modify: `src/lib/admin/empresas/list.ts`
- Modify: `src/lib/admin/empresas/list.test.ts`
- Modify: `src/app/admin/empresas/empresas-list.tsx`

El conteo sigue en la consulta de `companies`. El embed `owner` es el perfil dueño, uno por empresa. Los contactos van en una consulta aparte, solo `source = 'enlace'`.

- [ ] **Step 1: Escribir el test que falla**

En `src/lib/admin/empresas/list.test.ts`, al final del caso «la lista lee companies y el tamaño», agregar:

```ts
expect(list).toContain('eq("source", "enlace")');
expect(list).toContain("organizations(name)");
expect(list).toContain("convenerByEmail");
expect(list).toContain("ownerEmail");
expect(list).not.toContain("crm_contacts(");
const convoco = screen.indexOf('{ key: "convoco", label: "Convocó" }');
const llegada = screen.indexOf('{ key: "llegada", label: "Llegada" }');
expect(convoco).toBeGreaterThan(-1);
expect(convoco).toBeLessThan(llegada);
```

`screen` ya se declara en ese caso cuando se lee `empresas-list.tsx`. No declares otra `screen`. Conserva las afirmaciones del logo.

- [ ] **Step 2: Correr el test y verlo fallar**

Run: `npx vitest run src/lib/admin/empresas/list.test.ts`

Expected: FAIL porque `list.ts` no contiene `convenerByEmail` y la pantalla no tiene la columna Convocó.

- [ ] **Step 3: Pedir el organismo de cada correo de la página**

Reemplazar `src/lib/admin/empresas/list.ts` por:

```ts
import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { pageQuery } from "@/lib/admin/page-query";
import { bandLabel } from "./band-label";
import { companyLogoSrc } from "./company-logo-src";
import { companyOwner } from "./company-owner";
import { convenerByEmail, organizationName, ownerEmail } from "./convener";
import { externalApprovalLabel } from "./external-approval";
import { sectorSourceLabel } from "./sector-source";

export async function listEmpresas(rawPage: string | undefined) {
  const page = pageQuery(rawPage);
  const db = await adminDb();
  if (!db) return { page: page.page, rows: [] as Record<string, string>[], total: 0 };
  const result = await db
    .from("companies")
    .select(
      `id, legal_name, employee_band, sector_id, sector_source, admitted_at, referral_source, profile_id, sectors(name), owner:${companyOwner}(email)`,
      { count: "exact" },
    )
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
  const contacts = emails.length
    ? await db.from("crm_contacts").select("email, organizations(name)").eq("source", "enlace").in("email", emails)
    : { data: [], error: null };
  if (contacts.error) throw new Error(contacts.error.message);
  const withLogo = new Set((assets.data ?? []).map((asset) => asset.profile_id));
  const convened = convenerByEmail(
    (contacts.data ?? []).map((contact) => ({
      email: contact.email,
      name: organizationName(contact.organizations as { name?: string } | { name?: string }[] | null),
    })),
  );
  return {
    page: page.page,
    total: result.count ?? 0,
    rows: data.map((row) => {
      const sector = row.sectors as { name?: string } | { name?: string }[] | null;
      const name = Array.isArray(sector) ? sector[0]?.name : sector?.name;
      const email = ownerEmail(row.owner as { email?: string } | { email?: string }[] | null);
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
        convoco: convened.get(email) ?? "—",
        llegada: sectorSourceLabel(row.sector_source ?? ""),
        aprobacion: externalApprovalLabel(row.sector_source ?? "", row.admitted_at),
      };
    }),
  };
}
```

Contar las líneas. Si pasan de 90, mueve la consulta de `crm_contacts` y el armado de `convened` a `src/lib/admin/empresas/page-conveners.ts`. No lo partas si se queda en 90 o menos.

- [ ] **Step 4: Declarar la columna antes de Llegada**

En `src/app/admin/empresas/empresas-list.tsx`, el arreglo `columns` queda así:

```tsx
columns={[
  { key: "logo", label: "Logo", image: true },
  { key: "legal_name", label: "Razón social" },
  { key: "employee_band", label: "Tamaño" },
  { key: "sector_name", label: "Sector" },
  { key: "convoco", label: "Convocó" },
  { key: "llegada", label: "Llegada" },
  { key: "aprobacion", label: "Aprobación" },
]}
```

- [ ] **Step 5: Correr los tests**

Run: `npx vitest run src/lib/admin/empresas/list.test.ts src/lib/admin/empresas/convener.test.ts`

Expected: PASS.

- [ ] **Step 6: Verlo en el navegador**

Con la sesión de superadmin abierta, entra a `http://localhost:3000/admin/empresas`.

- La columna Convocó está entre Sector y Llegada.
- Una empresa que llegó por el enlace muestra el nombre del organismo, por ejemplo CANACINTRA Puebla.
- La empresa que no tiene contacto `enlace` muestra «—».
- El pie sigue diciendo el total de empresas.
- Si caes en `/admin/login`, no inventes credenciales ni leas `.env`. Reporta que el login bloqueó la revisión visual.

- [ ] **Step 7: Commit**

```bash
git add src/lib/admin/empresas/list.ts src/lib/admin/empresas/list.test.ts src/app/admin/empresas/empresas-list.tsx
git commit -m "$(cat <<'EOF'
feat: show who convened each company before arrival

EOF
)"
```

Si el step 3 creó `page-conveners.ts`, inclúyelo en este `git add`.
