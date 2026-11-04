# Endurecer producción Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hacer que recuperar la contraseña llame a Supabase, que el permiso de innovación abierta no se vea aceptado sin haberlo aceptado, y cerrar el panel público y las cabeceras que faltan.

**Architecture:** La recuperación pide el correo a Supabase y solo cambia la contraseña si el enlace trae los dos tokens de recuperación. El éxito del permiso depende de una cookie que pone el POST, no del query `listo=1`. En producción `/panel` manda al login. Las cabeceras niegan marcos y no meten una política de scripts, porque Next la rompería.

**Tech Stack:** Next.js 16, Supabase Auth, Vitest, cookies `httpOnly`.

**Fuera de este plan:** no se manda un correo de prueba a una persona real. No se cambia el flujo del pase ni el masivo. La suite `e2e/prod` se corre después de desplegar, no en estas tareas. El enlace de recuperación tiene que estar permitido en el dashboard de Supabase: `https://observatorio.clusterdestartups.org/restablecer`. Sin eso el correo sale y el enlace rebota. Esa lista no se edita desde el repo.

---

### Task 1: Cookies con Secure en producción

**Files:**
- Create: `src/lib/http/cookie-base.ts`
- Create: `src/lib/http/cookie-base.test.ts`
- Modify: `src/lib/auth/login-org.ts`
- Modify: `src/lib/account-actions.ts`
- Modify: `src/lib/organismo/finish-brand.ts`
- Modify: `src/lib/organismo/invite-link-cookie.ts`
- Modify: `src/lib/session.ts`
- Modify: `src/lib/supabase/auth-session.ts`

- [ ] **Step 1: Write the failing test**

`src/lib/http/cookie-base.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { cookieBase } from "./cookie-base";

describe("cookieBase", () => {
  it("marca Secure solo en producción", () => {
    expect(cookieBase("production").secure).toBe(true);
    expect(cookieBase("development").secure).toBe(false);
    expect(cookieBase("production")).toMatchObject({
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
  });

  it("las cookies propias usan la base", () => {
    const files = [
      "src/lib/auth/login-org.ts",
      "src/lib/account-actions.ts",
      "src/lib/organismo/finish-brand.ts",
      "src/lib/organismo/invite-link-cookie.ts",
      "src/lib/session.ts",
      "src/lib/supabase/auth-session.ts",
    ];
    for (const file of files) {
      expect(readFileSync(file, "utf8")).toContain("cookieBase()");
    }
  });
});
```

- [ ] **Step 2: Run the test**

Run: `npx vitest run src/lib/http/cookie-base.test.ts`

Expected: FAIL because `cookie-base.ts` does not exist.

- [ ] **Step 3: Add the helper and use it**

`src/lib/http/cookie-base.ts`:

```ts
export function cookieBase(nodeEnv = process.env.NODE_ENV) {
  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    path: "/",
    secure: nodeEnv === "production",
  };
}
```

Replace each cookie options object with `cookieBase()`, keeping `maxAge` where it already exists.

`src/lib/auth/login-org.ts`:

```ts
jar.set("org-slug", slug, cookieBase());
```

`src/lib/account-actions.ts` and `src/lib/organismo/finish-brand.ts` use the same call.

`src/lib/organismo/invite-link-cookie.ts`:

```ts
jar.set(key(slug), JSON.stringify(link), cookieBase());
```

`src/lib/session.ts`:

```ts
(await cookies()).set(accountCookie, id, cookieBase());
```

`src/lib/supabase/auth-session.ts` deletes the local `base` object and writes:

```ts
jar.set(accessCookie, session.access_token, { ...cookieBase(), maxAge: session.expires_in });
jar.set(refreshCookie, session.refresh_token, { ...cookieBase(), maxAge: 60 * 60 * 24 * 30 });
```

Import `cookieBase` in each file. Keep every file at 90 lines or fewer.

- [ ] **Step 4: Run the test**

