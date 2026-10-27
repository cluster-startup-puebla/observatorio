# Cerrar el cupo por sector Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Al aceptar un enlace o un alta externa, el sector de la sesión vigente no pasa de su cupo; el organismo ve el avance en el detalle del sector y el empresario aceptado puede cancelar para soltar el lugar.

**Architecture:** Una función pura arma el texto y los tramos de la barra. Postgres cuenta los lugares ocupados y bloquea la fila de `session_sector_quotas` dentro de `approve_link_signup` y `approve_external_signup`. Si ya están en el cupo, lanzan `sector_lleno`. La cancelación es una fila en `attendance_cancellations` y esa empresa deja de contar. El onboarding no se cierra. Nadie entra solo cuando se libera un lugar.

**Tech Stack:** Next.js 16 App Router, Supabase Postgres, vitest. Archivos `.ts` y `.tsx` de menos de 90 líneas. Avisos con `Alert` de shadcn, nunca `alert()`.

**Spec:** `docs/superpowers/specs/2026-10-27-cerrar-cupo-por-sector-design.md`

---

## Fuera de este plan

- Promover sola a la siguiente persona en espera.
- Rechazar el onboarding por cupo.
- Amarrar `companies` a `session_id`.
- La mesa, el QR y el embudo de Excel.
- Expulsar a quien ya dejó el sector por encima del cupo.
- `DIRECTORY=memory`.

## Mapa de archivos

- Crear: `src/lib/cupo/sector-pace.ts`
- Crear: `src/lib/cupo/sector-pace.test.ts`
- Crear: `src/lib/cupo/seat-rules.ts`
- Crear: `src/lib/cupo/seat-rules.test.ts`
- Crear: `src/lib/cupo/seat-full-copy.ts`
- Crear: `src/lib/cupo/seat-full-copy.test.ts`
- Crear: `supabase/migrations/20261027170000_sector_seat_count.sql`
- Crear: `supabase/migrations/20261027170100_accept_respects_sector_quota.sql`
- Crear: `supabase/migrations/20261027170200_cancel_attendance.sql`
- Crear: `src/lib/cupo/sector-quota-sql.test.ts`
- Crear: `src/components/organismo/sector-pace-bar.tsx`
- Crear: `src/lib/organismo/load-sector-pace.ts`
- Crear: `src/components/onboarding/cancel-attendance.tsx`
- Crear: `src/lib/onboarding/cancel-attendance.ts`
- Modificar: `src/lib/crm-actions.ts`
- Modificar: `src/app/[sector]/crm/page.tsx`
- Modificar: `src/app/admin/empresas/[id]/page.tsx`
- Modificar: `src/components/organismo/home.tsx`
- Modificar: `src/app/onboarding/supabase-screen.tsx`
- Modificar: `src/lib/admin/tablero/load-cupos.ts`
- Modificar: `src/lib/admin/tablero/sector-fill.ts`

---

### Task 1: El medidor del sector

**Files:**
- Create: `src/lib/cupo/sector-pace.ts`
- Create: `src/lib/cupo/sector-pace.test.ts`

`capacity` null o 0 significa que la sesión no tiene cupo para ese sector. `mine` y `others` son aceptados, no gente en espera. `filled` es la suma. `free` no baja de 0. `full` es cierto cuando `filled` alcanza el cupo.

- [ ] **Step 1: Escribir el test que falla**

```ts
import { describe, expect, it } from "vitest";
import { sectorPace } from "./sector-pace";

describe("medidor del sector", () => {
  it("parte los aceptados de este organismo y los demás", () => {
    expect(sectorPace({ capacity: 20, mine: 6, others: 9 })).toEqual({
      open: true,
      capacity: 20,
      mine: 6,
      others: 9,
      filled: 15,
      free: 5,
      full: false,
    });
  });

  it("marca lleno cuando la suma llega al cupo y no deja libres negativos", () => {
    expect(sectorPace({ capacity: 20, mine: 10, others: 12 })).toMatchObject({
      filled: 22,
      free: 0,
      full: true,
    });
  });

  it("sin cupo no inventa una barra", () => {
    expect(sectorPace({ capacity: null, mine: 0, others: 0 })).toEqual({ open: false });
    expect(sectorPace({ capacity: 0, mine: 1, others: 0 })).toEqual({ open: false });
  });
});
```

- [ ] **Step 2: Correr el test y verlo fallar**

Run: `npx vitest run src/lib/cupo/sector-pace.test.ts`

Expected: FAIL porque `./sector-pace` no existe.

- [ ] **Step 3: Implementar el medidor**

```ts
export function sectorPace(input: { capacity: number | null; mine: number; others: number }) {
  if (input.capacity === null || input.capacity <= 0) return { open: false as const };
  const filled = input.mine + input.others;
  return {
    open: true as const,
    capacity: input.capacity,
    mine: input.mine,
    others: input.others,
    filled,
    free: Math.max(input.capacity - filled, 0),
    full: filled >= input.capacity,
  };
}
```

