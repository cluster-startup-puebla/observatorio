# Aprobar invitaciones por enlace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** El empresario termina todo el onboarding. Si llegó por enlace, la pantalla dice que el pase llegará por correo hasta que lo acepten; ya aceptado, ve el pase que ya existe.

**Architecture:** No hay estatus nuevo. El contacto `enlace` nace solo con el hecho `cargar`, así que su estatus es `cargado` y el organismo lo ve en Pendiente. Aceptar es la función `approve_link_signup`, que escribe `confirmar` y `registrar` en un paso. Rechazar reutiliza el hecho `rechazar`. Excel y alta manual siguen con Contactar. Los registros que ya están en `registrado` no se tocan. La pantalla del pase no usa un aviso en la URL: cada visita a `/onboarding` lee el estatus del enlace de ese correo.

**Tech Stack:** Next.js 16 App Router, Supabase Postgres, vitest. Archivos `.ts`/`.tsx` de menos de 90 líneas.

---

## Fuera de este plan

- El directorio en memoria (`src/lib/memory`). La app viva usa Supabase.
- Un estatus nuevo en el enum `crm_status`.
- Mover de columna a los contactos que ya están `registrado`.
- Emitir el pase QR. La pantalla aceptada sigue siendo `AccessPass`.
- Enviar el correo del pase. La pantalla pendiente solo lo anuncia.
- Cambiar la mesa: desde `cargado` el hecho `llegar` ya es inválido (`src/lib/admin/pases/scan.ts`).

## Mapa de archivos

- Crear: `src/lib/crm/link-acceptance.ts`
- Crear: `src/lib/crm/link-acceptance.test.ts`
- Crear: `supabase/migrations/20261023190000_link_signup_pending.sql`
- Crear: `supabase/migrations/20261023190100_approve_link_signup.sql`
- Crear: `src/components/organismo/pending-actions.tsx`
- Crear: `src/components/onboarding/pending-notice.tsx`
- Crear: `src/lib/onboarding/link-pass-state.ts`
- Crear: `src/lib/organismo/link-conversions.ts`
- Crear: `src/lib/organismo/link-conversions.test.ts`
- Crear: `src/lib/admin/empresas/pending-link-emails.ts`
- Modificar: `src/lib/directory.ts`
- Modificar: `src/lib/organismo/org-crm-rows.ts`
- Modificar: `src/lib/organismo/org-crm-rows.test.ts`
- Modificar: `src/lib/organismo/org-crm-read.ts`
- Modificar: `src/lib/memory/crm-person.ts`
- Modificar: `src/components/organismo/crm-cards.tsx`
- Modificar: `src/components/organismo/crm-table.tsx`
- Modificar: `src/lib/crm-actions.ts`
- Modificar: `src/lib/organismo/org-crm-write.ts`
- Modificar: `src/app/api/admin/crm/[id]/evento/route.ts`
- Modificar: `src/app/admin/crm/[id]/page.tsx`
- Modificar: `src/lib/organismo/load-supabase-home.ts`
- Modificar: `src/lib/admin/tablero/types.ts`
- Modificar: `src/lib/admin/tablero/snapshot.ts`
- Modificar: `src/lib/admin/tablero/snapshot.test.ts`
- Modificar: `src/app/admin/tablero/kpis.tsx`
- Modificar: `src/lib/admin/empresas/attending.ts`
- Modificar: `src/lib/admin/empresas/attending.test.ts`
- Modificar: `src/lib/admin/empresas/load-attending.ts`
- Modificar: `src/lib/admin/empresas/load-event-logos.ts`
- Modificar: `src/components/onboarding/onboarding-wizard.tsx`
- Modificar: `src/app/onboarding/supabase-screen.tsx`

---

### Task 1: Quién está pendiente y quién ya fue aceptado

**Files:**
- Create: `src/lib/crm/link-acceptance.ts`
- Create: `src/lib/crm/link-acceptance.test.ts`

Un contacto sin fila `enlace` no espera aprobación. `null` cuenta como aceptado para logos y asistencia. `cargado`, `contactado` y `no` no.

- [ ] **Step 1: Escribir el test que falla**

