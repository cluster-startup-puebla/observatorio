# Logo de empresa el día del evento Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** El empresario puede subir el logo de su empresa en el onboarding y marcar «Mostrar mi logo el día del evento»; el superadmin lo ve en la sesión vigente y en el detalle de la empresa.

**Architecture:** El archivo vive en Storage (`company-logos/{profile_id}/logo.ext`) y la ficha en `media_assets` con propósito `company_logo`. El permiso de mostrarlo es `companies.show_logo_on_event`. El check sin archivo no deja terminar. Si el archivo falla y el check está prendido, el perfil no se marca como terminado. La pestaña Logos lista a quien tenga el check y la ficha; no filtra por sesión porque el contacto del enlace todavía no guarda `session_id`.

**Tech Stack:** Next.js 16 App Router, Supabase Postgres + Storage, vitest. Archivos `.ts`/`.tsx` de menos de 90 líneas.

---

## Fuera de este plan

- Editar el logo después de terminar el perfil.
- Mostrar logos en la landing pública.
- Amarrar el logo a una sesión concreta.
- Emitir el pase QR.

## Mapa de archivos

- Crear: `supabase/migrations/20261023180000_company_logo_enum.sql`
- Crear: `supabase/migrations/20261023180100_company_logo_storage.sql`
- Crear: `src/lib/onboarding/company-logo.ts`
- Crear: `src/lib/onboarding/company-logo.test.ts`
- Crear: `src/lib/onboarding/save-company-logo.ts`
- Crear: `src/components/onboarding/company-logo-fields.tsx`
- Crear: `src/lib/admin/empresas/event-logos.ts`
- Crear: `src/lib/admin/empresas/event-logos.test.ts`
- Crear: `src/lib/admin/empresas/load-event-logos.ts`
- Crear: `src/app/admin/sesiones/[id]/logos-tab.tsx`
- Crear: `src/app/api/admin/empresas/[id]/logo/route.ts`
- Modificar: `src/lib/storage-assets.ts`
- Modificar: `src/lib/admin/medios/target.ts`
- Modificar: `src/lib/admin/medios/purpose-label.ts`
- Modificar: `src/lib/onboarding/empresario-steps.ts`
- Modificar: `src/lib/onboarding/empresario-draft.ts`
- Modificar: `src/lib/onboarding/empresario-draft.test.ts`
- Modificar: `src/components/onboarding/empresario-step-company.tsx`
- Modificar: `src/lib/onboarding/save-empresario.ts`
- Modificar: `src/lib/onboarding/complete-empresario.ts`
- Modificar: `src/lib/admin/empresas/detail.ts`
- Modificar: `src/app/admin/empresas/[id]/page.tsx`
- Modificar: `src/app/admin/sesiones/[id]/page.tsx`

---

### Task 1: Regla del check y del paso

**Files:**
- Modify: `src/lib/onboarding/empresario-steps.ts`
- Modify: `src/lib/onboarding/empresario-draft.ts`
- Modify: `src/lib/onboarding/empresario-draft.test.ts`
- Test: `src/lib/onboarding/empresario-draft.test.ts`

- [ ] **Step 1: Escribir el test que falla**

En `src/lib/onboarding/empresario-draft.test.ts`, agregar al objeto `valid` las claves `showLogo: false` y `hasLogo: false`. El ciclo que arma el `FormData` solo debe copiar strings, porque esas dos claves son booleanos:

```ts
for (const [key, value] of Object.entries(valid)) {
  if (typeof value === "string") form.set(key, value);
}
```

Agregar este caso:

```ts
it("el check del logo exige un archivo", () => {
  expect(stepReady(1, { ...valid, showLogo: true, hasLogo: false })).toBe(false);
  expect(stepReady(1, { ...valid, showLogo: true, hasLogo: true })).toBe(true);
  expect(stepReady(1, { ...valid, showLogo: false, hasLogo: false })).toBe(true);
});
```

- [ ] **Step 2: Correr el test y verlo fallar**

