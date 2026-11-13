# Detalle de un pase Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** En `/admin/pases/[id]` el pase dice de quién es, de qué empresa, de qué sesión y si ya llegó, con el mismo esqueleto visual del detalle de un organismo.

**Architecture:** La página sigue siendo un Server Component con `export const instant = false`. `loadPase` conserva las llaves que ya usa el POST de llegada y agrega una ficha. La sesión no se adivina: el detalle dice «Sin sesión». Esa falta queda en `docs/deuda-tecnica-sesion-del-pase.md`. La pantalla copia la estructura de `OrganismoScreen`: migas, tarjeta de identidad, hechos, pestañas subrayadas en `?tab=`. De Ordina se toma solo esa estructura (encabezado, rejilla de hechos, pestañas en la URL, error antes del cuerpo). No se copia GraphQL, Apollo ni `force-dynamic`.

**Tech Stack:** Next.js 16, React Server Components, Tailwind del observatorio, `PersonTabs`, `FactCard`, `PanelHeader`, Vitest.

---

## Lo que hay hoy

`src/app/admin/pases/[id]/page.tsx` usa `DetailFrame`. El título es el nombre. Los hechos son la ruta del PNG, `issued_at` crudo y `scanned_at` crudo. La pestaña `qr` imprime esa ruta. La pestaña `llegada` es un formulario sin estilo. La URL de referencia es `?tab=qr` y debe seguir abriendo el QR.

`passes` solo tiene `profile_id`, `image_asset_id`, `issued_at`. En la base, el pase `151ad0d9-b4ea-4e6c-8774-1161ba8832e4` es de Alvaro castillo Carreño, empresa sabia.dev, sector Plásticos y Economía circular, interés «Me interesa todo», emitido y con llegada. Su correo `event_pass` tiene `session_id` nulo. Hay una sola sesión vigente: Quinta Real, Puebla, 18 de noviembre de 2026, 08:00–12:00. Cero pases tienen sesión en el correo. Por eso la regla de una sola vigente es la que llena este caso.

## Archivos

- Crear: `src/lib/admin/pases/pass-face.ts` — elige la sesión y formatea fechas.
- Crear: `src/lib/admin/pases/pass-face.test.ts`
- Crear: `src/lib/admin/pases/relations.ts` — arma la ficha a partir de las filas.
- Modificar: `src/lib/admin/pases/detail.ts` — carga persona, empresa, sector, sesión y quién escaneó.
- Modificar: `src/lib/admin/pases/detail.test.ts`
- Crear: `src/app/admin/pases/[id]/pase-header.tsx`
- Crear: `src/app/admin/pases/[id]/pase-facts.tsx`
- Crear: `src/app/admin/pases/[id]/pase-nav.tsx`
- Crear: `src/app/admin/pases/[id]/qr-tab.tsx`
- Crear: `src/app/admin/pases/[id]/llegada-tab.tsx`
- Crear: `src/app/admin/pases/[id]/pase-screen.tsx`
- Modificar: `src/app/admin/pases/[id]/page.tsx`

Cada archivo nuevo cabe en menos de 90 líneas. No se toca `src/app/api/admin/pases/[id]/llegada/route.ts`: sigue leyendo `arrival`, `crmStatus` y `contactId`.

## Regla de la sesión

```ts
export type SessionPick = { id: string; label: string; short: string };

export function passSessionChoice(input: { mailed: SessionPick | null; current: SessionPick[] }) {
  if (input.mailed) return input.mailed;
  if (input.current.length === 1) return input.current[0];
  return null;
}
```

`label` sale de `currentOption` en `src/lib/sessions/face.ts`. `short` sale de `sessionOnLabel`. Si la función regresa `null`, la ficha dice «Sin sesión» y no enlaza a ninguna sesión.

---

### Task 1: Elegir la sesión

