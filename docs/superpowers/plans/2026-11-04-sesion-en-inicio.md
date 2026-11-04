# Sesión en inicio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Si ya hay sesión, la home y las pantallas de auth que todavía no la miran mandan a `pathAfterSignIn`, y ese destino no vuelve a redirigir.

**Architecture:** `pathAfterSignIn` ya existe y no se toca. Una función pura nueva solo decide si el pathname es una entrada; si lo es, devuelve `pathAfterSignIn`. Un helper de servidor lee la cookie y redirige solo cuando esa función devuelve una ruta. Las pantallas de entrada llaman al helper. El layout y los destinos no.

**Tech Stack:** Next.js 16 con cache components (`export const instant = false`), Vitest, `readSessionAccount()` (cookie de Supabase o cookie de cuenta en memoria).

---

Los comandos se corren desde `/Users/alvarocastillo/dev/levantamiento`.

## Ya está en el árbol (no lo reescribas)

`src/lib/auth/home.ts` exporta `pathAfterSignIn({ role, onboarded, slug? })`. Empresario sin `onboarded` va a `/onboarding`; el resto delega en `homeForRole`. `src/lib/auth/home.test.ts` ya lo cubre. No edites `home.ts` ni ese test.

`SessionAccount` ya trae `onboarded`. `readSessionAccount` lo llena desde `getAccount` en memoria y desde `profiles.onboarded_at` en Supabase. No edites `src/lib/auth/session-account.ts`.

Ya llaman a `pathAfterSignIn` y no se editan:

- `src/lib/auth/login-action.ts` (también pasa `slug`; este plan no busca slug).
- `src/lib/auth/guards.ts`.
- `src/app/login/page.tsx` línea 33, antes del salto a `/verificar`. La Task 4 solo cambia esa llamada por el helper, en el mismo lugar.
- `src/app/admin/login/page.tsx` líneas 38-42: abierto va a `/admin/signup`; con sesión usa `pathAfterSignIn` (superadmin cae en `/admin`). La Task 5 lo pasa por la función pura, sin otra regla para el empresario.
- `src/lib/auth/onboarding-gate.ts` y `src/app/metodologia/page.tsx`: el empresario sin perfil que ya está en metodología va a `/onboarding`. No uses `redirectUnfinishedEmpresario` en `/` ni en las pantallas de auth: no mueve a los otros roles.

## Mapa de archivos

- Create: `src/lib/auth/session-redirect.ts` — `sessionRedirect`, `adminLoginRedirect`, `adminSignupRedirect`. Importa `pathAfterSignIn`. No copia la regla del empresario.
- Create: `src/lib/auth/session-redirect.test.ts` — ciclos de las entradas públicas.
- Create: `src/lib/auth/admin-gate.test.ts` — ciclos de las puertas de admin.
- Create: `src/lib/auth/redirect-if-session.ts` — helper de servidor.
- Create: `src/lib/auth/redirect-if-session.test.ts`
- Create: `src/lib/auth/login-gate.test.ts` — home, login y verificar.
- Create: `src/lib/auth/recover-gate.test.ts` — register, recuperar y restablecer.
- Create: `src/lib/auth/admin-pages.test.ts`
- Modify: `src/app/page.tsx`, `src/app/login/page.tsx`, `src/app/register/page.tsx`, `src/app/verificar/page.tsx`, `src/app/recuperar/page.tsx`, `src/app/restablecer/page.tsx`, `src/app/admin/login/page.tsx`, `src/app/admin/signup/page.tsx`.

Ningún `.ts` o `.tsx` de este cambio pasa de 90 líneas. `home.ts` se queda en 31.

## No tocar

- `src/lib/auth/home.ts`, `src/lib/auth/home.test.ts`, `src/lib/auth/session-account.ts`, `src/lib/auth/login-action.ts`, `src/lib/auth/guards.ts`, `src/lib/auth/onboarding-gate.ts`.
- `src/app/layout.tsx`. Un redirect ahí rebotaría todas las rutas.
- `src/app/onboarding/page.tsx` y `src/app/onboarding/supabase-screen.tsx`. Sin sesión, memoria va a `/register` y Supabase a `/login?next=/onboarding`. Con sesión, la pantalla se queda.
- `src/app/metodologia/page.tsx`, `src/app/organismo/page.tsx`, `src/app/admin/page.tsx`, `src/app/admin/layout.tsx`, `src/app/[sector]/page.tsx`. `/organismo` ya resuelve el slug. Este plan no lo busca.
- `src/components/auth/paths.ts`. `isAuthPath` usa `startsWith` y mete destinos (`/onboarding`, `/metodologia`, `/admin`). No sirve como conjunto de entrada.
- `.cursor/ruta-codi/`, `logos_lev.tgz`, el multi-step de onboarding y el correo de verificación.
- `e2e/admin-login.spec.ts`.

## Grafo