Run: `npx vitest run src/lib/onboarding/empresario-draft.test.ts`

Expected: FAIL porque `EmpresarioValues` no tiene `showLogo` ni `hasLogo`.

- [ ] **Step 3: Implementar la regla**

En `EmpresarioValues` y en `emptyEmpresarioValues` agregar:

```ts
showLogo: boolean;
hasLogo: boolean;
```

`emptyEmpresarioValues` los deja en `false`.

En el `if (step === 1)` de `stepReady`, conservar las condiciones actuales y agregar:

```ts
(!values.showLogo || values.hasLogo)
```

- [ ] **Step 4: Correr el test**

Run: `npx vitest run src/lib/onboarding/empresario-draft.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/onboarding/empresario-steps.ts src/lib/onboarding/empresario-draft.test.ts
git commit -m "$(cat <<'EOF'
feat: el check del logo de empresa exige un archivo

EOF
)"
```

---

### Task 2: Ruta del archivo y decisión de subida

**Files:**
- Create: `src/lib/onboarding/company-logo.ts`
- Create: `src/lib/onboarding/company-logo.test.ts`
- Modify: `src/lib/storage-assets.ts`

- [ ] **Step 1: Escribir el test que falla**

Crear `src/lib/onboarding/company-logo.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { companyLogoObjectPath } from "@/lib/storage-assets";
import { logoUploadDecision } from "./company-logo";

const id = "11111111-1111-4111-8111-111111111111";

describe("logo de empresa", () => {
  it("arma la ruta png, jpg o webp del perfil", () => {
    expect(companyLogoObjectPath(id, "image/png")).toBe(`${id}/logo.png`);
    expect(companyLogoObjectPath(id, "image/jpeg")).toBe(`${id}/logo.jpg`);
    expect(companyLogoObjectPath(id, "image/webp")).toBe(`${id}/logo.webp`);
    expect(() => companyLogoObjectPath(id, "image/gif")).toThrow("tipo de imagen no permitido");
  });

  it("sin check y sin archivo no sube", () => {
    expect(logoUploadDecision({ show: false, hasFile: false })).toEqual({ action: "skip" });
  });

  it("el check sin archivo se rechaza", () => {
    expect(logoUploadDecision({ show: true, hasFile: false })).toEqual({ action: "reject" });
  });

  it("con archivo sube y el check decide si se muestra", () => {
    expect(logoUploadDecision({ show: true, hasFile: true })).toEqual({ action: "store", show: true });
    expect(logoUploadDecision({ show: false, hasFile: true })).toEqual({ action: "store", show: false });
  });
});
```

- [ ] **Step 2: Correr el test y verlo fallar**

Run: `npx vitest run src/lib/onboarding/company-logo.test.ts`

Expected: FAIL con módulo no encontrado.

- [ ] **Step 3: Implementar**

En `src/lib/storage-assets.ts`, reutilizar `logoExt` y agregar:

```ts
export function companyLogoObjectPath(profileId: string, contentType: string) {
  const ext = logoExt[contentType];
  if (!ext) throw new Error("tipo de imagen no permitido");
  return `${profileId}/logo.${ext}`;
}
```

Crear `src/lib/onboarding/company-logo.ts`:

```ts
export function logoUploadDecision(input: { show: boolean; hasFile: boolean }) {
  if (!input.hasFile) return input.show ? { action: "reject" as const } : { action: "skip" as const };
  return { action: "store" as const, show: input.show };
}
```

- [ ] **Step 4: Correr el test**

Run: `npx vitest run src/lib/onboarding/company-logo.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/storage-assets.ts src/lib/onboarding/company-logo.ts src/lib/onboarding/company-logo.test.ts
git commit -m "$(cat <<'EOF'
feat: la ruta del logo de empresa sale del perfil

EOF
)"
```

---

### Task 3: Enum en la base

**Files:**
- Create: `supabase/migrations/20261023180000_company_logo_enum.sql`

