# Reporte móvil y registro Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que el menú móvil se cierre al elegir un ítem, que el registro diga qué falló, y que terminar el perfil no tire la página ni obligue a llenar todo otra vez.

**Architecture:** Cada queja se corrige en su propio archivo, con una función pura y una prueba. El menú cierra el sheet al navegar. El paso del perfil devuelve la frase del campo que falla. El logo de más de 2 MB se rechaza en el navegador, y la acción de servidor acepta hasta 4 MB para que un logo válido no responda 413. El borrador del perfil se guarda en `sessionStorage`. El botón de innovación abierta dice cuántos correos salieron.

**Tech Stack:** Next.js 16, Vitest, shadcn Sidebar, server actions. Archivos `.ts` y `.tsx` de máximo 90 líneas.

---

## Lo que hay que corregir

| Queja | Causa en el código |
|---|---|
| En el celular, elegir un ítem del menú izquierdo no lo cierra y parece que el botón no hizo nada | `AppSidebarGroup` navega con `Link` y nadie llama `setOpenMobile(false)`. El sheet sigue encima de la página. |
| «Mesa» no se entiende | El ítem del menú es `Mesa` en `src/components/admin/nav.ts`. La ruta `/admin/mesa` se queda. |
| La liga de «ya estás registrado» confunde, y una contraseña corta solo dice que no se pudo | En `/register` y en la banda de la landing la liga dice «¿Ya tienes cuenta? Entra». El correo repetido dice «Ese correo ya está registrado.» sin decir que hay que iniciar sesión. La contraseña corta sí tiene «Usa al menos 8 caracteres.» debajo del campo (`e2e/onboarding.spec.ts` lo exige); el «No se pudo crear la cuenta» es el fallback `auth` cuando Supabase rechaza el alta por otra razón. |
| No deja avanzar y no dice qué está mal | `stepReady` solo devuelve `true` o `false`. El WhatsApp de la captura tiene 20 dígitos; la regla es vacío o 10–15. El aviso único es «Completa este paso para continuar.» El código que regresa el servidor (`whatsapp`, `logo`, …) se muestra con esa misma frase. |
| Al terminar el perfil, pantalla negra y hay que llenar todo de nuevo | `POST /onboarding` respondió 413. No hay `serverActions.bodySizeLimit` (el límite de Next es 1 MB) y el logo se anuncia hasta 2 MB. La revisión de 2 MB vive dentro de la acción, que no llega a correr. Chrome en Android muestra «This page couldn't load». El formulario solo vive en `useState`. |
| El botón de innovación abierta no falla | Si no hay correos nuevos, la página pinta `0` en `data-testid="encolados"` y no dice que no salió nada. |

`e2e/onboarding.spec.ts` espera «Elige el tamaño de tu empresa para terminar.» al pulsar «Terminar perfil» recién creada la cuenta. Esa frase ya no está en el código: el perfil son tres pasos y el botón de ese momento es «Continuar». No se restaura esa frase. El e2e de la contraseña corta sí se conserva.

---

### Task 1: El menú móvil se cierra al elegir

**Files:**
- Modify: `src/components/app-sidebar-group.tsx`
- Test: `src/components/app-sidebar-group.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("menú móvil", () => {
  it("cierra el sheet al seguir un enlace", () => {
    const source = readFileSync("src/components/app-sidebar-group.tsx", "utf8");
    expect(source).toContain("setOpenMobile(false)");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/app-sidebar-group.test.ts`
Expected: FAIL because `setOpenMobile` is missing.

- [ ] **Step 3: Write minimal implementation**

En `src/components/app-sidebar-group.tsx`, importar `useSidebar` desde `@/components/ui/sidebar` y, dentro del componente, `const { setOpenMobile } = useSidebar()`. En el `Link`:

```tsx
<Link href={link.href} onClick={() => setOpenMobile(false)}>
  {link.label}
</Link>
```

El archivo queda bajo 90 líneas. No cambiar `src/components/ui/sidebar.tsx`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/app-sidebar-group.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/app-sidebar-group.tsx src/components/app-sidebar-group.test.ts
git commit -m "$(cat <<'EOF'
fix: el menú móvil se cierra al elegir un ítem

