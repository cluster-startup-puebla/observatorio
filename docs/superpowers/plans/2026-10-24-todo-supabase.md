# Todo en Supabase Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Con Supabase prendido, la mesa y el conteo de innovación abierta leen y escriben Postgres. Metodología y panel quedan para una segunda vuelta. La memoria se queda solo cuando `AUTH_PROVIDER=memory` (los e2e).

**Architecture:** No se pone `DIRECTORY=supabase` y no se usa la service role. `usesSupabaseAuth()` ya es verdadero en local porque existen la URL y la llave anónima. Cada camino nuevo usa el JWT de la sesión y las políticas que ya existen. Si `usesSupabaseAuth()` es falso, se deja la llamada actual a `getDirectory()`.

**Tech Stack:** Next.js 16, Supabase (anon + JWT), tablas `response_choices`, `arrivals`, `crm_events`, `outbox_messages`. Archivos `.ts` y `.tsx` de máximo 90 líneas.

---

## Fuera de este plan

- No crear el pase QR (`passes` exige `image_asset_id`). La mesa sigue respondiendo «sin qr» si esa fila no existe.
- No abrir `/metodologia` según la fecha de la sesión. Eso es otro corte.
- No implementar `src/lib/supabase-directory.ts`. Esos métodos lanzan `notImplemented` y no se llaman.

## Lo que ya está en Supabase

Login, alta, perfil del empresario, CRM, invitaciones, aperturas, conversiones, `/admin` (tablero, sectores, sesiones, medios, organismos) y el `POST /api/admin/correo`. No se vuelven a tocar salvo el conteo de la página de correo y el formulario de la mesa.

---

### Task 1: El conteo de innovación abierta sale de la bandeja

**Files:**
- Modify: `src/app/admin/correo/page.tsx`
- Create: `src/lib/admin/correo/sent-count.ts`
- Test: `src/lib/admin/correo/sent-count.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { sentCount } from "./sent-count";

describe("conteo de innovación abierta", () => {
  it("cuenta solo el envío de innovación abierta", () => {
    expect(sentCount([
      { kind: "open_innovation" },
      { kind: "open_innovation" },
      { kind: "password" },
    ])).toBe(2);
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `npx vitest run src/lib/admin/correo/sent-count.test.ts`

Expected: FAIL, `sentCount` is not defined.

- [ ] **Step 3: Implement the count**

`src/lib/admin/correo/sent-count.ts`:

```ts
export function sentCount(rows: { kind: string }[]) {
  return rows.filter((row) => row.kind === "open_innovation").length;
}
```

In `src/app/admin/correo/page.tsx`, when `usesSupabaseAuth()` and `params.enviado === "1"`, load with `adminDb()`:

```ts
const sent = await db.from("outbox_messages").select("kind").eq("kind", "open_innovation");
const count = sent.error ? null : sentCount(sent.data ?? []);
```

When Supabase is off, keep `(await getDirectory().outbox()).length`.

- [ ] **Step 4: Run the test**

Run: `npx vitest run src/lib/admin/correo/sent-count.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/admin/correo/page.tsx src/lib/admin/correo/sent-count.ts src/lib/admin/correo/sent-count.test.ts
git commit -m "$(cat <<'EOF'
fix: el conteo de innovación abierta sale de Supabase

La página ya no cuenta la bandeja en memoria después de enviar.
EOF
)"
```

---

### Task 2: La mesa registra la llegada en arrivals

El formulario de `src/components/mesa/mesa-desk.tsx` llama `scanDeskAction`, que escribe en memoria. `POST /api/admin/mesa` ya inserta en `arrivals` y, si hay CRM, el hecho `llegar`. Hoy esa ruta exige superadmin y redirige a `/admin/mesa/{id}`. La mesa también la usa un moderador, y el diálogo espera `?estatus=llego`.

**Files:**
- Modify: `src/app/api/admin/mesa/route.ts`
- Modify: `src/app/admin/mesa/page.tsx`
- Modify: `src/components/mesa/mesa-desk.tsx`
- Modify: `src/lib/flow-actions.ts` (el `scanDeskAction` de memoria se queda, la mesa ya no lo usa cuando hay Supabase)

- [ ] **Step 1: La ruta acepta moderador y responde como el diálogo**

Sustituir `requireSuperadmin()` por `requireMesa()` de `src/lib/auth/guards.ts`. La política `arrivals_insert_desk` ya deja insertar a `superadmin` y `moderador` si `scanned_by = auth.uid()`.

El redirect de éxito queda:

```ts
const query = new URLSearchParams({
  codigo: profileId,
  nombre: profile.data?.full_name ?? "",
  estatus: "llego",
});
return NextResponse.redirect(new URL(`${mesaHref}?${query}`, request.url));
```

`scanned_by` es `account.id` de `requireMesa()`, no una búsqueda por correo.

- [ ] **Step 2: El formulario apunta a la ruta cuando hay Supabase**

`src/app/admin/mesa/page.tsx` pasa `action={usesSupabaseAuth() ? "/api/admin/mesa" : undefined}`.

`MesaDesk` usa esa acción. Si no viene, sigue con `scanDeskAction` para los e2e.

- [ ] **Step 3: Probar a mano**

Con un superadmin o moderador en `http://127.0.0.1:3000/admin/mesa`, un código sin pase sigue mostrando «sin qr». Un perfil con fila en `passes` y sin fila en `arrivals` crea la llegada y abre el diálogo con el nombre. La segunda lectura responde «ya llegó».