El valor nuevo de un enum no se puede usar en la misma transacción en la que se agrega. Por eso va en un archivo solo.

- [ ] **Step 1: Escribir la migración**

```sql
alter type public.media_purpose add value if not exists 'company_logo';
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/20261023180000_company_logo_enum.sql
git commit -m "$(cat <<'EOF'
feat: el catálogo de medios acepta el logo de empresa

EOF
)"
```

---

### Task 4: Bucket, ficha, columna y políticas

**Files:**
- Create: `supabase/migrations/20261023180100_company_logo_storage.sql`

Aplicar este archivo después de que la migración del enum ya esté commiteada en la base. En local, `supabase db reset` corre las dos en orden y cada archivo es su transacción.

- [ ] **Step 1: Escribir la migración**

```sql
alter table public.companies
  add column show_logo_on_event boolean not null default false;

comment on column public.companies.show_logo_on_event is
  'La empresa aceptó mostrar su logo el día del evento. El archivo está en media_assets company_logo.';

alter table public.media_assets
  drop constraint media_bucket_matches_purpose;

alter table public.media_assets
  add constraint media_bucket_matches_purpose check (
    (
      purpose = 'organization_logo'
      and bucket_id = 'organization-logos'
      and organization_id is not null
      and profile_id is null
      and content_block_slug is null
      and object_path in (
        organization_id::text || '/logo.png',
        organization_id::text || '/logo.jpg',
        organization_id::text || '/logo.jpeg',
        organization_id::text || '/logo.webp'
      )
      and content_type in ('image/png', 'image/jpeg', 'image/webp')
      and byte_size <= 2097152
    )
    or (
      purpose = 'pass_qr'
      and bucket_id = 'pass-images'
      and profile_id is not null
      and organization_id is null
      and content_block_slug is null
      and object_path = profile_id::text || '/pass.png'
      and content_type = 'image/png'
      and byte_size <= 524288
    )
    or (
      purpose = 'content_image'
      and bucket_id = 'content-images'
      and content_block_slug is not null
      and organization_id is null
      and profile_id is null
      and object_path like content_block_slug || '/%'
      and content_type in ('image/png', 'image/jpeg', 'image/webp')
      and byte_size <= 4194304
    )
    or (
      purpose = 'company_logo'
      and bucket_id = 'company-logos'
      and profile_id is not null
      and organization_id is null
      and content_block_slug is null
      and object_path in (
        profile_id::text || '/logo.png',
        profile_id::text || '/logo.jpg',
        profile_id::text || '/logo.webp'
      )
      and content_type in ('image/png', 'image/jpeg', 'image/webp')
      and byte_size <= 2097152
    )
  );

create unique index media_one_company_logo_per_profile_idx
  on public.media_assets (profile_id)
  where purpose = 'company_logo';

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'company-logos',
  'company-logos',
  false,
  2097152,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create or replace function public.company_logo_is_public(object_name text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.companies c
    join public.media_assets m on m.profile_id = c.profile_id
    where c.profile_id::text = split_part(object_name, '/', 1)
      and c.show_logo_on_event
      and m.purpose = 'company_logo'
      and m.object_path = object_name
  );
$$;

revoke all on function public.company_logo_is_public(text) from public;
grant execute on function public.company_logo_is_public(text) to anon, authenticated;

create policy storage_company_logo_owner_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'company-logos'
    and (storage.foldername(name))[1] = auth.uid()::text
    and private.current_role() = 'empresario'
  );

create policy storage_company_logo_owner_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'company-logos'
    and (storage.foldername(name))[1] = auth.uid()::text
    and private.current_role() = 'empresario'
  );

create policy storage_company_logo_owner_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'company-logos'
    and (storage.foldername(name))[1] = auth.uid()::text
    and private.current_role() = 'empresario'
  )
  with check (
    bucket_id = 'company-logos'
    and (storage.foldername(name))[1] = auth.uid()::text
    and private.current_role() = 'empresario'
  );

create policy storage_company_logo_superadmin_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'company-logos'
    and private.is_superadmin()
  );

create policy storage_company_logo_public_read on storage.objects
  for select to anon, authenticated
  using (
    bucket_id = 'company-logos'
    and public.company_logo_is_public(name)
  );

drop policy media_insert on public.media_assets;
create policy media_insert on public.media_assets
  for insert to authenticated
  with check (
    (select private.is_superadmin())
    or (
      purpose = 'organization_logo'
      and uploaded_by = (select auth.uid())
      and organization_id = (select private.current_organization_id())
      and (select private.current_role()) = 'director'
    )
    or (
      purpose = 'pass_qr'
      and profile_id = (select auth.uid())
      and uploaded_by = (select auth.uid())
      and exists (
        select 1
        from public.profiles
        where profiles.id = (select auth.uid())
          and profiles.onboarded_at is not null
      )
    )
    or (
      purpose = 'company_logo'
      and profile_id = (select auth.uid())
      and uploaded_by = (select auth.uid())
      and (select private.current_role()) = 'empresario'
    )
  );

drop policy media_update on public.media_assets;
create policy media_update on public.media_assets
  for update to authenticated
  using (
    (select private.is_superadmin())
    or (
      purpose = 'organization_logo'
      and organization_id = (select private.current_organization_id())
      and (select private.current_role()) = 'director'
    )
    or (
      purpose = 'company_logo'
      and profile_id = (select auth.uid())
      and (select private.current_role()) = 'empresario'
    )
  )
  with check (
    (select private.is_superadmin())
    or (
      purpose = 'organization_logo'
      and organization_id = (select private.current_organization_id())
      and (select private.current_role()) = 'director'
    )
    or (
      purpose = 'company_logo'
      and profile_id = (select auth.uid())
      and (select private.current_role()) = 'empresario'
    )
  );
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/20261023180100_company_logo_storage.sql
git commit -m "$(cat <<'EOF'
feat: el logo de empresa se guarda aparte y solo se publica con el check

EOF
)"
```