Run: `npx vitest run src/lib/http/cookie-base.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/http/cookie-base.ts src/lib/http/cookie-base.test.ts src/lib/auth/login-org.ts src/lib/account-actions.ts src/lib/organismo/finish-brand.ts src/lib/organismo/invite-link-cookie.ts src/lib/session.ts src/lib/supabase/auth-session.ts
git commit -m "$(cat <<'EOF'
fix: mark app cookies secure in production

EOF
)"
```

---

### Task 2: Cabeceras que niegan marcos

**Files:**
- Modify: `next.config.ts`
- Create: `src/lib/http/security-headers.test.ts`

No agregues `script-src`. Next inyecta scripts y una política estricta dejaría la página en blanco. HSTS ya lo pone Vercel.

- [ ] **Step 1: Write the failing test**

`src/lib/http/security-headers.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("cabeceras de seguridad", () => {
  it("niega marcos y no adivina el tipo", () => {
    const config = readFileSync("next.config.ts", "utf8");
    expect(config).toContain("X-Frame-Options");
    expect(config).toContain("DENY");
    expect(config).toContain("frame-ancestors 'none'");
    expect(config).toContain("X-Content-Type-Options");
    expect(config).toContain("nosniff");
    expect(config).toContain("Referrer-Policy");
    expect(config).toContain("strict-origin-when-cross-origin");
    expect(config).not.toContain("script-src");
  });
});
```

- [ ] **Step 2: Run the test**

Run: `npx vitest run src/lib/http/security-headers.test.ts`

Expected: FAIL because `next.config.ts` has none of those strings.

- [ ] **Step 3: Add the headers**

Inside `const nextConfig`, before `cacheComponents`:

```ts
async headers() {
  return [
    {
      source: "/:path*",
      headers: [
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
      ],
    },
  ];
},
```

- [ ] **Step 4: Run the test**

Run: `npx vitest run src/lib/http/security-headers.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add next.config.ts src/lib/http/security-headers.test.ts
git commit -m "$(cat <<'EOF'
fix: deny framing and sniffing on every response

EOF
)"
```

---

### Task 3: El permiso solo se ve aceptado si el POST lo dejó

**Files:**
- Create: `src/lib/innovation/accepted-cookie.ts`
- Modify: `src/app/api/innovacion-abierta/aceptar/route.ts`
- Modify: `src/app/innovacion-abierta/aceptar/page.tsx`
- Modify: `src/lib/innovation/accept-consent.test.ts`

- [ ] **Step 1: Extend the failing test**

Add this case to `src/lib/innovation/accept-consent.test.ts`:

```ts
it("el éxito del permiso sale de la cookie, no del query", () => {
  const page = readFileSync("src/app/innovacion-abierta/aceptar/page.tsx", "utf8");
  const route = readFileSync("src/app/api/innovacion-abierta/aceptar/route.ts", "utf8");
  expect(page).toContain("innovationAcceptedCookie");
  expect(page).toContain("cookies()");
  expect(route).toContain("innovationAcceptedCookie");
  expect(route).toContain("formData()");
  expect(route).toContain("catch");
});
```

- [ ] **Step 2: Run the test**

Run: `npx vitest run src/lib/innovation/accept-consent.test.ts`

Expected: FAIL on the new case.

- [ ] **Step 3: Set the cookie and ignore a bare listo=1**

`src/lib/innovation/accepted-cookie.ts`:

```ts
import { cookieBase } from "@/lib/http/cookie-base";

export const innovationAcceptedCookie = "innovation-accepted";

export function innovationAcceptedOptions() {
  return { ...cookieBase(), maxAge: 60 * 10, path: "/innovacion-abierta" };
}
```

Replace `src/app/api/innovacion-abierta/aceptar/route.ts` with:

```ts
import { cookies } from "next/headers";
import { acceptConsent } from "@/lib/innovation/accept-consent";
import { innovationAcceptedCookie, innovationAcceptedOptions } from "@/lib/innovation/accepted-cookie";
import { redirectTo } from "@/lib/admin/redirect";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  let token = "";
  try {
    const form = await request.formData();
    token = String(form.get("token") ?? "");
  } catch {
    return redirectTo(request, "/innovacion-abierta/aceptar?error=1");
  }
  let result: "aceptado" | "invalido" = "invalido";
  try {
    result = await acceptConsent(token);
  } catch (error) {
    console.error("accept_open_innovation", error);
  }
  if (result !== "aceptado") return redirectTo(request, "/innovacion-abierta/aceptar?error=1");
  (await cookies()).set(innovationAcceptedCookie, "1", innovationAcceptedOptions());
  return redirectTo(request, "/innovacion-abierta/aceptar?listo=1");
}
```

Replace the top of `src/app/innovacion-abierta/aceptar/page.tsx` so the success state requires the cookie. Keep the file at 90 lines or fewer. The page becomes:

```ts
import { cookies } from "next/headers";
import { AcceptForm } from "@/app/innovacion-abierta/aceptar/accept-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { innovationAcceptedCookie } from "@/lib/innovation/accepted-cookie";

export const instant = false;

export default async function AcceptInnovationPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string; listo?: string; error?: string }>;
}) {
  const params = await searchParams;
  const accepted = (await cookies()).get(innovationAcceptedCookie)?.value === "1";
  const done = params.listo === "1" && accepted;
  const failed = params.error === "1" || (params.listo === "1" && !accepted);
  const token = params.t?.trim() ?? "";
  const title = done ? "Ya podemos contactarte" : "Acepta que te contactemos";
  const lead = done
    ? "Quedó registrado. El Observatorio puede escribirte sobre innovación abierta."
    : "Este permiso es solo para contactarte. No publica tu empresa ni abre tu pase.";
  return (
    <AuthShell kicker="Innovación abierta" title={title} lead={lead}>
      {failed || (!done && !token) ? (
        <Alert variant="destructive">
          <AlertDescription>Este enlace no sirve. Ábrelo desde el correo que te enviamos.</AlertDescription>
        </Alert>
      ) : null}
      {!done && !failed && token ? <AcceptForm token={token} /> : null}
    </AuthShell>
  );
}
```

- [ ] **Step 4: Run the test**

Run: `npx vitest run src/lib/innovation/accept-consent.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/innovation/accepted-cookie.ts src/app/api/innovacion-abierta/aceptar/route.ts src/app/innovacion-abierta/aceptar/page.tsx src/lib/innovation/accept-consent.test.ts
git commit -m "$(cat <<'EOF'
fix: show innovation consent success only after the post

EOF
)"
```

---

### Task 4: El panel de memoria no se publica

**Files:**
- Modify: `src/app/panel/page.tsx`
- Create: `src/app/panel/page.test.ts`

Los e2e locales usan `AUTH_PROVIDER=memory`. Esa rama se queda. Con Supabase, la página redirige antes de leer `?rol=`.

- [ ] **Step 1: Write the failing test**

`src/app/panel/page.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("panel público", () => {
  it("en supabase manda al login antes de leer el rol", () => {
    const page = readFileSync("src/app/panel/page.tsx", "utf8");
    const gate = page.indexOf("usesSupabaseAuth()");
    const role = page.indexOf("roleFromQuery");
    expect(gate).toBeGreaterThan(-1);
    expect(page).toContain('redirect("/admin/login")');
    expect(gate).toBeLessThan(role);
  });
});
```

- [ ] **Step 2: Run the test**

Run: `npx vitest run src/app/panel/page.test.ts`

Expected: FAIL

- [ ] **Step 3: Redirect when Supabase auth is on**

At the start of `PanelPage`, before `searchParams` is read:

```ts
import { redirect } from "next/navigation";
import { usesSupabaseAuth } from "@/lib/supabase/auth-session";

export default async function PanelPage({
  searchParams,
}: {
  searchParams: Promise<{ rol?: string }>;
}) {
  if (usesSupabaseAuth()) redirect("/admin/login");
  const params = await searchParams;
  const role = roleFromQuery(params.rol);
  // the memory branch below stays as it is
```

Leave `getDirectory().progress()` on the memory branch. Keep the file at 90 lines or fewer.

- [ ] **Step 4: Run the unit test and the local panel e2e**

Run: `npx vitest run src/app/panel/page.test.ts`

Expected: PASS

Run: `npx playwright test e2e/metodologia.spec.ts e2e/mesa.spec.ts`

Expected: PASS. Those tests hit `/panel` with the memory server. If they fail because the redirect ran, `usesSupabaseAuth()` is true under `AUTH_PROVIDER=memory` and the guard is wrong.

- [ ] **Step 5: Commit**

```bash
git add src/app/panel/page.tsx src/app/panel/page.test.ts
git commit -m "$(cat <<'EOF'
fix: keep the memory progress panel off production

EOF
)"
```

---

### Task 5: Pedir el enlace de recuperación de verdad

**Files:**
- Create: `src/lib/auth/recovery-link.ts`
- Create: `src/lib/auth/recovery-link.test.ts`
- Create: `src/lib/auth/request-password-reset.ts`
- Create: `src/lib/auth/password-actions.ts`
- Modify: `src/components/auth/recover-form.tsx`
- Modify: `src/app/recuperar/page.tsx`

El mensaje de éxito es el mismo si el correo existe o no. Un error de Supabase se escribe en el log y la pantalla sigue diciendo que se enviará el enlace. No se revela si la cuenta está registrada.

- [ ] **Step 1: Write the failing test**

`src/lib/auth/recovery-link.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { recoveryRedirectUrl } from "./recovery-link";

describe("enlace de recuperación", () => {
  it("arma la url absoluta o no arma nada", () => {
    expect(recoveryRedirectUrl("https://observatorio.clusterdestartups.org/")).toBe(
      "https://observatorio.clusterdestartups.org/restablecer",
    );
    expect(recoveryRedirectUrl("")).toBeNull();
    expect(recoveryRedirectUrl("observatorio.clusterdestartups.org")).toBeNull();
  });

  it("el formulario pide el correo a supabase", () => {
    const action = readFileSync("src/lib/auth/request-password-reset.ts", "utf8");
    const form = readFileSync("src/components/auth/recover-form.tsx", "utf8");
    const page = readFileSync("src/app/recuperar/page.tsx", "utf8");
    expect(action).toContain("resetPasswordForEmail");
    expect(form).toContain("requestPasswordResetAction");
    expect(form).not.toContain("setSent(true)");
    expect(page).not.toContain('href="/restablecer"');
  });
});
```

- [ ] **Step 2: Run the test**

Run: `npx vitest run src/lib/auth/recovery-link.test.ts`

Expected: FAIL

- [ ] **Step 3: Send the reset through Supabase**

`src/lib/auth/recovery-link.ts`:

```ts
export function recoveryRedirectUrl(siteUrl: string | undefined) {
  const site = siteUrl?.trim().replace(/\/$/, "") ?? "";
  if (!/^https?:\/\//.test(site)) return null;
  return `${site}/restablecer`;
}
```

`src/lib/auth/request-password-reset.ts`:

```ts
import "server-only";

import { createSupabaseAnon, usesSupabaseAuth } from "@/lib/supabase/auth-session";
import { recoveryRedirectUrl } from "./recovery-link";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function requestPasswordReset(email: string) {
  const normalized = email.trim().toLowerCase();
  if (!emailPattern.test(normalized)) return "correo" as const;
  if (!usesSupabaseAuth()) return "ok" as const;
  const redirectTo = recoveryRedirectUrl(process.env.NEXT_PUBLIC_SITE_URL);
  if (!redirectTo) {
    console.error("resetPasswordForEmail sin NEXT_PUBLIC_SITE_URL");
    return "ok" as const;
  }
  const sent = await createSupabaseAnon().auth.resetPasswordForEmail(normalized, { redirectTo });
  if (sent.error) console.error("resetPasswordForEmail", sent.error.message);
  return "ok" as const;
}
```

