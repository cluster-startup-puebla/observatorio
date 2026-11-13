# Aceptar registro público Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** El superadmin acepta un registro público completo, crea la cuenta temporal, vuelca la fila, descuenta el cupo de la sesión vigente y manda el correo del pase.

**Architecture:** Un RPC `security definer` hace la cuenta, el vuelco y el cupo en una sola transacción. El correo sale después, con el QR que ya existe, y no lleva contraseña. Si el correo falla, la cuenta queda y el mismo botón reintenta el pase. Quien ya creó su cuenta en `/crear-cuenta` sigue el vuelco actual.

**Tech Stack:** Next.js 16, Supabase RPC `security definer`, Resend, `writePass`. Sin service role. Archivos `.ts` y `.tsx` de 90 líneas o menos. Migraciones SQL sin ese límite.

**Fuera de este plan:** cambiar la contraseña en el primer inicio, magic link, y escribir la contraseña en el correo.

**Contraseña temporal:** `Observatorio2026!` para toda cuenta nueva. No se cambia si el correo ya tiene usuario.

---

### Task 1: La contraseña temporal

**Files:**
- Create: `src/lib/admin/registros/temp-password.ts`
- Test: `src/lib/admin/registros/temp-password.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { expect, it } from "vitest";
import { temporaryPassword } from "./temp-password";

it("usa la contraseña compartida y cumple el mínimo de 8", () => {
  expect(temporaryPassword).toBe("Observatorio2026!");
  expect(temporaryPassword.length).toBeGreaterThanOrEqual(8);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/admin/registros/temp-password.test.ts`
Expected: FAIL with `Cannot find module './temp-password'`.

- [ ] **Step 3: Write minimal implementation**

```ts
export const temporaryPassword = "Observatorio2026!";
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/admin/registros/temp-password.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/admin/registros/temp-password.ts src/lib/admin/registros/temp-password.test.ts
git commit -m "feat: share one temporary password for accepted public registrations"
```

---

### Task 2: Aceptar la fila y ocupar el cupo

**Files:**
- Create: `supabase/migrations/20261113140000_accept_public_registration.sql`
- Test: `src/lib/admin/registros/accept-sql.test.ts`

El RPC lo ejecuta solo el superadmin. Crea `auth.users` con el mismo insert que `signup_public_account` cuando el correo es nuevo, y el trigger `profile_for_new_user` abre el perfil. Si el usuario ya existe, no toca su contraseña. Si ese perfil ya tiene empresa, aborta con `ya tiene cuenta` y no vuelca. Un registro a medias aborta con `incompleto`. El cupo se revisa con `private.sector_is_full` antes de insertar la empresa, contra la sesión `is_current` (Quinta Real).

Sin `org_id`, la empresa queda `sector_source = 'path'` y `admitted_at` queda escrito: eso ocupa el lugar. Con `org_id` de un organismo con marca lista, la empresa queda `sector_source = 'link'`, sin `admitted_at`, y se abren los hechos `cargar`, `confirmar` y `registrar` para que el organismo lo vea aceptado y el cupo lo cuente por enlace. Si el organismo no sirve, se acepta como registro solo.

También escribe el consentimiento del invitado (`aviso-de-privacidad` y `uso-de-datos`, versión `2026-10-15`) en su perfil, no en el del superadmin.

- [ ] **Step 1: Write the failing test**

```ts
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

const sql = readFileSync("supabase/migrations/20261113140000_accept_public_registration.sql", "utf8");

it("solo el superadmin acepta y la contraseña no queda en el SQL", () => {
  expect(sql).toContain("function public.accept_public_registration(");
  expect(sql).toContain("private.is_superadmin()");
  expect(sql).toContain("private.sector_is_full(sector)");
  expect(sql).toContain("grant execute on function public.accept_public_registration(uuid, text, uuid) to authenticated");
  expect(sql).not.toContain("to anon");
  expect(sql).not.toContain("Observatorio2026");
  expect(sql).not.toContain("SERVICE_ROLE");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/admin/registros/accept-sql.test.ts`
Expected: FAIL because the migration file does not exist.

- [ ] **Step 3: Write the migration**