---

### Task 5: Catálogo de medios

**Files:**
- Modify: `src/lib/admin/medios/target.ts`
- Modify: `src/lib/admin/medios/purpose-label.ts`
- Modify: `src/lib/admin/medios/list.test.ts`

- [ ] **Step 1: Escribir el test que falla**

En `src/lib/admin/medios/list.test.ts` agregar:

```ts
it("el logo de empresa va a company-logos y pesa hasta 2 MB", () => {
  const id = "11111111-1111-4111-8111-111111111111";
  expect(mediaTarget({ purpose: "company_logo", profileId: id, contentType: "image/png" })).toEqual({
    bucket: "company-logos",
    path: `${id}/logo.png`,
  });
  expect(mediaByteLimit("company_logo")).toBe(2_097_152);
});
```

- [ ] **Step 2: Correr el test y verlo fallar**

Run: `npx vitest run src/lib/admin/medios/list.test.ts`

Expected: FAIL porque `company_logo` no está en `limits`.

- [ ] **Step 3: Implementar**

En `limits` de `target.ts` agregar `company_logo: 2_097_152`.

En `mediaTarget`, antes del `throw` final de contenido:

```ts
if (input.purpose === "company_logo") {
  if (!input.profileId) throw new Error("falta el perfil");
  return { bucket: "company-logos", path: companyLogoObjectPath(input.profileId, input.contentType) };
}
```

Importar `companyLogoObjectPath` desde `@/lib/storage-assets`.

En `purpose-label.ts`:

```ts
company_logo: "Logo de empresa",
```

- [ ] **Step 4: Correr el test**

Run: `npx vitest run src/lib/admin/medios/list.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/admin/medios/target.ts src/lib/admin/medios/purpose-label.ts src/lib/admin/medios/list.test.ts
git commit -m "$(cat <<'EOF'
feat: el catálogo de medios conoce el logo de empresa

EOF
)"
```

---

### Task 6: Campos en el paso de empresa

