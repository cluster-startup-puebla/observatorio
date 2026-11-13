# Registro público Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Un formulario de 2 pasos en `/registro`, en una sola tabla, que al crear la cuenta en `/crear-cuenta` con el mismo correo se vuelque al perfil y a la empresa que ya existen.

**Architecture:** El paso 1 inserta la fila. El paso 2 la completa. No crea usuario ni pide logo. `/register` redirige a `/crear-cuenta`. Después de `signupEmpresarioAndSession`, si el correo tiene una fila completa sin volcar, se llama a `saveEmpresarioProfile` y a `attributeSignup`. Este plan sustituye a `docs/superpowers/plans/2026-11-13-invitacion-sin-cuenta.md`.

**Tech Stack:** Next.js 16, Supabase RPC `security definer`, `saveEmpresarioProfile`. Sin service role. Archivos de código de 90 líneas o menos.

---

### Task 1: La tabla y la regla del paso 1

**Files:**
- Create: `supabase/migrations/20261113130000_public_registrations.sql`
- Create: `src/lib/registro/step-one.ts`
- Test: `src/lib/registro/step-one.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { expect, it } from "vitest";
import { stepOneIssue } from "./step-one";

it("acepta nombre, puesto y correo", () => {
  expect(stepOneIssue({
    fullName: "Ana",
    jobTitle: "Directora",
    email: "ana@empresa.mx",
    whatsapp: "",
  })).toBeNull();
});

it("rechaza un correo sin arroba y un nombre de una letra", () => {
  expect(stepOneIssue({
    fullName: "A",
    jobTitle: "Directora",
    email: "ana",
    whatsapp: "123",
  })).toBe("nombre");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/registro/step-one.test.ts`
Expected: FAIL with `Cannot find module './step-one'`.

- [ ] **Step 3: Write minimal implementation**

```ts
export type StepOne = {
  fullName: string;
  jobTitle: string;
  email: string;
  whatsapp: string;
};

export function stepOneIssue(input: StepOne): "nombre" | "puesto" | "correo" | "whatsapp" | null {
  if (input.fullName.trim().length < 2) return "nombre";
  if (input.jobTitle.trim().length < 2) return "puesto";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) return "correo";
  const digits = input.whatsapp.replace(/\D/g, "");
  if (digits.length > 0 && (digits.length < 10 || digits.length > 15)) return "whatsapp";
  return null;
}
```

Migración:

```sql
create table public.public_registrations (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email = lower(email)),
  full_name text not null,
  job_title text not null,
  whatsapp text,
  company_name text,
  market_size text,
  employee_band text,
  municipality text,
  sector_slug text,
  referral_source text,
  session_interest text,
  invite_token text,
  completed_at timestamptz,
  poured_at timestamptz,
  poured_profile_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.public_registrations enable row level security;

create or replace function public.start_public_registration(
  full_name text,
  job_title text,
  email text,
  whatsapp text,
  sector_slug text,
  invite_token text
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  clean_email text := lower(btrim(email));
  existing uuid;
begin
  if length(btrim(full_name)) < 2 or length(btrim(job_title)) < 2 then
    raise exception 'datos incompletos';
  end if;
  if clean_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception 'correo';
  end if;
  select id into existing from public.public_registrations where public_registrations.email = clean_email;
  if existing is not null then return existing; end if;
  insert into public.public_registrations (email, full_name, job_title, whatsapp, sector_slug, invite_token)
  values (clean_email, btrim(full_name), btrim(job_title), nullif(btrim(whatsapp), ''), nullif(btrim(sector_slug), ''), nullif(btrim(invite_token), ''))
  returning id into existing;
  return existing;
end;
$$;

revoke all on function public.start_public_registration(text, text, text, text, text, text) from public;
grant execute on function public.start_public_registration(text, text, text, text, text, text) to anon, authenticated;
```