- [ ] **Step 4: Correr el test y verlo pasar**

Run: `npx vitest run src/lib/cupo/sector-pace.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/cupo/sector-pace.ts src/lib/cupo/sector-pace.test.ts
git commit -m "$(cat <<'EOF'
feat: el medidor separa el cupo del organismo y el del resto

EOF
)"
```

---

### Task 2: Los casos que el cupo tiene que cumplir

**Files:**
- Create: `src/lib/cupo/seat-rules.ts`
- Create: `src/lib/cupo/seat-rules.test.ts`

Esta tarea no toca Postgres. Fija la regla en funciones puras y la prueba con el caso de 20 lugares. Las tasks 3, 4, 7, 8 y 9 implementan esa misma regla. Un test que solo busca una frase dentro del archivo SQL no cuenta como prueba de esta tarea.

Una persona ocupa lugar si terminó el onboarding, está aceptada y no canceló. Terminar el onboarding sin aceptación la deja en espera y no resta. Sin cupo (`capacity` null) no hay lleno. Aceptar cuando `ocupados >= capacity` devuelve `sector_lleno` y no cambia a la persona. Cancelar exige motivo de 1 a 280 caracteres ya recortado, solo suelta a quien ocupa, y no acepta a nadie más. `paceFor` usa `sectorPace`: los del `orgId` van en `mine` y el resto, incluidas las altas sin organismo, en `others`.

- [ ] **Step 1: Escribir el test que falla**

```ts
import { describe, expect, it } from "vitest";
import { acceptSeat, cancelSeat, paceFor, type SeatPerson } from "./seat-rules";

const quota = { sector: "automotriz", capacity: 20 };

function person(partial: Partial<SeatPerson> & Pick<SeatPerson, "id" | "orgId">): SeatPerson {
  return {
    sector: "automotriz",
    onboarded: true,
    accepted: false,
    cancelled: false,
    ...partial,
  };
}

const accepted = (id: string, orgId: string) => person({ id, orgId, accepted: true });

describe("regla del cupo", () => {
  it("20 lugares, 19 aceptados y 3 en espera: el 20 entra y el 21 no", () => {
    const waiting = [
      person({ id: "c1", orgId: "clauz" }),
      person({ id: "c2", orgId: "clauz" }),
      person({ id: "n1", orgId: "canacintra" }),
    ];
    const taken = Array.from({ length: 19 }, (_, index) => accepted(`a${index}`, index < 10 ? "canacintra" : "clauz"));
    const first = acceptSeat([...taken, ...waiting], quota, "c1");
    expect(first.ok).toBe(true);
    if (!first.ok) return;
    expect(paceFor(first.people, quota, "clauz")).toMatchObject({ filled: 20, free: 0, full: true });
    const second = acceptSeat(first.people, quota, "n1");
    expect(second).toEqual({ ok: false, reason: "sector_lleno" });
    expect(first.people.find((item) => item.id === "n1")?.accepted).toBe(false);
  });

  it("quien solo terminó el onboarding no resta, y cancelar abre el lugar a mano", () => {
    const people = [
      accepted("a1", "canacintra"),
      person({ id: "espera", orgId: "clauz" }),
    ];
    expect(paceFor(people, { sector: "automotriz", capacity: 1 }, "canacintra")).toMatchObject({
      mine: 1,
      others: 0,
      filled: 1,
      full: true,
    });
    expect(acceptSeat(people, { sector: "automotriz", capacity: 1 }, "espera")).toEqual({
      ok: false,
      reason: "sector_lleno",
    });
    const freed = cancelSeat(people, "a1", "  no puedo asistir  ");
    expect(freed.ok).toBe(true);
    if (!freed.ok) return;
    const next = acceptSeat(freed.people, { sector: "automotriz", capacity: 1 }, "espera");
    expect(next.ok).toBe(true);
  });

  it("cancelar sin lugar o sin motivo no suelta nada", () => {
    const waiting = [person({ id: "espera", orgId: "clauz" })];
    expect(cancelSeat(waiting, "espera", "ya no voy")).toEqual({ ok: false, reason: "todavia_no_ocupa" });
    expect(cancelSeat([accepted("a1", "clauz")], "a1", "   ")).toEqual({ ok: false, reason: "motivo" });
    expect(cancelSeat([accepted("a1", "clauz")], "a1", "x".repeat(281))).toEqual({ ok: false, reason: "motivo" });
  });

  it("sin cupo la aceptación no se bloquea y la barra no se inventa", () => {
    const people = [person({ id: "n1", orgId: "canacintra" })];
    const open = acceptSeat(people, { sector: "automotriz", capacity: null }, "n1");
    expect(open.ok).toBe(true);
    expect(paceFor(people, { sector: "automotriz", capacity: null }, "canacintra")).toEqual({ open: false });
  });

  it("el alta sin organismo cuenta en los demás", () => {
    const people = [person({ id: "ext", orgId: null, accepted: true })];
    expect(paceFor(people, quota, "canacintra")).toMatchObject({ mine: 0, others: 1, filled: 1, free: 19 });
  });
});
```