**Files:**
- Create: `src/components/onboarding/company-logo-fields.tsx`
- Modify: `src/components/onboarding/empresario-step-company.tsx`

El paso ya tiene 76 líneas. El archivo y el check van en un componente propio para no pasar de 90.

- [ ] **Step 1: Crear el componente**

`src/components/onboarding/company-logo-fields.tsx`:

```tsx
"use client";

import { FileDrop } from "@/components/file-drop";

export function CompanyLogoFields({
  showLogo,
  onShow,
  onFile,
}: {
  showLogo: boolean;
  onShow: (showLogo: boolean) => void;
  onFile: (hasLogo: boolean) => void;
}) {
  return (
    <div className="grid gap-3">
      <FileDrop
        id="company-logo"
        name="logo"
        label="Logo de la empresa"
        accept="image/png,image/jpeg,image/webp"
        hint="PNG, JPG o WEBP · hasta 2 MB. Opcional."
        preview
        onChosen={(file) => onFile(Boolean(file))}
      />
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

`FileDrop` hoy no avisa al padre. Agregar la prop opcional sin cambiar el resto:

```tsx
onChosen?: (file: File | null) => void;
```

Llamarla al final de `choose`:

```tsx
onChosen?.(next);
```

- [ ] **Step 2: Conectarlo al paso**

En `CompanyStepValues` agregar `showLogo: boolean` y `hasLogo: boolean`.

En `EmpresarioStepCompany`, debajo del nombre de la empresa:

```tsx
<CompanyLogoFields
  showLogo={values.showLogo}
  onShow={(showLogo) => onChange({ showLogo })}
  onFile={(hasLogo) => onChange({ hasLogo })}
/>
```

El paso de empresa ya se oculta con `hidden` y no se desmonta (`empresario-form.tsx`). El `input` del archivo sigue dentro del `form` cuando se envía el paso 3. No lo desmontes.

`empresario-step-company.tsx` queda en 84 líneas con el import, las dos claves del tipo y el componente.

- [ ] **Step 3: Revisar tipos**

Run: `npx tsc --noEmit --pretty false`

Expected: sin error en estos archivos. `emptyEmpresarioValues` ya llena `showLogo` y `hasLogo` desde la Task 1.

- [ ] **Step 4: Commit**

```bash
git add src/components/file-drop.tsx src/components/onboarding/company-logo-fields.tsx src/components/onboarding/empresario-step-company.tsx
git commit -m "$(cat <<'EOF'
feat: el empresario adjunta su logo y elige si se muestra

EOF
)"
```

---

### Task 7: Guardar el archivo antes de cerrar el perfil

**Files:**
- Create: `src/lib/onboarding/save-company-logo.ts`
- Modify: `src/lib/onboarding/save-empresario.ts`
- Modify: `src/lib/onboarding/complete-empresario.ts`

El perfil no se marca `onboarded_at` si el check está prendido y la subida falla. Sin check, un archivo inválido se ignora y el perfil sí termina.

- [ ] **Step 1: Subir el logo**

Crear `src/lib/onboarding/save-company-logo.ts`:

```ts
import "server-only";

import { readLogoFile } from "@/lib/admin/organismos/logo-file";
import { companyLogoObjectPath } from "@/lib/storage-assets";
import { createSupabaseWithAccess } from "@/lib/supabase/auth-session";
import { logoUploadDecision } from "./company-logo";