`src/lib/auth/password-actions.ts`:

```ts
"use server";

import { requestPasswordReset } from "./request-password-reset";

export type RecoverState = { sent: boolean; error: string };

export async function requestPasswordResetAction(_prev: RecoverState, formData: FormData): Promise<RecoverState> {
  const result = await requestPasswordReset(String(formData.get("correo") ?? ""));
  if (result === "correo") return { sent: false, error: "Escribe un correo válido." };
  return { sent: true, error: "" };
}
```

Replace `src/components/auth/recover-form.tsx`:

```tsx
"use client";

import { useActionState } from "react";
import { controlClass, Field } from "@/components/landing/molecules/field";
import { requestPasswordResetAction, type RecoverState } from "@/lib/auth/password-actions";

const empty: RecoverState = { sent: false, error: "" };

export function RecoverForm() {
  const [state, action, pending] = useActionState(requestPasswordResetAction, empty);
  if (state.sent) {
    return (
      <p className="text-body text-ink-secondary">
        Si ese correo está registrado, enviaremos un enlace para restablecer la contraseña.
      </p>
    );
  }
  return (
    <form action={action} noValidate className="grid gap-5">
      <Field id="correo" label="Correo" error={state.error}>
        <input id="correo" name="correo" type="email" autoComplete="email" className={controlClass} />
      </Field>
      <button type="submit" className="btn btn-primary" disabled={pending}>
        Enviar enlace
      </button>
    </form>
  );
}
```

In `src/app/recuperar/page.tsx`, leave only the link back to login:

```tsx
footer={
  <Link href="/login" className="text-link">
    Volver a entrar
  </Link>
}
```

- [ ] **Step 4: Run the test**

Run: `npx vitest run src/lib/auth/recovery-link.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/auth/recovery-link.ts src/lib/auth/recovery-link.test.ts src/lib/auth/request-password-reset.ts src/lib/auth/password-actions.ts src/components/auth/recover-form.tsx src/app/recuperar/page.tsx
git commit -m "$(cat <<'EOF'
fix: ask Supabase for the password recovery email

EOF
)"
```

---

### Task 6: Cambiar la contraseña solo con el enlace

**Files:**
- Create: `src/lib/auth/recovery-tokens.ts`
- Create: `src/lib/auth/update-recovered-password.ts`
- Modify: `src/lib/auth/password-actions.ts`
- Modify: `src/lib/auth/recovery-link.test.ts`
- Modify: `src/components/auth/reset-form.tsx`

El hash del enlace no llega al servidor. El formulario lo lee en el navegador y se lo entrega a la acción. La acción no lo imprime. Sin `type=recovery` y los dos tokens, la pantalla dice que el enlace no sirve y no dice que la contraseña cambió.

- [ ] **Step 1: Write the failing test**

Replace `src/lib/auth/recovery-link.test.ts` with this whole file:

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { recoveryRedirectUrl } from "./recovery-link";
import { recoveryTokens } from "./recovery-tokens";
import { updateRecoveredPassword } from "./update-recovered-password";

