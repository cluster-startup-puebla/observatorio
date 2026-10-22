# Panel del organismo en /{slug} Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Un organismo se registra solo, termina su marca y entra a `/{slug}` (por ejemplo `/coparmex-puebla`) con el mismo shell del superadmin y tres entradas: Inicio, Invitaciones y CRM.

**Architecture:** `src/app/[sector]` sigue siendo la landing pública. Si el segmento es el `slug` de un organismo, el mismo segmento renderiza el panel. El slug no puede repetir un sector. La máquina de `src/lib/crm-status.ts` no cambia: el panel solo agrupa los hechos en pendiente, contactado y confirmado. El enlace cifrado sigue siendo `sealRef` (`src/lib/ref-token.ts`): `{origen}/{sector}?{token}`, sin `ref=`. Playwright corre con `DIRECTORY=memory`; el slug, las aperturas y la conversión viven primero en ese directorio. La migración SQL deja el mismo contrato en Supabase.

**Tech Stack:** Next.js 16 App Router, shadcn Sidebar ya usado por el superadmin, Supabase Auth + Postgres, Vitest, Playwright, Recharts (los charts de `src/app/admin/tablero`).

---

## Decisiones cerradas

- Alta que ya existe: `/register?cuenta=organismo` crea la cuenta y `/onboarding` pide nombre, color y logo. Se agrega el slug, derivado del nombre si el campo viene vacío, para no romper el e2e que solo llena el nombre.
- Ejemplo del pizarrón: «Coparmex Puebla» entra a `/coparmex-puebla`. El slug se puede editar en el wizard. `copamex-puebla` solo sale si así lo escriben.
- Menú, un grupo «Panel» dentro de `AppSidebar`: Inicio `/{slug}`, Invitaciones `/{slug}/invitaciones`, CRM `/{slug}/crm`. Sale «Analítica / Próximamente». Las cifras del enlace viven en Inicio.
- CRM: `?vista=tabla|tarjetas` y `?estado=pendiente|contactado|confirmado`.
- Cubetas, sin tocar la máquina:

  | Cubeta | Hechos que ya existen |
  | --- | --- |
  | pendiente | `cargado` |
  | contactado | `contactado` |
  | confirmado | `confirmo`, `registrado`, `llego` |

  `no` no entra en las tres. El organismo solo dispara `contactar`. Confirmado lo prende la persona al crear su cuenta (`confirmar`), no un select.
- Invitaciones: alta manual (nombre, empresa, correo), CSV `nombre,empresa,correo` que ya parsea `parseInviteSheet`, y correos sueltos (uno por línea o archivo `.txt`). El correo suelto guarda nombre = parte local y empresa = `Por confirmar`, source `excel`, hecho `cargar`.
- Inicio: elige sector, copia `{origen}/{sector}?{token}`, cards de aperturas, conversiones y tasa, barra de aperturas de 14 días. Una recarga cuenta como otra apertura. Conversión = `conversion().registrations` del directorio (registros atribuidos a ese organismo).
- `/organismo` redirige a `/{slug}` cuando la marca ya tiene slug. El chrome público (`SiteFrame`) no envuelve el panel: una cookie `org-slug` lo reconoce.
- Cada archivo `.ts` / `.tsx` nuevo o editado queda en 90 líneas o menos. No se edita `src/components/admin/nav.ts`.

## Mapa de archivos

| Archivo | Responsabilidad |
| --- | --- |
| `src/lib/organismo/slug.ts` | Slug desde el nombre y rechazo si choca con un sector. |
| `src/lib/organismo/estado.ts` | Cubeta y etiqueta de los tres estados. |
| `src/lib/organismo/email-list.ts` | Correos sueltos → filas de invitación. |
| `src/lib/organismo/link-stats.ts` | Cards y barras de 14 días. |
| `src/lib/organismo/nav.ts` | Los tres href del slug. |
| `src/lib/organismo/owner.ts` | Dueño en memoria por slug. |
| `src/lib/memory/store.ts` | `orgSlug` en la persona y `opens[]`. |
| `src/app/[sector]/layout.tsx` | Shell solo si el segmento es un organismo. |
| `src/app/[sector]/page.tsx` | Landing o Inicio. |
| `src/app/[sector]/invitaciones/page.tsx` | Alta, CSV y correos. |
| `src/app/[sector]/crm/page.tsx` | Tabla y tarjetas. |
| `src/components/organismo/shell.tsx` | `SidebarProvider` + `AppSidebar`. |
| `src/components/site/site-frame.tsx` | Sin header público cuando la cookie coincide con el path. |
| `supabase/migrations/20261022120000_organization_slug_and_opens.sql` | `organizations.slug` y `link_opens`. |

---

### Task 1: Slug que no pisa un sector

**Files:**
- Create: `src/lib/organismo/slug.ts`
- Create: `src/lib/organismo/slug.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { orgSlug, slugError } from "./slug";

describe("slug del organismo", () => {
  const sectors = ["turismo", "automotriz-y-autopartes"];

  it("sale del nombre y respeta uno escrito", () => {
    expect(orgSlug("Coparmex Puebla", "")).toBe("coparmex-puebla");
    expect(orgSlug("Coparmex Puebla", "copamex-puebla")).toBe("copamex-puebla");
    expect(orgSlug("CANACINTRA", "")).toBe("canacintra");
  });

  it("rechaza vacío, corto y un sector", () => {
    expect(slugError("", sectors)).toBe("slug inválido");
    expect(slugError("a", sectors)).toBe("slug inválido");
    expect(slugError("turismo", sectors)).toBe("ese enlace es de un sector");
    expect(slugError("coparmex-puebla", sectors)).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/organismo/slug.test.ts`

Expected: FAIL. No existe `./slug`.

- [ ] **Step 3: Write minimal implementation**

`src/lib/organismo/slug.ts`

```ts
import { sectorSlug } from "@/lib/sectors";

export function orgSlug(name: string, explicit: string) {
  const raw = explicit.trim() || name.trim();
  return sectorSlug(raw);
}

export function slugError(slug: string, sectorSlugs: readonly string[]) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length < 2) return "slug inválido";
  if (sectorSlugs.includes(slug)) return "ese enlace es de un sector";
  return null;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/organismo/slug.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/organismo/slug.ts src/lib/organismo/slug.test.ts
git commit -m "$(cat <<'EOF'
feat: el slug del organismo no puede ser un sector

EOF
)"
```

---

### Task 2: Tres cubetas sobre la máquina actual