```
entrada con cuenta
  /   /login   /register   /verificar   /recuperar   /restablecer
        |
        v
  pathAfterSignIn({ role, onboarded })    sin slug
        +-- empresario onboarded false --> /onboarding   (segunda llamada: null)
        +-- empresario onboarded true  --> /metodologia  (null; metodología no entra al conjunto)
        +-- superadmin                 --> /admin
        +-- moderador                  --> /admin/mesa
        +-- director, capturista, invitador --> /organismo

sin cuenta en esas entradas --> null

/verificar sin cuenta y correo confirmado --> /login?aviso=confirmado
/login sin cuenta y error=confirmar       --> /verificar
  la sesión se resuelve ANTES de ese salto (hoy ya es así en /login)

/admin/login
  open true  --> /admin/signup --> null
  open false, sin cuenta --> null
  open false, con cuenta --> pathAfterSignIn

/admin/signup
  open true --> null
  open false, sin cuenta --> /admin/login --> null
  open false, con cuenta --> pathAfterSignIn
```

`/restablecer` solo se abandona si `readSessionAccount()` devuelve cuenta. No leas el hash del enlace.

---

### Task 1: La entrada redirige con pathAfterSignIn y no cicla

**Files:**
- Create: `src/lib/auth/session-redirect.test.ts`
- Create: `src/lib/auth/session-redirect.ts`
- Test: `src/lib/auth/session-redirect.test.ts`

- [ ] **Step 1: Write the failing test**

`src/lib/auth/session-redirect.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type { AccountRole } from "@/lib/directory";
import { pathAfterSignIn } from "./home";
import { sessionRedirect } from "./session-redirect";

const roles: AccountRole[] = [
  "superadmin",
  "moderador",
  "empresario",
  "director",
  "capturista",
  "invitador",
];
const entries = ["/", "/login", "/register", "/verificar", "/recuperar", "/restablecer"];
const stayed = [
  "/onboarding",
  "/metodologia",
  "/organismo",
  "/admin",
  "/admin/mesa",
  "/admin/login",
  "/admin/signup",
  "/turismo",
  "/canacintra",
];

describe("sessionRedirect", () => {
  it("sin cuenta no redirige", () => {
    for (const path of entries) expect(sessionRedirect({ path, account: null })).toBeNull();
  });

  it("delega en pathAfterSignIn y la segunda llamada se detiene", () => {
    for (const path of entries) {
      for (const role of roles) {
        for (const onboarded of [false, true]) {
          const account = { role, onboarded };
          const dest = sessionRedirect({ path, account });
          expect(dest).toBe(pathAfterSignIn(account));
          expect(entries).not.toContain(dest);
          expect(sessionRedirect({ path: dest ?? "", account })).toBeNull();
        }
      }
    }
  });

  it("un destino, una puerta de admin o una landing no es entrada", () => {
    const account = { role: "empresario" as const, onboarded: false };
    for (const path of stayed) expect(sessionRedirect({ path, account })).toBeNull();
  });

  it("no copia la regla del empresario y no toca el layout ni los destinos", () => {
    const gate = readFileSync("src/lib/auth/session-redirect.ts", "utf8");
    expect(gate).toContain("pathAfterSignIn");
    expect(gate).not.toContain("empresario");
    expect(readFileSync("src/lib/auth/home.ts", "utf8")).toContain(
      'if (input.role === "empresario" && !input.onboarded) return "/onboarding"',
    );
    const files = [
      "src/app/layout.tsx",
      "src/app/onboarding/page.tsx",
      "src/app/onboarding/supabase-screen.tsx",
      "src/app/metodologia/page.tsx",
      "src/app/organismo/page.tsx",
      "src/app/admin/page.tsx",
      "src/app/admin/layout.tsx",
      "src/app/[sector]/page.tsx",
    ];
    for (const file of files) expect(readFileSync(file, "utf8")).not.toContain("redirectIfSession");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/auth/session-redirect.test.ts`

Expected: FAIL. Vite no resuelve `./session-redirect`.

- [ ] **Step 3: Write minimal implementation**

`src/lib/auth/session-redirect.ts` (la Task 2 reemplaza este archivo entero):

```ts
import type { AccountRole } from "@/lib/directory";
import { pathAfterSignIn } from "./home";

type GateAccount = { role: AccountRole; onboarded: boolean };

const sessionEntries = new Set<string>([
  "/",
  "/login",
  "/register",
  "/verificar",
  "/recuperar",
  "/restablecer",
]);

export function sessionRedirect(input: { path: string; account: GateAccount | null }) {
  if (!input.account || !sessionEntries.has(input.path)) return null;
  return pathAfterSignIn({ role: input.account.role, onboarded: input.account.onboarded });
}
```

`path` es el pathname literal, sin `?` y sin hash. La comparación es `Set.has`, no `startsWith`. No pases `slug`. No escribas la condición del empresario aquí.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/auth/session-redirect.test.ts src/lib/auth/home.test.ts`

Expected: PASS. `home.test.ts` sigue igual.

- [ ] **Step 5: Commit**

```bash
git add src/lib/auth/session-redirect.ts src/lib/auth/session-redirect.test.ts
git commit -m "$(cat <<'EOF'
feat: gate auth screens with the existing post-login path

EOF
)"
```

### Task 2: Puertas de superadmin sin ciclo

**Files:**
- Create: `src/lib/auth/admin-gate.test.ts`
- Modify: `src/lib/auth/session-redirect.ts`
- Test: `src/lib/auth/admin-gate.test.ts`

- [ ] **Step 1: Write the failing test**

`src/lib/auth/admin-gate.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import type { AccountRole } from "@/lib/directory";
import { pathAfterSignIn } from "./home";
import { adminLoginRedirect, adminSignupRedirect, sessionRedirect } from "./session-redirect";

