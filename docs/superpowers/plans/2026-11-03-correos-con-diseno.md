# Correos con diseño Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sustituir el HTML plano por cinco correos de React Email con el estilo de la landing, mandar la bienvenida al crear la cuenta, entregar el QR cuando confirman su lugar y repetirlo en el recordatorio.

**Architecture:** React Email solo dibuja. Resend sigue siendo el transporte. Un cascarón común (franja rosa, encabezado navy, ficha blanca, pie con los logos) envuelve los cinco cuerpos. El masivo sigue saliendo del botón de `/admin/correo`. La bienvenida sale al crear la cuenta. El pase, con el QR, sale solo cuando el lugar ya está confirmado: el perfil está terminado y el pase no está pendiente. Ese es el mismo momento en que la pantalla muestra el QR. El recordatorio vuelve a llevar el QR de cada persona. La innovación abierta y el gracias no lo llevan. La bienvenida y el pase usan dos RPC `security definer`, porque el empresario no puede leer ni escribir `outbox_messages` y en local no hay llave de servicio. El QR es el mismo código que `AccessPass`: el `profile_id`. Va como PNG adjunto con `contentId`, no como data URL.

**Tech Stack:** Next.js 16, `@react-email/components`, `@react-email/render`, `qrcode`, Resend, Supabase RPC. Cada archivo `.ts` o `.tsx` nuevo queda en 90 líneas o menos.

---

## Lo que hay hoy

| Correo | `kind` | Qué pasa ahora |
|---|---|---|
| Bienvenida | `welcome` | El asunto existe. Nadie lo encola ni lo manda al crear la cuenta. No lleva QR. |
| Pase | `event_pass` | El asunto existe. Lleva el QR. Sale cuando confirman: perfil terminado y el pase ya no está pendiente (`passIsPending` y `externalPassPending` en falso). Si al guardar el perfil el enlace sigue pendiente, este correo espera. |
| Recordatorio | `reminder` | El botón lo manda. El cuerpo es un párrafo. También lleva el QR de esa persona. |
| Innovación abierta | `open_innovation` | El botón lo manda. El cuerpo es un párrafo. |
| Gracias | `thanks` | El botón lo manda. El cuerpo es un párrafo. |
| Contraseña | `password` | Fuera de este plan. Sigue sin cuerpo y sin envío en Supabase. |

El remitente ya está definido: `MAIL_FROM` es `Foro Puebla x Puebla <noreply@notificaciones.clusterdestartups.org>`. Quien responda debe llegar a `hola@clusterdestartups.org`, que ya vive en `clusterEmail`.

Colores de la landing, en `src/app/globals.css`: rosa `#e8186a`, navy `#16284f`, texto secundario `#4b5563`, fondo `#f7f7f8`, línea `#e5e7eb`. El correo no usa Tailwind ni `next/font`. Los estilos van en línea. La pila de fuente es `Archivo, Raleway, Arial, sans-serif`. Si el cliente no carga Archivo, se queda en Arial y los colores siguen siendo los de la landing.

Datos públicos que el correo puede citar sin consultar la base: `forumKicker`, `forumName` y `forumDate` en `src/content/forum-public.ts`. Lugar y horario en `sessionFacts` de `src/content/landing.ts`: Hotel Quinta Real, Puebla, y 8:00 am – 11:45 am. Si el recordatorio o el gracias tienen sesión elegida, esa ficha gana sobre el texto fijo. `currentOption` en `src/lib/sessions/face.ts` ya arma `venue · fecha · horas`.

El QR de la pantalla está en `AccessPass`: codifica `accountId`, que es el id del perfil. La pantalla lo enseña solo si `onboarded` es verdadero y `pending` es falso (`src/app/onboarding/supabase-screen.tsx`). `pending` es un enlace sin aceptar o un registro externo sin admitir. Confirmar, en este plan, es ese momento. La mesa lee el texto del QR como `codigo` y busca `passes.profile_id`. Este plan no inserta la fila de `passes` ni el PNG en Storage. Sin esa fila, la mesa sigue respondiendo «sin qr». El correo de confirmación y el recordatorio muestran el mismo código que la pantalla.

El pie repite las tres filas de `LandingMarks`: quien opera, el respaldo y quienes convocan.

| Fila | Logos |
|---|---|
| Opera | `clusterLogo` en `src/content/landing.ts`: `/logos/logo-cluster.webp` |
| Con el respaldo de | `/logos/logo-estado.svg`, `/logos/logo-sedetra.png`, `/logos/logo-cinco-de-mayo.png` |
| Convocan | Los 13 de `conveners` en `src/content/conveners.ts` |

Son 17 imágenes. Van con URL absoluta `${NEXT_PUBLIC_SITE_URL}${src}` porque el cliente de correo no resuelve rutas relativas. El SVG del estado y los WebP se usan tal cual están en `public/logos`. Si un cliente no pinta SVG o WebP, muestra el texto alternativo.

## Archivos

| Archivo | Responsabilidad |
|---|---|
| `src/lib/mail/brand.ts` | Colores, respuesta y fichas de fecha, lugar y horario. |
| `src/lib/mail/shell.tsx` | Cascarón: franja, encabezado y ficha. El pie lo delega. |
| `src/lib/mail/footer-logos.ts` | Los 17 logos, con el mismo orden que la landing. |
| `src/lib/mail/mail-footer.tsx` | Tres filas de logos con URL absoluta. |
| `src/lib/mail/welcome-mail.tsx` | Bienvenida, sin QR. |
| `src/lib/mail/pass-qr.ts` | PNG del `profile_id`. |
| `src/lib/mail/pass-block.tsx` | Imagen `cid:pase` y la frase de la mesa. |
| `src/lib/mail/event-pass-mail.tsx` | Pase, con QR. |
| `src/lib/mail/reminder-mail.tsx` | Recordatorio, con QR. |
| `src/lib/mail/open-innovation-mail.tsx` | Innovación abierta, sin QR. |
| `src/lib/mail/thanks-mail.tsx` | Gracias, sin QR. |
| `src/lib/mail/paint-mail.ts` | Elige plantilla y, si lleva pase, el adjunto. |
| `src/lib/mail/post-mail.ts` | Arma el cuerpo que acepta Resend, con `replyTo`. |
| `src/lib/mail/send-own.ts` | Encola y manda `welcome` o `event_pass` con el JWT del empresario. |
| `src/lib/mail/deliver.ts` | El masivo pinta cada fila y la manda. |
| `src/lib/mail/broadcast-queue.ts` | La fila pendiente trae `profile_id`. |
| `src/lib/mail/send-broadcast.ts` | Carga la etiqueta de la sesión elegida. |
| `supabase/migrations/20261103233000_own_mail.sql` | El empresario encola y registra solo su bienvenida y su pase. |
| `src/lib/auth/signup-empresario.ts` | Después de tener sesión, manda la bienvenida. |
| `src/lib/onboarding/complete-empresario.ts` | Después de guardar el perfil, manda el pase. |

