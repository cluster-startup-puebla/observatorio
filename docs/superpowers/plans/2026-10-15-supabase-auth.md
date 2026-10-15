# Supabase Auth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Conectar el registro y el login actuales a Supabase Auth, con confirmación de correo, contraseña, cuatro roles y perfiles de empresario y empresa, sin que un cliente pueda elegir ni cambiar su rol.

**Architecture:** Supabase Auth guarda el correo y la contraseña. Una tabla `profiles` guarda el rol y los datos de la persona. Una tabla `companies` guarda la empresa, solo del empresario. El registro público siempre crea `empresario` en un trigger que ignora cualquier rol enviado por el navegador. Organismo y gobierno nacen por invitación del superadmin, usando `app_metadata`, que el usuario no puede escribir. El proxy de Next.js solo refresca la sesión. La autorización real se decide en el layout del portal leyendo el rol con RLS. Organismo y gobierno no leen datos de empresas.

**Tech Stack:** Next.js 16 (`proxy.ts`, no `middleware.ts`), `@supabase/supabase-js`, `@supabase/ssr`, Supabase Auth, Postgres RLS, pgTAP, Turnstile, SMTP propio.

---

## Decisión de plan

Usar **Supabase Pro**, no el plan Free, en cuanto el registro salga de local.

El plan Free pausa el proyecto por inactividad y el correo integrado de Auth está limitado a unos pocos mensajes por hora, sale de un dominio compartido y no sirve para confirmar cuentas ni recuperar contraseñas. Pro incluye protección contra contraseñas filtradas (Have I Been Pwned), respaldos y límites de Auth configurables. Aun en Pro hay que conectar un SMTP propio (Resend o el correo del Clúster). Pagar el plan no reemplaza el SMTP.

El service role no se usa en el registro público. Solo vive en el servidor, para invitar organismo y gobierno y para suspender cuentas.

## Lo que este plan deja listo

- `/register` conserva nombre, cargo, empresa, sector, empleados, correo, WhatsApp, fuente y aceptación del aviso. Se agregan contraseña y confirmación. Solo crea `empresario`.
- `/login` es el mismo para los cuatro roles y manda a un portal distinto.
- `/verificar` espera la confirmación de correo y permite reenviar.
- `/recuperar` y `/restablecer` usan el flujo de recuperación de Supabase.
- Perfil del empresario y perfil de la empresa, editables por su dueño.
- El superadmin invita organismo y gobierno. No puede crear otro superadmin desde la app.

Fuera de este plan: el contenido de los portales de organismo, gobierno y admin más allá de la entrada y la invitación.

## Modelo

```text
auth.users
  id, email, encrypted_password, email_confirmed_at, banned_until
        |
        | 1:1  trigger handle_new_user
        v
profiles
  id, role, full_name, job_title, whatsapp,
  company_id?, organization_id?,
  privacy_accepted_at, data_use_accepted_at
        |                          |
        | empresario               | organismo | gobierno
        v                          v
companies                    organizations
  owner_id unique              kind, name
  legal_name, sector,
  employee_band, referral_source
```

Roles: `empresario`, `organismo`, `gobierno`, `superadmin`.

Portales:

| Rol | Ruta |
| --- | --- |
| empresario | `/portal/empresa` |
| organismo | `/portal/organismo` |
| gobierno | `/portal/gobierno` |
| superadmin | `/portal/admin` |

El rol no se lee de `user_metadata`. Esa bolsa la puede mandar el navegador en `signUp`. El trigger solo acepta `organismo` o `gobierno` si vienen en `raw_app_meta_data`, que solo escribe el service role. Cualquier otro valor, incluido `superadmin`, se guarda como `empresario`. El primer superadmin se asigna a mano en SQL.

## Archivos