- [ ] **Step 2: Correr el test y verlo fallar**

Run: `npx vitest run src/lib/cupo/seat-rules.test.ts`

Expected: FAIL porque `./seat-rules` no existe.

- [ ] **Step 3: Implementar la regla**

`src/lib/cupo/seat-rules.ts`:

```ts
import { sectorPace } from "./sector-pace";

export type SeatPerson = {
  id: string;
  sector: string;
  orgId: string | null;
  onboarded: boolean;
  accepted: boolean;
  cancelled: boolean;
};

export type SeatQuota = { sector: string; capacity: number | null };

function occupies(person: SeatPerson, sector: string) {
  return person.sector === sector && person.onboarded && person.accepted && !person.cancelled;
}

export function paceFor(people: SeatPerson[], quota: SeatQuota, orgId: string) {
  const seats = people.filter((person) => occupies(person, quota.sector));
  const mine = seats.filter((person) => person.orgId === orgId).length;
  return sectorPace({ capacity: quota.capacity, mine, others: seats.length - mine });
}

export function acceptSeat(people: SeatPerson[], quota: SeatQuota, id: string) {
  const person = people.find((item) => item.id === id);
  if (!person || !person.onboarded || person.accepted || person.cancelled || person.sector !== quota.sector) {
    return { ok: false as const, reason: "no se puede aceptar" };
  }
  const filled = people.filter((item) => occupies(item, quota.sector)).length;
  if (quota.capacity !== null && quota.capacity > 0 && filled >= quota.capacity) {
    return { ok: false as const, reason: "sector_lleno" };
  }
  return {
    ok: true as const,
    people: people.map((item) => (item.id === id ? { ...item, accepted: true } : item)),
  };
}

export function cancelSeat(people: SeatPerson[], id: string, reason: string) {
  const text = reason.trim();
  if (text.length < 1 || text.length > 280) return { ok: false as const, reason: "motivo" };
  const person = people.find((item) => item.id === id);
  if (!person || !occupies(person, person.sector)) return { ok: false as const, reason: "todavia_no_ocupa" };
  return {
    ok: true as const,
    people: people.map((item) => (item.id === id ? { ...item, cancelled: true } : item)),
  };
}
```

- [ ] **Step 4: Correr el test y verlo pasar**

Run: `npx vitest run src/lib/cupo/seat-rules.test.ts src/lib/cupo/sector-pace.test.ts`

Expected: PASS. El caso de 19 aceptados más dos aceptaciones deja el sector en 20 y rechaza la tercera. Cancelar a un aceptado baja el conteo y la siguiente aceptación manual sí entra.

- [ ] **Step 5: Commit**

```bash
git add src/lib/cupo/seat-rules.ts src/lib/cupo/seat-rules.test.ts
git commit -m "$(cat <<'EOF'
test: el cupo de 20 rechaza al 21 y la cancelación abre el lugar

EOF
)"
```

Las tasks de SQL no sustituyen este test. Si una migración contradice un caso de aquí, se corrige la migración y este archivo sigue en verde.

---

### Task 3: El conteo ocupado y el candado de la fila

**Files:**
- Create: `supabase/migrations/20261027170000_sector_seat_count.sql`
- Create: `src/lib/cupo/sector-quota-sql.test.ts`

Un lugar es una empresa del sector, con empresario ya en onboarding, sin fila en `attendance_cancellations`, y aceptada: contacto `enlace` en `confirmo`, `registrado` o `llego`, o `admitted_at` si vino por `path`. `sector_is_full` toma `for update` la fila de cupo de la sesión `is_current`. Sin esa fila, no está lleno.

La tabla de cancelaciones nace aquí para que el conteo ya la excluya. La función que escribe la cancelación llega en la task 8.

- [ ] **Step 1: Escribir el test que falla**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sql = readFileSync("supabase/migrations/20261027170000_sector_seat_count.sql", "utf8");