```ts
import { describe, expect, it } from "vitest";
import { isLinkAccepted, pendingInviteAction } from "./link-acceptance";

describe("aceptación del enlace", () => {
  it("solo confirmo, registrado y llego cuentan como aceptados", () => {
    expect(isLinkAccepted(null)).toBe(true);
    expect(isLinkAccepted("registrado")).toBe(true);
    expect(isLinkAccepted("confirmo")).toBe(true);
    expect(isLinkAccepted("llego")).toBe(true);
    expect(isLinkAccepted("cargado")).toBe(false);
    expect(isLinkAccepted("contactado")).toBe(false);
    expect(isLinkAccepted("no")).toBe(false);
  });

  it("el enlace pendiente se acepta y el manual se contacta", () => {
    expect(pendingInviteAction({ source: "enlace", status: "cargado" })).toBe("aceptar");
    expect(pendingInviteAction({ source: "manual", status: "cargado" })).toBe("contactar");
    expect(pendingInviteAction({ source: "excel", status: "cargado" })).toBe("contactar");
    expect(pendingInviteAction({ source: "enlace", status: "registrado" })).toBeNull();
  });
});
```

- [ ] **Step 2: Correr el test y verlo fallar**

Run: `npx vitest run src/lib/crm/link-acceptance.test.ts`

Expected: FAIL con módulo no encontrado.

- [ ] **Step 3: Implementar**

`src/lib/crm/link-acceptance.ts`:

```ts
const accepted = new Set(["confirmo", "registrado", "llego"]);

export function isLinkAccepted(status: string | null) {
  return status === null || accepted.has(status);
}

export function pendingInviteAction(person: { source: string; status: string }) {
  if (person.status !== "cargado") return null;
  return person.source === "enlace" ? "aceptar" : "contactar";
}
```

- [ ] **Step 4: Correr el test**

Run: `npx vitest run src/lib/crm/link-acceptance.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/crm/link-acceptance.ts src/lib/crm/link-acceptance.test.ts
git commit -m "$(cat <<'EOF'
feat: el registro por enlace se distingue de la invitación manual

EOF
)"
```

---

### Task 2: El alta por enlace se queda en cargado

**Files:**
- Create: `supabase/migrations/20261023190000_link_signup_pending.sql`
- Test: `src/lib/crm/link-acceptance.test.ts`

Reemplaza `public.attribute_link_signup`. El cuerpo es el de `supabase/migrations/20261022170000_attribute_link_signup.sql`, sin los dos `insert` de `confirmar` y `registrar`. Se conserva el `insert` de `cargar`.

- [ ] **Step 1: Escribir el test que falla**

Al final de `src/lib/crm/link-acceptance.test.ts`:

```ts
it("la migración del enlace solo carga el contacto", () => {
  const sql = readFileSync("supabase/migrations/20261023190000_link_signup_pending.sql", "utf8");
  expect(sql).toContain("create or replace function public.attribute_link_signup");
  expect(sql).toContain("'cargar'");
  expect(sql).not.toContain("'confirmar'");
  expect(sql).not.toContain("'registrar'");
});
```

Importar `readFileSync` desde `node:fs`.

- [ ] **Step 2: Correr el test y verlo fallar**

Run: `npx vitest run src/lib/crm/link-acceptance.test.ts`

Expected: FAIL porque el archivo SQL no existe.

- [ ] **Step 3: Escribir la migración**

Copiar la función completa de `20261022170000_attribute_link_signup.sql` y borrar estos dos insert:

```sql
  insert into public.crm_events (contact_id, event, actor_id, occurred_at)
  values (contact, 'confirmar', auth.uid(), clock_timestamp() + interval '1 millisecond');
  insert into public.crm_events (contact_id, event, actor_id, occurred_at)
  values (contact, 'registrar', auth.uid(), clock_timestamp() + interval '2 milliseconds');
```

Dejar el insert de `cargar` y los `revoke` / `grant` del final.

- [ ] **Step 4: Correr el test**

Run: `npx vitest run src/lib/crm/link-acceptance.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20261023190000_link_signup_pending.sql src/lib/crm/link-acceptance.test.ts
git commit -m "$(cat <<'EOF'
feat: registrarse con el enlace deja la invitación pendiente

EOF
)"
```

---

### Task 3: Función para aceptar

**Files:**
- Create: `supabase/migrations/20261023190100_approve_link_signup.sql`
- Test: `src/lib/crm/link-acceptance.test.ts`

La política `crm_events_insert` no deja insertar `confirmar` ni `registrar` al director ni al superadmin. Por eso la aceptación va en una función `security definer`. Pueden llamarla el superadmin y, si el contacto es de su organismo, el director o el capturista.

- [ ] **Step 1: Escribir el test que falla**