EOF
)"
```

---

### Task 2: El menú dice Registro

**Files:**
- Modify: `src/components/admin/nav.ts`
- Modify: `src/app/admin/mesa/page.tsx`
- Modify: `src/lib/admin/mesa/href.test.ts`

La ruta sigue siendo `/admin/mesa`. Cambia el texto que ve la persona.

- [ ] **Step 1: Write the failing test**

En `src/lib/admin/mesa/href.test.ts`, cambiar la expectativa del ítem:

```ts
expect(adminLinks.find((link) => link.label === "Registro")?.href).toBe(mesaHref);
expect(adminLinks.some((link) => link.label === "Mesa")).toBe(false);
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/admin/mesa/href.test.ts`
Expected: FAIL because the label is still `Mesa`.

- [ ] **Step 3: Write minimal implementation**

En `src/components/admin/nav.ts`, el ítem de `/admin/mesa` pasa de `label: "Mesa"` a `label: "Registro"`.

En `src/app/admin/mesa/page.tsx`, la miga `listCrumbs("Mesa", mesaHref)` pasa a `listCrumbs("Registro", mesaHref)`. El kicker «Mesa de registro» pasa a «Registro». El título «Registrar llegada» se queda.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/admin/mesa/href.test.ts src/components/admin/nav-match.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/nav.ts src/app/admin/mesa/page.tsx src/lib/admin/mesa/href.test.ts
git commit -m "$(cat <<'EOF'
fix: el menú llama Registro a la mesa de llegada

EOF
)"
```

---

### Task 3: La cuenta dice cómo entrar y cuántos caracteres pide

**Files:**
- Modify: `src/lib/organismo/register-error.ts`
- Modify: `src/app/register/page.tsx`
- Modify: `src/components/landing/sections/reserve-band.tsx`
- Modify: `src/components/onboarding/account-form.tsx`
- Test: `src/lib/organismo/register-error.test.ts`

No cambiar `src/lib/account-draft.ts`. La frase «Usa al menos 8 caracteres.» sigue siendo el error del campo. `e2e/onboarding.spec.ts` la busca.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { registerError } from "./register-error";

