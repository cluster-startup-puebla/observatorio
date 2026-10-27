# Equipo del organismo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** El director de un organismo da de alta, ve y quita capturistas e invitadores de su propio organismo, sin poder tocar otro organismo ni las cuentas de la plataforma.

**Architecture:** La base sigue siendo el candado. Una función nueva crea al miembro y otra lo quita; ninguna recibe el id del organismo: lo leen de la sesión. `create_staff_account` no se modifica, así el superadmin sigue creando moderador, capturista e invitador desde Cuentas. El panel gana la pantalla Equipo y esconde, según el rol, el enlace y la carga de archivo. La contraseña la escribe el director y se la pasa a la persona: `/recuperar` no envía correo, así que este plan no promete un enlace por mail.

**Tech Stack:** Postgres (migración SQL), Next.js 16 server actions, Vitest, shadcn Alert y AlertDialog, sonner. Archivos `.ts` y `.tsx` de máximo 90 líneas. Las migraciones SQL no cuentan para ese límite.

---

## Se puede hacer sin romper lo que ya está

| Se queda | Por qué no se toca |
|---|---|
| Alta pública del director y `finish_organization_brand` | Sigue creando un organismo y un solo director. El índice `profiles_one_director_per_org_idx` permanece. |
| `create_staff_account` y `/admin/cuentas` | El superadmin sigue creando moderador, capturista e invitador. La función nueva es otra. |
| Invitaciones a empresas (CRM, enlace, WhatsApp) | Una fila del CRM no es una cuenta del equipo. |
| Roles y políticas que ya dejan trabajar a capturista e invitador | Ya entran a `/{slug}` y ya leen el CRM de su organismo. |
| Modo memoria (sin Supabase) | El equipo no se finge ahí. La pantalla dice que hace falta la base. El director de memoria sigue viendo Inicio, Invitaciones y CRM. |

La contraseña inicial la elige el director. El formulario le dice que se la comparta. No se agrega envío de correo.

## Archivos

| Archivo | Responsabilidad |
|---|---|
| `src/lib/access.ts` | Acción nueva `manage_team`, solo del director. |
| `src/lib/organismo/team/member-draft.ts` | Valida correo, contraseña, nombre y rol antes de tocar la base. |
| `src/lib/organismo/team/member-error.ts` | Traduce el error de Postgres a una frase. |
| `src/lib/organismo/team/sort-team.ts` | Ordena director, luego nombre. |
| `supabase/migrations/20261027160000_org_team.sql` | `create_org_member` y `remove_org_member`. |
| `src/lib/organismo/team/create-member.ts` | Llama la función de alta. |
| `src/lib/organismo/team/remove-member.ts` | Llama la función de baja. |
| `src/lib/organismo/team/list.ts` | Lee los perfiles del organismo. |
| `src/lib/organismo/team/actions.ts` | Acciones de servidor del formulario. |
| `src/lib/organismo/assert-org-can.ts` | Rechaza una acción del panel si el rol no puede. |
| `src/lib/organismo/nav.ts` | Ítem Equipo solo si el rol puede `manage_team`. |
| `src/app/[sector]/equipo/page.tsx` | Pantalla. |
| `src/components/organismo/team-form.tsx` | Alta. |
| `src/components/organismo/team-list.tsx` | Lista. |
| `src/components/organismo/remove-member.tsx` | Confirmación para quitar. |
| `src/components/organismo/team-saved.tsx` | Toast de éxito. |
| `src/lib/organismo/invite-mode-list.ts` | Qué formas de invitar ve cada rol. |

---

### Task 1: El director es el único que administra el equipo

**Files:**
- Modify: `src/lib/access.ts`
- Test: `src/lib/access.test.ts`

- [ ] **Step 1: Write the failing test**

En `src/lib/access.test.ts`, agrega `"manage_team"` al arreglo `actions` y a la fila `superadmin` y `director` de `matrix`. Capturista, invitador, moderador y empresario no lo llevan. Agrega este caso dentro de `describe("can")`:

```ts
it("solo el director administra el equipo de su organismo", () => {
  expect(can("director", "manage_team")).toBe(true);
  expect(can("capturista", "manage_team")).toBe(false);
  expect(can("invitador", "manage_team")).toBe(false);
  expect(can("moderador", "manage_team")).toBe(false);
  expect(can("empresario", "manage_team")).toBe(false);
});
```

El caso «el superadmin puede todo» ya recorre `actions`, así que falla hasta que el superadmin también tenga `manage_team`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/access.test.ts`

Expected: FAIL porque `manage_team` no existe en el tipo `Action`.

- [ ] **Step 3: Write minimal implementation**

En `src/lib/access.ts`:

```ts
export type Action =
  | "manage_all"
  | "desk_scan"
  | "edit_brand"
  | "upload_excel"
  | "create_invite"
  | "copy_link"
  | "view_crm"
  | "send_mass_email"
  | "answer_methodology"
  | "manage_team";
```

En `grants`, agrega `"manage_team"` solo a `superadmin` y a `director`. El resto de las listas queda igual.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/access.test.ts`

Expected: PASS. `src/lib/access.ts` sigue bajo 90 líneas.

- [ ] **Step 5: Commit**

```bash
git add src/lib/access.ts src/lib/access.test.ts
git commit -m "$(cat <<'EOF'
feat: el director es quien administra el equipo del organismo

EOF
)"
```

---

### Task 2: Validar el alta antes de la base

**Files:**
- Create: `src/lib/organismo/team/member-draft.ts`
- Test: `src/lib/organismo/team/member-draft.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { memberDraft } from "./member-draft";

const valid = {
  email: " Ana@Cluster.mx ",
  password: "clave1234",
  role: "capturista",
  name: " Ana López ",
};

describe("memberDraft", () => {
  it("normaliza correo y nombre y acepta los dos roles del equipo", () => {
    expect(memberDraft(valid)).toEqual({
      ok: true,
      email: "ana@cluster.mx",
      password: "clave1234",
      role: "capturista",
      name: "Ana López",
    });
    expect(memberDraft({ ...valid, role: "invitador" }).ok).toBe(true);
  });

  it("rechaza director, moderador, contraseña corta, correo malo y nombre corto", () => {
    expect(memberDraft({ ...valid, role: "director" })).toEqual({
      ok: false,
      reason: "ese rol no se crea aquí",
    });
    expect(memberDraft({ ...valid, role: "moderador" })).toEqual({
      ok: false,
      reason: "ese rol no se crea aquí",
    });
    expect(memberDraft({ ...valid, password: "corta" })).toEqual({
      ok: false,
      reason: "Usa al menos 8 caracteres.",
    });
    expect(memberDraft({ ...valid, email: "ana" })).toEqual({
      ok: false,
      reason: "Escribe un correo válido.",
    });
    expect(memberDraft({ ...valid, name: "A" })).toEqual({
      ok: false,
      reason: "Escribe el nombre.",
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/organismo/team/member-draft.test.ts`

