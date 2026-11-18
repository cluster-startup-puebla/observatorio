# Formulario v2 en /metodologia Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar las 18 preguntas de `/metodologia` por el instrumento v2 (22 generales más 19 del sector), con el borrador en el teléfono, un solo envío del cuestionario y su nota a Supabase, y un tablero del superadmin con cuántos empezaron y cuántos acabaron.

**Architecture:** El banco es JSON estático. El teléfono recibe el nivel 1 y solo el nivel 2 de su instrumento. Cada respuesta se escribe en `localStorage` y «Continuar» no espera red. Supabase guarda una fila por persona: el JSON de respuestas y, al terminar, la calificación. Esa fila se manda al contestar la primera, al cerrar el general, al terminar y cuando vuelve la conexión. El tablero lee dos conteos; el promedio se pide aparte, cuando el superadmin lo abre. No hay Realtime.

**Tech Stack:** Next.js 16, Vitest, Supabase Postgres del proyecto `jnshenkmexsxiylpqhdh`, JWT + RLS. Sin service role. Sin Realtime. Sin `react-confetti`. El plan gratis alcanza: como mucho tres upserts por persona, no uno por pregunta.

**Fuente:** `/Users/alvarocastillo/dev/metodoligia/Sin título`. Banco en `content/methodology/v2`. Motor en `lib/methodology/v2-score.ts`, `v2-report.ts`, `v2-types.ts`. Flujo en `components/diagnostico/v2-flow.tsx`.

**Este plan deja atrás** `docs/superpowers/plans/2026-11-12-metodologia-v2.md` en lo que ya no es cierto: ahí `scoring` era null, el banco traía 16 instrumentos y no había pantalla de resultado. Hoy el índice dice `n1: 22`, `n2: 399` (21 instrumentos de 19) y el motor ya reproduce las fichas. No borres el plan viejo.

**SQL:** la migración se commitea. No se aplica al proyecto remoto desde aquí. La corre Álvaro.

---

## Desayuno: 150 teléfonos y wifi lento

El teléfono es la fuente mientras contestan. Supabase es la copia.

| Momento | Qué pasa | Peticiones |
| --- | --- | --- |
| Cada respuesta | `localStorage`. Se avanza aunque no haya red. | 0 |
| Primera respuesta completa | Un upsert para que el tablero cuente «empezó». Si falla, se reintenta después. | 1 |
| Cierra el general | Otro upsert con todo el borrador. | 1 |
| Termina el sector | Un upsert con respuestas y la nota ya calculada en el teléfono. | 1 |
| Vuelve el wifi y el borrador está más nuevo que el último envío | El mismo upsert. | 1 |

150 personas por 3 envíos son 450 filas-upsert en toda la mañana. Una ráfaga al final son 150. El pool del plan gratis corre 15 consultas a la vez y acepta 200 clientes: una fila por persona entra y sale. Pregunta por pregunta serían unas 6,000 peticiones, y el wifi lento las reintenta.

Recuperar el formulario:

- Recargar o cerrar la pestaña en el mismo teléfono lee `localStorage` y abre la misma pregunta.
- Si el servidor tiene un borrador con más respuestas (otro navegador, después de un envío), gana ese.
- Si el teléfono tiene más respuestas que el servidor, gana el teléfono y no se pisa con una copia vieja.
- La nota se pinta desde el borrador local aunque el último POST haya fallado. El botón de reintento sigue ahí.

Quien nunca logró un solo POST no aparece en «empezaron». Aparece en cuanto pasa la primera respuesta con red, o en el reintento. El cuestionario en ese teléfono no se pierde.

## Estilo: no se queda el cromo del prototipo

El flujo sí se queda. El cromo no.

Lo que se conserva, porque es el instrumento:

- Una pregunta por pantalla, botón Anterior y Continuar fijo abajo.
- Cortina entre el general y el del sector.
- Widgets que el banco ya usa: `single_select`, `likert_5` (solo en nivel 1, 5 preguntas), `rank`, `single_select_text`, `multi_select` (química, TICs, educación, SOFOM, inmobiliario).
- Resultado: nota, banda, de dónde sale, pentágono del entorno, operación, sofisticación, bienes de club y los pasos de la hoja de ruta.

Lo que no entra:

- Rosa `#FF1493`, arcoíris de módulo (`#BE185D`, `#C2410C`, `#0F766E`, `#6D28D9`, `#1D4ED8`), metales con hex propio, `rounded-2xl` y `text-muted-foreground`.
- Confetti, «Volver a empezar» y el selector de empresas de ejemplo (`V2_EXAMPLES`, `openExample`).
- El flujo v1 (`diagnostico-flow.tsx`, `evaluation-app.tsx`, `lib/storage.ts`, `lib/supabase-responses.ts`), la página `/stash`, `/componentes` y los `.docx`.
- `v2-bank.ts`, que importa los 21 JSON en un solo módulo.

Tokens de esta app, en `src/app/globals.css`:

- General y opción elegida del nivel 1: `bg-brand text-white`.
- Sector, cortina y opción elegida del nivel 2: `bg-navy text-white`.
- Opción en reposo: `border border-line bg-surface text-ink`.
- Texto: `text-h2`, `text-body`, `text-small`, `text-ink`, `text-ink-secondary`.
- Resultado: `border border-line bg-surface-subtle`.

El Likert deja las caras. El seleccionado usa `bg-brand` o `bg-navy`. `Face` se pinta con `currentColor`.

## Qué no se toca

- `src/app/admin/metodologia/**` y `src/lib/methodology/instrument.ts`. El CRUD del instrumento de 18 sigue. El tablero nuevo es otra ruta.
- `src/app/metodologia/diagnostico/route.ts`. El test de recarga exige `redirectIfEventClosed` ahí.
- `prepareMetodologiaReload` y `MetodologiaReloadNotice` siguen en `src/app/metodologia/page.tsx`. `metodologia-reload.test.ts` lee esas dos cadenas, y `onboarding-gate.test.ts` lee `redirectUnfinishedEmpresario`.
- `public.answers` no se usa para este instrumento.

## Qué prueba un insert y qué no

Hay una migración, `supabase/migrations/20261117120000_methodology_v2_runs.sql`. No se aplica al remoto desde los tests. El Playwright de este repo arranca con `DIRECTORY=memory` y `AUTH_PROVIDER=memory`, así que no hay un Postgres de CI contra el cual insertar.

La consistencia del insert la prueba `applyRun`: primera fila, mismo perfil no duplica, el arranque no se mueve, un envío viejo no pisa, el cierre guarda la nota y un envío posterior no la borra. El route de Supabase y el almacén de memoria llaman esa función. El e2e inserta de verdad en el almacén de memoria, que vive en el proceso del `next dev`, y lo lee por `GET /test/runs` (404 si no es memoria).

Los tests que solo leen el archivo fuente (`runs-sql`, widgets, la forma del route) no cuentan como prueba de insert.

`e2e/metodologia.spec.ts` hoy espera las 18 preguntas, el radio «Papel/Bitácoras» y la descarga `diagnostico.txt`. Hay que reescribirlo en la Task 23. Si se deja, el e2e queda rojo.

## Cómo se parte el trabajo

Cada tarea deja un commit que se prueba solo. Ninguna tarea abre el formulario y el tablero a la vez. Ninguna tarea copia el motor entero: el fuente `v2-score.ts` tiene 218 líneas y `v2-report.ts` 211, y aquí cada archivo nuevo queda bajo 90.

## Mapa de archivos

Los JSON no cuentan para el límite de 90.