describe("enlace de recuperación", () => {
  it("arma la url absoluta o no arma nada", () => {
    expect(recoveryRedirectUrl("https://observatorio.clusterdestartups.org/")).toBe(
      "https://observatorio.clusterdestartups.org/restablecer",
    );
    expect(recoveryRedirectUrl("")).toBeNull();
    expect(recoveryRedirectUrl("observatorio.clusterdestartups.org")).toBeNull();
  });

  it("el formulario pide el correo a supabase", () => {
    const action = readFileSync("src/lib/auth/request-password-reset.ts", "utf8");
    const form = readFileSync("src/components/auth/recover-form.tsx", "utf8");
    const page = readFileSync("src/app/recuperar/page.tsx", "utf8");
    expect(action).toContain("resetPasswordForEmail");
    expect(form).toContain("requestPasswordResetAction");
    expect(form).not.toContain("setSent(true)");
    expect(page).not.toContain('href="/restablecer"');
  });

  it("lee los tokens solo de un enlace de recuperación", () => {
    expect(recoveryTokens("#access_token=a&refresh_token=b&type=recovery")).toEqual({
      accessToken: "a",
      refreshToken: "b",
    });
    expect(recoveryTokens("#access_token=a&refresh_token=b&type=signup")).toBeNull();
    expect(recoveryTokens("")).toBeNull();
  });

  it("cambia la contraseña solo si la sesión de recuperación sirve", async () => {
    const tokens = { accessToken: "a", refreshToken: "b" };
    const client = {
      setSession: async () => ({ error: null }),
      updateUser: async () => ({ error: null }),
    };
    await expect(updateRecoveredPassword(client, "corta", tokens)).resolves.toBe("contrasena");
    await expect(updateRecoveredPassword(client, "clave-larga", tokens)).resolves.toBe("ok");
    const broken = { ...client, setSession: async () => ({ error: { message: "no" } }) };
    await expect(updateRecoveredPassword(broken, "clave-larga", tokens)).resolves.toBe("enlace");
  });
});
```

- [ ] **Step 2: Run the test**

Run: `npx vitest run src/lib/auth/recovery-link.test.ts`

Expected: FAIL

- [ ] **Step 3: Update the password from the recovery session**

`src/lib/auth/recovery-tokens.ts`:

```ts
export function recoveryTokens(hash: string) {
  const params = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
  if (params.get("type") !== "recovery") return null;
  const accessToken = params.get("access_token") ?? "";
  const refreshToken = params.get("refresh_token") ?? "";
  if (!accessToken || !refreshToken) return null;
  return { accessToken, refreshToken };
}
```

`src/lib/auth/update-recovered-password.ts`:

```ts
export type RecoveryClient = {
  setSession(tokens: { access_token: string; refresh_token: string }): Promise<{ error: { message: string } | null }>;
  updateUser(input: { password: string }): Promise<{ error: { message: string } | null }>;
};

export async function updateRecoveredPassword(
  client: RecoveryClient,
  password: string,
  tokens: { accessToken: string; refreshToken: string },
) {
  if (password.trim().length < 8) return "contrasena" as const;
  const session = await client.setSession({
    access_token: tokens.accessToken,
    refresh_token: tokens.refreshToken,
  });
  if (session.error) return "enlace" as const;
  const updated = await client.updateUser({ password });
  if (updated.error) return "enlace" as const;
  return "ok" as const;
}
```

Add to `src/lib/auth/password-actions.ts` a second action. Build the client with `createClient` from `@supabase/supabase-js`, the public URL and the anon key, `persistSession: false`. Do not log the tokens.

```ts
export type ResetState = { done: boolean; error: string };

export async function updateRecoveredPasswordAction(_prev: ResetState, formData: FormData): Promise<ResetState> {
  const password = String(formData.get("contrasena") ?? "");
  const confirm = String(formData.get("confirmar") ?? "");
  if (password.trim().length < 8) return { done: false, error: "La contraseña necesita al menos 8 caracteres." };
  if (password !== confirm) return { done: false, error: "Las contraseñas no coinciden." };
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return { done: false, error: "Este enlace no sirve. Pide uno nuevo desde recuperar." };
  const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const result = await updateRecoveredPassword(client.auth, password, {
    accessToken: String(formData.get("accessToken") ?? ""),
    refreshToken: String(formData.get("refreshToken") ?? ""),
  });
  if (result !== "ok") return { done: false, error: "Este enlace no sirve. Pide uno nuevo desde recuperar." };
  return { done: true, error: "" };
}
```

`client.auth` matches `RecoveryClient` because `setSession` and `updateUser` exist on the auth client. If the types do not line up, wrap those two calls in an object that returns `{ error }` and pass that object. Do not change the return values of `updateRecoveredPassword`.

Replace `src/components/auth/reset-form.tsx`. It stays at 90 lines or fewer. Split a view file if the form grows past that.

```tsx
"use client";