```ts
it("aceptar escribe confirmar y registrar para un enlace pendiente", () => {
  const sql = readFileSync("supabase/migrations/20261023190100_approve_link_signup.sql", "utf8");
  expect(sql).toContain("function public.approve_link_signup(contact_id uuid)");
  expect(sql).toContain("src is distinct from 'enlace'");
  expect(sql).toContain("current_status is distinct from 'cargado'");
  expect(sql).toContain("'confirmar'");
  expect(sql).toContain("'registrar'");
  expect(sql).toContain("grant execute on function public.approve_link_signup(uuid) to authenticated");
});
```

- [ ] **Step 2: Correr el test y verlo fallar**

Run: `npx vitest run src/lib/crm/link-acceptance.test.ts`

Expected: FAIL porque el archivo SQL no existe.

- [ ] **Step 3: Escribir la migración**

```sql
create or replace function public.approve_link_signup(contact_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  org uuid;
  src text;
  current_status text;
begin
  if auth.uid() is null then
    raise exception 'sin sesión';
  end if;
  select organization_id, source into org, src
  from public.crm_contacts
  where id = contact_id;
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
    raise exception 'no puedes aceptar esta invitación';
  end if;
  select status into current_status
  from public.crm_contact_status
  where crm_contact_status.contact_id = approve_link_signup.contact_id;
  if current_status is distinct from 'cargado' then
    raise exception 'ya no está pendiente';
  end if;
  insert into public.crm_events (contact_id, event, actor_id, occurred_at)
  values (contact_id, 'confirmar', auth.uid(), clock_timestamp());
  insert into public.crm_events (contact_id, event, actor_id, occurred_at)
  values (contact_id, 'registrar', auth.uid(), clock_timestamp() + interval '1 millisecond');
end;
$$;

revoke all on function public.approve_link_signup(uuid) from public;
grant execute on function public.approve_link_signup(uuid) to authenticated;
```

- [ ] **Step 4: Correr el test**

Run: `npx vitest run src/lib/crm/link-acceptance.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20261023190100_approve_link_signup.sql src/lib/crm/link-acceptance.test.ts
git commit -m "$(cat <<'EOF'
feat: aceptar una invitación por enlace la deja registrada

EOF
)"
```

---

### Task 4: El CRM del organismo conoce el origen

**Files:**
- Modify: `src/lib/directory.ts`
- Modify: `src/lib/organismo/org-crm-rows.ts`
- Modify: `src/lib/organismo/org-crm-rows.test.ts`
- Modify: `src/lib/organismo/org-crm-read.ts`
- Modify: `src/lib/memory/crm-person.ts`

- [ ] **Step 1: Escribir el test que falla**

En el objeto esperado de `org-crm-rows.test.ts` agregar `source: "enlace"`. En el contacto de entrada agregar `source: "enlace"`.

- [ ] **Step 2: Correr el test y verlo fallar**

Run: `npx vitest run src/lib/organismo/org-crm-rows.test.ts`

Expected: FAIL porque `CrmPerson` no tiene `source`.

- [ ] **Step 3: Implementar**

En `CrmPerson` agregar `source: string`.

En `ContactRow` agregar `source: string`. En `toCrmPeople`, copiar `source: row.source`.

En `listOrgCrm`, el `select` pasa a `"id, nombre, empresa, email, source, sectors(slug)"`.

En `crmPerson`, agregar `source: "manual"`. Las filas de memoria son altas a mano.

- [ ] **Step 4: Correr el test**

Run: `npx vitest run src/lib/organismo/org-crm-rows.test.ts src/lib/memory/crm-person.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/directory.ts src/lib/organismo/org-crm-rows.ts src/lib/organismo/org-crm-rows.test.ts src/lib/organismo/org-crm-read.ts src/lib/memory/crm-person.ts
git commit -m "$(cat <<'EOF'
feat: el CRM del organismo distingue el origen de cada invitación

EOF
)"
```

---

### Task 5: Botones Aceptar, Rechazar y Contactar

**Files:**
- Create: `src/components/organismo/pending-actions.tsx`
- Modify: `src/components/organismo/crm-cards.tsx`
- Modify: `src/components/organismo/crm-table.tsx`

`crm-cards.tsx` tiene 61 líneas y `crm-table.tsx` 60. El botón sale a un componente para que los dos no pasen de 90.

- [ ] **Step 1: Crear el componente**

`src/components/organismo/pending-actions.tsx`:

```tsx
import { crmEventAction } from "@/lib/crm-actions";
import { pendingInviteAction } from "@/lib/crm/link-acceptance";

export function PendingActions({
  person,
  slug,
  vista,
}: {
  person: { id: string; source: string; status: string };
  slug: string;
  vista: string;
}) {
  const action = pendingInviteAction(person);
  if (!action) return null;
  return (
    <div className="flex flex-wrap gap-2">
      <form action={crmEventAction}>
        <input type="hidden" name="slug" value={slug} />
        <input type="hidden" name="personId" value={person.id} />
        <input type="hidden" name="event" value={action} />
        <input type="hidden" name="vista" value={vista} />
        <button type="submit" className="btn btn-primary">
          {action === "aceptar" ? "Aceptar" : "Contactar"}
        </button>
      </form>
      {action === "aceptar" ? (
        <form action={crmEventAction}>
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="personId" value={person.id} />
          <input type="hidden" name="event" value="rechazar" />
          <input type="hidden" name="vista" value={vista} />
          <button type="submit" className="btn btn-secondary">
            Rechazar
          </button>
        </form>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 2: Usarlo en tarjetas y tabla**

En `crm-cards.tsx` y `crm-table.tsx`, reemplazar el `<form action={crmEventAction}>` de la columna pendiente por:

```tsx
<PendingActions person={person} slug={slug} vista={vista} />
```

Quitar el `if` que solo miraba `orgEstado(...) === "pendiente"` alrededor del form. `PendingActions` ya no pinta nada si el estatus no es `cargado`.

- [ ] **Step 3: Compilar**

Run: `npx tsc --noEmit --pretty false`

Expected: sin error en `src/components/organismo`.

- [ ] **Step 4: Commit**

```bash
git add src/components/organismo/pending-actions.tsx src/components/organismo/crm-cards.tsx src/components/organismo/crm-table.tsx
git commit -m "$(cat <<'EOF'
feat: el organismo acepta o rechaza quien se registró con su enlace

EOF
)"
```

---

### Task 6: El botón llama a la función y el rechazo sí se guarda

**Files:**
- Modify: `src/lib/crm-actions.ts`
- Modify: `src/lib/organismo/org-crm-write.ts`

Hoy `applyEvent` en Supabase solo inserta `contactar`. `rechazar` entra al `if` y no se escribe.

- [ ] **Step 1: Guardar el rechazo**

En `org-crm-write.ts`, junto a `contactOrgPerson`:

```ts
export async function rejectOrgPerson(db: SupabaseClient, actorId: string, personId: string) {
  const event = await db.from("crm_events").insert({
    contact_id: personId,
    event: "rechazar",
    actor_id: actorId,
  });
  if (event.error) return { ok: false as const, reason: event.error.message };
  return { ok: true as const };
}
```

`org-crm-write.ts` tiene 54 líneas. Con esta función queda cerca de 70. Si pasa de 90, mover `rejectOrgPerson` a `src/lib/organismo/reject-person.ts`.

- [ ] **Step 2: Aceptar por RPC**

En `crm-actions.ts`, ampliar el `if` de eventos a `"contactar" | "rechazar" | "aceptar"`.

En `applyEvent`, cuando hay Supabase:

```ts
if (event === "aceptar") {
  const approved = await db.rpc("approve_link_signup", { contact_id: personId });
  if (approved.error) return;
  return;
}
if (event === "contactar") await contactOrgPerson(db, actorId, personId);
if (event === "rechazar") await rejectOrgPerson(db, actorId, personId);
```

El camino de memoria no recibe `aceptar`: el `if` de `applyCrm` sigue limitado a `contactar` y `rechazar`.

`crm-actions.ts` tiene 35 líneas. Si el cambio lo pasa de 90, mover `applyEvent` a `src/lib/organismo/apply-org-event.ts`.

- [ ] **Step 3: Compilar**

Run: `npx tsc --noEmit --pretty false`

Expected: sin error en `src/lib/crm-actions.ts`.

- [ ] **Step 4: Commit**

```bash
git add src/lib/crm-actions.ts src/lib/organismo/org-crm-write.ts
git commit -m "$(cat <<'EOF'
feat: aceptar llama a la base y rechazar queda escrito