describe("errores de registro", () => {
  it("el correo repetido manda a iniciar sesión", () => {
    expect(registerError("existe")).toBe(
      "Ese correo ya está registrado. Inicia sesión con él.",
    );
  });

  it("la contraseña corta sigue diciendo el mínimo", () => {
    expect(registerError("contrasena")).toBe("Usa al menos 8 caracteres.");
  });

  it("un rechazo desconocido recuerda el mínimo", () => {
    expect(registerError("auth")).toBe(
      "No se pudo crear la cuenta. Revisa el correo y usa al menos 8 caracteres.",
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/organismo/register-error.test.ts`
Expected: FAIL because `existe` and `auth` still use the old sentences.

- [ ] **Step 3: Write minimal implementation**

En `src/lib/organismo/register-error.ts`:

```ts
const messages: Record<string, string> = {
  existe: "Ese correo ya está registrado. Inicia sesión con él.",
  contrasena: "Usa al menos 8 caracteres.",
  confirmar: "Confirma el correo antes de entrar.",
  limite: "Hay demasiados intentos. Espera un momento e inténtalo de nuevo.",
  auth: "No se pudo crear la cuenta. Revisa el correo y usa al menos 8 caracteres.",
};
```

En `src/app/register/page.tsx` y en `src/components/landing/sections/reserve-band.tsx`, el texto de la liga a `/login` pasa de «¿Ya tienes cuenta? Entra» a «¿Ya te registraste? Inicia sesión».

En `src/components/onboarding/account-form.tsx`, el `Field` de la contraseña recibe `error={state?.errors?.password}`. Debajo del `PasswordInput`, si no hay error, un párrafo `text-small text-ink-secondary`: «Mínimo 8 caracteres.» Si hay error, no se duplica: el `Field` ya pinta «Usa al menos 8 caracteres.» El archivo sigue bajo 90 líneas. Si el hint lo pasa, mover el párrafo a `src/components/onboarding/password-hint.tsx`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/organismo/register-error.test.ts src/lib/account-draft.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/organismo/register-error.ts src/lib/organismo/register-error.test.ts src/app/register/page.tsx src/components/landing/sections/reserve-band.tsx src/components/onboarding/account-form.tsx
git commit -m "$(cat <<'EOF'
fix: el registro dice si hay que iniciar sesión o alargar la contraseña

EOF
)"
```

---

### Task 4: Cada paso dice el campo que falla

**Files:**
- Create: `src/lib/onboarding/step-issue.ts`
- Modify: `src/lib/onboarding/empresario-steps.ts`
- Modify: `src/components/onboarding/empresario-form.tsx`
- Test: `src/lib/onboarding/step-issue.test.ts`

`stepReady` se queda y pasa a ser `stepIssue(...) === null`, para no romper `src/lib/onboarding/empresario-draft.test.ts`.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { emptyEmpresarioValues } from "./empresario-steps";
import { serverIssue, stepIssue } from "./step-issue";

const valid = {
  ...emptyEmpresarioValues("turismo"),
  fullName: "Ana López",
  jobTitle: "Directora",
  whatsapp: "2221234567",
  companyName: "Taller Norte",
  marketSize: "regional",
  employeeBand: "11–50",
  municipality: "Puebla",
  sectorSlug: "turismo",
  referralSource: "Clúster",
  sessionInterest: "Proveedores",
  showLogo: false,
  hasLogo: false,
};

describe("aviso del paso", () => {
  it("un WhatsApp de 20 dígitos dice el rango", () => {
    expect(stepIssue(0, { ...valid, whatsapp: "28504976986068664664" })).toBe(
      "El WhatsApp lleva de 10 a 15 dígitos, o déjalo vacío.",
    );
  });

  it("el WhatsApp vacío deja pasar el paso", () => {
    expect(stepIssue(0, { ...valid, whatsapp: "" })).toBeNull();
  });

  it("el código del servidor no se esconde detrás de una frase genérica", () => {
    expect(serverIssue("whatsapp")).toBe(
      "El WhatsApp lleva de 10 a 15 dígitos, o déjalo vacío.",
    );
    expect(serverIssue("logo")).toBe("Sube un logo PNG, JPG o WEBP de hasta 2 MB.");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/onboarding/step-issue.test.ts`
Expected: FAIL because the module does not exist.

- [ ] **Step 3: Write minimal implementation**

`src/lib/onboarding/step-issue.ts`:

```ts
import { companySizes } from "@/content/landing";
import { acceptedIndustry } from "@/lib/sectors";
import type { EmpresarioValues } from "./empresario-steps";
import { parseMarketSize } from "./market-sizes";
import { isPueblaMunicipio } from "./puebla-municipios";

const serverMessages: Record<string, string> = {
  nombre: "Escribe tu nombre.",
  puesto: "Escribe tu puesto.",
  whatsapp: "El WhatsApp lleva de 10 a 15 dígitos, o déjalo vacío.",
  empresa: "Escribe el nombre de la empresa.",
  mercado: "Elige el tamaño de mercado.",
  empleados: "Elige el tamaño de la empresa.",
  municipio: "Elige un municipio de Puebla.",
  sector: "Elige o escribe la industria.",
  referencia: "Cuéntanos cómo te enteraste.",
  interes: "Cuéntanos qué te interesa de esta sesión. Máximo 500 caracteres.",
  logo: "Sube un logo PNG, JPG o WEBP de hasta 2 MB.",
  cuenta: "La sesión expiró. Entra de nuevo.",
};

export function serverIssue(code: string | undefined) {
  if (!code) return "";
  return serverMessages[code] ?? "No se pudo guardar. Revisa los datos e intenta de nuevo.";
}

export function stepIssue(step: number, values: EmpresarioValues) {
  if (step === 0) return personIssue(values);
  if (step === 1) return companyIssue(values);
  return referralIssue(values);
}

function personIssue(values: EmpresarioValues) {
  if (values.fullName.trim().length < 2) return serverMessages.nombre;
  if (values.jobTitle.trim().length < 2) return serverMessages.puesto;
  const digits = values.whatsapp.replace(/\D/g, "");
  if (digits.length > 0 && (digits.length < 10 || digits.length > 15)) return serverMessages.whatsapp;
  return null;
}

function companyIssue(values: EmpresarioValues) {
  if (values.companyName.trim().length < 2) return serverMessages.empresa;
  if (!parseMarketSize(values.marketSize)) return serverMessages.mercado;
  if (!companySizes.includes(values.employeeBand)) return serverMessages.empleados;
  if (!isPueblaMunicipio(values.municipality)) return serverMessages.municipio;
  if (!acceptedIndustry(values.sectorSlug)) return serverMessages.sector;
  if (values.showLogo && !values.hasLogo) return serverMessages.logo;
  return null;
}

function referralIssue(values: EmpresarioValues) {
  if (values.referralSource.trim().length < 2) return serverMessages.referencia;
  const interest = values.sessionInterest.trim();
  if (interest.length < 2 || interest.length > 500) return serverMessages.interes;
  return null;
}
```

Si el archivo pasa de 90 líneas, dejar `serverIssue` aquí y mover `personIssue`, `companyIssue` y `referralIssue` a `src/lib/onboarding/step-issue-fields.ts`.

En `src/lib/onboarding/empresario-steps.ts`, `stepReady` queda así:

```ts
import { stepIssue } from "./step-issue";

export function stepReady(step: number, values: EmpresarioValues) {
  return stepIssue(step, values) === null;
}
```

Borrar el cuerpo anterior de `stepReady`. Quitar imports que queden sin uso (`companySizes`, `acceptedIndustry`, `parseMarketSize`, `isPueblaMunicipio`) si ya no se usan en ese archivo.

En `src/components/onboarding/empresario-form.tsx`, guardar la frase en estado en vez del booleano:

```tsx
const [issue, setIssue] = useState("");

function nextStep() {
  const next = stepIssue(step, values);
  if (next) {
    setIssue(next);
    return;
  }
  setIssue("");
  setStep((current) => current + 1);
}
```

El párrafo rosa muestra `issue || serverIssue(error)`. Ya no dice «Completa este paso para continuar.» `patch` limpia `issue` para que el aviso no se quede pegado al corregir.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/onboarding/step-issue.test.ts src/lib/onboarding/empresario-draft.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/onboarding/step-issue.ts src/lib/onboarding/step-issue-fields.ts src/lib/onboarding/step-issue.test.ts src/lib/onboarding/empresario-steps.ts src/components/onboarding/empresario-form.tsx
git commit -m "$(cat <<'EOF'
fix: el perfil dice cuál dato impide continuar

EOF
)"
```

`step-issue-fields.ts` solo se agrega si hizo falta partir el archivo.

---

### Task 5: Un logo válido no revienta la página

**Files:**
- Modify: `next.config.ts`
- Modify: `src/components/file-drop.tsx`
- Modify: `src/components/onboarding/company-logo-fields.tsx`
- Modify: `src/components/onboarding/empresario-step-referral.tsx`
- Modify: `src/lib/onboarding/empresario-draft.ts`
- Test: `src/lib/onboarding/empresario-draft.test.ts`

El 413 ocurre antes de `readLogoFile`. Subir el límite a 4 MB deja pasar el logo de 2 MB que la interfaz ya promete. Vercel corta en 4.5 MB, así que 4 MB cabe. Un archivo mayor se rechaza en el input y no viaja.

- [ ] **Step 1: Write the failing test**

Agregar en `src/lib/onboarding/empresario-draft.test.ts`:

```ts
it("un comentario de más de 500 caracteres no pasa", () => {
  const form = new FormData();
  fill(form, { ...valid, sessionInterest: "a".repeat(501) });
  form.set("sector", valid.sectorSlug);
  expect(empresarioErrors(parseEmpresarioForm(form))).toBe("interes");
});
```

Y un archivo nuevo `src/components/file-drop.test.ts` no hace falta si la prueba es de fuente. En `src/lib/onboarding/company-logo.test.ts` agregar:

```ts
it("el drop del logo declara el tope de 2 MB", () => {
  const source = readFileSync("src/components/onboarding/company-logo-fields.tsx", "utf8");
  expect(source).toContain("maxBytes={2097152}");
});
```

Importar `readFileSync` de `node:fs` en ese test.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/onboarding/empresario-draft.test.ts src/lib/onboarding/company-logo.test.ts`
Expected: FAIL. El comentario largo hoy no regresa `interes` si tiene al menos 2 caracteres. `maxBytes` no existe.

- [ ] **Step 3: Write minimal implementation**

En `next.config.ts`, dentro de `nextConfig`:

```ts
experimental: {
  serverActions: {
    bodySizeLimit: "4mb",
  },
},
```

En `src/components/file-drop.tsx`, prop opcional `maxBytes?: number` y estado `const [rejected, setRejected] = useState(false)`. `choose` queda así:

```ts
function choose(next: File | null) {
  if (next && maxBytes && next.size > maxBytes) {
    setFile(null);
    setSrc((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
    onChosen?.(null);
    setRejected(true);
    return;
  }
  setRejected(false);
  setFile(next);
  setSrc((current) => {
    if (current) URL.revokeObjectURL(current);
    if (!next || !preview || !next.type.startsWith("image/")) return null;
    return URL.createObjectURL(next);
  });
  onChosen?.(next);
}
```

Si `rejected`, bajo el drop: «Ese archivo pasa de 2 MB.» En el `<input>`, `key={rejected ? "rejected" : "ready"}` para que el archivo rechazado no se quede seleccionado. Si `file-drop.tsx` pasa de 90 líneas, mover `choose` a `src/components/file-drop-state.ts`.

En `src/components/onboarding/company-logo-fields.tsx`, pasar `maxBytes={2_097_152}` al `FileDrop`.

En `src/components/onboarding/empresario-step-referral.tsx`, el textarea recibe `maxLength={500}`. Bajo el campo, si no hay otro aviso: «Máximo 500 caracteres.»

En `src/lib/onboarding/empresario-draft.ts`, la línea del interés queda:

```ts
if (input.sessionInterest.length < 2 || input.sessionInterest.length > 500) return "interes";
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/onboarding/empresario-draft.test.ts src/lib/onboarding/company-logo.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add next.config.ts src/components/file-drop.tsx src/components/file-drop-state.ts src/components/onboarding/company-logo-fields.tsx src/components/onboarding/empresario-step-referral.tsx src/lib/onboarding/empresario-draft.ts src/lib/onboarding/empresario-draft.test.ts src/lib/onboarding/company-logo.test.ts
git commit -m "$(cat <<'EOF'
fix: un logo de hasta 2 MB no tira el perfil con un 413

EOF
)"
```

`file-drop-state.ts` solo se agrega si hizo falta partir `file-drop.tsx`.

---

### Task 6: Si la página se cae, el texto del perfil sigue ahí

**Files:**
- Create: `src/components/onboarding/empresario-draft-storage.ts`
- Modify: `src/components/onboarding/empresario-form.tsx`
- Test: `src/components/onboarding/empresario-draft-storage.test.ts`

El archivo del logo no se puede guardar en `sessionStorage`. Se guardan los textos. `hasLogo` se guarda como `false` para no saltarse el paso del logo sin archivo.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { emptyEmpresarioValues } from "@/lib/onboarding/empresario-steps";
import { readEmpresarioDraft, writeEmpresarioDraft } from "./empresario-draft-storage";

describe("borrador del perfil", () => {
  it("recupera el texto y no finge que hay logo", () => {
    const memory = new Map<string, string>();
    const storage = {
      getItem: (key: string) => memory.get(key) ?? null,
      setItem: (key: string, value: string) => memory.set(key, value),
    };
    const values = {
      ...emptyEmpresarioValues("turismo"),
      fullName: "Marina Solís",
      sessionInterest: "Quiero proveedores locales",
      hasLogo: true,
    };
    writeEmpresarioDraft(storage, "cuenta-1", values);
    expect(readEmpresarioDraft(storage, "cuenta-1", "turismo")).toMatchObject({
      fullName: "Marina Solís",
      sessionInterest: "Quiero proveedores locales",
      hasLogo: false,
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/onboarding/empresario-draft-storage.test.ts`
Expected: FAIL because the module does not exist.

- [ ] **Step 3: Write minimal implementation**

```ts
import { emptyEmpresarioValues, type EmpresarioValues } from "@/lib/onboarding/empresario-steps";

type Store = { getItem(key: string): string | null; setItem(key: string, value: string): void };

function keyFor(accountId: string) {
  return `empresario-draft:${accountId}`;
}

export function writeEmpresarioDraft(storage: Store, accountId: string, values: EmpresarioValues) {
  storage.setItem(keyFor(accountId), JSON.stringify({ ...values, hasLogo: false }));
}

export function readEmpresarioDraft(storage: Store, accountId: string, sectorSlug: string) {
  const raw = storage.getItem(keyFor(accountId));
  if (!raw) return emptyEmpresarioValues(sectorSlug);
  try {
    return { ...emptyEmpresarioValues(sectorSlug), ...JSON.parse(raw), hasLogo: false };
  } catch {
    return emptyEmpresarioValues(sectorSlug);
  }
}
```

En `src/components/onboarding/empresario-form.tsx`, un `useEffect` lee `sessionStorage` al montar y otro escribe en cada cambio de `values`. No leer `sessionStorage` dentro de `useState`: el primer render del servidor no lo tiene y la hidratación no coincidiría. Si el formulario pasa de 90 líneas, el efecto vive en `src/components/onboarding/use-empresario-draft.ts` y el form solo llama el hook.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/onboarding/empresario-draft-storage.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/onboarding/empresario-draft-storage.ts src/components/onboarding/empresario-draft-storage.test.ts src/components/onboarding/empresario-form.tsx src/components/onboarding/use-empresario-draft.ts
git commit -m "$(cat <<'EOF'
fix: el perfil recuerda lo escrito si la página se cae

EOF
)"
```

`use-empresario-draft.ts` solo se agrega si hizo falta partir el form.

---

### Task 7: Innovación abierta dice si salió algo

**Files:**
- Create: `src/lib/admin/correo/sent-line.ts`
- Modify: `src/app/admin/correo/page.tsx`
- Modify: `src/lib/admin/correo/audience.test.ts`
- Test: `src/lib/admin/correo/sent-line.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { broadcastSentLine } from "./sent-line";

describe("resultado del correo masivo", () => {
  it("el cero explica que no había correos nuevos", () => {
    expect(broadcastSentLine(0)).toBe("No había correos nuevos por enviar.");
  });

  it("un envío dice cuántos salieron", () => {
    expect(broadcastSentLine(1)).toBe("Se envió 1 correo.");
    expect(broadcastSentLine(4)).toBe("Se enviaron 4 correos.");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/admin/correo/sent-line.test.ts`
Expected: FAIL because the module does not exist.

- [ ] **Step 3: Write minimal implementation**

```ts
export function broadcastSentLine(sent: number) {
  if (sent === 0) return "No había correos nuevos por enviar.";
  if (sent === 1) return "Se envió 1 correo.";
  return `Se enviaron ${sent} correos.`;
}
```

En `src/app/admin/correo/page.tsx`, el párrafo `data-testid="encolados"` deja de pintar el número pelón:

```tsx
<p data-testid="encolados" className="text-body text-ink">
  {broadcastSentLine(count)}
</p>
```

`count` sigue calculándose igual. Si `count` no es finito, no se pinta, como hoy.

En `src/lib/admin/correo/audience.test.ts`, además de `data-testid="encolados"`, esperar `broadcastSentLine`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/admin/correo/sent-line.test.ts src/lib/admin/correo/audience.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/admin/correo/sent-line.ts src/lib/admin/correo/sent-line.test.ts src/app/admin/correo/page.tsx src/lib/admin/correo/audience.test.ts
git commit -m "$(cat <<'EOF'
fix: innovación abierta dice cuántos correos salieron

EOF
)"
```

---

## Qué no entra

- No se cambia la ruta `/admin/mesa`.
- No se manda el logo por otro canal. Cabe en la acción con el límite de 4 MB.
- No se persiste el archivo del logo. Tras un 413 hay que volver a elegirlo; el texto sí regresa.
- No se reescribe `e2e/onboarding.spec.ts` salvo que una frase que ya busca deje de existir. «Usa al menos 8 caracteres.» se queda. «Elige el tamaño de tu empresa para terminar.» ya no está en la app y este plan no la revive.

## Cómo probarlo a mano

1. En un ancho de celular, abrir el menú izquierdo del admin, elegir CRM. El sheet se cierra y se ve la página.
2. El ítem dice «Registro», no «Mesa».
3. En `/register`, una contraseña de 4 caracteres deja «Usa al menos 8 caracteres.» y no entra. La liga dice «¿Ya te registraste? Inicia sesión».
4. En el paso «Tú», pegar un WhatsApp de 20 dígitos y pulsar Continuar. El aviso nombra el WhatsApp.
5. Elegir un logo de más de 2 MB. No se adjunta y dice que pasa de 2 MB. Un logo de 1.5 MB sí se envía y la página no muestra «This page couldn't load».
6. Llenar el perfil, recargar a media captura. Los textos siguen. El logo hay que volver a elegirlo.
7. Pulsar «Enviar innovación abierta» cuando ya se envió. La página dice «No había correos nuevos por enviar.»
