# Tablero de la convocatoria

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** El tablero de `/admin` se lee con la sesión de frente, los números de enlace cierran entre sí, y las gráficas vacías dejan de ocupar el primer pantallazo.

**Architecture:** La sesión sigue eligiéndose con `?sesion=`. Si solo hay una, no hay select. El cupo de esa sesión y el CRM de enlace se muestran como dos cuentas separadas, cada una con una suma que cierra. La lista de Excel solo aparece cuando existe. Las confirmaciones por día cuentan también a quien llegó por enlace. Las últimas empresas confirmadas salen de los hechos `confirmar`.

**Tech Stack:** Next.js 16, Vitest, recharts ya usado en el tablero. Archivos `.ts` y `.tsx` de máximo 90 líneas. Avisos con el texto de la página, sin `alert`.

---

## Qué está contando hoy

Hay una sola sesión vigente: Quinta Real, 12 nov 2026, cupo 120 en 13 sectores. No convoca Tecnología y servicios de TI.

El tablero mezcla tres poblaciones.

| Número en pantalla | Qué es en los datos |
|---|---|
| Invitaciones 0, Confirmaciones 0, Tasa 0% | Contactos CRM con origen `excel` o `manual`. No hay ninguno. |
| Por enlace 13 | Los 13 contactos CRM con origen `enlace`. |
| Por aceptar 5 | De esos 13, los que siguen en estatus `cargado`. |
| 5 de 120 | Empresarios con perfil terminado, sector de esta sesión, y ya aceptados. |
| Pendientes 5 | Empresarios con perfil terminado, sector de esta sesión, y todavía sin aceptar. |

Los 13 del enlace se parten así:

- 8 ya están en `registrado`. Ese 8 se calcula en `linkAccepted` y la pantalla no lo enseña.
- 5 siguen en `cargado`.

De esos 13, 9 cayeron en un sector de esta sesión y 4 cayeron en Tecnología, que esta sesión no convoca.

Los 10 de la sesión son otras personas, casi las mismas:

- 5 ocupados: enlace ya registrado y sector convocado (metalmecánica 3, turismo 1, agronomía 1).
- 4 pendientes de enlace dentro de la sesión (alimentos 2, agronomía 1, logística 1).
- 1 pendiente que llegó por la ruta pública, en metalmecánica. No está entre los 13.
- El pendiente de Tecnología no entra al 5 de la sesión. `sectorFill` solo suma en `fuera` a quien ya no espera, así que ese pendiente no aparece en ningún lado del bloque de cupo. `fuera` hoy vale 3: los registrados de Tecnología.

Por eso 5 + 5 no llega a 13. Faltan los 3 de Tecnología ya registrados, sobra el de la ruta pública y el pendiente de Tecnología está escondido.

Las gráficas vacías salen de la misma mezcla:

- «Dónde está la lista» y «Por organismo» solo miran Excel y alta manual. Con cero invitaciones dibujan barras en cero o el texto de vacío.
- «Confirmaciones por día» solo cuenta hechos `confirmar` cuyo contacto sea de Excel o alta manual. Hay 8 hechos `confirmar`, todos de enlace, entre el 10 y el 11 de noviembre, y el filtro los tira.
- «Enlaces por organismo» sí tiene datos, pero solo pinta total y pendientes. CANACINTRA tiene 6 registrados y la barra de pendientes queda en cero, así que no se ve que ya avanzaron.

## Archivos

| Archivo | Responsabilidad |
|---|---|
| `src/app/admin/tablero/session-select.tsx` | Una sesión se queda fija. Dos o más muestran el select. Dos acciones. |
| `src/lib/admin/tablero/sector-fill.ts` | Separa a quien está fuera y ya ocupa de quien está fuera y sigue pendiente. |
| `src/app/admin/tablero/cupo-kpis.tsx` | Ocupados, esperando y fuera de la sesión. |
| `src/app/admin/tablero/kpis.tsx` | El enlace se lee 8 registrados + 5 por aceptar = 13. Excel solo si hay lista. |
| `src/lib/admin/tablero/pace-bars.ts` | Los hechos `confirmar` del enlace entran a los 14 días. |
| `src/app/admin/tablero/pace-chart.tsx` | Si los 14 días suman cero, lo dice. |
| `src/app/admin/tablero/funnel-chart.tsx` | Sin lista de Excel, muestra el corte del enlace. |
| `src/app/admin/tablero/org-chart.tsx` | Sin lista de Excel, no se renderiza. |
| `src/app/admin/tablero/link-org-table.tsx` | Organismo, registrados y pendientes. El nombre abre el organismo. |
| `src/lib/admin/tablero/recent-confirms.ts` | Las últimas empresas con hecho `confirmar`, máximo 10. |
| `src/app/admin/tablero/recent-confirms.tsx` | Tabla de esas empresas. |
| `src/app/admin/tablero/board.tsx` | El orden: sesión, cupo, enlace, últimas, gráficas. |