EOF
)"
```

---

### Task 7: El superadmin también acepta

**Files:**
- Modify: `src/app/api/admin/crm/[id]/evento/route.ts`
- Modify: `src/app/admin/crm/[id]/page.tsx`

`page.tsx` tiene 61 líneas. Un form extra cabe. La ruta tiene 30.

- [ ] **Step 1: Atender `aprobar` antes de la máquina de estados**

En `POST`, después de cargar `current` y antes de `nextCrmInsert`:

```ts
if (String(form.get("event") ?? "") === "aprobar") {
  const db = await adminDb();
  if (!db) return NextResponse.redirect(new URL(`${back}&error=sin%20sesión`, request.url));
  const approved = await db.rpc("approve_link_signup", { contact_id: id });
  if (approved.error) {
    return NextResponse.redirect(new URL(`${back}&error=${encodeURIComponent(approved.error.message)}`, request.url));
  }
  return NextResponse.redirect(new URL(back, request.url));
}
```

- [ ] **Step 2: Mostrar el botón solo si sigue pendiente**

En la pestaña hechos de `src/app/admin/crm/[id]/page.tsx`, antes del `actions.map`, si `data.contact.source === "enlace"` y `data.statusCode === "cargado"`:

```tsx
<form action={`/api/admin/crm/${id}/evento`} method="post">
  <input type="hidden" name="event" value="aprobar" />
  <button className="btn btn-primary" type="submit">Aceptar</button>
</form>
```

`loadCrm` ya devuelve `statusCode` y `contact.source`. Si `page.tsx` pasa de 90 líneas, mover la lista de forms a `src/app/admin/crm/[id]/event-forms.tsx`.

- [ ] **Step 3: Compilar**

Run: `npx tsc --noEmit --pretty false`

Expected: sin error en `src/app/admin/crm` ni en la ruta de evento.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/admin/crm/[id]/evento/route.ts src/app/admin/crm/[id]/page.tsx
git commit -m "$(cat <<'EOF'
feat: el superadmin acepta una invitación por enlace pendiente

EOF
)"
```

---

### Task 8: La conversión del organismo cuenta solo lo aceptado

**Files:**
- Create: `src/lib/organismo/link-conversions.ts`
- Create: `src/lib/organismo/link-conversions.test.ts`
- Modify: `src/lib/organismo/load-supabase-home.ts`

- [ ] **Step 1: Escribir el test que falla**

```ts
import { describe, expect, it } from "vitest";
import { linkConversions } from "./link-conversions";

describe("conversiones del enlace", () => {
  it("no cuenta al pendiente ni al rechazo", () => {
    const map = linkConversions([
      { slug: "turismo", status: "cargado" },
      { slug: "turismo", status: "registrado" },
      { slug: "turismo", status: "no" },
      { slug: "alimentos-y-bebidas", status: "llego" },
    ]);
    expect(map.get("turismo")).toBe(1);
    expect(map.get("alimentos-y-bebidas")).toBe(1);
    expect([...map.values()].reduce((sum, count) => sum + count, 0)).toBe(2);
  });
});
```

- [ ] **Step 2: Correr el test y verlo fallar**

Run: `npx vitest run src/lib/organismo/link-conversions.test.ts`

Expected: FAIL con módulo no encontrado.

- [ ] **Step 3: Implementar el conteo**

```ts
import { isLinkAccepted } from "@/lib/crm/link-acceptance";

export function linkConversions(rows: { slug: string; status: string | null }[]) {
  const counts = new Map<string, number>();
  for (const row of rows) {
    if (!row.slug || !isLinkAccepted(row.status) || row.status === null) continue;
    counts.set(row.slug, (counts.get(row.slug) ?? 0) + 1);
  }
  return counts;
}
```

`status === null` se excluye aquí: en el home solo entran filas `enlace`, y sin estatus no hay aceptación. En logos, `null` significa que no hay contacto `enlace`.

- [ ] **Step 4: Leer el estatus en el home**

En `loadSupabaseHome`, después de leer los contactos `enlace`, leer `crm_contact_status` de esos ids. Armar `{ slug, status }` y reemplazar el `Map` manual por `linkConversions`. `load-supabase-home.ts` tiene 56 líneas. Si pasa de 90, mover la lectura de estatus a `src/lib/organismo/load-link-status.ts`.

- [ ] **Step 5: Correr el test**

Run: `npx vitest run src/lib/organismo/link-conversions.test.ts src/lib/organismo/link-stats.test.ts`

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/lib/organismo/link-conversions.ts src/lib/organismo/link-conversions.test.ts src/lib/organismo/load-supabase-home.ts
git commit -m "$(cat <<'EOF'
feat: la conversión del organismo espera a que la invitación se acepte

