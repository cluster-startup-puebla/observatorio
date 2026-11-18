# Aviso antes de la metodología

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Quien entra a `/metodologia` ve una pantalla de aviso y solo llega a la primera pregunta después de aceptar que la información es privada y de uso estadístico.

**Architecture:** La página ya exige empresario con lugar. Antes de `MetodologiaScreen` se muestra el aviso si `profiles.methodology_confidentiality_accepted_at` está vacío. El botón guarda esa fecha con la sesión de la persona. Quien ya aceptó, o quien ya tiene respuestas, no vuelve a verlo.

**Tech Stack:** Next.js 16, la columna que ya existe en `profiles`, Vitest. Sin migración.

---

## Dónde va

En `/metodologia`, después de `redirectUnfinishedEmpresario()` y antes del selector de sector y de la primera pregunta.

Orden de la pantalla:

1. Entra con su cuenta.
2. Si falta el aviso, ve solo el disclaimer. No hay preguntas detrás.
3. Oprime «Entiendo y empiezo».
4. Si su sector tiene un solo instrumento, sigue la primera pregunta. Si tiene que elegir instrumento, ve esa lista y luego la pregunta.

No va en el onboarding. Ahí ya existe la nota corta «Esta información es solo estadística. No se comparte y es confidencial.» Este aviso es la puerta del formulario.

No se muestra otra vez si `methodology_confidentiality_accepted_at` ya tiene fecha, ni si el borrador ya trae respuestas. Quien iba a la mitad no se detiene.

## Qué dice

Título: **Antes de empezar**

Texto:

> Esta información es privada.
>
> Su único uso es estadístico. No se publica con el nombre de tu empresa, no se entrega a otros asistentes y no identifica tus respuestas en los resultados del día.

Botón: **Entiendo y empiezo**

Nada de casilla extra. El botón es el consentimiento.

## Mapa de archivos

- Crear: `src/components/methodology/v2/disclaimer.tsx` — la pantalla.
- Crear: `src/lib/methodology/v2/disclaimer-gate.ts` — decide si se muestra.
- Crear: `src/lib/methodology/v2/disclaimer-gate.test.ts`.
- Crear: `src/app/metodologia/accept-disclaimer.ts` — guarda la fecha.
- Modificar: `src/app/metodologia/load-run-sector.ts` — lee la fecha.
- Modificar: `src/app/metodologia/page.tsx` — pinta el aviso o el formulario.

Cada archivo de código se queda en 90 líneas o menos.

---

### Task 1: La regla de cuándo se muestra

**Files:**
- Create: `src/lib/methodology/v2/disclaimer-gate.ts`
- Test: `src/lib/methodology/v2/disclaimer-gate.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { needsDisclaimer } from "./disclaimer-gate";

describe("aviso de la metodología", () => {
  it("se muestra solo la primera vez y sin respuestas", () => {
    expect(needsDisclaimer({ acceptedAt: null, started: false })).toBe(true);
    expect(needsDisclaimer({ acceptedAt: "2026-11-18T10:00:00Z", started: false })).toBe(false);
    expect(needsDisclaimer({ acceptedAt: null, started: true })).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/methodology/v2/disclaimer-gate.test.ts`

Expected: FAIL with `needsDisclaimer` not defined.

- [ ] **Step 3: Write the function**

```ts
export function needsDisclaimer(input: { acceptedAt: string | null; started: boolean }) {
  if (input.acceptedAt) return false;
  if (input.started) return false;
  return true;
}
```

`started` es verdadero cuando el borrador tiene al menos una respuesta o `cursor` mayor que 0.

- [ ] **Step 4: Run the test**

Run: `npx vitest run src/lib/methodology/v2/disclaimer-gate.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git commit -m "feat: decide when the methodology disclaimer shows"
```

---

### Task 2: La pantalla y el guardado

**Files:**
- Create: `src/components/methodology/v2/disclaimer.tsx`
- Create: `src/app/metodologia/accept-disclaimer.ts`
- Modify: `src/app/metodologia/load-run-sector.ts`
- Modify: `src/app/metodologia/page.tsx`

- [ ] **Step 1: Read the flag**

En `readSupabase`, junto a la empresa, lee `methodology_confidentiality_accepted_at` del perfil de `auth.uid()`. Devuélvelo en `SignedSector` como `disclaimerAcceptedAt: string | null`. En memoria queda `null` para que el aviso se pueda ver en las pruebas locales.

- [ ] **Step 2: Save on the button**

`accept-disclaimer.ts` es un server action. Con la sesión actual actualiza solo `methodology_confidentiality_accepted_at` a `now()` donde `id = auth.uid()` y la fecha aún es nula. Luego `redirect("/metodologia")`. No cambia rol ni organismo. La política `profiles_update` ya deja que la persona actualice su fila.

- [ ] **Step 3: Render the gate**

`disclaimer.tsx` es un formulario con `action={acceptDisclaimer}`. Título, los dos párrafos de arriba y el botón «Entiendo y empiezo». `data-testid="metodologia-aviso"`.

En `page.tsx`, si `needsDisclaimer` es verdadero, se pinta el aviso y no se monta `MetodologiaScreen`. El aviso de recarga y el cierre de sesión se quedan arriba.

- [ ] **Step 4: Check the page stays under 90 lines**

Si `page.tsx` pasa de 90, el aviso vive en `src/app/metodologia/disclaimer-gate.tsx` y la página solo elige cuál montar.

- [ ] **Step 5: Commit**

```bash
git commit -m "feat: ask for the statistical-use disclaimer before the form"
```

---

## Verificación

- Entrar a `/metodologia` sin fecha en `methodology_confidentiality_accepted_at` muestra el aviso y ninguna pregunta.
- «Entiendo y empiezo» guarda la fecha y abre la primera pregunta, o la lista de instrumento si el sector tiene más de uno.
- Recargar ya no muestra el aviso.
- Una persona con respuestas guardadas no se detiene en el aviso aunque la fecha esté vacía.
- El texto del onboarding no cambia.
