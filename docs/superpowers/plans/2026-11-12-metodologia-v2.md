# Metodología v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Montar en `/metodologia` el formulario v2 (22 preguntas generales más 19 del sector de cada empresa) para que 100 personas lo contesten a la vez en el desayuno, guardando cada respuesta en Supabase sin tumbar el Nano.

**Architecture:** El teléfono solo recibe el nivel 1 y el nivel 2 de su sector. Las respuestas viven en el navegador y se mandan en un solo upsert al pasar de pregunta, con la sesión del usuario y RLS. El nivel Bronce/Plata/Oro no se calcula todavía: `content/methodology/v2/index.json` trae `"scoring": null` y las opciones traen `"score": null`. El motor entra cuando exista el tabulador, leyendo las filas ya guardadas.

**Tech Stack:** Next.js 16, Supabase Postgres (proyecto `jnshenkmexsxiylpqhdh`, plan Nano), JWT del usuario + RLS. Sin service role. Sin Realtime.

**Fuente del formulario:** `/Users/alvarocastillo/dev/metodoligia/Sin título` (`content/methodology/v2`, `components/diagnostico/v2-flow.tsx`). Es un prototipo: el estado está en `useState` y no hay guardado.

---

## Qué cambia respecto a lo que hay hoy

Hoy `/metodologia` es otro instrumento: 18 preguntas de opción única, ids numéricos `1`–`18`, y cada clic hace `saveMethodologyForm` → `redirect`. `src/lib/supabase-directory.ts` tiene `saveAnswer: notImplemented`, así que en producción esa ruta no escribe. El esquema `questions.id integer` y `response_choices.question_id integer` no cabe con ids como `MOD0-WEB-01`.

La v2, por persona, son unas 41 preguntas, no las 326 del banco:

| Pieza | Cuántas | Dónde |
| --- | --- | --- |
| Nivel 1, todas las empresas | 22 | `n1.json` |
| Nivel 2, solo su sector | 19 | `n2/<sector>.json` |
| Banco completo | 22 + 304 | no se manda al teléfono |

Tipos que el flujo ya pinta y hay que guardar: `single_select`, `likert_5`, `rank`, `single_select_text`.

`v2-bank.ts` importa los 16 JSON de nivel 2 en el mismo módulo. En el desayuno eso metería el banco entero en el JS de cada celular. Hay que partirlo.

## Rendimiento del desayuno

Cien personas, una pregunta cada pocos segundos. El fallo no es el tamaño de la base (hoy va en 0.03 GB). El fallo es una petición por clic que además vuelve a pintar la página.

Cuenta que sí cabe en el Nano:

- Un upsert por pregunta, no por cada toque del ranking. El ranking se arma en el teléfono y se manda cuando la persona sigue.
- 100 upserts si todos pican «Siguiente» en el mismo segundo. Cada uno son pocas filas de la misma persona. El promedio de 40 minutos es del orden de 2 escrituras por segundo.
- El proyector lee un conteo cada 5 segundos. Una sola pantalla. Los 100 teléfonos no se suscriben a Realtime: el plan gratis corta en 100 mensajes por segundo y 200 conexiones.
- El instrumento no se lee de Postgres en cada pregunta. Es JSON estático. Postgres solo ve respuestas.

Cuenta que no cabe y este plan no hace:

- Redirect de servidor en cada respuesta (es lo que hace `saveMethodologyForm` hoy).
- Guardar en memoria (`DIRECTORY=memory`) el día del evento.
- Calcular el nivel en cada guardado.
- Cargar los 16 sectores en el cliente.

## Mapa de archivos