**Files:**
- Create: `src/lib/organismo/estado.ts`
- Create: `src/lib/organismo/estado.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { orgEstado, orgEstadoLabel } from "./estado";

describe("cubetas del organismo", () => {
  it("agrupa los hechos sin renombrar la máquina", () => {
    expect(orgEstado("cargado")).toBe("pendiente");
    expect(orgEstado("contactado")).toBe("contactado");
    expect(orgEstado("confirmo")).toBe("confirmado");
    expect(orgEstado("registrado")).toBe("confirmado");
    expect(orgEstado("llego")).toBe("confirmado");
    expect(orgEstado("no")).toBeNull();
    expect(orgEstadoLabel("cargado")).toBe("Pendiente");
    expect(orgEstadoLabel("contactado")).toBe("Contactado");
    expect(orgEstadoLabel("confirmo")).toBe("Confirmado");
    expect(orgEstadoLabel("no")).toBe("No");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/organismo/estado.test.ts`

Expected: FAIL. No existe `./estado`.

- [ ] **Step 3: Write minimal implementation**

`src/lib/organismo/estado.ts`

```ts
export type OrgEstado = "pendiente" | "contactado" | "confirmado";

const bucket: Record<string, OrgEstado | undefined> = {
  cargado: "pendiente",
  contactado: "contactado",
  confirmo: "confirmado",
  registrado: "confirmado",
  llego: "confirmado",
};

const labels: Record<OrgEstado, string> = {
  pendiente: "Pendiente",
  contactado: "Contactado",
  confirmado: "Confirmado",
};

export function orgEstado(status: string): OrgEstado | null {
  return bucket[status] ?? null;
}

export function orgEstadoLabel(status: string) {
  const estado = orgEstado(status);
  return estado ? labels[estado] : "No";
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/organismo/estado.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/organismo/estado.ts src/lib/organismo/estado.test.ts
git commit -m "$(cat <<'EOF'
feat: el panel del organismo muestra tres estados

EOF
)"
```

---

### Task 3: Correos sueltos a filas de invitación

**Files:**
- Create: `src/lib/organismo/email-list.ts`
- Create: `src/lib/organismo/email-list.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { invitesFromEmails } from "./email-list";

describe("correos sueltos", () => {
  it("arma filas y reporta el resto", () => {
    const parsed = invitesFromEmails("Ana@Norte.mx\nana@norte.mx\nno-es-correo\n\nbeto@sur.mx");
    expect(parsed.ok).toEqual([
      { nombre: "Ana", empresa: "Por confirmar", correo: "ana@norte.mx" },
      { nombre: "beto", empresa: "Por confirmar", correo: "beto@sur.mx" },
    ]);
    expect(parsed.errors).toEqual([
      { row: 2, reason: "correo repetido" },
      { row: 3, reason: "correo inválido" },
    ]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/organismo/email-list.test.ts`

Expected: FAIL. No existe `./email-list`.

- [ ] **Step 3: Write minimal implementation**

`src/lib/organismo/email-list.ts`

```ts
import type { InviteRow, InviteRowError } from "@/lib/invite-sheet";

export function invitesFromEmails(text: string): { ok: InviteRow[]; errors: InviteRowError[] } {
  const ok: InviteRow[] = [];
  const errors: InviteRowError[] = [];
  const seen = new Set<string>();
  text.split(/\r?\n/).forEach((line, index) => {
    const correo = line.trim().toLowerCase();
    if (!correo) return;
    const row = index + 1;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      errors.push({ row, reason: "correo inválido" });
      return;
    }
    if (seen.has(correo)) {
      errors.push({ row, reason: "correo repetido" });
      return;
    }
    seen.add(correo);
    const local = correo.split("@")[0] ?? correo;
    const nombre = local.charAt(0).toUpperCase() + local.slice(1);
    ok.push({ nombre, empresa: "Por confirmar", correo });
  });
  return { ok, errors };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/organismo/email-list.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/organismo/email-list.ts src/lib/organismo/email-list.test.ts
git commit -m "$(cat <<'EOF'
feat: una lista de correos crea filas de invitación

EOF
)"
```

---

### Task 4: Cards y barras del enlace

**Files:**
- Create: `src/lib/organismo/link-stats.ts`
- Create: `src/lib/organismo/link-stats.test.ts`

Reusa `mexicoDay` y `dayLabel` de `src/lib/admin/tablero/pace-bars.ts`. No los copies.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { linkStats } from "./link-stats";