export async function saveCompanyLogo(input: {
  accessToken: string;
  profileId: string;
  file: FormDataEntryValue | null;
  show: boolean;
}) {
  const hasFile = input.file instanceof File && input.file.size > 0;
  const decision = logoUploadDecision({ show: input.show, hasFile });
  if (decision.action === "skip") return { ok: true as const, show: false };
  if (decision.action === "reject") return { ok: false as const, reason: "logo" as const };

  const logo = await readLogoFile(input.file);
  if (!logo || "error" in logo) {
    return decision.show ? { ok: false as const, reason: "logo" as const } : { ok: true as const, show: false };
  }

  const path = companyLogoObjectPath(input.profileId, logo.contentType);
  const db = createSupabaseWithAccess(input.accessToken);
  const uploaded = await db.storage.from("company-logos").upload(path, logo.bytes, {
    upsert: true,
    contentType: logo.contentType,
  });
  if (uploaded.error) {
    return decision.show ? { ok: false as const, reason: "logo" as const } : { ok: true as const, show: false };
  }

  const row = {
    purpose: "company_logo" as const,
    bucket_id: "company-logos",
    object_path: path,
    content_type: logo.contentType,
    byte_size: logo.bytes.byteLength,
    profile_id: input.profileId,
    uploaded_by: input.profileId,
  };
  const existing = await db
    .from("media_assets")
    .select("id")
    .eq("profile_id", input.profileId)
    .eq("purpose", "company_logo")
    .maybeSingle();
  const saved = existing.data
    ? await db.from("media_assets").update(row).eq("id", existing.data.id)
    : await db.from("media_assets").insert(row);
  if (saved.error) {
    return decision.show ? { ok: false as const, reason: "logo" as const } : { ok: true as const, show: false };
  }
  return { ok: true as const, show: decision.show };
}
```

Si este archivo pasa de 90 líneas, partir la escritura de `media_assets` en `src/lib/onboarding/write-company-logo-row.ts`.

- [ ] **Step 2: Pasar el check al upsert**

En `saveEmpresarioProfile` agregar el argumento `showLogo: boolean` y en el objeto del upsert:

```ts
show_logo_on_event: showLogo,
```

- [ ] **Step 3: Llamarlo antes de cerrar el perfil**

En `finishInSupabase`, antes de `saveEmpresarioProfile`:

```ts
const logo = await saveCompanyLogo({
  accessToken: access!,
  profileId: session!.id,
  file: formFile,
  show: showLogo,
});
if (!logo.ok) back("logo", profile, token);
```

`finishInSupabase` recibe `formFile` y `showLogo` desde `completeEmpresarioAction`:

```ts
const showLogo = formData.get("showLogo") === "1";
const formFile = formData.get("logo");
```

Pasar `logo.show` como `showLogo` a `saveEmpresarioProfile`.

En `finishInMemory` no hay Storage. Ignorar el archivo y guardar el perfil como hoy, sin el check.

- [ ] **Step 4: Compilar**

Run: `npx tsc --noEmit --pretty false`

Expected: sin error en `src/lib/onboarding`.

- [ ] **Step 5: Commit**

```bash
git add src/lib/onboarding/save-company-logo.ts src/lib/onboarding/save-empresario.ts src/lib/onboarding/complete-empresario.ts
git commit -m "$(cat <<'EOF'
feat: el perfil guarda el logo antes de darse por terminado

EOF
)"
```

---

### Task 8: Quién aparece el día del evento

**Files:**
- Create: `src/lib/admin/empresas/event-logos.ts`
- Create: `src/lib/admin/empresas/event-logos.test.ts`
- Create: `src/lib/admin/empresas/load-event-logos.ts`
- Create: `src/app/admin/sesiones/[id]/logos-tab.tsx`
- Modify: `src/app/admin/sesiones/[id]/page.tsx`

La lista no usa `session_id`. Muestra toda empresa con el check y con ficha `company_logo`.

- [ ] **Step 1: Escribir el test que falla**

`src/lib/admin/empresas/event-logos.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { visibleEventLogos } from "./event-logos";

describe("logos del día", () => {
  it("deja fuera a quien no marcó el check o no tiene archivo", () => {
    const rows = visibleEventLogos(
      [
        { id: "c1", legalName: "Norte", profileId: "p1", show: true },
        { id: "c2", legalName: "Sur", profileId: "p2", show: false },
        { id: "c3", legalName: "Centro", profileId: "p3", show: true },
      ],
      [{ profileId: "p1" }],
    );
    expect(rows).toEqual([{ companyId: "c1", name: "Norte", profileId: "p1" }]);
  });
});
```

- [ ] **Step 2: Correr el test y verlo fallar**

Run: `npx vitest run src/lib/admin/empresas/event-logos.test.ts`

Expected: FAIL con módulo no encontrado.

- [ ] **Step 3: Implementar el filtro y la lectura**

`src/lib/admin/empresas/event-logos.ts`:

```ts
export type EventLogo = { companyId: string; name: string; profileId: string };