```sql
create or replace function public.accept_public_registration(
  registration_id uuid,
  account_password text,
  org_id uuid
)
returns table (profile_id uuid, guest_email text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  guest uuid;
  sector uuid;
  clean_org uuid := org_id;
  row public.public_registrations%rowtype;
  band public.employee_band;
  contact uuid;
  latest text;
begin
  if auth.uid() is null or not (select private.is_superadmin()) then
    raise exception 'sin sesión';
  end if;

  select * into row
  from public.public_registrations as registration
  where registration.id = accept_public_registration.registration_id
  for update;

  if row.id is null then
    raise exception 'no está';
  end if;
  if row.poured_profile_id is not null then
    profile_id := row.poured_profile_id;
    guest_email := row.email;
    return next;
    return;
  end if;
  if row.completed_at is null then
    raise exception 'incompleto';
  end if;

  select id into sector from public.sectors where slug = row.sector_slug;
  if sector is null then
    raise exception 'sector';
  end if;
  band := case row.employee_band
    when '1–10' then '1_10'::public.employee_band
    when '11–50' then '11_50'::public.employee_band
    when '51–250' then '51_250'::public.employee_band
    when '250+' then '250_plus'::public.employee_band
    else null
  end;
  if band is null then
    raise exception 'empleados';
  end if;
  if row.market_size is not null and row.market_size not in ('local', 'regional', 'nacional', 'exportacion') then
    raise exception 'mercado';
  end if;
  if private.sector_is_full(sector) then
    raise exception 'sector_lleno';
  end if;

  if clean_org is not null and not exists (
    select 1 from public.organizations
    where id = clean_org and brand_completed_at is not null
  ) then
    clean_org := null;
  end if;

  select users.id into guest from auth.users as users where lower(users.email) = row.email;
  if guest is null then
    if char_length(account_password) < 8 then
      raise exception 'password_short';
    end if;
    guest := gen_random_uuid();
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change,
      email_change_token_new, recovery_token, is_sso_user, is_anonymous
    ) values (
      '00000000-0000-0000-0000-000000000000',
      guest, 'authenticated', 'authenticated', row.email,
      extensions.crypt(account_password, extensions.gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb,
      now(), now(), '', '', '', '', false, false
    );
    insert into auth.identities (
      id, user_id, identity_data, provider, provider_id,
      last_sign_in_at, created_at, updated_at
    ) values (
      gen_random_uuid(), guest,
      jsonb_build_object('sub', guest::text, 'email', row.email),
      'email', row.email, now(), now(), now()
    );
  end if;

  if exists (select 1 from public.companies where companies.profile_id = guest) then
    raise exception 'ya tiene cuenta';
  end if;

  update public.profiles
  set full_name = row.full_name,
      job_title = row.job_title,
      whatsapp = row.whatsapp,
      onboarded_at = coalesce(onboarded_at, clock_timestamp()),
      confidentiality_accepted_at = coalesce(confidentiality_accepted_at, clock_timestamp())
  where id = guest and role = 'empresario';
  if not found then
    raise exception 'perfil';
  end if;

  insert into public.privacy_consents (profile_id, notice, notice_version)
  values
    (guest, 'aviso-de-privacidad', '2026-10-15'),
    (guest, 'uso-de-datos', '2026-10-15')
  on conflict (profile_id, notice, notice_version) do nothing;

  insert into public.companies (
    profile_id, legal_name, sector_id, sector_source, employee_band,
    referral_source, market_size, municipality, session_interest,
    show_logo_on_event, admitted_at, admitted_by
  ) values (
    guest, row.company_name, sector,
    case when clean_org is null then 'path' else 'link' end,
    band, row.referral_source, row.market_size,
    nullif(row.municipality, ''), row.session_interest, false,
    case when clean_org is null then clock_timestamp() else null end,
    case when clean_org is null then auth.uid() else null end
  );

  if clean_org is not null then
    select id into contact
    from public.crm_contacts
    where organization_id = clean_org and email = row.email;
    if contact is null then
      insert into public.crm_contacts (organization_id, sector_id, nombre, empresa, email, source, profile_id)
      values (clean_org, sector, left(row.full_name, 120), left(row.company_name, 160), row.email, 'enlace', guest)
      returning id into contact;
      insert into public.crm_events (contact_id, event, actor_id, occurred_at)
      values (contact, 'cargar', auth.uid(), clock_timestamp());
    end if;
    select case event
      when 'cargar' then 'cargado'
      when 'contactar' then 'contactado'
      when 'confirmar' then 'confirmo'
      when 'registrar' then 'registrado'
      when 'llegar' then 'llego'
      else 'no'
    end into latest
    from public.crm_events
    where contact_id = contact
    order by occurred_at desc, id desc
    limit 1;
    if latest = 'cargado' or latest = 'contactado' then
      insert into public.crm_events (contact_id, event, actor_id, occurred_at)
      values (contact, 'confirmar', auth.uid(), clock_timestamp());
      insert into public.crm_events (contact_id, event, actor_id, occurred_at)
      values (contact, 'registrar', auth.uid(), clock_timestamp() + interval '1 millisecond');
    end if;
  end if;

  update public.public_registrations as registration
  set poured_at = clock_timestamp(), poured_profile_id = guest
  where registration.id = row.id and registration.poured_at is null;

  profile_id := guest;
  guest_email := row.email;
  return next;
end;
$$;

revoke all on function public.accept_public_registration(uuid, text, uuid) from public, anon;
grant execute on function public.accept_public_registration(uuid, text, uuid) to authenticated;
```