import { useEffect, useState } from "react";
import { useActionState } from "react";
import { PasswordInput } from "@/components/auth/password-input";
import { Field } from "@/components/landing/molecules/field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { updateRecoveredPasswordAction, type ResetState } from "@/lib/auth/password-actions";
import { recoveryTokens } from "@/lib/auth/recovery-tokens";

const empty: ResetState = { done: false, error: "" };

export function ResetForm() {
  const [tokens, setTokens] = useState<ReturnType<typeof recoveryTokens> | undefined>(undefined);
  const [state, action, pending] = useActionState(updateRecoveredPasswordAction, empty);

  useEffect(() => {
    setTokens(recoveryTokens(window.location.hash));
    if (state.done) window.history.replaceState(null, "", "/restablecer");
  }, [state.done]);

  if (tokens === undefined) return null;
  if (!tokens) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Este enlace no sirve. Pide uno nuevo desde recuperar.</AlertDescription>
      </Alert>
    );
  }
  if (state.done) return <p className="text-body text-ink">Contraseña actualizada.</p>;

  return (
    <form action={action} noValidate className="grid gap-5">
      <input type="hidden" name="accessToken" value={tokens.accessToken} />
      <input type="hidden" name="refreshToken" value={tokens.refreshToken} />
      {state.error ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}
      <Field id="contrasena" label="Nueva contraseña">
        <PasswordInput id="contrasena" name="contrasena" label="nueva contraseña" autoComplete="new-password" />
      </Field>
      <Field id="confirmar" label="Confirmar contraseña">
        <PasswordInput id="confirmar" name="confirmar" label="confirmación" autoComplete="new-password" />
      </Field>
      <button type="submit" className="btn btn-primary" disabled={pending}>
        Guardar contraseña
      </button>
    </form>
  );
}
```

Count the lines. If the file passes 90, move the success and missing-link branches into `src/components/auth/reset-status.tsx`.

- [ ] **Step 4: Run the test**

Run: `npx vitest run src/lib/auth/recovery-link.test.ts src/lib/auth/recovery-tokens.test.ts`

Expected: PASS. The second path may not exist if the cases stayed in one file. Run the file that exists.

- [ ] **Step 5: Commit**

```bash
git add src/lib/auth/recovery-tokens.ts src/lib/auth/update-recovered-password.ts src/lib/auth/password-actions.ts src/lib/auth/recovery-link.test.ts src/lib/auth/recovery-tokens.test.ts src/components/auth/reset-form.tsx src/components/auth/reset-status.tsx
git commit -m "$(cat <<'EOF'
fix: change the password only from a recovery link

EOF
)"
```

If the split files were not created, leave them out of `git add`.

---

### Task 7: Verificar sin tocar producción

- [ ] **Step 1: Run the unit tests that this plan added**

Run:

```bash
npx vitest run src/lib/http/cookie-base.test.ts src/lib/http/security-headers.test.ts src/lib/innovation/accept-consent.test.ts src/app/panel/page.test.ts src/lib/auth/recovery-link.test.ts
```

Expected: all PASS

- [ ] **Step 2: Run the local flows that still use /panel**

Run: `npx playwright test e2e/metodologia.spec.ts e2e/mesa.spec.ts`

Expected: PASS against the memory server. Do not point this command at `playwright.prod.config.ts`.

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`

Expected: exit 0

No commit in this task unless a test fix was required. Do not push.