Expected: FAIL con `Cannot find module './member-draft'`.

- [ ] **Step 3: Write minimal implementation**

```ts
const roles = ["capturista", "invitador"] as const;
export type TeamRole = (typeof roles)[number];

export type MemberDraft =
  | { ok: true; email: string; password: string; role: TeamRole; name: string }
  | { ok: false; reason: string };

export function memberDraft(input: {
  email: string;
  password: string;
  role: string;
  name: string;
}): MemberDraft {
  if (!roles.includes(input.role as TeamRole)) {
    return { ok: false, reason: "ese rol no se crea aquí" };
  }
  const email = input.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, reason: "Escribe un correo válido." };
  }
  const password = input.password.trim();
  if (password.length < 8) return { ok: false, reason: "Usa al menos 8 caracteres." };
  const name = input.name.trim();
  if (name.length < 2 || name.length > 120) return { ok: false, reason: "Escribe el nombre." };
  return { ok: true, email, password, role: input.role as TeamRole, name };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/organismo/team/member-draft.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/organismo/team/member-draft.ts src/lib/organismo/team/member-draft.test.ts
git commit -m "$(cat <<'EOF'
feat: valida el alta de un miembro antes de tocar la base

EOF
)"
```

---

### Task 3: Traducir el error y ordenar la lista

**Files:**
- Create: `src/lib/organismo/team/member-error.ts`
- Create: `src/lib/organismo/team/sort-team.ts`
- Test: `src/lib/organismo/team/member-error.test.ts`
- Test: `src/lib/organismo/team/sort-team.test.ts`

- [ ] **Step 1: Write the failing tests**

`src/lib/organismo/team/member-error.test.ts`

```ts
import { describe, expect, it } from "vitest";
import { memberError } from "./member-error";

describe("memberError", () => {
  it("deja pasar las frases que ya escribe la base y traduce forbidden", () => {
    expect(memberError("crear", "forbidden")).toBe("No puedes crear cuentas.");
    expect(memberError("quitar", "forbidden")).toBe("No puedes quitar a esta persona.");
    expect(memberError("crear", "Escribe el nombre.")).toBe("Escribe el nombre.");
    expect(memberError("quitar", "esa cuenta tiene pase")).toBe("esa cuenta tiene pase");
  });

  it("un correo repetido se dice en español", () => {
    expect(memberError("crear", "duplicate key value violates unique constraint")).toBe(
      "Ese correo ya está registrado.",
    );
  });

  it("lo demás no se le muestra crudo a la persona", () => {
    expect(memberError("crear", "relation does not exist")).toBe(
      "No se pudo crear la cuenta. Intenta de nuevo.",
    );
    expect(memberError("quitar", "relation does not exist")).toBe(
      "No se pudo quitar a la persona.",
    );
  });
});
```

`src/lib/organismo/team/sort-team.test.ts`

```ts
import { describe, expect, it } from "vitest";
import { sortTeam, teamRoleLabel, type TeamMember } from "./sort-team";

const rows: TeamMember[] = [
  { id: "2", email: "b@cluster.mx", name: "Beto", role: "invitador" },
  { id: "1", email: "a@cluster.mx", name: "Ana", role: "director" },
  { id: "3", email: "c@cluster.mx", name: "Ana", role: "capturista" },
];

describe("sortTeam", () => {
  it("pone al director primero y luego ordena por nombre", () => {
    expect(sortTeam(rows).map((row) => row.id)).toEqual(["1", "3", "2"]);
  });

  it("traduce el rol", () => {
    expect(teamRoleLabel("director")).toBe("Director");
    expect(teamRoleLabel("capturista")).toBe("Capturista");
    expect(teamRoleLabel("invitador")).toBe("Invitador");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/organismo/team/member-error.test.ts src/lib/organismo/team/sort-team.test.ts`

Expected: FAIL con módulos faltantes.

- [ ] **Step 3: Write minimal implementation**

`src/lib/organismo/team/member-error.ts`

```ts
const allowed = new Set([
  "ese rol no se crea aquí",
  "Escribe un correo válido.",
  "Usa al menos 8 caracteres.",
  "Escribe el nombre.",
  "no es de tu organismo",
  "no puedes quitar al director",
  "esa cuenta tiene empresa",
  "esa cuenta tiene pase",
  "esa cuenta está en una llegada",
  "esa cuenta ya está en el crm",
]);

export function memberError(action: "crear" | "quitar", message: string) {
  if (message === "forbidden") {
    return action === "crear" ? "No puedes crear cuentas." : "No puedes quitar a esta persona.";
  }
  if (allowed.has(message)) return message;
  const lower = message.toLowerCase();
  if (lower.includes("duplicate") || lower.includes("unique") || lower.includes("already")) {
    return "Ese correo ya está registrado.";
  }
  return action === "crear"
    ? "No se pudo crear la cuenta. Intenta de nuevo."
    : "No se pudo quitar a la persona.";
}
```

`src/lib/organismo/team/sort-team.ts`

```ts
export type TeamMember = {
  id: string;
  email: string;
  name: string;
  role: "director" | "capturista" | "invitador";
};

const labels: Record<TeamMember["role"], string> = {
  director: "Director",
  capturista: "Capturista",
  invitador: "Invitador",
};

export function teamRoleLabel(role: TeamMember["role"]) {
  return labels[role];
}

export function sortTeam(rows: TeamMember[]) {
  return [...rows].sort((a, b) => {
    if (a.role === "director" && b.role !== "director") return -1;
    if (b.role === "director" && a.role !== "director") return 1;
    return a.name.localeCompare(b.name, "es") || a.email.localeCompare(b.email, "es");
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/organismo/team/member-error.test.ts src/lib/organismo/team/sort-team.test.ts`

Expected: PASS. Cada archivo bajo 90 líneas.

