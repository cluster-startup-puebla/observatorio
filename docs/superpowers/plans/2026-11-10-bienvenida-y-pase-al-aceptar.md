# Bienvenida y pase al aceptar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** El correo de la cuenta nueva dice que la cuenta ya fue creada y lleva a iniciar sesión. Al terminar el perfil la persona sigue en espera. Al aceptar, sale el correo del pase con el QR.

**Architecture:** El botón de la bienvenida apunta a `/login`. `pathAfterSignIn` ya manda al onboarding si el perfil no está terminado o si la invitación sigue pendiente. No se acepta sola al terminar el perfil. El pase por correo sale de `enqueue_accepted_pass`, que está en el repo y no en la base. El asunto de la bienvenida también está fijo en `enqueue_own_mail`, así que hace falta otra migración. El archivo del pase en `passes` no se crea en este plan: el QR viaja en el correo y, si la persona vuelve al onboarding ya aceptada, `issueConfirmedPass` lo guarda.

**Tech Stack:** Next.js 16, React Email, Vitest, migración SQL en Supabase.

---

Los comandos se corren desde `/Users/alvarocastillo/dev/levantamiento`.

## No se toca

- `attribute_link_signup` sigue insertando el evento `cargar`. Terminar el perfil no acepta.
- `issueConfirmedPass` sigue sin crear el pase mientras `linkPassPending` o `externalPassPending` sean ciertos.
- `src/lib/auth/home.ts`. El empresario sin perfil, o con perfil y en espera, ya cae en `/onboarding`.
- El correo `event_pass` y su asunto «Tu pase para la sesión ya está listo».

## Mapa de archivos

- Modify: `src/lib/mail/continue-href.ts` — el botón va a `/login`.
- Modify: `src/lib/mail/welcome-mail.tsx` — título y cuerpo de cuenta creada.
- Modify: `src/lib/outbox-message.ts` — asunto de bandeja.
- Modify: `src/lib/mail/welcome-mail.test.tsx`, `src/lib/mail/paint-mail.test.ts`, `src/lib/mail/send-own.test.ts`, `src/lib/outbox-message.test.ts`.
- Create: `supabase/migrations/20261110200000_welcome_account_subject.sql` — reemplaza el asunto de `enqueue_own_mail`.
- Create: `src/lib/mail/welcome-subject.test.ts` — el asunto nuevo está en la migración nueva y el perfil sigue en espera.
- Apply: `supabase/migrations/20261109143000_accepted_pass_mail.sql` y la migración nueva. La del 9 de noviembre no está en la base. La última aplicada es `20261105224609`.

### Task 1: El correo pide iniciar sesión

**Files:**
- Modify: `src/lib/mail/continue-href.ts`
- Modify: `src/lib/mail/welcome-mail.tsx`
- Modify: `src/lib/outbox-message.ts`
- Test: `src/lib/mail/welcome-mail.test.tsx`
- Test: `src/lib/mail/paint-mail.test.ts`
- Test: `src/lib/mail/send-own.test.ts`
- Test: `src/lib/outbox-message.test.ts`

- [ ] **Step 1: Write the failing test**

En `src/lib/mail/send-own.test.ts`, la expectativa de `continueHref` pasa a:

```ts
expect(continueHref("https://observatorio.example")).toBe("https://observatorio.example/login");
```

En `src/lib/mail/welcome-mail.test.tsx`, el primer test queda así:

```ts
it("avisa que la cuenta existe y manda a iniciar sesión", async () => {
  const html = await render(<WelcomeMail continueHref="https://observatorio.example/login" />);
  expect(html).toContain("Tu cuenta ya fue creada");
  expect(html).toContain("terminar el perfil de tu empresa");
  expect(html).toContain("https://observatorio.example/login");
  expect(html).toContain("Iniciar sesión");
  expect(html).not.toContain("Tu lugar ya está apartado");
  expect(html).not.toContain("Ahí queda tu pase");
  expect(html).not.toContain("cid:pase");
});
```

El segundo test espera «Inicia sesión para terminar tu perfil.» en lugar de «Vuelve al registro e inicia sesión.»

En `src/lib/mail/paint-mail.test.ts`, la línea del título pasa a `Tu cuenta ya fue creada`.

En `src/lib/outbox-message.test.ts`, el asunto de `welcome` pasa a `Tu cuenta en el Observatorio ya fue creada`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/mail/welcome-mail.test.tsx src/lib/mail/paint-mail.test.ts src/lib/mail/send-own.test.ts src/lib/outbox-message.test.ts`

Expected: FAIL. El HTML y el asunto siguen diciendo que el lugar está apartado, y el botón sigue en `/onboarding`.

- [ ] **Step 3: Write minimal implementation**

`continue-href.ts` devuelve `${base}/login`.

`outbox-message.ts`: `welcome` queda `"Tu cuenta en el Observatorio ya fue creada"`.

`welcome-mail.tsx`:

```tsx
export function WelcomeMail({ continueHref }: { continueHref: string | null }) {
  return (
    <MailShell preview="Tu cuenta ya fue creada. Termina tu perfil." title="Tu cuenta ya fue creada">
      <Text style={{ margin: "0 0 16px", color: mailBrand.navy, fontSize: 16, lineHeight: "1.5" }}>
        Creamos tu cuenta en el Observatorio. Inicia sesión y termina el perfil de tu empresa. Ahí quedas en espera de
        que tu organismo te acepte.
      </Text>
      <FactRows />
      {continueHref ? (
        <Button
          href={continueHref}
          style={{
            display: "inline-block",
            marginTop: 8,
            backgroundColor: mailBrand.pink,
            color: mailBrand.white,
            padding: "12px 20px",
            borderRadius: 999,
            fontWeight: 700,
          }}
        >
          Iniciar sesión
        </Button>
      ) : (
        <Text style={{ margin: "16px 0 0", color: mailBrand.navy, fontSize: 16 }}>
          Inicia sesión para terminar tu perfil.
        </Text>
      )}
    </MailShell>
  );
}
```

`FactRows` no cambia.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/mail/welcome-mail.test.tsx src/lib/mail/paint-mail.test.ts src/lib/mail/send-own.test.ts src/lib/outbox-message.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/mail/continue-href.ts src/lib/mail/welcome-mail.tsx src/lib/outbox-message.ts src/lib/mail/welcome-mail.test.tsx src/lib/mail/paint-mail.test.ts src/lib/mail/send-own.test.ts src/lib/outbox-message.test.ts
git commit -m "feat: welcome a new account and send it to sign in"
```