EOF
)"
```

---

### Task 9: El tablero separa pendientes y aceptados del enlace

**Files:**
- Modify: `src/lib/admin/tablero/types.ts`
- Modify: `src/lib/admin/tablero/snapshot.ts`
- Modify: `src/lib/admin/tablero/snapshot.test.ts`
- Modify: `src/app/admin/tablero/kpis.tsx`

`linkSignups` sigue siendo el total. Se agregan `linkPending` y `linkAccepted`. El embudo de excel y manual no cambia.

- [ ] **Step 1: Escribir el test que falla**

En el caso que ya espera `linkSignups === 1` para el contacto `d` en `registrado`, agregar:

```ts
expect(board.linkAccepted).toBe(1);
expect(board.linkPending).toBe(0);
```

Agregar este caso:

```ts
it("separa el enlace pendiente del aceptado", () => {
  const board = buildTablero({
    contacts: [
      { id: "p", source: "enlace", organizationId: "o1" },
      { id: "a", source: "enlace", organizationId: "o1" },
      { id: "n", source: "enlace", organizationId: "o1" },
    ],
    statuses: [
      { contactId: "p", status: "cargado" },
      { contactId: "a", status: "registrado" },
      { contactId: "n", status: "no" },
    ],
    orgs,
    confirmations: [],
  });
  expect(board.linkSignups).toBe(3);
  expect(board.linkPending).toBe(1);
  expect(board.linkAccepted).toBe(1);
  expect(board.invitations).toBe(0);
});
```

- [ ] **Step 2: Correr el test y verlo fallar**

Run: `npx vitest run src/lib/admin/tablero/snapshot.test.ts`

Expected: FAIL porque `linkPending` no existe.

- [ ] **Step 3: Implementar**

En `Tablero` agregar `linkPending: number` y `linkAccepted: number`.

En `buildTablero`, sobre los contactos `source === "enlace"`:

```ts
const links = input.contacts.filter((row) => row.source === "enlace");
const linkStatus = (id: string) => statusOf.get(id) ?? "";
const linkPending = links.filter((row) => linkStatus(row.id) === "cargado").length;
const linkAccepted = links.filter((row) => isLinkAccepted(linkStatus(row.id) || null) && linkStatus(row.id) !== "").length;
```

`no` no entra en ninguno de los dos. El total `linkSignups` sigue siendo `links.length`.

En `kpis.tsx` agregar una tarjeta:

```ts
{ key: "linkPending", testId: "tablero-enlace-pendiente", label: "Por aceptar", hint: "Se registraron con el enlace y siguen pendientes" },
```

La tarjeta «Por enlace» conserva el total. La grilla puede envolver la quinta tarjeta.

- [ ] **Step 4: Correr el test**

Run: `npx vitest run src/lib/admin/tablero/snapshot.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/admin/tablero/types.ts src/lib/admin/tablero/snapshot.ts src/lib/admin/tablero/snapshot.test.ts src/app/admin/tablero/kpis.tsx
git commit -m "$(cat <<'EOF'
feat: el tablero separa los enlaces pendientes de los aceptados

EOF
)"
```

---

### Task 10: Asistentes y logos ignoran al pendiente

**Files:**
- Modify: `src/lib/admin/empresas/attending.ts`
- Modify: `src/lib/admin/empresas/attending.test.ts`
- Modify: `src/lib/admin/empresas/load-attending.ts`
- Create: `src/lib/admin/empresas/pending-link-emails.ts`
- Modify: `src/lib/admin/empresas/load-event-logos.ts`

Quien terminó el perfil sin contacto `enlace` sigue en la lista. Quien tiene un `enlace` no aceptado sale.

- [ ] **Step 1: Escribir el test que falla**

En `AttendingInput` el test nuevo usa `linkStatus`:

```ts
it("saca al enlace que todavía no se acepta", () => {
  const rows = [
    { ...base, id: "c1", email: "ana@norte.mx", linkStatus: "cargado" as string | null },
    { ...base, id: "c2", email: "luis@sur.mx", linkStatus: "registrado" as string | null },
    { ...base, id: "c3", email: "rosa@taller.mx", linkStatus: null },
  ];
  expect(attendingCompanies(rows, null).rows.map((row) => row.id)).toEqual(["c2", "c3"]);
});
```

`base` es la fila de empresario con `onboarded: true` que ya usa el archivo. Agregar `linkStatus: null` a las filas viejas para que sigan contando.

- [ ] **Step 2: Correr el test y verlo fallar**

Run: `npx vitest run src/lib/admin/empresas/attending.test.ts`

Expected: FAIL porque `linkStatus` no existe.

- [ ] **Step 3: Filtrar**

En `AttendingInput` agregar `linkStatus: string | null`. En `attendingCompanies`, además de las condiciones actuales:

```ts
isLinkAccepted(row.linkStatus)
```

- [ ] **Step 4: Cargar los correos pendientes**

`src/lib/admin/empresas/pending-link-emails.ts`:

```ts
import "server-only";

