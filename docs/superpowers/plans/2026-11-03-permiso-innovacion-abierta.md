# Permiso de innovación abierta

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** El correo de innovación abierta trae un enlace propio de cada persona para aceptar que la contacten, y el superadmin ve quién aceptó.

**Architecture:** Al pintar ese correo se crea, una sola vez, un token opaco de 32 bytes y se guarda en `innovation_consents`. El enlace quemado es `{NEXT_PUBLIC_SITE_URL}/innovacion-abierta/aceptar?t={token}`. Abrir el enlace no acepta: el cliente de correo y los escáneres solo hacen GET. La persona oprime «Sí, pueden contactarme» y un POST llama al RPC `accept_open_innovation`, que pone `accepted_at`. Anon no puede leer la tabla. La pantalla `/admin/innovacion` exige superadmin y lista solo filas con `accepted_at`.

**Tech Stack:** Next.js 16 App Router, React Email, Supabase RLS y un RPC `security definer`, Vitest.

**Branch:** `correos-con-diseno`. No hagas push. No apliques la migración a Supabase remoto. No toques los cinco archivos de look-and-feel que siguen sucios, ni `.cursor/ruta-codi/`, ni `logos_lev.tgz`.

## Fuera de este plan

- El archivo `.ics` del pase. El correo de confirmación puede llevarlo después; no entra aquí.
- Bienvenida, pase, recordatorio, gracias y contraseña.
- Un enlace único para todo el auditorio. No identifica a la persona.
- Aceptar con la sesión iniciada. El permiso se da desde el correo.
- Borrar o revocar el permiso desde el panel.

## Archivos

- Crear: `supabase/migrations/20261103235000_innovation_consent.sql`
- Crear: `src/lib/mail/consent-link.ts`, `src/lib/mail/consent-link.test.ts`
- Crear: `src/lib/mail/paint-pending.ts`
- Crear: `src/lib/innovation/accept-consent.ts`, `src/lib/innovation/accept-consent.test.ts`
- Crear: `src/app/innovacion-abierta/aceptar/page.tsx`, `src/app/innovacion-abierta/aceptar/accept-form.tsx`
- Crear: `src/app/api/innovacion-abierta/aceptar/route.ts`
- Crear: `src/lib/admin/innovacion/list.ts`, `src/lib/admin/innovacion/list.test.ts`
- Crear: `src/app/admin/innovacion/page.tsx`, `src/app/admin/innovacion/innovacion-list.tsx`
- Modificar: `src/lib/mail/open-innovation-mail.tsx`, `src/lib/mail/message-mails.test.tsx`
- Modificar: `src/lib/mail/paint-mail.tsx`, `src/lib/mail/paint-mail.test.ts`
- Modificar: `src/lib/mail/send-own.ts`, `src/lib/mail/deliver.ts`, `src/lib/mail/deliver.test.ts`
- Modificar: `src/components/admin/nav.ts`, `src/components/admin/nav-match.test.ts`

Cada archivo de código nuevo o editado se queda en 90 líneas o menos.

---

### Task 1: Tabla del permiso

**Files:**
- Create: `supabase/migrations/20261103235000_innovation_consent.sql`
- Test: `src/lib/innovation/accept-consent.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("permiso de innovación abierta", () => {
  it("solo el superadmin lee la tabla y el anon solo puede aceptar", () => {
    const sql = readFileSync("supabase/migrations/20261103235000_innovation_consent.sql", "utf8");
    expect(sql).toContain("create table public.innovation_consents");
    expect(sql).toContain("token text not null unique");
    expect(sql).toContain("accepted_at timestamptz");
    expect(sql).toContain("private.is_superadmin()");
    expect(sql).toContain("grant execute on function public.accept_open_innovation(text) to anon, authenticated");
    expect(sql).toContain("revoke all on table public.innovation_consents from anon");
    expect(sql).not.toContain("grant select on table public.innovation_consents to anon");
    expect(sql).toContain("return 'invalido'");
    expect(sql).toContain("return 'aceptado'");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/innovation/accept-consent.test.ts`

Expected: FAIL because the migration file does not exist.