- [ ] **Step 5: Commit**

```bash
git add src/lib/organismo/team/member-error.ts src/lib/organismo/team/member-error.test.ts src/lib/organismo/team/sort-team.ts src/lib/organismo/team/sort-team.test.ts
git commit -m "$(cat <<'EOF'
feat: traduce los errores del equipo y ordena al director primero

EOF
)"
```

---

### Task 4: Funciones de base, sin tocar el alta del superadmin

**Files:**
- Create: `supabase/migrations/20261027160000_org_team.sql`
- Test: `src/lib/organismo/team/migration.test.ts`

No se ejecuta la migración contra producción en esta tarea. El archivo es el cambio. No se edita `supabase/migrations/20261022080000_create_staff_account.sql`.

- [ ] **Step 1: Write the failing test**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sql = readFileSync("supabase/migrations/20261027160000_org_team.sql", "utf8");
const staff = readFileSync("supabase/migrations/20261022080000_create_staff_account.sql", "utf8");

describe("equipo del organismo", () => {
  it("crea y quita sin recibir el organismo, y no reemplaza el alta del superadmin", () => {
    expect(sql).toContain("create or replace function public.create_org_member(");
    expect(sql).toContain("private.current_role() is distinct from 'director'");
    expect(sql).toContain("private.current_organization_id()");
    expect(sql).not.toContain("staff_organization_id");
    expect(sql).toContain("member_role not in ('capturista', 'invitador')");
    expect(sql).toContain("create or replace function public.remove_org_member(member_id uuid)");
    expect(sql).toContain("no puedes quitar al director");
    expect(sql).not.toContain("create or replace function public.create_staff_account");
    expect(staff).toContain("private.is_superadmin()");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/organismo/team/migration.test.ts`

Expected: FAIL porque el archivo SQL no existe.

- [ ] **Step 3: Write the migration**

`supabase/migrations/20261027160000_org_team.sql`

```sql
create or replace function public.create_org_member(
  member_email text,
  member_password text,
  member_role public.account_role,
  member_name text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_id uuid := gen_random_uuid();
  normalized text := lower(trim(member_email));
  org_id uuid := private.current_organization_id();
  clean_name text := trim(member_name);
begin
  if private.current_role() is distinct from 'director' or org_id is null then
    raise exception 'forbidden';
  end if;

  if member_role not in ('capturista', 'invitador') then
    raise exception 'ese rol no se crea aquí';
  end if;

  if char_length(trim(member_password)) < 8 then
    raise exception 'Usa al menos 8 caracteres.';
  end if;

  if position('@' in normalized) = 0 or position('.' in split_part(normalized, '@', 2)) = 0 then
    raise exception 'Escribe un correo válido.';
  end if;

  if char_length(clean_name) < 2 or char_length(clean_name) > 120 then
    raise exception 'Escribe el nombre.';
  end if;

  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, email_change, email_change_token_new, recovery_token,
    is_sso_user, is_anonymous
  ) values (
    '00000000-0000-0000-0000-000000000000',
    new_id,
    'authenticated',
    'authenticated',
    normalized,
    extensions.crypt(member_password, extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now(),
    '', '', '', '',
    false,
    false
  );

  insert into auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
  ) values (
    gen_random_uuid(),
    new_id,
    jsonb_build_object('sub', new_id::text, 'email', normalized),
    'email',
    normalized,
    now(),
    now(),
    now()
  );

  update public.profiles
  set role = member_role, organization_id = org_id, email = normalized, full_name = clean_name
  where id = new_id;

  if not found then
    insert into public.profiles (id, role, email, organization_id, full_name)
    values (new_id, member_role, normalized, org_id, clean_name);
  end if;

  return new_id;
end;
$$;

create or replace function public.remove_org_member(member_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  org_id uuid := private.current_organization_id();
  target_role public.account_role;
  target_org uuid;
begin
  if private.current_role() is distinct from 'director' or org_id is null then
    raise exception 'forbidden';
  end if;

  select role, organization_id into target_role, target_org
  from public.profiles
  where id = member_id;

  if target_org is distinct from org_id then
    raise exception 'no es de tu organismo';
  end if;

  if target_role is distinct from 'capturista' and target_role is distinct from 'invitador' then
    raise exception 'no puedes quitar al director';
  end if;

  if exists (select 1 from public.companies where profile_id = member_id) then
    raise exception 'esa cuenta tiene empresa';
  end if;

  if exists (select 1 from public.passes where profile_id = member_id) then
    raise exception 'esa cuenta tiene pase';
  end if;

  if exists (
    select 1 from public.arrivals
    where profile_id = member_id or scanned_by = member_id
  ) then
    raise exception 'esa cuenta está en una llegada';
  end if;

  if exists (select 1 from public.crm_contacts where profile_id = member_id) then
    raise exception 'esa cuenta ya está en el crm';
  end if;

  update public.crm_events set actor_id = auth.uid() where actor_id = member_id;
  update public.link_copies set actor_id = auth.uid() where actor_id = member_id;
  update public.media_assets set uploaded_by = auth.uid() where uploaded_by = member_id;
  update public.outbox_messages set created_by = null where created_by = member_id;
  update public.outbox_messages set profile_id = null where profile_id = member_id;

  delete from auth.users where id = member_id;
end;
$$;

revoke all on function public.create_org_member(text, text, public.account_role, text)
  from public, anon, authenticated, service_role;
grant execute on function public.create_org_member(text, text, public.account_role, text)
  to authenticated;

revoke all on function public.remove_org_member(uuid)
  from public, anon, authenticated, service_role;
grant execute on function public.remove_org_member(uuid)
  to authenticated;
```

El organismo sale de `private.current_organization_id()`. Un director no puede pasar el id de otro organismo. Un capturista que llame la función recibe `forbidden`. Quitar al director cae en `no puedes quitar al director` porque su rol no es capturista ni invitador. Las copias de enlace y los hechos del CRM que esa persona escribió pasan al director, para que el historial no se borre y la llave foránea deje borrar la cuenta. `profiles.id` referencia `auth.users` con `on delete cascade`, así que borrar `auth.users` borra el perfil.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/organismo/team/migration.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20261027160000_org_team.sql src/lib/organismo/team/migration.test.ts
git commit -m "$(cat <<'EOF'
feat: el director crea y quita miembros solo de su organismo

EOF
)"
```

---

### Task 5: El servidor llama esas funciones y no adivina el organismo

**Files:**
- Create: `src/lib/organismo/team/create-member.ts`
- Create: `src/lib/organismo/team/remove-member.ts`
- Create: `src/lib/organismo/team/actions.ts`
- Test: `src/lib/organismo/team/actions.test.ts`

- [ ] **Step 1: Write the failing test**

La prueba lee las acciones y exige que no acepten un organismo del formulario.

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const actions = readFileSync("src/lib/organismo/team/actions.ts", "utf8");
const create = readFileSync("src/lib/organismo/team/create-member.ts", "utf8");

describe("acciones del equipo", () => {
  it("exige manage_team y no manda un organization_id a la base", () => {
    expect(actions).toContain('can(account.role, "manage_team")');
    expect(actions).toContain("createMemberAction");
    expect(actions).toContain("removeMemberAction");
    expect(create).toContain("create_org_member");
    expect(create).not.toContain("organization_id");
    expect(create).not.toContain("organizationId");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/organismo/team/actions.test.ts`

Expected: FAIL porque los archivos no existen.

- [ ] **Step 3: Write minimal implementation**

`src/lib/organismo/team/create-member.ts`

```ts
import "server-only";

import { createSupabaseWithAccess, readAccessToken } from "@/lib/supabase/auth-session";
import type { MemberDraft } from "./member-draft";
import { memberError } from "./member-error";

export async function createOrgMember(draft: Extract<MemberDraft, { ok: true }>) {
  const token = await readAccessToken();
  if (!token) return { ok: false as const, reason: "forbidden" };
  const created = await createSupabaseWithAccess(token).rpc("create_org_member", {
    member_email: draft.email,
    member_password: draft.password,
    member_role: draft.role,
    member_name: draft.name,
  });
  if (created.error || !created.data) {
    console.error("create_org_member", created.error);
    return { ok: false as const, reason: memberError("crear", created.error?.message ?? "") };
  }
  return { ok: true as const, id: created.data as string };
}
```

`src/lib/organismo/team/remove-member.ts`

```ts
import "server-only";

import { createSupabaseWithAccess, readAccessToken } from "@/lib/supabase/auth-session";
import { memberError } from "./member-error";

export async function removeOrgMember(memberId: string) {
  const token = await readAccessToken();
  if (!token) return { ok: false as const, reason: "forbidden" };
  const removed = await createSupabaseWithAccess(token).rpc("remove_org_member", {
    member_id: memberId,
  });
  if (removed.error) {
    console.error("remove_org_member", removed.error);
    return { ok: false as const, reason: memberError("quitar", removed.error.message) };
  }
  return { ok: true as const };
}
```

`src/lib/organismo/team/actions.ts`

```ts
"use server";

import { redirect } from "next/navigation";
import { can } from "@/lib/access";
import { requireOrgMember } from "@/lib/organismo/member";
import { ownerBySlug } from "@/lib/organismo/owner";
import { usesSupabaseAuth } from "@/lib/supabase/auth-session";
import { createOrgMember } from "./create-member";
import { memberDraft } from "./member-draft";
import { removeOrgMember } from "./remove-member";

async function directorOf(slug: string) {
  const owner = await ownerBySlug(slug);
  if (!owner) redirect("/onboarding");
  const account = await requireOrgMember(owner);
  if (!can(account.role, "manage_team")) redirect(`/${owner.slug}`);
  return owner;
}

export async function createMemberAction(formData: FormData) {
  const owner = await directorOf(String(formData.get("slug") ?? "").trim());
  const back = `/${owner.slug}/equipo`;
  if (!usesSupabaseAuth()) {
    redirect(`${back}?error=${encodeURIComponent("El equipo se guarda en la base.")}`);
  }
  const draft = memberDraft({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    role: String(formData.get("role") ?? ""),
    name: String(formData.get("name") ?? ""),
  });
  if (!draft.ok) redirect(`${back}?error=${encodeURIComponent(draft.reason)}`);
  const created = await createOrgMember(draft);
  if (!created.ok) redirect(`${back}?error=${encodeURIComponent(created.reason)}`);
  redirect(`${back}?listo=1`);
}

export async function removeMemberAction(formData: FormData) {
  const owner = await directorOf(String(formData.get("slug") ?? "").trim());
  const back = `/${owner.slug}/equipo`;
  const removed = await removeOrgMember(String(formData.get("member_id") ?? ""));
  if (!removed.ok) redirect(`${back}?error=${encodeURIComponent(removed.reason)}`);
  redirect(back);
}
```

`actions.ts` queda cerca de 50 líneas. Si al pegarlo pasa de 90, no agregues más lógica en ese archivo: parte `directorOf` a `src/lib/organismo/team/director-of.ts` y deja las dos acciones donde están.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/organismo/team/actions.test.ts src/lib/organismo/team/member-draft.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/organismo/team/create-member.ts src/lib/organismo/team/remove-member.ts src/lib/organismo/team/actions.ts src/lib/organismo/team/actions.test.ts
git commit -m "$(cat <<'EOF'
feat: el alta del equipo usa la sesión del director, no un organismo del formulario

EOF
)"
```

---

### Task 6: Listar a la gente del organismo

**Files:**
- Create: `src/lib/organismo/team/list.ts`
- Test: `src/lib/organismo/team/list.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("listOrgTeam", () => {
  it("pide solo el organismo de la página y ordena con sortTeam", () => {
    const source = readFileSync("src/lib/organismo/team/list.ts", "utf8");
    expect(source).toContain('.eq("organization_id", organizationId)');
    expect(source).toContain("sortTeam");
    expect(source).toContain('in("role", ["director", "capturista", "invitador"])');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/organismo/team/list.test.ts`

Expected: FAIL porque `list.ts` no existe.

- [ ] **Step 3: Write minimal implementation**

```ts
import "server-only";

import { createSupabaseWithAccess, readAccessToken } from "@/lib/supabase/auth-session";
import { sortTeam, type TeamMember } from "./sort-team";

const roles = new Set(["director", "capturista", "invitador"]);

export async function listOrgTeam(organizationId: string): Promise<TeamMember[]> {
  const token = await readAccessToken();
  if (!token) return [];
  const result = await createSupabaseWithAccess(token)
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("organization_id", organizationId)
    .in("role", ["director", "capturista", "invitador"]);
  if (result.error) {
    console.error("listOrgTeam", result.error.message);
    return [];
  }
  const rows = (result.data ?? []).flatMap((row) => {
    if (!row.id || !row.email || !roles.has(row.role)) return [];
    return [{
      id: row.id,
      email: row.email,
      name: row.full_name?.trim() || row.email,
      role: row.role as TeamMember["role"],
    }];
  });
  return sortTeam(rows);
}
```

La política `profiles_select_same_org` ya deja leer los perfiles del mismo organismo. Un empresario no tiene `organization_id`, así que no aparece. Esta función no escribe.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/organismo/team/list.test.ts src/lib/organismo/team/sort-team.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/organismo/team/list.ts src/lib/organismo/team/list.test.ts
git commit -m "$(cat <<'EOF'
feat: lista el equipo del organismo al que pertenece la sesión

EOF
)"
```

---

### Task 7: Equipo en el menú, solo para el director

**Files:**
- Modify: `src/lib/organismo/nav.ts`
- Modify: `src/lib/organismo/nav.test.ts`
- Modify: `src/components/organismo/shell.tsx`
- Modify: `src/app/[sector]/layout.tsx`

- [ ] **Step 1: Write the failing test**

Sustituye el primer caso de `src/lib/organismo/nav.test.ts` por estos dos. El caso del home por rol se queda.

```ts
it("sin rol el menú sigue en tres rutas y el home no se come al CRM", () => {
  const links = orgLinks("coparmex-puebla");
  expect(links.map((link) => link.label)).toEqual(["Inicio", "Invitaciones", "CRM"]);
  const hrefs = links.map((link) => link.href);
  expect(hrefs).toEqual([
    "/coparmex-puebla",
    "/coparmex-puebla/invitaciones",
    "/coparmex-puebla/crm",
  ]);
  expect(bestMatchingHref("/coparmex-puebla/crm", hrefs)).toBe("/coparmex-puebla/crm");
  expect(bestMatchingHref("/coparmex-puebla", hrefs)).toBe("/coparmex-puebla");
});

it("el director ve Equipo y el invitador no", () => {
  expect(orgLinks("cluster-agro", "director").map((link) => link.label)).toEqual([
    "Inicio",
    "Invitaciones",
    "CRM",
    "Equipo",
  ]);
  expect(orgLinks("cluster-agro", "director").at(-1)?.href).toBe("/cluster-agro/equipo");
  expect(orgLinks("cluster-agro", "invitador").map((link) => link.label)).not.toContain("Equipo");
  expect(orgLinks("cluster-agro", "capturista").map((link) => link.label)).not.toContain("Equipo");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/organismo/nav.test.ts`

Expected: FAIL porque `orgLinks` no acepta el rol o no agrega Equipo.

- [ ] **Step 3: Write minimal implementation**

`src/lib/organismo/nav.ts` completo:

```ts
import type { AdminLink } from "@/components/admin/nav";
import { can } from "@/lib/access";
import type { AccountRole } from "@/lib/directory";

export function orgLinks(slug: string, role?: AccountRole): AdminLink[] {
  const root = `/${slug}`;
  const links: AdminLink[] = [
    { href: root, label: "Inicio", group: "Panel" },
    { href: `${root}/invitaciones`, label: "Invitaciones", group: "Panel" },
    { href: `${root}/crm`, label: "CRM", group: "Panel" },
  ];
  if (role && can(role, "manage_team")) {
    links.push({ href: `${root}/equipo`, label: "Equipo", group: "Panel" });
  }
  return links;
}

export function orgGroups(slug: string, role?: AccountRole) {
  return [{ name: "Panel", links: orgLinks(slug, role) }];
}
```

En `src/components/organismo/shell.tsx`, agrega `role` a las props y pásalo:

```tsx
import type { AccountRole } from "@/lib/directory";

export function OrgShell({
  slug,
  name,
  email,
  role,
  logoSrc,
  children,
}: {
  slug: string;
  name: string;
  email: string;
  role: AccountRole;
  logoSrc?: string;
  children: React.ReactNode;
}) {
```

Cambia `groups={orgGroups(slug)}` por `groups={orgGroups(slug, role)}`.

En `src/app/[sector]/layout.tsx`, pasa el rol que ya devuelve `requireOrgMember`:

```tsx
<OrgShell slug={owner.slug} name={owner.name} email={account.email} role={account.role} logoSrc={logoSrc}>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/organismo/nav.test.ts`

Expected: PASS. `nav.ts`, `shell.tsx` y `layout.tsx` siguen bajo 90 líneas.

- [ ] **Step 5: Commit**

```bash
git add src/lib/organismo/nav.ts src/lib/organismo/nav.test.ts src/components/organismo/shell.tsx src/app/[sector]/layout.tsx
git commit -m "$(cat <<'EOF'
feat: el menú del organismo muestra Equipo solo al director

EOF
)"
```

---

### Task 8: Pantalla Equipo

**Files:**
- Create: `src/app/[sector]/equipo/page.tsx`
- Create: `src/components/organismo/team-form.tsx`
- Create: `src/components/organismo/team-list.tsx`
- Create: `src/components/organismo/remove-member.tsx`
- Create: `src/components/organismo/team-saved.tsx`

No hay prueba de vitest para el markup. La prueba de esta tarea es el typecheck de los archivos nuevos y que ninguno pase de 90 líneas. La verificación en el navegador va en la Task 11.

- [ ] **Step 1: Write the page**

`src/app/[sector]/equipo/page.tsx`

```tsx
import { notFound, redirect } from "next/navigation";
import { TeamForm } from "@/components/organismo/team-form";
import { TeamList } from "@/components/organismo/team-list";
import { TeamSaved } from "@/components/organismo/team-saved";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { can } from "@/lib/access";
import { requireOrgMember } from "@/lib/organismo/member";
import { ownerBySlug } from "@/lib/organismo/owner";
import { listOrgTeam } from "@/lib/organismo/team/list";
import { usesSupabaseAuth } from "@/lib/supabase/auth-session";

export const instant = false;

export default async function EquipoPage({
  params,
  searchParams,
}: {
  params: Promise<{ sector: string }>;
  searchParams: Promise<{ error?: string; listo?: string }>;
}) {
  const { sector } = await params;
  const query = await searchParams;
  const owner = await ownerBySlug(sector);
  if (!owner) notFound();
  const account = await requireOrgMember(owner);
  if (!can(account.role, "manage_team")) redirect(`/${owner.slug}`);
  const members = usesSupabaseAuth() ? await listOrgTeam(owner.id) : [];
  return (
    <div className="grid max-w-3xl gap-6">
      <header className="grid gap-2">
        <h1 className="text-h1 text-ink">Equipo</h1>
        <p className="text-body text-ink-secondary">
          Personas que entran a este organismo. Tú sigues siendo la única dirección.
        </p>
      </header>
      <TeamSaved saved={query.listo === "1"} />
      {query.error ? (
        <Alert variant="destructive">
          <AlertDescription>{query.error}</AlertDescription>
        </Alert>
      ) : null}
      {usesSupabaseAuth() ? (
        <TeamForm slug={owner.slug} />
      ) : (
        <Alert>
          <AlertDescription>El equipo se guarda en la base. En este modo no se puede dar de alta.</AlertDescription>
        </Alert>
      )}
      <TeamList slug={owner.slug} members={members} />
    </div>
  );
}
```

- [ ] **Step 2: Write the form**

`src/components/organismo/team-form.tsx`

```tsx
import { PasswordInput } from "@/components/auth/password-input";
import { controlClass } from "@/components/landing/molecules/field";
import { createMemberAction } from "@/lib/organismo/team/actions";

export function TeamForm({ slug }: { slug: string }) {
  return (
    <form action={createMemberAction} className="grid gap-3 rounded-xl border border-line p-4">
      <input type="hidden" name="slug" value={slug} />
      <label className="grid gap-1 text-small text-ink" htmlFor="name">
        Nombre
        <input id="name" name="name" className={controlClass} autoComplete="name" />
      </label>
      <label className="grid gap-1 text-small text-ink" htmlFor="email">
        Correo
        <input id="email" name="email" type="email" className={controlClass} autoComplete="off" />
      </label>
      <label className="grid gap-1 text-small text-ink" htmlFor="password">
        Contraseña inicial
        <PasswordInput id="password" name="password" label="contraseña inicial" autoComplete="new-password" />
      </label>
      <p className="text-small text-ink-secondary">
        Compártela con la persona. Es la que usará para entrar.
      </p>
      <label className="grid gap-1 text-small text-ink" htmlFor="role">
        Rol
        <select id="role" name="role" className={controlClass} defaultValue="invitador">
          <option value="invitador">Invitador</option>
          <option value="capturista">Capturista</option>
        </select>
      </label>
      <button type="submit" className="btn btn-primary w-fit">
        Crear cuenta
      </button>
    </form>
  );
}
```

El select no ofrece Director ni Moderador. La base también lo rechaza.

- [ ] **Step 3: Write the list and the confirm dialog**

`src/components/organismo/remove-member.tsx`

```tsx
"use client";

import { SheetSubmit } from "@/components/admin/sheet-submit";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { removeMemberAction } from "@/lib/organismo/team/actions";

export function RemoveMember({ slug, memberId, label }: { slug: string; memberId: string; label: string }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button type="button" className="text-small text-mark">
          Quitar
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Quitar del equipo</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Quitar a {label}? Ya no podrá entrar a este organismo.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form action={removeMemberAction}>
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="member_id" value={memberId} />
          <AlertDialogFooter>
            <AlertDialogCancel type="button">Cancelar</AlertDialogCancel>
            <SheetSubmit pendingLabel="Quitando…">Sí, quitar</SheetSubmit>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

`src/components/organismo/team-list.tsx`

```tsx
import { RemoveMember } from "@/components/organismo/remove-member";
import { teamRoleLabel, type TeamMember } from "@/lib/organismo/team/sort-team";

export function TeamList({ slug, members }: { slug: string; members: TeamMember[] }) {
  if (members.length === 0) {
    return <p className="text-body text-ink-secondary">Todavía no hay más personas en este organismo.</p>;
  }
  return (
    <ul className="grid gap-2">
      {members.map((member) => (
        <li key={member.id} className="flex items-center justify-between gap-3 rounded-xl border border-line px-4 py-3">
          <span className="grid">
            <span className="text-body text-ink">{member.name}</span>
            <span className="text-small text-ink-secondary">{member.email}</span>
          </span>
          <span className="flex items-center gap-3">
            <span className="text-small text-ink">{teamRoleLabel(member.role)}</span>
            {member.role === "director" ? null : (
              <RemoveMember slug={slug} memberId={member.id} label={member.name} />
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}
```

`src/components/organismo/team-saved.tsx`

```tsx
"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export function TeamSaved({ saved }: { saved: boolean }) {
  useEffect(() => {
    if (saved) toast.success("La cuenta quedó lista.");
  }, [saved]);
  return null;
}
```

No uses `window.alert`, `window.confirm` ni `window.prompt`. El error se queda en `Alert`. El éxito es el toast. Quitar pide `AlertDialog`.

- [ ] **Step 4: Confirm the files stay under 90 lines**

Run: `wc -l src/app/[sector]/equipo/page.tsx src/components/organismo/team-form.tsx src/components/organismo/team-list.tsx src/components/organismo/remove-member.tsx src/components/organismo/team-saved.tsx`

Expected: cada número es menor a 91. Si `page.tsx` llega a 91, mueve el bloque del error a `src/components/organismo/team-error.tsx` y déjalo en una sola línea en la página.

- [ ] **Step 5: Commit**

```bash
git add src/app/[sector]/equipo/page.tsx src/components/organismo/team-form.tsx src/components/organismo/team-list.tsx src/components/organismo/remove-member.tsx src/components/organismo/team-saved.tsx
git commit -m "$(cat <<'EOF'
feat: el director ve y administra el equipo desde su panel

EOF
)"
```

---

### Task 9: El enlace solo lo genera quien puede copiarlo

**Files:**
- Modify: `src/lib/organismo/copy-link-supabase.ts`
- Modify: `src/lib/organismo/copy-link-action.ts`
- Modify: `src/components/organismo/home.tsx`
- Modify: `src/app/[sector]/page.tsx`
- Test: `src/lib/organismo/copy-link-guard.test.ts`

El director y el invitador siguen viendo y generando el enlace. El capturista deja de ver el formulario. La generación que ya existe no cambia de ruta ni de token.

- [ ] **Step 1: Write the failing test**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("enlace del organismo", () => {
  it("rechaza a quien no puede copiar el enlace", () => {
    const server = readFileSync("src/lib/organismo/copy-link-supabase.ts", "utf8");
    const home = readFileSync("src/components/organismo/home.tsx", "utf8");
    expect(server).toContain('can(account.role, "copy_link")');
    expect(server).toContain("error=permiso");
    expect(home).toContain('can(account.role, "copy_link")');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/organismo/copy-link-guard.test.ts`

Expected: FAIL porque todavía no está el `can`.

- [ ] **Step 3: Write minimal implementation**

En `src/lib/organismo/copy-link-supabase.ts`, importa `can` desde `@/lib/access`. Justo después de obtener `slug` y antes de buscar el sector, agrega:

```ts
if (!can(account.role, "copy_link")) redirect(`/${slug}?error=permiso`);
```

En `src/lib/organismo/copy-link-action.ts`, importa `can` y, en la rama de memoria, cambia la guarda a:

```ts
if (!id || !account?.orgSlug || !can(account.role, "copy_link")) return;
```

El director de memoria tiene `copy_link`, así que esa rama sigue generando el enlace.

En `src/app/[sector]/page.tsx`, pasa el error nuevo a `OrgHome`:

```tsx
denied={sp.error === "permiso"}
```

En `src/components/organismo/home.tsx`, agrega la prop `denied?: boolean`. Lee la sesión y pinta el formulario solo si el rol puede:

```tsx
import { can } from "@/lib/access";
import { readSessionAccount } from "@/lib/auth/session-account";
import { Alert, AlertDescription } from "@/components/ui/alert";

const account = await readSessionAccount();
const mayCopy = account ? can(account.role, "copy_link") : false;
```

Dentro del return, sustituye el `<CopyLink ... />` suelto por:

```tsx
{denied ? (
  <Alert variant="destructive">
    <AlertDescription>No puedes generar el enlace.</AlertDescription>
  </Alert>
) : null}
{mayCopy ? (
  <CopyLink url={url} sector={sector} failed={failed} ready={ready} sessions={sessions} />
) : null}
```

`home.tsx` debe quedar bajo 90 líneas. Si no cabe, mueve ese bloque a `src/components/organismo/home-link.tsx` y deja una sola etiqueta en `home.tsx`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/organismo/copy-link-guard.test.ts src/lib/organismo/nav.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/organismo/copy-link-supabase.ts src/lib/organismo/copy-link-action.ts src/components/organismo/home.tsx src/app/[sector]/page.tsx src/lib/organismo/copy-link-guard.test.ts
git commit -m "$(cat <<'EOF'
fix: el capturista ya no genera ni ve el enlace del organismo

EOF
)"
```

Si creaste `home-link.tsx`, inclúyelo en el `git add`.

---

### Task 10: La carga de archivo solo la ve quien puede subirla

**Files:**
- Create: `src/lib/organismo/assert-org-can.ts`
- Create: `src/lib/organismo/invite-mode-list.ts`
- Modify: `src/components/organismo/invite-modes.tsx`
- Modify: `src/app/[sector]/invitaciones/page.tsx`
- Modify: `src/lib/organismo-actions.ts`
- Modify: `src/components/organismo/invite-notice.tsx`
- Test: `src/lib/organismo/invite-mode-list.test.ts`

Director y capturista siguen viendo «Desde un archivo». El invitador ve «Una persona» y «Varios correos», que ya podía usar. Las tres acciones siguen guardando en el CRM igual que hoy cuando el rol sí puede.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { visibleInviteModes } from "./invite-mode-list";

describe("visibleInviteModes", () => {
  it("el invitador no ve la carga de archivo", () => {
    expect(visibleInviteModes("invitador").map((mode) => mode.id)).toEqual(["mano", "correos"]);
  });

  it("director y capturista siguen viendo las tres", () => {
    expect(visibleInviteModes("director").map((mode) => mode.id)).toEqual(["mano", "archivo", "correos"]);
    expect(visibleInviteModes("capturista").map((mode) => mode.id)).toEqual(["mano", "archivo", "correos"]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/organismo/invite-mode-list.test.ts`

Expected: FAIL con módulo faltante.

- [ ] **Step 3: Write minimal implementation**

`src/lib/organismo/invite-mode-list.ts`

```ts
import { can, type Role } from "@/lib/access";

export const inviteModes = [
  { id: "mano", label: "Una persona", lead: "Nombre, empresa y correo. Queda pendiente en el CRM." },
  { id: "archivo", label: "Desde un archivo", lead: "Un CSV con nombre, empresa y correo. Descarga la plantilla y súbela." },
  { id: "correos", label: "Varios correos", lead: "Un correo por línea. Cada uno entra al CRM como pendiente." },
] as const;

export type InviteMode = (typeof inviteModes)[number]["id"];

export function visibleInviteModes(role: Role) {
  return inviteModes.filter((mode) => {
    if (mode.id === "archivo") return can(role, "upload_excel");
    return can(role, "create_invite");
  });
}

export function activeInviteMode(mode: string, error: string | undefined, role: Role): InviteMode {
  const visible = visibleInviteModes(role);
  if (error === "correos" && visible.some((item) => item.id === "correos")) return "correos";
  const found = visible.find((item) => item.id === mode);
  return found?.id ?? visible[0]?.id ?? "mano";
}
```

`src/lib/organismo/assert-org-can.ts`

```ts
import { redirect } from "next/navigation";
import { can, type Action, type Role } from "@/lib/access";

export function assertOrgCan(role: Role, action: Action, back: string): void {
  if (!can(role, action)) {
    const join = back.includes("?") ? "&" : "?";
    redirect(`${back}${join}error=permiso`);
  }
}
```

En `src/lib/organismo-actions.ts`, importa `assertOrgCan`. Al inicio de cada acción, después de `actingOrg`:

```ts
assertOrgCan(account.role, "upload_excel", `/${owner.slug}/invitaciones?modo=archivo`);
```

en `uploadInvitesAction`.

```ts
assertOrgCan(account.role, "create_invite", `/${owner.slug}/invitaciones`);
```

en `createInviteAction`.

```ts
assertOrgCan(account.role, "create_invite", `/${owner.slug}/invitaciones?modo=correos`);
```

en `uploadEmailsAction`.

Director, capturista e invitador ya tienen `create_invite`, así que «Una persona» y «Varios correos» no cambian para ellos. El archivo sí se detiene para el invitador.

En `src/components/organismo/invite-notice.tsx`, agrega al mapa:

```ts
permiso: "No puedes hacer eso con tu rol.",
```

`src/components/organismo/invite-modes.tsx` completo:

```tsx
import Link from "next/link";
import { EmailBox } from "@/components/organismo/email-box";
import { InviteUpload } from "@/components/organismo/invite-upload";
import { ManualInvite } from "@/components/organismo/manual-invite";
import type { Role } from "@/lib/access";
import { activeInviteMode, visibleInviteModes } from "@/lib/organismo/invite-mode-list";

export function InviteModes({
  slug,
  mode,
  error,
  role,
}: {
  slug: string;
  mode: string;
  error?: string;
  role: Role;
}) {
  const visible = visibleInviteModes(role);
  const active = activeInviteMode(mode, error, role);
  const current = visible.find((item) => item.id === active) ?? visible[0];

  return (
    <div className="grid gap-6">
      <nav className="flex flex-wrap rounded-full border border-line bg-surface-subtle p-1" aria-label="Forma de invitar">
        {visible.map((item) => {
          const on = item.id === active;
          return (
            <Link
              key={item.id}
              href={`/${slug}/invitaciones?modo=${item.id}`}
              aria-current={on ? "page" : undefined}
              className={
                on
                  ? "rounded-full bg-brand px-4 py-1.5 text-small font-semibold text-on-brand"
                  : "rounded-full px-4 py-1.5 text-small font-semibold text-ink"
              }
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      {current ? <p className="text-body text-ink-secondary">{current.lead}</p> : null}
      {active === "mano" ? <ManualInvite slug={slug} error={error} /> : null}
      {active === "archivo" ? (
        <div className="grid gap-5">
          <a className="text-small font-semibold text-link" href={`/${slug}/invitaciones/plantilla`}>
            Descargar plantilla
          </a>
          <InviteUpload slug={slug} error={error} />
        </div>
      ) : null}
      {active === "correos" ? <EmailBox slug={slug} error={error} /> : null}
    </div>
  );
}
```

En `src/app/[sector]/invitaciones/page.tsx`, si `account` es null, llama `notFound()`. Pasa `role={account.role}` a `InviteModes`. Hoy la página ya llama `readSessionAccount`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/organismo/invite-mode-list.test.ts src/lib/access.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/organismo/assert-org-can.ts src/lib/organismo/invite-mode-list.ts src/lib/organismo/invite-mode-list.test.ts src/components/organismo/invite-modes.tsx src/app/[sector]/invitaciones/page.tsx src/lib/organismo-actions.ts src/components/organismo/invite-notice.tsx
git commit -m "$(cat <<'EOF'
fix: el invitador ya no carga el archivo de invitaciones

EOF
)"
```

---

### Task 11: Verificar que lo de antes sigue y que el equipo funciona

**Files:**
- Ninguno nuevo, salvo un arreglo si algo de esta lista falla.

- [ ] **Step 1: Run the focused tests**

Run: `npx vitest run src/lib/access.test.ts src/lib/organismo/nav.test.ts src/lib/organismo/team src/lib/organismo/invite-mode-list.test.ts src/lib/organismo/copy-link-guard.test.ts`

Expected: PASS

- [ ] **Step 2: Confirm no code file in this change passed 90 lines**

Run: `wc -l src/lib/access.ts src/lib/organismo/nav.ts src/lib/organismo/team/*.ts src/lib/organismo/assert-org-can.ts src/lib/organismo/invite-mode-list.ts src/lib/organismo/copy-link-supabase.ts src/lib/organismo/copy-link-action.ts src/lib/organismo-actions.ts src/components/organismo/home.tsx src/components/organismo/shell.tsx src/components/organismo/invite-modes.tsx src/components/organismo/team-form.tsx src/components/organismo/team-list.tsx src/components/organismo/remove-member.tsx src/components/organismo/team-saved.tsx src/app/[sector]/equipo/page.tsx src/app/[sector]/layout.tsx src/app/[sector]/page.tsx src/app/[sector]/invitaciones/page.tsx`

Expected: cada archivo de código, salvo la migración SQL, tiene 90 líneas o menos.

- [ ] **Step 3: Check the director flow in the browser**

Con la app en `http://127.0.0.1:3000` y una sesión de director de un organismo real:

1. El menú muestra Inicio, Invitaciones, CRM y Equipo.
2. Equipo lista al director y no muestra «Quitar» en esa fila.
3. Crear un invitador con correo nuevo, nombre y contraseña de 8 o más caracteres redirige a Equipo, muestra el toast «La cuenta quedó lista.» y la fila nueva.
4. Entrar con esa cuenta en otra ventana cae en `/{slug}`. Ve Inicio, Invitaciones y CRM. No ve Equipo. En Inicio no ve el formulario del enlace. En Invitaciones no ve «Desde un archivo». Sí puede capturar una persona a mano.
5. Volver como director y quitar a esa persona pide confirmación en el diálogo, no en `confirm()` del navegador. Después de aceptar, la fila desaparece.
6. Un capturista creado igual ve el archivo y no ve el enlace ni Equipo.
7. `/admin/cuentas` sigue abriendo el alta de moderador, capturista e invitador del superadmin.
8. Generar el enlace como director sigue mostrando la URL en Inicio.

Si el director de prueba no existe, no inventes un alta pública en esta tarea: usa una cuenta director que ya esté en la base. Si no hay sesión, detente y dilo; no cambies la contraseña de nadie.

- [ ] **Step 4: Commit only if step 3 forced a fix**

Si no hubo arreglo, no hagas un commit vacío. Si lo hubo:

```bash
git add <archivos del arreglo>
git commit -m "$(cat <<'EOF'
fix: el equipo del organismo queda usable en el panel

EOF
)"
```

---

## Qué queda fuera

- Enviar la contraseña por correo. `/recuperar` hoy solo muestra un texto y no manda el enlace.
- Que el capturista o el invitador inviten a otro compañero.
- Un segundo director por organismo.
- Cambiar el rol de alguien ya creado. Para eso se quita y se crea de nuevo.
- Borrar a una persona que ya tiene empresa, pase, llegada o fila propia en el CRM. La función se niega y la pantalla muestra esa frase.
- Aplicar la migración a producción dentro de estas tareas. El archivo queda en `supabase/migrations`. Se aplica con el mismo paso con el que este proyecto publica las demás migraciones.