describe("conteo del cupo", () => {
  it("guarda la cancelación y no la cuenta como lugar", () => {
    expect(sql).toContain("create table public.attendance_cancellations");
    expect(sql).toContain("company_id uuid primary key");
    expect(sql).toContain("reason text not null");
    expect(sql).toContain("check (char_length(reason) between 1 and 280)");
    expect(sql).toContain("not exists");
    expect(sql).toContain("public.attendance_cancellations");
  });

  it("cuenta enlace aceptado y alta externa, y bloquea la fila de cupo", () => {
    expect(sql).toContain("function private.sector_is_full(p_sector_id uuid)");
    expect(sql).toContain("for update of q");
    expect(sql).toContain("s.is_current");
    expect(sql).toContain("k.source = 'enlace'");
    expect(sql).toContain("'confirmo', 'registrado', 'llego'");
    expect(sql).toContain("c.sector_source = 'path'");
    expect(sql).toContain("c.admitted_at is not null");
    expect(sql).toContain("p.onboarded_at is not null");
    expect(sql).toContain("p.role = 'empresario'");
  });
});
```

- [ ] **Step 2: Correr el test y verlo fallar**

Run: `npx vitest run src/lib/cupo/sector-quota-sql.test.ts`

Expected: FAIL porque la migración no existe.

- [ ] **Step 3: Escribir la migración**

`supabase/migrations/20261027170000_sector_seat_count.sql`:

```sql
create table public.attendance_cancellations (
  company_id uuid primary key references public.companies (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  reason text not null check (char_length(reason) between 1 and 280),
  cancelled_at timestamptz not null default clock_timestamp()
);

alter table public.attendance_cancellations enable row level security;
alter table public.attendance_cancellations force row level security;

create policy attendance_cancellations_owner_read on public.attendance_cancellations
  for select to authenticated
  using (profile_id = auth.uid() or (select private.is_superadmin()));

grant select on public.attendance_cancellations to authenticated;

create or replace function private.sector_occupied_ids(p_sector_id uuid)
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select c.id
  from public.companies c
  join public.profiles p on p.id = c.profile_id
  where c.sector_id = p_sector_id
    and p.role = 'empresario'
    and p.onboarded_at is not null
    and not exists (
      select 1 from public.attendance_cancellations x where x.company_id = c.id
    )
    and (
      (c.sector_source = 'path' and c.admitted_at is not null)
      or exists (
        select 1
        from public.crm_contacts k
        join public.crm_contact_status st on st.contact_id = k.id
        where k.source = 'enlace'
          and st.status in ('confirmo', 'registrado', 'llego')
          and lower(k.email) = lower(p.email)
      )
    );
$$;

create or replace function private.sector_is_full(p_sector_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  cap integer;
  taken integer;
begin
  select q.capacity into cap
  from public.session_sector_quotas q
  join public.sessions s on s.id = q.session_id
  where s.is_current
    and q.sector_id = p_sector_id
  for update of q;

  if cap is null then
    return false;
  end if;

  select count(*) into taken from private.sector_occupied_ids(p_sector_id);
  return taken >= cap;
end;
$$;

revoke all on function private.sector_occupied_ids(uuid) from public, anon, authenticated;
revoke all on function private.sector_is_full(uuid) from public, anon, authenticated;
```

- [ ] **Step 4: Correr el test y verlo pasar**

Run: `npx vitest run src/lib/cupo/sector-quota-sql.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20261027170000_sector_seat_count.sql src/lib/cupo/sector-quota-sql.test.ts
git commit -m "$(cat <<'EOF'
feat: el cupo cuenta aceptados y deja fuera al que canceló

EOF
)"
```

---

### Task 4: Aceptar el enlace respeta el cupo

**Files:**
- Create: `supabase/migrations/20261027170100_accept_respects_sector_quota.sql`
- Modify: `src/lib/cupo/sector-quota-sql.test.ts`

`approve_link_signup` lee el `sector_id` del contacto y, antes de escribir `confirmar` y `registrar`, llama `private.sector_is_full`. Lleno lanza `sector_lleno`. El resto de la función queda como en `supabase/migrations/20261023190100_approve_link_signup.sql`.

- [ ] **Step 1: Ampliar el test**

Agregar este `it` en `src/lib/cupo/sector-quota-sql.test.ts`:

```ts
it("las dos aceptaciones lanzan sector_lleno", () => {
  const gate = readFileSync("supabase/migrations/20261027170100_accept_respects_sector_quota.sql", "utf8");
  expect(gate).toContain("function public.approve_link_signup(contact_id uuid)");
  expect(gate).toContain("function public.approve_external_signup(company_id uuid)");
  expect(gate.match(/raise exception 'sector_lleno'/g)).toHaveLength(2);
  expect(gate).toContain("private.sector_is_full");
  expect(gate).toContain("'confirmar'");
  expect(gate).toContain("'registrar'");
  expect(gate).toContain("admitted_at = clock_timestamp()");
});
```

- [ ] **Step 2: Correr el test y verlo fallar**

Run: `npx vitest run src/lib/cupo/sector-quota-sql.test.ts`

Expected: FAIL porque `20261027170100_accept_respects_sector_quota.sql` no existe.

- [ ] **Step 3: Reescribir las dos funciones**

`supabase/migrations/20261027170100_accept_respects_sector_quota.sql` reemplaza ambas. El candado va después de las comprobaciones de permiso y de estado, y antes de escribir la aceptación.

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
  sid uuid;
begin
  if auth.uid() is null then
    raise exception 'sin sesión';
  end if;
  select organization_id, source, sector_id into org, src, sid
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
  if sid is not null and private.sector_is_full(sid) then
    raise exception 'sector_lleno';
  end if;
  insert into public.crm_events (contact_id, event, actor_id, occurred_at)
  values (contact_id, 'confirmar', auth.uid(), clock_timestamp());
  insert into public.crm_events (contact_id, event, actor_id, occurred_at)
  values (contact_id, 'registrar', auth.uid(), clock_timestamp() + interval '1 millisecond');
end;
$$;

create or replace function public.approve_external_signup(company_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  src text;
  already timestamptz;
  sid uuid;
begin
  if auth.uid() is null then
    raise exception 'sin sesión';
  end if;
  if not (select private.is_superadmin()) then
    raise exception 'solo el superadmin acepta un registro externo';
  end if;
  select sector_source, admitted_at, sector_id into src, already, sid
  from public.companies
  where id = company_id;
  if src is distinct from 'path' then
    raise exception 'no llegó por un lugar desconocido';
  end if;
  if already is not null then
    raise exception 'ya está aceptada';
  end if;
  if sid is not null and private.sector_is_full(sid) then
    raise exception 'sector_lleno';
  end if;
  update public.companies
  set admitted_at = clock_timestamp(),
      admitted_by = auth.uid()
  where id = company_id;
end;
$$;

revoke all on function public.approve_link_signup(uuid) from public;
grant execute on function public.approve_link_signup(uuid) to authenticated;
revoke all on function public.approve_external_signup(uuid) from public;
grant execute on function public.approve_external_signup(uuid) to authenticated;
revoke update (admitted_at, admitted_by) on public.companies from authenticated, anon;
```

- [ ] **Step 4: Correr el test y verlo pasar**

Run: `npx vitest run src/lib/cupo/sector-quota-sql.test.ts src/lib/crm/link-acceptance.test.ts src/lib/admin/empresas/external-approval.test.ts`

Expected: PASS. Si un test viejo exige el texto exacto de la migración anterior, no lo borres: la función nueva sigue conteniendo esas cláusulas.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20261027170100_accept_respects_sector_quota.sql src/lib/cupo/sector-quota-sql.test.ts
git commit -m "$(cat <<'EOF'
feat: aceptar un lugar falla cuando el sector ya está lleno

EOF
)"
```

---

### Task 5: El aviso de lleno en el CRM del organismo

**Files:**
- Create: `src/lib/cupo/seat-full-copy.ts`
- Create: `src/lib/cupo/seat-full-copy.test.ts`
- Modify: `src/lib/crm-actions.ts`
- Modify: `src/app/[sector]/crm/page.tsx`

`crmEventAction` hoy ignora el error del RPC y redirige igual. Tiene que leer `error.message`. Si incluye `sector_lleno`, redirige con `error=sector_lleno`. Otro error del RPC redirige con `error=aceptar`. La página muestra un `Alert` arriba del CRM. `CrmHandInvite` sigue atendiendo solo sus propios códigos.

- [ ] **Step 1: Escribir el test del texto**

```ts
import { describe, expect, it } from "vitest";
import { seatFullCopy } from "./seat-full-copy";