- [ ] **Step 3: Write the migration**

```sql
create table public.innovation_consents (
  profile_id uuid primary key references public.profiles (id) on delete cascade,
  token text not null unique,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  constraint innovation_consents_token_shape check (
    char_length(token) between 43 and 80
    and token ~ '^[A-Za-z0-9_-]+$'
  )
);

comment on table public.innovation_consents is
  'Permiso para contactar a la empresa por innovación abierta. El token va en el correo. accepted_at queda vacío hasta que la persona oprime el botón. El listado del superadmin no lee el token.';

alter table public.innovation_consents enable row level security;

create policy innovation_consents_superadmin_select
  on public.innovation_consents
  for select
  to authenticated
  using ((select private.is_superadmin()));

create policy innovation_consents_superadmin_insert
  on public.innovation_consents
  for insert
  to authenticated
  with check ((select private.is_superadmin()));

revoke all on table public.innovation_consents from anon;
grant select, insert on table public.innovation_consents to authenticated;

create or replace function public.accept_open_innovation(raw_token text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  found uuid;
begin
  if raw_token is null
    or char_length(raw_token) < 43
    or char_length(raw_token) > 80
    or raw_token !~ '^[A-Za-z0-9_-]+$' then
    return 'invalido';
  end if;
  select profile_id into found
  from public.innovation_consents
  where token = raw_token;
  if found is null then
    return 'invalido';
  end if;
  update public.innovation_consents
  set accepted_at = coalesce(accepted_at, now())
  where profile_id = found;
  return 'aceptado';
end;
$$;

revoke all on function public.accept_open_innovation(text) from public;
grant execute on function public.accept_open_innovation(text) to anon, authenticated;
```

No hay policy de update ni de delete. El RPC es `security definer` y escribe `accepted_at`. Un segundo clic no mueve la fecha, porque `coalesce` conserva la primera.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/innovation/accept-consent.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20261103235000_innovation_consent.sql src/lib/innovation/accept-consent.test.ts
git commit -m "$(cat <<'EOF'
feat: store an open-innovation contact consent

EOF
)"
```

---

### Task 2: Enlace de una sola persona

**Files:**
- Create: `src/lib/mail/consent-link.ts`
- Test: `src/lib/mail/consent-link.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { ensureConsentToken, newConsentToken } from "./consent-link";

const profileId = "360ab36d-9882-44c6-9b61-1010b9aab795";

function fakeDb(state: { token: string | null }) {
  return {
    from(table: string) {
      if (table !== "innovation_consents") throw new Error(table);
      return {
        select() {
          return {
            eq() {
              return {
                maybeSingle: async () => ({
                  data: state.token ? { token: state.token } : null,
                  error: null,
                }),
              };
            },
          };
        },
        insert(row: { profile_id: string; token: string }) {
          if (row.profile_id !== profileId) return Promise.resolve({ error: { message: "perfil" } });
          state.token = row.token;
          return Promise.resolve({ error: null });
        },
      };
    },
  };
}