import { isLinkAccepted } from "@/lib/crm/link-acceptance";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function pendingLinkEmails(db: SupabaseClient) {
  const contacts = await db.from("crm_contacts").select("id, email").eq("source", "enlace");
  if (contacts.error) throw new Error(contacts.error.message);
  const ids = (contacts.data ?? []).map((row) => row.id as string);
  const statuses = ids.length
    ? await db.from("crm_contact_status").select("contact_id, status").in("contact_id", ids)
    : { data: [], error: null };
  if (statuses.error) throw new Error(statuses.error.message);
  const statusOf = new Map((statuses.data ?? []).map((row) => [row.contact_id as string, row.status as string]));
  return new Set(
    (contacts.data ?? [])
      .filter((row) => !isLinkAccepted(statusOf.get(row.id as string) ?? null))
      .map((row) => String(row.email).trim().toLowerCase()),
  );
}
```

En `load-attending.ts`, el `select` de `profiles` incluye `email`. `linkStatus` es `"cargado"` si el correo está en el set, y `null` si no. El archivo tiene 34 líneas. Si pasa de 90, dejar el mapeo en `src/lib/admin/empresas/attending-rows.ts`.

En `load-event-logos.ts`, leer `profiles(email)` junto con la empresa y no pasar a `visibleEventLogos` las filas cuyo correo esté en el set. El archivo tiene 25 líneas.

- [ ] **Step 5: Correr el test**

Run: `npx vitest run src/lib/admin/empresas/attending.test.ts src/lib/admin/empresas/event-logos.test.ts`

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/lib/admin/empresas/attending.ts src/lib/admin/empresas/attending.test.ts src/lib/admin/empresas/load-attending.ts src/lib/admin/empresas/pending-link-emails.ts src/lib/admin/empresas/load-event-logos.ts
git commit -m "$(cat <<'EOF'
feat: asistentes y logos esperan a que el enlace se acepte

EOF
)"
```

---

### Task 11: Termina el onboarding y el pase espera el correo

**Files:**
- Create: `src/components/onboarding/pending-notice.tsx`
- Create: `src/lib/onboarding/link-pass-state.ts`
- Modify: `src/lib/crm/link-acceptance.ts`
- Modify: `src/lib/crm/link-acceptance.test.ts`
- Modify: `src/components/onboarding/onboarding-wizard.tsx`
- Modify: `src/app/onboarding/supabase-screen.tsx`

El empresario recorre los tres pasos y el perfil se guarda. La pantalla de después depende del estatus, no de un query param. Sin contacto `enlace`, o con el enlace ya aceptado, se muestra `AccessPass` como hoy («Tu pase quedó listo» y el QR). Con un `enlace` todavía no aceptado, esa pantalla no sale.

- [ ] **Step 1: Escribir el test que falla**

En `src/lib/crm/link-acceptance.test.ts`:

```ts
it("el pase en pantalla espera a que todos los enlaces estén aceptados", () => {
  expect(passIsPending([])).toBe(false);
  expect(passIsPending(["registrado"])).toBe(false);
  expect(passIsPending(["cargado"])).toBe(true);
  expect(passIsPending(["registrado", "cargado"])).toBe(true);
  expect(passIsPending(["no"])).toBe(true);
});
```

Importar `passIsPending` desde `./link-acceptance`.

- [ ] **Step 2: Correr el test y verlo fallar**

Run: `npx vitest run src/lib/crm/link-acceptance.test.ts`

Expected: FAIL porque `passIsPending` no existe.

- [ ] **Step 3: Implementar la regla y la lectura**

En `src/lib/crm/link-acceptance.ts`:

```ts
export function passIsPending(statuses: (string | null)[]) {
  return statuses.some((status) => !isLinkAccepted(status));
}
```