The en-dash in `'1–10'`, `'11–50'` and `'51–250'` is the same character stored by `finish_public_registration`. Do not replace it with a hyphen.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/admin/registros/accept-sql.test.ts`
Expected: PASS

- [ ] **Step 5: Apply the migration**

Apply `accept_public_registration` to project `jnshenkmexsxiylpqhdh` with the Supabase migration tool. Do not print emails. Do not use a service role key.

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/20261113140000_accept_public_registration.sql src/lib/admin/registros/accept-sql.test.ts
git commit -m "feat: accept a public registration into the current session"
```

---

### Task 3: Encolar el pase sin contacto de CRM

**Files:**
- Create: `supabase/migrations/20261113141000_enqueue_public_pass.sql`
- Test: `src/lib/mail/public-pass-mail.test.ts`

`enqueue_accepted_pass` exige un contacto de enlace. El registro solo no lo tiene. Esta función encola el mismo `event_pass` a partir del perfil y reutiliza `record_accepted_pass`, que ya deja al superadmin cerrar el envío.

- [ ] **Step 1: Write the failing test**

```ts
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

const sql = readFileSync("supabase/migrations/20261113141000_enqueue_public_pass.sql", "utf8");

it("el superadmin encola el pase del perfil", () => {
  expect(sql).toContain("function public.enqueue_public_pass(guest_id uuid)");
  expect(sql).toContain("private.is_superadmin()");
  expect(sql).toContain("'event_pass'");
  expect(sql).toContain("'Tu pase para la sesión ya está listo'");
  expect(sql).toContain("grant execute on function public.enqueue_public_pass(uuid) to authenticated");
  expect(sql).not.toContain("to anon");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/mail/public-pass-mail.test.ts`
Expected: FAIL because the migration file does not exist.

- [ ] **Step 3: Write the migration**

```sql
create or replace function public.enqueue_public_pass(guest_id uuid)
returns table (id uuid, to_email text, subject text, profile_id uuid, already_sent boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  guest text;
  ready timestamptz;
  row_id uuid;
begin
  if auth.uid() is null or not (select private.is_superadmin()) then
    raise exception 'sin sesión';
  end if;
  select email, onboarded_at into guest, ready
  from public.profiles
  where profiles.id = enqueue_public_pass.guest_id
    and profiles.role = 'empresario';
  if guest is null or ready is null then
    raise exception 'sin perfil';
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

revoke all on function public.enqueue_public_pass(uuid) from public, anon;
grant execute on function public.enqueue_public_pass(uuid) to authenticated;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/mail/public-pass-mail.test.ts`
Expected: PASS

- [ ] **Step 5: Apply the migration**

Apply `enqueue_public_pass` to project `jnshenkmexsxiylpqhdh`.

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/20261113141000_enqueue_public_pass.sql src/lib/mail/public-pass-mail.test.ts
git commit -m "feat: queue a pass email for an accepted public registration"
```

---

### Task 4: Mandar el pase

**Files:**
- Create: `src/lib/mail/send-public-pass.ts`
- Test: `src/lib/mail/send-public-pass.test.ts`

El archivo no importa `temporaryPassword` ni escribe la contraseña. Genera el QR con `writePass` y cierra el envío con `record_accepted_pass`. Si `already_sent` es verdadero, no vuelve a mandar el correo.

- [ ] **Step 1: Write the failing test**

```ts
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