describe("enlace de innovación abierta", () => {
  it("crea un token opaco y lo reutiliza", async () => {
    const state: { token: string | null } = { token: null };
    const db = fakeDb(state);
    const first = await ensureConsentToken(db, profileId, "https://observatorio.example/");
    const second = await ensureConsentToken(db, profileId, "https://observatorio.example");
    expect(first).toBe(second);
    expect(first).toContain("https://observatorio.example/innovacion-abierta/aceptar?t=");
    expect(state.token).toMatch(/^[A-Za-z0-9_-]{43,80}$/);
    expect(first).toContain(encodeURIComponent(state.token ?? ""));
    expect(newConsentToken()).not.toBe(newConsentToken());
  });

  it("sin sitio no guarda token", async () => {
    const state: { token: string | null } = { token: null };
    const href = await ensureConsentToken(fakeDb(state), profileId, "  ");
    expect(href).toBeNull();
    expect(state.token).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/mail/consent-link.test.ts`

Expected: FAIL with "ensureConsentToken is not exported" or the module is missing.

- [ ] **Step 3: Write the minimal implementation**

```ts
import { randomBytes } from "node:crypto";

type ConsentDb = {
  from(table: "innovation_consents"): {
    select(columns: "token"): {
      eq(column: "profile_id", value: string): {
        maybeSingle(): Promise<{ data: { token: string } | null; error: { message: string } | null }>;
      };
    };
    insert(row: { profile_id: string; token: string }): Promise<{ error: { message: string } | null }>;
  };
};

export function newConsentToken() {
  return randomBytes(32).toString("base64url");
}

export async function ensureConsentToken(db: ConsentDb, profileId: string, siteUrl: string | undefined) {
  const base = siteUrl?.trim().replace(/\/$/, "") ?? "";
  const id = profileId.trim();
  if (!base || !id) return null;
  const found = await db.from("innovation_consents").select("token").eq("profile_id", id).maybeSingle();
  if (found.error) return null;
  const token = found.data?.token ?? newConsentToken();
  if (!found.data) {
    const inserted = await db.from("innovation_consents").insert({ profile_id: id, token });
    if (inserted.error) return null;
  }
  return `${base}/innovacion-abierta/aceptar?t=${encodeURIComponent(token)}`;
}
```

El cliente real de Supabase cumple esa cadena (`from` → `select` → `eq` → `maybeSingle`, y `from` → `insert`). La segunda llamada lee el mismo token: el enlace del primer correo sigue vivo.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/mail/consent-link.test.ts`

Expected: PASS, 2 tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/mail/consent-link.ts src/lib/mail/consent-link.test.ts
git commit -m "$(cat <<'EOF'
feat: mint one open-innovation link per person

EOF
)"
```

---

### Task 3: Botón en el correo

**Files:**
- Modify: `src/lib/mail/open-innovation-mail.tsx`
- Modify: `src/lib/mail/message-mails.test.tsx`
- Modify: `src/lib/mail/paint-mail.tsx`
- Modify: `src/lib/mail/paint-mail.test.ts`
- Modify: `src/lib/mail/send-own.ts`
- Modify: `src/lib/mail/deliver.ts`

- [ ] **Step 1: Write the failing test**

En `src/lib/mail/message-mails.test.tsx`, sustituye el caso de innovación abierta por este:

```tsx
  it("innovación abierta trae el permiso y no el QR", async () => {
    const href = "https://observatorio.example/innovacion-abierta/aceptar?t=abc";
    const html = await render(<OpenInnovationMail acceptHref={href} />);
    expect(html).toContain("innovación abierta");
    expect(html).toContain("Sí, pueden contactarme");
    expect(html).toContain(href);
    expect(html).not.toContain("Responde a este correo");
    expect(html).not.toContain("cid:pase");
  });
```

En `src/lib/mail/paint-mail.test.ts`, agrega estos dos casos y suma `acceptHref: null` en cada `paintMail` que ya existe:

```ts
  it("innovación abierta exige el enlace", async () => {
    await expect(
      paintMail({
        kind: "open_innovation",
        profileId: profileId,
        sessionLabel: null,
        continueHref: null,
        acceptHref: null,
      }),
    ).rejects.toThrow("sin permiso");
  });

  it("innovación abierta pinta el enlace y no adjunta pase", async () => {
    const href = "https://observatorio.example/innovacion-abierta/aceptar?t=abc";
    const painted = await paintMail({
      kind: "open_innovation",
      profileId: profileId,
      sessionLabel: null,
      continueHref: null,
      acceptHref: href,
    });
    expect(painted.html).toContain(href);
    expect(painted.attachments).toEqual([]);
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/mail/message-mails.test.tsx src/lib/mail/paint-mail.test.ts`

Expected: FAIL. El cuerpo todavía dice «Responde a este correo» y `paintMail` no recibe `acceptHref`.

- [ ] **Step 3: Write the minimal implementation**

`src/lib/mail/open-innovation-mail.tsx` completo:

```tsx
import { Button, Text } from "@react-email/components";
import { mailBrand } from "./brand";
import { MailShell } from "./shell";

export function OpenInnovationMail({ acceptHref }: { acceptHref: string }) {
  return (
    <MailShell preview="Una pregunta del Observatorio." title="¿Quieres ser una empresa de innovación abierta?">
      <Text style={{ margin: "0 0 16px", color: mailBrand.navy, fontSize: 16, lineHeight: "1.5" }}>
        Si aceptas, el Observatorio puede escribirte para contarte cómo sumarte. Este permiso no publica tu empresa.
      </Text>
      <Button
        href={acceptHref}
        style={{
          display: "inline-block",
          backgroundColor: mailBrand.pink,
          color: mailBrand.white,
          padding: "12px 20px",
          borderRadius: 999,
          fontWeight: 700,
        }}
      >
        Sí, pueden contactarme
      </Button>
    </MailShell>
  );
}
```

En `paintMail`, el argumento gana `acceptHref: string | null`. La rama de innovación abierta queda así. El resto de las ramas no usa ese argumento.

```tsx
  if (input.kind === "open_innovation") {
    const href = input.acceptHref?.trim() ?? "";
    if (!href) throw new Error("sin permiso");
    return { html: await render(<OpenInnovationMail acceptHref={href} />), attachments: [] };
  }
```

En `src/lib/mail/send-own.ts` y en `paintRow` de `src/lib/mail/deliver.ts`, cada llamada a `paintMail` recibe `acceptHref: null`. Bienvenida, pase, recordatorio y gracias siguen igual.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/mail/message-mails.test.tsx src/lib/mail/paint-mail.test.ts src/lib/mail/send-own.test.ts src/lib/mail/deliver.test.ts`

Expected: PASS. `npx tsc --noEmit` también sale limpio.

- [ ] **Step 5: Commit**

```bash
git add src/lib/mail/open-innovation-mail.tsx src/lib/mail/message-mails.test.tsx src/lib/mail/paint-mail.tsx src/lib/mail/paint-mail.test.ts src/lib/mail/send-own.ts src/lib/mail/deliver.ts
git commit -m "$(cat <<'EOF'
feat: put the contact consent button on the innovation mail

EOF
)"
```

---

### Task 4: El masivo arma el enlace

**Files:**
- Create: `src/lib/mail/paint-pending.ts`
- Modify: `src/lib/mail/deliver.ts`
- Modify: `src/lib/mail/deliver.test.ts`

`deliver.ts` ya está en 86 líneas. No le sumes el alta del token ahí. Sácalo a `paint-pending.ts`.

- [ ] **Step 1: Write the failing test**

Sustituye el cuerpo de `src/lib/mail/deliver.test.ts` por:

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("envío masivo", () => {
  it("pinta cada fila, adjunta el pase y arma el permiso", () => {
    const deliver = readFileSync("src/lib/mail/deliver.ts", "utf8");
    const pending = readFileSync("src/lib/mail/paint-pending.ts", "utf8");
    const queue = readFileSync("src/lib/mail/broadcast-queue.ts", "utf8");
    const send = readFileSync("src/lib/mail/send-broadcast.ts", "utf8");
    expect(deliver).toContain("paintPending");
    expect(deliver).toContain("resendPayload");
    expect(deliver).toContain("idempotencyKey: row.id");
    expect(deliver).not.toContain("renderBroadcast");
    expect(pending).toContain("paintMail");
    expect(pending).toContain("ensureConsentToken");
    expect(pending).toContain('row.kind === "open_innovation"');
    expect(queue).toContain("profile_id");
    expect(send).toContain("sessionLabel");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/mail/deliver.test.ts`

Expected: FAIL because `paint-pending.ts` does not exist and `deliver.ts` todavía llama `paintMail` directo.

- [ ] **Step 3: Write the minimal implementation**

`src/lib/mail/paint-pending.ts`:

```ts
import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { BroadcastKind } from "./broadcast-audience";
import { ensureConsentToken } from "./consent-link";
import { paintMail } from "./paint-mail";

type MailContext = { sessionLabel: string | null; continueHref: string | null };

export async function paintPending(
  db: SupabaseClient,
  row: { kind: BroadcastKind; profile_id: string | null },
  context: MailContext,
) {
  try {
    const acceptHref =
      row.kind === "open_innovation"
        ? await ensureConsentToken(db, row.profile_id ?? "", process.env.NEXT_PUBLIC_SITE_URL)
        : null;
    return await paintMail({
      kind: row.kind,
      profileId: row.profile_id,
      sessionLabel: context.sessionLabel,
      continueHref: context.continueHref,
      acceptHref,
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "sin cuerpo" };
  }
}
```

En `deliver.ts`, importa `paintPending` desde `./paint-pending`. Borra la función `paintRow`. El ciclo queda:

```ts
    const painted = await paintPending(db, row, context);
```

Si falta `NEXT_PUBLIC_SITE_URL` o el perfil, `ensureConsentToken` regresa null, `paintMail` lanza `sin permiso` y `mark` guarda ese texto. Ese correo no sale. Recordatorio y gracias siguen con `acceptHref: null` y no tocan la tabla.

`deliver.ts` debe seguir en 90 líneas o menos. Si el import lo pasa, mueve `post` y `mark` a `src/lib/mail/post-pending.ts` en el mismo cambio y deja en `deliver.ts` solo el ciclo.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/mail/deliver.test.ts src/lib/mail/paint-mail.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/mail/paint-pending.ts src/lib/mail/deliver.ts src/lib/mail/deliver.test.ts
git commit -m "$(cat <<'EOF'
feat: bake each person's consent link into the innovation mail

EOF
)"
```

Si moviste `post` y `mark`, inclúyelos en el `git add`.

---

### Task 5: La página que acepta

**Files:**
- Create: `src/lib/innovation/accept-consent.ts`
- Modify: `src/lib/innovation/accept-consent.test.ts`
- Create: `src/app/innovacion-abierta/aceptar/page.tsx`
- Create: `src/app/innovacion-abierta/aceptar/accept-form.tsx`
- Create: `src/app/api/innovacion-abierta/aceptar/route.ts`

- [ ] **Step 1: Write the failing test**

Agrega estos casos al describe que ya existe en `src/lib/innovation/accept-consent.test.ts`:

```ts
  it("un token mal formado no llama a la base", async () => {
    const { acceptConsent } = await import("./accept-consent");
    await expect(acceptConsent("corto")).resolves.toBe("invalido");
  });

  it("abrir la página no acepta; el botón sí", () => {
    const page = readFileSync("src/app/innovacion-abierta/aceptar/page.tsx", "utf8");
    const form = readFileSync("src/app/innovacion-abierta/aceptar/accept-form.tsx", "utf8");
    const route = readFileSync("src/app/api/innovacion-abierta/aceptar/route.ts", "utf8");
    expect(page).not.toContain("accept_open_innovation");
    expect(page).not.toContain("acceptConsent");
    expect(form).toContain('method="post"');
    expect(form).toContain('name="token"');
    expect(form).toContain("Sí, pueden contactarme");
    expect(form).not.toContain(".rpc(");
    expect(route).toContain("acceptConsent");
    expect(route).toContain('"/innovacion-abierta/aceptar?listo=1"');
    expect(route).toContain('"/innovacion-abierta/aceptar?error=1"');
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/innovation/accept-consent.test.ts`

Expected: FAIL because `accept-consent.ts` and the page do not exist.

- [ ] **Step 3: Write the minimal implementation**

`src/lib/innovation/accept-consent.ts`:

```ts
import { createSupabaseAnon } from "@/lib/supabase/auth-session";

const tokenShape = /^[A-Za-z0-9_-]{43,80}$/;

export async function acceptConsent(token: string) {
  const clean = token.trim();
  if (!tokenShape.test(clean)) return "invalido" as const;
  const result = await createSupabaseAnon().rpc("accept_open_innovation", { raw_token: clean });
  if (result.error || result.data !== "aceptado") {
    if (result.error) console.error("accept_open_innovation", result.error.message);
    return "invalido" as const;
  }
  return "aceptado" as const;
}
```

`src/app/innovacion-abierta/aceptar/accept-form.tsx`:

```tsx
import { Button } from "@/components/ui/button";

export function AcceptForm({ token }: { token: string }) {
  return (
    <form action="/api/innovacion-abierta/aceptar" method="post">
      <input type="hidden" name="token" value={token} />
      <Button type="submit">Sí, pueden contactarme</Button>
    </form>
  );
}
```

`src/app/innovacion-abierta/aceptar/page.tsx`:

```tsx
import { AcceptForm } from "@/app/innovacion-abierta/aceptar/accept-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const instant = false;

export default async function AcceptInnovationPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string; listo?: string; error?: string }>;
}) {
  const params = await searchParams;
  const done = params.listo === "1";
  const failed = params.error === "1";
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

`src/app/api/innovacion-abierta/aceptar/route.ts`:

```ts
import { acceptConsent } from "@/lib/innovation/accept-consent";
import { redirectTo } from "@/lib/admin/redirect";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const token = String(form.get("token") ?? "");
  let result: "aceptado" | "invalido" = "invalido";
  try {
    result = await acceptConsent(token);
  } catch (error) {
    console.error("accept_open_innovation", error);
  }
  const path =
    result === "aceptado" ? "/innovacion-abierta/aceptar?listo=1" : "/innovacion-abierta/aceptar?error=1";
  return redirectTo(request, path);
}
```

No uses `alert`, `confirm` ni `prompt`. El error queda en `Alert`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/innovation/accept-consent.test.ts`

Expected: PASS. `npx tsc --noEmit` sale limpio.

- [ ] **Step 5: Commit**

```bash
git add src/lib/innovation/accept-consent.ts src/lib/innovation/accept-consent.test.ts src/app/innovacion-abierta/aceptar/page.tsx src/app/innovacion-abierta/aceptar/accept-form.tsx src/app/api/innovacion-abierta/aceptar/route.ts
git commit -m "$(cat <<'EOF'
feat: record open-innovation consent from the mailed link

EOF
)"
```

---

### Task 6: Lista del superadmin

**Files:**
- Create: `src/lib/admin/innovacion/list.ts`
- Create: `src/lib/admin/innovacion/list.test.ts`
- Create: `src/app/admin/innovacion/page.tsx`
- Create: `src/app/admin/innovacion/innovacion-list.tsx`
- Modify: `src/components/admin/nav.ts`
- Modify: `src/components/admin/nav-match.test.ts`

- [ ] **Step 1: Write the failing test**

`src/lib/admin/innovacion/list.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("lista de innovación abierta", () => {
  it("el superadmin ve quién aceptó y la consulta no lee el token", () => {
    const list = readFileSync("src/lib/admin/innovacion/list.ts", "utf8");
    const page = readFileSync("src/app/admin/innovacion/page.tsx", "utf8");
    const nav = readFileSync("src/components/admin/nav.ts", "utf8");
    expect(list).toContain('.select("profile_id, accepted_at")');
    expect(list).toContain('.not("accepted_at", "is", null)');
    expect(list).not.toContain("token");
    expect(page).toContain("requireSuperadmin");
    expect(page).toContain("InnovacionList");
    expect(nav).toContain('{ href: "/admin/innovacion", label: "Innovación abierta", group: "Operación" }');
  });
});
```

En `src/components/admin/nav-match.test.ts`, agrega esta fila al arreglo `cases`:

```ts
      ["/admin/innovacion", "Operación", "/admin/innovacion"],
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/admin/innovacion/list.test.ts src/components/admin/nav-match.test.ts`

Expected: FAIL because the list and the page do not exist.

- [ ] **Step 3: Write the minimal implementation**

En `src/components/admin/nav.ts`, después de Correo masivo:

```ts
  { href: "/admin/innovacion", label: "Innovación abierta", group: "Operación" },
```

`src/lib/admin/innovacion/list.ts`:

```ts
import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { pageQuery } from "@/lib/admin/page-query";

type ConsentRow = { profile_id: string; accepted_at: string };

export async function listAcceptedInnovation(rawPage: string | undefined) {
  const page = pageQuery(rawPage);
  const db = await adminDb();
  if (!db) return { page: page.page, rows: [] as Record<string, string>[] };
  const consents = await db
    .from("innovation_consents")
    .select("profile_id, accepted_at")
    .not("accepted_at", "is", null)
    .order("accepted_at", { ascending: false })
    .range(page.from, page.to);
  if (consents.error) throw new Error(consents.error.message);
  const rows = (consents.data ?? []) as ConsentRow[];
  const ids = rows.map((row) => row.profile_id);
  const people = ids.length
    ? await db.from("profiles").select("id, email, full_name").in("id", ids)
    : { data: [], error: null };
  const companies = ids.length
    ? await db.from("companies").select("id, profile_id, legal_name").in("profile_id", ids)
    : { data: [], error: null };
  if (people.error) throw new Error(people.error.message);
  if (companies.error) throw new Error(companies.error.message);
  const personById = new Map((people.data ?? []).map((row) => [row.id, row]));
  const companyByProfile = new Map((companies.data ?? []).map((row) => [row.profile_id, row]));
  return {
    page: page.page,
    rows: rows.map((row) => {
      const person = personById.get(row.profile_id);
      const company = companyByProfile.get(row.profile_id);
      return {
        id: row.profile_id,
        empresa: company?.legal_name ?? "Sin empresa",
        empresa_id: company?.id ?? "",
        nombre: person?.full_name ?? "",
        correo: person?.email ?? "",
        acepto: acceptedLabel(row.accepted_at),
      };
    }),
  };
}

function acceptedLabel(value: string) {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Mexico_City",
  }).format(new Date(value));
}
```

`src/app/admin/innovacion/innovacion-list.tsx`:

```tsx
"use client";

import Link from "next/link";
import { DataList } from "@/components/admin/data-list";

export function InnovacionList({ rows, page }: { rows: Record<string, string>[]; page: number }) {
  return (
    <DataList
      title="Innovación abierta"
      lead="Empresas que aceptaron que el Observatorio las contacte."
      columns={[
        { key: "empresa", label: "Empresa" },
        { key: "nombre", label: "Nombre" },
        { key: "correo", label: "Correo" },
        { key: "acepto", label: "Aceptó" },
      ]}
      rows={rows}
      page={page}
      basePath="/admin/innovacion"
      rowActions={(row) =>
        row.empresa_id ? (
          <Link className="text-link" href={`/admin/empresas/${row.empresa_id}`}>
            Ver empresa
          </Link>
        ) : (
          <span className="text-small text-ink-secondary">Sin empresa</span>
        )
      }
    />
  );
}
```

`src/app/admin/innovacion/page.tsx`:

```tsx
import { InnovacionList } from "@/app/admin/innovacion/innovacion-list";
import { listAcceptedInnovation } from "@/lib/admin/innovacion/list";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

export default async function InnovacionPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireSuperadmin();
  const params = await searchParams;
  const data = await listAcceptedInnovation(params.page);
  return <InnovacionList rows={data.rows} page={data.page} />;
}
```

Quien no aceptó no aparece. El token no se selecciona ni se pinta.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/admin/innovacion/list.test.ts src/components/admin/nav-match.test.ts src/lib/mail src/lib/innovation`

Expected: PASS. `npx tsc --noEmit` sale limpio.

- [ ] **Step 5: Commit**

```bash
git add src/lib/admin/innovacion/list.ts src/lib/admin/innovacion/list.test.ts src/app/admin/innovacion/page.tsx src/app/admin/innovacion/innovacion-list.tsx src/components/admin/nav.ts src/components/admin/nav-match.test.ts
git commit -m "$(cat <<'EOF'
feat: list who accepted open-innovation contact

EOF
)"
```

---

### Task 7: Verificación

- [ ] **Step 1: Run the mail and consent tests**

Run: `npx vitest run src/lib/mail src/lib/innovation src/lib/admin/innovacion/list.test.ts src/components/admin/nav-match.test.ts`

Expected: PASS

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`

Expected: exit 0

No hay prueba contra Resend ni contra Supabase remoto. La migración queda en el repo hasta que se pida aplicarla. Sin `NEXT_PUBLIC_SITE_URL`, el masivo de innovación abierta se queda en la bandeja con `sin permiso` y no se envía.