- Create: `supabase/config.toml`
- Create: `supabase/migrations/20261015120000_auth_schema.sql`
- Create: `supabase/migrations/20261015120100_auth_trigger.sql`
- Create: `supabase/migrations/20261015120200_auth_rls.sql`
- Create: `supabase/migrations/20261015120300_auth_rate_limit.sql`
- Create: `supabase/tests/auth_rls.test.sql`
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/admin.ts`
- Create: `src/lib/auth/roles.ts`
- Create: `src/lib/auth/password.ts`
- Create: `src/lib/auth/rate-limit.ts`
- Create: `src/proxy.ts`
- Create: `src/app/auth/callback/route.ts`
- Create: `src/app/auth/actions.ts`
- Modify: `src/components/landing/sections/register-form.tsx`
- Modify: `src/components/auth/login-form.tsx`
- Modify: `src/components/auth/recover-form.tsx`
- Modify: `src/components/auth/reset-form.tsx`
- Modify: `src/app/verificar/page.tsx`
- Create: `src/app/portal/layout.tsx`
- Create: `src/app/portal/empresa/page.tsx`
- Create: `src/app/portal/empresa/perfil/page.tsx`
- Create: `src/app/portal/organismo/page.tsx`
- Create: `src/app/portal/gobierno/page.tsx`
- Create: `src/app/portal/admin/page.tsx`
- Create: `src/app/portal/admin/actions.ts`
- Modify: `.env.example`

---

### Task 1: Proyecto Pro, Auth y secretos

**Files:**
- Create: `.env.example`
- Modify: `.gitignore` solo si `.env.local` no está ignorado

- [ ] **Step 1: Crear el proyecto en Supabase Pro**

Región `East US` o la más cercana a Puebla. Guardar la contraseña de la base fuera del repo.

- [ ] **Step 2: Dejar Auth así, en Authentication → Providers y Settings**

- Email: encendido. Phone y anonymous: apagados.
- Confirm email: encendido.
- Secure password: mínimo 12 caracteres.
- Leaked password protection: encendido.
- Refresh token rotation y reuse interval: encendidos.
- Site URL: `http://localhost:3001` en local. En producción, el dominio real.
- Redirect URLs permitidas, nada de comodines abiertos:
  - `http://localhost:3001/auth/callback`
  - `https://DOMINIO/auth/callback`
- SMTP propio configurado antes de probar correos. Remitente del Clúster.
- Attack Protection / CAPTCHA: Turnstile. Las llaves van a env, no al cliente salvo la site key.

- [ ] **Step 3: Límites de Auth en el dashboard**

Punto de partida, ajustar si el tráfico real lo pide:

- Sign-ups: 10 por hora por IP.
- Sign-ins: 30 cada 5 minutos por IP.
- Recover: 5 por hora por IP.
- Token verifications: 30 cada 5 minutos por IP.
- Email sends: el tope del SMTP, no el correo integrado.

- [ ] **Step 4: Escribir `.env.example`**

```bash
NEXT_PUBLIC_SUPABASE_URL=https://PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
TURNSTILE_SECRET_KEY=
```

`SUPABASE_SERVICE_ROLE_KEY` y `TURNSTILE_SECRET_KEY` no llevan prefijo `NEXT_PUBLIC`. No se commitea `.env.local`.

- [ ] **Step 5: Instalar el cliente**

Run: `npm install @supabase/supabase-js @supabase/ssr`

Expected: ambas dependencias en `package.json`. No instalar la service role en un paquete de cliente.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json .env.example
git commit -m "Add Supabase client dependencies and env contract."
```

---

### Task 2: Migración del esquema

**Files:**
- Create: `supabase/migrations/20261015120000_auth_schema.sql`

- [ ] **Step 1: Escribir la migración**

```sql
create extension if not exists pgcrypto;

create type public.user_role as enum (
  'empresario',
  'organismo',
  'gobierno',
  'superadmin'
);

create type public.employee_band as enum (
  '1_10',
  '11_50',
  '51_250',
  '250_plus'
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('organismo', 'gobierno')),
  name text not null check (char_length(name) between 2 and 160),
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null default 'empresario',
  full_name text not null check (char_length(full_name) between 2 and 120),
  job_title text check (job_title is null or char_length(job_title) between 2 and 120),
  whatsapp text check (whatsapp is null or whatsapp ~ '^[0-9]{10,15}$'),
  organization_id uuid references public.organizations (id),
  privacy_accepted_at timestamptz,
  data_use_accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_staff_have_org check (
    role not in ('organismo', 'gobierno') or organization_id is not null
  ),
  constraint profiles_acceptance check (
    role <> 'empresario'
    or (privacy_accepted_at is not null and data_use_accepted_at is not null)
  )
);

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references public.profiles (id) on delete cascade,
  legal_name text not null check (char_length(legal_name) between 2 and 160),
  sector text not null check (char_length(sector) between 2 and 160),
  employee_band public.employee_band not null,
  referral_source text not null check (char_length(referral_source) between 2 and 160),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
  add column company_id uuid unique references public.companies (id);