- Create: `src/content/methodology/v2/` — `index.json`, `n1.json`, `n2/*.json` con su `roadmap`.
- Create: `src/lib/methodology/v2/types.ts`
- Create: `src/lib/methodology/v2/bands.ts` — `bandFor`, `levelStepFor`.
- Create: `src/lib/methodology/v2/ordinal.ts`
- Create: `src/lib/methodology/v2/score.ts` — `scoreV2`.
- Create: `src/lib/methodology/v2/sat.ts` — `techItemScore`.
- Create: `src/lib/methodology/v2/live.ts` — `scoreLive`.
- Create: `src/lib/methodology/v2/examples.ts` — solo tests.
- Create: `src/lib/methodology/v2/readings.ts`
- Create: `src/lib/methodology/v2/report.ts`
- Create: `src/lib/methodology/v2/sector-map.ts`
- Create: `src/lib/methodology/v2/sequence.ts`
- Create: `src/lib/methodology/v2/complete.ts`
- Create: `src/lib/methodology/v2/load-sector.ts`
- Create: `src/lib/methodology/v2/draft.ts` — leer y escribir el borrador.
- Create: `src/lib/methodology/v2/recover.ts` — cuál borrador gana.
- Create: `src/lib/methodology/v2/flush.ts` — cuándo sí se manda.
- Create: `src/lib/methodology/v2/apply-run.ts` — la fila que se inserta o se actualiza.
- Create: `src/lib/methodology/v2/memory-runs.ts` — el mismo insert, en el proceso de los e2e.
- Create: `supabase/migrations/20261117120000_methodology_v2_runs.sql`
- Create: `src/app/api/metodologia/envio/route.ts`
- Create: `src/app/test/runs/route.ts` — lectura de ese almacén, solo con `DIRECTORY=memory`.
- Modify: `e2e/metodologia.spec.ts` — el spec de las 18 preguntas se reemplaza.
- Create: `src/components/methodology/v2/` — widgets, formulario, cortina, resultado.
- Create: `src/lib/admin/diagnosticos/tally.ts`
- Create: `src/lib/admin/diagnosticos/summary.ts`
- Create: `src/app/admin/diagnosticos/page.tsx`
- Create: `src/app/admin/diagnosticos/refresh.tsx`
- Create: `src/app/admin/diagnosticos/averages.tsx`
- Create: `src/app/api/admin/diagnosticos/promedio/route.ts`
- Modify: `src/app/metodologia/page.tsx`
- Modify: `src/components/admin/nav.ts` — enlace «Diagnósticos» en Operación.

## Sector

La empresa ya trae sector. No se abre el picker de 18 grupos.

| Slug en el Observatorio | Instrumento |
| --- | --- |
| `automotriz-y-autopartes` | `automotriz` |
| `agroindustria` | `agricola-pecuaria` |
| `alimentos-y-bebidas` | `alimentos` |
| `plasticos-y-hule` | `plasticos` |
| `metalmecanica` | `metalmecanica` |
| `mueble-y-madera` | `muebles` |
| `gastronomia` | `gastronomia` |
| `dispositivos-medicos` | `dispositivos` |
| `construccion` | `construccion` |
| `logistica` | `logistica` |
| `artes-graficas-y-empaque` | `artes-graficas` |
| `quimica` | `quimica` |
| `tecnologia-y-servicios-de-ti` | `tics` |

| Slug | Opciones, una pregunta antes del formulario |
| --- | --- |
| `textil-y-confeccion` | `textiles`, `confeccion` |
| `turismo` | `turismo`, `agencias` |

`minerales-no-metalicos` no tiene instrumento. La página dice «Este sector todavía no tiene diagnóstico».

`medico-hospitalario`, `inmobiliario`, `sofom` y `educacion` se copian y no se ofrecen. `load-sector.ts` los tiene en la lista cerrada.

`MOD0-WEB-01` no se pregunta cuando el mapa es de uno. El borrador la guarda como `{ kind: "single", optionValue: instrumentId }` antes de la primera pregunta visible.

---

### Task 1: Copiar el banco y los tipos

**Files:**
- Create: `src/content/methodology/v2/**`
- Create: `src/lib/methodology/v2/types.ts`
- Test: `src/lib/methodology/v2/bank.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import index from "@/content/methodology/v2/index.json";

it("el banco trae 22 generales y 21 instrumentos de 19", () => {
  expect(index.counts).toEqual({ n1: 22, n2: 399 });
  expect(index.sectorQuestionId).toBe("MOD0-WEB-01");
  expect(index.instruments).toHaveLength(21);
  const n1 = JSON.parse(readFileSync("src/content/methodology/v2/n1.json", "utf8"));
  expect(n1.questions).toHaveLength(22);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/methodology/v2/bank.test.ts`
Expected: FAIL because `index.json` does not exist.

- [ ] **Step 3: Copy the bank and the types**

```bash
mkdir -p src/content/methodology/v2/n2 src/lib/methodology/v2
cp "/Users/alvarocastillo/dev/metodoligia/Sin título/content/methodology/v2/index.json" src/content/methodology/v2/index.json
cp "/Users/alvarocastillo/dev/metodoligia/Sin título/content/methodology/v2/n1.json" src/content/methodology/v2/n1.json
cp "/Users/alvarocastillo/dev/metodoligia/Sin título/content/methodology/v2/n2/"*.json src/content/methodology/v2/n2/
cp "/Users/alvarocastillo/dev/metodoligia/Sin título/lib/methodology/v2-types.ts" src/lib/methodology/v2/types.ts
```

`types.ts` no importa nada. Si el archivo copiado trae un import con sufijo `.ts`, quítalo.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/methodology/v2/bank.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/content/methodology/v2 src/lib/methodology/v2/types.ts src/lib/methodology/v2/bank.test.ts
git commit -m "feat: bring the v2 question bank into the app"
```

### Task 2: Bandas y ordinal

**Files:**
- Create: `src/lib/methodology/v2/bands.ts`
- Create: `src/lib/methodology/v2/ordinal.ts`
- Test: `src/lib/methodology/v2/bands.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { expect, it } from "vitest";
import { bandFor } from "./bands";
import { ordinalScore } from "./ordinal";

it("los cortes de banda son inclusivos en 85, 70 y 50", () => {
  expect(bandFor(85)).toBe("platino");
  expect(bandFor(84.99)).toBe("oro");
  expect(bandFor(70)).toBe("oro");
  expect(bandFor(50)).toBe("plata");
  expect(bandFor(49.99)).toBe("bronce");
});