Ninguna plantilla importa `server-only`. Los tests viven en `src/**/*.test.ts` e importan los `.tsx`.

---

### Task 1: Colores y fichas

**Files:**
- Create: `src/lib/mail/brand.ts`
- Test: `src/lib/mail/brand.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { mailBrand, publicFacts } from "./brand";

describe("marca del correo", () => {
  it("usa el rosa y el navy de la landing", () => {
    expect(mailBrand.pink).toBe("#e8186a");
    expect(mailBrand.navy).toBe("#16284f");
    expect(mailBrand.replyTo).toBe("hola@clusterdestartups.org");
  });

  it("sin sesión cita la fecha, el hotel y el horario públicos", () => {
    expect(publicFacts(null)).toEqual([
      { label: "Fecha", value: "Miércoles 18 de noviembre de 2026" },
      { label: "Dónde", value: "Hotel Quinta Real, Puebla" },
      { label: "Horario", value: "8:00 am – 11:45 am" },
    ]);
  });

  it("con sesión cita solo esa ficha", () => {
    expect(publicFacts("Quinta Real · 18 de noviembre de 2026 · 08:00–11:45")).toEqual([
      { label: "Sesión", value: "Quinta Real · 18 de noviembre de 2026 · 08:00–11:45" },
    ]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/mail/brand.test.ts`

Expected: FAIL with `Cannot find module './brand'`

- [ ] **Step 3: Write minimal implementation**

```ts
import { forumDate } from "@/content/forum-public";
import { clusterEmail, sessionFacts } from "@/content/landing";

export const mailBrand = {
  pink: "#e8186a",
  navy: "#16284f",
  muted: "#4b5563",
  line: "#e5e7eb",
  canvas: "#f7f7f8",
  white: "#ffffff",
  replyTo: clusterEmail,
  font: "Archivo, Raleway, Arial, sans-serif",
};

export function publicFacts(sessionLabel: string | null) {
  if (sessionLabel) return [{ label: "Sesión", value: sessionLabel }];
  const where = sessionFacts.find((fact) => fact.label === "Dónde")?.value ?? "";
  const hours = sessionFacts.find((fact) => fact.label === "Horario")?.value ?? "";
  return [
    { label: "Fecha", value: forumDate },
    { label: "Dónde", value: where },
    { label: "Horario", value: hours },
  ];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/mail/brand.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/mail/brand.ts src/lib/mail/brand.test.ts
git commit -m "feat: define mail brand colors and public session facts"
```

---

### Task 2: Cascarón de la landing

**Files:**
- Create: `src/lib/mail/shell.tsx`
- Test: `src/lib/mail/shell.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { render } from "@react-email/render";
import { describe, expect, it } from "vitest";
import { MailShell } from "./shell";

describe("cascarón del correo", () => {
  it("pinta la franja rosa, el navy y el nombre del foro", async () => {
    const html = await render(
      <MailShell preview="Vista previa" title="Título">
        <p>Cuerpo</p>
      </MailShell>,
    );
    expect(html).toContain("#e8186a");
    expect(html).toContain("#16284f");
    expect(html).toContain("Levantamiento de necesidades tecnológicas");
    expect(html).toContain("Foro Puebla x Puebla");
    expect(html).toContain("Título");
    expect(html).toContain("Cuerpo");
    expect(html).toContain("hola@clusterdestartups.org");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/mail/shell.test.ts`

Expected: FAIL with `Cannot find module './shell'`

- [ ] **Step 3: Write minimal implementation**

```tsx
import { Body, Container, Head, Hr, Html, Preview, Section, Text } from "@react-email/components";
import type { ReactNode } from "react";
import { forumKicker, forumName } from "@/content/forum-public";
import { mailBrand } from "./brand";

export function MailShell({
  preview,
  title,
  children,
}: {
  preview: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <Html lang="es">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ margin: 0, backgroundColor: mailBrand.canvas, fontFamily: mailBrand.font }}>
        <Container style={{ width: "100%", maxWidth: 560, margin: "0 auto", padding: "24px 16px" }}>
          <Section style={{ height: 6, backgroundColor: mailBrand.pink, borderRadius: "12px 12px 0 0" }} />
          <Section style={{ backgroundColor: mailBrand.navy, padding: "28px 32px 24px" }}>
            <Text style={{ margin: 0, color: "#b8c0ce", fontSize: 12, letterSpacing: "0.08em" }}>
              {forumKicker.toUpperCase()}
            </Text>
            <Text style={{ margin: "8px 0 0", color: mailBrand.white, fontSize: 28, fontWeight: 700 }}>
              {forumName}
            </Text>
          </Section>
          <Section style={{ backgroundColor: mailBrand.white, padding: "32px" }}>
            <Text style={{ margin: "0 0 16px", color: mailBrand.navy, fontSize: 26, fontWeight: 700, lineHeight: "1.2" }}>
              {title}
            </Text>
            {children}
          </Section>
          <Hr style={{ borderColor: mailBrand.line, margin: 0 }} />
          <Section style={{ backgroundColor: mailBrand.white, padding: "16px 32px 28px" }}>
            <Text style={{ margin: 0, color: mailBrand.muted, fontSize: 12, lineHeight: "1.5" }}>
              Clúster de Startups e Innovación · Si respondes, llega a {mailBrand.replyTo}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/mail/shell.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/mail/shell.tsx src/lib/mail/shell.test.ts
git commit -m "feat: add the landing-styled email shell"
```

---

### Task 2b: Pie con los 17 logos

**Files:**
- Create: `src/lib/mail/footer-logos.ts`
- Create: `src/lib/mail/mail-footer.tsx`
- Modify: `src/lib/mail/shell.tsx`
- Test: `src/lib/mail/mail-footer.test.ts`

El pie sustituye la línea de texto del cascarón. Tres filas, en este orden: Opera, Con el respaldo de, Convocan. Las imágenes usan URL absoluta. El texto de respuesta se queda debajo de los logos.

- [ ] **Step 1: Write the failing test**

```ts
import { render } from "@react-email/render";
import { describe, expect, it } from "vitest";
import { MailShell } from "./shell";

describe("pie de logos", () => {
  it("muestra clúster, gobierno y los convocantes", async () => {
    const html = await render(
      <MailShell preview="Vista" title="Título" assetBase="https://observatorio.example">
        <p>Cuerpo</p>
      </MailShell>,
    );
    expect(html).toContain("https://observatorio.example/logos/logo-cluster.webp");
    expect(html).toContain("https://observatorio.example/logos/logo-estado.svg");
    expect(html).toContain("https://observatorio.example/logos/logo-sedetra.png");
    expect(html).toContain("https://observatorio.example/logos/logo-cinco-de-mayo.png");
    expect(html).toContain("https://observatorio.example/logos/convocantes/cluster-agroalimentario-puebla.webp");
    expect(html).toContain("https://observatorio.example/logos/convocantes/citex-puebla-tlaxcala.webp");
    expect(html.match(/observatorio\.example\/logos\//g)?.length).toBe(17);
    expect(html).toContain("Opera");
    expect(html).toContain("Con el respaldo de");
    expect(html).toContain("Convocan");
    expect(html).toContain("hola@clusterdestartups.org");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/mail/mail-footer.test.ts`