describe("aviso de cupo", () => {
  it("traduce sector_lleno y deja pasar el resto", () => {
    expect(seatFullCopy("sector_lleno")).toBe("Este sector ya está lleno. La persona sigue en espera.");
    expect(seatFullCopy("ERROR: sector_lleno")).toBe("Este sector ya está lleno. La persona sigue en espera.");
    expect(seatFullCopy("aceptar")).toBe("No se pudo aceptar.");
    expect(seatFullCopy(undefined)).toBe("");
  });
});
```

- [ ] **Step 2: Correr el test y verlo fallar**

Run: `npx vitest run src/lib/cupo/seat-full-copy.test.ts`

Expected: FAIL porque `./seat-full-copy` no existe.

- [ ] **Step 3: Implementar el texto y conectar el CRM**

`src/lib/cupo/seat-full-copy.ts`:

```ts
export function seatFullCopy(code: string | undefined) {
  if (!code) return "";
  if (code.includes("sector_lleno")) return "Este sector ya está lleno. La persona sigue en espera.";
  if (code === "aceptar") return "No se pudo aceptar.";
  return "";
}
```

En `applyEvent` de `src/lib/crm-actions.ts`, el ramo `aceptar` queda así y la función devuelve el código:

```ts
if (event === "aceptar") {
  const approved = await db.rpc("approve_link_signup", { contact_id: personId });
  if (approved.error?.message.includes("sector_lleno")) return "sector_lleno";
  if (approved.error) return "aceptar";
  return "";
}
```

`applyEvent` pasa a devolver `string`. `crmEventAction` usa ese valor:

```ts
const failed = await applyEvent(owner.id, account.id, personId, event);
const error = failed ? `&error=${failed}` : "";
redirect(`/${owner.slug}/crm?vista=${vista}${error}`);
```

Los otros eventos devuelven `""`.

En `src/app/[sector]/crm/page.tsx`, encima del encabezado, con `Alert` y `AlertDescription` de `@/components/ui/alert`:

```tsx
{seatFullCopy(query.error) ? (
  <Alert variant="destructive">
    <AlertDescription>{seatFullCopy(query.error)}</AlertDescription>
  </Alert>
) : null}
```

Si `page.tsx` pasa de 90 líneas, mueve el aviso a `src/components/organismo/seat-full-alert.tsx`.

- [ ] **Step 4: Correr los tests**

Run: `npx vitest run src/lib/cupo/seat-full-copy.test.ts src/lib/organismo/crm-view.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/cupo/seat-full-copy.ts src/lib/cupo/seat-full-copy.test.ts src/lib/crm-actions.ts src/app/[sector]/crm/page.tsx
git commit -m "$(cat <<'EOF'
feat: el organismo ve que el sector está lleno al aceptar