`src/lib/onboarding/link-pass-state.ts`:

```ts
import "server-only";

import { passIsPending } from "@/lib/crm/link-acceptance";
import { createSupabaseWithAccess } from "@/lib/supabase/auth-session";

export async function linkPassPending(accessToken: string, email: string) {
  const db = createSupabaseWithAccess(accessToken);
  const contacts = await db
    .from("crm_contacts")
    .select("id")
    .eq("email", email.trim().toLowerCase())
    .eq("source", "enlace");
  if (contacts.error) throw new Error(contacts.error.message);
  const ids = (contacts.data ?? []).map((row) => row.id as string);
  if (ids.length === 0) return false;
  const statuses = await db.from("crm_contact_status").select("status").in("contact_id", ids);
  if (statuses.error) throw new Error(statuses.error.message);
  return passIsPending((statuses.data ?? []).map((row) => (row.status as string | null) ?? null));
}
```

`src/components/onboarding/pending-notice.tsx`:

```tsx
export function PendingNotice() {
  return (
    <p className="text-body text-ink" data-testid="pase-por-correo">
      Tu pase te llegará por correo.
    </p>
  );
}
```

- [ ] **Step 4: Elegir la pantalla**

`OnboardingWizard` recibe `pending?: boolean`. Cuando `onboarded && role !== "director"`:

- si `pending`, renderizar `<ConfidentialityNote />` y `<PendingNotice />`;
- si no, dejar el bloque actual con `<AccessPass code={accountId} />`.

En `SupabaseOnboarding`, cuando el perfil ya tiene `onboarded_at` y el rol no es director, `pending` sale de `linkPassPending(token, account.email)`. El `redirect("/onboarding")` de `completeEmpresarioAction` no cambia.

`onboarding-wizard.tsx` tiene 64 líneas y `supabase-screen.tsx` 57. Si alguno pasa de 90, mover la rama del pase a `src/components/onboarding/finished-pass.tsx`.

- [ ] **Step 5: Correr el test y compilar**

Run: `npx vitest run src/lib/crm/link-acceptance.test.ts && npx tsc --noEmit --pretty false`

Expected: PASS, y sin error en `src/app/onboarding` ni en `src/components/onboarding`.

- [ ] **Step 6: Commit**

```bash
git add src/lib/crm/link-acceptance.ts src/lib/crm/link-acceptance.test.ts src/lib/onboarding/link-pass-state.ts src/components/onboarding/pending-notice.tsx src/components/onboarding/onboarding-wizard.tsx src/app/onboarding/supabase-screen.tsx
git commit -m "$(cat <<'EOF'
feat: al terminar el onboarding el pase espera a que acepten el enlace

EOF
)"
```

---

### Task 12: Aplicar las dos migraciones

**Files:** ninguna de aplicación. Las migraciones de las tareas 2 y 3.

- [ ] **Step 1: Aplicar el alta pendiente**

En el proyecto `jnshenkmexsxiylpqhdh`, aplicar el SQL de `20261023190000_link_signup_pending.sql`.

- [ ] **Step 2: Aplicar la aceptación**

Aplicar el SQL de `20261023190100_approve_link_signup.sql` después de que el paso anterior haya terminado.

- [ ] **Step 3: Comprobar la función**

```sql
select proname
from pg_proc
join pg_namespace on pg_namespace.oid = pg_proc.pronamespace
where nspname = 'public' and proname = 'approve_link_signup';
```

Expected: una fila.

No hay commit: el SQL ya está en el repositorio. No se actualizan los contactos `enlace` que ya están `registrado`.

---

## Verificación manual

1. Registrar un empresario nuevo con un enlace y terminar los tres pasos. La pantalla dice «Tu pase te llegará por correo». No muestra el QR ni «Tu pase quedó listo».
2. En el CRM del organismo, esa persona está en Pendiente con Aceptar y Rechazar. Una fila de Excel en la misma columna sigue teniendo Contactar.
3. Aceptar la mueve a Confirmado. Al volver a `/onboarding`, sale la pantalla de pase que ya existe. El home del organismo sube una conversión. El tablero sube «Por aceptar» antes y los aceptados después.
4. Rechazar otra deja el estatus en No. No aparece en asistentes ni en Logos.
5. `GET /api/admin/empresas?vista=asistentes` no incluye al pendiente y sí incluye al aceptado.
6. Ana, Luis y Rosa de Camara Flujo E2E siguen en Registrado.