it("el ordinal de cuatro opciones es 25, 50, 75 y 100", () => {
  expect(ordinalScore("INO-01", 0)).toBe(25);
  expect(ordinalScore("INO-01", 3)).toBe(100);
  expect(() => ordinalScore("INO-01", 4)).toThrow(/INO-01/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/methodology/v2/bands.test.ts`
Expected: FAIL

- [ ] **Step 3: Write the two modules**

`bands.ts` exporta `V2Band` (`"platino" | "oro" | "plata" | "bronce"`), `bandFor` y `levelStepFor` como en `v2-score.ts` líneas 3, 52–57 y 207–218. `V2LevelStep` vive aquí: `{ band, min, max, actions }`. Un puntaje en el borde del rango pertenece al nivel más alto.

`ordinal.ts`:

```ts
export const V2_ORDINAL_SCORES = [25, 50, 75, 100] as const;

export function ordinalScore(id: string, index: number): number {
  if (!Number.isInteger(index) || index < 0 || index >= V2_ORDINAL_SCORES.length) {
    throw new Error(`Option index ${index} has no ordinal score for question: ${id}`);
  }
  return V2_ORDINAL_SCORES[index];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/methodology/v2/bands.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/methodology/v2/bands.ts src/lib/methodology/v2/ordinal.ts src/lib/methodology/v2/bands.test.ts
git commit -m "feat: add the v2 band cuts and the four-step ordinal"
```

### Task 3: Nota de la ficha

**Files:**
- Create: `src/lib/methodology/v2/score.ts`
- Create: `src/lib/methodology/v2/examples.ts`
- Test: `src/lib/methodology/v2/score-ficha.test.ts`

- [ ] **Step 1: Write the failing test**

Copia los tests de `scoreV2` (líneas 64–367 de `lib/methodology/v2-score.test.ts` en el prototipo) a `score-ficha.test.ts`. Cabecera:

```ts
import { expect, it } from "vitest";
import { scoreV2 } from "./score";
```

`assert.equal(a, b)` pasa a `expect(a).toBe(b)`. `assert.throws(() => ..., /ED-03/)` pasa a `expect(() => ...).toThrow(/ED-03/)`. Los tipos salen de `./types`. `V2_EXAMPLES` sale de `./examples`.

`examples.ts` es la copia de `v2-examples.ts` con imports a `./score` y `./types`. Ninguna pantalla lo importa.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/methodology/v2/score-ficha.test.ts`
Expected: FAIL with `scoreV2` not exported.

- [ ] **Step 3: Port scoreV2**

`score.ts` exporta `scoreV2` desde las líneas 16–86 de `v2-score.ts`. Importa `bandFor` de `./bands`. Nivel 1 se pondera con las medias sin redondear: `0.4 * edRaw + 0.3 * inoRaw + 0.3 * comRaw`. Nivel 2 es `0.5 * ismsNivel1 + 0.5 * satNivel2`. P5 con respuesta de texto vale 60. Deja el comentario de por qué no se ponderan los componentes ya redondeados.

Si el archivo pasa de 90 líneas, mueve `itemScore` y `groupMean` a `src/lib/methodology/v2/item.ts` en este mismo paso.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/methodology/v2/score-ficha.test.ts`
Expected: PASS. Automotriz, Plásticos, Hospital y Logística igual que en el prototipo.

- [ ] **Step 5: Commit**

```bash
git add src/lib/methodology/v2/score.ts src/lib/methodology/v2/examples.ts src/lib/methodology/v2/score-ficha.test.ts
# si partiste score.ts, agrega también src/lib/methodology/v2/item.ts
git commit -m "feat: reproduce the v2 ficha scores"
```

`item.ts` solo si hiciste falta partir `score.ts`.

### Task 4: Nota de una sesión real

**Files:**
- Create: `src/lib/methodology/v2/sat.ts`
- Create: `src/lib/methodology/v2/live.ts`
- Test: `src/lib/methodology/v2/score-live.test.ts`

- [ ] **Step 1: Write the failing test**

Copia desde la línea 369 de `v2-score.test.ts` (`scoreLive: ...`) a `score-live.test.ts`, en Vitest, importando `scoreLive` de `./live` y `ordinalScore` de `./ordinal`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/methodology/v2/score-live.test.ts`
Expected: FAIL

- [ ] **Step 3: Port the live scorer**

`sat.ts` exporta `techItemScore` con `SAT_ID_PATTERN`, `SYNTHETIC_SAT_IDS`, `satSlot`, `FIVE_STEP` y `satItemScore` (líneas 115–142 de `v2-score.ts`). P5 vale 60. Un `checks` en el slot 1 es `Math.min(100, selected.length * 20)`. TECH-06 y TECH-07 usan `ordinalScore`.

`live.ts` exporta `V2LiveScore` y `scoreLive` (líneas 103–113 y 153–205). Un ED, INO o COM sin respuesta lanza `Missing answer: <id>`. Un TECH sin respuesta entra en `missing` y deja `satNivel2`, `ismsNivel2`, `ib` y `band` en null. INO y COM sin `option.score` usan el ordinal.

Si `live.ts` pasa de 90, `liveGroupMean` se queda en `item.ts`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/methodology/v2/score-live.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/methodology/v2/sat.ts src/lib/methodology/v2/live.ts src/lib/methodology/v2/score-live.test.ts
git commit -m "feat: score a partial v2 session without inventing the sector half"
```

### Task 5: Lecturas de tecnología y brecha

**Files:**
- Create: `src/lib/methodology/v2/readings.ts`
- Test: `src/lib/methodology/v2/readings.test.ts`

- [ ] **Step 1: Write the failing test**

Del `v2-report.test.ts` del prototipo, copia solo los casos de `useReading`, `frontierReading` y `gapZone`.

```ts
import { expect, it } from "vitest";
import { gapZone, useReading } from "./readings";

it("una brecha de más de 10 es falsa complacencia", () => {
  expect(gapZone(10.01)).toBe("Falsa complacencia");
  expect(gapZone(-10.01)).toBe("Cautela");
  expect(gapZone(0)).toBe("Alineado");
});

it("aprovechar 100 no pide comprar más", () => {
  expect(useReading(100).body).toContain("100%");
});
```

Completa con los casos que ya trae el prototipo para 80, 60, 40 y por debajo de 40. No cambies los textos.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/methodology/v2/readings.test.ts`
Expected: FAIL

- [ ] **Step 3: Port the readings**

`readings.ts` exporta `useReading`, `frontierReading` y `gapZone` con los cortes del fuente: 0–39, 40–59, 60–79, 80–99, 100. Brecha `> 10` falsa complacencia, `< -10` cautela, el resto alineado.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/methodology/v2/readings.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/methodology/v2/readings.ts src/lib/methodology/v2/readings.test.ts
git commit -m "feat: add the v2 technology and gap readings"
```

### Task 6: Informe de la operación

**Files:**
- Create: `src/lib/methodology/v2/report.ts`
- Test: `src/lib/methodology/v2/report.test.ts`

- [ ] **Step 1: Write the failing test**

El resto de `v2-report.test.ts`, en Vitest, con `buildReport` desde `./report`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/methodology/v2/report.test.ts`
Expected: FAIL

- [ ] **Step 3: Port buildReport**

`report.ts` exporta `V2Report`, `V2Friction`, `V2NamedChoice` y `buildReport`. Importa `techItemScore` de `./sat` y `gapZone` de `./readings`. Perfil, fricciones, subuso, frontera, control, trazabilidad, `CP-` y `COL-` se quedan como en el fuente.

Si pasa de 90, `choiceLabel`, `topRanks` y `frictionTitle` van a `src/lib/methodology/v2/report-text.ts` en este paso.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/methodology/v2/report.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/methodology/v2/report.ts src/lib/methodology/v2/report-text.ts src/lib/methodology/v2/report.test.ts
git commit -m "feat: build the v2 operation report from saved answers"
```

Incluye `report-text.ts` solo si lo partiste.

### Task 7: Mapa de sector

**Files:**
- Create: `src/lib/methodology/v2/sector-map.ts`
- Test: `src/lib/methodology/v2/sector-map.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { expect, it } from "vitest";
import { instrumentChoice } from "./sector-map";

it("plásticos abre un solo instrumento", () => {
  expect(instrumentChoice("plasticos-y-hule")).toEqual({ kind: "one", id: "plasticos" });
});

it("textil pregunta hilados o confección", () => {
  expect(instrumentChoice("textil-y-confeccion")).toEqual({
    kind: "pick",
    ids: ["textiles", "confeccion"],
  });
});

it("turismo pregunta hospitalidad o agencias", () => {
  expect(instrumentChoice("turismo")).toEqual({ kind: "pick", ids: ["turismo", "agencias"] });
});

it("minerales no inventa un instrumento", () => {
  expect(instrumentChoice("minerales-no-metalicos")).toEqual({ kind: "none" });
});

it("química y TICs ya tienen instrumento", () => {
  expect(instrumentChoice("quimica")).toEqual({ kind: "one", id: "quimica" });
  expect(instrumentChoice("tecnologia-y-servicios-de-ti")).toEqual({ kind: "one", id: "tics" });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/methodology/v2/sector-map.test.ts`
Expected: FAIL

- [ ] **Step 3: Write the map**

```ts
export type InstrumentChoice =
  | { kind: "one"; id: string }
  | { kind: "pick"; ids: [string, string] }
  | { kind: "none" };

const one: Record<string, string> = {
  "automotriz-y-autopartes": "automotriz",
  agroindustria: "agricola-pecuaria",
  "alimentos-y-bebidas": "alimentos",
  "plasticos-y-hule": "plasticos",
  metalmecanica: "metalmecanica",
  "mueble-y-madera": "muebles",
  gastronomia: "gastronomia",
  "dispositivos-medicos": "dispositivos",
  construccion: "construccion",
  logistica: "logistica",
  "artes-graficas-y-empaque": "artes-graficas",
  quimica: "quimica",
  "tecnologia-y-servicios-de-ti": "tics",
};

export function instrumentChoice(slug: string): InstrumentChoice {
  if (slug === "textil-y-confeccion") return { kind: "pick", ids: ["textiles", "confeccion"] };
  if (slug === "turismo") return { kind: "pick", ids: ["turismo", "agencias"] };
  const id = one[slug];
  return id ? { kind: "one", id } : { kind: "none" };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/methodology/v2/sector-map.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/methodology/v2/sector-map.ts src/lib/methodology/v2/sector-map.test.ts
git commit -m "feat: map each company sector to one v2 instrument"
```

### Task 8: Secuencia y respuesta completa

**Files:**
- Create: `src/lib/methodology/v2/sequence.ts`
- Create: `src/lib/methodology/v2/complete.ts`
- Test: `src/lib/methodology/v2/sequence.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { expect, it } from "vitest";
import n1 from "@/content/methodology/v2/n1.json";
import automotriz from "@/content/methodology/v2/n2/automotriz.json";
import { complete } from "./complete";
import { sessionQuestions } from "./sequence";
import type { V2Question } from "./types";

it("automotriz contesta 21 generales y sus 19", () => {
  const questions = sessionQuestions(
    n1.questions as V2Question[],
    automotriz.questions as V2Question[],
    "MOD0-WEB-01",
  );
  expect(questions.filter((question) => question.level === "n1")).toHaveLength(21);
  expect(questions.filter((question) => question.level === "n2")).toHaveLength(19);
  expect(questions.some((question) => question.id === "MOD0-WEB-01")).toBe(false);
});

it("un ranking incompleto no deja continuar", () => {
  const question = {
    id: "R",
    level: "n1",
    sectorId: null,
    section: "s",
    widget: "w",
    title: "t",
    prompt: "p",
    microcopy: null,
    type: "rank",
    prefilled: false,
    factors: [
      { id: "a", label: "A" },
      { id: "b", label: "B" },
    ],
  } as V2Question;
  expect(complete(question, { kind: "rank", ranks: { a: 1 } })).toBe(false);
  expect(complete(question, { kind: "rank", ranks: { a: 1, b: 2 } })).toBe(true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/methodology/v2/sequence.test.ts`
Expected: FAIL

- [ ] **Step 3: Write sequence and complete**

```ts
import type { V2Question } from "./types";

export function sessionQuestions(n1: V2Question[], n2: V2Question[], sectorQuestionId: string) {
  return [...n1.filter((question) => question.id !== sectorQuestionId), ...n2];
}
```

`complete.ts`:

```ts
import type { V2Answer, V2Question } from "./types";

export function complete(question: V2Question, answer: V2Answer | undefined): boolean {
  if (!answer) return false;
  if (question.type === "multi_select") return answer.kind === "checks";
  if (question.type === "rank") {
    if (answer.kind !== "rank" || !question.factors) return false;
    const ranks = question.factors.map((factor) => answer.ranks[factor.id]);
    if (ranks.some((rank) => rank == null)) return false;
    return new Set(ranks).size === question.factors.length;
  }
  if (question.type === "single_select_text") {
    if (answer.kind !== "text" || !answer.optionValue) return false;
    if (question.text?.optionValue && answer.optionValue === question.text.optionValue) {
      return answer.text.trim().length > 0;
    }
    return true;
  }
  return answer.kind === "single" && answer.optionValue.length > 0;
}
```

Un `multi_select` con `selected: []` cuenta como completo. Así está el prototipo.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/methodology/v2/sequence.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/methodology/v2/sequence.ts src/lib/methodology/v2/complete.ts src/lib/methodology/v2/sequence.test.ts
git commit -m "feat: build the v2 question sequence for one sector"
```

### Task 9: Cargar solo el nivel 2 de un instrumento

**Files:**
- Create: `src/lib/methodology/v2/load-sector.ts`
- Test: `src/lib/methodology/v2/load-sector.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

it("el cargador lista los 21 instrumentos y no arma la ruta con el id suelto", () => {
  const source = readFileSync("src/lib/methodology/v2/load-sector.ts", "utf8");
  expect(source).toContain('import("@/content/methodology/v2/n2/automotriz.json")');
  expect(source).toContain('import("@/content/methodology/v2/n2/educacion.json")');
  expect(source).not.toContain("n2/${");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/methodology/v2/load-sector.test.ts`
Expected: FAIL

- [ ] **Step 3: Write the loader**

Un objeto con los 21 ids de `index.json`. Cada valor es `() => import("@/content/methodology/v2/n2/<id>.json")` con el id escrito en el código. `loadSector(id)` regresa `{ questions, roadmap }` o null si el id no está. No interpoles el id dentro del import.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/methodology/v2/load-sector.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/methodology/v2/load-sector.ts src/lib/methodology/v2/load-sector.test.ts
git commit -m "feat: load one sector instrument instead of the whole bank"
```

### Task 10: Borrador en el teléfono

**Files:**
- Create: `src/lib/methodology/v2/draft.ts`
- Test: `src/lib/methodology/v2/draft.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { expect, it } from "vitest";
import { draftKey, readDraft, writeDraft, type DraftStore } from "./draft";

function memory(): DraftStore {
  const box = new Map<string, string>();
  return {
    getItem: (key) => box.get(key) ?? null,
    setItem: (key, value) => box.set(key, value),
  };
}

it("guarda y recupera el índice y las respuestas de esa persona", () => {
  const store = memory();
  writeDraft(store, "profile-1", {
    instrumentId: "alimentos",
    answers: { "ED-01": { kind: "single", optionValue: "a" } },
    index: 3,
    phase: "general",
    updatedAt: "2026-11-18T14:00:00.000Z",
    sentAt: null,
  });
  expect(readDraft(store, "profile-1")?.index).toBe(3);
  expect(readDraft(store, "profile-2")).toBeNull();
  expect(draftKey("profile-1")).toBe("metodologia-v2:profile-1");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/methodology/v2/draft.test.ts`
Expected: FAIL

- [ ] **Step 3: Write the draft**

```ts
import type { V2Answers } from "./types";

export type V2Phase = "general" | "curtain" | "sector" | "done";

export type V2Draft = {
  instrumentId: string;
  answers: V2Answers;
  index: number;
  phase: V2Phase;
  updatedAt: string;
  sentAt: string | null;
};

export type DraftStore = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

export function draftKey(profileId: string) {
  return `metodologia-v2:${profileId}`;
}

export function readDraft(store: DraftStore, profileId: string): V2Draft | null {
  const raw = store.getItem(draftKey(profileId));
  if (!raw) return null;
  const parsed = JSON.parse(raw) as V2Draft;
  if (!parsed || parsed.instrumentId == null || parsed.answers == null) return null;
  return parsed;
}

export function writeDraft(store: DraftStore, profileId: string, draft: V2Draft) {
  store.setItem(draftKey(profileId), JSON.stringify(draft));
}
```

El cliente le pasa `window.localStorage`. Esta tarea no toca el DOM.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/methodology/v2/draft.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/methodology/v2/draft.ts src/lib/methodology/v2/draft.test.ts
git commit -m "feat: keep the v2 draft on the phone"
```

### Task 11: Elegir el borrador que tiene más respuestas

**Files:**
- Create: `src/lib/methodology/v2/recover.ts`
- Test: `src/lib/methodology/v2/recover.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { expect, it } from "vitest";
import { pickDraft } from "./recover";
import type { V2Draft } from "./draft";

function draft(answers: V2Draft["answers"], updatedAt: string): V2Draft {
  return { instrumentId: "alimentos", answers, index: 0, phase: "general", updatedAt, sentAt: null };
}

it("gana el que trae más respuestas", () => {
  const local = draft({ a: { kind: "single", optionValue: "1" } }, "2026-11-18T15:00:00.000Z");
  const remote = draft({}, "2026-11-18T16:00:00.000Z");
  expect(pickDraft(local, remote)).toBe(local);
});

it("a igual número de respuestas gana el más nuevo", () => {
  const local = draft({ a: { kind: "single", optionValue: "1" } }, "2026-11-18T14:00:00.000Z");
  const remote = draft({ a: { kind: "single", optionValue: "2" } }, "2026-11-18T15:00:00.000Z");
  expect(pickDraft(local, remote)).toBe(remote);
});

it("sin copia local usa la del servidor", () => {
  const remote = draft({ a: { kind: "single", optionValue: "1" } }, "2026-11-18T15:00:00.000Z");
  expect(pickDraft(null, remote)).toBe(remote);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/methodology/v2/recover.test.ts`
Expected: FAIL

- [ ] **Step 3: Write pickDraft**

```ts
import type { V2Draft } from "./draft";

export function pickDraft(local: V2Draft | null, remote: V2Draft | null): V2Draft | null {
  if (!local) return remote;
  if (!remote) return local;
  const localCount = Object.keys(local.answers).length;
  const remoteCount = Object.keys(remote.answers).length;
  if (localCount !== remoteCount) return localCount > remoteCount ? local : remote;
  return local.updatedAt >= remote.updatedAt ? local : remote;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/methodology/v2/recover.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/methodology/v2/recover.ts src/lib/methodology/v2/recover.test.ts
git commit -m "feat: recover the v2 draft with the most answers"
```

### Task 12: Cuándo sí se manda al servidor

**Files:**
- Create: `src/lib/methodology/v2/flush.ts`
- Test: `src/lib/methodology/v2/flush.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { expect, it } from "vitest";
import { flushPlan } from "./flush";

const base = { phase: "general" as const, answerCount: 4, pending: true, online: true };

it("la primera respuesta avisa que empezó", () => {
  expect(flushPlan({ ...base, answerCount: 1, entering: "answer" })).toBe("start");
});

it("las respuestas de en medio no salen del teléfono", () => {
  expect(flushPlan({ ...base, entering: "answer" })).toBeNull();
});

it("la cortina y el cierre sí se mandan", () => {
  expect(flushPlan({ ...base, entering: "curtain" })).toBe("curtain");
  expect(flushPlan({ ...base, phase: "done", entering: "done" })).toBe("done");
});

it("sin red no hay envío, y al volver se reintenta si quedó pendiente", () => {
  expect(flushPlan({ ...base, online: false, entering: "curtain" })).toBeNull();
  expect(flushPlan({ ...base, pending: false, entering: "online" })).toBeNull();
  expect(flushPlan({ ...base, entering: "online" })).toBe("retry");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/methodology/v2/flush.test.ts`
Expected: FAIL

- [ ] **Step 3: Write flushPlan**

```ts
import type { V2Phase } from "./draft";

export type FlushReason = "start" | "curtain" | "done" | "retry";

export function flushPlan(input: {
  phase: V2Phase;
  answerCount: number;
  pending: boolean;
  online: boolean;
  entering: "answer" | "curtain" | "done" | "online";
}): FlushReason | null {
  if (!input.online || !input.pending) return null;
  if (input.entering === "online") return "retry";
  if (input.entering === "done") return "done";
  if (input.entering === "curtain") return "curtain";
  if (input.entering === "answer" && input.answerCount === 1) return "start";
  return null;
}
```

`pending` es verdad cuando `sentAt` es null o `updatedAt` es más nuevo que `sentAt`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/methodology/v2/flush.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/methodology/v2/flush.ts src/lib/methodology/v2/flush.test.ts
git commit -m "feat: send the v2 draft only at the start, the curtain, and the end"
```

### Task 13: Una fila por persona

**Files:**
- Create: `supabase/migrations/20261117120000_methodology_v2_runs.sql`
- Test: `src/lib/methodology/v2/runs-sql.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

it("una fila por persona, el dueño escribe la suya y el superadmin solo lee", () => {
  const sql = readFileSync("supabase/migrations/20261117120000_methodology_v2_runs.sql", "utf8");
  expect(sql).toContain("profile_id uuid primary key");
  expect(sql).toContain("answers jsonb");
  expect(sql).toContain("finished_at timestamptz");
  expect(sql).toContain("profile_id = auth.uid()");
  expect(sql).toContain("private.is_superadmin()");
  expect(sql).not.toContain("question_id text not null");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/methodology/v2/runs-sql.test.ts`
Expected: FAIL

- [ ] **Step 3: Write the migration**

```sql
create table public.methodology_v2_runs (
  profile_id uuid primary key references public.profiles (id) on delete cascade,
  instrument_id text not null,
  answers jsonb not null default '{}'::jsonb,
  cursor integer not null default 0,
  phase text not null default 'general',
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  score jsonb,
  updated_at timestamptz not null default now(),
  constraint methodology_v2_runs_phase check (phase in ('general', 'curtain', 'sector', 'done'))
);

alter table public.methodology_v2_runs enable row level security;

create policy methodology_v2_runs_own on public.methodology_v2_runs
  for all to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

create policy methodology_v2_runs_superadmin_select on public.methodology_v2_runs
  for select to authenticated
  using ((select private.is_superadmin()));

create index methodology_v2_runs_finished_idx
  on public.methodology_v2_runs (finished_at);
```

`auth.uid()` y `private.is_superadmin()` ya existen. No crees otras funciones. No apliques esta migración al remoto.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/methodology/v2/runs-sql.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20261117120000_methodology_v2_runs.sql src/lib/methodology/v2/runs-sql.test.ts
git commit -m "feat: store one v2 run per person"
```

### Task 14: La fila que se inserta

La migración de la Task 13 no se corre contra el Postgres remoto. Esta tarea prueba el insert de verdad, en memoria, con la misma función que el route va a usar en los dos modos.

**Files:**
- Create: `src/lib/methodology/v2/apply-run.ts`
- Create: `src/lib/methodology/v2/memory-runs.ts`
- Test: `src/lib/methodology/v2/apply-run.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { expect, it } from "vitest";
import { applyRun } from "./apply-run";
import { memoryRuns, resetMemoryRuns } from "./memory-runs";

const first = {
  instrumentId: "alimentos",
  answers: { "ED-01": { kind: "single" as const, optionValue: "a" } },
  index: 1,
  phase: "general" as const,
  score: null,
  updatedAt: "2026-11-18T15:00:00.000Z",
};

it("el primer envío inserta una fila, marca el arranque y no la cierra", () => {
  resetMemoryRuns();
  const result = applyRun(null, first, "2026-11-18T15:00:01.000Z");
  expect(result.wrote).toBe(true);
  expect(result.row.started_at).toBe("2026-11-18T15:00:01.000Z");
  expect(result.row.finished_at).toBeNull();
  expect(result.row.answers).toEqual(first.answers);
  expect(result.row.score).toBeNull();
  memoryRuns().set("p-1", result.row);
  expect(memoryRuns().size).toBe(1);
});

it("un segundo envío de la misma persona no abre otra fila y no mueve el arranque", () => {
  const current = memoryRuns().get("p-1")!;
  const next = applyRun(
    current,
    {
      ...first,
      answers: { ...first.answers, "ED-02": { kind: "single", optionValue: "b" } },
      index: 20,
      phase: "sector",
      updatedAt: "2026-11-18T15:30:00.000Z",
    },
    "2026-11-18T15:30:01.000Z",
  );
  expect(next.wrote).toBe(true);
  expect(next.row.started_at).toBe(current.started_at);
  expect(next.row.finished_at).toBeNull();
  expect(Object.keys(next.row.answers)).toEqual(["ED-01", "ED-02"]);
  memoryRuns().set("p-1", next.row);
  expect(memoryRuns().size).toBe(1);
});

it("un envío viejo no pisa la fila", () => {
  const current = memoryRuns().get("p-1")!;
  const stale = applyRun(current, { ...first, updatedAt: "2026-11-18T14:00:00.000Z" }, "2026-11-18T16:00:00.000Z");
  expect(stale.wrote).toBe(false);
  expect(stale.row).toBe(current);
});

it("cerrar pone la nota y el cierre, y un envío posterior no los borra", () => {
  const current = memoryRuns().get("p-1")!;
  const done = applyRun(
    current,
    {
      ...first,
      index: 40,
      phase: "done",
      score: { ismsNivel2: 72.5, band: "oro" },
      updatedAt: "2026-11-18T16:00:00.000Z",
    },
    "2026-11-18T16:00:01.000Z",
  );
  expect(done.row.finished_at).toBe("2026-11-18T16:00:01.000Z");
  expect(done.row.score).toEqual({ ismsNivel2: 72.5, band: "oro" });
  const later = applyRun(
    done.row,
    { ...first, phase: "sector", score: null, updatedAt: "2026-11-18T16:10:00.000Z" },
    "2026-11-18T16:10:01.000Z",
  );
  expect(later.row.finished_at).toBe(done.row.finished_at);
  expect(later.row.score).toEqual(done.row.score);
});

it("done sin nota numérica no cuenta como acabado", () => {
  const open = applyRun(null, { ...first, phase: "done", score: null }, "2026-11-18T16:00:01.000Z");
  expect(open.row.finished_at).toBeNull();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/methodology/v2/apply-run.test.ts`
Expected: FAIL

- [ ] **Step 3: Write applyRun and the memory map**

`apply-run.ts` exporta `RunRow`, `RunInput` y `applyRun(current, input, now)`.

- Sin fila previa: `wrote: true`, `started_at` y `updated_at` son `now`, `finished_at` null, `score` null, `answers` e `instrument_id` copiados del input, `cursor` es `index`.
- Con fila y `current.updated_at > input.updatedAt`: `{ wrote: false, row: current }`. La misma referencia.
- Con fila más vieja: se reemplazan `answers`, `cursor`, `phase`, `instrument_id` y `updated_at`. `started_at` no cambia.
- `finished_at` y `score` se llenan solo si `phase === "done"` y `typeof input.score?.ismsNivel2 === "number"`. Si ya había cierre, un envío que no trae nota no lo borra.

`memory-runs.ts` es un `Map<string, RunRow>`. `memoryRuns()` lo devuelve. `resetMemoryRuns()` hace `clear()`. `saveRun(profileId, result)` escribe solo cuando `result.wrote`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/methodology/v2/apply-run.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/methodology/v2/apply-run.ts src/lib/methodology/v2/memory-runs.ts src/lib/methodology/v2/apply-run.test.ts
git commit -m "feat: keep one consistent v2 row when a draft is saved again"
```

### Task 15: El envío único

**Files:**
- Create: `src/app/api/metodologia/envio/route.ts`
- Modify: `src/app/test/reset/route.ts`
- Test: `src/app/api/metodologia/envio/route.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

it("hace un upsert con applyRun y no calcula la nota en el servidor", () => {
  const source = readFileSync("src/app/api/metodologia/envio/route.ts", "utf8");
  expect(source).not.toContain("SERVICE_ROLE");
  expect(source).not.toContain("scoreLive");
  expect(source).toContain("applyRun");
  expect(source).toContain("saveRun");
  expect(source).toContain("createSupabaseWithAccess");
  expect(source).toContain("readAccessToken");
  expect(source).toContain("methodology_v2_runs");
  expect(source).not.toContain("profile_id: body");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/app/api/metodologia/envio/route.test.ts`
Expected: FAIL

- [ ] **Step 3: Write the route**

Menos de 90 líneas.

- Sin `readAccessToken()`, 401.
- El `profile_id` sale de `db.auth.getUser()` con ese token. Ignora cualquier `profile_id` del body.
- Body: `{ instrumentId, answers, index, phase, score, updatedAt }`. `score` es null salvo cuando `phase` es `"done"`.
- Arma el `RunInput` y llama `applyRun(current, input, new Date().toISOString())`. Si `wrote` es false, responde 200 y no escribe.
- Con `DIRECTORY === "memory"` la fila actual sale de `memoryRuns().get(profileId)` y `saveRun` la guarda. `profileId` es `readAccountId()`, no el body. Sin cookie, 401.
- Con Supabase, la fila actual es el `select` de `methodology_v2_runs` de ese `profile_id`, y el upsert escribe exactamente los campos de `result.row` (`started_at` incluido, para no moverlo). No reescribas esas reglas en el route: salen de `applyRun`.
- No llames `scoreLive`.
- `src/app/test/reset/route.ts` también llama `resetMemoryRuns()`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/app/api/metodologia/envio/route.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/api/metodologia/envio/route.ts src/app/api/metodologia/envio/route.test.ts src/app/test/reset/route.ts
git commit -m "feat: accept one v2 draft upsert per person"
```

### Task 16: Widgets con los tokens de la app

**Files:**
- Create: `src/components/methodology/v2/choice-list.tsx`
- Create: `src/components/methodology/v2/choice-with-text.tsx`
- Create: `src/components/methodology/v2/likert-five.tsx`
- Create: `src/components/methodology/v2/rank-board.tsx`
- Create: `src/components/methodology/v2/checks.tsx`
- Create: `src/components/methodology/v2/question-frame.tsx`
- Test: `src/components/methodology/v2/widgets.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

it("la opción elegida usa la marca o el navy, no un hex suelto", () => {
  const choice = readFileSync("src/components/methodology/v2/choice-list.tsx", "utf8");
  expect(choice).toContain("bg-brand");
  expect(choice).toContain("bg-navy");
  expect(choice).not.toMatch(/#[0-9A-Fa-f]{6}/);
  const frame = readFileSync("src/components/methodology/v2/question-frame.tsx", "utf8");
  expect(frame).toContain("text-ink");
  expect(frame).not.toContain("text-muted-foreground");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/methodology/v2/widgets.test.ts`
Expected: FAIL

- [ ] **Step 3: Port the widgets**

Copia la estructura de `choice-list.tsx`, `choice-with-text.tsx`, `likert-five.tsx`, `rank-board.tsx` y `question-frame.tsx` del prototipo. El tipo de opción es `V2Option` de `@/lib/methodology/v2/types`.

`choice-list.tsx` recibe `tone: "brand" | "navy"`. Seleccionado: `bg-brand text-white` o `bg-navy text-white`. Reposo: `border-line bg-surface text-ink`. Sin `style={{ backgroundColor }}`. Cada botón lleva `data-testid="opcion-v2"`. El título de `question-frame.tsx` lleva `data-testid="pregunta-v2"`.

`likert-five.tsx` ordena de mayor `score` a menor y conserva `Face` con `currentColor`. El seleccionado usa `tone`. Si pasa de 90, `Face` va a `face.tsx`.

`checks.tsx` alterna ids dentro de `selected` con el mismo tono.

`question-frame.tsx` tiene kicker, `kickerMeta`, título, hijos y pie fijo. Kicker `text-small font-semibold text-brand` o `text-navy`. Título `text-h2 text-ink`. Continuar es `btn btn-primary`. Anterior es `btn`. La barra es `h-1 bg-line` con relleno `bg-brand` o `bg-navy`. Sin `stepLabel`, `blockLabel`, `banner` ni `trailSteps`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/methodology/v2/widgets.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/methodology/v2 src/components/methodology/v2/widgets.test.ts
git commit -m "feat: restyle the v2 question widgets onto the app"
```

### Task 17: El formulario solo escribe en el teléfono

**Files:**
- Create: `src/components/methodology/v2/form.tsx`
- Create: `src/components/methodology/v2/body.tsx`
- Test: `src/components/methodology/v2/form.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

it("continuar no espera un POST", () => {
  const source = readFileSync("src/components/methodology/v2/form.tsx", "utf8");
  expect(source).toContain("writeDraft");
  expect(source).not.toContain("/api/metodologia/envio");
  expect(source).not.toContain("fetch(");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/methodology/v2/form.test.ts`
Expected: FAIL

- [ ] **Step 3: Write the form**

`form.tsx` es cliente. Recibe `profileId`, `instrumentId`, `questions`, `initial` (`V2Draft | null`). Al montar, el estado sale de `initial`. Cada cambio de respuesta llama `writeDraft(localStorage, profileId, next)` con `updatedAt` nuevo y el `sentAt` anterior, y avanza el índice cuando `complete` es verdad. Anterior baja el índice. No hay `fetch`. Si el archivo pasa de 90, el avance queda en `src/components/methodology/v2/move.ts`.

`body.tsx` elige el widget según `question.type`. `prefilled` se muestra marcada y la persona la confirma con Continuar.

Incluye en el borrador inicial la respuesta `MOD0-WEB-01`, aunque esa pregunta no se muestre.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/methodology/v2/form.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/methodology/v2/form.tsx src/components/methodology/v2/body.tsx src/components/methodology/v2/move.ts src/components/methodology/v2/form.test.ts
git commit -m "feat: keep answering the v2 form when the network drops"
```

### Task 18: Enviar en los tres momentos

**Files:**
- Create: `src/components/methodology/v2/sync.tsx`
- Modify: `src/components/methodology/v2/form.tsx`
- Test: `src/components/methodology/v2/sync.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

it("el envío usa el plan y no bloquea la pregunta siguiente", () => {
  const source = readFileSync("src/components/methodology/v2/sync.tsx", "utf8");
  expect(source).toContain("flushPlan");
  expect(source).toContain("/api/metodologia/envio");
  expect(source).toContain('toast("Sin conexión. Tus respuestas siguen en este teléfono.")');
  expect(source).toContain("online");
  expect(source).not.toContain("await fetch");
});
```

`await fetch` no debe estar en el camino de «Continuar». El POST va en una función que no se espera para pintar la siguiente pregunta. El test mira que el click no esté escrito como `await fetch`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/methodology/v2/sync.test.ts`
Expected: FAIL

- [ ] **Step 3: Write the sync**

`sync.tsx` exporta `scheduleFlush(draft, entering)`. Calcula `pending` con `sentAt` y `updatedAt`, llama `flushPlan`, y si hay razón dispara el POST con `fetch("/api/metodologia/envio").then(...)`. No escribas `await fetch`: el test lo rechaza. Al resolver en ok, `writeDraft` con `sentAt` igual a `updatedAt`. Si falla, `toast` de `sonner` con el texto de arriba y `sentAt` se queda. `window.addEventListener("online", ...)` llama `scheduleFlush` con `entering: "online"`.

`form.tsx` llama `scheduleFlush` al guardar una respuesta, sin esperarla. Sigue sin contener la cadena `fetch(` ni la ruta: eso vive en `sync.tsx`.

La nota viaja en el body solo cuando la razón es `"done"`. La calcula el llamador con `scoreLive` y la pasa ya lista. `sync.tsx` no importa `scoreLive`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/methodology/v2/sync.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/methodology/v2/sync.tsx src/components/methodology/v2/sync.test.ts src/components/methodology/v2/form.tsx
git commit -m "feat: upload the v2 draft when a checkpoint is reached"
```

### Task 19: Montar /metodologia

**Files:**
- Create: `src/app/metodologia/load-run.ts`
- Create: `src/components/methodology/v2/curtain.tsx`
- Create: `src/components/methodology/v2/pick.tsx`
- Modify: `src/app/metodologia/page.tsx`
- Test: `src/app/metodologia/page.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

it("la página deja las 18 y sigue con el aviso de recarga", () => {
  const page = readFileSync("src/app/metodologia/page.tsx", "utf8");
  expect(page).toContain("prepareMetodologiaReload");
  expect(page).toContain("MetodologiaReloadNotice");
  expect(page).toContain("redirectUnfinishedEmpresario");
  expect(page).not.toContain("SECTIONS");
  expect(page).not.toContain("persona");
  expect(page).toContain("pickDraft");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/app/metodologia/page.test.ts src/lib/auth/metodologia-reload.test.ts src/lib/auth/onboarding-gate.test.ts`
Expected: FAIL on `SECTIONS` still present. Los otros dos siguen en PASS.

- [ ] **Step 3: Mount the page**

`page.tsx` sigue en server, `export const instant = false`, bajo 90 líneas. Conserva el aviso de recarga, el gate, `AuthLogout` y `ThemeToggle`. Delega en `load-run.ts`.

`load-run.ts` lee `companies.sector_id` por `profile_id`, luego `sectors.name`, y `sectorSlug`. Devuelve `{ choice, questions, roadmap, draft }`.

- `kind: "none"`: párrafo «Este sector todavía no tiene diagnóstico».
- `kind: "pick"`: `pick.tsx` muestra las dos etiquetas de `index.instruments`. Al elegir, el id queda en el borrador.
- `kind: "one"`: el formulario abre directo.

El servidor carga `n1.json` y `loadSector(id)`. Pasa `sessionQuestions(...)`. Lee la fila propia de `methodology_v2_runs` sin traer filas de otras personas. `page.tsx` llama `pickDraft(null, remote)` para armar el borrador que baja al cliente. El cliente, al montar, vuelve a llamar `pickDraft(readDraft(localStorage), remote)` y pinta ese. La primera pintura no espera un segundo round-trip: el server ya mandó `remote`.

`curtain.tsx`: fondo `bg-navy`, título «Específico de tu sector», nombre del instrumento, botón «Entrar» con `bg-white text-navy`. Al entrar, fase `sector` y `scheduleFlush` con `entering: "curtain"`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/app/metodologia/page.test.ts src/lib/auth/metodologia-reload.test.ts src/lib/auth/onboarding-gate.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/metodologia/page.tsx src/app/metodologia/page.test.ts src/app/metodologia/load-run.ts src/components/methodology/v2/curtain.tsx src/components/methodology/v2/pick.tsx
git commit -m "feat: ask the v2 instrument on the methodology page"
```

### Task 20: Resultado en el teléfono

**Files:**
- Create: `src/components/methodology/v2/result.tsx`
- Create: `src/components/methodology/v2/score-bars.tsx`
- Create: `src/components/methodology/v2/pentagon.tsx`
- Create: `src/components/methodology/v2/steps.tsx`
- Test: `src/components/methodology/v2/result.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

it("el resultado se calcula en el teléfono y se puede reintentar el envío", () => {
  const names = ["result.tsx", "score-bars.tsx", "pentagon.tsx", "steps.tsx"];
  const source = names.map((name) => readFileSync(`src/components/methodology/v2/${name}`, "utf8")).join("\n");
  expect(source).toContain("scoreLive");
  expect(source).toContain("buildReport");
  expect(source).toContain("Reintentar envío");
  expect(source).not.toContain("confetti");
  expect(source).not.toContain("V2_EXAMPLES");
  expect(source).not.toContain("Volver a empezar");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/methodology/v2/result.test.ts`
Expected: FAIL

- [ ] **Step 3: Build the result**

`result.tsx` llama `scoreLive(questions, answers)` con el borrador. Si `ismsNivel2` es null, muestra «Faltan respuestas para la nota.» Si hay nota, `scheduleFlush` con razón `"done"` y el score en el body.

- Cifra `text-h1 text-ink` a dos decimales y la banda de `levelStepFor` (`Platino`, `Oro`, `Plata`, `Bronce`).
- `score-bars.tsx`: Entorno, Innovación, Comercial, Uso de tecnología. Track `bg-line`, relleno `bg-brand`.
- Una línea con `ismsNivel1`, `satNivel2` y `gapZone`.
- `pentagon.tsx` es el SVG de `score-pentagon.tsx` del prototipo. El acento es `var(--brand-primary)`. Ejes ED-01…ED-05: Trámites, Seguridad, Autoridad, Infraestructura, Justicia. Si falta uno, no se dibuja.
- `steps.tsx` lista las acciones sin el prefijo `Capa A` / `Capa B`, más `report.signals`. Títulos «En tu empresa» y «Con otras empresas».
- Si `sentAt` es más viejo que `updatedAt`, botón «Reintentar envío» que llama `scheduleFlush` con `entering: "done"`.

Parte los archivos para que cada uno quede bajo 90.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/methodology/v2/result.test.ts src/lib/methodology/v2/score-live.test.ts src/lib/methodology/v2/report.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/methodology/v2/result.tsx src/components/methodology/v2/score-bars.tsx src/components/methodology/v2/pentagon.tsx src/components/methodology/v2/steps.tsx src/components/methodology/v2/result.test.ts
git commit -m "feat: show the v2 score from the phone draft"
```

### Task 21: Conteos del superadmin

**Files:**
- Create: `src/lib/admin/diagnosticos/tally.ts`
- Create: `src/app/admin/diagnosticos/page.tsx`
- Create: `src/app/admin/diagnosticos/refresh.tsx`
- Modify: `src/components/admin/nav.ts`
- Test: `src/lib/admin/diagnosticos/tally.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

it("el tablero cuenta sin bajarse el JSON y se refresca cada minuto", () => {
  const tally = readFileSync("src/lib/admin/diagnosticos/tally.ts", "utf8");
  const refresh = readFileSync("src/app/admin/diagnosticos/refresh.tsx", "utf8");
  const nav = readFileSync("src/components/admin/nav.ts", "utf8");
  expect(tally).toContain('head: true');
  expect(tally).not.toContain("answers");
  expect(tally).not.toContain("score");
  expect(refresh).toContain("60_000");
  expect(refresh).toContain("Recargar");
  expect(refresh).not.toContain("channel");
  expect(refresh).not.toContain("realtime");
  expect(nav).toContain('href: "/admin/diagnosticos"');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/admin/diagnosticos/tally.test.ts src/components/admin/nav-match.test.ts`
Expected: FAIL because the files do not exist. `nav-match.test.ts` sigue en PASS: el enlace nuevo no cambia los casos que ya tiene.

- [ ] **Step 3: Write the counts**

`tally.ts`, con el cliente de la sesión del superadmin (`createSupabaseWithAccess` + `readAccessToken`):

```ts
const started = await db.from("methodology_v2_runs").select("profile_id", { count: "exact", head: true });
const finished = await db
  .from("methodology_v2_runs")
  .select("profile_id", { count: "exact", head: true })
  .not("finished_at", "is", null);
```

Devuelve `{ started: started.count ?? 0, finished: finished.count ?? 0 }`. `head: true` no descarga filas.

`page.tsx` llama `requireSuperadmin()`, pinta «Empezaron» en `data-testid="empezaron"` y «Acabaron» en `data-testid="acabaron"`, y monta `refresh.tsx`. Bajo 90 líneas. Con `DIRECTORY === "memory"`, `tally.ts` cuenta `memoryRuns()`: empezaron es el tamaño del mapa, acabaron son las filas con `finished_at`. No abre Supabase en ese modo.

`refresh.tsx` es cliente. Un `setInterval` de `60_000` llama `router.refresh()`. El botón «Recargar» llama lo mismo. Limpia el intervalo al desmontar. No abras un canal de Realtime.

En `nav.ts`, dentro de Operación y después de Registro:

```ts
{ href: "/admin/diagnosticos", label: "Diagnósticos", group: "Operación" },
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/admin/diagnosticos/tally.test.ts src/components/admin/nav-match.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/admin/diagnosticos/tally.ts src/lib/admin/diagnosticos/tally.test.ts src/app/admin/diagnosticos/page.tsx src/app/admin/diagnosticos/refresh.tsx src/components/admin/nav.ts
git commit -m "feat: count who started and who finished the v2 form"
```

### Task 22: Promedios, solo cuando se piden

**Files:**
- Create: `src/lib/admin/diagnosticos/summary.ts`
- Create: `src/app/api/admin/diagnosticos/promedio/route.ts`
- Create: `src/app/admin/diagnosticos/averages.tsx`
- Test: `src/lib/admin/diagnosticos/summary.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { expect, it } from "vitest";
import { summarize } from "./summary";

it("promedia solo las notas cerradas y cuenta las bandas", () => {
  const result = summarize([
    { instrumentId: "alimentos", score: { ismsNivel2: 80, band: "oro" } },
    { instrumentId: "alimentos", score: { ismsNivel2: 60, band: "plata" } },
    { instrumentId: "plasticos", score: null },
  ]);
  expect(result.average).toBe(70);
  expect(result.finished).toBe(2);
  expect(result.bands).toEqual({ oro: 1, plata: 1 });
  expect(result.byInstrument).toEqual([{ instrumentId: "alimentos", average: 70, finished: 2 }]);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/admin/diagnosticos/summary.test.ts`
Expected: FAIL

- [ ] **Step 3: Write the lazy summary**

`summary.ts` exporta `summarize`. Ignora `score` null. `average` es la media de `ismsNivel2` a dos decimales, o null si no hay ninguna. `byInstrument` agrupa por `instrumentId`.

La ruta `GET` exige `requireSuperadmin` por el mismo JWT. Selecciona solo `instrument_id, score` donde `finished_at` no es null. No selecciones `answers`. Responde el JSON de `summarize`. Sin service role.

`averages.tsx` es cliente. El primer render es un botón «Ver promedios». Al pulsarlo, `fetch("/api/admin/diagnosticos/promedio")` y pinta el promedio, las bandas y el promedio por instrumento. Mientras ese panel está abierto, el mismo minuto del tablero no hace falta aquí: un botón «Actualizar promedios» vuelve a pedir. Cerrado, esa petición no existe. El conteo de la Task 21 no llama esta ruta.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/admin/diagnosticos/summary.test.ts`
Expected: PASS

Y un test de fuente junto al de tally, en `src/app/api/admin/diagnosticos/promedio/route.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

it("el promedio no lee las respuestas ni usa service role", () => {
  const source = readFileSync("src/app/api/admin/diagnosticos/promedio/route.ts", "utf8");
  expect(source).toContain('select("instrument_id, score")');
  expect(source).not.toContain("answers");
  expect(source).not.toContain("SERVICE_ROLE");
});
```

Run: `npx vitest run src/app/api/admin/diagnosticos/promedio/route.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/admin/diagnosticos/summary.ts src/lib/admin/diagnosticos/summary.test.ts src/app/api/admin/diagnosticos/promedio/route.ts src/app/api/admin/diagnosticos/promedio/route.test.ts src/app/admin/diagnosticos/averages.tsx
git commit -m "feat: load v2 score averages only when the board asks"
```

### Task 23: Playwright del desayuno

El spec viejo de las 18 preguntas se borra. No se contestan las 40 en el navegador: la nota completa ya la cubre Vitest. Aquí se inserta una fila de verdad en el proceso de memoria y el tablero la cuenta.

**Files:**
- Create: `src/app/test/runs/route.ts`
- Modify: `e2e/metodologia.spec.ts`
- Modify: `src/app/metodologia/load-run.ts` — con `DIRECTORY=memory` el sector sale de `getDirectory().getAccount(readAccountId()).sectorSlug`.
- Test: `e2e/metodologia.spec.ts`

- [ ] **Step 1: Write the failing spec**

Reemplaza el contenido de `e2e/metodologia.spec.ts` por esto. Quita los tests de «Papel/Bitácoras», «1 de 18» y `diagnostico.txt`.

```ts
import { expect, test } from "@playwright/test";

test.beforeEach(async ({ request }) => {
  const response = await request.post("/test/reset");
  expect(response.ok()).toBeTruthy();
});

async function empresario(page: import("@playwright/test").Page, sector: string) {
  await page.goto(`/crear-cuenta?sector=${sector}`);
  await page.getByLabel("Correo").fill(`desayuno-${sector}@norte.mx`);
  await page.getByLabel("Contraseña", { exact: true }).fill("secreto-largo");
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await page.getByRole("radio", { name: "11–50" }).check();
  await page.getByRole("button", { name: "Terminar perfil" }).click();
  await expect(page.getByTestId("qr-listo")).toBeVisible();
}

test("recargar conserva la pregunta y el tablero cuenta un empezado", async ({ browser }) => {
  const guest = await browser.newContext();
  const page = await guest.newPage();
  await empresario(page, "alimentos-y-bebidas");
  await page.goto("/metodologia");
  const first = await page.getByTestId("pregunta-v2").textContent();
  await page.getByTestId("opcion-v2").first().click();
  await page.getByRole("button", { name: "Continuar" }).click();
  const second = await page.getByTestId("pregunta-v2").textContent();
  expect(second).not.toBe(first);
  await page.reload();
  await expect(page.getByTestId("pregunta-v2")).toHaveText(second ?? "");

  const runs = await page.request.get("/test/runs");
  expect(runs.ok()).toBeTruthy();
  const body = (await runs.json()) as { rows: { answers: Record<string, unknown>; finished_at: string | null }[] };
  expect(body.rows).toHaveLength(1);
  expect(body.rows[0].finished_at).toBeNull();
  expect(Object.keys(body.rows[0].answers).length).toBeGreaterThan(0);

  const admin = await browser.newContext();
  const panel = await admin.newPage();
  await panel.goto("/admin/signup");
  await panel.getByLabel("Correo").fill("mesa@admin.mx");
  await panel.getByLabel("Contraseña", { exact: true }).fill("secreto-largo");
  await panel.getByRole("button", { name: "Crear superadmin" }).click();
  await panel.goto("/admin/diagnosticos");
  await expect(panel.getByTestId("empezaron")).toHaveText("1");
  await expect(panel.getByTestId("acabaron")).toHaveText("0");
  await guest.close();
  await admin.close();
});

test("sin red se sigue contestando y no se abre otra fila", async ({ page }) => {
  await empresario(page, "alimentos-y-bebidas");
  await page.goto("/metodologia");
  await page.getByTestId("opcion-v2").first().click();
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.context().setOffline(true);
  await page.getByTestId("opcion-v2").first().click();
  await page.getByRole("button", { name: "Continuar" }).click();
  await expect(page.getByText("Sin conexión. Tus respuestas siguen en este teléfono.")).toBeVisible();
  const localCount = await page.evaluate(() => {
    const key = Object.keys(localStorage).find((item) => item.startsWith("metodologia-v2:"));
    if (!key) return 0;
    return Object.keys(JSON.parse(localStorage.getItem(key) ?? "{}").answers ?? {}).length;
  });
  expect(localCount).toBeGreaterThan(1);
  await page.context().setOffline(false);
  const runs = await page.request.get("/test/runs");
  const body = (await runs.json()) as { rows: unknown[] };
  expect(body.rows).toHaveLength(1);
});

test("textil elige entre dos y minerales no abre preguntas", async ({ page, request }) => {
  await empresario(page, "textil-y-confeccion");
  await page.goto("/metodologia");
  await expect(page.getByRole("button", { name: /Hilados|Confección/ })).toHaveCount(2);
  expect((await request.post("/test/reset")).ok()).toBeTruthy();
  await empresario(page, "minerales-no-metalicos");
  await page.goto("/metodologia");
  await expect(page.getByText("Este sector todavía no tiene diagnóstico")).toBeVisible();
  await expect(page.getByTestId("pregunta-v2")).toHaveCount(0);
});

test("la metodología cierra sesión y no muestra el sitio", async ({ page }) => {
  await empresario(page, "alimentos-y-bebidas");
  await page.goto("/metodologia");
  await expect(page.getByRole("button", { name: "Cerrar sesión" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Modo oscuro" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Observatorio" })).toHaveCount(0);
});
```

No recargues la página con el contexto en offline: el HTML no está en caché y la recarga no tiene de dónde bajar. La recarga se prueba con red, en el primer test. `page.tsx` conserva `AuthLogout` y `ThemeToggle`.

- [ ] **Step 2: Run the spec to verify it fails**

Run: `npx playwright test e2e/metodologia.spec.ts`
Expected: FAIL. Todavía no existe `GET /test/runs`, o el formulario no tiene los test id.

- [ ] **Step 3: Add the memory read route**

`src/app/test/runs/route.ts`: si `DIRECTORY !== "memory"`, 404. Si no, `NextResponse.json({ rows: [...memoryRuns().values()] })`. No lleva el token de nadie. `load-run.ts`, con memoria, lee `sectorSlug` de la cuenta de la cookie. `tally.ts`, con memoria, cuenta el mapa como dice la Task 21.

- [ ] **Step 4: Run the spec to verify it passes**

Run: `npx playwright test e2e/metodologia.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add e2e/metodologia.spec.ts src/app/test/runs/route.ts src/app/metodologia/load-run.ts src/lib/admin/diagnosticos/tally.ts src/app/metodologia/page.tsx
git commit -m "test: walk the v2 form offline and count the saved run"
```
