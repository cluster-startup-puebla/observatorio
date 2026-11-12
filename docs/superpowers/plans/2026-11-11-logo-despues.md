# Logo después del perfil Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** El empresario puede dejar el logo para después en el paso de la empresa, y subirlo en la espera del onboarding o junto a su pase, con el check de mostrarlo el día del evento.

**Architecture:** No hay migración. El empresario ya puede insertar `media_assets` (`company_logo`) y actualizar su fila de `companies` con la sesión. El paso de la empresa solo cambia el texto. Cuando el perfil ya está terminado y no existe un `company_logo`, la espera y el pase muestran el mismo formulario. Ese formulario reutiliza `saveCompanyLogo` y después actualiza únicamente `companies.show_logo_on_event`. No vuelve a guardar el perfil ni emite el pase.

**Tech Stack:** Next.js 16 App Router, Supabase Storage ya existente (`company-logos`), vitest. Cada archivo `.ts` o `.tsx` nuevo o editado se queda en 90 líneas o menos.

---

## Fuera de este plan

- Reemplazar un logo que ya existe.
- Volver a mostrar el formulario cuando el archivo ya está guardado y el check está apagado.
- Logos del organismo, de la landing o de los correos.
- Cambiar el flujo de espera, el pase o el correo de aceptación.
- Una migración SQL. Las políticas de `20261023180100_company_logo_storage.sql` y `companies_own` ya dejan al empresario escribir su logo y su empresa.

## Mapa de archivos

- Modificar: `src/components/onboarding/company-logo-fields.tsx`
- Modificar: `src/lib/onboarding/company-logo.ts`
- Modificar: `src/lib/onboarding/company-logo.test.ts`
- Crear: `src/lib/onboarding/company-has-logo.ts`
- Crear: `src/lib/onboarding/upload-company-logo-later.ts`
- Crear: `src/lib/onboarding/upload-company-logo-later.test.ts`
- Crear: `src/components/onboarding/later-logo-form.tsx`
- Modificar: `src/components/onboarding/finished-profile.tsx`
- Modificar: `src/components/onboarding/onboarding-wizard.tsx`
- Modificar: `src/app/onboarding/supabase-screen.tsx`
- Modificar: `src/app/onboarding/page.tsx`

---

### Task 1: Aviso de que el logo puede esperar

**Files:**
- Modify: `src/components/onboarding/company-logo-fields.tsx`
- Modify: `src/components/onboarding/empresario-step-company.tsx`
- Test: `src/lib/onboarding/company-logo.test.ts`

El hint técnico sigue en el drop. La frase nueva va en un párrafo de `text-small`, visible, y solo en el paso de la empresa. El formulario de después no debe decir «lo puedes subir después».

- [ ] **Step 1: Escribir el test que falla**

En `src/lib/onboarding/company-logo.test.ts`, agregar:

```ts
it("el paso de la empresa dice que el logo puede esperar", () => {
  const fields = readFileSync("src/components/onboarding/company-logo-fields.tsx", "utf8");
  const step = readFileSync("src/components/onboarding/empresario-step-company.tsx", "utf8");
  expect(fields).toContain("Opcional. Lo puedes subir después.");
  expect(fields).toContain("deferrable");
  expect(step).toContain("deferrable");
});
```

- [ ] **Step 2: Correr el test y verlo fallar**

Run: `npx vitest run src/lib/onboarding/company-logo.test.ts`

Expected: FAIL porque `company-logo-fields.tsx` no contiene esa frase ni `deferrable`.

- [ ] **Step 3: Mostrar la frase solo cuando el campo es aplazable**

Reemplazar `src/components/onboarding/company-logo-fields.tsx` por:

```tsx
"use client";

import { FileDrop } from "@/components/file-drop";

export function CompanyLogoFields({
  showLogo,
  onShow,
  onFile,
  deferrable = false,
}: {
  showLogo: boolean;
  onShow: (showLogo: boolean) => void;
  onFile: (hasLogo: boolean) => void;
  deferrable?: boolean;
}) {
  return (
    <div className="grid gap-3">
      <FileDrop
        id="company-logo"
        name="logo"
        label="Logo de la empresa"
        accept="image/png,image/jpeg,image/webp"
        hint="PNG, JPG o WEBP · hasta 2 MB."
        preview
        maxBytes={2097152}
        onChosen={(file) => onFile(Boolean(file))}
      />
      {deferrable ? (
        <p className="text-small text-ink-secondary">Opcional. Lo puedes subir después.</p>
      ) : null}
      <label className="flex items-start gap-2 text-small text-ink">
        <input
          type="checkbox"
          name="showLogo"
          value="1"
          checked={showLogo}
          onChange={(event) => onShow(event.target.checked)}
        />
        Mostrar mi logo el día del evento
      </label>
    </div>
  );
}
```

