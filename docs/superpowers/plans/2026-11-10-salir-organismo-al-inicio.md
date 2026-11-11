# Salir del organismo al inicio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Al pulsar Salir en el sidebar de un organismo, la sesión se cierra y la persona llega a `/`, el inicio público.

**Architecture:** Hoy `AppSidebarUser` usa `logoutAdminAction`, que siempre hace `redirect("/admin/login")`. Ese componente lo pintan el panel del organismo y el del superadmin. El organismo recibe una puerta distinta, `home`, con una acción nueva que borra la sesión y la cookie `org-slug` y redirige a `/`. El superadmin sigue en `logoutAdminAction`. El empresario no se toca: su «Cerrar sesión» sigue yendo a `/login?aviso=sesion`.

**Tech Stack:** Next.js 16, server actions, Vitest. Cada archivo `.ts` o `.tsx` que se toque queda en 90 líneas o menos. Avisos de interfaz con shadcn; este cambio no muestra un diálogo.

---

## Lo que pasa hoy

`OrgShell` y `AdminShell` pintan el mismo `AppSidebar`. El pie es `AppSidebarUser`, y su formulario llama a `logoutAdminAction`:

```86:89:src/lib/admin-actions.ts
export async function logoutAdminAction() {
  if (usesSupabaseAuth()) await clearSupabaseSession();
  await clearAccountId();
  redirect("/admin/login");
}
```

Un director, capturista o invitador que sale ve el login del superadmin. Esa puerta solo acepta superadmin, así que el reintento dice credenciales o rol incorrectos. `src/components/admin/sidebar.tsx` también usa `logoutAdminAction`, pero ninguna pantalla lo monta. Se deja quieto.

`logoutAction` en `src/lib/auth/logout-action.ts` ya borra `org-slug` y manda a `/login?aviso=sesion`. Es el cierre del empresario en metodología y onboarding. No se reutiliza: el organismo tiene que caer en `/`, no en el formulario de entrar.

Si la cookie `org-slug` sobrevive, `SiteFrame` sigue tratando `/{slug}` como panel. Hay que borrarla en el mismo cierre, antes del `redirect`.

---

### Task 1: Destino según la puerta

**Files:**
- Create: `src/lib/auth/logout-door.ts`
- Test: `src/lib/auth/logout-door.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { logoutDestination } from "./logout-door";

describe("logoutDestination", () => {
  it("manda al organismo al inicio", () => {
    expect(logoutDestination("home")).toBe("/");
  });

  it("deja al superadmin en su puerta", () => {
    expect(logoutDestination("admin")).toBe("/admin/login");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/auth/logout-door.test.ts`

Expected: FAIL. `logoutDestination` no existe.

- [ ] **Step 3: Write minimal implementation**

```ts
export type LogoutDoor = "home" | "admin";

export function logoutDestination(door: LogoutDoor) {
  return door === "home" ? "/" : "/admin/login";
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/auth/logout-door.test.ts`

