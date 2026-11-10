# Pase al aceptar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cada vez que un organismo o el superadmin acepta un registro por enlace, esa persona recibe el correo del pase.

**Architecture:** Aceptar sigue siendo `approve_link_signup`. Después del RPC, el servidor encola el `event_pass` de ese contacto con un RPC `security definer` (la sesión es del director, no del invitado) y lo manda con Resend. El QR es el `profile_id`, el mismo que ya pinta `passQrAttachment`. Si el pase ya se envió, no se manda otro. El remitente pasa por `mailFrom` porque el único envío de hoy falló: Resend rechazó `MAIL_FROM` por formato.

**Tech Stack:** Next.js 16, Resend, Supabase RPC. Cada archivo `.ts` o `.tsx` nuevo queda en 90 líneas o menos. No uses `supabase db push`. La migración se aplica con el MCP `apply_migration` del proyecto `jnshenkmexsxiylpqhdh` y también queda como archivo local.

---

## Lo que pasa hoy

Yamil terminó el perfil a las 13:52 con el enlace todavía en `cargado`. `issueConfirmedPass` vio el enlace pendiente y no guardó pase ni encoló correo. A las 13:55 aceptaron: `approve_link_signup` escribió `confirmar` y `registrar` y se detuvo. Sigue sin fila `event_pass` y sin pase.

La bienvenida de las 13:45 sí se encoló y Resend respondió: `Invalid from field`. El valor de `MAIL_FROM` en el servidor no cumple `correo@dominio` ni `Nombre <correo@dominio>`.

Hay dos puertas de aceptación y las dos tienen que mandar el pase:

- `src/lib/crm-actions.ts` cuando `event === "aceptar"`.
- `src/app/api/admin/crm/[id]/evento/route.ts` cuando `event === "aprobar"`.

`enqueue_own_mail` no sirve aquí: exige `auth.uid()` del empresario.

---

### Task 1: Remitente que Resend acepte

**Files:**
- Create: `src/lib/mail/mail-from.ts`
- Test: `src/lib/mail/mail-from.test.ts`
- Modify: `src/lib/mail/send-own.ts`
- Modify: `src/lib/mail/deliver.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { mailFrom } from "./mail-from";

describe("mailFrom", () => {
  it("deja un correo pelón", () => {
    expect(mailFrom("noreply@notificaciones.clusterdestartups.org")).toBe(
      "noreply@notificaciones.clusterdestartups.org",
    );
  });

  it("quita las comillas que envuelven Nombre <correo>", () => {
    expect(mailFrom('"Foro Puebla x Puebla <noreply@notificaciones.clusterdestartups.org>"')).toBe(
      "Foro Puebla x Puebla <noreply@notificaciones.clusterdestartups.org>",
    );
  });

  it("rechaza un nombre sin correo", () => {
    expect(mailFrom("Foro Puebla x Puebla")).toBeNull();
    expect(mailFrom("")).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/mail/mail-from.test.ts`
Expected: FAIL, `mailFrom` no está definido.

- [ ] **Step 3: Write minimal implementation**

`src/lib/mail/mail-from.ts`

```ts
const bare = /^[^<>\s]+@[^<>\s]+$/;
const wrapped = /^(.*)<([^<>\s]+@[^<>\s]+)>$/;

export function mailFrom(value: string | undefined) {
  const raw = (value ?? "").trim().replace(/^["']|["']$/g, "").trim();
  if (bare.test(raw)) return raw;
  const match = wrapped.exec(raw);
  if (!match) return null;
  const name = match[1].trim().replace(/^["']|["']$/g, "").trim();
  const email = match[2];
  return name ? `${name} <${email}>` : email;
}
```

En `send-own.ts`, sustituye `const from = process.env.MAIL_FROM` por `const from = mailFrom(process.env.MAIL_FROM)`. El `if (!key || !from)` ya cubre el `null`.

