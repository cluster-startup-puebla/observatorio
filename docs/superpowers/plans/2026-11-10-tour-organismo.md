# Tour del organismo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** La primera vez que un organismo entra a su inicio, un recorrido le explica el sector, la sesión y el botón que genera un solo enlace para su sector. Siguiente abre el CRM en la tabla donde acepta a sus invitados.

**Architecture:** La copia y el orden viven en una función pura. `driver.js` solo pinta. El paso de Generar explica el botón; no lo aprieta. Siguiente usa `router.push` hacia `/{slug}/crm?tour=1`, sin recargar el documento. La tabla del CRM siempre está en el DOM, aunque diga que todavía no hay invitaciones. Al terminar o cerrar se escribe `localStorage["org-tour-seen"] = "1"`. No hay columna en la base ni `sessionStorage`.

**Tech Stack:** Next.js 16, driver.js, Vitest.

---

Los comandos se corren desde `/Users/alvarocastillo/dev/levantamiento`.

## Recorrido

1. Sector. «Elige el sector que vas a convocar.»
2. Sesión, solo si hay al menos una. Con una sola: «Hoy la sesión es una sola, la vigente.» Con varias: «Elige la sesión. El enlace queda para la que elijas.»
3. Generar enlace. «Con este botón generas la invitación. Un solo enlace para todo tu sector.» Siguiente no aprieta el botón.
4. Siguiente abre `/{slug}/crm?tour=1` con el router del cliente y señala la tabla: «En esta tabla vas a aceptar a tus invitados.»

No se señala Copiar ni el botón Aceptar. No se recorre la gráfica ni Invitaciones. La vista del CRM por defecto ya es la tabla.

El código integrado sigue este recorrido. Los tasks de abajo son el primer corte y todavía dicen que no había paso de Generar.

## Memoria

`localStorage["org-tour-seen"]` es la única marca. Vale `"1"` al terminar o al cerrar.

`tourStart` mira la ruta, `?tour=1` y esa marca:

- Visto: `null` en cualquier página.
- Sin ver, en el inicio: `"home"`.
- Sin ver, en el CRM y con `?tour=1`: `"crm"`.
- Sin ver, en el CRM sin `?tour=1`: `null`. Entrar al CRM por el menú no abre el recorrido.

El `?tour=1` solo cruza la navegación. No sustituye la marca de visto.

## Mapa de archivos

- Create: `src/lib/organismo/tour.ts` — textos y `tourStart`.
- Create: `src/lib/organismo/tour.test.ts`
- Create: `src/components/organismo/tour/org-tour.tsx` — cliente, menos de 90 líneas.
- Create: `src/components/organismo/tour/drive.ts` — arma driver.js.
- Modify: `src/components/organismo/copy-link.tsx` — `data-tour="sector"`.
- Modify: `src/components/session-pick.tsx` — `data-tour` opcional.
- Modify: `src/components/organismo/crm-table.tsx` — `data-tour="crm"` en el contenedor de la tabla.
- Modify: `src/components/organismo/home.tsx` — monta el tour.
- Modify: `src/app/[sector]/crm/page.tsx` — monta el tour.
- Modify: `package.json` — dependencia `driver.js`.

No se toca `SheetSubmit` ni el botón Generar.

### Task 1: La función pura

**Files:**
- Create: `src/lib/organismo/tour.ts`
- Test: `src/lib/organismo/tour.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { sessionCopy, tourStart, tourSteps } from "./tour";

describe("tour del organismo", () => {
  it("la primera vez empieza en el inicio", () => {
    expect(tourStart({ path: "/canirac-puebla", tour: false, seen: false })).toBe("home");
  });

  it("no vuelve a salir si ya se vio", () => {
    expect(tourStart({ path: "/canirac-puebla", tour: false, seen: true })).toBeNull();
    expect(tourStart({ path: "/canirac-puebla/crm", tour: true, seen: true })).toBeNull();
  });

  it("el CRM solo habla cuando el inicio lo abrió", () => {
    expect(tourStart({ path: "/canirac-puebla/crm", tour: true, seen: false })).toBe("crm");
    expect(tourStart({ path: "/canirac-puebla/crm", tour: false, seen: false })).toBeNull();
  });

  it("con una sesión dice que es la única", () => {
    expect(sessionCopy(1)).toMatch(/una sola/);
    expect(sessionCopy(2)).not.toMatch(/una sola/);
  });

  it("el inicio no pide generar y el CRM señala la tabla", () => {
    expect(tourSteps("home", 1).map((step) => step.element)).toEqual(["sector", "sesion"]);
    expect(tourSteps("home", 1)[0]?.description).toMatch(/invitas a todos/);
    expect(tourSteps("crm", 0).map((step) => step.element)).toEqual(["crm"]);
    expect(tourSteps("crm", 0)[0]?.description).toMatch(/esta tabla/);
  });

  it("sin sesiones no señala la sesión", () => {
    expect(tourSteps("home", 0).map((step) => step.element)).toEqual(["sector"]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/organismo/tour.test.ts`

