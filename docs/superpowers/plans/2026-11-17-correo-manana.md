# Correo de mañana Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mandar un correo de «mañana nos vemos» a quien ya tiene cuenta de empresario, con la contraseña compartida y dos entradas: el pase de la puerta y el logo del evento, y el recordatorio de que esa misma cuenta responde el formulario.

**Architecture:** Es otro `mail_kind`, `briefing`, al lado de `reminder`. No reutiliza el recordatorio actual: ese solo dice que lleven el pase y no da cuenta ni logo. El cuerpo lo pinta React Email. La bandeja y Resend siguen en `queueBroadcast` / `deliverPending`. El login aprende un regreso corto, solo `/onboarding` o `/metodologia`, porque hoy ignorar `next` manda al formulario y esconde el pase.

**Tech Stack:** Next.js 16, React Email, Supabase `mail_kind`, Resend, Vitest.

---

## Qué dice el correo

Asunto: `Mañana nos vemos`.

Cuerpo, en este orden:

1. Gracias por registrarte. Ya estamos listos para mañana.
2. Entra en `/login` con tu correo y la contraseña que exporta `temporaryPassword()` en `src/lib/admin/registros/temp-password.ts`. Si ya elegiste otra, usa la tuya. El enlace de «Olvidé mi contraseña» sigue en `/recuperar`.
3. Dos acciones, cada una con su botón:
   - Ver el pase que se muestra en la entrada. Va a `/onboarding`. Ahí, con el lugar confirmado, `AccessPass` pinta el QR. Si el lugar sigue en espera, la misma pantalla dice que el pase llegará por correo. No prometas el QR a quien todavía no está aceptado.
   - Subir el logo, si quiere, para las pantallas del evento. Es el mismo `/onboarding`: `laterLogoOffer` lo muestra solo cuando no hay logo y la puerta es `pase` o `espera`.
4. Esta cuenta es la que responde el formulario. Botón a `/metodologia`.

Fecha, lugar y horario salen de `publicFacts(null)` en `src/lib/mail/brand.ts`. Hoy la fecha publicada es miércoles 18 de noviembre de 2026.

## A quién sí y a quién no

Sí: perfil `empresario`, con `onboarded_at`, con correo, sin fila en `attendance_cancellations`.

No: directores, capturistas, invitadores, superadmin, quien no terminó el perfil, quien canceló, y los registros públicos que todavía no tienen cuenta.

La contraseña compartida es la de las cuentas que crea «Aceptar» en registros públicos. Quien entró por el enlace de un organismo eligió la suya. El párrafo de la contraseña dice las dos cosas. No se le cambia la contraseña a nadie.

## Mapa de archivos

- Crear: `src/lib/mail/briefing-mail.tsx` — el cuerpo.
- Crear: `src/lib/mail/briefing-mail.test.tsx` — el texto y los dos enlaces.
- Crear: `src/lib/auth/return-path.ts` — solo `/onboarding` y `/metodologia`.
- Crear: `src/lib/auth/return-path.test.ts`.
- Crear: `supabase/migrations/<timestamp>_briefing_mail.sql` — valor `briefing` en `mail_kind` y el asunto fijo.
- Modificar: `src/lib/outbox-message.ts` — asunto.
- Modificar: `src/lib/mail/broadcast-audience.ts` — filtro del nuevo kind.
- Modificar: `src/lib/mail/broadcast-queue.ts` — leer `role` y cancelaciones.
- Modificar: `src/lib/mail/paint-mail.tsx` — pintar `briefing` sin adjuntar QR.
- Modificar: `src/lib/admin/bandeja/list.ts` — el kind entra a la bandeja.
- Modificar: `src/app/admin/correo/broadcast-forms.tsx` — botón «Enviar nos vemos mañana».
- Modificar: `src/lib/auth/login-action.ts` y `src/lib/auth/session-redirect.ts` — respetar el regreso.
- Modificar: `src/app/login/page.tsx` — guardar `next` en el formulario.

Cada archivo de código nuevo o tocado se queda en 90 líneas o menos. Si uno pasa, se parte en el mismo cambio.

---

### Task 1: Regreso seguro después de entrar

El pase vive en `/onboarding` y el formulario en `/metodologia`. `loginAction` hoy no lee `next`. Con el evento abierto, `pathAfterSignIn` manda al empresario a `/metodologia` y no ve el pase.

**Files:**
- Create: `src/lib/auth/return-path.ts`
- Test: `src/lib/auth/return-path.test.ts`
- Modify: `src/lib/auth/login-action.ts`
- Modify: `src/lib/auth/session-redirect.ts`
- Modify: `src/app/login/page.tsx`
- Modify: `src/components/auth/login-form.tsx`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { safeReturnPath } from "./return-path";