## Task 1: El control de la sesión

**Files:**
- Modify: `src/app/admin/tablero/session-select.tsx`
- Test: `src/app/admin/tablero/session-select.test.tsx`

- [ ] **Step 1: Escribir el caso del control**

El caso lee el archivo y exige tres cosas: el select solo se arma si hay más de una sesión, el botón se llama «Ver convocatoria», y hay un enlace «Ver detalle» hacia `/admin/sesiones/${id}`.

```tsx
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("control de sesión del tablero", () => {
  const source = readFileSync("src/app/admin/tablero/session-select.tsx", "utf8");

  it("esconde el select cuando la sesión es la única", () => {
    expect(source).toContain("choices.length > 1");
    expect(source).toContain("Ver convocatoria");
    expect(source).toContain("/admin/sesiones/");
    expect(source).toContain("Ver detalle");
    expect(source).toContain("pr-10");
  });
});
```

- [ ] **Step 2: Correrlo y ver que falla**

Run: `npx vitest run src/app/admin/tablero/session-select.test.tsx`

Expected: FAIL, el archivo todavía dice «Ver» y no tiene `choices.length > 1`.

- [ ] **Step 3: Implementar el control**

Con una sesión, un párrafo con sede y fecha, y un `input type="hidden" name="sesion"` con su id. Con dos o más, el `select` actual, con `appearance-none`, `pr-10` y la flecha del enlace de organismo (`bg-[position:right_0.75rem_center]`), para que no quede pegada al borde.

«Ver convocatoria» hace `type="submit"` del form `GET /admin`, que es lo que hoy hace «Ver». «Ver detalle» es un `Link` a `/admin/sesiones/${selected}`.

- [ ] **Step 4: Correr el caso**