Expected: FAIL, `tour.ts` no existe.

- [ ] **Step 3: Write minimal implementation**

```ts
export type TourPhase = "home" | "crm";

export type TourStep = {
  element: "sector" | "sesion" | "crm";
  title: string;
  description: string;
};

export function sessionCopy(count: number) {
  if (count === 1) return "Hoy la sesión es una sola, la vigente.";
  return "Elige la sesión. El enlace queda para la que elijas.";
}

export function tourStart(input: { path: string; tour: boolean; seen: boolean }) {
  if (input.seen) return null;
  if (input.path.endsWith("/crm")) return input.tour ? "crm" : null;
  return "home";
}

export function tourSteps(phase: TourPhase, sessions: number): TourStep[] {
  if (phase === "crm") {
    return [
      {
        element: "crm",
        title: "Acepta a tus invitados",
        description: "En esta tabla vas a aceptar a tus invitados.",
        next: true,
      },
    ];
  }
  const steps: TourStep[] = [
    {
      element: "sector",
      title: "El sector",
      description:
        "Elige el sector que vas a convocar. Cuando generes el enlace y lo copies, con ese invitas a todos los de tu sector.",
      next: true,
    },
  ];
  if (sessions > 0) {
    steps.push({ element: "sesion", title: "La sesión", description: sessionCopy(sessions), next: true });
  }
  return steps;
}
```

Quita `next` del tipo si el test no lo usa. El paso del CRM y el último del inicio sí llevan Siguiente: el del inicio navega, el del CRM cierra.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/organismo/tour.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/organismo/tour.ts src/lib/organismo/tour.test.ts
git commit -m "feat: describe the organism tour steps"
```

### Task 2: Anclas y driver.js

**Files:**
- Modify: `src/components/organismo/copy-link.tsx`
- Modify: `src/components/session-pick.tsx`
- Modify: `src/components/organismo/crm-table.tsx`
- Create: `src/components/organismo/tour/drive.ts`
- Create: `src/components/organismo/tour/org-tour.tsx`
- Modify: `src/components/organismo/home.tsx`
- Modify: `src/app/[sector]/crm/page.tsx`
- Modify: `package.json`

- [ ] **Step 1: Instalar driver.js**

Run: `npm install driver.js`

- [ ] **Step 2: Marcar sector, sesión y la tabla**

En el `<select name="sector">` de `copy-link.tsx`, agregar `data-tour="sector"`.

`SessionPick` gana `tour?: string`. Si viene, el `<select>` lleva `data-tour={tour}`. `CopyLink` pasa `tour="sesion"`. Los otros usos no lo pasan.

En `crm-table.tsx`, el `div` que envuelve la tabla lleva `data-tour="crm"`.

- [ ] **Step 3: Pintar el recorrido**

`drive.ts` es cliente. Importa `driver` desde `driver.js` y `driver.js/dist/driver.css`. Botones: Siguiente, Atrás, Listo.

`org-tour.tsx` recibe `{ slug, sessions, crm, tour }`. Lee `localStorage["org-tour-seen"]` y llama `tourStart`. Si devuelve `null`, no abre nada.

En el último paso del inicio, Siguiente no marca visto: navega a `/${slug}/crm?tour=1`.

En el paso de la tabla, Listo escribe `localStorage["org-tour-seen"] = "1"`. Cerrar en cualquier paso también lo escribe, para que no vuelva a salir.

`home.tsx` monta `<OrgTour slug={slug} sessions={sessions.length} crm={false} tour={false} />`.

`crm/page.tsx` monta `<OrgTour slug={sector} sessions={0} crm tour={query.tour === "1"} />`. `searchParams` ya se leen en esa página; agrega `tour?: string` al tipo.

- [ ] **Step 4: Verlo en el navegador**

Con el storage limpio, en `/{slug}` salen sector y sesión. No aparece Generar. Siguiente abre el CRM en la tabla, con «En esta tabla vas a aceptar a tus invitados.» Listo y recargar el inicio: no sale. Borrar `org-tour-seen` y recargar: sale otra vez. Entrar al CRM por el menú, sin `?tour=1`, no abre el recorrido.

Archivos `.tsx` tocados siguen en 90 líneas o menos.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json src/components/organismo/tour src/components/organismo/home.tsx src/components/organismo/copy-link.tsx src/components/session-pick.tsx src/components/organismo/crm-table.tsx src/app/[sector]/crm/page.tsx src/lib/organismo/tour.test.ts
git commit -m "feat: walk a new organism from the sector to the CRM table"
```