En `EmpresarioStepCompany`, el uso de `CompanyLogoFields` queda así:

```tsx
<CompanyLogoFields
  showLogo={values.showLogo}
  onShow={(showLogo) => onChange({ showLogo })}
  onFile={(hasLogo) => onChange({ hasLogo })}
  deferrable
/>
```

No cambies `stepIssue` ni `logoUploadDecision`. Sin archivo y sin check, el paso sigue dejando continuar. El check sin archivo sigue bloqueando el paso.

- [ ] **Step 4: Correr el test**

Run: `npx vitest run src/lib/onboarding/company-logo.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/onboarding/company-logo-fields.tsx src/components/onboarding/empresario-step-company.tsx src/lib/onboarding/company-logo.test.ts
git commit -m "$(cat <<'EOF'
feat: tell the company step the logo can wait

EOF
)"
```

---

### Task 2: Decidir en qué pantallas se ofrece el logo

**Files:**
- Modify: `src/lib/onboarding/company-logo.ts`
- Test: `src/lib/onboarding/company-logo.test.ts`

- [ ] **Step 1: Escribir el test que falla**

Agregar el import `laterLogoOffer` junto a `logoUploadDecision` y este caso:

```ts
it("ofrece el logo solo en la espera y en el pase, si falta el archivo", () => {
  expect(laterLogoOffer({ hasLogo: false, gate: "espera" })).toBe(true);
  expect(laterLogoOffer({ hasLogo: false, gate: "pase" })).toBe(true);
  expect(laterLogoOffer({ hasLogo: true, gate: "espera" })).toBe(false);
  expect(laterLogoOffer({ hasLogo: true, gate: "pase" })).toBe(false);
  expect(laterLogoOffer({ hasLogo: false, gate: "cerrado" })).toBe(false);
  expect(laterLogoOffer({ hasLogo: false, gate: "cancelo" })).toBe(false);
});
```

- [ ] **Step 2: Correr el test y verlo fallar**

Run: `npx vitest run src/lib/onboarding/company-logo.test.ts`

Expected: FAIL porque `laterLogoOffer` no existe.

- [ ] **Step 3: Implementar la decisión**

`src/lib/onboarding/company-logo.ts` queda así:

```ts
export function logoUploadDecision(input: { show: boolean; hasFile: boolean }) {
  if (!input.hasFile) return input.show ? { action: "reject" as const } : { action: "skip" as const };
  return { action: "store" as const, show: input.show };
}

export function laterLogoOffer(input: { hasLogo: boolean; gate: string }) {
  if (input.hasLogo) return false;
  return input.gate === "espera" || input.gate === "pase";
}
```

- [ ] **Step 4: Correr el test**

Run: `npx vitest run src/lib/onboarding/company-logo.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/onboarding/company-logo.ts src/lib/onboarding/company-logo.test.ts
git commit -m "$(cat <<'EOF'
feat: offer a missing company logo on the wait and the pass

EOF
)"
```

---

### Task 3: Saber si ese perfil ya tiene logo

**Files:**
- Create: `src/lib/onboarding/company-has-logo.ts`
- Test: `src/lib/onboarding/upload-company-logo-later.test.ts`

- [ ] **Step 1: Escribir el test que falla**

Crear `src/lib/onboarding/upload-company-logo-later.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("lectura del logo de empresa", () => {
  it("busca un company_logo de ese perfil", () => {
    const source = readFileSync("src/lib/onboarding/company-has-logo.ts", "utf8");
    expect(source).toContain('eq("purpose", "company_logo")');
    expect(source).toContain('eq("profile_id", profileId)');
    expect(source).toContain("maybeSingle");
  });
});
```

- [ ] **Step 2: Correr el test y verlo fallar**

Run: `npx vitest run src/lib/onboarding/upload-company-logo-later.test.ts`

Expected: FAIL porque el archivo no existe.

- [ ] **Step 3: Implementar la lectura**

Crear `src/lib/onboarding/company-has-logo.ts`:

```ts
import "server-only";

import { createSupabaseWithAccess } from "@/lib/supabase/auth-session";

export async function companyHasLogo(accessToken: string, profileId: string) {
  const row = await createSupabaseWithAccess(accessToken)
    .from("media_assets")
    .select("id")
    .eq("profile_id", profileId)
    .eq("purpose", "company_logo")
    .maybeSingle();
  return Boolean(row.data);
}
```

- [ ] **Step 4: Correr el test**

Run: `npx vitest run src/lib/onboarding/upload-company-logo-later.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/onboarding/company-has-logo.ts src/lib/onboarding/upload-company-logo-later.test.ts
git commit -m "$(cat <<'EOF'
feat: read whether the company already stored a logo

EOF
)"
```

---

### Task 4: Guardar el logo después de terminar el perfil

**Files:**
- Create: `src/lib/onboarding/upload-company-logo-later.ts`
- Test: `src/lib/onboarding/upload-company-logo-later.test.ts`

La acción exige empresario con `onboarded_at`. Si no hay archivo, o el check viene sin archivo, redirige a `/onboarding?error=logo` y no marca el check. Si hay archivo, llama `saveCompanyLogo` y actualiza solo `show_logo_on_event`. Un archivo sin check se guarda y el check queda en falso; el aviso desaparece porque el archivo ya existe.

- [ ] **Step 1: Escribir el test que falla**

Agregar este caso al describe de `src/lib/onboarding/upload-company-logo-later.test.ts`:

```ts
it("actualiza solo el check y no vuelve a terminar el perfil", () => {
  const source = readFileSync("src/lib/onboarding/upload-company-logo-later.ts", "utf8");
  expect(source).toContain("saveCompanyLogo");
  expect(source).toContain("show_logo_on_event");
  expect(source).toContain("onboarded_at");
  expect(source).toContain('redirect("/onboarding?error=logo")');
  expect(source).toContain('redirect("/onboarding")');
  expect(source).not.toContain("saveEmpresarioProfile");
  expect(source).not.toContain("issueConfirmedPass");
  expect(source).not.toContain("onboarded_at:");
});
```

- [ ] **Step 2: Correr el test y verlo fallar**

Run: `npx vitest run src/lib/onboarding/upload-company-logo-later.test.ts`

Expected: FAIL porque `upload-company-logo-later.ts` no existe.

- [ ] **Step 3: Implementar la acción**

Crear `src/lib/onboarding/upload-company-logo-later.ts`:

```ts
"use server";

import { redirect } from "next/navigation";
import { readSessionAccount } from "@/lib/auth/session-account";
import { createSupabaseWithAccess, readAccessToken } from "@/lib/supabase/auth-session";
import { logoUploadDecision } from "./company-logo";
import { saveCompanyLogo } from "./save-company-logo";

function fail() {
  redirect("/onboarding?error=logo");
}

export async function uploadCompanyLogoLater(formData: FormData) {
  const session = await readSessionAccount();
  const access = await readAccessToken();
  if (!session || session.role !== "empresario" || !access) fail();
  const db = createSupabaseWithAccess(access!);
  const profile = await db.from("profiles").select("onboarded_at").eq("id", session!.id).maybeSingle();
  if (!profile.data?.onboarded_at) fail();

  const show = formData.get("showLogo") === "1";
  const file = formData.get("logo");
  const decision = logoUploadDecision({ show, hasFile: file instanceof File && file.size > 0 });
  if (decision.action !== "store") fail();

  const logo = await saveCompanyLogo({
    accessToken: access!,
    profileId: session!.id,
    file,
    show,
  });
  if (!logo.ok) fail();
  const saved = await db
    .from("companies")
    .update({ show_logo_on_event: logo.show ?? false })
    .eq("profile_id", session!.id)
    .select("id")
    .maybeSingle();
  if (saved.error || !saved.data) fail();
  redirect("/onboarding");
}
```

- [ ] **Step 4: Correr el test**

Run: `npx vitest run src/lib/onboarding/upload-company-logo-later.test.ts src/lib/onboarding/company-logo.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/onboarding/upload-company-logo-later.ts src/lib/onboarding/upload-company-logo-later.test.ts
git commit -m "$(cat <<'EOF'
feat: store a company logo after the profile is finished

EOF
)"
```

---

### Task 5: Formulario de la espera y del pase

**Files:**
- Create: `src/components/onboarding/later-logo-form.tsx`
- Modify: `src/components/onboarding/finished-profile.tsx`
- Modify: `src/components/onboarding/onboarding-wizard.tsx`
- Test: `src/lib/onboarding/upload-company-logo-later.test.ts`