EOF
)"
```

---

### Task 6: El superadmin ve el mismo aviso

**Files:**
- Modify: `src/app/admin/empresas/[id]/page.tsx`
- Modify: `src/app/api/admin/crm/[id]/evento/route.ts`

La ruta de aceptar empresa ya redirige con `error` igual al mensaje de Postgres. La ficha hoy pinta ese mensaje crudo. Hay que pasar por `seatFullCopy` y, si no traduce, conservar el texto que ya había. La ruta del CRM admin, cuando `approve_link_signup` falla con `sector_lleno`, redirige con `error=sector_lleno` en lugar del mensaje crudo.

- [ ] **Step 1: Escribir el recorte de la ficha en un test de lectura**

Agregar en `src/lib/admin/empresas/detail.test.ts`:

```ts
it("la ficha traduce sector_lleno", () => {
  const page = readFileSync("src/app/admin/empresas/[id]/page.tsx", "utf8");
  const crm = readFileSync("src/app/admin/crm/[id]/page.tsx", "utf8");
  expect(page).toContain("seatFullCopy");
  expect(crm).toContain("seatFullCopy");
});
```

- [ ] **Step 2: Correr ese test y verlo fallar**

Run: `npx vitest run src/lib/admin/empresas/detail.test.ts`

Expected: FAIL porque la ficha todavía imprime `query.error` directo.

- [ ] **Step 3: Traducir los dos avisos**

En la ficha:

```tsx
const notice = seatFullCopy(query.error) || query.error;
{notice ? <p className="text-small text-mark">{notice}</p> : null}
```

`text-mark` es el aviso que esa ficha ya usa. No agregues `alert()`.

En `src/app/api/admin/crm/[id]/evento/route.ts`, al fallar `approve_link_signup`:

```ts
const code = approved.error.message.includes("sector_lleno") ? "sector_lleno" : approved.error.message;
return NextResponse.redirect(new URL(`${back}&error=${encodeURIComponent(code)}`, request.url));
```

En `src/app/admin/crm/[id]/page.tsx`, la línea que pinta `query.error` queda:

```tsx
const notice = seatFullCopy(query.error) || query.error;
{notice ? <p className="text-small text-mark">{notice}</p> : null}
```

- [ ] **Step 4: Correr el test**

Run: `npx vitest run src/lib/admin/empresas/detail.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/admin/empresas/[id]/page.tsx src/app/api/admin/crm/[id]/evento/route.ts src/lib/admin/empresas/detail.test.ts
git commit -m "$(cat <<'EOF'
feat: el superadmin ve que el sector está lleno al aceptar