describe("cifras del enlace", () => {
  it("cuenta aperturas, conversiones y 14 días", () => {
    const now = new Date("2026-10-22T18:00:00.000Z");
    const stats = linkStats({
      opens: [
        { at: "2026-10-22T15:00:00.000Z" },
        { at: "2026-10-22T16:00:00.000Z" },
        { at: "2026-10-01T16:00:00.000Z" },
      ],
      conversions: 1,
      now,
    });
    expect(stats.opens).toBe(3);
    expect(stats.conversions).toBe(1);
    expect(stats.rate).toBe(33);
    expect(stats.bars).toHaveLength(14);
    expect(stats.bars[13]).toMatchObject({ aperturas: 2 });
    expect(stats.bars[0].aperturas).toBe(0);
  });

  it("la tasa es 0 si nadie abrió", () => {
    const stats = linkStats({ opens: [], conversions: 4, now: new Date("2026-10-22T18:00:00.000Z") });
    expect(stats.rate).toBe(0);
    expect(stats.conversions).toBe(4);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/organismo/link-stats.test.ts`

Expected: FAIL. No existe `./link-stats`.

- [ ] **Step 3: Write minimal implementation**

`src/lib/organismo/link-stats.ts`

```ts
import { dayLabel, mexicoDay } from "@/lib/admin/tablero/pace-bars";

const days = 14;

function shiftDay(day: string, delta: number) {
  const [year, month, date] = day.split("-").map(Number);
  return mexicoDay(new Date(Date.UTC(year, month - 1, date + delta, 18)));
}

export function linkStats(input: { opens: { at: string }[]; conversions: number; now: Date }) {
  const end = mexicoDay(input.now);
  const axis = Array.from({ length: days }, (_, index) => shiftDay(end, index - (days - 1)));
  const counts = new Map(axis.map((day) => [day, 0]));
  for (const open of input.opens) {
    const parsed = new Date(open.at);
    if (Number.isNaN(parsed.getTime())) continue;
    const day = mexicoDay(parsed);
    if (!counts.has(day)) continue;
    counts.set(day, (counts.get(day) ?? 0) + 1);
  }
  const rate = input.opens.length === 0 ? 0 : Math.round((input.conversions / input.opens.length) * 100);
  return {
    opens: input.opens.length,
    conversions: input.conversions,
    rate,
    bars: axis.map((day) => ({ dia: dayLabel(day), aperturas: counts.get(day) ?? 0 })),
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/organismo/link-stats.test.ts`

Expected: PASS. Si el día 14 no cae en 2, el fallo es la zona `America/Mexico_City`: ajusta la hora del fixture, no la fórmula. `2026-10-22T15:00:00.000Z` es el 22 en México.

- [ ] **Step 5: Commit**

```bash
git add src/lib/organismo/link-stats.ts src/lib/organismo/link-stats.test.ts
git commit -m "$(cat <<'EOF'
feat: cifras de aperturas y conversión del enlace

EOF
)"
```

---

### Task 5: Guardar el slug al terminar la marca

**Files:**
- Modify: `src/lib/memory/store.ts`
- Modify: `src/lib/memory/onboarding.ts`
- Modify: `src/lib/directory.ts`
- Modify: `src/lib/account-actions.ts`
- Modify: `src/components/onboarding/organismo-form.tsx`
- Test: `src/lib/organismo/slug-save.test.ts`

El director en memoria es la persona con `role === "director"` y sin `orgId`. Su `id` ya es el id que `importInvites` usa como organismo. El slug se guarda en esa persona.

- [ ] **Step 1: Write the failing test**

```ts
import { beforeEach, describe, expect, it } from "vitest";
import { getDirectory, resetDirectory } from "@/lib/memory-directory";

describe("marca con slug", () => {
  beforeEach(() => resetDirectory());

  it("CANACINTRA queda en canacintra", async () => {
    const directory = getDirectory();
    const org = await directory.createAccount({ email: "director@canacintra.mx", role: "director" });
    await directory.completeOnboarding(org.id, {
      sectorSlug: "general",
      size: "organismo",
      name: "CANACINTRA",
      logoKey: "logos/1",
    });
    const account = await directory.getAccount(org.id);
    expect(account?.orgSlug).toBe("canacintra");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/organismo/slug-save.test.ts`

Expected: FAIL. `orgSlug` es `undefined`.

- [ ] **Step 3: Write minimal implementation**

En `Person` (`src/lib/memory/store.ts`) agrega `orgSlug?: string`.

En `Directory.getAccount` y en el retorno de `onboardingMethods`, agrega `orgSlug?: string`.

En `Directory.completeOnboarding`, el perfil acepta `slug?: string`.

Dentro de `completeOnboarding`, después de asignar `name`:

```ts
import { orgSlug } from "@/lib/organismo/slug";

if (person.role === "director") {
  person.orgSlug = orgSlug(profile.name ?? "", profile.slug ?? "");
}
```

Y en el objeto que regresa `getAccount`, incluye `orgSlug: person.orgSlug`.

`completeOrganismoAction` en `src/lib/account-actions.ts` deriva el slug, lo valida contra `sectors.map((sector) => sector.slug)` y, si hay error, redirige a `/onboarding?error=slug`. Si pasa, manda `slug` a `completeOnboarding` y redirige a `` `/${slug}` ``. Ahí también fija la cookie:

```ts
import { cookies } from "next/headers";

const jar = await cookies();
jar.set("org-slug", slug, { path: "/", httpOnly: false, sameSite: "lax" });
```

La cookie no es httpOnly porque `SiteFrame` la lee en el servidor vía `cookies()`, no desde `document`. `httpOnly: true` también sirve: el layout raíz es servidor. Déjala `httpOnly: true`.

En `organismo-form.tsx`, debajo del nombre, un campo:

```tsx
<Field id="slug-organismo" label="Enlace del panel">
  <input id="slug-organismo" name="slug" placeholder="coparmex-puebla" className={controlClass} />
</Field>
```

El botón «Copiar enlace del evento» se queda `disabled` en el wizard. El aviso de error:

```tsx
{/* la página de onboarding pasa missingSlug={params.error === "slug"} */}
{missingSlug ? <p className="text-small text-mark">Ese enlace no está disponible.</p> : null}
```

`OnboardingWizard` reenvía `missingSlug` a `OrganismoOnboarding`. Si el archivo pasa de 90 líneas, saca el campo de slug a `src/components/onboarding/slug-field.tsx`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/organismo/slug-save.test.ts src/lib/memory-directory.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/memory/store.ts src/lib/memory/onboarding.ts src/lib/directory.ts src/lib/account-actions.ts src/components/onboarding/organismo-form.tsx src/components/onboarding/onboarding-wizard.tsx src/app/onboarding/page.tsx src/lib/organismo/slug-save.test.ts
git commit -m "$(cat <<'EOF'
feat: al terminar la marca el organismo entra por su slug

EOF
)"
```

---

### Task 6: Dueño por slug y shell de tres entradas

**Files:**
- Create: `src/lib/organismo/nav.ts`
- Create: `src/lib/organismo/owner.ts`
- Create: `src/lib/organismo/nav.test.ts`
- Create: `src/components/organismo/shell.tsx`
- Modify: `src/components/app-sidebar.tsx` (un icono, el archivo sigue bajo 90)
- Modify: `src/lib/auth/home.ts`
- Modify: `src/lib/auth/home.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { bestMatchingHref } from "@/components/admin/nav-match";
import { homeForRole } from "@/lib/auth/home";
import { orgLinks } from "./nav";

describe("nav del organismo", () => {
  it("tres rutas y el home no se come al CRM", () => {
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

  it("con slug el director ya no cae en /organismo", () => {
    expect(homeForRole("director")).toBe("/organismo");
    expect(homeForRole("director", "canacintra")).toBe("/canacintra");
    expect(homeForRole("capturista", "canacintra")).toBe("/canacintra");
    expect(homeForRole("invitador", "canacintra")).toBe("/canacintra");
    expect(homeForRole("superadmin", "canacintra")).toBe("/admin");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/organismo/nav.test.ts`

Expected: FAIL. No existe `./nav`. `homeForRole` todavía ignora el segundo argumento: el test de director con slug falla después de crear el archivo de nav, hasta el step 3.

- [ ] **Step 3: Write minimal implementation**

`src/lib/organismo/nav.ts`

```ts
import type { AdminLink } from "@/components/admin/nav";

export function orgLinks(slug: string): AdminLink[] {
  const root = `/${slug}`;
  return [
    { href: root, label: "Inicio", group: "Panel" },
    { href: `${root}/invitaciones`, label: "Invitaciones", group: "Panel" },
    { href: `${root}/crm`, label: "CRM", group: "Panel" },
  ];
}

export function orgGroups(slug: string) {
  return [{ name: "Panel", links: orgLinks(slug) }];
}
```

`src/lib/auth/home.ts`: firma `homeForRole(role: AccountRole, slug?: string | null)`. Si el rol es `director`, `capturista` o `invitador` y hay slug, regresa `` `/${slug}` ``. Sin slug, `/organismo`. El resto no cambia. Actualiza `home.test.ts` para cubrir el segundo argumento sin borrar los casos de un solo argumento.

`src/lib/organismo/owner.ts`

```ts
import "server-only";

import { getDirectory } from "@/lib/memory-directory";
import { memoryStore } from "@/lib/memory/store";
import { usesSupabaseAuth } from "@/lib/supabase/auth-session";

export type OrgOwner = { id: string; slug: string; name: string; email: string };

export async function ownerBySlug(slug: string): Promise<OrgOwner | null> {
  if (usesSupabaseAuth()) return null;
  const person = memoryStore().people.find((item) => item.orgSlug === slug && !item.orgId);
  if (!person?.orgSlug || !person.name) return null;
  const account = await getDirectory().getAccount(person.id);
  if (!account) return null;
  return { id: person.id, slug: person.orgSlug, name: person.name, email: account.email };
}
```

`usesSupabaseAuth() return null` es temporal: la task 12 lo reemplaza por la lectura de `organizations.slug`. No dejes el panel vacío en memory.

En `src/components/app-sidebar.tsx`, dentro de `icons`:

```ts
Panel: <LayoutDashboard />,
```

`src/components/organismo/shell.tsx`

```tsx
"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { orgGroups } from "@/lib/organismo/nav";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

export function OrgShell({
  slug,
  name,
  email,
  children,
}: {
  slug: string;
  name: string;
  email: string;
  children: React.ReactNode;
}) {
  return (
    <TooltipProvider>
      <SidebarProvider className="h-dvh min-h-0 overflow-hidden">
        <AppSidebar email={email} groups={orgGroups(slug)} title={name} subtitle="Organismo" />
        <SidebarInset className="min-h-0 overflow-hidden">
          <header className="flex h-12 shrink-0 items-center gap-2 border-b px-3">
            <SidebarTrigger />
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto p-6">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/organismo/nav.test.ts src/lib/auth/home.test.ts src/components/admin/nav-match.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/organismo/nav.ts src/lib/organismo/nav.test.ts src/lib/organismo/owner.ts src/components/organismo/shell.tsx src/components/app-sidebar.tsx src/lib/auth/home.ts src/lib/auth/home.test.ts
git commit -m "$(cat <<'EOF'
feat: el organismo tiene el shell del superadmin con tres entradas

EOF
)"
```

---

### Task 7: /{slug} muestra el panel y el sector sigue en la landing

**Files:**
- Create: `src/app/[sector]/layout.tsx`
- Create: `src/lib/organismo/member.ts`
- Modify: `src/app/[sector]/page.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/components/site/site-frame.tsx`
- Modify: `src/app/organismo/page.tsx`
- Modify: `src/lib/auth/logout-action.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("dispatch del segmento", () => {
  it("el layout solo monta el shell si hay organismo", () => {
    const layout = readFileSync("src/app/[sector]/layout.tsx", "utf8");
    expect(layout).toContain("ownerBySlug");
    expect(layout).toContain("OrgShell");
    expect(layout).toContain("return children");
  });

  it("la landing no se pinta cuando el slug es de un organismo", () => {
    const page = readFileSync("src/app/[sector]/page.tsx", "utf8");
    expect(page).toContain("ownerBySlug");
    expect(page).toContain("OrgHome");
    expect(page).toContain("LandingBody");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/organismo/dispatch.test.ts`

Expected: FAIL. No existe el layout.

- [ ] **Step 3: Write minimal implementation**

`src/lib/organismo/member.ts`

```ts
import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { readSessionAccount } from "@/lib/auth/session-account";
import type { OrgOwner } from "./owner";

export async function requireOrgMember(owner: OrgOwner) {
  const account = await readSessionAccount();
  if (!account) redirect(`/login?next=/${owner.slug}`);
  if (account.id !== owner.id) redirect("/organismo");
  const jar = await cookies();
  jar.set("org-slug", owner.slug, { path: "/", httpOnly: true, sameSite: "lax" });
  return account;
}
```

Capturista e invitador todavía no tienen `organization_id` en el directorio de memoria. Esta task deja pasar solo al director dueño (`account.id === owner.id`). La task 12, en Supabase, compara `profiles.organization_id`.

`src/app/[sector]/layout.tsx`

```tsx
import { OrgShell } from "@/components/organismo/shell";
import { requireOrgMember } from "@/lib/organismo/member";
import { ownerBySlug } from "@/lib/organismo/owner";

export const instant = false;

export default async function SectorLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ sector: string }>;
}) {
  const { sector } = await params;
  const owner = await ownerBySlug(sector);
  if (!owner) return children;
  const account = await requireOrgMember(owner);
  return (
    <OrgShell slug={owner.slug} name={owner.name} email={account.email}>
      {children}
    </OrgShell>
  );
}
```

`src/app/[sector]/page.tsx`: al inicio, `const owner = await ownerBySlug(sector)`. Si hay owner, regresa `<OrgHome slug={owner.slug} name={owner.name} />`. Si no, deja la landing como está. `OrgHome` vive en `src/components/organismo/home.tsx` y en esta task solo pinta el h1 con el nombre y el botón de copiar deshabilitado hasta la task 8. Mantén `eventToken` y `LandingBody` en el ramo público.

`src/app/layout.tsx` lee la cookie y se la pasa a `SiteFrame`:

```tsx
import { cookies } from "next/headers";

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const orgSlug = (await cookies()).get("org-slug")?.value ?? "";
  // ...el html no cambia...
  <SiteFrame orgSlug={orgSlug}>{children}</SiteFrame>
}
```

`instant` no hace falta en el root si ya lee cookies por ser layout. No agregues `export const instant` aquí si el build se queja: este layout ya es dinámico por `cookies()`.

En `SiteFrame`, prop `orgSlug = ""`. Antes del return público:

```tsx
const orgPanel = orgSlug.length > 0 && (path === `/${orgSlug}` || path.startsWith(`/${orgSlug}/`));
if (panel || orgPanel) {
  return (
    <main id="contenido" className="h-dvh overflow-hidden">
      {children}
    </main>
  );
}
```

`src/app/organismo/page.tsx` queda así (el nav viejo sale de esta página; el layout de `/organismo` se vacía en el step de limpieza de esta misma task):

```tsx
import { redirect } from "next/navigation";
import { getDirectory } from "@/lib/memory-directory";
import { readAccountId } from "@/lib/session";

export const instant = false;

export default async function OrganismoRedirect() {
  const id = await readAccountId();
  const account = id ? await getDirectory().getAccount(id) : null;
  if (account?.orgSlug) redirect(`/${account.orgSlug}`);
  redirect("/onboarding");
}
```

Quita `OrganismoNav` del layout `src/app/organismo/layout.tsx`: ese layout solo llama `requireOrganismo()` y renderiza `children`. Si no, el redirect convive con el nav viejo un frame.

`logoutAction` borra la cookie: `jar.delete("org-slug")` antes del redirect.

`loginAction`: después de un login de memoria exitoso, `const account = await getDirectory().getAccount(result.id)` y `redirect(homeForRole(result.role, account?.orgSlug))`. Si hay slug, setea `org-slug`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/organismo/dispatch.test.ts src/lib/auth/home.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/[sector]/layout.tsx src/app/[sector]/page.tsx src/components/organismo/home.tsx src/lib/organismo/member.ts src/lib/organismo/dispatch.test.ts src/app/layout.tsx src/components/site/site-frame.tsx src/app/organismo/page.tsx src/app/organismo/layout.tsx src/lib/auth/logout-action.ts src/lib/auth/login-action.ts
git commit -m "$(cat <<'EOF'
feat: /{slug} abre el panel y el sector sigue en la landing

EOF
)"
```

---

### Task 8: Inicio con enlace, cards y gráfica

**Files:**
- Modify: `src/lib/memory/store.ts` (`opens`)
- Modify: `src/lib/memory/events.ts`
- Modify: `src/lib/directory.ts`
- Create: `src/components/organismo/link-cards.tsx`
- Create: `src/components/organismo/opens-chart.tsx`
- Create: `src/components/organismo/copy-link.tsx`
- Modify: `src/components/organismo/home.tsx`
- Modify: `src/lib/organismo-actions.ts`
- Modify: `src/app/[sector]/page.tsx` (registrar apertura en el ramo público)
- Test: `src/lib/organismo/opens.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { beforeEach, describe, expect, it } from "vitest";
import { getDirectory, resetDirectory } from "@/lib/memory-directory";

describe("aperturas", () => {
  beforeEach(() => resetDirectory());

  it("una visita válida suma y un token roto no", async () => {
    const directory = getDirectory();
    const org = await directory.createAccount({ email: "dir@camara.mx", role: "director" });
    await directory.completeOnboarding(org.id, {
      sectorSlug: "general",
      size: "organismo",
      name: "Cámara",
      logoKey: "logos/1",
    });
    const token = await directory.copyEventLink(org.id, "turismo");
    await directory.recordOpen({ token, sectorSlug: "turismo", at: "2026-10-22T15:00:00.000Z" });
    await directory.recordOpen({ token: `${token}x`, sectorSlug: "turismo", at: "2026-10-22T15:00:00.000Z" });
    const opens = await directory.opensFor(org.id);
    expect(opens).toEqual([{ at: "2026-10-22T15:00:00.000Z" }]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/organismo/opens.test.ts`

Expected: FAIL. `recordOpen` no existe.

- [ ] **Step 3: Write minimal implementation**

En `MemoryStore`, `opens: { orgId: string; sectorSlug: string; at: string }[]`. `emptyStore` lo inicia en `[]`.

En `Directory`:

```ts
recordOpen(input: { token: string; sectorSlug: string; at: string }): Promise<void>;
opensFor(orgId: string): Promise<{ at: string }[]>;
```

En `eventMethods`, `recordOpen` abre el token con `openRef`. Si no hay org, regresa. Si hay, empuja a `state.opens`. `opensFor` filtra por `orgId`.

En el ramo público de `src/app/[sector]/page.tsx`, cuando `token` y `resolved.slug` existen:

```ts
await getDirectory().recordOpen({
  token,
  sectorSlug: resolved.slug,
  at: new Date().toISOString(),
});
```

Eso corre aunque `brandForToken` regrese null (visita contada si el token abre). No cuentes si `openRef` falla: `recordOpen` ya lo ignora.

`copyEventLinkAction` recibe el sector del form (`name="sector"`), llama `copyEventLink`, y redirige a `` `/${account.orgSlug}?enlace=${encodeURIComponent(token)}&sector=${encodeURIComponent(sector)}` ``. Arma la URL visible como `` `${origin}/${sector}?${token}` ``. El origen sale de `headers().get("x-forwarded-host")` o `headers().get("host")`, con `https` si `x-forwarded-proto` es `https`, si no `http`.

`src/components/organismo/link-cards.tsx` — tres `<article>` como `TableroKpis`: Aperturas, Conversiones, Tasa (`${rate}%`). `data-testid`: `org-aperturas`, `org-conversiones`, `org-tasa`.

`src/components/organismo/opens-chart.tsx` — copia la forma de `PaceChart` con `dataKey="aperturas"`, título «Aperturas por día», hint «Visitas al enlace en los últimos 14 días.» El archivo queda solo. No importes `PaceChart`.

`src/components/organismo/copy-link.tsx` — form server `copyEventLinkAction`. Un `<select name="sector">` con `sectors` de `@/lib/sectors`. Botón «Copiar enlace del evento». Si llega `url`, un `<p data-testid="enlace-evento">` con la URL y un botón cliente que hace `navigator.clipboard.writeText(url)` y `toast.success("Enlace copiado.")` de `sonner`. Error de clipboard: `toast.error("No se pudo copiar.")`. Nada de `alert`.

`OrgHome` lee `opensFor`, suma `conversion(ownerId, sector)` de todos los sectores (la card es del organismo, no de un solo sector: suma `registrations`), arma `linkStats`, y pinta cards, chart y el form. Pasa de 90 líneas: parte en `src/lib/organismo/load-home.ts` (números) y deja el JSX en `home.tsx`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/organismo/opens.test.ts src/lib/crm-directory.test.ts src/lib/organismo/link-stats.test.ts`

Expected: PASS. `conversion()` sigue regresando `{ copies, registrations }` como antes.

- [ ] **Step 5: Commit**

```bash
git add src/lib/memory/store.ts src/lib/memory/events.ts src/lib/directory.ts src/lib/organismo/opens.test.ts src/lib/organismo/load-home.ts src/components/organismo/home.tsx src/components/organismo/link-cards.tsx src/components/organismo/opens-chart.tsx src/components/organismo/copy-link.tsx src/lib/organismo-actions.ts src/app/[sector]/page.tsx
git commit -m "$(cat <<'EOF'
feat: el inicio del organismo muestra aperturas y conversión

EOF
)"
```

---

### Task 9: Invitaciones manuales, CSV y correos

**Files:**
- Create: `src/app/[sector]/invitaciones/page.tsx`
- Create: `src/app/[sector]/invitaciones/plantilla/route.ts`
- Create: `src/components/organismo/email-box.tsx`
- Modify: `src/lib/organismo-actions.ts`
- Modify: `src/components/organismo/manual-invite.tsx`
- Modify: `src/components/organismo/invite-upload.tsx`

Los redirects de `uploadInvitesAction` y `createInviteAction` hoy van a `/organismo/crm`. Pásalos a `` `/${slug}/crm` ``. El slug sale de `getAccount(id).orgSlug`. Si no hay slug, redirect `/onboarding`.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { invitesFromEmails } from "./email-list";

describe("carga de invitaciones", () => {
  it("el correo suelto entra como fila cargable", () => {
    const row = invitesFromEmails("luz@norte.mx").ok[0];
    expect(row).toEqual({ nombre: "Luz", empresa: "Por confirmar", correo: "luz@norte.mx" });
  });

  it("las acciones redirigen al CRM del slug", () => {
    const source = readFileSync("src/lib/organismo-actions.ts", "utf8");
    expect(source).toContain("orgSlug");
    expect(source).not.toContain('redirect("/organismo/crm")');
    expect(source).toContain("invitesFromEmails");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/organismo/email-list.test.ts`

Expected: FAIL en la aserción del redirect. El caso del correo suelto ya pasó en la task 3; déjalo.

- [ ] **Step 3: Write minimal implementation**

Nueva acción en `src/lib/organismo-actions.ts`:

```ts
export async function uploadEmailsAction(formData: FormData) {
  const id = await readAccountId();
  const account = id ? await getDirectory().getAccount(id) : null;
  if (!id || !account?.orgSlug) return;
  const parsed = invitesFromEmails(String(formData.get("correos") ?? ""));
  if (parsed.ok.length === 0) {
    redirect(`/${account.orgSlug}/invitaciones?error=correos`);
  }
  await getDirectory().importInvites(id, parsed.ok);
  redirect(`/${account.orgSlug}/crm`);
}
```

`uploadInvitesAction` sigue usando el CSV (`nombre,empresa,correo`) y `importInvites`. Al terminar, `` redirect(`/${account.orgSlug}/crm`) ``.

`src/components/organismo/email-box.tsx`: `<textarea name="correos">` con label «Correos, uno por línea», botón «Cargar correos», form `uploadEmailsAction`. Si `error === "correos"`, un `Alert` de `@/components/ui/alert` con «Ningún correo válido.» No uses `window.alert`.

`src/app/[sector]/invitaciones/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { EmailBox } from "@/components/organismo/email-box";
import { InviteUpload } from "@/components/organismo/invite-upload";
import { ManualInvite } from "@/components/organismo/manual-invite";
import { ownerBySlug } from "@/lib/organismo/owner";

export const instant = false;

export default async function InvitacionesPage({
  params,
  searchParams,
}: {
  params: Promise<{ sector: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { sector } = await params;
  const owner = await ownerBySlug(sector);
  if (!owner) notFound();
  const paramsQuery = await searchParams;
  return (
    <div className="grid max-w-3xl gap-8">
      <header className="grid gap-2">
        <h1 className="text-h2 text-ink">Invitaciones</h1>
        <a className="text-small font-semibold text-link" href={`/${owner.slug}/invitaciones/plantilla`}>
          Descargar plantilla
        </a>
      </header>
      <ManualInvite />
      <InviteUpload />
      <EmailBox error={paramsQuery.error} />
    </div>
  );
}
```

`src/app/[sector]/invitaciones/plantilla/route.ts` copia el GET de `src/app/organismo/invitaciones/plantilla/route.ts` (mismo CSV, mismo filename). Deja la ruta vieja: el e2e viejo se actualiza en la task 11, y un marcador no estorba.

Quita `InviteUpload` de `src/components/organismo/organismo-nav.tsx` si ese componente sigue montado. El layout de `/organismo` ya no debe mostrarlo.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/organismo/email-list.test.ts src/lib/crm-directory.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/organismo-actions.ts src/app/[sector]/invitaciones/page.tsx src/app/[sector]/invitaciones/plantilla/route.ts src/components/organismo/email-box.tsx src/components/organismo/manual-invite.tsx src/components/organismo/invite-upload.tsx src/components/organismo/organismo-nav.tsx src/lib/organismo/email-list.test.ts
git commit -m "$(cat <<'EOF'
feat: el organismo crea invitaciones a mano, por CSV y por correos

EOF
)"
```

---

### Task 10: CRM en tabla y en tarjetas

**Files:**
- Create: `src/app/[sector]/crm/page.tsx`
- Create: `src/lib/organismo/crm-view.ts`
- Create: `src/lib/organismo/crm-view.test.ts`
- Create: `src/components/organismo/crm-toggle.tsx`
- Create: `src/components/organismo/crm-table.tsx`
- Create: `src/components/organismo/crm-cards.tsx`
- Modify: `src/app/organismo/crm/page.tsx` (redirige a `/{slug}/crm`)

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { filterOrgCrm, orgView } from "./crm-view";

const rows = [
  { id: "1", status: "cargado" },
  { id: "2", status: "contactado" },
  { id: "3", status: "confirmo" },
  { id: "4", status: "no" },
];

describe("vista del CRM", () => {
  it("filtra las tres cubetas y esconde el no", () => {
    expect(filterOrgCrm(rows, "pendiente").map((row) => row.id)).toEqual(["1"]);
    expect(filterOrgCrm(rows, "contactado").map((row) => row.id)).toEqual(["2"]);
    expect(filterOrgCrm(rows, "confirmado").map((row) => row.id)).toEqual(["3"]);
    expect(filterOrgCrm(rows, undefined).map((row) => row.id)).toEqual(["1", "2", "3"]);
  });

  it("la vista desconocida cae en tabla", () => {
    expect(orgView("tarjetas")).toBe("tarjetas");
    expect(orgView("tabla")).toBe("tabla");
    expect(orgView("kanban")).toBe("tabla");
    expect(orgView(undefined)).toBe("tabla");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/organismo/crm-view.test.ts`

Expected: FAIL. No existe `./crm-view`.

- [ ] **Step 3: Write minimal implementation**

`src/lib/organismo/crm-view.ts`

```ts
import { orgEstado, type OrgEstado } from "./estado";

export function orgView(raw: string | undefined) {
  return raw === "tarjetas" ? "tarjetas" : "tabla";
}

export function filterOrgCrm<T extends { status: string }>(rows: T[], estado: string | undefined) {
  return rows.filter((row) => {
    const bucket = orgEstado(row.status);
    if (!bucket) return false;
    if (estado === "pendiente" || estado === "contactado" || estado === "confirmado") {
      return bucket === (estado as OrgEstado);
    }
    return true;
  });
}
```

`src/app/[sector]/crm/page.tsx` llama `ownerBySlug`. Si no hay owner, `notFound()`. Lee `getDirectory().crm(owner.id)`, filtra con `filterOrgCrm`, elige vista con `orgView`. Pinta `CrmToggle` y, según la vista, `CrmTable` o `CrmCards`.

`CrmToggle`: dos links `?vista=tabla` y `?vista=tarjetas`, y tres links de estado que conservan la vista (`?vista=${vista}&estado=pendiente`, etc.) más «Todas» sin `estado`. El activo lleva `aria-current="page"`.

`CrmTable`: tabla con columnas Nombre, Empresa, Correo, Estado (`orgEstadoLabel`). Si el estado es pendiente, el form de `crmEventAction` con `event=contactar` y botón «Contactar». Vacío: «Todavía no hay invitaciones.»

`CrmCards`: un grid `sm:grid-cols-2`. Cada tarjeta es un `<article>` con nombre, empresa, correo y la etiqueta. El mismo botón Contactar si está pendiente. Vacío: el mismo texto.

`crmEventAction` hoy no redirige a un slug. Al final de la acción, lee el slug y redirige a `` `/${slug}/crm?vista=${vista}` ``. Pasa `vista` como hidden input desde la tabla y las tarjetas.

`src/app/organismo/crm/page.tsx` queda en el redirect de la task 7: si hay `orgSlug`, `redirect(\`/${orgSlug}/crm\`)`, si no `/onboarding`. Borra la tabla vieja de esa página para que no haya dos CRM.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/organismo/crm-view.test.ts src/lib/organismo/estado.test.ts src/lib/crm-status.test.ts`

Expected: PASS. `crm-status.test.ts` no cambia de resultado: la máquina sigue igual.

- [ ] **Step 5: Commit**

```bash
git add src/lib/organismo/crm-view.ts src/lib/organismo/crm-view.test.ts src/app/[sector]/crm/page.tsx src/components/organismo/crm-toggle.tsx src/components/organismo/crm-table.tsx src/components/organismo/crm-cards.tsx src/app/organismo/crm/page.tsx src/lib/crm-actions.ts
git commit -m "$(cat <<'EOF'
feat: el CRM del organismo se ve en tabla y en tarjetas

EOF
)"
```

---

### Task 11: El e2e del organismo camina el path nuevo

**Files:**
- Modify: `e2e/onboarding.spec.ts`
- Modify: `e2e/crm.spec.ts`

No inventes un spec nuevo. Actualiza los dos que ya describen este flujo.

- [ ] **Step 1: Ajusta las expectativas**

En `e2e/onboarding.spec.ts`, el test «el organismo no invita hasta terminar su marca» se queda igual hasta «Terminar perfil». Después:

```ts
await expect(page).toHaveURL(/\/canacintra$/);
await expect(page.getByRole("button", { name: "Copiar enlace del evento" })).toBeEnabled();
await expect(page.getByRole("link", { name: "Inicio" })).toBeVisible();
await expect(page.getByRole("link", { name: "Invitaciones" })).toBeVisible();
await expect(page.getByRole("link", { name: "CRM" })).toBeVisible();
```

En `e2e/crm.spec.ts`, después de «Terminar perfil» la URL es `/canacintra` (cambia el correo del director por test si hace falta un slug distinto: `mesa@camara.mx` también se llama CANACINTRA en el spec actual, así que los tres tests comparten slug solo porque cada uno resetea el directorio en `beforeEach`).

El primer test:

```ts
await expect(page).toHaveURL(/\/canacintra$/);
await page.getByRole("link", { name: "Invitaciones" }).click();
const download = await Promise.all([
  page.waitForEvent("download"),
  page.getByRole("link", { name: "Descargar plantilla" }).click(),
]).then(([file]) => file);
expect(download.suggestedFilename()).toBe("plantilla-invitaciones.csv");
await page.getByLabel("Archivo de invitaciones").setInputFiles("e2e/fixtures/invitaciones.csv");
await expect(page).toHaveURL(/\/canacintra\/crm/);
await expect(page.getByRole("cell", { name: "ana@norte.mx" })).toBeVisible();
await expect(page.getByRole("cell", { name: "Pendiente" })).toBeVisible();
await page.goto("/canacintra/invitaciones");
await page.getByLabel("Archivo de invitaciones").setInputFiles("e2e/fixtures/invitaciones.csv");
await expect(page.getByRole("cell", { name: "ana@norte.mx" })).toHaveCount(1);
await page.getByRole("button", { name: "Contactar" }).click();
await expect(page.getByRole("cell", { name: "Contactado" })).toBeVisible();
await page.getByRole("link", { name: "Tarjetas" }).click();
await expect(page.getByRole("article").filter({ hasText: "ana@norte.mx" })).toBeVisible();
```

Agrega `aria` o texto «Tarjetas» en `CrmToggle` (`<a href="?vista=tarjetas">Tarjetas</a>`). La tabla usa `<a href="?vista=tabla">Tabla</a>`.

El test del archivo vacío sube desde Invitaciones y espera el heading «Invitaciones» solo antes del redirect; después del archivo vacío el CRM dice «Todavía no hay invitaciones.»

El test manual entra a Invitaciones, llena el form y espera la celda `luis@sur.mx` con «Pendiente» en el CRM.

Quita las expectativas de «Analítica», «Próximamente», «Tablero» y «Cargado» de estos dos specs.

- [ ] **Step 2: Run the e2e**

Run: `npx playwright test e2e/onboarding.spec.ts e2e/crm.spec.ts e2e/landing.spec.ts`

Expected: PASS. `landing.spec.ts` sigue viendo la landing en un sector real (`/automotriz-y-autopartes` o el que ya use). Un slug de organismo no debe pintar la landing.

- [ ] **Step 3: Commit**

```bash
git add e2e/onboarding.spec.ts e2e/crm.spec.ts src/components/organismo/crm-toggle.tsx
git commit -m "$(cat <<'EOF'
test: el organismo se registra y opera en su slug

EOF
)"
```

---

### Task 12: El mismo contrato en Supabase

**Files:**
- Create: `supabase/migrations/20261022120000_organization_slug_and_opens.sql`
- Modify: `src/lib/organismo/owner.ts`
- Modify: `supabase/migrations/20261022070000_create_organization_brand.sql` no se edita: es historia. La función nueva va en la migración nueva.

Esto no lo cubre Playwright (`AUTH_PROVIDER=memory`). Lo cubre un test de lectura del SQL y el loader.

- [ ] **Step 1: Write the failing test**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("slug y aperturas en postgres", () => {
  const sql = readFileSync(
    "supabase/migrations/20261022120000_organization_slug_and_opens.sql",
    "utf8",
  );

  it("guarda el slug y cada apertura", () => {
    expect(sql).toContain("add column slug text");
    expect(sql).toContain("organizations_slug_idx");
    expect(sql).toContain("create table public.link_opens");
    expect(sql).toContain("record_link_open");
    expect(sql).not.toContain("ref=");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/organismo/supabase-slug.test.ts`

Expected: FAIL. No existe la migración.

- [ ] **Step 3: Write minimal implementation**

```sql
alter table public.organizations
  add column slug text;

alter table public.organizations
  add constraint organizations_slug_shape
  check (slug is null or slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$');

create unique index organizations_slug_idx
  on public.organizations (slug)
  where slug is not null;

create table public.link_opens (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  sector_id uuid not null references public.sectors (id),
  opened_at timestamptz not null default now()
);

create index link_opens_org_opened_idx
  on public.link_opens (organization_id, opened_at desc);

alter table public.link_opens enable row level security;
alter table public.link_opens force row level security;

create policy link_opens_select on public.link_opens
  for select to authenticated
  using (
    organization_id = (select private.current_organization_id())
    or (select private.is_superadmin())
  );

create or replace function public.record_link_open(org_id uuid, sector_slug text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  sector uuid;
begin
  select id into sector from public.sectors where slug = sector_slug;
  if sector is null then
    return;
  end if;
  if not exists (
    select 1 from public.organizations
    where id = org_id and brand_completed_at is not null
  ) then
    return;
  end if;
  insert into public.link_opens (organization_id, sector_id)
  values (org_id, sector);
end;
$$;

revoke all on function public.record_link_open(uuid, text) from public;
grant execute on function public.record_link_open(uuid, text) to anon, authenticated;

create or replace function public.finish_organization_brand(
  org_name text,
  org_slug text,
  org_color text,
  logo_path text,
  logo_type text,
  logo_bytes integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  org_id uuid := gen_random_uuid();
begin
  if (select private.current_role()) <> 'empresario' then
    raise exception 'la cuenta ya tiene organismo';
  end if;
  if exists (select 1 from public.sectors where slug = org_slug) then
    raise exception 'ese enlace es de un sector';
  end if;
  if exists (select 1 from public.organizations where slug = org_slug) then
    raise exception 'ese enlace ya existe';
  end if;

  insert into public.organizations (id, name, slug, brand_color, brand_completed_at)
  values (org_id, org_name, org_slug, org_color, null);

  insert into public.media_assets (
    purpose, bucket_id, object_path, content_type, byte_size, organization_id
  ) values (
    'organization_logo', 'organization-logos', logo_path, logo_type, logo_bytes, org_id
  );

  update public.organizations
  set brand_completed_at = now()
  where id = org_id;

  update public.profiles
  set role = 'director',
      organization_id = org_id,
      onboarded_at = now()
  where id = auth.uid();
end;
$$;

revoke all on function public.finish_organization_brand(text, text, text, text, text, integer) from public;
grant execute on function public.finish_organization_brand(text, text, text, text, text, integer) to authenticated;
```

`ownerBySlug` cuando `usesSupabaseAuth()`: cliente con el access token, `from("organizations").select("id, name, slug").eq("slug", slug).maybeSingle()`. El correo sale de `readSessionAccount`. Si no hay fila, `null`.

`recordOpen` en el ramo Supabase: `openRef` en Node y luego `rpc("record_link_open", { org_id, sector_slug })` con el cliente anónimo. No mandes el token a Postgres.

`createAccountAction`, cuando `usesSupabaseAuth()` y `cuenta=organismo`, no llama a `createAccount` de memoria. Hace `signUp` con el cliente anónimo, igual que `createFirstSuperadminAction`: si no hay sesión, `signInWithPassword`. El trigger `profile_for_new_user` deja el perfil en `empresario`. Guarda la sesión con `writeSupabaseSession` y redirige a `/onboarding`. Sin esto el wizard no tiene `auth.uid()` y `finish_organization_brand` no puede promoverlo.

`completeOrganismoAction` en Supabase llama `finish_organization_brand` en lugar de `completeOnboarding` de memoria. El logo ya se sube por el flujo de `src/lib/admin/organismos/store-logo.ts`: reusa ese store para armar `logo_path` antes del RPC. Si el archivo de la acción pasa de 90 líneas, parte el ramo Supabase a `src/lib/organismo/finish-brand.ts`. El ramo de memoria (Playwright) no se toca: sigue en `completeOnboarding` y redirige a `/{slug}`.

El trigger `profile_for_new_user` crea al director como `empresario`. `finish_organization_brand` lo promueve. No insertes el organismo desde el cliente: `organizations_insert` es solo superadmin.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/organismo/supabase-slug.test.ts src/lib/organismo/opens.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20261022120000_organization_slug_and_opens.sql src/lib/organismo/supabase-slug.test.ts src/lib/organismo/owner.ts src/lib/organismo/finish-brand.ts src/lib/account-actions.ts src/lib/memory/events.ts
git commit -m "$(cat <<'EOF'
feat: el slug y las aperturas quedan en Postgres

EOF
)"
```

No apliques la migración al proyecto remoto en este task. Eso se hace aparte, con el flujo de Supabase del repo, cuando se pida.

---

## Self-review

- Alta, wizard con logo y slug, entrada a `/{slug}`: tasks 5 y 7.
- Sidebar de tres: task 6. Inicio con enlace cifrado, aperturas, conversión, cards y gráfica: task 8.
- Invitaciones manual, CSV y correos: task 9.
- CRM tabla y tarjetas, tres estados: tasks 2 y 10.
- La landing `/{sector}` no se mueve: task 7, ramo `if (!owner)`.
- La máquina `crm-status.ts` no se edita. El superadmin sigue diciendo Cargado / Confirmó.
- «Analítica próximamente» sale del menú del organismo. Sigue fuera de alcance, como en `docs/planeacion-funcionalidad.md`.
- Capturista e invitador en Supabase entran al slug de su `organization_id` en un follow-up: `requireOrgMember` hoy compara el id del director. No bloquea el path del director, que es el de este plan.

## Ejecución

Plan en `docs/superpowers/plans/2026-10-22-panel-organismo-autoservicio.md`.
