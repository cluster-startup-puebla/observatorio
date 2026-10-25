# Tablero de cupos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** El tablero de `/admin` muestra, para la sesión vigente, cuántos lugares hay por sector y cuántos ya están tomados, y cuenta aparte a quien llegó por la landing y sigue sin aceptar.

**Architecture:** Los cupos ya viven en `sessions.capacity_max` y `session_sector_quotas`. Nadie los compara con las empresas. El alta no se bloquea: este plan solo los pinta. Una empresa ocupa lugar si el empresario terminó el perfil, su enlace ya está aceptado y, si llegó por la landing (`sector_source = path`), el superadmin ya la aceptó. Quien sigue pendiente se cuenta al lado, sin ocupar. El embudo de Excel y alta manual no cambia. La gráfica por organismo de invitaciones tampoco: los enlaces salen en una gráfica nueva.

**Tech Stack:** Next.js 16, Recharts, vitest. Archivos `.ts` y `.tsx` de menos de 90 líneas.

---

## Lo que hay hoy

`/admin` es la convocatoria. Cuenta invitaciones Excel y manual, su embudo, el ritmo de confirmaciones y hasta 8 organismos. «Por enlace» y «Por aceptar» miran contactos `enlace`. `linkAccepted` se calcula y no se muestra.

Los cupos se editan en la sesión y la pestaña Cupos solo lista el número guardado. No hay ocupados. El registro no consulta `capacity_max` ni `session_sector_quotas`. Hay como máximo una sesión vigente (`sessions.is_current`).

La landing (`path` sin `admitted_at`) no aparece en el tablero.

## Fuera de este plan

- Cerrar el registro cuando un sector o el evento se llenen.
- Amarrar la empresa a `session_id`. Hoy el cupo es el de la sesión vigente, no el de la sesión del enlace.
- Cambiar el embudo, la tasa ni la gráfica «Por organismo» de Excel y manual.
- Emitir el pase QR.

## Mapa de archivos

- Crear: `src/lib/admin/tablero/sector-fill.ts`
- Crear: `src/lib/admin/tablero/sector-fill.test.ts`
- Crear: `src/lib/admin/tablero/load-cupos.ts`
- Crear: `src/app/admin/tablero/cupo-kpis.tsx`
- Crear: `src/app/admin/tablero/sector-chart.tsx`
- Crear: `src/app/admin/tablero/link-org-chart.tsx`
- Modificar: `src/lib/admin/tablero/types.ts`
- Modificar: `src/lib/admin/tablero/snapshot.ts`
- Modificar: `src/lib/admin/tablero/snapshot.test.ts`
- Modificar: `src/lib/admin/tablero/reading.ts`
- Modificar: `src/app/admin/tablero/board.tsx`
- Modificar: `src/app/admin/page.tsx`

---

### Task 1: Quién ocupa un lugar y quién solo está pendiente

**Files:**
- Create: `src/lib/admin/tablero/sector-fill.ts`
- Create: `src/lib/admin/tablero/sector-fill.test.ts`

Un lugar se ocupa solo con perfil terminado, rol empresario, enlace aceptado y alta externa aceptada. El pendiente no resta cupo. Una empresa de un sector sin fila de cupo no se esconde: suma en `fuera`.

- [ ] **Step 1: Escribir el test que falla**

```ts
import { describe, expect, it } from "vitest";
import { sectorFill, type Seat } from "./sector-fill";

const quotas = [
  { sectorSlug: "turismo", sectorName: "Turismo", capacity: 2 },
  { sectorSlug: "alimentos", sectorName: "Alimentos", capacity: 1 },
];

function seat(partial: Partial<Seat> & Pick<Seat, "sectorSlug">): Seat {
  return {
    sectorName: partial.sectorSlug,
    onboarded: true,
    role: "empresario",
    linkPending: false,
    externalPending: false,
    ...partial,
  };
}

describe("cupo por sector", () => {
  it("separa ocupados, pendientes y quien está fuera de la sesión", () => {
    const result = sectorFill(quotas, [
      seat({ sectorSlug: "turismo" }),
      seat({ sectorSlug: "turismo", linkPending: true }),
      seat({ sectorSlug: "turismo", externalPending: true }),
      seat({ sectorSlug: "alimentos" }),
      seat({ sectorSlug: "textil", sectorName: "Textil" }),
      seat({ sectorSlug: "turismo", onboarded: false }),
      seat({ sectorSlug: "turismo", role: "director" }),
    ]);
    expect(result.cupo).toBe(3);
    expect(result.ocupados).toBe(2);
    expect(result.pendientes).toBe(2);
    expect(result.fuera).toBe(1);
    expect(result.rows).toEqual([
      { sector: "Turismo", slug: "turismo", cupo: 2, ocupados: 1, pendientes: 2 },
      { sector: "Alimentos", slug: "alimentos", cupo: 1, ocupados: 1, pendientes: 0 },
    ]);
  });

  it("sin cupos el total es cero y nadie ocupa", () => {
    expect(sectorFill([], [seat({ sectorSlug: "turismo" })])).toEqual({
      cupo: 0,
      ocupados: 0,
      pendientes: 0,
      fuera: 1,
      rows: [],
    });
  });
});
```