EOF
)"
```

---

### Task 7: La barra en el detalle del sector

**Files:**
- Create: `supabase/migrations/20261027170300_sector_pace_rpc.sql`
- Create: `src/lib/organismo/load-sector-pace.ts`
- Create: `src/components/organismo/sector-pace-bar.tsx`
- Modify: `src/components/organismo/home.tsx`
- Modify: `src/lib/cupo/sector-quota-sql.test.ts`

`public.sector_pace(p_sector_id uuid)` devuelve `capacity`, `mine`, `others`. Solo el superadmin o un director o capturista de su organismo. `mine` son ocupados cuyo contacto `enlace` es de `private.current_organization_id()`. `others` es el total ocupado menos `mine`, nunca negativo. Sin sesión vigente o sin fila de cupo, `capacity` vuelve null.

La barra solo se monta cuando el panel trae `?corte=`. Usa `sectorPace`. Tramo propio `var(--brand-primary)`, tramo de los demás `var(--brand-secondary)`, resto vacío. Leyenda «De este organismo» y «De los demás». Texto `{filled}/{capacity} · {free} lugares`. Con `open: false`, el párrafo «Esta sesión no tiene cupo para este sector.»

- [ ] **Step 1: Ampliar el test de SQL**

```ts
it("el organismo lee su tramo y el del resto", () => {
  const rpc = readFileSync("supabase/migrations/20261027170300_sector_pace_rpc.sql", "utf8");
  expect(rpc).toContain("function public.sector_pace(p_sector_id uuid)");
  expect(rpc).toContain("private.current_organization_id()");
  expect(rpc).toContain("private.sector_occupied_ids");
  expect(rpc).toContain("grant execute on function public.sector_pace(uuid) to authenticated");
});
```

- [ ] **Step 2: Correr el test y verlo fallar**

Run: `npx vitest run src/lib/cupo/sector-quota-sql.test.ts`

Expected: FAIL porque el RPC no existe.

- [ ] **Step 3: RPC, carga y barra**

El RPC, en `security definer` y `search_path = ''`, rechaza si `auth.uid()` es null. Rechaza si no es superadmin y el rol no es `director` ni `capturista`. `capacity` sale de la fila `is_current`. Los ids ocupados salen de `private.sector_occupied_ids`. `mine` es cuántos de esos ids tienen un contacto `enlace` de `private.current_organization_id()` con estado aceptado y el mismo correo del perfil. `others = greatest(total - mine, 0)`.

`load-sector-pace.ts` resuelve el slug a `sectors.id`, llama el RPC con `orgDb()` y pasa los tres números a `sectorPace`. Sin cliente, devuelve `{ open: false }`.

`sector-pace-bar.tsx` recibe el resultado de `sectorPace`. Menos de 90 líneas. `home.tsx` la pone debajo de `CopyLink` solo si `chosen` existe:

```tsx
{chosen ? <SectorPaceBar slug={chosen.slug} name={chosen.name} /> : null}
```

`SectorPaceBar` es un server component que llama `loadSectorPace`. Si `home.tsx` pasa de 90 líneas, deja la llamada en un archivo nuevo `src/components/organismo/sector-pace.tsx`.

- [ ] **Step 4: Correr el test de SQL**

Run: `npx vitest run src/lib/cupo/sector-quota-sql.test.ts src/lib/cupo/sector-pace.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20261027170300_sector_pace_rpc.sql src/lib/organismo/load-sector-pace.ts src/components/organismo/sector-pace-bar.tsx src/components/organismo/home.tsx src/lib/cupo/sector-quota-sql.test.ts
git commit -m "$(cat <<'EOF'
feat: el organismo ve cuántos lugares quedan en su sector

EOF
)"
```

---

### Task 8: El empresario cancela y suelta el lugar

**Files:**
- Create: `supabase/migrations/20261027170200_cancel_attendance.sql`
- Create: `src/lib/onboarding/cancel-attendance.ts`
- Create: `src/components/onboarding/cancel-attendance.tsx`
- Modify: `src/app/onboarding/supabase-screen.tsx`
- Modify: `src/lib/cupo/sector-quota-sql.test.ts`

`public.cancel_my_attendance(p_reason text)` exige sesión, recorta el texto y exige longitud de 1 a 280. Busca la empresa del `auth.uid()`. Si esa empresa no está en `private.sector_occupied_ids`, lanza `todavia_no_ocupa`. Si ya hay cancelación, lanza `ya_cancelo`. Si no, inserta la fila. No borra CRM ni empresa.

El formulario se muestra en el onboarding solo cuando `my_attendance_state()` devuelve `ocupa`. Estados: `sin_empresa`, `espera`, `ocupa`, `cancelo`. En `cancelo` se lee el motivo, sin formulario. El submit es un server action que llama el RPC. El error `todavia_no_ocupa` muestra «Todavía no ocupas un lugar.» Un motivo vacío no se envía: el textarea es `required` y `maxLength={280}`.

- [ ] **Step 1: Ampliar el test de SQL**

```ts
it("cancelar exige motivo y solo suelta a quien ocupa", () => {
  const sql = readFileSync("supabase/migrations/20261027170200_cancel_attendance.sql", "utf8");
  expect(sql).toContain("function public.cancel_my_attendance(p_reason text)");
  expect(sql).toContain("function public.my_attendance_state()");
  expect(sql).toContain("raise exception 'todavia_no_ocupa'");
  expect(sql).toContain("raise exception 'ya_cancelo'");
  expect(sql).toContain("private.sector_occupied_ids");
  expect(sql).toContain("grant execute on function public.cancel_my_attendance(text) to authenticated");
  expect(sql).toContain("grant execute on function public.my_attendance_state() to authenticated");
});
```

- [ ] **Step 2: Correr el test y verlo fallar**

Run: `npx vitest run src/lib/cupo/sector-quota-sql.test.ts`

Expected: FAIL porque la migración de cancelación no existe.

- [ ] **Step 3: RPC, action y formulario**

`my_attendance_state` devuelve `text`. Sin empresa del usuario: `sin_empresa`. Con fila en `attendance_cancellations`: `cancelo`. Si el id está en `private.sector_occupied_ids(sector de la empresa)`: `ocupa`. Si no: `espera`.

`cancel-attendance.ts` llama `cancel_my_attendance` con el token del usuario. Traduce `todavia_no_ocupa` y `ya_cancelo`. Motivo vacío devuelve `{ ok: false, reason: "Escribe por qué cancelas." }` sin llamar al RPC.

`cancel-attendance.tsx` es un client component con `useActionState` o un form de server action. Un `textarea` con nombre `reason`. El error va en `Alert variant="destructive"`. El éxito deja el texto «Cancelaste tu lugar.» Más el motivo guardado, leído al recargar porque `my_attendance_state` ya es `cancelo`.

En `supabase-screen.tsx`, si `onboarded` y el estado es `ocupa` o `cancelo`, monta el formulario debajo del wizard. Si el archivo pasa de 90 líneas, ese montaje vive en `src/components/onboarding/attendance-slot.tsx`.

- [ ] **Step 4: Correr el test**

Run: `npx vitest run src/lib/cupo/sector-quota-sql.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20261027170200_cancel_attendance.sql src/lib/onboarding/cancel-attendance.ts src/components/onboarding/cancel-attendance.tsx src/app/onboarding/supabase-screen.tsx src/lib/cupo/sector-quota-sql.test.ts
git commit -m "$(cat <<'EOF'
feat: el empresario cancela su lugar y el cupo lo suelta