No hay policy de `select` para `anon`. El id sale solo del RPC.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/registro/step-one.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20261113130000_public_registrations.sql src/lib/registro/step-one.ts src/lib/registro/step-one.test.ts
git commit -m "feat: open a public registration row on the first step"
```

---

### Task 2: El paso 2 cierra esa fila

**Files:**
- Create: `src/lib/registro/step-two.ts`
- Test: `src/lib/registro/step-two.test.ts`
- Modify: `supabase/migrations/20261113130000_public_registrations.sql` (solo si aún no está en el remoto; si ya se aplicó, migración nueva `20261113131000_finish_public_registration.sql`)

- [ ] **Step 1: Write the failing test**

```ts
import { expect, it } from "vitest";
import { stepTwoIssue } from "./step-two";

const ready = {
  companyName: "Norte",
  marketSize: "local",
  employeeBand: "1–10",
  municipality: "Puebla",
  sectorSlug: "alimentos-y-bebidas",
  referralSource: "Un organismo",
  sessionInterest: "Ver el diagnóstico",
  terms: true,
};

it("el paso 2 no pide logo", () => {
  expect(stepTwoIssue(ready)).toBeNull();
  expect(stepTwoIssue({ ...ready, terms: false })).toBe("terminos");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/registro/step-two.test.ts`
Expected: FAIL with `Cannot find module './step-two'`.

- [ ] **Step 3: Write minimal implementation**

`stepTwoIssue` reusa las mismas reglas que `empresarioErrors` para empresa, mercado, empleados, municipio, sector, referencia e interés. Si `terms` no es true, regresa `"terminos"`. No mira logo.

```sql
create or replace function public.finish_public_registration(
  registration_id uuid,
  company_name text,
  market_size text,
  employee_band text,
  municipality text,
  sector_slug text,
  referral_source text,
  session_interest text
) returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if length(btrim(company_name)) < 2 or length(btrim(referral_source)) < 2 then
    raise exception 'datos incompletos';
  end if;
  if length(btrim(session_interest)) < 2 or length(btrim(session_interest)) > 500 then
    raise exception 'interes';
  end if;
  update public.public_registrations set
    company_name = btrim(company_name),
    market_size = btrim(market_size),
    employee_band = btrim(employee_band),
    municipality = btrim(municipality),
    sector_slug = coalesce(nullif(btrim(sector_slug), ''), public_registrations.sector_slug),
    referral_source = btrim(referral_source),
    session_interest = btrim(session_interest),
    completed_at = now()
  where id = registration_id and poured_at is null;
  if not found then raise exception 'no se puede cerrar'; end if;
end;
$$;

revoke all on function public.finish_public_registration(uuid, text, text, text, text, text, text, text) from public;
grant execute on function public.finish_public_registration(uuid, text, text, text, text, text, text, text) to anon, authenticated;
```

El sector que ya guardó el enlace no se borra si el argumento viene vacío.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/registro/step-two.test.ts`
Expected: PASS. Añadir un caso de interés vacío que regrese `"interes"`.

- [ ] **Step 5: Commit**

```bash
git add src/lib/registro/step-two.ts src/lib/registro/step-two.test.ts supabase/migrations/20261113130000_public_registrations.sql
git commit -m "feat: finish the public registration in a second step"
```

---

### Task 3: La pantalla de dos pasos

**Files:**
- Create: `src/app/registro/page.tsx`
- Create: `src/app/registro/registro-form.tsx`
- Create: `src/app/registro/actions.ts`
- Test: `src/app/registro/registro-form.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

it("el formulario no pide cuenta ni logo", () => {
  const source = readFileSync("src/app/registro/registro-form.tsx", "utf8");
  expect(source).toContain("Paso");
  expect(source).not.toContain("CompanyLogoFields");
  expect(source).not.toContain("contrasena");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/app/registro/registro-form.test.ts`
Expected: FAIL because the file does not exist.

- [ ] **Step 3: Write minimal implementation**

`page.tsx` lee `sector` e `invitacion` y pinta `RegistroForm`. `actions.ts` tiene dos server actions:

- `startRegistro` valida con `stepOneIssue`, llama `start_public_registration` con el cliente anónimo y devuelve `{ id }` o `{ error }`.
- `finishRegistro` valida con `stepTwoIssue`, llama `finish_public_registration` y devuelve `{ ok: true }` o `{ error }`.

`registro-form.tsx` es cliente. Estado `step` 0 o 1. En el 0, Siguiente llama `startRegistro` y guarda el id. En el 1, Enviar llama `finishRegistro` y cambia a la frase «Quedó registrado». El error va en `Alert`. El sector del enlace se muestra como texto y viaja en un hidden; no hay selector. Atrás no borra la fila.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/app/registro/registro-form.test.ts src/lib/registro/step-one.test.ts src/lib/registro/step-two.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/registro
git commit -m "feat: show the public registration as two steps"
```

---

### Task 4: Separar crear cuenta del formulario

**Files:**
- Create: `src/app/crear-cuenta/page.tsx`
- Modify: `src/app/register/page.tsx`
- Modify: `src/lib/sectors.ts`
- Modify: hrefs que hoy mandan a crear cuenta: `src/components/site/footer.tsx`, `src/app/login/page.tsx`, `src/lib/auth/session-redirect.ts`, `src/components/auth/paths.ts`, `src/lib/organismo/signup-back.ts`
- Modify: botones de reservar lugar (`event-open.tsx`, `event-landing.tsx`, `hero.tsx`, `landing-body.tsx`) para que el default sea `/registro`
- Test: `src/lib/sectors.test.ts`

- [ ] **Step 1: Write the failing test**

En `src/lib/sectors.test.ts`, cambiar las expectativas:

```ts
expect(reserveHref("/automotriz-y-autopartes")).toBe("/registro?sector=automotriz-y-autopartes");
expect(reserveHref("/")).toBe("/registro");
expect(reserveHref("/turismo", "abc")).toBe("/registro?sector=turismo&invitacion=abc");
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/sectors.test.ts`
Expected: FAIL. Hoy regresan `/register`.

- [ ] **Step 3: Write minimal implementation**

`reserveHref` arma `/registro` en lugar de `/register`. `src/app/register/page.tsx` queda así:

```tsx
import { redirect } from "next/navigation";

export default async function RegisterPage({ searchParams }: PageProps<"/register">) {
  const params = await searchParams;
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") query.set(key, value);
  }
  const search = query.toString();
  redirect(search ? `/crear-cuenta?${search}` : "/crear-cuenta");
}
```

`src/app/crear-cuenta/page.tsx` es el contenido actual de `register/page.tsx` (el `AccountForm` y el caso organismo). `cuenta=organismo` no entra a `/registro`. Los tests de `session-redirect` y `admin-gate` que listan `"/register"` pasan a incluir `"/crear-cuenta"` y `"/registro"`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/sectors.test.ts src/lib/auth/session-redirect.test.ts src/lib/auth/recover-gate.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/crear-cuenta src/app/register/page.tsx src/lib/sectors.ts src/lib/sectors.test.ts src/components/site/footer.tsx src/app/login/page.tsx src/lib/auth src/components/auth/paths.ts src/lib/organismo/signup-back.ts src/components/landing
git commit -m "feat: split account creation from the public form"
```

---

### Task 5: Volcar la fila al crear la cuenta

**Files:**
- Create: `src/lib/registro/pour.ts`
- Test: `src/lib/registro/pour.test.ts`
- Modify: `src/lib/auth/signup-empresario.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { expect, it } from "vitest";
import { toEmpresarioProfile } from "./pour";

it("copia la fila al perfil y no trae logo", () => {
  expect(toEmpresarioProfile({
    full_name: "Ana",
    job_title: "Directora",
    whatsapp: null,
    company_name: "Norte",
    market_size: "local",
    employee_band: "1–10",
    municipality: "Puebla",
    sector_slug: "alimentos-y-bebidas",
    referral_source: "Un organismo",
    session_interest: "Ver el diagnóstico",
  })).toEqual({
    fullName: "Ana",
    jobTitle: "Directora",
    whatsapp: "",
    companyName: "Norte",
    marketSize: "local",
    employeeBand: "1–10",
    municipality: "Puebla",
    sectorSlug: "alimentos-y-bebidas",
    referralSource: "Un organismo",
    sessionInterest: "Ver el diagnóstico",
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/registro/pour.test.ts`
Expected: FAIL with `Cannot find module './pour'`.

- [ ] **Step 3: Write minimal implementation**

`toEmpresarioProfile` mapea las columnas al tipo `EmpresarioProfile`. `pourRegistration(accessToken, profileId, email)`:

1. Lee con el cliente de esa sesión la fila donde `email` es el correo, `completed_at` no es null y `poured_at` es null. Hace falta una policy `select`/`update` para `authenticated` limitada a `lower(email) = (auth.jwt() ->> 'email')`, o un RPC `pour_public_registration(profile_id uuid)` `security definer` que compara el correo del jwt y marca `poured_at`. Usar el RPC para no abrir la tabla.
2. Si no hay fila, regresa `{ poured: false }`.
3. Si hay, llama `saveEmpresarioProfile(accessToken, profileId, profile, Boolean(invite_token), false)`.
4. Si hay `invite_token`, llama `attributeSignup`.
5. El RPC marca `poured_at` y `poured_profile_id`.

En `signup-empresario.ts`, justo antes de cada `return { next: nextPath(...) }` que ya tiene sesión escrita, llamar `pourRegistration`. Si volcó, el `next` es `/onboarding` sin volver a pedir los tres pasos. Si no hay fila, el `next` actual no cambia.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/registro/pour.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/registro/pour.ts src/lib/registro/pour.test.ts src/lib/auth/signup-empresario.ts supabase/migrations/20261113130000_public_registrations.sql
git commit -m "feat: pour a finished public registration into the new account"
```

---

### Task 6: Verlos en el panel antes de la cuenta

**Files:**
- Create: `src/lib/admin/registros/list.ts`
- Create: `src/app/admin/registros/page.tsx`
- Create: `src/app/admin/registros/registros-list.tsx`

- [ ] **Step 1: Write the failing test**

```ts
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

it("la lista la lee el superadmin", () => {
  const source = readFileSync("src/lib/admin/registros/list.ts", "utf8");
  expect(source).toContain("adminDb");
  expect(source).toContain("public_registrations");
  expect(source).not.toContain("SERVICE_ROLE");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/admin/registros/list.test.ts`
Expected: FAIL because the file does not exist.

- [ ] **Step 3: Write minimal implementation**

`list.ts` usa `adminDb()` y selecciona `full_name, company_name, email, sector_slug, completed_at, poured_at`, ordenado por `created_at` desc. La página exige `requireSuperadmin` y muestra una tabla: nombre, empresa, correo, sector, «Completo» o «A medias», «Ya tiene cuenta» si `poured_at` tiene valor. Sin editar ni borrar.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/admin/registros/list.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/admin/registros src/app/admin/registros
git commit -m "feat: list public registrations before they become accounts"
```

---

## Verificación

- `/registro` en 390 px recorre los dos pasos. No hay contraseña ni logo.
- Cerrar después del paso 1 y volver con el mismo id deja la fila.
- `/crear-cuenta` con ese correo crea perfil y empresa, y si había token, la ficha del organismo. `poured_at` queda lleno.
- Un correo que no está en la tabla sigue al onboarding de siempre.
- `/register?sector=turismo` llega a `/crear-cuenta?sector=turismo`.
- `/admin/registros` muestra la fila antes de crear la cuenta.