- [ ] **Step 2: Correr el test y verlo fallar**

Run: `npx vitest run src/lib/admin/tablero/sector-fill.test.ts`

Expected: FAIL porque `./sector-fill` no existe.

- [ ] **Step 3: Implementar la cuenta**

```ts
export type Seat = {
  sectorSlug: string;
  sectorName: string;
  onboarded: boolean;
  role: string;
  linkPending: boolean;
  externalPending: boolean;
};

export type SectorQuota = { sectorSlug: string; sectorName: string; capacity: number };

export type SectorFillRow = {
  sector: string;
  slug: string;
  cupo: number;
  ocupados: number;
  pendientes: number;
};

function ready(seat: Seat) {
  return seat.onboarded && seat.role === "empresario";
}

export function sectorFill(quotas: SectorQuota[], seats: Seat[]) {
  const rows = quotas.map((quota) => ({
    sector: quota.sectorName,
    slug: quota.sectorSlug,
    cupo: quota.capacity,
    ocupados: 0,
    pendientes: 0,
  }));
  const bySlug = new Map(rows.map((row) => [row.slug, row]));
  let fuera = 0;
  for (const seat of seats) {
    if (!ready(seat)) continue;
    const row = bySlug.get(seat.sectorSlug);
    const waiting = seat.linkPending || seat.externalPending;
    if (!row) {
      if (!waiting) fuera += 1;
      continue;
    }
    if (waiting) row.pendientes += 1;
    else row.ocupados += 1;
  }
  return {
    cupo: rows.reduce((sum, row) => sum + row.cupo, 0),
    ocupados: rows.reduce((sum, row) => sum + row.ocupados, 0),
    pendientes: rows.reduce((sum, row) => sum + row.pendientes, 0),
    fuera,
    rows,
  };
}
```

`fuera` no suma pendientes de un sector ajeno: todavía no ocupan.

- [ ] **Step 4: Correr el test y verlo pasar**

Run: `npx vitest run src/lib/admin/tablero/sector-fill.test.ts`

Expected: PASS, 2 tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/admin/tablero/sector-fill.ts src/lib/admin/tablero/sector-fill.test.ts
git commit -m "$(cat <<'EOF'
feat: el cupo distingue quién ya ocupa un lugar y quién sigue pendiente

EOF
)"
```

---

### Task 2: La sesión vigente alimenta el cupo

**Files:**
- Create: `src/lib/admin/tablero/load-cupos.ts`
- Modify: `src/lib/admin/tablero/sector-fill.test.ts`

Lee la única sesión `is_current`, sus filas de `session_sector_quotas` y las empresas. El enlace pendiente sale de `pendingLinkEmails`. El alta de la landing sale de `waitsForExternalApproval`. Sin sesión vigente, `cupo` es 0 y `rows` queda vacío. No se aplica SQL.

- [ ] **Step 1: Afirmar la lectura**

```ts
  it("el tablero lee la sesión vigente, los cupos y la aceptación", () => {
    const source = readFileSync("src/lib/admin/tablero/load-cupos.ts", "utf8");
    expect(source).toContain('.eq("is_current", true)');
    expect(source).toContain("session_sector_quotas");
    expect(source).toContain("pendingLinkEmails");
    expect(source).toContain("waitsForExternalApproval");
    expect(source).toContain("sectorFill");
  });