EOF
)"
```

---

### Task 9: El tablero deja de contar al que canceló

**Files:**
- Modify: `src/lib/admin/tablero/sector-fill.ts`
- Modify: `src/lib/admin/tablero/sector-fill.test.ts`
- Modify: `src/lib/admin/tablero/load-cupos.ts`

`Seat` gana `released: boolean`. `sectorFill` se salta ese asiento: no suma ocupados ni pendientes. `load-cupos` lee los `company_id` de `attendance_cancellations` y marca `released` cuando el id de la empresa está en ese conjunto. Hay que seleccionar `id` en la consulta de `companies`.

- [ ] **Step 1: Ampliar el test de sectorFill**

En el `seat()` de `src/lib/admin/tablero/sector-fill.test.ts`, el default de `released` es `false`. Agregar:

```ts
it("quien canceló no ocupa ni queda pendiente", () => {
  const result = sectorFill(quotas, [seat({ sectorSlug: "turismo", released: true })]);
  expect(result.ocupados).toBe(0);
  expect(result.pendientes).toBe(0);
  expect(result.rows[0].ocupados).toBe(0);
});
```

- [ ] **Step 2: Correr el test y verlo fallar**

Run: `npx vitest run src/lib/admin/tablero/sector-fill.test.ts`

Expected: FAIL porque `released` no existe en `Seat`.

- [ ] **Step 3: Saltar cancelados**

En el ciclo de `sectorFill`, antes de `ready`:

```ts
if (seat.released) continue;
```

En `load-cupos.ts`, junto a las otras lecturas, `db.from("attendance_cancellations").select("company_id")`. El `toSeat` recibe el set y pone `released: cancelled.has(row.id)`.

- [ ] **Step 4: Correr el test**

Run: `npx vitest run src/lib/admin/tablero/sector-fill.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/admin/tablero/sector-fill.ts src/lib/admin/tablero/sector-fill.test.ts src/lib/admin/tablero/load-cupos.ts
git commit -m "$(cat <<'EOF'
feat: el tablero no cuenta a quien canceló su lugar

EOF
)"
```

---

## Cobertura del spec

- 19 aceptados y 3 en espera, el lugar 20 entra y el 21 responde `sector_lleno`: task 2. El SQL de las tasks 3 y 4 tiene que comportarse como `acceptSeat`.
- La espera no resta y el alta sin organismo cae en «los demás»: task 2, barra en task 7.
- El aviso en organismo y superadmin: tasks 5 y 6.
- La barra `15/20` con dos colores en `?corte=`: task 7, con los números de `paceFor`.
- Cancelar con motivo suelta el lugar y nadie entra solo: tasks 2 y 8. La siguiente aceptación vuelve a pasar por `sector_is_full`.
- Quien ya estaba aceptado se queda: no hay migración que borre aceptaciones.
- Sin fila de cupo no se bloquea: task 2 y `sector_is_full` cuando `cap` es null.
- El tablero deja fuera al cancelado: task 9.