export function visibleEventLogos(
  companies: { id: string; legalName: string; profileId: string; show: boolean }[],
  assets: { profileId: string }[],
): EventLogo[] {
  const ready = new Set(assets.map((asset) => asset.profileId));
  return companies
    .filter((company) => company.show && ready.has(company.profileId))
    .map((company) => ({ companyId: company.id, name: company.legalName, profileId: company.profileId }));
}
```

`src/lib/admin/empresas/load-event-logos.ts`:

```ts
import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { visibleEventLogos } from "./event-logos";

export async function loadEventLogos() {
  const db = await adminDb();
  if (!db) return [];
  const companies = await db.from("companies").select("id, legal_name, profile_id, show_logo_on_event");
  if (companies.error) throw new Error(companies.error.message);
  const ids = (companies.data ?? []).map((row) => row.profile_id);
  const assets = ids.length
    ? await db.from("media_assets").select("profile_id").eq("purpose", "company_logo").in("profile_id", ids)
    : { data: [], error: null };
  if (assets.error) throw new Error(assets.error.message);
  return visibleEventLogos(
    (companies.data ?? []).map((row) => ({
      id: row.id,
      legalName: row.legal_name,
      profileId: row.profile_id,
      show: row.show_logo_on_event,
    })),
    (assets.data ?? []).map((row) => ({ profileId: row.profile_id })),
  );
}
```

`src/app/admin/sesiones/[id]/logos-tab.tsx` carga sola, para que `page.tsx` (71 líneas) solo sume el tab y una línea:

```tsx
import { loadEventLogos } from "@/lib/admin/empresas/load-event-logos";

export async function LogosTab() {
  const logos = await loadEventLogos();
  if (logos.length === 0) return <p className="text-small text-ink-muted">Nadie pidió mostrar su logo.</p>;
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {logos.map((logo) => (
        <li key={logo.companyId} className="grid gap-2 rounded-lg border border-line p-3">
          <img
            src={`/api/admin/empresas/${logo.companyId}/logo`}
            alt=""
            className="h-16 w-auto object-contain"
          />
          <p className="text-small text-ink">{logo.name}</p>
        </li>
      ))}
    </ul>
  );
}
```

En `src/app/admin/sesiones/[id]/page.tsx` agregar el tab `{ value: "logos", label: "Logos" }` y `{active === "logos" ? <LogosTab /> : null}`.

- [ ] **Step 4: Correr el test**

Run: `npx vitest run src/lib/admin/empresas/event-logos.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/admin/empresas/event-logos.ts src/lib/admin/empresas/event-logos.test.ts src/lib/admin/empresas/load-event-logos.ts src/app/admin/sesiones/[id]/logos-tab.tsx src/app/admin/sesiones/[id]/page.tsx
git commit -m "$(cat <<'EOF'
feat: la sesión vigente lista los logos que pidieron mostrarse

EOF
)"
```

---

### Task 9: Servir el archivo al superadmin y mostrarlo en la empresa

**Files:**
- Create: `src/app/api/admin/empresas/[id]/logo/route.ts`
- Modify: `src/lib/admin/empresas/detail.ts`
- Modify: `src/app/admin/empresas/[id]/page.tsx`

- [ ] **Step 1: Ruta del archivo**

`src/app/api/admin/empresas/[id]/logo/route.ts`:

```ts
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import { adminDb } from "@/lib/admin/admin-db";