```

Importar `readFileSync` desde `node:fs`.

- [ ] **Step 2: Correr el test y verlo fallar**

Run: `npx vitest run src/lib/admin/tablero/sector-fill.test.ts`

Expected: FAIL porque `load-cupos.ts` no existe.

- [ ] **Step 3: Escribir el loader**

`src/lib/admin/tablero/load-cupos.ts` usa `adminDb`. Si no hay cliente, regresa `sectorFill([], [])`.

Selecciona la sesión vigente: `id, capacity_max` con `.eq("is_current", true).maybeSingle()`. Sin fila, el mismo vacío.

Luego, en paralelo:

- `session_sector_quotas`: `capacity, sectors(name, slug)` filtrado por `session_id`.
- `companies`: `sector_source, admitted_at, sectors(name, slug), profiles!inner(onboarded_at, role, email)` con `profiles.role = empresario` y `onboarded_at` no nulo.
- `pendingLinkEmails(db)`.

Cada empresa arma un `Seat`: `linkPending` si el correo está en el set; `externalPending` con `waitsForExternalApproval(sector_source, admitted_at)`. Pasa esas filas y los cupos a `sectorFill`.

El archivo debe quedar debajo de 90 líneas. Si la normalización de `sectors` y `profiles` lo pasa, muévela a `src/lib/admin/tablero/cupo-seat.ts`.

- [ ] **Step 4: Correr el test y verlo pasar**

Run: `npx vitest run src/lib/admin/tablero/sector-fill.test.ts`

Expected: PASS, 3 tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/admin/tablero/load-cupos.ts src/lib/admin/tablero/sector-fill.test.ts src/lib/admin/tablero/cupo-seat.ts
git commit -m "$(cat <<'EOF'
feat: el tablero lee el cupo de la sesión vigente

EOF
)"
```

Si `cupo-seat.ts` no existe, no lo agregues.

---

### Task 3: El tablero muestra el cupo y avisa cuando un sector se llena

**Files:**
- Create: `src/app/admin/tablero/cupo-kpis.tsx`
- Create: `src/app/admin/tablero/sector-chart.tsx`
- Modify: `src/lib/admin/tablero/reading.ts`
- Modify: `src/app/admin/tablero/board.tsx`
- Modify: `src/app/admin/page.tsx`
- Modify: `src/lib/admin/tablero/snapshot.test.ts`

`page.tsx` llama `loadCupos()` junto a `loadTablero()` y pasa el resultado al board. Dos cifras: ocupados contra cupo, y pendientes. La gráfica es de barras horizontales, una por sector, con cupo, ocupados y pendientes. Si no hay sesión, el texto es «No hay sesión vigente.»

- [ ] **Step 1: Cubrir el aviso de cupo lleno**

En `snapshot.test.ts`, importar `cupoSignals` desde `./reading` y agregar:

```ts
  it("avisa el sector que ya llegó a su cupo", () => {
    const items = cupoSignals([
      { sector: "Turismo", slug: "turismo", cupo: 2, ocupados: 2, pendientes: 1 },
      { sector: "Alimentos", slug: "alimentos", cupo: 4, ocupados: 1, pendientes: 0 },
    ]);
    expect(items).toEqual([
      {
        text: "Turismo ya llenó su cupo (2 de 2).",
        href: "/admin/sesiones",
        label: "Ver sesión",
      },
    ]);
  });
```

`cupoSignals` recibe `SectorFillRow[]`. Un sector lleno es `cupo > 0 && ocupados >= cupo`. Máximo 3 avisos.

- [ ] **Step 2: Correr el test y verlo fallar**

Run: `npx vitest run src/lib/admin/tablero/snapshot.test.ts`

Expected: FAIL porque `cupoSignals` no existe.

- [ ] **Step 3: Pintar cifras, aviso y gráfica**

En `reading.ts`:

```ts
export function cupoSignals(rows: { sector: string; cupo: number; ocupados: number }[]): Signal[] {
  return rows
    .filter((row) => row.cupo > 0 && row.ocupados >= row.cupo)
    .slice(0, 3)
    .map((row) => ({
      text: `${row.sector} ya llenó su cupo (${row.ocupados} de ${row.cupo}).`,
      href: "/admin/sesiones",
      label: "Ver sesión",
    }));
}
```

`cupo-kpis.tsx` recibe el resultado de `sectorFill`. Dos artículos con `data-testid="tablero-cupo"` y `data-testid="tablero-cupo-pendiente"`. El primero muestra `ocupados` de `cupo` (`3 de 12`). Si `cupo` es 0, muestra «Sin sesión». El segundo muestra `pendientes` con la pista «Terminaron el perfil y siguen sin aceptar».