Run: `npx vitest run src/app/admin/tablero/session-select.test.tsx`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/admin/tablero/session-select.tsx src/app/admin/tablero/session-select.test.tsx
git commit -m "feat: keep a single session fixed and open its detail"
```

## Task 2: Fuera de la sesión, pendientes incluidos

**Files:**
- Modify: `src/lib/admin/tablero/sector-fill.ts`
- Modify: `src/lib/admin/tablero/sector-fill.test.ts`
- Modify: `src/app/admin/tablero/cupo-kpis.tsx`

`fuera` se queda como está: quien ya tiene lugar y su sector no está en la sesión. Se agrega `fueraPendientes`: quien sigue esperando y su sector tampoco está.

- [ ] **Step 1: Extender el caso**

En el primer caso de `sector-fill.test.ts`, agregar un asiento `textil` con `linkPending: true`. Esperar `fuera` en 1 y `fueraPendientes` en 1. En el caso sin cupos, `fueraPendientes` es 0.

- [ ] **Step 2: Correrlo y ver que falla**

Run: `npx vitest run src/lib/admin/tablero/sector-fill.test.ts`

Expected: FAIL, `fueraPendientes` no existe.

- [ ] **Step 3: Contar las dos salidas**

En el `if (!row)` de `sectorFill`, si `waiting` entonces `fueraPendientes += 1`, si no `fuera += 1`. Devolver ambos. `CupoKpis` recibe `fuera` y `fueraPendientes` y pinta una tercera tarjeta: «Fuera de la sesión», valor `fuera + fueraPendientes`, pista «Su sector no está en esta sesión. N ya tienen lugar y N siguen pendientes.» Si la suma es 0, la tarjeta no se pinta.

- [ ] **Step 4: Correr el caso**

Run: `npx vitest run src/lib/admin/tablero/sector-fill.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/admin/tablero/sector-fill.ts src/lib/admin/tablero/sector-fill.test.ts src/app/admin/tablero/cupo-kpis.tsx
git commit -m "feat: show people whose sector this session does not convene"
```

## Task 3: El enlace cierra en 8 + 5

**Files:**
- Modify: `src/app/admin/tablero/kpis.tsx`
- Modify: `src/app/admin/tablero/board.tsx`
- Modify: `src/lib/admin/tablero/reading.ts`
- Modify: `src/lib/admin/tablero/snapshot.test.ts`

- [ ] **Step 1: Fijar las etiquetas**

Un caso lee `kpis.tsx` y exige «Registrados», «Por aceptar» y «Por enlace». Exige que las tres primeras tarjetas de Excel (`Invitaciones`, `Confirmaciones`, `Tasa`) vivan en otro componente, `excel-kpis.tsx`, y que `board.tsx` solo lo monte cuando `board.invitations > 0`.

`lectura` con cero invitaciones y `linkSignups > 0` dice: «Por enlace van N: N ya se registraron y N siguen por aceptar.» Con el tablero de hoy eso es «Por enlace van 13: 8 ya se registraron y 5 siguen por aceptar.»

- [ ] **Step 2: Correrlo y ver que falla**

Run: `npx vitest run src/lib/admin/tablero/snapshot.test.ts src/app/admin/tablero/kpis.test.ts`

Expected: FAIL en la frase de `lectura` y porque `excel-kpis.tsx` no existe.

- [ ] **Step 3: Partir las tarjetas**

`kpis.tsx` queda con tres tarjetas: Por enlace (`linkSignups`), Registrados (`linkAccepted`), Por aceptar (`linkPending`). La pista de Por enlace dice «8 y 5 son estas personas.» usando los dos números reales, no el texto fijo.

`excel-kpis.tsx` conserva Invitaciones, Confirmaciones y Tasa. `TableroSignals` y el texto «Todavía no hay invitaciones cargadas» se mueven junto a esas tarjetas, dentro del mismo `board.invitations > 0`.

- [ ] **Step 4: Correr los casos**

Run: `npx vitest run src/lib/admin/tablero/snapshot.test.ts src/app/admin/tablero/kpis.test.ts`

Expected: PASS. El caso viejo de `lectura` con 3 invitaciones sigue diciendo «De 3 invitaciones, 2 ya confirmaron (67%).»

- [ ] **Step 5: Commit**

```bash
git add src/app/admin/tablero/kpis.tsx src/app/admin/tablero/excel-kpis.tsx src/app/admin/tablero/board.tsx src/lib/admin/tablero/reading.ts src/lib/admin/tablero/snapshot.test.ts src/app/admin/tablero/kpis.test.ts
git commit -m "feat: show link registrations as the rest of the 13"
```

## Task 4: Gráficas que hoy salen vacías

**Files:**
- Modify: `src/lib/admin/tablero/pace-bars.ts`
- Modify: `src/lib/admin/tablero/snapshot.ts`
- Modify: `src/lib/admin/tablero/snapshot.test.ts`
- Modify: `src/app/admin/tablero/pace-chart.tsx`
- Modify: `src/app/admin/tablero/funnel-chart.tsx`
- Modify: `src/app/admin/tablero/org-chart.tsx`
- Modify: `src/app/admin/tablero/board.tsx`

- [ ] **Step 1: El día cuenta al enlace**

En el caso actual, el contacto `d` es enlace y su `confirmar` del 22 oct no entra al último día. Cambiar la expectativa: ese día suma 2, porque el de Excel y el de enlace confirman el mismo día. El día anterior sigue en 1.

- [ ] **Step 2: Correrlo y ver que falla**

Run: `npx vitest run src/lib/admin/tablero/snapshot.test.ts`

Expected: FAIL, el último día sigue en 1.

- [ ] **Step 3: Quitar el filtro de solo invitación**

`paceBars` deja de recibir el set de ids de Excel. Cuenta todo hecho `confirmar` de los últimos 14 días. `buildTablero` le pasa los eventos y la fecha, nada más.

`PaceChart`, si la suma de `confirmaciones` es 0, pinta «Nadie ha confirmado en estos 14 días.» y no la gráfica.

`FunnelChart` recibe también `linkPending` y `linkAccepted`. Si todas las etapas de la lista están en cero, el título pasa a «Dónde está el enlace» y las barras son «Por aceptar» y «Registrados».

`OrgChart` exporta el mismo componente. `board.tsx` no lo monta cuando `board.byOrg.length === 0`.

- [ ] **Step 4: Correr el caso**

Run: `npx vitest run src/lib/admin/tablero/snapshot.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/admin/tablero/pace-bars.ts src/lib/admin/tablero/snapshot.ts src/lib/admin/tablero/snapshot.test.ts src/app/admin/tablero/pace-chart.tsx src/app/admin/tablero/funnel-chart.tsx src/app/admin/tablero/board.tsx
git commit -m "feat: count link confirmations on the daily chart"
```

## Task 5: Enlaces por organismo, con los registrados

**Files:**
- Modify: `src/lib/admin/tablero/snapshot.ts`
- Modify: `src/lib/admin/tablero/types.ts`
- Modify: `src/lib/admin/tablero/snapshot.test.ts`
- Create: `src/app/admin/tablero/link-org-table.tsx`
- Modify: `src/app/admin/tablero/board.tsx`

`LinkOrgBar` gana `id` y `registrados`. `registrados` es el contacto de enlace cuyo estatus está en `confirmo`, `registrado` o `llego`. `pendientes` sigue siendo `cargado`. `enlaces` sigue siendo el total.

- [ ] **Step 1: Esperar el corte**

El caso de Sur, que hoy espera `{ organismo: "Sur", enlaces: 1, pendientes: 0 }`, pasa a incluir `id: "o2"` y `registrados: 1`.

- [ ] **Step 2: Correrlo y ver que falla**

Run: `npx vitest run src/lib/admin/tablero/snapshot.test.ts`

Expected: FAIL, la barra no trae `registrados`.

- [ ] **Step 3: Tabla en lugar de la gráfica**

`linkOrgBars` llena `registrados` con `isLinkAccepted` y estatus no vacío. `link-org-table.tsx` es una tabla: Organismo, Registrados, Pendientes. El nombre es `Link` a `/admin/organismos/${id}`. Si `id` viene vacío, el nombre va sin enlace. `board.tsx` usa la tabla y deja de montar `LinkOrgChart`.

- [ ] **Step 4: Correr el caso**

Run: `npx vitest run src/lib/admin/tablero/snapshot.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/admin/tablero/snapshot.ts src/lib/admin/tablero/types.ts src/lib/admin/tablero/snapshot.test.ts src/app/admin/tablero/link-org-table.tsx src/app/admin/tablero/board.tsx
git commit -m "feat: list each organization's registered and pending links"
```

## Task 6: Las últimas empresas que confirmaron

**Files:**
- Create: `src/lib/admin/tablero/recent-confirms.ts`
- Create: `src/lib/admin/tablero/recent-confirms.test.ts`
- Create: `src/lib/admin/tablero/load-recent.ts`
- Create: `src/app/admin/tablero/recent-confirms.tsx`
- Modify: `src/app/admin/page.tsx`
- Modify: `src/app/admin/tablero/board.tsx`

Una fila es `{ companyId, name, sector, organization, at }`. Máximo 10, de la más reciente a la más vieja. El hecho es `crm_events.event = confirmar`. La empresa se encuentra por el correo del contacto, igual que `pendingLinkEmails`. Si el contacto no tiene empresa, esa fila no entra.

- [ ] **Step 1: Escribir el corte**

```ts
import { describe, expect, it } from "vitest";
import { recentConfirms } from "./recent-confirms";