export const instant = false;

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  await requireSuperadmin();
  const { id } = await context.params;
  const db = await adminDb();
  if (!db) return new Response(null, { status: 404 });
  const company = await db
    .from("companies")
    .select("profile_id, show_logo_on_event")
    .eq("id", id)
    .maybeSingle();
  if (!company.data?.show_logo_on_event) return new Response(null, { status: 404 });
  const asset = await db
    .from("media_assets")
    .select("object_path, content_type")
    .eq("profile_id", company.data.profile_id)
    .eq("purpose", "company_logo")
    .maybeSingle();
  if (!asset.data?.object_path) return new Response(null, { status: 404 });
  const file = await db.storage.from("company-logos").download(asset.data.object_path);
  if (file.error || !file.data) return new Response(null, { status: 404 });
  return new Response(file.data, {
    headers: {
      "Content-Type": asset.data.content_type,
      "Cache-Control": "private, no-store",
    },
  });
}
```

Si pasa de 90 líneas, mover la lectura a `src/lib/admin/empresas/read-logo.ts`.

- [ ] **Step 2: Hecho en el detalle**

En el `select` de `loadEmpresa` agregar `show_logo_on_event`.

En `src/app/admin/empresas/[id]/page.tsx`, en `facts`:

```tsx
{ label: "Logo el día del evento", value: data.company.show_logo_on_event ? "Sí" : "No" },
```

Si el hecho es «Sí», debajo del `DetailFrame` no: dentro del children, un `img` con `src={/api/admin/empresas/${id}/logo}` y `alt=""`. El page tiene 50 líneas; cabe.

- [ ] **Step 3: Compilar**

Run: `npx tsc --noEmit --pretty false`

Expected: sin error.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/admin/empresas/[id]/logo/route.ts src/lib/admin/empresas/detail.ts src/app/admin/empresas/[id]/page.tsx
git commit -m "$(cat <<'EOF'
feat: el detalle de empresa muestra si el logo sale el día del evento

EOF
)"
```

---

### Task 10: Aplicar las migraciones en el proyecto remoto

**Files:** ninguna de aplicación. Las dos migraciones de las tareas 3 y 4.

- [ ] **Step 1: Aplicar primero el enum**

Con la herramienta de Supabase del proyecto `jnshenkmexsxiylpqhdh`, aplicar el SQL de `20261023180000_company_logo_enum.sql` y esperar a que termine antes del siguiente.

- [ ] **Step 2: Aplicar bucket, check y políticas**

Aplicar el SQL de `20261023180100_company_logo_storage.sql`.

- [ ] **Step 3: Comprobar la columna**

```sql
select column_name
from information_schema.columns
where table_schema = 'public'
  and table_name = 'companies'
  and column_name = 'show_logo_on_event';
```

Expected: una fila.

No hay commit: el SQL ya está en el repositorio.

---

## Verificación manual

1. Entrar como empresario nuevo y, en el paso de empresa, marcar el check sin archivo. Continuar no avanza.
2. Subir un PNG de menos de 2 MB, marcar el check y terminar. La pantalla dice que el pase quedó listo.
3. Entrar como superadmin a la sesión vigente, pestaña Logos. Aparece el logo y el nombre de la empresa.
4. Abrir `/admin/empresas/{id}`. El hecho «Logo el día del evento» dice Sí y la imagen carga.
5. Repetir con archivo y sin check. El perfil termina. La pestaña Logos no lo muestra. El hecho dice No.

## Consulta de quienes asistirán

Las empresas que terminaron el perfil (`profiles.onboarded_at` y rol `empresario`) salen en los GET que ya existían:

- `GET /api/admin/empresas?vista=asistentes` lista general.
- `GET /api/admin/empresas?vista=asistentes&sector={slug}` filtra por el slug del sector.
- `GET /api/admin/sesiones/{id}` incluye `attending` con la lista general.
- `GET /api/admin/sesiones/{id}?sector={slug}` filtra esa lista.

Cada fila trae `id`, `legalName`, `sectorSlug`, `sectorName`, `showLogo` y `logoUrl`. `logoUrl` solo viene si el check está prendido.