Expected: FAIL because `MailShell` still no recibe `assetBase` y el HTML no trae los logos.

- [ ] **Step 3: Write minimal implementation**

`src/lib/mail/footer-logos.ts`

```ts
import { conveners } from "@/content/conveners";
import { clusterLogo } from "@/content/landing";

export type MailLogo = { src: string; alt: string; width: number; height: number };

export const operaLogos: MailLogo[] = [
  { src: clusterLogo.src, alt: clusterLogo.alt, width: clusterLogo.width, height: clusterLogo.height },
];

export const backingLogos: MailLogo[] = [
  { src: "/logos/logo-estado.svg", alt: "Gobierno del Estado de Puebla", width: 301, height: 126 },
  { src: "/logos/logo-sedetra.png", alt: "Secretaría de Desarrollo Económico y Trabajo", width: 1106, height: 253 },
  { src: "/logos/logo-cinco-de-mayo.png", alt: "5 de Mayo", width: 333, height: 252 },
];

export const convenerLogos: MailLogo[] = conveners.map((logo) => ({
  src: logo.src,
  alt: logo.alt,
  width: logo.width,
  height: logo.height,
}));

export function absoluteLogo(src: string, assetBase: string) {
  return `${assetBase.replace(/\/$/, "")}${src}`;
}
```

`src/lib/mail/mail-footer.tsx`

```tsx
import { Img, Section, Text } from "@react-email/components";
import { mailBrand } from "./brand";
import { absoluteLogo, backingLogos, convenerLogos, operaLogos, type MailLogo } from "./footer-logos";

export function MailFooter({ assetBase }: { assetBase: string }) {
  return (
    <Section style={{ backgroundColor: mailBrand.white, padding: "8px 32px 28px" }}>
      <LogoRow label="Opera" logos={operaLogos} assetBase={assetBase} />
      <LogoRow label="Con el respaldo de" logos={backingLogos} assetBase={assetBase} />
      <LogoRow label="Convocan" logos={convenerLogos} assetBase={assetBase} />
      <Text style={{ margin: "16px 0 0", color: mailBrand.muted, fontSize: 12, lineHeight: "1.5" }}>
        Clúster de Startups e Innovación · Si respondes, llega a {mailBrand.replyTo}
      </Text>
    </Section>
  );
}

function LogoRow({ label, logos, assetBase }: { label: string; logos: MailLogo[]; assetBase: string }) {
  return (
    <>
      <Text style={{ margin: "16px 0 8px", color: mailBrand.muted, fontSize: 11, letterSpacing: "0.08em" }}>
        {label.toUpperCase()}
      </Text>
      {logos.map((logo) => (
        <Img
          key={logo.src}
          src={absoluteLogo(logo.src, assetBase)}
          alt={logo.alt}
          width="88"
          height="32"
          style={{ display: "inline-block", margin: "0 12px 8px 0", objectFit: "contain" }}
        />
      ))}
    </>
  );
}
```

En `shell.tsx`, agrega `assetBase` opcional. Si no llega, usa `process.env.NEXT_PUBLIC_SITE_URL` y, si tampoco existe, `http://localhost:3000`. Sustituye la sección del pie de texto por `<MailFooter assetBase={base} />`. Quita el `Hr` solo si queda pegado al pie; déjalo entre la ficha y `MailFooter`.

```tsx
assetBase,
}: {
  preview: string;
  title: string;
  children: ReactNode;
  assetBase?: string;
}) {
  const base = assetBase ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/mail/mail-footer.test.ts src/lib/mail/shell.test.ts`

Expected: PASS. Si `mail-footer.tsx` pasa de 90 líneas, deja `LogoRow` en `src/lib/mail/logo-row.tsx`.

- [ ] **Step 5: Commit**

```bash
git add src/lib/mail/footer-logos.ts src/lib/mail/mail-footer.tsx src/lib/mail/shell.tsx src/lib/mail/mail-footer.test.ts
git commit -m "feat: put the landing logos in the email footer"
```

---

### Task 3: Bienvenida, sin QR

**Files:**
- Create: `src/lib/mail/welcome-mail.tsx`
- Test: `src/lib/mail/welcome-mail.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { render } from "@react-email/render";
import { describe, expect, it } from "vitest";
import { WelcomeMail } from "./welcome-mail";

describe("correo de bienvenida", () => {
  it("pide terminar el perfil y no trae pase", async () => {
    const html = await render(<WelcomeMail continueHref="https://observatorio.example/onboarding" />);
    expect(html).toContain("Tu lugar ya está apartado");
    expect(html).toContain("termina el perfil de tu empresa");
    expect(html).toContain("https://observatorio.example/onboarding");
    expect(html).toContain("Hotel Quinta Real, Puebla");
    expect(html).not.toContain("cid:pase");
  });

  it("sin sitio no inventa un botón", async () => {
    const html = await render(<WelcomeMail continueHref={null} />);
    expect(html).toContain("Vuelve al registro e inicia sesión.");
    expect(html).not.toContain("href=\"http");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/mail/welcome-mail.test.ts`

Expected: FAIL with `Cannot find module './welcome-mail'`

- [ ] **Step 3: Write minimal implementation**

```tsx
import { Button, Text } from "@react-email/components";
import { mailBrand, publicFacts } from "./brand";
import { MailShell } from "./shell";

export function WelcomeMail({ continueHref }: { continueHref: string | null }) {
  return (
    <MailShell preview="Termina tu perfil para llegar con el pase." title="Tu lugar ya está apartado">
      <Text style={{ margin: "0 0 16px", color: mailBrand.navy, fontSize: 16, lineHeight: "1.5" }}>
        Creamos tu cuenta para el Foro Puebla x Puebla. El siguiente paso: termina el perfil de tu empresa.
        Ahí queda tu pase.
      </Text>
      <FactRows />
      {continueHref ? (
        <Button
          href={continueHref}
          style={{ display: "inline-block", marginTop: 8, backgroundColor: mailBrand.pink, color: mailBrand.white, padding: "12px 20px", borderRadius: 999, fontWeight: 700 }}
        >
          Terminar mi perfil
        </Button>
      ) : (
        <Text style={{ margin: "16px 0 0", color: mailBrand.navy, fontSize: 16 }}>Vuelve al registro e inicia sesión.</Text>
      )}
    </MailShell>
  );
}

function FactRows() {
  return (
    <>
      {publicFacts(null).map((fact) => (
        <Text key={fact.label} style={{ margin: "0 0 4px", color: mailBrand.muted, fontSize: 14 }}>
          {fact.label}: {fact.value}
        </Text>
      ))}
    </>
  );
}
```