create index profiles_role_idx on public.profiles (role);
create index profiles_organization_idx on public.profiles (organization_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger companies_updated_at
  before update on public.companies
  for each row execute function public.set_updated_at();
```

Los códigos `1_10`, `11_50`, `51_250` y `250_plus` corresponden a las etiquetas actuales `1–10`, `11–50`, `51–250` y `250+` de `companySizes` en `src/content/landing.ts`.

- [ ] **Step 2: Aplicar en local**

Run: `npx supabase db reset`

Expected: la migración termina sin error.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20261015120000_auth_schema.sql
git commit -m "Add profile, company, and organization tables."
```

---

### Task 3: Trigger de alta

**Files:**
- Create: `supabase/migrations/20261015120100_auth_trigger.sql`

El trigger corre como `security definer` porque el usuario nuevo todavía no puede insertar saltándose RLS. `search_path` queda fijo. El rol pedido en `user_metadata` se ignora.

- [ ] **Step 1: Escribir el trigger**

```sql
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested text := new.raw_app_meta_data ->> 'role';
  assigned public.user_role := 'empresario';
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  new_company uuid;
  org_id uuid;
begin
  if requested in ('organismo', 'gobierno') then
    assigned := requested::public.user_role;
    org_id := nullif(new.raw_app_meta_data ->> 'organization_id', '')::uuid;
  end if;

  insert into public.profiles (
    id,
    role,
    full_name,
    job_title,
    whatsapp,
    organization_id,
    privacy_accepted_at,
    data_use_accepted_at
  )
  values (
    new.id,
    assigned,
    coalesce(nullif(meta ->> 'full_name', ''), 'Pendiente'),
    nullif(meta ->> 'job_title', ''),
    nullif(meta ->> 'whatsapp', ''),
    org_id,
    case when assigned = 'empresario' then now() else null end,
    case when assigned = 'empresario' then now() else null end
  );

  if assigned = 'empresario' then
    insert into public.companies (
      owner_id,
      legal_name,
      sector,
      employee_band,
      referral_source
    )
    values (
      new.id,
      meta ->> 'legal_name',
      meta ->> 'sector',
      (meta ->> 'employee_band')::public.employee_band,
      meta ->> 'referral_source'
    )
    returning id into new_company;

    update public.profiles
      set company_id = new_company
      where id = new.id;
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

revoke all on function public.handle_new_user() from public, anon, authenticated;
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/20261015120100_auth_trigger.sql
git commit -m "Force public signups to the empresario role."
```

---

### Task 4: RLS, grants y función de rol

**Files:**
- Create: `supabase/migrations/20261015120200_auth_rls.sql`

- [ ] **Step 1: Escribir las políticas**

```sql
create or replace function public.current_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

revoke all on function public.current_role() from public, anon;
grant execute on function public.current_role() to authenticated;

alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.organizations enable row level security;

revoke all on public.profiles, public.companies, public.organizations from anon, public;

grant select on public.profiles, public.companies, public.organizations to authenticated;
grant update (full_name, job_title, whatsapp) on public.profiles to authenticated;
grant update (legal_name, sector, employee_band, referral_source) on public.companies to authenticated;

create policy profiles_select_own on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.current_role() = 'superadmin');

create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid() and role = public.current_role());

create policy companies_select_own on public.companies
  for select to authenticated
  using (
    owner_id = auth.uid()
    or public.current_role() = 'superadmin'
  );

create policy companies_update_own on public.companies
  for update to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy organizations_select_own on public.organizations
  for select to authenticated
  using (
    id in (select organization_id from public.profiles where id = auth.uid())
    or public.current_role() = 'superadmin'
  );
```

No hay política `insert` para `authenticated` en `profiles` ni en `companies`. El alta la hace el trigger. No hay política que deje a `organismo` o `gobierno` leer `companies`: el aviso de privacidad trata el nombre de la empresa como confidencial.

`profiles_update_own` exige que `role` no cambie. El grant de columnas ni siquiera incluye `role`, `company_id` ni `organization_id`.

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/20261015120200_auth_rls.sql
git commit -m "Lock profile and company access with row level security."
```

---

### Task 5: Límite de intentos en la app

**Files:**
- Create: `supabase/migrations/20261015120300_auth_rate_limit.sql`
- Create: `src/lib/auth/rate-limit.ts`

El límite del dashboard cubre la API de Auth. Esta tabla cubre las server actions antes de llamar a Supabase, para no revelar si un correo existe y para frenar reintentos de la aplicación.

- [ ] **Step 1: Migración**

```sql
create table public.auth_attempts (
  id bigint generated always as identity primary key,
  action text not null check (action in ('signup', 'signin', 'recover', 'resend')),
  key_hash text not null,
  created_at timestamptz not null default now()
);

create index auth_attempts_lookup_idx
  on public.auth_attempts (action, key_hash, created_at desc);

alter table public.auth_attempts enable row level security;
revoke all on public.auth_attempts from anon, authenticated, public;

create or replace function public.register_attempt(
  p_action text,
  p_key_hash text,
  p_limit integer,
  p_window interval
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  recent integer;
begin
  delete from public.auth_attempts
  where created_at < now() - interval '1 day';

  select count(*) into recent
  from public.auth_attempts
  where action = p_action
    and key_hash = p_key_hash
    and created_at > now() - p_window;

  if recent >= p_limit then
    return false;
  end if;

  insert into public.auth_attempts (action, key_hash)
  values (p_action, p_key_hash);

  return true;
end;
$$;

revoke all on function public.register_attempt(text, text, integer, interval) from public, anon, authenticated;
```

La función no se expone a PostgREST. El servidor la llama con el service role.

- [ ] **Step 2: Helper de aplicación**

`src/lib/auth/rate-limit.ts` hashea IP + correo con SHA-256 y un pepper de env `AUTH_ATTEMPT_PEPPER`. No guarda la IP ni el correo en claro. Límites de la action:

- `signup`: 5 por hora por hash.
- `signin`: 10 cada 15 minutos por hash.
- `recover` y `resend`: 3 por hora por hash.

Si `register_attempt` regresa false, la action responde el mismo mensaje genérico de éxito o de credenciales inválidas. No dice "espera unos minutos" en recuperar, para no confirmar que el correo existe. En login sí puede decir "demasiados intentos" porque el usuario ya está presente.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20261015120300_auth_rate_limit.sql src/lib/auth/rate-limit.ts
git commit -m "Rate limit signup, sign-in, and recovery attempts."
```

---

### Task 6: Pruebas de RLS

**Files:**
- Create: `supabase/tests/auth_rls.test.sql`

- [ ] **Step 1: Cubrir estos casos con pgTAP**

1. `anon` no lee `profiles`, `companies` ni `organizations`.
2. Un empresario lee y edita su empresa, y no la de otro.
3. Un empresario no puede cambiar `profiles.role` ni `company_id`.
4. Un usuario `organismo` no recibe filas de `companies`.
5. Un `superadmin` sí lee `companies`.
6. Insertar en `auth.users` con `raw_user_meta_data.role = superadmin` deja `profiles.role = empresario`.
7. Insertar con `raw_app_meta_data.role = organismo` y un `organization_id` válido deja `organismo`.

- [ ] **Step 2: Correrlas**

Run: `npx supabase test db`

Expected: todos los casos pasan.

- [ ] **Step 3: Commit**

```bash
git add supabase/tests/auth_rls.test.sql
git commit -m "Test that clients cannot escalate roles or read other companies."
```

---

### Task 7: Clientes de Supabase

**Files:**
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/admin.ts`
- Create: `src/lib/auth/roles.ts`
- Create: `src/lib/auth/password.ts`

- [ ] **Step 1: Tres clientes, tres usos**

- `client.ts`: `createBrowserClient` con URL y anon key. Solo lo importan componentes de cliente.
- `server.ts`: `createServerClient` con cookies de `next/headers`. Lo usan server actions y layouts.
- `admin.ts`: `createClient` con `SUPABASE_SERVICE_ROLE_KEY`, `persistSession: false`, `autoRefreshToken: false`. El archivo empieza con `import "server-only"`. Solo lo importa `src/app/portal/admin/actions.ts` y `src/lib/auth/rate-limit.ts`.

- [ ] **Step 2: Mapa de portales**

```ts
export const portalByRole = {
  empresario: "/portal/empresa",
  organismo: "/portal/organismo",
  gobierno: "/portal/gobierno",
  superadmin: "/portal/admin",
} as const;

export type AppRole = keyof typeof portalByRole;
```

- [ ] **Step 3: Contraseña**

`password.ts` exige al menos 12 caracteres y que `password === confirmPassword`. La confirmación no se envía a Supabase. El mensaje de error es el mismo que ya usa `/restablecer`: "La contraseña necesita al menos 8 caracteres" se cambia a "La contraseña necesita al menos 12 caracteres." y "Las contraseñas no coinciden."

- [ ] **Step 4: Commit**

```bash
git add src/lib/supabase src/lib/auth/roles.ts src/lib/auth/password.ts
git commit -m "Add server, browser, and service-role Supabase clients."
```

---

### Task 8: Callback y proxy

**Files:**
- Create: `src/app/auth/callback/route.ts`
- Create: `src/proxy.ts`

Next.js 16 usa `src/proxy.ts`. El proxy no autoriza: la guía del framework lo trata como una revisión optimista. El layout del portal vuelve a leer el rol.

- [ ] **Step 1: Callback**

`GET /auth/callback` lee `code` y `next`.

- Sin `code`, redirige a `/login`.
- `exchangeCodeForSession(code)`.
- Si `next` es `/restablecer`, va ahí. Si no, lee `profiles.role` con el cliente de servidor y redirige a `portalByRole[role]`.
- `next` solo se acepta si empieza con `/` y no con `//`. Si no, se ignora.

- [ ] **Step 2: Proxy**

Refresca la sesión con `@supabase/ssr`. Matcher excluye estáticos.

- Sin sesión y ruta bajo `/portal`, redirige a `/login`.
- Con sesión y ruta `/login` o `/register`, no decide el portal aquí. Esa decisión queda en la action de login, que ya consultó el rol.

- [ ] **Step 3: Commit**

```bash
git add src/app/auth/callback/route.ts src/proxy.ts
git commit -m "Refresh the Supabase session and finish the email callback."
```

---

### Task 9: Registro de empresario

**Files:**
- Create: `src/app/auth/actions.ts`
- Modify: `src/components/landing/sections/register-form.tsx`

Campos que se quedan: nombre, cargo, empresa, sector, empleados, correo, WhatsApp, fuente, aceptación del aviso y del uso de datos.

Campos nuevos: contraseña y confirmación, debajo del correo.

- [ ] **Step 1: Server action `signUpEmpresario`**

Orden:

1. Validar Turnstile con `TURNSTILE_SECRET_KEY`. Si falla, error genérico.
2. Validar campos con las mismas reglas de `validate` en el formulario, más la contraseña.
3. Normalizar WhatsApp a dígitos y el correo a minúsculas.
4. `register_attempt('signup', hash, 5, '1 hour')`. Si es false, responder como si el correo se hubiera enviado.
5. `supabase.auth.signUp` con el cliente anon de servidor, no el service role:

```ts
await supabase.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: `${origin}/auth/callback`,
    data: {
      full_name: name,
      job_title: jobTitle,
      legal_name: company,
      sector,
      employee_band: band,
      whatsapp,
      referral_source: source,
    },
  },
});
```

No mandar `role` en `data`. Aunque alguien lo agregue, el trigger lo ignora.

6. La respuesta siempre es la misma: ir a `/verificar?email=` con el correo. No decir si ya estaba registrado.

- [ ] **Step 2: Formulario**

Agregar los dos campos de contraseña en `register-form.tsx`, en las variantes `page` y `band`. `autoComplete="new-password"`. El submit llama la action y, si no hay error de validación, navega a `/verificar`. El estado local "Tu lugar quedó solicitado" se reemplaza por esa navegación: la cuenta no queda activa hasta confirmar el correo.

- [ ] **Step 3: Probar a mano**

1. Registrar un empresario.
2. En SQL, `profiles.role` es `empresario` y existe una fila en `companies`.
3. Repetir el registro mandando `role: superadmin` en el body. El rol guardado sigue siendo `empresario`.
4. El correo de confirmación llega desde el SMTP propio.

- [ ] **Step 4: Commit**

```bash
git add src/app/auth/actions.ts src/components/landing/sections/register-form.tsx
git commit -m "Register empresarios with a confirmed password and email."
```

---

### Task 10: Login único y portales

**Files:**
- Modify: `src/components/auth/login-form.tsx`
- Modify: `src/app/auth/actions.ts`
- Create: `src/app/portal/layout.tsx`
- Create: `src/app/portal/empresa/page.tsx`
- Create: `src/app/portal/organismo/page.tsx`
- Create: `src/app/portal/gobierno/page.tsx`
- Create: `src/app/portal/admin/page.tsx`

- [ ] **Step 1: Action `signIn`**

1. Turnstile y rate limit.
2. `signInWithPassword`.
3. Si el correo no está confirmado, responder "Confirma tu correo antes de entrar" y no crear sesión usable.
4. Si las credenciales fallan, "Correo o contraseña incorrectos." No distinguir cuál falló.
5. Leer `profiles.role` con el cliente de servidor. Redirigir a `portalByRole[role]`.

- [ ] **Step 2: Layout de portal**

`src/app/portal/layout.tsx` es servidor. Sin sesión, `redirect("/login")`. Lee el rol. Si la ruta no corresponde al rol, `redirect(portalByRole[role])`. Un empresario que abre `/portal/admin` vuelve a `/portal/empresa`.

Cada página de portal, en esta versión, muestra el nombre y el rol. Organismo, gobierno y admin no muestran empresas.

- [ ] **Step 3: Probar los cuatro destinos**

Crear un usuario de cada rol (organismo, gobierno y superadmin con el procedimiento de la Task 12 y el seed SQL). Entrar por `/login` con cada uno y confirmar el destino. Entrar a un portal ajeno y confirmar el regreso al propio.

- [ ] **Step 4: Commit**

```bash
git add src/components/auth/login-form.tsx src/app/auth/actions.ts src/app/portal
git commit -m "Send each role to its own portal after a shared login."
```

---

### Task 11: Confirmación de correo, recuperación y nueva contraseña

**Files:**
- Modify: `src/app/verificar/page.tsx`
- Modify: `src/components/auth/recover-form.tsx`
- Modify: `src/components/auth/reset-form.tsx`
- Modify: `src/app/auth/actions.ts`

Pantallas que ya existen y quedan conectadas:

| Ruta | Qué hace |
| --- | --- |
| `/verificar` | Aviso de que hay que abrir el correo. Botón para reenviar. Si llega `?confirmed=1`, enlace a `/login`. |
| `/recuperar` | Pide el correo. Siempre responde "Si ese correo está registrado, enviaremos un enlace". |
| `/restablecer` | Solo funciona con la sesión de recuperación que dejó el callback. Pide contraseña y confirmación. |

- [ ] **Step 1: Reenvío**

`resendConfirmation` usa `auth.resend({ type: 'signup', email })`, con Turnstile y el límite `resend`. La página no dice si el correo existía.

- [ ] **Step 2: Recuperar**

`resetPasswordForEmail(email, { redirectTo: origin + '/auth/callback?next=/restablecer' })`.

- [ ] **Step 3: Restablecer**

La página de servidor revisa que haya sesión de recuperación. Si no hay, muestra el enlace a `/recuperar` y no el formulario. La action `updatePassword` llama `auth.updateUser({ password })` después de validar los 12 caracteres y la confirmación.

- [ ] **Step 4: Probar el ciclo**

Registrar, abrir el correo, confirmar, entrar. Pedir recuperación, abrir el enlace, cambiar la contraseña, entrar con la nueva y fallar con la anterior.

- [ ] **Step 5: Commit**

```bash
git add src/app/verificar/page.tsx src/components/auth/recover-form.tsx src/components/auth/reset-form.tsx src/app/auth/actions.ts
git commit -m "Confirm email and reset passwords through Supabase."
```

---

### Task 12: Perfil del empresario y de la empresa

**Files:**
- Create: `src/app/portal/empresa/perfil/page.tsx`
- Create: `src/app/portal/empresa/actions.ts`

- [ ] **Step 1: Leer con el cliente de servidor**

La página carga `profiles` y `companies` del usuario. RLS ya impide ver otra empresa. Campos editables de la persona: nombre, cargo, WhatsApp. Campos editables de la empresa: razón social, sector, rango de empleados, fuente. Correo y rol se muestran y no se editan aquí. El correo se cambia después, con un flujo aparte de confirmación, no en esta versión.

- [ ] **Step 2: Actions de actualización**

`updateEmpresarioProfile` y `updateCompanyProfile` validan en el servidor y hacen `update` con el cliente de sesión, no con el service role. No incluyen `role` ni `owner_id` en el payload. Un `update` que intente mandarlos falla por el grant de columnas.

- [ ] **Step 3: Probar**

El empresario guarda su nombre y el sector. Otro usuario, con su propia sesión, no puede actualizar esa empresa: la prueba de la Task 6 ya lo cubre; repetir una vez desde la UI.

- [ ] **Step 4: Commit**

```bash
git add src/app/portal/empresa
git commit -m "Let an empresario edit their own profile and company."
```

---

### Task 13: Superadmin invita organismo y gobierno

**Files:**
- Create: `src/app/portal/admin/actions.ts`
- Modify: `src/app/portal/admin/page.tsx`
- Create: `supabase/seed.sql`

- [ ] **Step 1: Sembrar el primer superadmin**

Después de crear ese usuario en el dashboard de Auth, con correo confirmado:

```sql
update public.profiles
set role = 'superadmin',
    organization_id = null,
    company_id = null
where id = 'UUID-DEL-USUARIO';
```

Ese update usa la conexión de postgres del dashboard, no la API. La app no tiene una action que asigne `superadmin`.

- [ ] **Step 2: Action `inviteStaff`**

Solo corre si `current_role()` es `superadmin`. Si no, `notFound()`.

Acepta `email`, `fullName`, `jobTitle`, `organizationName` y `role` donde `role` es solo `'organismo' | 'gobierno'`. El tipo de TypeScript no incluye `superadmin` ni `empresario`.

1. Crea o reutiliza `organizations` con el service role, `kind` igual al rol.
2. `auth.admin.inviteUserByEmail(email, { redirectTo, data: { full_name, job_title }, app_metadata: { role, organization_id } })`.
3. El trigger ve `app_metadata.role` y crea el perfil con ese rol, no como empresario.

- [ ] **Step 3: Suspender**

`disableStaff` llama `auth.admin.updateUserById(id, { ban_duration: '876000h' })`. No borra el perfil ni la organización. No puede usarse sobre un `superadmin`.

- [ ] **Step 4: Probar**

Invitar un organismo. El correo de invitación lleva a definir contraseña. Al entrar, cae en `/portal/organismo`. Confirmar en SQL que no puede leer `companies`. Intentar, desde el formulario, mandar `role=superadmin`: la action lo rechaza antes de llamar a Auth.

- [ ] **Step 5: Commit**

```bash
git add src/app/portal/admin supabase/seed.sql
git commit -m "Let the superadmin invite organismo and gobierno users."
```

---

### Task 14: Cierre de seguridad antes de producción

- [ ] **Step 1: Revisar esta lista y no pasar a producción con un no**

- El anon key es el único secreto en el navegador. El service role no aparece en el bundle. Buscar `SUPABASE_SERVICE_ROLE_KEY` en `src` y confirmar que solo lo importan módulos con `server-only`.
- RLS está activo en `profiles`, `companies`, `organizations` y `auth_attempts`.
- No hay política de insert para `authenticated` en perfiles ni empresas.
- Redirect URLs no usan `*`.
- Confirm email sigue encendido.
- SMTP propio envía confirmación, invitación y recuperación.
- Turnstile está en registro, login, recuperar y reenviar.
- Los mensajes de registro y recuperación no revelan si el correo existe.
- Un empresario no lee otra empresa. Organismo y gobierno no leen empresas.
- El rol no cambia con `updateUser` ni con un update directo del perfil.
- `.env.local` no está en git.

- [ ] **Step 2: Aplicar migraciones al proyecto Pro**

Run: `npx supabase link` y `npx supabase db push`

Expected: las cuatro migraciones quedan aplicadas. El seed del superadmin se corre aparte, a mano.

## Self-review

- Registro público solo de empresario: Task 3 y Task 9.
- Contraseña y confirmación: Task 7 y Task 9. Recuperación: Task 11.
- Confirmación de correo: Task 1 y Task 11.
- Mismo login, portales distintos: Task 10.
- Organismo y gobierno los crea el superadmin: Task 13. Superadmin no se crea desde la app.
- Perfil de empresario y empresa: Task 12.
- RLS, rate limit, Turnstile, SMTP: Tasks 1, 4, 5, 6 y 14.
- Organismo y gobierno no ven datos de empresa: Task 4.
