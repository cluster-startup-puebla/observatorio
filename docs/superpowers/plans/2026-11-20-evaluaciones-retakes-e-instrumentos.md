# Evaluaciones: retakes e instrumentos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que el empresario pueda volver a contestar el diagnóstico periódicamente sin borrar su historial, y que cada instrumento tenga identidad propia (#1, #2…) enlazable a sector y, si aplica, a sesión.

**Architecture:** Hoy `methodology_v2_runs.profile_id` es PK: una sola fila por persona. El retake pasa a historial: PK `id`, varias filas por perfil; la calificación “actual” es el último `phase = 'done'`. Los instrumentos siguen viviendo en JSON (`src/content/methodology/v2/`); este plan agrega un catálogo en Postgres solo para metadatos y enlaces (sector/sesión), sin mover el banco de preguntas a la DB. El PR abierto de la puerta sin aceptación ([#2](https://github.com/cluster-startup-puebla/observatorio/pull/2)) es prerequisito: sin él el retake ni siquiera abre `/metodologia`.

**Tech Stack:** Next.js App Router, Supabase Postgres + RLS, Vitest. Archivos `.ts`/`.tsx` ≤ 90 líneas.

---

## Diagnóstico (respuestas a las preguntas)

### 1. ¿La DB soporta múltiples llenados?

**No.** Migración actual:

```sql
-- supabase/migrations/20261117120000_methodology_v2_runs.sql
profile_id uuid primary key references public.profiles (id)
```

El API hace `upsert … onConflict: "profile_id"` (`src/app/api/metodologia/envio/route.ts`). Un segundo llenado **pisa** el primero. Home y empresa leen con `.maybeSingle()` (`load-home.ts`, `load-company-home.ts`). El test `runs-sql.test.ts` afirma explícitamente “una fila por persona”.

### 2. ¿Identificamos tests / se pueden dar de alta más y enlazarlos?

**Parcial.**

| Pieza | Hoy | Hueco |
| --- | --- | --- |
| Id del instrumento | texto estable (`automotriz`, `plasticos`…) en JSON | no hay `#1` de negocio en DB |
| Banco de preguntas | `n1.json` + `n2/<id>.json` | alta nueva = agregar JSON + mapa a mano |
| Sector → instrumento | `sector-map.ts` hardcodeado | no hay tabla de enlace |
| Sesión → instrumento | no existe | no se puede “este desayuno usa el #2” |
| Admin `/admin/metodologia` | bandas/secciones del instrumento **v1** (18 preguntas) | no administra v2 |

Conclusión: **sí se puede** con un catálogo + tablas de enlace; **hoy no**. Este plan lo abre sin reescribir el editor de preguntas.

---

## Decisiones cerradas

1. **Historial completo.** Cada terminación es una fila nueva. No se borra el pasado.
2. **Calificación actual** = último run con `phase = 'done'` del perfil (ordenado por `finished_at desc`, tie-break `started_at desc`).
3. **Como máximo un borrador abierto** por `(profile_id, instrument_id)` con `phase <> 'done'`. Retake con borrador abierto reanuda ese; si solo hay runs terminados, inserta uno nuevo.
4. **Comparación en UI (mínima):** en Empresa / resultado, una línea “Antes X → Ahora Y” si hay ≥ 2 terminados del mismo instrumento. Sin gráfica en este plan.
5. **Instrumentos:** tabla `methodology_instruments` con `code` entero (#1, #2…), `slug` (= id del JSON), `label`, `active`. Contenido sigue en archivos.
6. **Enlace a sector:** `methodology_instrument_sectors (instrument_id, sector_id)` reemplaza el uso runtime de `sector-map.ts` cuando haya filas; el mapa TypeScript queda como seed/fallback de migración.
7. **Enlace a sesión (opcional):** `methodology_instrument_sessions (instrument_id, session_id)`. Si una sesión tiene filas, esa sesión solo ofrece esos instrumentos; si no tiene filas, cae al enlace por sector de la empresa.
8. **Fuera de alcance:** editor visual de preguntas, mover JSON a Postgres, sistema de puntos/lavas por retake, borrar historial desde la app.
9. **Prerequisito:** mergear o reaplicar el fix de `redirectUnfinishedEmpresario` (solo `onboarded`, sin `ocupa` / `awaitingApproval`). En `develop` local todavía está el gate viejo.

## Dos tracks (se pueden cortar)

| Track | Entrega | Dependencia |
| --- | --- | --- |
| A — Retakes + historial | Pueden volver a evaluar y ver si subió la nota | Puerta de metodología |
| B — Catálogo + enlaces | Alta de instrumento #N y enlace a sector/sesión | A recomendado (runs ya tienen `instrument_id` estable) |

Si hay que cortar: **cierra A primero**. B sin A deja el catálogo sin poder re-medir.

## Mapa de archivos

**Track A**

- Create: `supabase/migrations/20261120120000_methodology_v2_runs_history.sql`
- Create: `src/lib/methodology/v2/run-history.ts`
- Create: `src/lib/methodology/v2/run-history.test.ts`
- Modify: `src/lib/methodology/v2/apply-run.ts`
- Modify: `src/lib/methodology/v2/memory-runs.ts`
- Modify: `src/app/api/metodologia/envio/route.ts`
- Modify: `src/app/metodologia/load-run-sector.ts` / `load-run.ts`
- Modify: `src/lib/app/load-home.ts`, `load-company-home.ts`, `company-score.ts`
- Modify: `src/lib/app/evaluation-banner.ts` (+ test)
- Create: `src/lib/app/retake-evaluation.ts` (+ test)
- Modify: `src/components/app/company-screen.tsx` / result view (delta)
- Modify: `src/lib/methodology/v2/runs-sql.test.ts`
- Modify: `src/lib/auth/onboarding-gate.ts` (+ test) si #2 no está mergeado

**Track B**

- Create: `supabase/migrations/20261120130000_methodology_instruments.sql`
- Create: `src/lib/methodology/v2/instrument-registry.ts` (+ test)
- Create: `src/lib/methodology/v2/resolve-instrument.ts` (+ test)
- Modify: `src/app/metodologia/load-run.ts` (elige packs vía registry)
- Create: `src/app/admin/instrumentos/page.tsx` + list/form mínimos
- Create: `src/app/api/admin/instrumentos/route.ts`
- Seed SQL desde `sector-map.ts` + `index.json`

---

## Track A — Retakes

### Task 1: Puerta de metodología (si #2 no está en develop)

**Files:**
- Modify: `src/lib/auth/onboarding-gate.ts`
- Modify: `src/lib/auth/onboarding-gate.test.ts`
- Modify: `src/lib/auth/session-redirect.test.ts` (si aún espera la regla vieja de `home.ts`)

- [ ] **Step 1: Verificar**

```bash
rg -n "seatOccupied|my_attendance_state|awaitingApproval" src/lib/auth/onboarding-gate.ts
```

Expected: si aparecen, el gate viejo sigue. Si el archivo solo chequea `!account.onboarded`, saltar a Task 2.

- [ ] **Step 2: Dejar la puerta así**

```ts
import "server-only";

import { redirect } from "next/navigation";
import { usesSupabaseAuth } from "@/lib/supabase/auth-session";
import { pathAfterSignIn } from "./home";
import { readSessionAccount } from "./session-account";

export async function redirectUnfinishedEmpresario() {
  if (!usesSupabaseAuth()) return;
  const account = await readSessionAccount();
  if (!account) redirect("/login");
  if (account.role !== "empresario") {
    redirect(pathAfterSignIn({ role: account.role, onboarded: account.onboarded }));
  }
  if (!account.onboarded) redirect("/onboarding");
}
```

- [ ] **Step 3: Test**

```ts
it("abre con onboarding terminado, sin exigir lugar en la sesión", () => {
  const gate = readFileSync("src/lib/auth/onboarding-gate.ts", "utf8");
  expect(gate).toContain("!account.onboarded");
  expect(gate).not.toContain("my_attendance_state");
  expect(gate).not.toContain("awaitingApproval");
});
```

- [ ] **Step 4: Run**

```bash
npx vitest run src/lib/auth/onboarding-gate.test.ts src/lib/auth/home.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/auth/onboarding-gate.ts src/lib/auth/onboarding-gate.test.ts src/lib/auth/session-redirect.test.ts
git commit -m "fix: open methodology without session acceptance"
```

### Task 2: Migración — historial de runs

**Files:**
- Create: `supabase/migrations/20261120120000_methodology_v2_runs_history.sql`
- Modify: `src/lib/methodology/v2/runs-sql.test.ts`

- [ ] **Step 1: Test que falle**

```ts
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

it("el historial permite varias filas por persona y un borrador abierto", () => {
  const sql = readFileSync(
    "supabase/migrations/20261120120000_methodology_v2_runs_history.sql",
    "utf8",
  );
  expect(sql).toContain("add column id uuid");
  expect(sql).toContain("primary key (id)");
  expect(sql).toContain("methodology_v2_runs_open_draft");
  expect(sql).toContain("onConflict");
  expect(sql).not.toContain("profile_id uuid primary key");
});
```

Ajusta el assert de `onConflict` si el SQL no lo menciona (solo en TS). Mejor:

```ts
  expect(sql).toContain("drop constraint methodology_v2_runs_pkey");
  expect(sql).toContain("methodology_v2_runs_open_draft");
```

- [ ] **Step 2: Run — debe fallar**

```bash
npx vitest run src/lib/methodology/v2/runs-sql.test.ts
```

Expected: FAIL (archivo de migración ausente)

- [ ] **Step 3: Migración**

```sql
-- 20261120120000_methodology_v2_runs_history.sql
alter table public.methodology_v2_runs
  add column id uuid not null default gen_random_uuid();

alter table public.methodology_v2_runs
  drop constraint methodology_v2_runs_pkey;

alter table public.methodology_v2_runs
  add primary key (id);

alter table public.methodology_v2_runs
  add column session_id uuid references public.sessions (id) on delete set null;

create index methodology_v2_runs_profile_finished_idx
  on public.methodology_v2_runs (profile_id, finished_at desc nulls last);

create unique index methodology_v2_runs_open_draft
  on public.methodology_v2_runs (profile_id, instrument_id)
  where phase <> 'done';

comment on table public.methodology_v2_runs is
  'Un run por intento. phase=done es histórico; hay a lo sumo un borrador abierto por perfil+instrumento.';
```

RLS existente (`profile_id = auth.uid()`) se conserva: no reescribir policies salvo que fallen al cambiar PK.

- [ ] **Step 4: Actualizar test viejo**

En el mismo `runs-sql.test.ts`, el caso “una fila por persona” debe leer **ambas** migraciones o solo la nueva, y afirmar historial:

```ts
it("historial: id PK, varias filas, borrador único abierto", () => {
  const base = readFileSync("supabase/migrations/20261117120000_methodology_v2_runs.sql", "utf8");
  const hist = readFileSync(
    "supabase/migrations/20261120120000_methodology_v2_runs_history.sql",
    "utf8",
  );
  expect(base).toContain("profile_id uuid primary key");
  expect(hist).toContain("drop constraint methodology_v2_runs_pkey");
  expect(hist).toContain("methodology_v2_runs_open_draft");
});
```

- [ ] **Step 5: Run**

```bash
npx vitest run src/lib/methodology/v2/runs-sql.test.ts
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/20261120120000_methodology_v2_runs_history.sql src/lib/methodology/v2/runs-sql.test.ts
git commit -m "feat: allow multiple methodology runs per profile"
```

**Nota:** Álvaro aplica la migración al remoto. No se aplica desde el agente salvo que se pida.

### Task 3: Helpers de historial (puro)

**Files:**
- Create: `src/lib/methodology/v2/run-history.ts`
- Create: `src/lib/methodology/v2/run-history.test.ts`

- [ ] **Step 1: Test**

```ts
import { describe, expect, it } from "vitest";
import { latestFinished, previousFinished, shouldStartRetake } from "./run-history";

const done = (id: string, finished: string, score = 50) => ({
  id,
  phase: "done" as const,
  finished_at: finished,
  started_at: finished,
  score: { ismsNivel2: score },
  instrument_id: "automotriz",
});

describe("run-history", () => {
  it("elige el terminado más reciente", () => {
    const rows = [done("a", "2026-01-01T00:00:00Z", 40), done("b", "2026-06-01T00:00:00Z", 70)];
    expect(latestFinished(rows)?.id).toBe("b");
    expect(previousFinished(rows)?.score.ismsNivel2).toBe(40);
  });

  it("retake solo si no hay borrador abierto", () => {
    expect(shouldStartRetake([{ phase: "sector" }])).toBe(false);
    expect(shouldStartRetake([done("a", "2026-01-01T00:00:00Z")])).toBe(true);
    expect(shouldStartRetake([])).toBe(true);
  });
});
```

- [ ] **Step 2: Run — FAIL**

```bash
npx vitest run src/lib/methodology/v2/run-history.test.ts
```

- [ ] **Step 3: Implementación**

```ts
export type HistoryRow = {
  id?: string;
  phase: string;
  finished_at?: string | null;
  started_at?: string | null;
  score?: { ismsNivel2?: number; band?: string } | null;
  instrument_id?: string;
};

function finishedTime(row: HistoryRow) {
  return row.finished_at ?? row.started_at ?? "";
}

export function latestFinished(rows: HistoryRow[]) {
  return rows
    .filter((row) => row.phase === "done")
    .sort((a, b) => finishedTime(b).localeCompare(finishedTime(a)))[0] ?? null;
}

export function previousFinished(rows: HistoryRow[]) {
  const sorted = rows
    .filter((row) => row.phase === "done")
    .sort((a, b) => finishedTime(b).localeCompare(finishedTime(a)));
  return sorted[1] ?? null;
}

export function openDraft(rows: HistoryRow[]) {
  return rows.find((row) => row.phase !== "done") ?? null;
}

export function shouldStartRetake(rows: HistoryRow[]) {
  return !openDraft(rows);
}
```

- [ ] **Step 4: Run — PASS**

```bash
npx vitest run src/lib/methodology/v2/run-history.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/methodology/v2/run-history.ts src/lib/methodology/v2/run-history.test.ts
git commit -m "feat: pick latest and previous methodology scores"
```

### Task 4: `applyRun` + memoria + API de envío

**Files:**
- Modify: `src/lib/methodology/v2/apply-run.ts`
- Modify: `src/lib/methodology/v2/memory-runs.ts`
- Modify: `src/app/api/metodologia/envio/route.ts`
- Test: `src/lib/methodology/v2/apply-run.test.ts` (crear o extender)

Comportamiento:

- Si `current` es `null` → fila nueva (insert).
- Si `current.phase === 'done'` y el cliente manda un borrador fresco (`phase !== 'done'` o `updatedAt` nuevo de retake) → **no** reutilizar esa fila: el API debe cargar el borrador abierto o insertar.
- Si `current.phase !== 'done'` → update por `id`.

- [ ] **Step 1: Extender tipo**

```ts
export type RunRow = {
  id?: string;
  instrument_id: string;
  answers: V2Answers;
  cursor: number;
  phase: V2Phase;
  started_at: string;
  finished_at: string | null;
  score: RunScore;
  updated_at: string;
  session_id?: string | null;
};
```

- [ ] **Step 2: API — leer borrador abierto o último, escribir con id**

Pseudológica en `envio/route.ts`:

```ts
const open = await db
  .from("methodology_v2_runs")
  .select(columns)
  .eq("profile_id", profileId)
  .eq("instrument_id", input.instrumentId)
  .neq("phase", "done")
  .maybeSingle();

const current = open.data
  ? toRun(open.data)
  : null; // retake: no cargar el done como current

const result = applyRun(current, input, now);
const payload = {
  profile_id: profileId,
  ...(result.row.id ? { id: result.row.id } : {}),
  ...result.row,
};
const saved = await db.from("methodology_v2_runs").upsert(payload, {
  onConflict: "id",
});
```

En memoria (`memory-runs.ts`): cambiar `Map<string, RunRow>` a `Map<string, RunRow[]>` indexado por `profileId`, o `Map` por `${profileId}:${instrumentId}:open`. Mantener ≤ 90 líneas: si crece, partir `memory-runs-store.ts`.

- [ ] **Step 3: Tests de apply/envio**

```ts
it("un run terminado no se pisa al empezar de nuevo", () => {
  const done = { /* phase done, id a */ };
  const next = applyRun(null, freshInput, now);
  expect(next.row.phase).toBe("general");
  expect(next.row.started_at).toBe(now);
});
```

- [ ] **Step 4: Run**

```bash
npx vitest run src/lib/methodology/v2/apply-run.test.ts src/app/api/metodologia/envio/route.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/methodology/v2/apply-run.ts src/lib/methodology/v2/memory-runs.ts src/app/api/metodologia/envio/route.ts src/lib/methodology/v2/apply-run.test.ts
git commit -m "feat: insert a new run when retaking methodology"
```

### Task 5: Lecturas home / empresa / loadRun

**Files:**
- Modify: `src/app/metodologia/load-run-sector.ts` (trae open draft o null; no el done como remote editable)
- Modify: `src/lib/app/load-home.ts`
- Modify: `src/lib/app/load-company-home.ts`
- Modify: `src/lib/app/company-score.ts` si hace falta
- Modify: `src/lib/app/evaluation-banner.ts` + test

- [ ] **Step 1: Banner — ya no es solo “primera vez”**

```ts
export function showEvaluationCta({
  sectorHasPack,
  finished,
  canRetake,
}: {
  sectorHasPack: boolean;
  finished: boolean;
  canRetake: boolean;
}) {
  if (!sectorHasPack) return false;
  if (!finished) return true;
  return canRetake;
}

export function evaluationCtaLabel(finished: boolean) {
  return finished ? "Vuelve a medir tu empresa" : "Realiza tu primera evaluación";
}
```

Actualizar tests: con `finished: true, canRetake: true` → true.

- [ ] **Step 2: load-home**

```ts
const runs = await db
  .from("methodology_v2_runs")
  .select("id, phase, score, finished_at, started_at, instrument_id")
  .eq("profile_id", account.id);
const latest = latestFinished(runs.data ?? []);
const finished = companyScore(latest) !== null;
showEvaluation: showEvaluationCta({
  sectorHasPack: sectorHasPackFor(sector.slug),
  finished,
  canRetake: shouldStartRetake(runs.data ?? []),
}),
```

- [ ] **Step 3: load-company-home**

Misma query de lista; `score` desde `latestFinished`; `result` desde ese run; pasar `previous` para el delta.

- [ ] **Step 4: load-run-sector remote**

```ts
// remote = open draft for profile+instrument candidates, else null
// un phase=done NO se hidrata como draft editable
```

`resumeDraft` ya ignora parcialmente el done vía `openSavedDraft`; alinear remoto para no reabrir el resultado como único camino sin CTA de retake.

- [ ] **Step 5: Run**

```bash
npx vitest run src/lib/app/evaluation-banner.test.ts src/lib/app/company-actions.test.ts
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/app/evaluation-banner.ts src/lib/app/evaluation-banner.test.ts src/lib/app/load-home.ts src/lib/app/load-company-home.ts src/app/metodologia/load-run-sector.ts
git commit -m "feat: show retake CTA from latest methodology history"
```

### Task 6: Delta en empresa + empezar retake

**Files:**
- Create: `src/lib/app/retake-evaluation.ts`
- Create: `src/lib/app/retake-evaluation.test.ts`
- Modify: `src/components/app/company-screen.tsx` o el bloque de resultado (≤ 90 líneas; partir si hace falta)
- Modify: banner copy en `evaluation-banner.tsx`

- [ ] **Step 1: Test delta**

```ts
import { scoreDelta } from "./retake-evaluation";

it("arma el texto de mejora", () => {
  expect(scoreDelta(40, 70)).toEqual({ before: 40, after: 70, improved: true });
  expect(scoreDelta(70, 40).improved).toBe(false);
  expect(scoreDelta(null, 50)).toBeNull();
});
```

```ts
export function scoreDelta(before: number | null | undefined, after: number | null | undefined) {
  if (typeof before !== "number" || typeof after !== "number") return null;
  return { before, after, improved: after > before };
}
```

- [ ] **Step 2: UI** — debajo de la nota actual:

`Antes 40.00 → Ahora 70.00` (solo si hay previous).

CTA: enlace a `/metodologia` con label de Task 5. No hace falta query param si el API inserta al primer flush; si se necesita forzar, `?retake=1` limpia localStorage del draft (`ForgetDraft` o variante).

- [ ] **Step 3: Run + commit**

```bash
npx vitest run src/lib/app/retake-evaluation.test.ts
git add src/lib/app/retake-evaluation.ts src/lib/app/retake-evaluation.test.ts src/components/app/company-screen.tsx src/components/app/evaluation-banner.tsx
git commit -m "feat: show score delta and retake label on company home"
```

---

## Track B — Catálogo e instrumentos

### Task 7: Tablas de instrumentos y enlaces

**Files:**
- Create: `supabase/migrations/20261120130000_methodology_instruments.sql`
- Create: `src/lib/methodology/v2/instrument-registry-sql.test.ts`

- [ ] **Step 1: Test SQL**

```ts
it("catálogo con code, slug y enlaces a sector y sesión", () => {
  const sql = readFileSync(
    "supabase/migrations/20261120130000_methodology_instruments.sql",
    "utf8",
  );
  expect(sql).toContain("create table public.methodology_instruments");
  expect(sql).toContain("code integer not null unique");
  expect(sql).toContain("methodology_instrument_sectors");
  expect(sql).toContain("methodology_instrument_sessions");
});
```

- [ ] **Step 2: Migración**

```sql
create table public.methodology_instruments (
  id uuid primary key default gen_random_uuid(),
  code integer not null unique,
  slug text not null unique,
  label text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.methodology_instrument_sectors (
  instrument_id uuid not null references public.methodology_instruments (id) on delete cascade,
  sector_id uuid not null references public.sectors (id) on delete cascade,
  primary key (instrument_id, sector_id)
);

create table public.methodology_instrument_sessions (
  instrument_id uuid not null references public.methodology_instruments (id) on delete cascade,
  session_id uuid not null references public.sessions (id) on delete cascade,
  primary key (instrument_id, session_id)
);

-- RLS: lectura autenticada; escritura superadmin (mismo patrón que session_sector_quotas)
```

Seed: insertar filas desde los 21 slugs de `index.json` con `code` 1..N en el orden del índice; mapear sectores con el contenido de `sector-map.ts` (resolver `sectors.slug` → `sectors.id` en SQL).

- [ ] **Step 3: Commit**

```bash
git commit -m "feat: add methodology instrument registry and link tables"
```

### Task 8: Resolver instrumento en runtime

**Files:**
- Create: `src/lib/methodology/v2/resolve-instrument.ts`
- Create: `src/lib/methodology/v2/resolve-instrument.test.ts`
- Modify: `src/app/metodologia/load-run.ts`

- [ ] **Step 1: API pura**

```ts
export type ResolvedPackIds =
  | { kind: "one"; id: string; code: number }
  | { kind: "pick"; ids: [string, string]; codes: [number, number] }
  | { kind: "none" };

export function resolveFromLinks(input: {
  sessionInstrumentSlugs: string[];
  sectorInstrumentSlugs: string[];
  fallback: ResolvedPackIds;
}): ResolvedPackIds {
  const fromSession = input.sessionInstrumentSlugs;
  if (fromSession.length === 1) return { kind: "one", id: fromSession[0], code: 0 };
  if (fromSession.length >= 2) {
    return { kind: "pick", ids: [fromSession[0], fromSession[1]], codes: [0, 0] };
  }
  const fromSector = input.sectorInstrumentSlugs;
  if (fromSector.length === 1) return { kind: "one", id: fromSector[0], code: 0 };
  if (fromSector.length >= 2) {
    return { kind: "pick", ids: [fromSector[0], fromSector[1]], codes: [0, 0] };
  }
  return input.fallback;
}
```

(Ajustar `code` cuando el loader traiga el entero real.)

- [ ] **Step 2: load-run** — si hay filas en registry, usarlas; si la query falla o está vacía (migración no aplicada), `instrumentChoice(slug)` como hoy.

- [ ] **Step 3: Tests + commit**

```bash
npx vitest run src/lib/methodology/v2/resolve-instrument.test.ts
git commit -m "feat: resolve methodology packs from registry links"
```

### Task 9: Admin mínimo de instrumentos

**Files:**
- Create: `src/app/admin/instrumentos/page.tsx`
- Create: `src/app/admin/instrumentos/instrumentos-list.tsx`
- Create: `src/app/admin/instrumentos/instrument-form.tsx`
- Create: `src/lib/admin/instrumentos/list.ts`
- Create: `src/app/api/admin/instrumentos/route.ts`
- Seguir patrón admin-screen-polish (DataList + FormSheet + ≤ 90 líneas)

Campos del alta/edición:

- `code` (#)
- `slug` (debe existir archivo en `load-sector.ts` / `n2/`; si no, Alert: “Falta el JSON del instrumento”)
- `label`
- `active`
- multi sector (`sector_id[]`)
- multi sesión opcional (`session_id[]`)

No editar preguntas aquí.

- [ ] **Step 1: Lista + form + API POST**
- [ ] **Step 2: Validar slug contra `loadSector(slug)`**
- [ ] **Step 3: Commit**

```bash
git commit -m "feat: admin screen to register and link methodology instruments"
```

### Task 10: Documentar operación

**Files:**
- Create: `docs/superpowers/plans/assets/2026-11-20-instrumentos-operacion.md` (o sección al final de este plan; no hace falta duplicar)

Checklist para Álvaro:

1. Aplicar migraciones A y B en el proyecto Supabase activo.
2. Confirmar seed: 21 instrumentos, enlaces de sector iguales a `sector-map.ts`.
3. Probar retake con `admin@…` empresario onboarded sin aceptación.
4. Alta de un instrumento nuevo: JSON en `n2/`, fila en catálogo con `#22`, enlace a un sector de prueba, contestar dos veces, ver delta.

---

## Orden de ejecución

1. Task 1 (puerta) si hace falta  
2. Tasks 2 → 6 (historial + UX retake) → **demoable**  
3. Tasks 7 → 9 (catálogo)  
4. Task 10 (ops)

## Self-review

| Requisito del usuario | Task |
| --- | --- |
| ¿DB soporta multi-fill? (hoy no → sí) | 2–4 |
| Retake periódico / ver si subió | 5–6 |
| Identificar tests (#1, #2) | 7, 9 |
| Enlazar a sector | 7–8 |
| Enlazar a sesión | 7–8, 9 |
| Puerta sin aceptación | 1 / PR #2 |

Placeholders: ninguno intencional. `code: 0` en el stub de resolve se completa en el loader con el `code` real de la fila.

---

## Qué no hacer en este plan

- Reescribir `/admin/metodologia` (v1).
- Meter las 399 preguntas n2 en Postgres.
- Forzar retake por calendario (cron); el CTA basta.
- Cambiar lavas/puntos por evaluación.