En `deliver.ts`, el mismo cambio sobre `const from = process.env.MAIL_FROM`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/mail/mail-from.test.ts src/lib/mail/post-mail.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/mail/mail-from.ts src/lib/mail/mail-from.test.ts src/lib/mail/send-own.ts src/lib/mail/deliver.ts
git commit -m "fix: send mail from a Resend-safe address"
```

---

### Task 2: Encolar el pase del contacto aceptado

**Files:**
- Create: `supabase/migrations/20261109143000_accepted_pass_mail.sql`
- Test: `src/lib/mail/accepted-pass-mail.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("pase al aceptar", () => {
  const sql = readFileSync("supabase/migrations/20261109143000_accepted_pass_mail.sql", "utf8");

  it("encola el pase del invitado, no el del director", () => {
    expect(sql).toContain("function public.enqueue_accepted_pass(contact_id uuid)");
    expect(sql).toContain("src is distinct from 'enlace'");
    expect(sql).toContain("current_status not in ('confirmo', 'registrado', 'llego')");
    expect(sql).toContain("profiles.onboarded_at is not null");
    expect(sql).toContain("'event_pass'");
    expect(sql).toContain("already_sent");
    expect(sql).toContain("grant execute on function public.enqueue_accepted_pass(uuid) to authenticated");
  });

  it("registra el envío sin exigir que la sesión sea la del invitado", () => {
    expect(sql).toContain("function public.record_accepted_pass(message_id uuid, provider text, failure text, html text)");
    expect(sql).toContain("kind = 'event_pass'");
    expect(sql).toContain("sent_at is null");
    expect(sql).toContain("grant execute on function public.record_accepted_pass(uuid, text, text, text) to authenticated");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/mail/accepted-pass-mail.test.ts`
Expected: FAIL, el archivo SQL no existe.

- [ ] **Step 3: Write the migration**

`supabase/migrations/20261109143000_accepted_pass_mail.sql`

```sql
create or replace function public.enqueue_accepted_pass(contact_id uuid)
returns table (id uuid, to_email text, subject text, profile_id uuid, already_sent boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  org uuid;
  src text;
  guest text;
  current_status text;
  guest_id uuid;
  row_id uuid;
begin
  if auth.uid() is null then
    raise exception 'sin sesión';
  end if;
  select organization_id, source, email into org, src, guest
  from public.crm_contacts
  where crm_contacts.id = enqueue_accepted_pass.contact_id;
  if org is null or src is distinct from 'enlace' then
    raise exception 'no es un registro por enlace';
  end if;
  if not (
    (select private.is_superadmin())
    or (
      org = (select private.current_organization_id())
      and (select private.current_role()) in ('director', 'capturista')
    )
  ) then
    raise exception 'no puedes enviar este pase';
  end if;
  select status into current_status
  from public.crm_contact_status
  where crm_contact_status.contact_id = enqueue_accepted_pass.contact_id;
  if current_status not in ('confirmo', 'registrado', 'llego') then
    raise exception 'el enlace no está aceptado';
  end if;
  select profiles.id into guest_id
  from public.profiles
  where lower(profiles.email) = guest
    and profiles.role = 'empresario'
    and profiles.onboarded_at is not null;
  if guest_id is null then
    return;
  end if;
  begin
    insert into public.outbox_messages (kind, to_email, subject, profile_id, created_by)
    values ('event_pass', guest, 'Tu pase para la sesión ya está listo', guest_id, auth.uid())
    returning outbox_messages.id into row_id;
  exception when unique_violation then
    select messages.id into row_id
    from public.outbox_messages as messages
    where messages.profile_id = guest_id and messages.kind = 'event_pass'
    order by messages.created_at desc
    limit 1;
  end;
  return query
  select messages.id, messages.to_email, messages.subject, messages.profile_id, messages.sent_at is not null
  from public.outbox_messages as messages
  where messages.id = row_id;
end;
$$;

create or replace function public.record_accepted_pass(
  message_id uuid,
  provider text,
  failure text,
  html text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  guest uuid;
  org uuid;
begin
  if auth.uid() is null then
    raise exception 'sin sesión';
  end if;
  select profile_id into guest
  from public.outbox_messages
  where id = message_id and kind = 'event_pass' and sent_at is null;
  if guest is null then
    raise exception 'no se pudo registrar';
  end if;
  select organization_id into org
  from public.crm_contacts
  where lower(email) = (select lower(email) from public.profiles where id = guest)
    and source = 'enlace'
  limit 1;
  if org is null then
    raise exception 'no se pudo registrar';
  end if;
  if not (
    (select private.is_superadmin())
    or (
      org = (select private.current_organization_id())
      and (select private.current_role()) in ('director', 'capturista')
    )
  ) then
    raise exception 'no se pudo registrar';
  end if;
  update public.outbox_messages
  set provider_id = provider,
      last_error = failure,
      body_html = html,
      sent_at = case when provider is not null and provider <> '' then now() else sent_at end
  where id = message_id
    and kind = 'event_pass'
    and sent_at is null;
end;
$$;

revoke all on function public.enqueue_accepted_pass(uuid) from public;
grant execute on function public.enqueue_accepted_pass(uuid) to authenticated;

revoke all on function public.record_accepted_pass(uuid, text, text, text) from public;
grant execute on function public.record_accepted_pass(uuid, text, text, text) to authenticated;
```

Aplícala en vivo con `apply_migration`, nombre `accepted_pass_mail`, mismo SQL. No la vuelvas a aplicar si el nombre ya existe.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/mail/accepted-pass-mail.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20261109143000_accepted_pass_mail.sql src/lib/mail/accepted-pass-mail.test.ts
git commit -m "feat: queue the pass when a link signup is accepted"
```

---

### Task 3: Mandar el pase desde la sesión de quien acepta

**Files:**
- Create: `src/lib/mail/send-accepted-pass.ts`
- Test: `src/lib/mail/send-accepted-pass.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("envío del pase aceptado", () => {
  const source = readFileSync("src/lib/mail/send-accepted-pass.ts", "utf8");

  it("encola, pinta el pase y registra el resultado", () => {
    expect(source).toContain('rpc("enqueue_accepted_pass"');
    expect(source).toContain('kind: "event_pass"');
    expect(source).toContain("mailFrom");
    expect(source).toContain('rpc("record_accepted_pass"');
    expect(source).toContain("already_sent");
    expect(source.indexOf("enqueue_accepted_pass")).toBeLessThan(source.indexOf("emails.send"));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/mail/send-accepted-pass.test.ts`
Expected: FAIL, el archivo no existe.

- [ ] **Step 3: Write minimal implementation**

`src/lib/mail/send-accepted-pass.ts` debe quedar en 90 líneas o menos.

```ts
import "server-only";

import { Resend } from "resend";
import { createSupabaseWithAccess } from "@/lib/supabase/auth-session";
import { mailFrom } from "./mail-from";
import { paintMail } from "./paint-mail";
import { resendPayload } from "./post-mail";

type PassRow = {
  id: string;
  to_email: string;
  subject: string;
  profile_id: string | null;
  already_sent: boolean;
};

function one(data: PassRow | PassRow[] | null) {
  if (Array.isArray(data)) return data[0] ?? null;
  return data;
}

export async function sendAcceptedPass(accessToken: string, contactId: string) {
  const db = createSupabaseWithAccess(accessToken);
  const enqueued = await db.rpc("enqueue_accepted_pass", { contact_id: contactId });
  const row = one((enqueued.data ?? null) as PassRow | PassRow[] | null);
  if (enqueued.error || !row || row.already_sent || !row.profile_id) return;
  const key = process.env.RESEND_API_KEY;
  const from = mailFrom(process.env.MAIL_FROM);
  if (!key || !from) {
    await db.rpc("record_accepted_pass", {
      message_id: row.id,
      provider: null,
      failure: "Falta RESEND_API_KEY o MAIL_FROM",
      html: null,
    });
    return;
  }
  const painted = await paintMail({
    kind: "event_pass",
    profileId: row.profile_id,
    sessionLabel: null,
    continueHref: null,
    acceptHref: null,
  });
  const sent = await new Resend(key).emails.send(
    resendPayload({ from, to: row.to_email, subject: row.subject, html: painted.html, attachments: painted.attachments }),
    { idempotencyKey: row.id },
  );
  await db.rpc("record_accepted_pass", {
    message_id: row.id,
    provider: sent.data?.id ?? null,
    failure: sent.error?.message ?? null,
    html: painted.html,
  });
}
```

Un fallo de Resend no revierte la aceptación. Queda en `outbox_messages.last_error` con `sent_at` nulo.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/mail/send-accepted-pass.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/mail/send-accepted-pass.ts src/lib/mail/send-accepted-pass.test.ts
git commit -m "feat: send the pass from the session that accepted the guest"
```

---

### Task 4: Enganchar las dos aceptaciones

**Files:**
- Modify: `src/lib/crm-actions.ts`
- Modify: `src/app/api/admin/crm/[id]/evento/route.ts`
- Test: `src/lib/mail/send-accepted-pass.test.ts`

- [ ] **Step 1: Extend the test**

Agrega este `it` al describe de `send-accepted-pass.test.ts`:

```ts
it("el organismo y el superadmin mandan el pase después de aceptar", () => {
  const org = readFileSync("src/lib/crm-actions.ts", "utf8");
  const admin = readFileSync("src/app/api/admin/crm/[id]/evento/route.ts", "utf8");
  expect(org.indexOf("approve_link_signup")).toBeLessThan(org.indexOf("sendAcceptedPass"));
  expect(admin.indexOf("approve_link_signup")).toBeLessThan(admin.indexOf("sendAcceptedPass"));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/mail/send-accepted-pass.test.ts`
Expected: FAIL, ninguna de las dos llamadas existe.

- [ ] **Step 3: Call it only after a successful approval**

En `src/lib/crm-actions.ts`, dentro de `applyEvent`, después de que `approve_link_signup` no devuelva error:

```ts
if (approved.error?.message.includes("sector_lleno")) return "sector_lleno";
if (approved.error) return "aceptar";
const token = await readAccessToken();
if (token) await sendAcceptedPass(token, personId);
return "";
```

Importa `readAccessToken` desde `@/lib/supabase/auth-session` y `sendAcceptedPass` desde `@/lib/mail/send-accepted-pass`.

En `src/app/api/admin/crm/[id]/evento/route.ts`, después de que `approve_link_signup` no tenga error y antes del redirect de éxito:

```ts
const token = await readAccessToken();
if (token) await sendAcceptedPass(token, id);
return NextResponse.redirect(new URL(back, request.url));
```

Mismos imports. Si el correo falla, la aceptación ya quedó y la respuesta sigue siendo el redirect de éxito.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/mail/send-accepted-pass.test.ts src/lib/crm/link-acceptance.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/crm-actions.ts src/app/api/admin/crm/[id]/evento/route.ts src/lib/mail/send-accepted-pass.test.ts
git commit -m "feat: email the pass when a chamber accepts the guest"
```

---

## Fuera de este plan

- No reenviar a mano a Yamil dentro del código. Cuando esto esté desplegado, quien lo acepte de nuevo no puede: ya está `registrado`. Para ese caso, con la sesión de superadmin, llamar una vez `sendAcceptedPass` con su `contact_id` desde un script local. El índice único evita un segundo pase si más tarde se abre el onboarding.
- No cambiar `issueConfirmedPass`. Sigue cubriendo a quien ya estaba aceptado antes de terminar el perfil.
- No tocar el video del empresario, Playwright de producción, ni `matchingUserConfirmed`.