Expected: PASS. 2 tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/auth/logout-door.ts src/lib/auth/logout-door.test.ts
git commit -m "feat: choose home or admin after signing out"
```

---

### Task 2: Cerrar la sesión del organismo en el inicio

**Files:**
- Create: `src/lib/auth/logout-home.ts`
- Test: `src/lib/auth/logout-home.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("logoutHomeAction", () => {
  it("borra la sesión y la marca del organismo antes de ir al inicio", () => {
    const source = readFileSync("src/lib/auth/logout-home.ts", "utf8");
    const clear = source.indexOf("clearSupabaseSession");
    const slug = source.indexOf('jar.delete("org-slug")');
    const exit = source.indexOf('redirect(logoutDestination("home"))');
    expect(source).toContain('"use server"');
    expect(source).toContain("clearAccountId");
    expect(clear).toBeGreaterThan(-1);
    expect(slug).toBeGreaterThan(clear);
    expect(exit).toBeGreaterThan(slug);
    expect(source).not.toContain("/admin/login");
    expect(source).not.toContain("/login?aviso=sesion");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/auth/logout-home.test.ts`

Expected: FAIL. El archivo no existe.

- [ ] **Step 3: Write minimal implementation**

```ts
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { clearAccountId } from "@/lib/session";
import { clearSupabaseSession, usesSupabaseAuth } from "@/lib/supabase/auth-session";
import { logoutDestination } from "./logout-door";

export async function logoutHomeAction() {
  if (usesSupabaseAuth()) await clearSupabaseSession();
  await clearAccountId();
  const jar = await cookies();
  jar.delete("org-slug");
  redirect(logoutDestination("home"));
}
```

El `redirect` va al final. En Next lanza, y una cookie escrita después no se guarda.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/auth/logout-home.test.ts src/lib/auth/logout-door.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/auth/logout-home.ts src/lib/auth/logout-home.test.ts
git commit -m "feat: send an organization sign-out back to the public home"
```

---

### Task 3: El sidebar del organismo usa esa puerta

`src/components/app-sidebar-user.tsx` ya tiene 90 líneas. El formulario de Salir sale a un archivo nuevo antes de agregar la prop. `AppSidebar` recibe la puerta y el default sigue siendo `admin`, así `AdminShell` no cambia.

**Files:**
- Create: `src/components/app-sidebar-logout.tsx`
- Modify: `src/components/app-sidebar-user.tsx`
- Modify: `src/components/app-sidebar.tsx`
- Modify: `src/components/organismo/shell.tsx`
- Test: `src/components/app-sidebar-logout.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Salir del sidebar", () => {
  it("el organismo pide la puerta de inicio", () => {
    const shell = readFileSync("src/components/organismo/shell.tsx", "utf8");
    expect(shell).toContain('logout="home"');
  });

  it("el superadmin no pide esa puerta", () => {
    const shell = readFileSync("src/components/admin/shell.tsx", "utf8");
    expect(shell).not.toContain('logout="home"');
    expect(shell).not.toContain("logoutHomeAction");
  });

  it("el botón elige la acción según la puerta", () => {
    const source = readFileSync("src/components/app-sidebar-logout.tsx", "utf8");
    expect(source).toContain('door === "home" ? logoutHomeAction : logoutAdminAction');
    expect(source).toContain("Salir");
  });

  it("el sidebar del organismo conserva el cierre del superadmin", () => {
    const admin = readFileSync("src/lib/admin-actions.ts", "utf8");
    expect(admin).toContain('redirect("/admin/login")');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/app-sidebar-logout.test.ts`

Expected: FAIL. `organismo/shell.tsx` no contiene `logout="home"` y falta `app-sidebar-logout.tsx`.

- [ ] **Step 3: Write the logout button**

`src/components/app-sidebar-logout.tsx`:

```tsx
"use client";

import { LogOut } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { logoutAdminAction } from "@/lib/admin-actions";
import type { LogoutDoor } from "@/lib/auth/logout-door";
import { logoutHomeAction } from "@/lib/auth/logout-home";

export function AppSidebarLogout({ door }: { door: LogoutDoor }) {
  const action = door === "home" ? logoutHomeAction : logoutAdminAction;
  return (
    <form action={action}>
      <DropdownMenuItem asChild>
        <button type="submit" className="w-full">
          <LogOut />
          Salir
        </button>
      </DropdownMenuItem>
    </form>
  );
}
```

En `src/components/app-sidebar-user.tsx`, quita el import de `logoutAdminAction` y de `LogOut`. Agrega:

```tsx
import { AppSidebarLogout } from "@/components/app-sidebar-logout";
import type { LogoutDoor } from "@/lib/auth/logout-door";
```

La firma queda:

```tsx
export function AppSidebarUser({
  email,
  title,
  door = "admin",
}: {
  email: string;
  title: string;
  door?: LogoutDoor;
}) {
```

Pasa `door` a `UserMenu`. Dentro de `UserMenu`, reemplaza el `<form action={logoutAdminAction}>...</form>` por:

```tsx
<AppSidebarLogout door={door} />
```

`UserMenu` también recibe `door: LogoutDoor`.

En `src/components/app-sidebar.tsx`, agrega la prop y pásala al pie:

```tsx
logout = "admin",
}: {
  email: string;
  groups: { name: string; links: AdminLink[] }[];
  title?: string;
  subtitle?: string;
  logoSrc?: string;
  brandColor?: string;
  logout?: "home" | "admin";
}) {
```

```tsx
<AppSidebarUser email={email || "Sin sesión"} title={subtitle} door={logout} />
```

El import del tipo puede ser `import type { LogoutDoor } from "@/lib/auth/logout-door"` y la prop `logout?: LogoutDoor` si cabe en las 90 líneas. Si el tipo inline ya deja el archivo en 90 o menos, no hace falta el import.

En `src/components/organismo/shell.tsx`, en el `AppSidebar`:

```tsx
logout="home"
```

No edites `src/components/admin/shell.tsx` ni `logoutAdminAction`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/app-sidebar-logout.test.ts src/lib/auth/logout-home.test.ts src/lib/auth/logout-door.test.ts`

Expected: PASS.

Cuenta las líneas de `app-sidebar-user.tsx`, `app-sidebar.tsx`, `app-sidebar-logout.tsx`, `organismo/shell.tsx` y `logout-home.ts`. Cada uno tiene que quedar en 90 o menos. Si alguno se pasa, parte el menú de usuario antes de seguir.

- [ ] **Step 5: Commit**

```bash
git add src/components/app-sidebar-logout.tsx src/components/app-sidebar-logout.test.ts src/components/app-sidebar-user.tsx src/components/app-sidebar.tsx src/components/organismo/shell.tsx
git commit -m "fix: return organization staff to the public home when they sign out"
```

---

### Task 4: Probar el cierre en el navegador

- [ ] **Step 1: Entrar como organismo**

Con el dev server que ya corre en `http://127.0.0.1:3000`, abre `/login`. Entra con `gcamacho@africamsafari.com` y la contraseña de organismo. La ruta tiene que ser `/cnet-puebla`.

- [ ] **Step 2: Salir desde el sidebar**

Abre el menú del correo, abajo a la izquierda, y pulsa Salir. La ruta final es `/`. El header público se ve, con Reservar mi lugar y Entrar. La ruta no es `/admin/login` ni `/login`.

- [ ] **Step 3: Confirmar que la sesión murió**

Recarga `/`. Sigues en el inicio. Abre `/cnet-puebla`: no debe pintar el panel con la sesión de gcamacho; manda a entrar.

No hay commit en este paso.