- [ ] **Step 4: Commit**

```bash
git add src/app/api/admin/mesa/route.ts src/app/admin/mesa/page.tsx src/components/mesa/mesa-desk.tsx
git commit -m "$(cat <<'EOF'
fix: la mesa registra la llegada en Supabase

El formulario deja de escribir el QR en memoria cuando hay sesión.
EOF
)"
```

---

### Task 3: Las respuestas de metodología viven en response_choices

**Segunda vuelta.** No implementar ahora. El usuario lo dejó fuera de esta ejecución.

La interfaz guarda un string por pregunta (`"a"` o, en la 18, un JSON `{"falta_materiales":1}`). `answersFromStored` ya entiende ese mapa. La tabla guarda una fila por opción: `single` con `rank` nulo, `priority` con `rank`.

Política vigente: el empresario inserta, actualiza y borra solo `profile_id = auth.uid()`. Superadmin y moderador leen.

**Files:**
- Create: `src/lib/methodology/choice-rows.ts`
- Test: `src/lib/methodology/choice-rows.test.ts`
- Create: `src/lib/methodology/save-choices.ts`
- Modify: `src/lib/flow-actions.ts`
- Modify: `src/app/metodologia/page.tsx`
- Modify: `src/app/metodologia/diagnostico/route.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { rowsFromAnswer, storedFromRows } from "./choice-rows";

describe("respuestas de metodología", () => {
  it("una opción simple es una fila sin rank", () => {
    expect(rowsFromAnswer(1, "d")).toEqual([{ question_id: 1, option_value: "d", rank: null }]);
  });

  it("la prioridad guarda el rank de cada causa", () => {
    expect(rowsFromAnswer(18, JSON.stringify({ falta_materiales: 1, personal: 2 }))).toEqual([
      { question_id: 18, option_value: "falta_materiales", rank: 1 },
      { question_id: 18, option_value: "personal", rank: 2 },
    ]);
  });

  it("las filas vuelven al mapa que ya califica el diagnóstico", () => {
    expect(storedFromRows([
      { question_id: 1, option_value: "d", rank: null },
      { question_id: 18, option_value: "personal", rank: 2 },
      { question_id: 18, option_value: "falta_materiales", rank: 1 },
    ])).toEqual({
      "1": "d",
      "18": JSON.stringify({ falta_materiales: 1, personal: 2 }),
    });
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `npx vitest run src/lib/methodology/choice-rows.test.ts`

Expected: FAIL, module not found.

- [ ] **Step 3: Implement the mapping**

`src/lib/methodology/choice-rows.ts` exporta `rowsFromAnswer(questionId: number, value: string)` y `storedFromRows(rows)`.

- Un valor que no empieza con `{` produce una fila con `rank: null`.
- Un JSON de causas produce una fila por llave, ordenada por rank. Si el JSON no parsea, no produce filas.
- `storedFromRows` agrupa por `question_id`. Si la única fila tiene `rank` nulo, el valor es `option_value`. Si hay ranks, el valor es `JSON.stringify` del objeto ordenado por rank.

- [ ] **Step 4: Run the test**

Run: `npx vitest run src/lib/methodology/choice-rows.test.ts`

Expected: PASS.

- [ ] **Step 5: Guardar y leer con el JWT**

`src/lib/methodology/save-choices.ts`:

```ts
import "server-only";
import { createSupabaseWithAccess } from "@/lib/supabase/auth-session";
import { rowsFromAnswer, storedFromRows } from "./choice-rows";

export async function saveChoice(access: string, profileId: string, questionId: string, value: string) {
  const db = createSupabaseWithAccess(access);
  const id = Number(questionId);
  const rows = rowsFromAnswer(id, value).map((row) => ({ ...row, profile_id: profileId }));
  const removed = await db.from("response_choices").delete().eq("profile_id", profileId).eq("question_id", id);
  if (removed.error) return { ok: false as const };
  if (!rows.length) return { ok: true as const };
  const inserted = await db.from("response_choices").insert(rows);
  return { ok: !inserted.error };
}

export async function readChoices(access: string, profileId: string) {
  const db = createSupabaseWithAccess(access);
  const result = await db.from("response_choices").select("question_id, option_value, rank").eq("profile_id", profileId);
  if (result.error) return {};
  return storedFromRows(result.data ?? []);
}
```

En `saveMethodologyForm` y `saveMethodologyAnswer`, si `usesSupabaseAuth()`:

- Leer la sesión con `readSessionAccount()` y el token con `readAccessToken()`.
- Sin sesión, redirigir a `/login?next=/metodologia`.
- El `profile_id` es `session.id`. Ignorar el `persona` del formulario.
- Llamar `saveChoice`. Si `ok` es falso, redirigir con `error=guardar`.
- El query de regreso no lleva `persona`. Lleva `pregunta`.

Si Supabase está apagado, dejar `getDirectory().saveAnswer` como está.

- [ ] **Step 6: La página y el diagnóstico leen la sesión**

`src/app/metodologia/page.tsx`: con Supabase, exigir sesión. `readChoices(token, session.id)` alimenta `answersFromStored`. Sin Supabase, seguir con `getDirectory().answersFor(persona)` y el query `persona`.

`src/app/metodologia/diagnostico/route.ts`: con Supabase, la misma lectura. Sin sesión, 401. Sin Supabase, `answersFor(persona)`.

El formulario deja de mandar `persona` cuando la página no lo tiene. `QuestionStep` acepta `persona` vacío.

- [ ] **Step 7: Commit**

```bash
git add src/lib/methodology/choice-rows.ts src/lib/methodology/choice-rows.test.ts src/lib/methodology/save-choices.ts src/lib/flow-actions.ts src/app/metodologia/page.tsx src/app/metodologia/diagnostico/route.ts src/components/methodology/question-step.tsx
git commit -m "$(cat <<'EOF'
feat: la metodología guarda las respuestas en Supabase

Cada elección queda en response_choices de la persona que inició sesión.
EOF
)"
```

---

### Task 4: El panel de avance cuenta response_choices

**Segunda vuelta.** No implementar ahora. El usuario lo dejó fuera de esta ejecución.

`src/app/panel/page.tsx` hoy arma el rol con `?rol=` y cuenta `getDirectory().progress()`.

**Files:**
- Create: `src/lib/methodology/progress-rows.ts`
- Test: `src/lib/methodology/progress-rows.test.ts`
- Modify: `src/app/panel/page.tsx`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { progressRows } from "./progress-rows";

describe("avance", () => {
  it("cuenta preguntas distintas por persona", () => {
    expect(progressRows([
      { profile_id: "ana", question_id: 1, email: "ana@norte.mx" },
      { profile_id: "ana", question_id: 1, email: "ana@norte.mx" },
      { profile_id: "ana", question_id: 2, email: "ana@norte.mx" },
      { profile_id: "beto", question_id: 1, email: "beto@sur.mx" },
    ])).toEqual([
      { personId: "ana@norte.mx", count: 2 },
      { personId: "beto@sur.mx", count: 1 },
    ]);
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `npx vitest run src/lib/methodology/progress-rows.test.ts`

Expected: FAIL.

- [ ] **Step 3: Implement and wire the page**

`progressRows` agrupa por `profile_id`, cuenta `question_id` distintos y muestra `email` como `personId`.

Con Supabase, `requireRoles` no existe para el panel. Usar `readSessionAccount()`: si el rol no es `superadmin` ni `moderador`, redirigir a `homeForRole`. Leer:

```ts
db.from("response_choices").select("profile_id, question_id, profiles(email)")
```

Pasar el resultado a `progressRows`. La política `responses_select` ya deja leer a esos dos roles.

Sin Supabase, dejar `?rol=` y `getDirectory().progress()`.

- [ ] **Step 4: Run the test**

Run: `npx vitest run src/lib/methodology/progress-rows.test.ts src/lib/methodology/choice-rows.test.ts src/lib/admin/correo/sent-count.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/methodology/progress-rows.ts src/lib/methodology/progress-rows.test.ts src/app/panel/page.tsx
git commit -m "$(cat <<'EOF'
feat: el avance de la metodología sale de Supabase

El panel cuenta las preguntas guardadas de cada persona.
EOF
)"
```

---

## Verificación final

- [ ] `npx vitest run src/lib/admin/correo/sent-count.test.ts src/lib/methodology/choice-rows.test.ts src/lib/methodology/progress-rows.test.ts`
- [ ] Con la sesión de empresario, elegir una respuesta en `/metodologia` y ver la fila en `response_choices`.
- [ ] Recargar `/metodologia` y ver la misma respuesta marcada.
- [ ] Con superadmin, `/panel` muestra el correo y el conteo. `/admin/correo?enviado=1` muestra el número de `outbox_messages`, no el de la memoria.
- [ ] `rg "getDirectory\\(\\)" src/app/metodologia src/app/panel src/components/mesa src/app/admin/correo` no muestra una llamada que corra cuando `usesSupabaseAuth()` es verdadero.