- Create: `src/content/methodology/v2/` — copia de `n1.json`, `index.json` y `n2/*.json`. No se edita el prototipo.
- Create: `src/lib/methodology/v2/types.ts` — los tipos de `v2-types.ts`.
- Create: `src/lib/methodology/v2/sector-map.ts` — slug del Observatorio → id del instrumento v2.
- Create: `src/lib/methodology/v2/load-sector.ts` — importa solo el JSON del sector pedido.
- Create: `src/lib/methodology/v2/answers.ts` — arma las filas de una respuesta. Puro, testeable.
- Create: `src/app/metodologia/v2-form.tsx` — el flujo, una pregunta en pantalla, sin redirect.
- Create: `src/app/api/metodologia/respuestas/route.ts` — POST del lote, sesión del usuario.
- Create: `supabase/migrations/<timestamp>_methodology_v2_answers.sql` — tabla y RLS.
- Modify: `src/app/metodologia/page.tsx` — deja de usar las 18 preguntas y monta el formulario v2 del sector de la empresa.
- No tocar todavía: `src/lib/methodology/score.ts` del Observatorio (Bronce/Plata/Oro de las 18). Sigue para lo ya guardado. El motor v2 es otro archivo y entra en la tarea 6, cuando haya fórmula.

Archivos de código nuevos, cada uno por debajo de 90 líneas.

## Mapa de sector

La empresa ya trae un slug. No se vuelve a preguntar el sector en el desayuno: `MOD0-WEB-01` queda fijo con ese valor.

| Slug en el Observatorio | Instrumento v2 |
| --- | --- |
| `automotriz-y-autopartes` | `automotriz` |
| `agroindustria` | `agricola-pecuaria` |
| `alimentos-y-bebidas` | `alimentos` |
| `plasticos-y-hule` | `plasticos` |
| `metalmecanica` | `metalmecanica` |
| `textil-y-confeccion` | `textiles` |
| `mueble-y-madera` | `muebles` |
| `turismo` | `turismo` |
| `gastronomia` | `gastronomia` |
| `dispositivos-medicos` | `dispositivos` |
| `construccion` | `construccion` |
| `logistica` | `logistica` |
| `artes-graficas-y-empaque` | `artes-graficas` |

`agencias`, `confeccion` y `medico-hospitalario` existen en el banco y no tienen slug propio en la convocatoria de este desayuno. No se muestran. Si el slug no está en la tabla, la página dice que ese sector todavía no tiene instrumento y no manda un nivel 2 equivocado.

---

### Task 1: Tabla de respuestas v2

La tabla nueva no reutiliza `questions` ni `response_choices`. Esos ids son enteros y el instrumento de 18 sigue vivo para lo ya contestado.

**Files:**
- Create: `supabase/migrations/20261112210000_methodology_v2_answers.sql`
- Test: `src/lib/methodology/v2/answers.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { rowsFor } from "./answers";

const rank = {
  id: "N1-R1",
  type: "rank" as const,
  factors: [{ id: "a" }, { id: "b" }],
};

it("un ranking son tantas filas como factores, sin texto", () => {
  expect(rowsFor(rank, { kind: "rank", ranks: { a: 1, b: 2 } })).toEqual([
    { question_id: "N1-R1", option_value: "a", rank: 1, note: null },
    { question_id: "N1-R1", option_value: "b", rank: 2, note: null },
  ]);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/methodology/v2/answers.test.ts`
Expected: FAIL with `rowsFor` not defined.

- [ ] **Step 3: Write minimal implementation**

`rowsFor` acepta la pregunta y la respuesta v2 y devuelve filas `{ question_id, option_value, rank, note }`:

- `single` y `likert_5`: una fila, `rank` null, `note` null.
- `single_select_text`: una fila; `note` es el texto solo si la opción elegida es `question.text.optionValue`. Tope `text.maxLength`.
- `rank`: una fila por factor, `rank` del 1 a N, sin repetidos. Si falta un puesto, devuelve `[]` y el cliente no la manda.

La migración:

```sql
create table public.methodology_v2_answers (
  profile_id uuid not null references public.profiles (id) on delete cascade,
  question_id text not null,
  option_value text not null,
  rank integer,
  note text,
  updated_at timestamptz not null default now(),
  primary key (profile_id, question_id, option_value),
  constraint methodology_v2_rank check (rank is null or rank > 0),
  constraint methodology_v2_note_len check (note is null or char_length(note) <= 500)
);

alter table public.methodology_v2_answers enable row level security;

create policy methodology_v2_own on public.methodology_v2_answers
  for all to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

create index methodology_v2_answers_question_idx
  on public.methodology_v2_answers (question_id);
```