describe("regreso del correo", () => {
  it("solo deja el pase y el formulario", () => {
    expect(safeReturnPath("/onboarding")).toBe("/onboarding");
    expect(safeReturnPath("/metodologia")).toBe("/metodologia");
    expect(safeReturnPath("/admin")).toBeNull();
    expect(safeReturnPath("https://otro.example/onboarding")).toBeNull();
    expect(safeReturnPath(null)).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/auth/return-path.test.ts`
Expected: FAIL with `safeReturnPath` not defined.

- [ ] **Step 3: Write the allowlist**

```ts
const allowed = new Set(["/onboarding", "/metodologia"]);

export function safeReturnPath(value: string | null | undefined) {
  const path = (value ?? "").trim();
  return allowed.has(path) ? path : null;
}
```

- [ ] **Step 4: Carry it through login**

`login/page.tsx` lee `next` de `searchParams` y se lo pasa a `LoginForm`. El form manda `<input type="hidden" name="next" value={next} />` solo si `safeReturnPath(next)` no es null.

En `loginAction`, después de armar el destino con `pathAfterSignIn`, si `safeReturnPath(formData.get("next"))` devuelve una ruta, `redirect` va ahí. Eso aplica en la rama de Supabase y en la de memoria.

`sessionRedirect` sigue mandando a casa cuando la persona ya trae sesión y abre `/login`. No hace falta cambiar esa puerta: el botón del correo apunta a `/onboarding` o `/metodologia`, y esas rutas no están en `sessionEntries`, así que no rebotan.

- [ ] **Step 5: Run the test**

Run: `npx vitest run src/lib/auth/return-path.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/lib/auth/return-path.ts src/lib/auth/return-path.test.ts src/lib/auth/login-action.ts src/lib/auth/session-redirect.ts src/app/login/page.tsx src/components/auth/login-form.tsx
git commit -m "feat: return login to the pass or the form"
```

---

### Task 2: El kind `briefing`

**Files:**
- Create: `supabase/migrations/<timestamp>_briefing_mail.sql`
- Modify: `src/lib/outbox-message.ts`
- Test: `src/lib/outbox-message.test.ts`

- [ ] **Step 1: Write the failing test**

En `src/lib/outbox-message.test.ts`, junto a los asuntos que ya existen:

```ts
expect(mailFor("briefing", "ana@norte.mx").subject).toBe("Mañana nos vemos");
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/outbox-message.test.ts`
Expected: FAIL because `briefing` is not a key of `subjects`.

- [ ] **Step 3: Add the subject**

En `subjects`:

```ts
briefing: "Mañana nos vemos",
```

- [ ] **Step 4: Migration**

`supabase migration new briefing_mail`, luego este SQL. No uses `supabase db push`.

```sql
alter type public.mail_kind add value if not exists 'briefing';

alter table public.outbox_messages
  drop constraint if exists outbox_briefing_subject;

alter table public.outbox_messages
  add constraint outbox_briefing_subject check (
    kind <> 'briefing' or subject = 'Mañana nos vemos'
  );
```

`add value` no puede correr dentro de una transacción en Postgres viejo. Si el CLI envuelve la migración en transacción y falla, parte el `add value` en su propio archivo y deja el `check` en el siguiente.

Aplica el SQL en el proyecto con la migración del repo, no con un update suelto de datos.

- [ ] **Step 5: Run the test**

Run: `npx vitest run src/lib/outbox-message.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/lib/outbox-message.ts src/lib/outbox-message.test.ts supabase/migrations/*briefing_mail.sql
git commit -m "feat: add the briefing mail kind"
```

---

### Task 3: El cuerpo

**Files:**
- Create: `src/lib/mail/briefing-mail.tsx`
- Test: `src/lib/mail/briefing-mail.test.tsx`
- Modify: `src/lib/mail/paint-mail.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { render } from "@react-email/render";
import { describe, expect, it } from "vitest";
import { temporaryPassword } from "@/lib/admin/registros/temp-password";
import { BriefingMail } from "./briefing-mail";

describe("correo de mañana", () => {
  it("agradece, da la contraseña y las dos acciones", async () => {
    const html = await render(
      <BriefingMail loginHref="https://observatorio.example/login?next=/onboarding" formHref="https://observatorio.example/login?next=/metodologia" />,
    );
    expect(html).toContain("Gracias por registrarte");
    expect(html).toContain(temporaryPassword);
    expect(html).toContain("https://observatorio.example/login?next=/onboarding");
    expect(html).toContain("https://observatorio.example/login?next=/metodologia");
    expect(html).toContain("pase");
    expect(html).toContain("logo");
    expect(html).toContain("formulario");
    expect(html).not.toContain("data:image/png");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/mail/briefing-mail.test.tsx`
Expected: FAIL with `BriefingMail` not defined.

- [ ] **Step 3: Write the component**

Usa `MailShell`, `Text` y `Button` como `WelcomeMail`. El título del shell es `Mañana nos vemos`. La contraseña es `temporaryPassword()`, no una cadena nueva. Los hechos son `publicFacts(null)`.

Dos botones:

- «Ver mi pase y subir logo» → `loginHref`
- «Responder el formulario» → `formHref`

Un párrafo dice que si ya cambió la contraseña, usa la suya. Otro dice que el logo es opcional y sale en las pantallas del evento. Otro dice que esta cuenta es la del formulario.

`paint-mail.tsx`: si `kind === "briefing"`, arma los dos href con `mailOrigin(process.env.NEXT_PUBLIC_SITE_URL)`:

- `${origin}/login?next=/onboarding`
- `${origin}/login?next=/metodologia`

Devuelve `{ html, attachments: [] }`. No llames `passQrAttachment`.

- [ ] **Step 4: Run the test**

Run: `npx vitest run src/lib/mail/briefing-mail.test.tsx src/lib/mail/paint-mail.test.ts`
Expected: PASS. Agrega en `paint-mail.test.ts` un caso `kind: "briefing"` que no pida pase ni permiso.

- [ ] **Step 5: Commit**

```bash
git add src/lib/mail/briefing-mail.tsx src/lib/mail/briefing-mail.test.tsx src/lib/mail/paint-mail.tsx src/lib/mail/paint-mail.test.ts
git commit -m "feat: write the see-you-tomorrow mail"
```

---

### Task 4: Audiencia y botón

**Files:**
- Modify: `src/lib/mail/broadcast-audience.ts`
- Modify: `src/lib/mail/broadcast-audience.test.ts`
- Modify: `src/lib/mail/broadcast-queue.ts`
- Modify: `src/lib/admin/bandeja/list.ts`
- Modify: `src/app/admin/correo/broadcast-forms.tsx`
- Modify: `src/lib/mail/send-broadcast.ts` — `briefing` no exige sesión, igual que `open_innovation`.

- [ ] **Step 1: Write the failing test**

`RegisteredPerson` gana `role: "empresario" | "director"` y `cancelled: boolean`.

```ts
it("el de mañana va a empresarios en el perfil que no cancelaron", () => {
  const rows = [
    { id: "ana", email: "ana@norte.mx", onboarded: true, arrived: false, role: "empresario" as const, cancelled: false },
    { id: "beto", email: "beto@sur.mx", onboarded: true, arrived: false, role: "director" as const, cancelled: false },
    { id: "luz", email: "luz@este.mx", onboarded: false, arrived: false, role: "empresario" as const, cancelled: false },
    { id: "ivo", email: "ivo@oeste.mx", onboarded: true, arrived: false, role: "empresario" as const, cancelled: true },
  ];
  expect(broadcastAudience("briefing", rows).map((person) => person.id)).toEqual(["ana"]);
});
```

Actualiza los tres casos viejos con `role: "empresario"` y `cancelled: false` para que sigan compilando.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/mail/broadcast-audience.test.ts`
Expected: FAIL because `briefing` is not a `BroadcastKind`.

- [ ] **Step 3: Filter and load**

`BroadcastKind` incluye `"briefing"`. `isBroadcastKind` también.

```ts
if (kind === "briefing") {
  return person.onboarded && person.role === "empresario" && !person.cancelled;
}
```

`loadPeople` selecciona `id, email, onboarded_at, role` y lee `attendance_cancellations (profile_id)`. `cancelled` es verdadero si el `profile_id` está en ese conjunto.

`sendBroadcast` no pide sesión cuando el kind es `briefing`.

En `broadcast-forms.tsx`, un formulario más, visible cuando `mass` es verdadero, sin `SessionPick`:

```tsx
<form action={action} method="post">
  <input type="hidden" name="kind" value="briefing" />
  <SheetSubmit pendingLabel="Enviando…">Enviar nos vemos mañana</SheetSubmit>
</form>
```

`src/lib/admin/bandeja/list.ts` agrega `"briefing"` al arreglo `kinds`.

- [ ] **Step 4: Run the tests**

Run: `npx vitest run src/lib/mail/broadcast-audience.test.ts src/lib/outbox-message.test.ts src/lib/mail/paint-mail.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/mail/broadcast-audience.ts src/lib/mail/broadcast-audience.test.ts src/lib/mail/broadcast-queue.ts src/lib/mail/send-broadcast.ts src/lib/admin/bandeja/list.ts src/app/admin/correo/broadcast-forms.tsx
git commit -m "feat: send tomorrow's briefing to registered companies"
```

---

## Verificación antes de mandarlo a la sala

- El botón «Enviar nos vemos mañana» encola una fila `briefing` por empresario en el perfil y manda solo esas. Un director no recibe nada.
- El HTML trae la contraseña de `temporaryPassword()`, el botón del pase hacia `/login?next=/onboarding` y el del formulario hacia `/login?next=/metodologia`.
- Entrar desde el primer botón abre `/onboarding` con el QR si el lugar está confirmado, y el formulario de logo si todavía no hay logo.
- Entrar desde el segundo abre `/metodologia`.
- Quien canceló no está en la audiencia.
- No se manda desde este plan. El primer envío real es una sola dirección de prueba, igual que el de innovación abierta.

## Fuera de este plan

- Cambiar la contraseña de las cuentas que ya eligieron la suya.
- Adjuntar el QR en este correo. El pase se ve al entrar.
- Calcular el nivel del formulario.
- Mandarlo a los 8 registros públicos que todavía no tienen cuenta.