describe("últimas confirmaciones", () => {
  it("deja diez, la más nueva primero, y salta a quien no tiene empresa", () => {
    const rows = recentConfirms([
      { contactId: "a", occurredAt: "2026-11-10T19:00:00.000Z" },
      { contactId: "b", occurredAt: "2026-11-11T19:00:00.000Z" },
      { contactId: "c", occurredAt: "2026-11-12T19:00:00.000Z" },
    ], {
      a: { companyId: "ca", name: "Uno", sector: "Turismo", organization: "Norte" },
      c: { companyId: "cc", name: "Tres", sector: "Logística", organization: "Sur" },
    });
    expect(rows.map((row) => row.name)).toEqual(["Tres", "Uno"]);
  });
});
```

- [ ] **Step 2: Correrlo y ver que falla**

Run: `npx vitest run src/lib/admin/tablero/recent-confirms.test.ts`

Expected: FAIL, `recentConfirms` no existe.

- [ ] **Step 3: Implementar la lista**

`recentConfirms` ordena por `occurredAt` descendente, descarta contactos sin empresa y corta en 10. `load-recent.ts` lee los hechos `confirmar`, los contactos de esos ids y las empresas cuyo dueño tiene ese correo. No selecciona el correo para pintarlo.

La tabla muestra Empresa, Sector, Organismo y fecha `createdLabel`. Empresa enlaza a `/admin/empresas/${companyId}`. Sin filas: «Todavía no hay empresas confirmadas.»

`page.tsx` carga la lista junto al tablero y `board.tsx` la pone debajo de las tarjetas de enlace.

- [ ] **Step 4: Correr el caso**

Run: `npx vitest run src/lib/admin/tablero/recent-confirms.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/admin/tablero/recent-confirms.ts src/lib/admin/tablero/recent-confirms.test.ts src/lib/admin/tablero/load-recent.ts src/app/admin/tablero/recent-confirms.tsx src/app/admin/page.tsx src/app/admin/tablero/board.tsx
git commit -m "feat: list the latest companies that were confirmed"
```

## Qué no entra

No se mueve a nadie de Tecnología a esta sesión. No se cambia la regla del cupo. No se carga una lista de Excel. El orden «primero sesión, luego sectores del enlace» sigue en `docs/deuda-tecnica-enlace-por-sesion.md`.