El texto del cuerpo dice «termina el perfil de tu empresa» para que el test lo encuentre. No escribas «terminar» en esa frase.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/mail/welcome-mail.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/mail/welcome-mail.tsx src/lib/mail/welcome-mail.test.ts
git commit -m "feat: design the welcome email without a pass"
```

---

### Task 4: PNG del pase

**Files:**
- Create: `src/lib/mail/pass-qr.ts`
- Test: `src/lib/mail/pass-qr.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { passQrAttachment } from "./pass-qr";

describe("png del pase", () => {
  it("codifica el id del perfil y lo marca como cid", async () => {
    const file = await passQrAttachment("360ab36d-9882-44c6-9b61-1010b9aab795");
    expect(file.contentId).toBe("pase");
    expect(file.contentType).toBe("image/png");
    expect(file.filename).toBe("pase.png");
    expect(Buffer.from(file.content, "base64").subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
  });

  it("rechaza un código vacío", async () => {
    await expect(passQrAttachment("  ")).rejects.toThrow("sin pase");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/mail/pass-qr.test.ts`

Expected: FAIL with `Cannot find module './pass-qr'`

- [ ] **Step 3: Write minimal implementation**

```ts
import QRCode from "qrcode";

export type PassAttachment = {
  filename: "pase.png";
  content: string;
  contentType: "image/png";
  contentId: "pase";
};

export async function passQrAttachment(profileId: string): Promise<PassAttachment> {
  const code = profileId.trim();
  if (!code) throw new Error("sin pase");
  const png = await QRCode.toBuffer(code, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 280,
    color: { dark: "#16284f", light: "#ffffff" },
  });
  return {
    filename: "pase.png",
    content: png.toString("base64"),
    contentType: "image/png",
    contentId: "pase",
  };
}
```

El texto del QR es el id del perfil, el mismo que `AccessPass` recibe como `code`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/mail/pass-qr.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/mail/pass-qr.ts src/lib/mail/pass-qr.test.ts
git commit -m "feat: render a profile pass as an inline png"
```

---

### Task 5: Bloque del QR

**Files:**
- Create: `src/lib/mail/pass-block.tsx`
- Test: `src/lib/mail/pass-block.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { render } from "@react-email/render";
import { describe, expect, it } from "vitest";
import { PassBlock } from "./pass-block";

describe("bloque del pase", () => {
  it("apunta al adjunto cid:pase", async () => {
    const html = await render(<PassBlock />);
    expect(html).toContain("cid:pase");
    expect(html).toContain("En la mesa lo escanean");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/mail/pass-block.test.ts`

Expected: FAIL with `Cannot find module './pass-block'`

- [ ] **Step 3: Write minimal implementation**

```tsx
import { Img, Text } from "@react-email/components";
import { mailBrand } from "./brand";

export function PassBlock() {
  return (
    <>
      <Img src="cid:pase" alt="Pase de acceso" width="220" height="220" style={{ margin: "8px 0 12px" }} />
      <Text style={{ margin: 0, color: mailBrand.navy, fontSize: 14 }}>
        Lleva este código en el teléfono. En la mesa lo escanean.
      </Text>
    </>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/mail/pass-block.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/mail/pass-block.tsx src/lib/mail/pass-block.test.ts
git commit -m "feat: add the inline pass block for mail"
```

---

### Task 6: Pase, recordatorio, innovación abierta y gracias

**Files:**
- Create: `src/lib/mail/event-pass-mail.tsx`
- Create: `src/lib/mail/reminder-mail.tsx`
- Create: `src/lib/mail/open-innovation-mail.tsx`
- Create: `src/lib/mail/thanks-mail.tsx`
- Test: `src/lib/mail/message-mails.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { render } from "@react-email/render";
import { describe, expect, it } from "vitest";
import { EventPassMail } from "./event-pass-mail";
import { OpenInnovationMail } from "./open-innovation-mail";
import { ReminderMail } from "./reminder-mail";
import { ThanksMail } from "./thanks-mail";

const session = "Hotel Quinta Real, Puebla · 18 de noviembre de 2026 · 08:00–11:45";

describe("cuerpos del foro", () => {
  it("el pase trae el QR y la sesión", async () => {
    const html = await render(<EventPassMail sessionLabel={session} />);
    expect(html).toContain("Tu pase ya está listo");
    expect(html).toContain("cid:pase");
    expect(html).toContain(session);
  });

  it("el recordatorio trae el QR y la sesión", async () => {
    const html = await render(<ReminderMail sessionLabel={session} />);
    expect(html).toContain("Mañana nos vemos");
    expect(html).toContain("cid:pase");
    expect(html).toContain(session);
  });

  it("innovación abierta pide respuesta y no trae QR", async () => {
    const html = await render(<OpenInnovationMail />);
    expect(html).toContain("innovación abierta");
    expect(html).toContain("Responde a este correo");
    expect(html).not.toContain("cid:pase");
  });

  it("el gracias no trae QR", async () => {
    const html = await render(<ThanksMail sessionLabel={session} />);
    expect(html).toContain("Gracias por venir");
    expect(html).toContain(session);
    expect(html).not.toContain("cid:pase");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/mail/message-mails.test.ts`

Expected: FAIL with `Cannot find module './event-pass-mail'`

- [ ] **Step 3: Write minimal implementation**

`src/lib/mail/event-pass-mail.tsx`

```tsx
import { Text } from "@react-email/components";
import { mailBrand, publicFacts } from "./brand";
import { PassBlock } from "./pass-block";
import { MailShell } from "./shell";

export function EventPassMail({ sessionLabel }: { sessionLabel: string | null }) {
  return (
    <MailShell preview="Guarda tu pase. En la mesa lo escanean." title="Tu pase ya está listo">
      <Text style={{ margin: "0 0 12px", color: mailBrand.navy, fontSize: 16, lineHeight: "1.5" }}>
        Tu lugar en la sesión ya quedó confirmado. Guarda este código.
      </Text>
      <PassBlock />
      <FactLine sessionLabel={sessionLabel} />
    </MailShell>
  );
}

function FactLine({ sessionLabel }: { sessionLabel: string | null }) {
  return (
    <>
      {publicFacts(sessionLabel).map((fact) => (
        <Text key={fact.label} style={{ margin: "12px 0 0", color: mailBrand.muted, fontSize: 14 }}>
          {fact.label}: {fact.value}
        </Text>
      ))}
    </>
  );
}
```

`src/lib/mail/reminder-mail.tsx`

```tsx
import { Text } from "@react-email/components";
import { mailBrand, publicFacts } from "./brand";
import { PassBlock } from "./pass-block";
import { MailShell } from "./shell";

export function ReminderMail({ sessionLabel }: { sessionLabel: string | null }) {
  return (
    <MailShell preview="Mañana es la sesión. Lleva tu pase." title="Mañana nos vemos">
      <Text style={{ margin: "0 0 12px", color: mailBrand.navy, fontSize: 16, lineHeight: "1.5" }}>
        La sesión del Observatorio es mañana. El desayuno está incluido. Lleva el mismo pase que recibiste al confirmar.
      </Text>
      <PassBlock />
      {publicFacts(sessionLabel).map((fact) => (
        <Text key={fact.label} style={{ margin: "12px 0 0", color: mailBrand.muted, fontSize: 14 }}>
          {fact.label}: {fact.value}
        </Text>
      ))}
    </MailShell>
  );
}
```

`src/lib/mail/open-innovation-mail.tsx`

```tsx
import { Text } from "@react-email/components";
import { mailBrand } from "./brand";
import { MailShell } from "./shell";

export function OpenInnovationMail() {
  return (
    <MailShell preview="Una pregunta del Observatorio." title="¿Quieres ser una empresa de innovación abierta?">
      <Text style={{ margin: 0, color: mailBrand.navy, fontSize: 16, lineHeight: "1.5" }}>
        Responde a este correo y te contamos cómo sumarte. El mapa del Observatorio ya tiene tu sector.
      </Text>
    </MailShell>
  );
}
```

`src/lib/mail/thanks-mail.tsx`

```tsx
import { Text } from "@react-email/components";
import { mailBrand, publicFacts } from "./brand";
import { MailShell } from "./shell";

export function ThanksMail({ sessionLabel }: { sessionLabel: string | null }) {
  return (
    <MailShell preview="Gracias por venir a la sesión." title="Gracias por venir">
      <Text style={{ margin: "0 0 12px", color: mailBrand.navy, fontSize: 16, lineHeight: "1.5" }}>
        Tu participación ya cuenta para el mapa del sector. En unos días te escribimos con el seguimiento.
      </Text>
      {publicFacts(sessionLabel).map((fact) => (
        <Text key={fact.label} style={{ margin: "8px 0 0", color: mailBrand.muted, fontSize: 14 }}>
          {fact.label}: {fact.value}
        </Text>
      ))}
    </MailShell>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/mail/message-mails.test.ts`

Expected: PASS. Si un archivo pasa de 90 líneas, parte la lista de fichas a `src/lib/mail/fact-lines.tsx` y vuelve a correr el test.

- [ ] **Step 5: Commit**

```bash
git add src/lib/mail/event-pass-mail.tsx src/lib/mail/reminder-mail.tsx src/lib/mail/open-innovation-mail.tsx src/lib/mail/thanks-mail.tsx src/lib/mail/message-mails.test.ts
git commit -m "feat: design pass, reminder, innovation, and thanks emails"
```

---

### Task 7: Elegir plantilla y adjunto

**Files:**
- Create: `src/lib/mail/paint-mail.ts`
- Test: `src/lib/mail/paint-mail.test.ts`
- Delete: `src/lib/mail/render-broadcast.tsx` en el Task 9, cuando `deliver.ts` ya no lo importe.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { paintMail } from "./paint-mail";

const profileId = "360ab36d-9882-44c6-9b61-1010b9aab795";

describe("pintar correo", () => {
  it("la bienvenida no adjunta pase", async () => {
    const painted = await paintMail({ kind: "welcome", profileId, sessionLabel: null, continueHref: null });
    expect(painted.html).toContain("Tu lugar ya está apartado");
    expect(painted.attachments).toEqual([]);
  });

  it("el recordatorio adjunta el png y lo cita", async () => {
    const painted = await paintMail({
      kind: "reminder",
      profileId,
      sessionLabel: "Hotel Quinta Real, Puebla · 18 de noviembre de 2026 · 08:00–11:45",
      continueHref: null,
    });
    expect(painted.html).toContain("Mañana nos vemos");
    expect(painted.html).toContain("cid:pase");
    expect(painted.attachments).toHaveLength(1);
    expect(painted.attachments[0].contentId).toBe("pase");
  });

  it("el pase adjunta el png y lo cita", async () => {
    const painted = await paintMail({
      kind: "event_pass",
      profileId,
      sessionLabel: null,
      continueHref: null,
    });
    expect(painted.html).toContain("cid:pase");
    expect(painted.attachments).toHaveLength(1);
    expect(painted.attachments[0].contentId).toBe("pase");
  });

  it("el recordatorio sin perfil no inventa un QR", async () => {
    await expect(
      paintMail({ kind: "reminder", profileId: null, sessionLabel: null, continueHref: null }),
    ).rejects.toThrow("sin pase");
  });

  it("el pase también exige perfil", async () => {
    await expect(
      paintMail({ kind: "event_pass", profileId: "  ", sessionLabel: null, continueHref: null }),
    ).rejects.toThrow("sin pase");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/mail/paint-mail.test.ts`

Expected: FAIL with `Cannot find module './paint-mail'`

- [ ] **Step 3: Write minimal implementation**

```ts
import { render } from "@react-email/render";
import type { MailKind } from "@/lib/admin/bandeja/kinds";
import { EventPassMail } from "./event-pass-mail";
import { OpenInnovationMail } from "./open-innovation-mail";
import { passQrAttachment, type PassAttachment } from "./pass-qr";
import { ReminderMail } from "./reminder-mail";
import { ThanksMail } from "./thanks-mail";
import { WelcomeMail } from "./welcome-mail";

export type PaintedMail = { html: string; attachments: PassAttachment[] };

export async function paintMail(input: {
  kind: MailKind;
  profileId: string | null;
  sessionLabel: string | null;
  continueHref: string | null;
}): Promise<PaintedMail> {
  if (input.kind === "password") throw new Error("sin cuerpo");
  if (input.kind === "welcome") {
    return { html: await render(<WelcomeMail continueHref={input.continueHref} />), attachments: [] };
  }
  if (input.kind === "open_innovation") {
    return { html: await render(<OpenInnovationMail />), attachments: [] };
  }
  if (input.kind === "thanks") {
    return { html: await render(<ThanksMail sessionLabel={input.sessionLabel} />), attachments: [] };
  }
  const profileId = input.profileId?.trim() ?? "";
  if (!profileId) throw new Error("sin pase");
  const attachments = [await passQrAttachment(profileId)];
  const html =
    input.kind === "event_pass"
      ? await render(<EventPassMail sessionLabel={input.sessionLabel} />)
      : await render(<ReminderMail sessionLabel={input.sessionLabel} />);
  return { html, attachments };
}
```

`reminder` y `event_pass` son los únicos que llegan al adjunto. Un `kind` distinto ya salió antes.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/mail/paint-mail.test.ts`

Expected: PASS. Si `paint-mail.ts` pasa de 90 líneas, mueve el `if` de bienvenida, innovación y gracias a `src/lib/mail/paint-plain.ts` y deja el pase en `paint-mail.ts`.

- [ ] **Step 5: Commit**

```bash
git add src/lib/mail/paint-mail.ts src/lib/mail/paint-mail.test.ts
git commit -m "feat: paint each mail kind and attach the pass png"
```

---

### Task 8: Cuerpo que Resend acepta

**Files:**
- Create: `src/lib/mail/post-mail.ts`
- Test: `src/lib/mail/post-mail.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { resendPayload } from "./post-mail";

describe("cuerpo de Resend", () => {
  it("manda desde MAIL_FROM y responde a hola", () => {
    const payload = resendPayload({
      from: "Foro Puebla x Puebla <noreply@notificaciones.clusterdestartups.org>",
      to: "ana@norte.mx",
      subject: "Mañana es la sesión del Observatorio",
      html: "<p>Hola</p>",
      attachments: [],
    });
    expect(payload.from).toContain("noreply@notificaciones.clusterdestartups.org");
    expect(payload.replyTo).toBe("hola@clusterdestartups.org");
    expect(payload.to).toEqual(["ana@norte.mx"]);
    expect(payload.attachments).toBeUndefined();
  });

  it("incluye el png cuando hay pase", () => {
    const payload = resendPayload({
      from: "Foro <noreply@notificaciones.clusterdestartups.org>",
      to: "ana@norte.mx",
      subject: "Mañana es la sesión del Observatorio",
      html: "<img src=\"cid:pase\" />",
      attachments: [{ filename: "pase.png", content: "aGk=", contentType: "image/png", contentId: "pase" }],
    });
    expect(payload.attachments).toEqual([
      { filename: "pase.png", content: "aGk=", contentType: "image/png", contentId: "pase" },
    ]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/mail/post-mail.test.ts`

Expected: FAIL with `Cannot find module './post-mail'`

- [ ] **Step 3: Write minimal implementation**

```ts
import { mailBrand } from "./brand";
import type { PassAttachment } from "./pass-qr";

export function resendPayload(input: {
  from: string;
  to: string;
  subject: string;
  html: string;
  attachments: PassAttachment[];
}) {
  return {
    from: input.from,
    to: [input.to],
    subject: input.subject,
    html: input.html,
    replyTo: mailBrand.replyTo,
    attachments: input.attachments.length ? input.attachments : undefined,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/mail/post-mail.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/mail/post-mail.ts src/lib/mail/post-mail.test.ts
git commit -m "feat: build the Resend payload with reply-to and the pass"
```

---

### Task 9: El masivo usa el diseño y el QR

**Files:**
- Modify: `src/lib/mail/deliver.ts`
- Modify: `src/lib/mail/broadcast-queue.ts`
- Modify: `src/lib/mail/send-broadcast.ts`
- Delete: `src/lib/mail/render-broadcast.tsx`
- Test: `src/lib/mail/deliver.test.ts`

`PendingMail` gana `profile_id`. `deliverPending` recibe `sessionLabel` y `continueHref`. Pinta cada fila. Si `paintMail` lanza «sin pase», esa fila queda con `last_error` y no se manda. El `idempotencyKey` sigue siendo el id de la fila. `replyTo` sale de `resendPayload`.

- [ ] **Step 1: Write the failing test**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("envío masivo", () => {
  it("pinta cada fila y adjunta el pase", () => {
    const deliver = readFileSync("src/lib/mail/deliver.ts", "utf8");
    const queue = readFileSync("src/lib/mail/broadcast-queue.ts", "utf8");
    const send = readFileSync("src/lib/mail/send-broadcast.ts", "utf8");
    expect(deliver).toContain("paintMail");
    expect(deliver).toContain("resendPayload");
    expect(deliver).toContain("idempotencyKey: row.id");
    expect(deliver).not.toContain("renderBroadcast");
    expect(queue).toContain("profile_id");
    expect(send).toContain("sessionLabel");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/mail/deliver.test.ts`

Expected: FAIL because `deliver.ts` still contains `renderBroadcast`

- [ ] **Step 3: Write minimal implementation**

Sustituye `src/lib/mail/deliver.ts` por esto:

```ts
import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import type { BroadcastKind } from "./broadcast-audience";
import { paintMail } from "./paint-mail";
import { resendPayload } from "./post-mail";

export type PendingMail = {
  id: string;
  to_email: string;
  subject: string;
  kind: BroadcastKind;
  profile_id: string | null;
};

const missing = "Falta RESEND_API_KEY o MAIL_FROM";

export async function deliverPending(
  db: SupabaseClient,
  rows: PendingMail[],
  context: { sessionLabel: string | null; continueHref: string | null },
) {
  if (!rows.length) return { sent: 0 };
  const key = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM;
  if (!key || !from) {
    for (const row of rows) await mark(db, row.id, missing);
    return { sent: 0, warning: "Los correos quedaron en la bandeja. Falta RESEND_API_KEY o MAIL_FROM." };
  }
  let sent = 0;
  for (const row of rows) {
    const painted = await paintRow(row, context);
    if ("error" in painted) {
      await mark(db, row.id, painted.error);
      continue;
    }
    const outcome = await post(key, from, row, painted.html, painted.attachments);
    if (!outcome.providerId) {
      await mark(db, row.id, outcome.error, painted.html);
      continue;
    }
    const updated = await db.from("outbox_messages").update({
      sent_at: new Date().toISOString(),
      provider_id: outcome.providerId,
      last_error: null,
      body_html: painted.html,
    }).eq("id", row.id);
    if (updated.error) continue;
    await db.from("outbox_attempts").insert({ message_id: row.id, provider_id: outcome.providerId });
    sent += 1;
  }
  return { sent };
}

async function paintRow(
  row: PendingMail,
  context: { sessionLabel: string | null; continueHref: string | null },
) {
  try {
    return await paintMail({
      kind: row.kind,
      profileId: row.profile_id,
      sessionLabel: context.sessionLabel,
      continueHref: context.continueHref,
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "sin cuerpo" };
  }
}

async function post(
  key: string,
  from: string,
  row: PendingMail,
  html: string,
  attachments: Awaited<ReturnType<typeof paintMail>>["attachments"],
) {
  const sent = await new Resend(key).emails.send(resendPayload({ from, to: row.to_email, subject: row.subject, html, attachments }), {
    idempotencyKey: row.id,
  });
  if (sent.error || !sent.data?.id) return { error: sent.error?.message ?? "Resend no devolvió id" };
  return { providerId: sent.data.id, error: "" };
}

async function mark(db: SupabaseClient, id: string, error: string, html?: string) {
  await db.from("outbox_messages").update({ last_error: error, body_html: html ?? null }).eq("id", id);
  await db.from("outbox_attempts").insert({ message_id: id, error });
}
```

Si este archivo pasa de 90 líneas, mueve `post` y `mark` a `src/lib/mail/deliver-post.ts` sin cambiar los nombres.

En `broadcast-queue.ts`, el `select` de `pendingMails` pasa de `id, to_email, subject, kind` a `id, to_email, subject, kind, profile_id`.

En `send-broadcast.ts`, antes de `deliverPending`, carga la sesión cuando hay `sessionId`:

```ts
const sessionLabel = await labelFor(db, input.sessionId);
return deliverPending(db, queued.rows, { sessionLabel, continueHref: null });
```

`labelFor` lee `venue, session_on, starts_local, ends_local` de `sessions` y devuelve `currentOption(row).label`. Si no hay fila, devuelve `null`. `currentOption` ya está en `src/lib/sessions/face.ts`.

Borra `src/lib/mail/render-broadcast.tsx`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/mail/deliver.test.ts src/lib/mail/broadcast-audience.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/mail/deliver.ts src/lib/mail/broadcast-queue.ts src/lib/mail/send-broadcast.ts src/lib/mail/deliver.test.ts
git add -u src/lib/mail/render-broadcast.tsx
git commit -m "feat: send designed broadcast mail with each person's pass"
```

---

### Task 10: El empresario puede encolar su bienvenida y su pase

**Files:**
- Create: `supabase/migrations/20261103233000_own_mail.sql`
- Test: `src/lib/mail/own-mail.test.ts`

El empresario no puede hacer `select` ni `update` en `outbox_messages`. No hay `SUPABASE_SERVICE_ROLE_KEY` en `.env.local`. Por eso el alta usa dos funciones `security definer`. Solo aceptan `welcome` y `event_pass`, solo para `auth.uid()`, y solo si el perfil es `empresario`. El pase además exige `onboarded_at`.

- [ ] **Step 1: Write the failing test**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("correo propio", () => {
  it("solo el empresario encola bienvenida o pase", () => {
    const sql = readFileSync("supabase/migrations/20261103233000_own_mail.sql", "utf8");
    expect(sql).toContain("enqueue_own_mail");
    expect(sql).toContain("record_own_mail");
    expect(sql).toContain("kind not in ('welcome', 'event_pass')");
    expect(sql).toContain("role = 'empresario'");
    expect(sql).toContain("onboarded_at is not null");
    expect(sql).toContain("profile_id = auth.uid()");
    expect(sql).toContain("profile_id uuid");
    expect(sql).toContain("outbox_one_event_pass_per_profile_idx");
    expect(sql).toContain("grant execute on function public.enqueue_own_mail(public.mail_kind) to authenticated");
    expect(sql).toContain("grant execute on function public.record_own_mail(uuid, text, text, text) to authenticated");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/mail/own-mail.test.ts`

Expected: FAIL because the migration file does not exist

- [ ] **Step 3: Write minimal implementation**

```sql
create unique index outbox_one_event_pass_per_profile_idx
  on public.outbox_messages (profile_id)
  where kind = 'event_pass' and profile_id is not null;

create or replace function public.enqueue_own_mail(mail_kind public.mail_kind)
returns table (id uuid, to_email text, subject text, profile_id uuid, already_sent boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  row_id uuid;
  own_email text;
  own_subject text;
begin
  if mail_kind not in ('welcome', 'event_pass') then
    raise exception 'tipo no permitido';
  end if;
  if auth.uid() is null then
    raise exception 'sin sesión';
  end if;
  select lower(email) into own_email from auth.users where auth.users.id = auth.uid();
  if own_email is null then
    raise exception 'sin correo';
  end if;
  if not exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'empresario'
  ) then
    raise exception 'no es empresario';
  end if;
  if mail_kind = 'event_pass' and not exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.onboarded_at is not null
  ) then
    raise exception 'sin perfil terminado';
  end if;
  own_subject := case mail_kind
    when 'welcome' then 'Tu lugar en el Observatorio ya está apartado'
    else 'Tu pase para la sesión ya está listo'
  end;
  begin
    insert into public.outbox_messages (kind, to_email, subject, profile_id, created_by)
    values (mail_kind, own_email, own_subject, auth.uid(), auth.uid())
    returning outbox_messages.id into row_id;
  exception when unique_violation then
    select messages.id into row_id
    from public.outbox_messages as messages
    where messages.profile_id = auth.uid() and messages.kind = mail_kind
    order by messages.created_at desc
    limit 1;
  end;
  return query
  select messages.id, messages.to_email, messages.subject, messages.profile_id, messages.sent_at is not null
  from public.outbox_messages as messages
  where messages.id = row_id;
end;
$$;

create or replace function public.record_own_mail(
  message_id uuid,
  provider text,
  failure text,
  html text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.outbox_messages
  set provider_id = provider,
      last_error = failure,
      body_html = html,
      sent_at = case when provider is not null and provider <> '' then now() else sent_at end
  where id = message_id
    and profile_id = auth.uid()
    and kind in ('welcome', 'event_pass')
    and sent_at is null;
  if not found then
    raise exception 'no se pudo registrar';
  end if;
end;
$$;

revoke all on function public.enqueue_own_mail(public.mail_kind) from public;
grant execute on function public.enqueue_own_mail(public.mail_kind) to authenticated;

revoke all on function public.record_own_mail(uuid, text, text, text) from public;
grant execute on function public.record_own_mail(uuid, text, text, text) to authenticated;
```

Aplica esta migración al proyecto de Supabase antes de probar el alta. Sin ella, el RPC no existe.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/mail/own-mail.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20261103233000_own_mail.sql src/lib/mail/own-mail.test.ts
git commit -m "feat: let an empresario enqueue their own welcome and pass"
```

---

### Task 11: Mandar la bienvenida y el pase con el JWT

**Files:**
- Create: `src/lib/mail/send-own.ts`
- Create: `src/lib/mail/continue-href.ts`
- Modify: `src/lib/auth/signup-empresario.ts`
- Modify: `src/lib/onboarding/complete-empresario.ts`
- Test: `src/lib/mail/send-own.test.ts`

`sendOwnMail` no tumba el alta ni el perfil si Resend falla. Llama a `enqueue_own_mail`. Si `already_sent` es verdadero, no vuelve a mandar. Pinta, manda con `idempotencyKey` igual al id, y registra con `record_own_mail`. El organismo no pasa por `signupEmpresarioAndSession`, así que no recibe esta bienvenida.

- [ ] **Step 1: Write the failing test**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { continueHref } from "./continue-href";

describe("envío propio", () => {
  it("arma el enlace solo si hay sitio", () => {
    expect(continueHref("https://observatorio.example")).toBe("https://observatorio.example/onboarding");
    expect(continueHref(undefined)).toBeNull();
  });

  it("el alta y el perfil llaman al envío y no frenan si falla", () => {
    const send = readFileSync("src/lib/mail/send-own.ts", "utf8");
    const signup = readFileSync("src/lib/auth/signup-empresario.ts", "utf8");
    const done = readFileSync("src/lib/onboarding/complete-empresario.ts", "utf8");
    expect(send).toContain("enqueue_own_mail");
    expect(send).toContain("record_own_mail");
    expect(send).toContain("paintMail");
    expect(send).toContain("already_sent");
    expect(signup).toContain('sendOwnMail');
    expect(signup).toContain('"welcome"');
    expect(done).toContain('sendOwnMail');
    expect(done).toContain('"event_pass"');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/mail/send-own.test.ts`

Expected: FAIL with `Cannot find module './continue-href'`

- [ ] **Step 3: Write minimal implementation**

`src/lib/mail/continue-href.ts`

```ts
export function continueHref(siteUrl: string | undefined) {
  const base = siteUrl?.trim().replace(/\/$/, "");
  if (!base) return null;
  return `${base}/onboarding`;
}
```

`src/lib/mail/send-own.ts`

```ts
import "server-only";

import { Resend } from "resend";
import { createSupabaseWithAccess } from "@/lib/supabase/auth-session";
import { continueHref } from "./continue-href";
import { paintMail } from "./paint-mail";
import { resendPayload } from "./post-mail";

type OwnKind = "welcome" | "event_pass";

export async function sendOwnMail(accessToken: string, kind: OwnKind) {
  try {
    const db = createSupabaseWithAccess(accessToken);
    const enqueued = await db.rpc("enqueue_own_mail", { mail_kind: kind });
    const row = Array.isArray(enqueued.data) ? enqueued.data[0] : enqueued.data;
    if (enqueued.error || !row || row.already_sent) return;
    const key = process.env.RESEND_API_KEY;
    const from = process.env.MAIL_FROM;
    if (!key || !from) {
      await db.rpc("record_own_mail", {
        message_id: row.id,
        provider: null,
        failure: "Falta RESEND_API_KEY o MAIL_FROM",
        html: null,
      });
      return;
    }
    const painted = await paintMail({
      kind,
      profileId: row.profile_id,
      sessionLabel: null,
      continueHref: kind === "welcome" ? continueHref(process.env.NEXT_PUBLIC_SITE_URL) : null,
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
    await db.rpc("record_own_mail", {
      message_id: row.id,
      provider: sent.data?.id ?? null,
      failure: sent.error?.message ?? null,
      html: painted.html,
    });
  } catch (error) {
    console.error("sendOwnMail", error);
  }
}
```

`row.profile_id` es el perfil, no el id del mensaje. La bienvenida no adjunta el pase: `paintMail` ignora ese id cuando el tipo es `welcome`.

En `signup-empresario.ts`, después de `writeSupabaseSession(session)` y antes del `return`, en los dos caminos que ya tienen `session`:

```ts
await sendOwnMail(session.access_token, "welcome");
```

No lo pongas en el camino que devuelve `{ error }` ni en el que manda a `/verificar` sin sesión.

En `complete-empresario.ts`, dentro de `finishInSupabase`, después de `attributeSignup`. El QR de confirmación sale solo si el pase ya no está pendiente, igual que la pantalla:

```ts
const pendingLink = await linkPassPending(access!, session!.email);
const pendingExternal = await externalPassPending(access!, session!.id);
if (!pendingLink && !pendingExternal) await sendOwnMail(access!, "event_pass");
```

`linkPassPending` vive en `src/lib/onboarding/link-pass-state.ts`. `externalPassPending` vive en `src/lib/onboarding/external-pass-state.ts`. `access` y `session` ya se leyeron al inicio de esa función. El perfil ya tiene `onboarded_at` porque `saveEmpresarioProfile` terminó. Si el enlace sigue pendiente, este correo no sale todavía. El recordatorio, cuando el superadmin lo dispare, sí lleva el QR.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/mail/send-own.test.ts src/lib/mail/own-mail.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/mail/send-own.ts src/lib/mail/continue-href.ts src/lib/mail/send-own.test.ts src/lib/auth/signup-empresario.ts src/lib/onboarding/complete-empresario.ts supabase/migrations/20261103233000_own_mail.sql src/lib/mail/own-mail.test.ts
git commit -m "feat: send welcome at signup and the pass when the profile is saved"
```

---

### Task 12: Prueba real a las dos bandejas

Esta tarea no corre en CI. Se hace con el dev server y una cuenta de empresario de prueba, más el botón del superadmin.

- [ ] Aplica `supabase/migrations/20261103233000_own_mail.sql` en el proyecto Supabase.
- [ ] Crea una cuenta empresario con un correo que controles. Debe llegar «Tu lugar en el Observatorio ya está apartado», con franja rosa, encabezado navy y sin QR.
- [ ] Termina el perfil de esa cuenta. Debe llegar «Tu pase para la sesión ya está listo», con el QR. Escanéalo: el texto es el id del perfil.
- [ ] En `/admin/correo`, manda recordatorio de la sesión vigente a un perfil que ya terminó onboarding. El correo trae el QR de esa persona. Si la fila no tiene `profile_id`, queda pendiente con `last_error` «sin pase» y no sale.
- [ ] Manda innovación abierta y gracias. No traen QR. Una respuesta llega a `hola@clusterdestartups.org`.
- [ ] El organismo que crea cuenta no recibe la bienvenida del empresario.

## Fuera de este plan

- `password` no tiene plantilla ni envío.
- No se crea la fila `passes` ni el PNG en Storage. El QR del correo coincide con el de la pantalla. La mesa sigue exigiendo la fila para dejar entrar.
- No se rediseña la pantalla de `/admin/correo`. Cambian los cuerpos, no los botones.

## Verificación

- [ ] `npx vitest run src/lib/mail/brand.test.ts src/lib/mail/shell.test.ts src/lib/mail/mail-footer.test.ts src/lib/mail/welcome-mail.test.ts src/lib/mail/pass-qr.test.ts src/lib/mail/pass-block.test.ts src/lib/mail/message-mails.test.ts src/lib/mail/paint-mail.test.ts src/lib/mail/post-mail.test.ts src/lib/mail/deliver.test.ts src/lib/mail/own-mail.test.ts src/lib/mail/send-own.test.ts`
- [ ] Ningún archivo nuevo de `src/lib/mail` pasa de 90 líneas.
- [ ] Un alta de empresario deja una fila `welcome` enviada, sin QR. Si Resend falla, la fila queda pendiente y el alta sí termina.
- [ ] Terminar el perfil manda `event_pass` con el QR solo si el pase ya no está pendiente. Si sigue pendiente, ese correo no sale. Una segunda confirmación no manda otro.
- [ ] El recordatorio de una sesión manda el QR de cada persona.
- [ ] Los cinco correos traen en el pie los 17 logos: clúster, gobierno y convocantes.
- [ ] Innovación abierta y gracias usan el cascarón y no adjuntan pase.