`auth.uid()` ya está definido en este proyecto como `coalesce(request.jwt.claim.sub, request.jwt.claims::jsonb->>'sub')::uuid`. No crear otra función.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/methodology/v2/answers.test.ts`
Expected: PASS. Cubrir también single, texto vacío cuando la opción no pide texto, y ranking incompleto.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20261112210000_methodology_v2_answers.sql src/lib/methodology/v2/answers.ts src/lib/methodology/v2/answers.test.ts
git commit -m "feat: store methodology v2 answers apart from the 18-question instrument"
```

### Task 2: Cargar solo el sector de la persona

**Files:**
- Create: `src/lib/methodology/v2/sector-map.ts`
- Create: `src/lib/methodology/v2/load-sector.ts`
- Test: `src/lib/methodology/v2/sector-map.test.ts`
- Modify: `src/app/metodologia/page.tsx`

- [ ] **Step 1: Write the failing test**

```ts
import { expect, it } from "vitest";
import { instrumentFor } from "./sector-map";

it("alimentos del Observatorio abre el nivel 2 de alimentos", () => {
  expect(instrumentFor("alimentos-y-bebidas")).toBe("alimentos");
});

it("un slug sin instrumento no inventa otro sector", () => {
  expect(instrumentFor("tecnologia-y-servicios-de-ti")).toBeNull();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/methodology/v2/sector-map.test.ts`
Expected: FAIL.

- [ ] **Step 3: Write minimal implementation**

`instrumentFor` es el mapa de la tabla de arriba. `loadSector(id)` hace un `import()` dinámico de `src/content/methodology/v2/n2/${id}.json` y regresa sus 19 preguntas. El nivel 1 se importa una sola vez desde `n1.json`. La página del servidor lee el sector de la empresa de la sesión, arma la lista (nivel 1 sin `MOD0-WEB-01`, más las 19) y se la pasa al cliente. No importa `v2-bank.ts`.

`page.tsx` se parte si al montar esto pasa de 90 líneas: el armado de la secuencia va en `src/lib/methodology/v2/sequence.ts`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/methodology/v2/sector-map.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/methodology/v2/sector-map.ts src/lib/methodology/v2/sector-map.test.ts src/lib/methodology/v2/load-sector.ts src/content/methodology/v2 src/app/metodologia/page.tsx
git commit -m "feat: send each phone only its own sector instrument"
```

### Task 3: Un guardado por pregunta, con la sesión de la persona

**Files:**
- Create: `src/app/api/metodologia/respuestas/route.ts`
- Modify: `src/app/metodologia/v2-form.tsx`

- [ ] **Step 1: Write the failing test**

El route rechaza un cuerpo que no trae filas de `rowsFor`, y no usa service role.

```ts
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

it("guarda con el cliente de la sesión, no con service role", () => {
  const source = readFileSync("src/app/api/metodologia/respuestas/route.ts", "utf8");
  expect(source).not.toContain("SERVICE_ROLE");
  expect(source).toContain("methodology_v2_answers");
  expect(source).toContain("auth.uid");
});
```

La comprobación de `auth.uid` puede estar en el SQL de la política, no en el route. El test del route exige que el insert pase por el cliente con el JWT (`createSupabaseWithAccess` o el helper que ya usa el panel en vivo) y que el `profile_id` salga de la sesión, no del body.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/app/api/metodologia/respuestas/route.test.ts`
Expected: FAIL because the file does not exist.

- [ ] **Step 3: Write minimal implementation**

`POST` recibe `{ rows: Row[] }` de una sola `question_id`. Borra las filas de esa pregunta para ese `auth.uid()` y inserta las nuevas, en una transacción vía un RPC `save_methodology_v2(question_id text, rows jsonb)` `security invoker` (respeta RLS). Así un ranking no deja puestos viejos.

El cliente:

- Pinta una pregunta. Los componentes se copian del prototipo (`choice-list`, `likert-five`, `rank-board`, `choice-with-text`) y se parten si pasan de 90 líneas.
- Al pulsar «Siguiente», espera el `fetch` de esa pregunta. Si falla, se queda en la misma y muestra un `Alert`. No usa `window.alert`.
- Copia local en `sessionStorage` bajo la llave `metodologia-v2:<profileId>` para sobrevivir un refresh si el POST anterior sí llegó, y para no perder el texto si se cae la red. Al volver a entrar, la página hidrata desde Postgres (una lectura de sus filas) y el storage solo rellena lo que aún no se guardó.
- No hay redirect. No hay `saveMethodologyForm`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/methodology/v2/answers.test.ts src/app/api/metodologia/respuestas/route.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/metodologia/respuestas/route.ts src/app/api/metodologia/respuestas/route.test.ts src/app/metodologia/v2-form.tsx supabase/migrations/20261112210000_methodology_v2_answers.sql
git commit -m "feat: save one methodology answer per next click"
```

### Task 4: La pantalla aguanta el recálculo y el teléfono

- [ ] **Step 1:** En 390 px de ancho, una pregunta de ranking y una de texto se contestan sin scroll horizontal de la página.
- [ ] **Step 2:** Recargar a media pregunta vuelve a la primera sin respuesta guardada, con lo ya guardado marcado.
- [ ] **Step 3:** Dos pestañas de la misma persona: la última escritura de esa `question_id` gana. La primaria `(profile_id, question_id, option_value)` lo garantiza.
- [ ] **Step 4:** Commit si hubo ajuste de layout.

```bash
git commit -m "fix: keep the v2 question inside the phone width"
```

### Task 5: Conteo para el proyector, sin Realtime

**Files:**
- Create: `src/lib/admin/metodologia/v2-progress.ts`
- Modify: la página de admin que ya lista metodología, con un número «Terminaron» y «Van en la pregunta».

- [ ] **Step 1: Write the failing test**

```ts
import { expect, it } from "vitest";
import { progressOf } from "./v2-progress";

it("cuenta terminados aparte de quienes van a medias", () => {
  expect(progressOf([
    { profile_id: "a", n: 41 },
    { profile_id: "b", n: 10 },
  ], 41)).toEqual({ done: 1, started: 1 });
});
```

- [ ] **Step 2–4:** Implementar `progressOf` y una consulta:

```sql
select profile_id, count(distinct question_id) as n
from public.methodology_v2_answers
group by profile_id
```

Esa consulta la hace solo el superadmin, como el resto del tablero (`adminDb`). La página del proyector se refresca cada 5 segundos con `router.refresh` o un fetch. No se abre canal Realtime.

- [ ] **Step 5: Commit**

```bash
git commit -m "feat: count who finished the v2 form without realtime"
```

### Task 6: Motor de evaluación — no se construye en este corte

`index.json` dice `"scoring": null`. Las opciones del banco traen `"score": null`. Los markdown de nivel 2 cierran con un relato Platino / Oro / Plata, no con una suma ni con los cortes. El `score.ts` del prototipo puntúa otro instrumento (opciones con número y Borda) y no se puede aplicar a esta v2 sin inventar los puntos.

Cuando exista el tabulador, el motor es una función pura `scoreV2(questions, rows) -> { status: "ok", level } | { status: "blocked" }` en `src/lib/methodology/v2/score.ts`, corrida al leer, nunca dentro del POST de guardado. Hasta entonces la última pantalla del desayuno dice «Quedó registrado» y no muestra nivel.

No hay pasos de código en esta tarea a propósito.

---

## Verificación del día del evento

- Una persona de Alimentos ve 21 preguntas generales y 19 de alimentos. No ve las de automotriz.
- Cortar la red a media pregunta, reconectar y seguir: no se pierden las anteriores.
- El tablero del superadmin sube el conteo sin que los teléfonos tengan un socket abierto.
- `saveAnswer` de las 18 preguntas viejas no se usa en esta ruta.

## Fuera de este plan

- Inventar puntos, bandas o el texto Platino/Oro/Plata.
- Realtime para que cada teléfono vea el resultado de los demás.
- Subir el cómputo de Supabase. Con un upsert por pregunta y un conteo cada 5 segundos, el Nano alcanza. Si el tabulador, cuando exista, se calcula en cada guardado para los 100, se vuelve a medir antes de moverlo al POST.