**Files:**
- Create: `src/lib/admin/pases/pass-face.ts`
- Test: `src/lib/admin/pases/pass-face.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { passSessionChoice, passWhen } from "./pass-face";

const quinta = {
  id: "a23efe9d-0067-4b64-a3a2-6d3d7d3ef8af",
  label: "Quinta Real, Puebla · 18 de noviembre de 2026 · 08:00–12:00",
  short: "18 de noviembre de 2026",
};

describe("sesión del pase", () => {
  it("usa la sesión del correo cuando el pase la trae", () => {
    expect(passSessionChoice({ mailed: quinta, current: [] })).toEqual(quinta);
  });

  it("con una sola vigente y sin correo, usa esa", () => {
    expect(passSessionChoice({ mailed: null, current: [quinta] })).toEqual(quinta);
  });

  it("con varias vigentes y sin correo, no adivina", () => {
    expect(passSessionChoice({ mailed: null, current: [quinta, { ...quinta, id: "otra" }] })).toBeNull();
  });

  it("formatea la emisión en es-MX", () => {
    expect(passWhen("2026-11-13T22:36:28.590Z")).toMatch(/2026/);
    expect(passWhen("")).toBe("");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/admin/pases/pass-face.test.ts`

Expected: FAIL, cannot find `./pass-face`.

- [ ] **Step 3: Write minimal implementation**

```ts
export type SessionPick = { id: string; label: string; short: string };

export function passSessionChoice(input: { mailed: SessionPick | null; current: SessionPick[] }) {
  if (input.mailed) return input.mailed;
  if (input.current.length === 1) return input.current[0];
  return null;
}

export function passWhen(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" }).format(date);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/admin/pases/pass-face.test.ts`

Expected: PASS, 4 tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/admin/pases/pass-face.ts src/lib/admin/pases/pass-face.test.ts
git commit -m "$(cat <<'EOF'
feat: choose the session a pass belongs to