El error se queda en un `Alert`. No uses `alert()`, `confirm()` ni `prompt()`. El texto del aviso es el que ya devuelve `serverIssue("logo")`: «Sube un logo PNG, JPG o WEBP de hasta 2 MB.»

- [ ] **Step 1: Escribir el test que falla**

Agregar:

```ts
it("la espera y el pase explican las pantallas y reutilizan el check", () => {
  const form = readFileSync("src/components/onboarding/later-logo-form.tsx", "utf8");
  const finished = readFileSync("src/components/onboarding/finished-profile.tsx", "utf8");
  const wizard = readFileSync("src/components/onboarding/onboarding-wizard.tsx", "utf8");
  expect(form).toContain("Veo que no tienes logo. ¿Te gustaría subirlo ahora?");
  expect(form).toContain("Durante el evento tu logo puede aparecer en las pantallas.");
  expect(form).toContain("CompanyLogoFields");
  expect(form).toContain("uploadCompanyLogoLater");
  expect(form).toContain("Alert");
  expect(form).not.toContain("deferrable");
  expect(finished).toContain("LaterLogoForm");
  expect(finished).toContain('gate === "espera"');
  expect(finished).toContain("AccessPass");
  expect(wizard).toContain("offerLogo");
});
```

- [ ] **Step 2: Correr el test y verlo fallar**

Run: `npx vitest run src/lib/onboarding/upload-company-logo-later.test.ts`

Expected: FAIL porque `later-logo-form.tsx` no existe.

- [ ] **Step 3: Crear el formulario y montarlo en las dos salidas**

Crear `src/components/onboarding/later-logo-form.tsx`:

```tsx
"use client";

import { useState } from "react";
import { PendingSubmit } from "@/components/auth/pending-submit";
import { CompanyLogoFields } from "@/components/onboarding/company-logo-fields";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { uploadCompanyLogoLater } from "@/lib/onboarding/upload-company-logo-later";
import { serverIssue } from "@/lib/onboarding/step-issue";

export function LaterLogoForm({ error }: { error?: string }) {
  const [showLogo, setShowLogo] = useState(false);
  const notice = serverIssue(error);

  return (
    <form action={uploadCompanyLogoLater} className="grid gap-4">
      <div className="grid gap-2">
        <p className="text-h4 text-ink">Veo que no tienes logo. ¿Te gustaría subirlo ahora?</p>
        <p className="text-body text-ink-secondary">
          Durante el evento tu logo puede aparecer en las pantallas.
        </p>
      </div>
      <CompanyLogoFields
        showLogo={showLogo}
        onShow={setShowLogo}
        onFile={() => undefined}
      />
      {notice ? (
        <Alert variant="destructive">
          <AlertDescription>{notice}</AlertDescription>
        </Alert>
      ) : null}
      <PendingSubmit idle="Subir logo" pendingLabel="Subiendo logo…" />
    </form>
  );
}
```

`onFile` no cambia el avance: esta pantalla no tiene pasos. El input de archivo sigue llamándose `logo` porque `FileDrop` usa `name`.

Reemplazar `src/components/onboarding/finished-profile.tsx` por:

```tsx
import { AccessPass } from "@/components/onboarding/access-pass";
import { LaterLogoForm } from "@/components/onboarding/later-logo-form";
import { PendingNotice } from "@/components/onboarding/pending-notice";
import { ConfidentialityNote } from "@/components/onboarding/confidentiality-note";

export function FinishedProfile({
  accountId,
  gate,
  offerLogo = false,
  logoError,
}: {
  accountId: string;
  gate: "espera" | "cerrado" | "cancelo" | "pase";
  offerLogo?: boolean;
  logoError?: string;
}) {
  const logo = offerLogo ? <LaterLogoForm error={logoError} /> : null;
  if (gate === "cancelo") return <ConfidentialityNote />;
  if (gate === "cerrado") {
    return (
      <div className="grid gap-4">
        <ConfidentialityNote />
        <p data-testid="pase-cancelado" className="text-body text-ink">
          Tu lugar no sigue apartado.
        </p>
      </div>
    );
  }
  if (gate === "espera") {
    return (
      <div className="grid gap-4">
        <ConfidentialityNote />
        <PendingNotice />
        {logo}
      </div>
    );
  }
  return (
    <div className="grid gap-4">
      <ConfidentialityNote />
      <AccessPass code={accountId} />
      {logo}
    </div>
  );
}
```

En `OnboardingWizard`, agregar a las props `offerLogo = false` y `logoError?: string`. En el return de perfil terminado:

```tsx
return <FinishedProfile accountId={accountId} gate={shown} offerLogo={offerLogo} logoError={logoError} />;
```

No pases `offerLogo` al formulario del organismo ni al del empresario que todavía no termina.

- [ ] **Step 4: Correr el test**

Run: `npx vitest run src/lib/onboarding/upload-company-logo-later.test.ts`

Expected: PASS. Si `onboarding-wizard.tsx` o `finished-profile.tsx` pasan de 90 líneas, parte el excedente en otro archivo antes de seguir.

- [ ] **Step 5: Commit**

```bash
git add src/components/onboarding/later-logo-form.tsx src/components/onboarding/finished-profile.tsx src/components/onboarding/onboarding-wizard.tsx src/lib/onboarding/upload-company-logo-later.test.ts
git commit -m "$(cat <<'EOF'
feat: ask for the company logo beside the wait and the pass

EOF
)"
```

---

### Task 6: Conectar la pantalla real de onboarding

**Files:**
- Modify: `src/app/onboarding/supabase-screen.tsx`
- Modify: `src/app/onboarding/page.tsx`
- Test: `src/lib/onboarding/upload-company-logo-later.test.ts`

La página de memoria no tiene Storage. Ahí el aviso no aparece.

- [ ] **Step 1: Escribir el test que falla**

Agregar:

```ts
it("la pantalla de Supabase calcula la oferta y la de memoria no", () => {
  const screen = readFileSync("src/app/onboarding/supabase-screen.tsx", "utf8");
  const memory = readFileSync("src/app/onboarding/page.tsx", "utf8");
  expect(screen).toContain("companyHasLogo");
  expect(screen).toContain("laterLogoOffer");
  expect(screen).toContain("offerLogo={offerLogo}");
  expect(screen).toContain('params.error === "logo"');
  expect(memory).toContain("offerLogo={false}");
});
```

- [ ] **Step 2: Correr el test y verlo fallar**

Run: `npx vitest run src/lib/onboarding/upload-company-logo-later.test.ts`

Expected: FAIL porque `supabase-screen.tsx` no llama `companyHasLogo`.

- [ ] **Step 3: Pasar la oferta al asistente**

En `src/app/onboarding/supabase-screen.tsx`, importar `companyHasLogo` desde `@/lib/onboarding/company-has-logo` y `laterLogoOffer` desde `@/lib/onboarding/company-logo`.

Después de calcular `gate`, y antes del `return`:

```tsx
const hasLogo =
  empresario && (gate === "espera" || gate === "pase") ? await companyHasLogo(token, account.id) : true;
const offerLogo = laterLogoOffer({ hasLogo, gate });
```

En `OnboardingWizard`, agregar:

```tsx
offerLogo={offerLogo}
logoError={params.error === "logo" ? "logo" : undefined}
```

`formError` se queda como está para quien todavía llena el perfil.

En `src/app/onboarding/page.tsx`, el `OnboardingWizard` de memoria recibe `offerLogo={false}`.

`supabase-screen.tsx` cabe en 90 líneas con ese bloque. No extraigas otra función.

- [ ] **Step 4: Correr los tests del logo**

Run: `npx vitest run src/lib/onboarding/company-logo.test.ts src/lib/onboarding/upload-company-logo-later.test.ts src/lib/onboarding/step-issue.test.ts src/lib/onboarding/empresario-draft.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/onboarding/supabase-screen.tsx src/app/onboarding/page.tsx src/lib/onboarding/company-has-logo.ts src/lib/onboarding/upload-company-logo-later.test.ts
git commit -m "$(cat <<'EOF'
feat: show the later logo upload on the finished onboarding screen

EOF
)"
```

---

## Qué se prueba a mano

1. En el paso «Tu empresa», sin archivo y sin check, se puede seguir. Se lee «Opcional. Lo puedes subir después.»
2. El check sin archivo sigue sin dejar avanzar.
3. Terminar sin logo deja al empresario en la espera. Ahí aparece «Veo que no tienes logo. ¿Te gustaría subirlo ahora?», la explicación de las pantallas y el check.
4. Subir PNG, JPG o WEBP de hasta 2 MB con el check prendido quita el aviso. En admin, la empresa queda con «Logo el día del evento: Sí» y el archivo en Logos de la sesión.
5. El mismo aviso aparece en la pantalla del pase si el archivo nunca se subió. No aparece si el lugar se cerró o si la persona canceló.
6. Un archivo de más de 2 MB no se guarda y el aviso sigue.