const roles: AccountRole[] = [
  "superadmin",
  "moderador",
  "empresario",
  "director",
  "capturista",
  "invitador",
];
const entries = ["/", "/login", "/register", "/verificar", "/recuperar", "/restablecer"];

describe("adminLoginRedirect y adminSignupRedirect", () => {
  it("abierto: login va a signup y signup se queda", () => {
    const account = { role: "empresario" as const, onboarded: false };
    expect(adminLoginRedirect({ open: true, account: null })).toBe("/admin/signup");
    expect(adminLoginRedirect({ open: true, account })).toBe("/admin/signup");
    expect(adminSignupRedirect({ open: true, account: null })).toBeNull();
    expect(adminSignupRedirect({ open: true, account })).toBeNull();
  });

  it("cerrado sin sesión: signup va a login y login se queda", () => {
    expect(adminSignupRedirect({ open: false, account: null })).toBe("/admin/login");
    expect(adminLoginRedirect({ open: false, account: null })).toBeNull();
  });

  it("cerrado con sesión: el destino es pathAfterSignIn y no cicla", () => {
    for (const role of roles) {
      for (const onboarded of [false, true]) {
        const account = { role, onboarded };
        const dest = adminLoginRedirect({ open: false, account });
        expect(dest).toBe(pathAfterSignIn(account));
        expect(adminSignupRedirect({ open: false, account })).toBe(dest);
        expect(dest).not.toBe("/admin/login");
        expect(dest).not.toBe("/admin/signup");
        expect(entries).not.toContain(dest);
        expect(sessionRedirect({ path: dest ?? "", account })).toBeNull();
      }
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/auth/admin-gate.test.ts`

Expected: FAIL. `./session-redirect` no exporta `adminLoginRedirect`.

- [ ] **Step 3: Write minimal implementation**

Reemplaza `src/lib/auth/session-redirect.ts` completo por esto:

```ts
import type { AccountRole } from "@/lib/directory";
import { pathAfterSignIn } from "./home";

type GateAccount = { role: AccountRole; onboarded: boolean };

const sessionEntries = new Set<string>([
  "/",
  "/login",
  "/register",
  "/verificar",
  "/recuperar",
  "/restablecer",
]);

function destination(account: GateAccount) {
  return pathAfterSignIn({ role: account.role, onboarded: account.onboarded });
}

export function sessionRedirect(input: { path: string; account: GateAccount | null }) {
  if (!input.account || !sessionEntries.has(input.path)) return null;
  return destination(input.account);
}

export function adminLoginRedirect(input: { open: boolean; account: GateAccount | null }) {
  if (input.open) return "/admin/signup";
  if (!input.account) return null;
  return destination(input.account);
}

export function adminSignupRedirect(input: { open: boolean; account: GateAccount | null }) {
  if (input.open) return null;
  if (input.account) return destination(input.account);
  return "/admin/login";
}
```

`open: true` gana sobre la cuenta. Signup abierto devuelve `null` aunque haya sesión. No agregues un caso especial de empresario: `pathAfterSignIn` ya lo resuelve.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/auth/admin-gate.test.ts src/lib/auth/session-redirect.test.ts src/lib/auth/home.test.ts`

Expected: PASS.

Run: `wc -l src/lib/auth/session-redirect.ts src/lib/auth/session-redirect.test.ts src/lib/auth/admin-gate.test.ts src/lib/auth/home.ts`

Expected: 34, menos de 90, menos de 90, y 31. Si un test pasa de 90, pártelo en este paso.

- [ ] **Step 5: Commit**

```bash
git add src/lib/auth/session-redirect.ts src/lib/auth/admin-gate.test.ts
git commit -m "$(cat <<'EOF'
feat: stop the admin signup and login redirect loop

EOF
)"
```

### Task 3: Helper de servidor

**Files:**
- Create: `src/lib/auth/redirect-if-session.test.ts`
- Create: `src/lib/auth/redirect-if-session.ts`
- Test: `src/lib/auth/redirect-if-session.test.ts`

- [ ] **Step 1: Write the failing test**

`src/lib/auth/redirect-if-session.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("redirectIfSession", () => {
  it("aplica sessionRedirect y no decide el destino", () => {
    const source = readFileSync("src/lib/auth/redirect-if-session.ts", "utf8");
    expect(source).toContain('import "server-only"');
    expect(source).toContain("readSessionAccount");
    expect(source).toContain("sessionRedirect");
    expect(source).toContain("onboarded: account.onboarded");
    expect(source).toContain("if (next) redirect(next)");
    expect(source).not.toContain("pathAfterSignIn");
    expect(source).not.toContain("empresario");
    expect(source).not.toContain("homeForRole");
  });

  it("la sesión ya trae onboarded y este plan no la reescribe", () => {
    const source = readFileSync("src/lib/auth/session-account.ts", "utf8");
    expect(source).toContain("onboarded: account.onboarded");
    expect(source).toContain("onboarded: Boolean(profile.data?.onboarded_at)");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/auth/redirect-if-session.test.ts`

Expected: FAIL. `redirect-if-session.ts` no existe (`ENOENT`).

- [ ] **Step 3: Write minimal implementation**

Crea `src/lib/auth/redirect-if-session.ts`. No edites `session-account.ts`.

```ts
import "server-only";

import { redirect } from "next/navigation";
import { sessionRedirect } from "./session-redirect";
import { readSessionAccount } from "./session-account";

export async function redirectIfSession(path: string) {
  const account = await readSessionAccount();
  const next = sessionRedirect({
    path,
    account: account ? { role: account.role, onboarded: account.onboarded } : null,
  });
  if (next) redirect(next);
}
```

`redirect()` de Next lanza. Si `next` es `null`, la página se pinta. `/admin/login` y `/admin/signup` no están en el conjunto: este helper no les sirve. Esas páginas usan las funciones de la Task 2.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/auth/redirect-if-session.test.ts src/lib/auth/session-redirect.test.ts`

Expected: PASS.

Run: `wc -l src/lib/auth/redirect-if-session.ts src/lib/auth/redirect-if-session.test.ts`

Expected: 14 y menos de 90.

- [ ] **Step 5: Commit**

```bash
git add src/lib/auth/redirect-if-session.ts src/lib/auth/redirect-if-session.test.ts
git commit -m "$(cat <<'EOF'
feat: redirect an auth screen only when the session gate says so

EOF
)"
```

### Task 4: Home, login, verificar, register, recuperar y restablecer

**Files:**
- Create: `src/lib/auth/login-gate.test.ts`
- Create: `src/lib/auth/recover-gate.test.ts`
- Modify: `src/app/page.tsx`
- Modify: `src/app/login/page.tsx`
- Modify: `src/app/verificar/page.tsx`
- Modify: `src/app/register/page.tsx`
- Modify: `src/app/recuperar/page.tsx`
- Modify: `src/app/restablecer/page.tsx`
- Test: `src/lib/auth/login-gate.test.ts`
- Test: `src/lib/auth/recover-gate.test.ts`

`src/app/page.tsx` no lee cookies y no tiene `export const instant = false`. Sin ese export, Next falla el prerender al leer la cookie. Ya pasó en `/verificar`. `/login`, `/verificar` y `/register` ya lo tienen: no lo quites. `/recuperar` y `/restablecer` no lo tienen: hay que ponerlo.

`/login` ya redirige con `pathAfterSignIn` antes de `error=confirmar`. Sustituye solo esas dos líneas por `await redirectIfSession("/login")`, en ese mismo sitio. No inviertas el orden: si el salto a `/verificar` queda primero, una sesión en `/login?error=confirmar&correo=` entra a `/verificar` y puede volver.

`/verificar` hoy, si el correo ya está confirmado, hace `redirect("/login?aviso=confirmado")` sin mirar la sesión. El helper va antes de esa línea.

En `/register` la llamada va en `RegisterPage`, antes del `<Suspense>`, no dentro de `RegisterScreen`.

`/restablecer` sigue siendo server component. No leas `window`, `location` ni el hash.

- [ ] **Step 1: Write the failing test**

`src/lib/auth/login-gate.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("home, login y verificar", () => {
  it("leen la cookie con instant apagado y llaman al helper", () => {
    const pages: [string, string][] = [
      ["src/app/page.tsx", 'redirectIfSession("/")'],
      ["src/app/login/page.tsx", 'redirectIfSession("/login")'],
      ["src/app/verificar/page.tsx", 'redirectIfSession("/verificar")'],
    ];
    for (const [file, call] of pages) {
      const source = readFileSync(file, "utf8");
      expect(source).toContain("export const instant = false");
      expect(source).toContain(call);
      expect(source).not.toContain("homeForRole");
    }
  });

  it("login resuelve la sesión antes de saltar a verificar", () => {
    const source = readFileSync("src/app/login/page.tsx", "utf8");
    const session = source.indexOf('redirectIfSession("/login")');
    const jump = source.indexOf("redirect(`/verificar?correo=");
    expect(session).toBeGreaterThan(-1);
    expect(jump).toBeGreaterThan(session);
    expect(source).not.toContain("pathAfterSignIn");
  });

  it("verificar resuelve la sesión antes del aviso de correo confirmado", () => {
    const source = readFileSync("src/app/verificar/page.tsx", "utf8");
    const session = source.indexOf('redirectIfSession("/verificar")');
    const jump = source.indexOf('redirect("/login?aviso=confirmado")');
    expect(session).toBeGreaterThan(-1);
    expect(jump).toBeGreaterThan(session);
  });
});
```

`src/lib/auth/recover-gate.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("register, recuperar y restablecer", () => {
  it("leen la cookie con instant apagado y llaman al helper", () => {
    const pages: [string, string][] = [
      ["src/app/register/page.tsx", 'redirectIfSession("/register")'],
      ["src/app/recuperar/page.tsx", 'redirectIfSession("/recuperar")'],
      ["src/app/restablecer/page.tsx", 'redirectIfSession("/restablecer")'],
    ];
    for (const [file, call] of pages) {
      const source = readFileSync(file, "utf8");
      expect(source).toContain("export const instant = false");
      expect(source).toContain(call);
      expect(source).not.toContain("homeForRole");
    }
  });

  it("register redirige antes del fallback de Suspense", () => {
    const source = readFileSync("src/app/register/page.tsx", "utf8");
    const call = source.indexOf('redirectIfSession("/register")');
    const suspense = source.indexOf("<Suspense");
    expect(call).toBeGreaterThan(-1);
    expect(call).toBeLessThan(suspense);
  });

  it("restablecer no mira el hash del enlace", () => {
    const source = readFileSync("src/app/restablecer/page.tsx", "utf8");
    expect(source).not.toContain("hash");
    expect(source).not.toContain("window");
    expect(source).not.toContain("location");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/auth/login-gate.test.ts src/lib/auth/recover-gate.test.ts`

Expected: FAIL. `src/app/page.tsx` no contiene `redirectIfSession("/")`.

- [ ] **Step 3: Write minimal implementation**

Reemplaza `src/app/page.tsx` por esto:

```tsx
import type { Metadata } from "next";
import { EventLanding } from "@/components/landing/event-landing";
import { redirectIfSession } from "@/lib/auth/redirect-if-session";
import { pageMetadata, siteDescription, siteName } from "@/lib/metadata";

export const instant = false;

export const metadata: Metadata = pageMetadata({
  title: siteName,
  description: siteDescription,
  path: "/",
  absolute: true,
});

export default async function Home() {
  await redirectIfSession("/");
  return <EventLanding />;
}
```

Reemplaza `src/app/login/page.tsx` por esto. El destino no se calcula en la página: lo hace el helper con `pathAfterSignIn`. El salto a `/verificar` queda debajo:

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthSplit } from "@/components/auth/auth-split";
import { LoginForm } from "@/components/auth/login-form";
import { LoginNotice } from "@/components/auth/login-notice";
import { redirectIfSession } from "@/lib/auth/redirect-if-session";
import { pageMetadata } from "@/lib/metadata";

export const instant = false;

export const metadata: Metadata = pageMetadata({
  title: "Entrar",
  description: "Entra a tu cuenta del Observatorio Tecnológico de Puebla.",
  path: "/login",
});

const messages: Record<string, string> = {
  correo: "Escribe un correo válido.",
  contrasena: "Usa al menos 8 caracteres.",
  credenciales: "Correo o contraseña incorrectos.",
  rol: "Esta cuenta no tiene un acceso reconocido.",
  confirmar: "Confirma el correo antes de entrar. Revisa la bandeja o pide otro enlace.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; aviso?: string; correo?: string }>;
}) {
  await redirectIfSession("/login");

  const params = await searchParams;
  const error = params.error ? messages[params.error] : undefined;
  const notice =
    params.aviso === "confirmado"
      ? "Correo confirmado. Ya puedes entrar."
      : params.aviso === "sesion"
        ? "Sesión cerrada."
        : undefined;
  if (params.error === "confirmar" && params.correo) {
    redirect(`/verificar?correo=${encodeURIComponent(params.correo)}`);
  }

  return (
    <AuthSplit
      title="La sesión de tu sector."
      lead="Entras con tu correo. Cada rol llega a su propia puerta."
    >
      <h1 className="text-h2 text-ink">Entrar</h1>
      <div className="mt-8">
        <LoginNotice notice={notice} />
        <LoginForm error={error} errorCode={params.error} />
      </div>
      <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-small">
        <Link href="/recuperar" className="text-link">
          Olvidé mi contraseña
        </Link>
        <Link href="/register" className="text-link">
          ¿Aún no reservas? Reserva tu lugar
        </Link>
      </div>
    </AuthSplit>
  );
}
```

Reemplaza `src/app/verificar/page.tsx` por esto:

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResendConfirmationForm } from "@/components/auth/resend-confirmation-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { redirectIfSession } from "@/lib/auth/redirect-if-session";
import { emailIsConfirmed } from "@/lib/auth/confirmed-email";
import { pageMetadata } from "@/lib/metadata";

export const instant = false;

export const metadata: Metadata = pageMetadata({
  title: "Revisa tu correo",
  description: "Revisa tu correo para confirmar tu cuenta del Observatorio.",
  path: "/verificar",
});

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ correo?: string }>;
}) {
  await redirectIfSession("/verificar");
  const params = await searchParams;
  const email = params.correo?.trim() ?? "";
  if (email && (await emailIsConfirmed(email))) redirect("/login?aviso=confirmado");
  return (
    <AuthShell
      kicker="Correo"
      title="Revisa tu correo"
      lead="Te enviamos un enlace para confirmar la cuenta. Ábrelo y luego entra. Si no llega, pide otro."
      footer={
        <>
          <Link href="/login" className="text-link">
            Entrar
          </Link>
          <Link href="/register" className="text-link">
            Reservar mi lugar
          </Link>
        </>
      }
    >
      {email ? (
        <ResendConfirmationForm email={email} />
      ) : (
        <Alert>
          <AlertDescription>Entra con tu correo. Si falta confirmarlo, aquí puedes pedir otro enlace.</AlertDescription>
        </Alert>
      )}
    </AuthShell>
  );
}
```

Reemplaza `src/app/register/page.tsx` por esto:

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { AccountForm } from "@/components/onboarding/account-form";
import { RegisterForm } from "@/components/landing/sections/register-form";
import { diagnosticDownloadParam } from "@/content/diagnostico-tmec";
import { redirectIfSession } from "@/lib/auth/redirect-if-session";
import { registerError } from "@/lib/organismo/register-error";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Reserva tu lugar",
  description: "La sesión de tu sector. Sin costo. Cupo de 15 a 30 empresas.",
  path: "/register",
});

export const instant = false;

const loginLink = (
  <Link href="/login" className="text-small text-link">
    ¿Ya te registraste? Inicia sesión
  </Link>
);

export default async function RegisterPage({ searchParams }: PageProps<"/register">) {
  await redirectIfSession("/register");
  return (
    <Suspense
      fallback={
        <AuthShell
          kicker="Levantamiento de necesidades tecnológicas"
          title="Reserva tu lugar"
          lead="La sesión de tu sector. Sin costo. Cupo de 15 a 30 empresas."
          links={loginLink}
        />
      }
    >
      <RegisterScreen searchParams={searchParams} />
    </Suspense>
  );
}

async function RegisterScreen({ searchParams }: Pick<PageProps<"/register">, "searchParams">) {
  const params = await searchParams;
  const requested = Array.isArray(params.descarga) ? params.descarga[0] : params.descarga;
  const withDiagnostic = requested === diagnosticDownloadParam;
  const sector = typeof params.sector === "string" ? params.sector : undefined;
  const invitacion = typeof params.invitacion === "string" ? params.invitacion : undefined;
  const cuenta = typeof params.cuenta === "string" ? params.cuenta : undefined;
  const organismo = cuenta === "organismo";
  const error = registerError(typeof params.error === "string" ? params.error : undefined);

  return (
    <AuthShell
      kicker="Levantamiento de necesidades tecnológicas"
      title={
        withDiagnostic
          ? "Regístrate y descarga el diagnóstico"
          : organismo
            ? "Crea la cuenta de tu organismo"
            : "Reserva tu lugar"
      }
      lead={
        withDiagnostic
          ? "Reservas tu lugar en la sesión y, al terminar, se descarga el análisis integral de VIA Partners."
          : "La sesión de tu sector. Sin costo. Cupo de 15 a 30 empresas."
      }
      links={loginLink}
    >
      {withDiagnostic ? (
        <Suspense>
          <RegisterForm variant="page" />
        </Suspense>
      ) : (
        <AccountForm sector={sector} cuenta={cuenta} invitacion={invitacion} error={error} />
      )}
    </AuthShell>
  );
}
```

Reemplaza `src/app/recuperar/page.tsx` por esto:

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { RecoverForm } from "@/components/auth/recover-form";
import { redirectIfSession } from "@/lib/auth/redirect-if-session";
import { pageMetadata } from "@/lib/metadata";

export const instant = false;

export const metadata: Metadata = pageMetadata({
  title: "Recuperar contraseña",
  description: "Pide un enlace para elegir una contraseña nueva.",
  path: "/recuperar",
});

export default async function RecoverPage() {
  await redirectIfSession("/recuperar");
  return (
    <AuthShell
      title="Recuperar contraseña"
      footer={
        <>
          <Link href="/login" className="text-link">
            Volver a entrar
          </Link>
          <Link href="/restablecer" className="text-link">
            Ver la pantalla de nueva contraseña
          </Link>
        </>
      }
    >
      <RecoverForm />
    </AuthShell>
  );
}
```

Reemplaza `src/app/restablecer/page.tsx` por esto:

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetForm } from "@/components/auth/reset-form";
import { redirectIfSession } from "@/lib/auth/redirect-if-session";
import { pageMetadata } from "@/lib/metadata";

export const instant = false;

export const metadata: Metadata = pageMetadata({
  title: "Nueva contraseña",
  description: "Elige una contraseña nueva para tu cuenta.",
  path: "/restablecer",
});

export default async function ResetPage() {
  await redirectIfSession("/restablecer");
  return (
    <AuthShell
      title="Nueva contraseña"
      footer={
        <Link href="/login" className="text-link">
          Entrar
        </Link>
      }
    >
      <ResetForm />
    </AuthShell>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/auth/login-gate.test.ts src/lib/auth/recover-gate.test.ts src/lib/auth/session-redirect.test.ts`

Expected: PASS.

Run: `wc -l src/app/page.tsx src/app/login/page.tsx src/app/verificar/page.tsx src/app/register/page.tsx src/app/recuperar/page.tsx src/app/restablecer/page.tsx src/lib/auth/login-gate.test.ts src/lib/auth/recover-gate.test.ts`

Expected: 18, 65, 53, 80, 35, 30, y los dos tests por debajo de 90.

- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx src/app/login/page.tsx src/app/verificar/page.tsx src/app/register/page.tsx src/app/recuperar/page.tsx src/app/restablecer/page.tsx src/lib/auth/login-gate.test.ts src/lib/auth/recover-gate.test.ts
git commit -m "$(cat <<'EOF'
feat: leave public auth screens when a session already exists

EOF
)"
```

### Task 5: Admin login y admin signup

**Files:**
- Create: `src/lib/auth/admin-pages.test.ts`
- Modify: `src/app/admin/login/page.tsx`
- Modify: `src/app/admin/signup/page.tsx`
- Test: `src/lib/auth/admin-pages.test.ts`

`/admin/login` ya hace lo correcto con `pathAfterSignIn`. Cámbialo solo para que la decisión viva en `adminLoginRedirect`. No agregues otra rama para el empresario.

`/admin/signup` hoy, si ya hay superadmin, manda siempre a `/admin/login` y no mira la sesión. Abierto: no eches al visitante. Cerrado y con sesión: `pathAfterSignIn`, no `/admin/login`. Cerrado y sin sesión: `/admin/login`.

`open` se calcula como ya está. Si está abierto, no llames a `readSessionAccount`. Las dos páginas ya tienen `export const instant = false`. Quedan en 85 líneas: no les agregues nada más.

- [ ] **Step 1: Write the failing test**

`src/lib/auth/admin-pages.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("puertas de admin", () => {
  it("login usa adminLoginRedirect y no calcula el destino en la página", () => {
    const source = readFileSync("src/app/admin/login/page.tsx", "utf8");
    expect(source).toContain("adminLoginRedirect");
    expect(source).toContain("open ? null : await readSessionAccount()");
    expect(source).toContain("if (next) redirect(next)");
    expect(source).not.toContain("pathAfterSignIn");
    expect(source).not.toContain("homeForRole");
    expect(source).not.toContain("redirectIfSession");
    expect(source).not.toContain('redirect("/admin/signup")');
  });

  it("signup usa adminSignupRedirect y no manda siempre a login", () => {
    const source = readFileSync("src/app/admin/signup/page.tsx", "utf8");
    expect(source).toContain("adminSignupRedirect");
    expect(source).toContain("open ? null : await readSessionAccount()");
    expect(source).toContain("if (next) redirect(next)");
    expect(source).not.toContain("redirectIfSession");
    expect(source).not.toContain('redirect("/admin/login")');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/auth/admin-pages.test.ts`

Expected: FAIL. `src/app/admin/login/page.tsx` no contiene `adminLoginRedirect`.

- [ ] **Step 3: Write minimal implementation**

Reemplaza `src/app/admin/login/page.tsx` por esto:

```tsx
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthSplit } from "@/components/auth/auth-split";
import { FormAlert } from "@/components/auth/form-alert";
import { PasswordInput } from "@/components/auth/password-input";
import { controlClass, Field } from "@/components/landing/molecules/field";
import { loginSuperadminAction } from "@/lib/admin-actions";
import { adminLoginRedirect } from "@/lib/auth/session-redirect";
import { readSessionAccount } from "@/lib/auth/session-account";
import { getDirectory } from "@/lib/memory-directory";
import { pageMetadata } from "@/lib/metadata";
import { superadminExists, usesSupabaseAuth } from "@/lib/supabase/auth-session";

export const instant = false;

export const metadata: Metadata = pageMetadata({
  title: "Entrar al panel",
  description: "Entra con la cuenta de superadmin del Observatorio.",
  path: "/admin/login",
});

const messages: Record<string, string> = {
  correo: "Escribe un correo válido.",
  contrasena: "Usa al menos 8 caracteres.",
  credenciales: "Correo o contraseña incorrectos.",
  rol: "Esta entrada es solo del superadmin.",
  confirmar: "Confirma el correo antes de entrar.",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const open = usesSupabaseAuth()
    ? !(await superadminExists())
    : (await getDirectory().superadminCount()) === 0;
  const account = open ? null : await readSessionAccount();
  const next = adminLoginRedirect({
    open,
    account: account ? { role: account.role, onboarded: account.onboarded } : null,
  });
  if (next) redirect(next);

  const params = await searchParams;
  const error = params.error ? messages[params.error] : undefined;

  return (
    <AuthSplit
      title="Entra al panel."
      lead="Esta puerta es del superadmin. El alta pública no puede elegir este rol."
    >
      <h1 className="text-h2 text-ink">Entrar</h1>
      <form action={loginSuperadminAction} noValidate className="mt-8 grid gap-5" data-testid="login-superadmin">
        <Field id="correo" label="Correo">
          <input
            id="correo"
            name="correo"
            type="email"
            autoComplete="email"
            className={controlClass}
            aria-invalid={params.error === "correo"}
            aria-describedby={error ? "admin-login-error" : undefined}
          />
        </Field>
        <Field id="contrasena" label="Contraseña">
          <PasswordInput
            id="contrasena"
            name="contrasena"
            label="contraseña"
            autoComplete="current-password"
            ariaInvalid={params.error === "contrasena"}
            ariaDescribedBy={error ? "admin-login-error" : undefined}
          />
        </Field>
        <div id="admin-login-error">
          <FormAlert message={error} />
        </div>
        <button type="submit" className="btn btn-primary">
          Entrar
        </button>
      </form>
    </AuthSplit>
  );
}
```

Reemplaza `src/app/admin/signup/page.tsx` por esto:

```tsx
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthSplit } from "@/components/auth/auth-split";
import { FormAlert } from "@/components/auth/form-alert";
import { PasswordInput } from "@/components/auth/password-input";
import { controlClass, Field } from "@/components/landing/molecules/field";
import { createFirstSuperadminAction } from "@/lib/admin-actions";
import { adminSignupRedirect } from "@/lib/auth/session-redirect";
import { readSessionAccount } from "@/lib/auth/session-account";
import { getDirectory } from "@/lib/memory-directory";
import { pageMetadata } from "@/lib/metadata";
import { superadminExists, usesSupabaseAuth } from "@/lib/supabase/auth-session";

export const instant = false;

export const metadata: Metadata = pageMetadata({
  title: "Crear superadmin",
  description: "Crea el primer superadmin del Observatorio si el sistema todavía está vacío.",
  path: "/admin/signup",
});

const messages: Record<string, string> = {
  correo: "Escribe un correo válido.",
  contrasena: "Usa al menos 8 caracteres.",
  existe: "Ese correo ya está registrado o ya hay un superadmin.",
  confirmar: "No se pudo confirmar el correo. Revisa la bandeja o inténtalo de nuevo.",
  auth: "No se pudo crear la cuenta.",
};

export default async function AdminSignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const open = usesSupabaseAuth()
    ? !(await superadminExists())
    : (await getDirectory().superadminCount()) === 0;
  const account = open ? null : await readSessionAccount();
  const next = adminSignupRedirect({
    open,
    account: account ? { role: account.role, onboarded: account.onboarded } : null,
  });
  if (next) redirect(next);

  const params = await searchParams;
  const error = params.error ? messages[params.error] : undefined;

  return (
    <AuthSplit
      title="El sistema todavía no tiene dueño."
      lead="El primer superadmin se crea una sola vez en Supabase. Después esta puerta se cierra."
    >
      <h1 className="text-h2 text-ink">Crear el primer superadmin</h1>
      <form action={createFirstSuperadminAction} noValidate className="mt-8 grid gap-5" data-testid="alta-superadmin">
        <Field id="correo" label="Correo">
          <input
            id="correo"
            name="correo"
            type="email"
            autoComplete="email"
            className={controlClass}
            aria-invalid={params.error === "correo"}
            aria-describedby={error ? "admin-signup-error" : undefined}
          />
        </Field>
        <Field id="contrasena" label="Contraseña">
          <PasswordInput
            id="contrasena"
            name="contrasena"
            label="contraseña"
            autoComplete="new-password"
            ariaInvalid={params.error === "contrasena"}
            ariaDescribedBy={error ? "admin-signup-error" : undefined}
          />
        </Field>
        <div id="admin-signup-error">
          <FormAlert message={error} />
        </div>
        <button type="submit" className="btn btn-primary">
          Crear superadmin
        </button>
      </form>
    </AuthSplit>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/auth/admin-pages.test.ts src/lib/auth/admin-gate.test.ts src/lib/auth/session-redirect.test.ts src/lib/auth/redirect-if-session.test.ts src/lib/auth/login-gate.test.ts src/lib/auth/recover-gate.test.ts src/lib/auth/home.test.ts`

Expected: PASS.

Run: `wc -l src/app/admin/login/page.tsx src/app/admin/signup/page.tsx src/lib/auth/admin-pages.test.ts src/lib/auth/home.ts`

Expected: 85, 85, menos de 90, y 31. Si una página pasa de 90, saca el formulario a otro archivo en este paso y vuelve a correr el test.

Run: `npx playwright test e2e/admin-login.spec.ts`

Expected: 3 passed. Playwright levanta `npm run dev` con `AUTH_PROVIDER=memory` si el puerto 3000 está libre. Si ya hay un `next dev` ahí, lo reutiliza y el reset de memoria puede no aplicar: detén ese servidor y vuelve a correr el comando. No edites el spec.

- [ ] **Step 5: Confirma que el diff no reescribió el destino**

Run: `git diff --name-only HEAD`

Expected: solo archivos sin commitear de esta tarea. Esta lista no entra en ningún commit del plan:

- `src/lib/auth/home.ts`
- `src/lib/auth/home.test.ts`
- `src/lib/auth/session-account.ts`
- `src/lib/auth/login-action.ts`
- `src/lib/auth/guards.ts`
- `src/lib/auth/onboarding-gate.ts`
- `src/app/layout.tsx`
- `src/app/onboarding/page.tsx`
- `src/app/onboarding/supabase-screen.tsx`
- `src/app/metodologia/page.tsx`
- `src/app/organismo/page.tsx`
- `src/app/[sector]/page.tsx`
- `src/components/auth/paths.ts`
- `.cursor/ruta-codi/`
- `logos_lev.tgz`

- [ ] **Step 6: Commit**

```bash
git add src/app/admin/login/page.tsx src/app/admin/signup/page.tsx src/lib/auth/admin-pages.test.ts
git commit -m "$(cat <<'EOF'
feat: send admin doors through the session gate

EOF
)"
```

---

Plan complete and saved to `docs/superpowers/plans/2026-11-04-sesion-en-inicio.md`. Two execution options:

**1. Subagent-Driven (recommended)** — un subagente fresco por tarea, con revisión entre tareas.

**2. Inline Execution** — ejecutar las tareas en esta sesión, por lotes y con checkpoints.

**Which approach?**

**If Subagent-Driven chosen:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Fresh subagent per task + two-stage review.

**If Inline Execution chosen:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Batch execution with checkpoints for review.