`sector-chart.tsx` es cliente, copia el patrón de `org-chart.tsx`: `ChartPanel` título «Por sector», pista «Lugares de la sesión vigente contra quienes ya ocupan y quienes esperan.». Barras `cupo`, `ocupados`, `pendientes`. Sin filas, «No hay sesión vigente.»

`board.tsx` recibe `cupos` y renderiza `CupoKpis`, los links de `cupoSignals` y `SectorChart`. `page.tsx` sigue debajo de 90 líneas.

- [ ] **Step 4: Correr el test y verlo pasar**

Run: `npx vitest run src/lib/admin/tablero/snapshot.test.ts src/lib/admin/tablero/sector-fill.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/admin/tablero/cupo-kpis.tsx src/app/admin/tablero/sector-chart.tsx src/lib/admin/tablero/reading.ts src/app/admin/tablero/board.tsx src/app/admin/page.tsx src/lib/admin/tablero/snapshot.test.ts
git commit -m "$(cat <<'EOF'
feat: el tablero compara el cupo de la sesión con quienes ya ocupan lugar

EOF
)"
```

---

### Task 4: Los enlaces también se ven por organismo

**Files:**
- Modify: `src/lib/admin/tablero/types.ts`
- Modify: `src/lib/admin/tablero/snapshot.ts`
- Modify: `src/lib/admin/tablero/snapshot.test.ts`
- Create: `src/app/admin/tablero/link-org-chart.tsx`
- Modify: `src/app/admin/tablero/board.tsx`

`byOrg` sigue siendo solo Excel y manual. Un arreglo nuevo `byLinkOrg` cuenta, por organismo, cuántos `enlace` hay y cuántos siguen en `cargado`. No entra al embudo ni a la tasa.

- [ ] **Step 1: Escribir el test que falla**

En el caso que ya tiene un contacto `enlace` registrado del organismo Sur, esperar `board.byLinkOrg` igual a `[{ organismo: "Sur", enlaces: 1, pendientes: 0 }]`. Agregar otro caso con tres enlaces del mismo organismo en `cargado`, `registrado` y `no`: `enlaces` 3, `pendientes` 1. `byOrg` de ese caso sigue sin contarlos.

- [ ] **Step 2: Correr el test y verlo fallar**

Run: `npx vitest run src/lib/admin/tablero/snapshot.test.ts`

Expected: FAIL porque `byLinkOrg` no existe.

- [ ] **Step 3: Contar y pintar**

En `types.ts`:

```ts
export type LinkOrgBar = { organismo: string; enlaces: number; pendientes: number };
```

`Tablero` gana `byLinkOrg: LinkOrgBar[]`. `emptyTablero` lo recibe vacío vía `buildTablero`.

En `snapshot.ts`, sobre `links`: agrupar por `organizationId`, nombre desde `orgs`, `enlaces` es el largo, `pendientes` es status exactamente `cargado`. Orden por `enlaces` desc y nombre `es`. Máximo 8. `no` cuenta en `enlaces` y no en `pendientes`.

`link-org-chart.tsx` es cliente. Título «Enlaces por organismo». Pista «Quienes se registraron con el enlace y cuántos siguen pendientes.» Barras `enlaces` y `pendientes`. Sin filas: «Todavía no hay registros por enlace.»

`board.tsx` lo pone debajo de `OrgChart`. `snapshot.ts` y `board.tsx` siguen debajo de 90 líneas. Si `snapshot.ts` pasa de 90, mueve el agrupado a `src/lib/admin/tablero/link-org-bars.ts`.

- [ ] **Step 4: Correr el test y verlo pasar**

Run: `npx vitest run src/lib/admin/tablero/snapshot.test.ts`

Expected: PASS. El caso viejo sigue con `invitations` 3 y el enlace fuera de `byOrg`.

- [ ] **Step 5: Commit**

```bash
git add src/lib/admin/tablero/types.ts src/lib/admin/tablero/snapshot.ts src/lib/admin/tablero/snapshot.test.ts src/app/admin/tablero/link-org-chart.tsx src/app/admin/tablero/board.tsx src/lib/admin/tablero/link-org-bars.ts
git commit -m "$(cat <<'EOF'
feat: el tablero muestra los enlaces por organismo

EOF
)"
```

Si `link-org-bars.ts` no existe, no lo agregues.