### Task 2: El asunto de la base coincide

**Files:**
- Create: `supabase/migrations/20261110200000_welcome_account_subject.sql`
- Create: `src/lib/mail/welcome-subject.test.ts`

No edites `supabase/migrations/20261103233000_own_mail.sql`. Esa migración ya corrió. El reemplazo va en un archivo nuevo.

- [ ] **Step 1: Write the failing test**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("asunto de la cuenta creada", () => {
  const sql = readFileSync("supabase/migrations/20261110200000_welcome_account_subject.sql", "utf8");

  it("reemplaza el asunto de la bienvenida y deja el pase igual", () => {
    expect(sql).toContain("create or replace function public.enqueue_own_mail(mail_kind public.mail_kind)");
    expect(sql).toContain("Tu cuenta en el Observatorio ya fue creada");
    expect(sql).toContain("Tu pase para la sesión ya está listo");
    expect(sql).not.toContain("Tu lugar en el Observatorio ya está apartado");
  });

  it("terminar el perfil sigue dejando la invitación en espera", () => {
    const signup = readFileSync("supabase/migrations/20261023190000_link_signup_pending.sql", "utf8");
    const issue = readFileSync("src/lib/onboarding/issue-confirmed-pass.ts", "utf8");
    expect(signup).toContain("'cargar'");
    expect(issue.indexOf("if (pendingLink || pendingExternal) return")).toBeLessThan(issue.indexOf("storePass"));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/mail/welcome-subject.test.ts`

Expected: FAIL. El archivo de migración no existe.

- [ ] **Step 3: Write minimal implementation**

Copia `enqueue_own_mail` de `20261103233000_own_mail.sql` al archivo nuevo, con un solo cambio en el `case`:

```sql
own_subject := case mail_kind
  when 'welcome' then 'Tu cuenta en el Observatorio ya fue creada'
  else 'Tu pase para la sesión ya está listo'
end;
```

El resto de la función, `search_path`, los `grant` y `record_own_mail` no se repiten. Solo `create or replace function public.enqueue_own_mail`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/mail/welcome-subject.test.ts src/lib/mail/own-mail.test.ts`

Expected: PASS. El test viejo sigue leyendo la migración del 3 de noviembre.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20261110200000_welcome_account_subject.sql src/lib/mail/welcome-subject.test.ts
git commit -m "feat: store the new account subject in the mail queue"
```

### Task 3: Aplicar las dos migraciones

**Files:**
- Apply: `supabase/migrations/20261110200000_welcome_account_subject.sql`
- Apply: `supabase/migrations/20261109143000_accepted_pass_mail.sql`

No cambies el SQL del 9 de noviembre. Ya crea `enqueue_accepted_pass` y `record_accepted_pass`. `sendAcceptedPass` ya se llama después de `approve_link_signup` en el CRM del organismo y en el del superadmin.

- [ ] **Step 1: Confirmar que faltan**

En el proyecto `jnshenkmexsxiylpqhdh`, `enqueue_accepted_pass` no existe. La última migración aplicada es `20261105224609`.

- [ ] **Step 2: Aplicarlas en orden**

Primero `20261109143000_accepted_pass_mail.sql`. Después `20261110200000_welcome_account_subject.sql`.

- [ ] **Step 3: Verificar las funciones**

```sql
select p.proname
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in ('enqueue_accepted_pass', 'record_accepted_pass', 'enqueue_own_mail');
```

Expected: las tres filas. `pg_get_functiondef` de `enqueue_own_mail` contiene `Tu cuenta en el Observatorio ya fue creada` y no contiene `Tu lugar en el Observatorio ya está apartado`.

- [ ] **Step 4: No reenviar a Yamil en esta tarea**

Las dos cuentas CSI ya están en Registrado. Aplicar la función no les manda el pase solo. Un aceptado viejo no se reencola hasta que alguien vuelva a llamar `sendAcceptedPass`.

### Task 4: Probar el recorrido

- [ ] **Step 1: Cuenta nueva**

Crear una cuenta de empresario con un correo de prueba. El correo que llega tiene el asunto «Tu cuenta en el Observatorio ya fue creada», el botón dice «Iniciar sesión» y abre `/login`. No menciona que el pase ya quedó.

- [ ] **Step 2: Después de entrar**

Sin perfil terminado, el login deja en `/onboarding`. Al terminar el perfil, el CRM queda en Cargado y la pantalla dice «Tu pase te llegará por correo». No hay fila en `passes` ni correo `event_pass`.

- [ ] **Step 3: Al aceptar**

En el CRM del organismo, Aceptar. Aparece un `outbox_messages` con `kind = event_pass`, asunto «Tu pase para la sesión ya está listo», y `sent_at` lleno si `MAIL_FROM` sigue en formato `correo@dominio` o `Nombre <correo@dominio>`. El de Gmail de Yamil falló por un remitente mal formado. El de Radek, al día siguiente, sí salió. El pase usa el mismo remitente.