EOF
)"
```

---

### Task 2: Cargar persona, empresa y sesión

**Files:**
- Create: `src/lib/admin/pases/relations.ts`
- Modify: `src/lib/admin/pases/detail.ts`
- Test: `src/lib/admin/pases/detail.test.ts`

`loadPase` hoy regresa `pass`, `path`, `arrival`, `profile`, `contactId`, `crmStatus`. Esas llaves se quedan. Se agrega `face`.

- [ ] **Step 1: Write the failing test**

Al final de `describe("detalle de pases")` en `src/lib/admin/pases/detail.test.ts`:

```ts
it("el detalle lee persona, empresa y sesión", () => {
  const source = readFileSync("src/lib/admin/pases/detail.ts", "utf8");
  expect(source).toContain('.from("companies")');
  expect(source).toContain('.from("sectors")');
  expect(source).toContain('.from("sessions")');
  expect(source).toContain('.eq("kind", "event_pass")');
  expect(source).toContain("scanned_by");
  expect(source).toContain("face");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/admin/pases/detail.test.ts`

Expected: FAIL, `detail.ts` no contiene `.from("companies")`.

- [ ] **Step 3: Write `relations.ts`**

```ts
import { bandLabel } from "@/lib/admin/empresas/band-label";
import { currentOption, sessionOnLabel } from "@/lib/sessions/face";
import { passSessionChoice, passWhen, type SessionPick } from "./pass-face";

type SessionRow = {
  id: string;
  venue: string;
  session_on: string;
  starts_local: string;
  ends_local: string;
};

export type PassFace = {
  name: string;
  email: string;
  jobTitle: string;
  whatsapp: string;
  companyName: string;
  companyHref: string;
  sectorName: string;
  sectorHref: string;
  employees: string;
  municipality: string;
  interest: string;
  sessionLabel: string;
  sessionHref: string;
  sessionShort: string;
  issued: string;
  arrived: string;
  scanner: string;
  assetId: string;
};

function pick(row: SessionRow): SessionPick {
  return {
    id: row.id,
    label: currentOption(row).label,
    short: sessionOnLabel(row.session_on),
  };
}

export function buildPassFace(input: {
  profileId: string;
  assetId: string;
  issuedAt: string;
  arrivedAt: string;
  scanner: string;
  profile: { full_name: string | null; email: string | null; job_title: string | null; whatsapp: string | null } | null;
  company: {
    id: string;
    legal_name: string;
    employee_band: string;
    municipality: string | null;
    session_interest: string | null;
    sector_id: string;
  } | null;
  sector: { id: string; name: string | null } | null;
  mailed: SessionRow | null;
  current: SessionRow[];
}): PassFace {
  const session = passSessionChoice({
    mailed: input.mailed ? pick(input.mailed) : null,
    current: input.current.map(pick),
  });
  const name = input.profile?.full_name?.trim() || input.profile?.email || input.profileId;
  return {
    name,
    email: input.profile?.email ?? "",
    jobTitle: input.profile?.job_title ?? "",
    whatsapp: input.profile?.whatsapp ?? "",
    companyName: input.company?.legal_name ?? "",
    companyHref: input.company ? `/admin/empresas/${input.company.id}` : "",
    sectorName: input.sector?.name ?? "",
    sectorHref: input.sector ? `/admin/sectores/${input.sector.id}` : "",
    employees: bandLabel(input.company?.employee_band ?? ""),
    municipality: input.company?.municipality ?? "",
    interest: input.company?.session_interest ?? "",
    sessionLabel: session?.label ?? "Sin sesión",
    sessionHref: session ? `/admin/sesiones/${session.id}` : "",
    sessionShort: session?.short ?? "—",
    issued: passWhen(input.issuedAt),
    arrived: passWhen(input.arrivedAt),
    scanner: input.scanner,
    assetId: input.assetId,
  };
}
```

- [ ] **Step 4: Extend `loadPase`**

En el `Promise.all` existente, cambiar el select de arrivals a `profile_id, scanned_at, scanned_by` y el de profiles a `full_name, email, job_title, whatsapp, role`. Agregar:

```ts
db.from("companies").select("id, legal_name, employee_band, municipality, session_interest, sector_id").eq("profile_id", profileId).maybeSingle(),
db.from("outbox_messages").select("session_id").eq("profile_id", profileId).eq("kind", "event_pass").not("session_id", "is", null).order("created_at", { ascending: false }).limit(1),
db.from("sessions").select("id, venue, session_on, starts_local, ends_local").eq("is_current", true),
```

Después del bucle de errores, leer el sector de la empresa, el perfil de `scanned_by` (`full_name, email`) y, si el correo trae `session_id`, esa fila de `sessions` con las mismas columnas. Pasar todo a `buildPassFace`. El `return` queda:

```ts
return {
  pass: pass.data,
  path: asset.data?.object_path ?? passObjectPath(profileId),
  arrival: arrival.data,
  profile: profile.data,
  contactId: contact.data?.id ?? null,
  crmStatus,
  face: buildPassFace({ /* filas de arriba */ }),
};
```

`scanner` es `full_name` y, si viene vacío, el correo de quien escaneó. `assetId` es `pass.data.image_asset_id`. `issuedAt` es `pass.data.issued_at`. `arrivedAt` es `arrival.data?.scanned_at ?? ""`. Si `detail.ts` pasa de 90 líneas, el armado de esas tres lecturas extra vive en `relations.ts` como `loadPassRelations(db, profileId, companySectorId, scannedBy, mailedSessionId)`.

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/lib/admin/pases/detail.test.ts src/lib/admin/pases/pass-face.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/admin/pases/detail.ts src/lib/admin/pases/detail.test.ts src/lib/admin/pases/relations.ts
git commit -m "$(cat <<'EOF'
feat: load the person, company, and session behind a pass

EOF
)"
```

---

### Task 3: Tarjeta y hechos, como el organismo

**Files:**
- Create: `src/app/admin/pases/[id]/pase-header.tsx`
- Create: `src/app/admin/pases/[id]/pase-facts.tsx`
- Test: `src/lib/admin/pases/detail.test.ts`

La tarjeta sigue `OrganismoHeader`: marca a la izquierda, nombre, línea, enlace, dos stats a la derecha, y debajo la rejilla. Los stats de un pase son texto, no conteos.

- [ ] **Step 1: Write the failing test**

```ts
it("la pantalla del pase usa tarjeta, hechos y pestañas de persona", () => {
  const header = readFileSync("src/app/admin/pases/[id]/pase-header.tsx", "utf8");
  const facts = readFileSync("src/app/admin/pases/[id]/pase-facts.tsx", "utf8");
  expect(header).toContain("Sesión");
  expect(header).toContain("Llegada");
  expect(facts).toContain("FactCard");
  expect(facts).toContain("Empresa");
  expect(facts).toContain("Persona");
  expect(facts).toContain('label: "Sesión"');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/admin/pases/detail.test.ts`

Expected: FAIL, no existe `pase-header.tsx`.

- [ ] **Step 3: Write `pase-header.tsx`**

```tsx
import { QrCode } from "lucide-react";
import Link from "next/link";
import type { PassFace } from "@/lib/admin/pases/relations";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-24 rounded-xl border border-line bg-surface-subtle px-3 py-3 text-center">
      <div className="text-body font-semibold text-ink">{value}</div>
      <div className="text-small text-ink-secondary">{label}</div>
    </div>
  );
}

export function PaseHeader({ face }: { face: PassFace }) {
  return (
    <section className="rounded-2xl border border-line bg-elevated p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          {face.assetId ? (
            <img
              src={`/api/admin/medios/${face.assetId}/archivo`}
              alt=""
              className="size-20 shrink-0 rounded-2xl border border-line bg-surface-subtle object-contain"
            />
          ) : (
            <span className="grid size-20 shrink-0 place-items-center rounded-2xl border border-line bg-surface-subtle text-ink">
              <QrCode className="size-8" />
            </span>
          )}
          <div className="min-w-0">
            <h2 className="text-2xl font-semibold text-ink">{face.name}</h2>
            {face.email ? <p className="mt-1 text-small text-ink-secondary">{face.email}</p> : null}
            {face.companyHref ? (
              <Link href={face.companyHref} className="mt-1 inline-block text-small text-link">
                {face.companyName}
              </Link>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Stat label="Sesión" value={face.sessionShort} />
          <Stat label="Llegada" value={face.arrived ? "Sí" : "No"} />
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Write `pase-facts.tsx`**

```tsx
import { Briefcase, Building2, Calendar, CalendarCheck, Layers, Mail, MapPin, MessageCircle, User, Users } from "lucide-react";
import { FactCard } from "@/components/admin/fact-card";
import { whatsappHref } from "@/lib/admin/crm/whatsapp";
import type { PassFace } from "@/lib/admin/pases/relations";

export function PaseFacts({ face, profileId }: { face: PassFace; profileId: string }) {
  const facts = [
    { icon: Calendar, label: "Sesión", value: face.sessionLabel, href: face.sessionHref },
    { icon: User, label: "Persona", value: face.name, href: `/admin/cuentas/${profileId}` },
    { icon: Mail, label: "Correo", value: face.email, href: face.email ? `mailto:${face.email}` : "" },
    { icon: MessageCircle, label: "WhatsApp", value: face.whatsapp, href: whatsappHref(face.whatsapp) },
    { icon: Briefcase, label: "Puesto", value: face.jobTitle },
    { icon: Building2, label: "Empresa", value: face.companyName, href: face.companyHref },
    { icon: Layers, label: "Sector", value: face.sectorName, href: face.sectorHref },
    { icon: Users, label: "Tamaño", value: face.employees },
    { icon: MapPin, label: "Municipio", value: face.municipality },
    { icon: Calendar, label: "Le interesa", value: face.interest },
    { icon: Calendar, label: "Emitido", value: face.issued },
    { icon: CalendarCheck, label: "Llegada", value: face.scanner ? `${face.arrived} · ${face.scanner}` : face.arrived },
  ];
  return (
    <section className="mt-6 grid gap-3 sm:grid-cols-2">
      {facts.map((fact) => (
        <FactCard key={fact.label} {...fact} />
      ))}
    </section>
  );
}
```

`FactCard` no pinta un hecho vacío. «Sin sesión» sí se pinta.

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/lib/admin/pases/detail.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/app/admin/pases/[id]/pase-header.tsx src/app/admin/pases/[id]/pase-facts.tsx src/lib/admin/pases/detail.test.ts
git commit -m "$(cat <<'EOF'
feat: show who a pass belongs to above the tabs

EOF
)"
```

---

### Task 4: Pestañas QR y llegada

**Files:**
- Create: `src/app/admin/pases/[id]/pase-nav.tsx`
- Create: `src/app/admin/pases/[id]/qr-tab.tsx`
- Create: `src/app/admin/pases/[id]/llegada-tab.tsx`
- Create: `src/app/admin/pases/[id]/pase-screen.tsx`
- Modify: `src/app/admin/pases/[id]/page.tsx`
- Test: `src/lib/admin/pases/detail.test.ts`

La pestaña por defecto sigue siendo `qr`. El QR deja de ser la ruta del archivo y pasa a ser la imagen que ya usa la ficha de la empresa.

- [ ] **Step 1: Write the failing test**

```ts
it("el detalle deja DetailFrame y conserva el qr en la url", () => {
  const page = readFileSync("src/app/admin/pases/[id]/page.tsx", "utf8");
  const qr = readFileSync("src/app/admin/pases/[id]/qr-tab.tsx", "utf8");
  const llegada = readFileSync("src/app/admin/pases/[id]/llegada-tab.tsx", "utf8");
  expect(page).toContain("export const instant = false");
  expect(page).not.toContain("DetailFrame");
  expect(page).not.toContain("force-dynamic");
  expect(page).toContain('tabQuery(query.tab');
  expect(page).toContain('"qr"');
  expect(qr).toContain("PaseSection");
  expect(llegada).toContain("/api/admin/pases/");
  expect(llegada).toContain("Marcar que llegó");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/admin/pases/detail.test.ts`

Expected: FAIL, `page.tsx` todavía contiene `DetailFrame`.

- [ ] **Step 3: Write the tab pieces**

`pase-nav.tsx`:

```tsx
import { PersonTabs } from "@/components/admin/person-tabs";

export const paseTabs = [
  { value: "qr", label: "QR" },
  { value: "llegada", label: "Llegada" },
];

export function PaseNav({ id, active }: { id: string; active: string }) {
  return (
    <PersonTabs
      active={active}
      tabs={paseTabs.map((tab) => ({ ...tab, href: `/admin/pases/${id}?tab=${tab.value}` }))}
    />
  );
}
```

`qr-tab.tsx`:

```tsx
import { PaseSection } from "@/app/admin/empresas/[id]/pase-section";

export function QrTab({ assetId }: { assetId: string }) {
  return <PaseSection assetId={assetId || null} />;
}
```

`llegada-tab.tsx` usa `Button` de `@/components/ui/button`. Si ya hay llegada, muestra la fecha y quién escaneó, y no el botón. Si no, el mismo `POST` de hoy:

```tsx
import { Button } from "@/components/ui/button";

export function LlegadaTab({ id, arrived, scanner }: { id: string; arrived: string; scanner: string }) {
  if (arrived) {
    return <p className="text-body text-ink">{scanner ? `Llegó ${arrived} · ${scanner}` : `Llegó ${arrived}`}</p>;
  }
  return (
    <form action={`/api/admin/pases/${id}/llegada`} method="post">
      <Button type="submit">Marcar que llegó</Button>
    </form>
  );
}
```

`pase-screen.tsx`:

```tsx
import { LlegadaTab } from "@/app/admin/pases/[id]/llegada-tab";
import { PaseFacts } from "@/app/admin/pases/[id]/pase-facts";
import { PaseHeader } from "@/app/admin/pases/[id]/pase-header";
import { PaseNav } from "@/app/admin/pases/[id]/pase-nav";
import { QrTab } from "@/app/admin/pases/[id]/qr-tab";
import { PanelHeader, parentLabel, trailCrumbs } from "@/components/admin/panel-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { PassFace } from "@/lib/admin/pases/relations";

export function PaseScreen({ id, face, active, error }: { id: string; face: PassFace; active: string; error?: string }) {
  return (
    <main className="px-8 py-8">
      <PanelHeader title={face.name} crumbs={trailCrumbs(parentLabel("/admin/pases"), "/admin/pases", face.name)} />
      <PaseHeader face={face} />
      <PaseFacts face={face} profileId={id} />
      {error ? (
        <Alert variant="destructive" className="mt-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <PaseNav id={id} active={active} />
      <div className="mt-6">
        {active === "llegada" ? <LlegadaTab id={id} arrived={face.arrived} scanner={face.scanner} /> : <QrTab assetId={face.assetId} />}
      </div>
    </main>
  );
}
```

- [ ] **Step 4: Replace the page**

```tsx
import { notFound } from "next/navigation";
import { PaseScreen } from "@/app/admin/pases/[id]/pase-screen";
import { paseTabs } from "@/app/admin/pases/[id]/pase-nav";
import { tabQuery } from "@/lib/admin/tab-query";
import { loadPase } from "@/lib/admin/pases/detail";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

export default async function PaseDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; error?: string }>;
}) {
  await requireSuperadmin();
  const { id } = await params;
  const query = await searchParams;
  const data = await loadPase(id);
  if (!data) notFound();
  const active = tabQuery(query.tab, paseTabs.map((tab) => tab.value), "qr");
  return <PaseScreen id={id} face={data.face} active={active} error={query.error} />;
}
```

Si `page.tsx` o `pase-screen.tsx` pasa de 90 líneas, parte el cuerpo del tab en el archivo de la pestaña. No agregues `export const dynamic`.

- [ ] **Step 5: Run tests**

Run: `npx vitest run src/lib/admin/pases/detail.test.ts src/lib/admin/pases/pass-face.test.ts src/lib/admin/pases/list.test.ts`

Expected: PASS. `list.test.ts` no cambia; se corre para confirmar que la lista sigue leyendo `passes` y `arrivals`.

- [ ] **Step 6: Commit**

```bash
git add src/app/admin/pases/[id] src/lib/admin/pases/detail.test.ts
git commit -m "$(cat <<'EOF'
feat: open a pass on the same detail layout as an organization

EOF
)"
```

---

## Verificación en el navegador

Con la sesión de superadmin ya abierta en `http://localhost:3000`:

1. Abrir `http://localhost:3000/admin/pases/151ad0d9-b4ea-4e6c-8774-1161ba8832e4?tab=qr`.
2. Arriba se lee el nombre, el correo y el enlace a sabia.dev. El stat de sesión dice 18 de noviembre de 2026. El stat de llegada dice Sí.
3. En los hechos: sesión con enlace a `/admin/sesiones/a23efe9d-0067-4b64-a3a2-6d3d7d3ef8af`, persona con enlace a la cuenta, empresa con enlace a `/admin/empresas/a3b733b5-700d-45ad-a1f3-5d7ecd5ec5cf`, sector Plásticos y Economía circular, «Me interesa todo», emitido y llegada en fecha legible.
4. La pestaña QR muestra la imagen, no la ruta `…/pass.png`.
5. La pestaña Llegada dice que ya llegó y no ofrece el botón.
6. Recargar con `?tab=llegada` deja esa pestaña activa.

## Fuera de este plan

No se agrega `session_id` a `passes`. Cuando haya dos sesiones vigentes, un pase sin sesión en el correo dirá «Sin sesión». Guardar la sesión al emitir el pase es otro cambio.