const source = readFileSync("src/lib/mail/send-public-pass.ts", "utf8");

it("manda el pase y deja fuera la contraseña", () => {
  expect(source).toContain('rpc("enqueue_public_pass"');
  expect(source).toContain("writePass");
  expect(source).toContain('kind: "event_pass"');
  expect(source).toContain('rpc("record_accepted_pass"');
  expect(source).not.toContain("temporaryPassword");
  expect(source).not.toContain("Observatorio2026");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/mail/send-public-pass.test.ts`
Expected: FAIL because the file does not exist.

- [ ] **Step 3: Write minimal implementation**

```ts
import "server-only";

import { Resend } from "resend";
import { createSupabaseWithAccess } from "@/lib/supabase/auth-session";
import { writePass } from "@/lib/onboarding/write-pass";
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

export async function sendPublicPass(accessToken: string, profileId: string) {
  const db = createSupabaseWithAccess(accessToken);
  const enqueued = await db.rpc("enqueue_public_pass", { guest_id: profileId });
  const row = one((enqueued.data ?? null) as PassRow | PassRow[] | null);
  if (enqueued.error || !row?.profile_id) return { ok: false as const };
  const written = await writePass(db, row.profile_id);
  if (!written.ok) return { ok: false as const };
  if (row.already_sent) return { ok: true as const };
  const key = process.env.RESEND_API_KEY;
  const from = mailFrom(process.env.MAIL_FROM);
  if (!key || !from) {
    await db.rpc("record_accepted_pass", {
      message_id: row.id,
      provider: null,
      failure: "Falta RESEND_API_KEY o MAIL_FROM",
      html: null,
    });
    return { ok: false as const };
  }
  const painted = await paintMail({
    kind: "event_pass",
    profileId: row.profile_id,
    sessionLabel: null,
    continueHref: null,
    acceptHref: null,
  });
  const sent = await new Resend(key).emails.send(
    resendPayload({
      from,
      to: row.to_email,
      subject: row.subject,
      html: painted.html,
      attachments: painted.attachments,
    }),
    { idempotencyKey: row.id },
  );
  await db.rpc("record_accepted_pass", {
    message_id: row.id,
    provider: sent.data?.id ?? null,
    failure: sent.error?.message ?? null,
    html: painted.html,
  });
  return sent.error ? { ok: false as const } : { ok: true as const };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/mail/send-public-pass.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/mail/send-public-pass.ts src/lib/mail/send-public-pass.test.ts
git commit -m "feat: send the pass after a public registration is accepted"
```

---

### Task 5: El botón de aceptar

**Files:**
- Create: `src/app/api/admin/registros/[id]/aceptar/route.ts`
- Create: `src/app/admin/registros/accept-registro.tsx`
- Modify: `src/lib/admin/registros/list.ts`
- Modify: `src/lib/admin/registros/list.test.ts`
- Modify: `src/app/admin/registros/registros-list.tsx`
- Modify: `src/app/admin/registros/page.tsx`
- Test: `src/app/api/admin/registros/[id]/aceptar/route.test.ts`

La ruta lee el token de invitación de la fila, lo abre con `openRef` y `REF_SECRET` (el mismo fallback `e2e-ref-secret` que ya usa el panel), y llama al RPC con `temporaryPassword`. El formulario no recibe ni muestra la contraseña. Un error conocido se traduce a una frase. El éxito y el fallo se ven en `Alert`, no en `alert()`.

Frases:

- `sector_lleno` → `Ese sector ya llenó su cupo.`
- `incompleto` → `El registro todavía no está completo.`
- `ya tiene cuenta` → `Ese correo ya tiene empresa. Acéptalo desde Empresas.`
- cualquier otro → `No se pudo aceptar.`
- el RPC sí respondió y `sendPublicPass` falló → `La cuenta quedó lista. El pase no salió.`

`listRegistros` también selecciona `id`. El token de invitación lo lee la ruta en la base, no viaja al navegador. El botón dice `Aceptar` si no hay `poured_at`, y `Enviar pase` si ya se volcó. Una fila sin `completed_at` no tiene botón.

- [ ] **Step 1: Write the failing test**

```ts
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

const route = readFileSync("src/app/api/admin/registros/[id]/aceptar/route.ts", "utf8");

it("el superadmin acepta, vuelca y manda el pase", () => {
  expect(route).toContain("requireSuperadmin");
  expect(route).toContain("temporaryPassword");
  expect(route).toContain('rpc("accept_public_registration"');
  expect(route).toContain("sendPublicPass");
  expect(route).toContain("openRef");
  expect(route).not.toContain("SERVICE_ROLE");
});
```

Add to `src/lib/admin/registros/list.test.ts` inside the existing test:

```ts
expect(source).toContain("id, full_name");
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/app/api/admin/registros/[id]/aceptar/route.test.ts src/lib/admin/registros/list.test.ts`
Expected: FAIL because the route does not exist and the list select does not start with `id`.

- [ ] **Step 3: Write the route**

`src/app/api/admin/registros/[id]/aceptar/route.ts`:

```ts
import { temporaryPassword } from "@/lib/admin/registros/temp-password";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import { sendPublicPass } from "@/lib/mail/send-public-pass";
import { isUuid, openRef } from "@/lib/ref-token";
import { createSupabaseWithAccess, readAccessToken } from "@/lib/supabase/auth-session";
import { NextResponse, type NextRequest } from "next/server";

const back = "/admin/registros";

function phrase(message: string) {
  if (message.includes("sector_lleno")) return "Ese sector ya llenó su cupo.";
  if (message.includes("incompleto")) return "El registro todavía no está completo.";
  if (message.includes("ya tiene cuenta")) return "Ese correo ya tiene empresa. Acéptalo desde Empresas.";
  return "No se pudo aceptar.";
}

function redirect(request: NextRequest, key: "error" | "ok", value: string) {
  const url = new URL(back, request.url);
  url.searchParams.set(key, value);
  return NextResponse.redirect(url);
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  await requireSuperadmin();
  const { id } = await context.params;
  const token = await readAccessToken();
  if (!token || !isUuid(id)) return redirect(request, "error", "No se pudo aceptar.");
  const db = createSupabaseWithAccess(token);
  const found = await db.from("public_registrations").select("invite_token").eq("id", id).maybeSingle();
  if (found.error || !found.data) return redirect(request, "error", "No se pudo aceptar.");
  const secret = process.env.REF_SECRET ?? "e2e-ref-secret";
  const opened = found.data.invite_token ? openRef(found.data.invite_token, secret) : null;
  const orgId = opened && isUuid(opened) ? opened : null;
  const accepted = await db.rpc("accept_public_registration", {
    registration_id: id,
    account_password: temporaryPassword,
    org_id: orgId,
  });
  const profileId = Array.isArray(accepted.data) ? accepted.data[0]?.profile_id : accepted.data?.profile_id;
  if (accepted.error || !profileId) return redirect(request, "error", phrase(accepted.error?.message ?? ""));
  const sent = await sendPublicPass(token, profileId);
  if (!sent.ok) return redirect(request, "error", "La cuenta quedó lista. El pase no salió.");
  return redirect(request, "ok", "1");
}
```

`src/app/admin/registros/accept-registro.tsx`:

```tsx
export function AcceptRegistro({ id, completed, poured }: { id: string; completed: string; poured: string }) {
  if (!completed) return null;
  return (
    <form action={`/api/admin/registros/${id}/aceptar`} method="post">
      <button className="btn btn-primary" type="submit">{poured ? "Enviar pase" : "Aceptar"}</button>
    </form>
  );
}
```

In `list.ts`, change the select to:

```ts
.select("id, full_name, company_name, email, sector_slug, completed_at, poured_at", { count: "exact" })
```

Add `id` to each mapped row. Do not select `invite_token` in the list.

In `page.tsx`, widen `searchParams` to `Promise<{ page?: string; error?: string; ok?: string }>`. Read `error` and `ok` and pass `notice` to the list:

```tsx
const notice = typeof params.error === "string" ? params.error : params.ok === "1" ? "Se aceptó y se envió el pase." : "";
```

Render `Alert` above the table. `variant="destructive"` only when `params.error` is set. Import `Alert` and `AlertDescription` from `@/components/ui/alert`.

In `registros-list.tsx`, add the column and keep the file at or under 90 lines. If the column pushes it over, move the column array to `src/app/admin/registros/registro-columns.tsx`.

```tsx
{ key: "aceptar", label: "", render: (row) => (
  <AcceptRegistro id={row.id} completed={row.completed_at} poured={row.poured_at} />
)}
```

Change the lead to `Registros completos listos para aceptar. Al aceptar se crea la cuenta y sale el pase.`

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/app/api/admin/registros/[id]/aceptar/route.test.ts src/lib/admin/registros/list.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/api/admin/registros/[id]/aceptar/route.ts src/app/api/admin/registros/[id]/aceptar/route.test.ts src/app/admin/registros src/lib/admin/registros/list.ts src/lib/admin/registros/list.test.ts
git commit -m "feat: accept a public registration from the admin list"
```

---

### Task 6: Probar el recorrido

- [ ] **Step 1: Run the focused tests**

Run: `npx vitest run src/lib/admin/registros src/lib/mail/public-pass-mail.test.ts src/lib/mail/send-public-pass.test.ts src/lib/mail/send-accepted-pass.test.ts src/lib/admin/pases src/app/api/admin/registros src/app/api/admin/pases`
Expected: PASS

- [ ] **Step 2: Check the screen**

Open `/admin/registros` as superadmin. A row without `completed_at` has no button. A complete row shows `Aceptar`. After a successful accept the row shows `Ya tiene cuenta` and `Enviar pase`, and the notice says `Se aceptó y se envió el pase.` A full sector shows `Ese sector ya llenó su cupo.` and does not create the account.

Do not print the guest email or the password in the check notes.

---

### Task 7: Pases aceptados que no tienen archivo

Hoy la ficha dice `Sin pase.` aunque la persona ya está aceptada. Hay 10 invitados por enlace, con perfil terminado y correo marcado como enviado, sin fila en `passes`. Hay 1 registro de camino (`sector_source = path` y `admitted_at`) sin correo y sin pase, porque aceptar un externo no guarda el QR. Nueve correos ya enviados tienen `body_html` vacío. No se reenvía ninguno.

`sendAcceptedPass` llama a `writePass` y sigue aunque falle. El correo queda enviado y el archivo no existe.

**Files:**
- Create: `supabase/migrations/20261113142000_list_missing_passes.sql`
- Create: `src/lib/admin/pases/repair.ts`
- Create: `src/app/api/admin/pases/faltantes/route.ts`
- Create: `src/app/admin/pases/repair-passes.tsx`
- Modify: `src/lib/mail/send-accepted-pass.ts`
- Modify: `src/lib/mail/send-accepted-pass.test.ts`
- Modify: `src/app/admin/pases/pases-list.tsx`
- Modify: `src/app/admin/pases/page.tsx`
- Test: `src/lib/admin/pases/repair.test.ts`

- [ ] **Step 1: Write the failing tests**

`src/lib/admin/pases/repair.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

const sql = readFileSync("supabase/migrations/20261113142000_list_missing_passes.sql", "utf8");
const repair = readFileSync("src/lib/admin/pases/repair.ts", "utf8");
const route = readFileSync("src/app/api/admin/pases/faltantes/route.ts", "utf8");

it("lista aceptados sin archivo y no reenvía el correo", () => {
  expect(sql).toContain("function public.list_missing_passes()");
  expect(sql).toContain("private.is_superadmin()");
  expect(sql).toContain("admitted_at is not null");
  expect(sql).toContain("'confirmo', 'registrado', 'llego'");
  expect(sql).not.toContain("to anon");
  expect(repair).toContain('rpc("list_missing_passes")');
  expect(repair).toContain("writePass");
  expect(repair).not.toContain("Resend");
  expect(repair).not.toContain("sendAcceptedPass");
  expect(repair).not.toContain("sendPublicPass");
  expect(route).toContain("requireSuperadmin");
  expect(route).toContain("repairMissingPasses");
});
```

Add this assertion inside the first test of `src/lib/mail/send-accepted-pass.test.ts`:

```ts
expect(source).toContain("if (!written.ok)");
expect(source.indexOf("if (!written.ok)")).toBeLessThan(source.indexOf("emails.send"));
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/admin/pases/repair.test.ts src/lib/mail/send-accepted-pass.test.ts`
Expected: FAIL because the migration and the `written.ok` check do not exist.

- [ ] **Step 3: Write the migration**

```sql
create or replace function public.list_missing_passes()
returns setof uuid
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not (select private.is_superadmin()) then
    raise exception 'sin sesión';
  end if;
  return query
  select profile.id
  from public.profiles as profile
  where profile.role = 'empresario'
    and profile.onboarded_at is not null
    and not exists (
      select 1 from public.passes as pass where pass.profile_id = profile.id
    )
    and (
      exists (
        select 1 from public.companies as company
        where company.profile_id = profile.id
          and company.sector_source = 'path'
          and company.admitted_at is not null
      )
      or exists (
        select 1
        from public.crm_contacts as contact
        join public.crm_contact_status as status on status.contact_id = contact.id
        where contact.source = 'enlace'
          and lower(contact.email) = lower(profile.email)
          and status.status in ('confirmo', 'registrado', 'llego')
      )
    );
end;
$$;

revoke all on function public.list_missing_passes() from public, anon;
grant execute on function public.list_missing_passes() to authenticated;
```

Apply it to project `jnshenkmexsxiylpqhdh` with `apply_migration`, name `list_missing_passes`. Do not print emails. Do not send mail.

- [ ] **Step 4: Stop the silent failure and add the repair**

In `send-accepted-pass.ts`, keep the file at or under 90 lines. Replace the ignored `writePass` call with:

```ts
  const written = await writePass(db, row.profile_id);
  if (!written.ok) {
    await db.rpc("record_accepted_pass", {
      message_id: row.id,
      provider: null,
      failure: "No se pudo guardar el pase",
      html: null,
    });
    return;
  }
```

`src/lib/admin/pases/repair.ts`:

```ts
import "server-only";

import { writePass } from "@/lib/onboarding/write-pass";
import { createSupabaseWithAccess } from "@/lib/supabase/auth-session";

function ids(data: unknown) {
  if (!Array.isArray(data)) return [];
  return data.flatMap((item) => {
    if (typeof item === "string") return [item];
    if (item && typeof item === "object" && "list_missing_passes" in item) {
      return [String((item as { list_missing_passes: unknown }).list_missing_passes)];
    }
    return [];
  });
}

export async function repairMissingPasses(accessToken: string) {
  const db = createSupabaseWithAccess(accessToken);
  const listed = await db.rpc("list_missing_passes");
  if (listed.error) return { ok: false as const, written: 0 };
  let written = 0;
  for (const id of ids(listed.data)) {
    const saved = await writePass(db, id);
    if (saved.ok) written += 1;
  }
  return { ok: true as const, written };
}
```

`src/app/api/admin/pases/faltantes/route.ts` requires the superadmin, calls `repairMissingPasses`, and redirects to `/admin/pases?ok=` with the count, or `/admin/pases?error=No se pudieron generar los pases.` Do not call Resend.

`src/app/admin/pases/repair-passes.tsx`:

```tsx
export function RepairPasses() {
  return (
    <form action="/api/admin/pases/faltantes" method="post">
      <button className="btn btn-primary" type="submit">Generar los que faltan</button>
    </form>
  );
}
```

Pass that form as `children` of `DataList` from `PasesList`. Add an optional `notice` prop. When `page.tsx` has `error`, render `Alert variant="destructive"`. When `ok` is set, render `Alert` with `Se generaron {ok} pases.` Import `Alert` and `AlertDescription` from `@/components/ui/alert`. Widen `searchParams` to include `error` and `ok`. Keep each file at or under 90 lines.

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run src/lib/admin/pases/repair.test.ts src/lib/mail/send-accepted-pass.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/20261113142000_list_missing_passes.sql src/lib/admin/pases/repair.ts src/lib/admin/pases/repair.test.ts src/app/api/admin/pases/faltantes/route.ts src/app/admin/pases/repair-passes.tsx src/app/admin/pases/pases-list.tsx src/app/admin/pases/page.tsx src/lib/mail/send-accepted-pass.ts src/lib/mail/send-accepted-pass.test.ts
git commit -m "fix: store the pass file when someone is already accepted"
```
