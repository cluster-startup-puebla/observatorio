# Invitación sin cuenta Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que el enlace de invitación abra los 3 pasos (Tú, Tu empresa, La sesión) como un formulario, sin pedir contraseña ni logo, y deje a la persona registrada en su organismo.

**Architecture:** El enlace de hoy cae en `/register` y lo primero es correo y contraseña (`AccountForm`). Esta ruta nueva se salta esa puerta. El servidor crea el usuario con una contraseña aleatoria que nadie ve, porque `profiles.id` apunta a `auth.users` y sin esa fila no hay empresa ni cupo. La persona no elige cuenta ni entra a ningún panel. El logo no va en el formulario; sigue el camino de «subirlo después», que ya existe.

**Tech Stack:** Next.js 16, el wizard `EmpresarioForm`, `signUp` con la llave anónima. Sin service role.

---

## Qué se conserva y qué se quita

Los tres pasos ya están en `src/components/onboarding/empresario-form.tsx`:

1. Tú — nombre, puesto, WhatsApp.
2. Tu empresa — nombre, mercado, empleados, municipio, sector.
3. La sesión — cómo se enteró, qué le interesa, términos.

En el enlace, el paso 1 también pide el correo. Hoy el correo vive en la pantalla de cuenta; sin esa pantalla no hay con qué ligar la invitación.

No se piden contraseña ni logo. `stepIssue` solo exige logo si `showLogo` es verdadero. Este formulario lo manda en falso y no pinta `CompanyLogoFields`.

Quien entra por `/register` sin invitación sigue creando su cuenta como ahora. Este plan es solo el enlace.

## Mapa de archivos

- Create: `src/app/invitacion/page.tsx` — el formulario, sin `AuthShell` de cuenta.
- Create: `src/lib/onboarding/guest-signup.ts` — alta con contraseña aleatoria y el mismo guardado de empresario.
- Create: `src/lib/onboarding/guest-signup.test.ts`
- Modify: `src/components/onboarding/empresario-step-person.tsx` — el correo solo cuando el formulario lo pide.
- Modify: `src/lib/sectors.ts` — `reserveHref` del enlace apunta a `/invitacion`, no a `/register`.
- No se toca el logo ni `later-logo-form.tsx`.

Cada archivo de código se queda en 90 líneas o menos.

---

### Task 1: El enlace abre el formulario

**Files:**
- Create: `src/app/invitacion/page.tsx`
- Modify: `src/lib/sectors.ts`
- Test: `src/lib/sectors.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
expect(reserveHref("/turismo", "abc")).toBe("/invitacion?sector=turismo&invitacion=abc");
```

El test actual espera `/register?sector=turismo&invitacion=abc`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/sectors.test.ts`
Expected: FAIL.

- [ ] **Step 3: Write minimal implementation**

`/invitacion` lee `sector` e `invitacion`. Si falta el token, manda a `/register`. Si viene, pinta los 3 pasos con el título «Paso n de 3», Atrás y Siguiente, y en el último «Enviar». No muestra «Crear cuenta» ni campos de logo. El correo va en el paso 1.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/sectors.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git commit -m "feat: open the invite link on the three-step form"
```

### Task 2: Guardar sin que la persona cree cuenta

**Files:**
- Create: `src/lib/onboarding/guest-signup.ts`
- Test: `src/lib/onboarding/guest-signup.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

it("no pide contraseña al invitado y no usa service role", () => {
  const source = readFileSync("src/lib/onboarding/guest-signup.ts", "utf8");
  expect(source).toContain("signUp");
  expect(source).not.toContain("SERVICE_ROLE");
  expect(source).not.toContain("showLogo");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/onboarding/guest-signup.test.ts`
Expected: FAIL because the file does not exist.

- [ ] **Step 3: Write minimal implementation**

Al enviar:

1. Validar con `stepIssue` los pasos 0, 1 y 2, más el correo.
2. `signUp` con ese correo y una contraseña de 24 caracteres que no se guarda ni se muestra.
3. Con la sesión que devuelve el alta, correr el mismo camino que `finishInSupabase`: perfil, empresa, `attributeSignup` con el token, y el pase si el enlace ya está aceptado.
4. `showLogo` queda en falso. No se lee ningún archivo.
5. Si el correo ya existe, la página dice «Este correo ya está registrado» y no crea otra empresa.
6. La pantalla final es «Quedó registrado», sin botón de entrar.

La contraseña aleatoria existe solo porque Postgres exige un usuario para la ficha. La persona no la conoce y no hay pantalla para elegirla.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/onboarding/guest-signup.test.ts src/lib/onboarding/step-issue.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git commit -m "feat: register an invite without asking for a password"
```

### Task 3: Probar el enlace como lo va a usar alguien

- [ ] Abrir un enlace real de organismo en el teléfono, ancho 390.
- [ ] Recorrer los 3 pasos. No aparece contraseña ni logo.
- [ ] Enviar. La persona sale en Empresas y en el CRM del organismo, con el mismo sector del enlace.
- [ ] Repetir el mismo correo. Sale el aviso de que ya está registrado y no hay una segunda empresa.

---

## Fuera de este plan

- El logo. Se sube después, con lo que ya está en el perfil terminado.
- Cambiar `/register` de quien llega sin enlace.
- Que la persona pueda entrar después con contraseña. Si más adelante hace falta, se manda un enlace de acceso. No es parte del formulario.
