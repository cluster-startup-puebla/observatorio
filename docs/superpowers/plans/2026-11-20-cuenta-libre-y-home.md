# Cuenta libre y la app del empresario

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** El empresario crea su cuenta sin que lo acepten a una sesión, termina el onboarding con sitio web y entra a una app en `/app`. Ahí ve su inicio, sesiones, retos, empresa y perfil.

**Architecture:** La aceptación deja de decidir si puede entrar. `pathAfterSignIn` manda al empresario con onboarding terminado a `/app/home`. Las cinco pantallas comparten un shell. De `md` para arriba el menú es el sidebar que ya usa el organismo. En el teléfono no hay sidebar ni botón de menú: hay una pastilla flotante, separada del borde, porque en iPhone la barra de la URL vive abajo. El estilo de las tarjetas es el de la pantalla de anonimato de `/metodologia` (`Disclaimer`): fondo `bg-surface-subtle`, tarjeta `rounded-[2rem] border border-line bg-elevated` con la sombra de esa pantalla. `/metodologia` sigue siendo la evaluación y se abre desde un banner. No se construye el sistema de puntos ni el feed ni el borrado de cuenta: se dejan visibles y marcados.

**Tech Stack:** Next.js App Router, sidebar de shadcn, Supabase, migración SQL, Vitest. Cada archivo `.ts` / `.tsx` nuevo se queda en 90 líneas o menos.

---

## Rutas

El prefijo es `/app` porque `/sesiones` ya es el calendario público.

| Pantalla | Ruta | Menú |
| --- | --- | --- |
| Inicio | `/app/home` | Inicio |
| Sesiones | `/app/sesiones` y `/app/sesiones/[slug]` | Sesiones |
| Retos | `/app/challenges` | Retos |
| Empresa | `/app/company` | Empresa |
| Perfil | `/app/profile` | Perfil |

Las etiquetas del menú van en español. Los segmentos quedan como se pidieron. `/app` redirige a `/app/home`.

## Menú

De `md` para arriba, sidebar a la izquierda, igual que el del organismo. Abajo, cerrar sesión.

En el teléfono (`max-md`) el sidebar no se monta y no hay `SidebarTrigger`. El menú es una pastilla flotante, centrada, con las cinco rutas en icono. La ruta activa se abre y muestra su nombre, como la cápsula «Home» de la referencia. El resto se queda en icono. Fondo `bg-ink`, iconos claros, la activa en una ficha clara. No es una barra pegada al borde de la pantalla.

La pastilla va fija con `bottom: calc(env(safe-area-inset-bottom) + 1rem)`, para quedar por encima del indicador de inicio y de la barra de URL de Safari. El contenido del teléfono lleva `pb-28` para que la última tarjeta no quede debajo. Cerrar sesión no entra en la pastilla: sigue en Perfil.

## Qué no cambia

- Aceptar a alguien en una sesión sigue creando el pase. Eso no abre la cuenta.
- Director, capturista e invitador siguen en su organismo. Superadmin y moderador siguen en el panel.
- Quien no ha terminado el onboarding sigue en `/onboarding`.
- El logo sigue siendo opcional en el alta. El sitio web es obligatorio solo para quien termina el onboarding a partir de este cambio.
- Quien ya tiene `onboarded_at` no repite el formulario. Completa logo y sitio en el banner de inicio.
- `/metodologia` no se mete dentro del shell. El banner la abre tal como está, con su aviso de anonimato.

## Decisiones cerradas

- El saludo usa la hora de `America/Mexico_City`. 0–11 `buenos días`, 12–18 `buenas tardes`, 19–23 `buenas noches`. El nombre es la primera palabra de `profiles.full_name`.
- Lavas vive en el header del shell, en todas las pantallas. Muestra `0 lavas`. El tooltip dice: «Entre más lavas juntas, más cerca estás de ser una empresa de innovación abierta.» No hay tabla de puntos.
- «Unirme a la sesión» abre `/app/sesiones/[slug]` y ahí se queda. El detalle muestra fecha, sede y título. Si ya tiene lugar, muestra ese estado. No inscribe ni deja solicitud. La aceptación y el pase siguen en el admin.
- Noticias, en este alcance, es una tarjeta «Próximamente». No lee el blog ni crea una tabla.
- El checklist de empresa solo lista lo que sí aplica hoy: logo, sitio web, primera evaluación, sesión de su sector.

## Inicio, de arriba hacia abajo

1. El shell ya trae el menú (sidebar o pastilla, según el ancho) y, en el header, `0 lavas` con el tooltip.
2. `Hola {nombre}, {saludo}`.
3. Banner «Completa tu perfil». Lista fija: logo, sitio web. El número es `pendientes/total`. Sin logo y sin sitio: `2/2`. Con logo: `1/2` y solo sitio. Con los dos: el banner no se muestra. Un dato nuevo se suma a la lista y el total crece.
4. Si hay una sesión próxima con fila en `session_sector_quotas` para el `sector_id` de su empresa, banner «Unirme a la sesión». Si hay varias, la de `session_on` más cercana. Lleva al detalle.
5. Si su sector tiene paquete de metodología y no tiene una fila `methodology_v2_runs` con fase terminada y `score`, banner «Realiza tu primera evaluación». Lleva a `/metodologia`.
6. Noticias: una tarjeta con el mismo estilo del aviso de anonimato y la etiqueta «Próximamente».

## Las otras pantallas

**Sesiones.** Dos listas: próximas (`session_on` de hoy en adelante) y pasadas. Cada fila usa la fecha en calendario que ya tiene el sitio público y abre el detalle.

**Retos.** Una sola tarjeta, centrada, al estilo del aviso de anonimato. Título «Retos». Texto: aquí se podrán lanzar retos públicos, anónimos o privados. Etiqueta «Próximamente». Sin formulario.

**Empresa.** Los datos que ya guarda `companies`: nombre, sector, tamaño, sitio, municipio, mercado, cómo llegó, interés de sesión y logo. Si hay un run terminado, la última calificación: banda y `score.ismsNivel2`. Debajo, el bloque que ya existe en `src/components/methodology/v2/sector-rank.tsx` («Tu lugar en el sector»); en este alcance se reutiliza como está, porque todavía no hay un lugar calculado contra el sector. Abajo, el checklist con las piezas que falten.

**Perfil.** Solo lectura: nombre, puesto, WhatsApp y correo. Botón «Cerrar sesión», el mismo cierre que ya usa el sidebar. Botón «Borrar cuenta» con la etiqueta «Próximamente». Abre `AlertDialog`. El diálogo dice que todavía no se puede borrar y no llama a ningún borrado. El botón de confirmar no se muestra.

## Task 1: El empresario entra a `/app/home`

**Files:**
- Modify: `src/lib/auth/home.ts`
- Test: `src/lib/auth/home.test.ts`

- [x] `homes.empresario` pasa de `/metodologia` a `/app/home`.
- [x] En `pathAfterSignIn`, el empresario sin `onboarded` sigue en `/onboarding`.
- [x] Quitar las ramas de `awaitingApproval` y `eventOpen === false`. Esas señales ya no bloquean la entrada.
- [x] El test espera `/app/home` con onboarding terminado, haya o no aprobación y con el evento cerrado. Sin onboarding, `/onboarding`.
- [x] Run: `npx vitest run src/lib/auth/home.test.ts`

## Task 2: Shell, menú y rutas vacías

**Files:**
- Create: `src/lib/app/nav.ts`
- Create: `src/components/app/empresario-shell.tsx`
- Create: `src/components/app/mobile-nav.tsx`
- Create: `src/components/app/app-card.tsx`
- Create: `src/app/app/layout.tsx`
- Create: `src/app/app/page.tsx`
- Create: `src/app/app/home/page.tsx`
- Create: `src/app/app/sesiones/page.tsx`
- Create: `src/app/app/sesiones/[slug]/page.tsx`
- Create: `src/app/app/challenges/page.tsx`
- Create: `src/app/app/company/page.tsx`
- Create: `src/app/app/profile/page.tsx`
- Modify: `src/lib/site/public-paths.ts`
- Test: `src/lib/site/crawl.test.ts` y `src/lib/auth/redirect-if-session.test.ts` si afirman `/metodologia` para el empresario

- [x] `empresarioNav` devuelve Inicio `/app/home`, Sesiones `/app/sesiones`, Retos `/app/challenges`, Empresa `/app/company`, Perfil `/app/profile`, cada uno con un icono de `lucide-react` (casa, calendario, bandera, edificio, persona).
- [x] `EmpresarioShell` usa el sidebar solo desde `md`. En el footer, el cierre de sesión que ya existe. No renderiza `SidebarTrigger`. El header deja un hueco a la derecha para las lavas. El área que hace scroll lleva `pb-28 md:pb-6`.
- [x] `MobileNav` es `fixed` y centrada, `z-30`, con `md:hidden` para que solo exista en el teléfono. Clases: `bottom-[calc(env(safe-area-inset-bottom)+1rem)]`, cápsula `rounded-full bg-ink p-1.5 shadow`. Cada ruta es un enlace con icono y `aria-label`. La activa (`usePathname`; el detalle de una sesión cuenta como Sesiones) agrega el texto del nombre en una ficha clara. Las inactivas solo muestran el icono.
- [x] `AppCard` copia las clases de la tarjeta de `src/components/methodology/v2/disclaimer.tsx`: `rounded-[2rem] border border-line bg-elevated px-6 py-8 shadow-[0_16px_40px_-12px_rgb(22_40_79/0.18)]`.
- [x] El layout de `/app` lee la cuenta. Sin sesión, `/login`. Empresario sin `onboarded_at`, `/onboarding`. Otro rol, `homeForRole`. El fondo del inset es `bg-surface-subtle`.
- [x] `/app` redirige a `/app/home`. Las cinco páginas renderizan el título y nada más, para que el menú navegue.
- [x] Agregar `/app` a `privatePaths`.
- [x] Run: `npx vitest run src/lib/auth/home.test.ts src/lib/site/crawl.test.ts src/lib/auth/redirect-if-session.test.ts`

## Task 3: Saludo y lavas

**Files:**
- Create: `src/lib/app/greeting.ts`
- Create: `src/lib/app/greeting.test.ts`
- Create: `src/lib/app/lavas.ts`
- Create: `src/components/app/lavas-chip.tsx`
- Create: `src/components/app/home-greeting.tsx`
- Modify: `src/components/app/empresario-shell.tsx`
- Modify: `src/app/app/home/page.tsx`

- [x] Test de `dayPart`: hora 8 → `buenos días`, 12 → `buenas tardes`, 18 → `buenas tardes`, 19 → `buenas noches`, 0 → `buenos días`.
- [x] `mexicoHour(date)` saca la hora con `timeZone: "America/Mexico_City"`. `firstName("Ana López")` devuelve `Ana`. Vacío devuelve vacío.
- [x] `LAVAS_TOOLTIP` es exactamente `Entre más lavas juntas, más cerca estás de ser una empresa de innovación abierta.`
- [x] `LavasChip` muestra `0 lavas` y el tooltip de shadcn con ese texto. Va en el header del shell.
- [x] El inicio pinta `Hola {nombre}, {saludo}`. Sin nombre, solo el saludo.
- [x] Run: `npx vitest run src/lib/app/greeting.test.ts`

## Task 4: Columna `companies.website`

**Files:**
- Create: `supabase/migrations/20261120010000_company_website.sql`

- [x] `alter table public.companies add column website text;`
- [x] Check: nulo, o texto de 4 a 200 caracteres que parezca un dominio (`ejemplo.com` o `https://ejemplo.com`). Sin espacios.
- [x] Las filas actuales quedan en nulo.
- [x] Aplicar la migración al remoto solo al ejecutar este plan.

## Task 5: El onboarding pide el sitio web

**Files:**
- Modify: `src/lib/onboarding/empresario-draft.ts`
- Modify: `src/lib/onboarding/save-empresario.ts`
- Modify: `src/components/onboarding/empresario-step-company.tsx`
- Test: el del draft, junto a `empresario-draft`

- [x] `EmpresarioProfile` gana `website: string`.
- [x] `empresarioErrors` rechaza vacío, espacios y más de 200. Acepta `ejemplo.com` y `https://ejemplo.com`.
- [x] `saveEmpresarioProfile` escribe `website` en el upsert de `companies`.
- [x] El campo visible dice «Sitio web» y va en el paso de la empresa.
- [x] Run: `npx vitest run src/lib/onboarding`

## Task 6: Banner de completa tu perfil

**Files:**
- Create: `src/lib/home/profile-gaps.ts`
- Create: `src/lib/home/profile-gaps.test.ts`
- Create: `src/lib/home/load-profile-gaps.ts`
- Create: `src/components/app/profile-gap-banner.tsx`
- Modify: `src/app/app/home/page.tsx`

- [x] `profileGaps({ hasLogo, website })` devuelve solo lo que falta, en orden: logo, sitio web.
- [x] El texto es `${gaps.length}/${total}` con `total` igual al tamaño de la lista.
- [x] Test: sin nada → `2/2` y las dos piezas. Con logo → `1/2` y solo sitio. Con los dos → lista vacía.
- [x] `loadProfileGaps` lee `companies.website` y si existe `media_assets` con `purpose = company_logo`.
- [x] El banner usa `AppCard`. Guardar logo reutiliza `save-company-logo`. Guardar sitio usa la misma validación del onboarding.
- [x] Lista vacía: el inicio no pinta el banner.
- [x] Run: `npx vitest run src/lib/home/profile-gaps.test.ts`

## Task 7: Sesión de su sector

**Files:**
- Create: `src/lib/app/sector-sessions.ts`
- Create: `src/lib/app/sector-sessions.test.ts`
- Create: `src/lib/app/load-sector-sessions.ts`
- Create: `src/components/app/session-banner.tsx`
- Create: `src/components/app/session-groups.tsx`
- Modify: `src/app/app/home/page.tsx`
- Modify: `src/app/app/sesiones/page.tsx`
- Modify: `src/app/app/sesiones/[slug]/page.tsx`

- [x] `splitSessions(rows, today)` separa próximas y pasadas por `session_on`. Hoy cuenta como próxima.
- [x] `nextForSector(rows)` devuelve la próxima con `session_on` más cercano, o null.
- [x] `loadSectorSessions` lee sesiones públicas que tengan fila en `session_sector_quotas` para el `sector_id` de la empresa. El detalle solo abre un slug de esa lista. Otro slug redirige a `/app/sesiones`.
- [x] El banner del inicio dice «Unirme a la sesión» y enlaza a `/app/sesiones/{public_slug}`.
- [x] La lista muestra próximas y luego pasadas, con el calendario de `src/components/sessions/session-date.tsx`.
- [x] El detalle muestra título, fecha, sede y, si ya tiene asistencia, el estado. No hay botón que escriba una inscripción.
- [x] Run: `npx vitest run src/lib/app/sector-sessions.test.ts`

## Task 8: Banner de la primera evaluación

**Files:**
- Create: `src/lib/app/evaluation-banner.ts`
- Create: `src/lib/app/evaluation-banner.test.ts`
- Modify: `src/app/app/home/page.tsx`

- [x] `showFirstEvaluation({ sectorHasPack, finished })` es true solo cuando el sector tiene paquete y no hay run terminado con score.
- [x] El banner dice «Realiza tu primera evaluación» y enlaza a `/metodologia`.
- [x] Va debajo del banner de sesión, o debajo del de perfil si no hay sesión.
- [x] Run: `npx vitest run src/lib/app/evaluation-banner.test.ts`

## Task 9: Noticias, retos y borrar cuenta

**Files:**
- Create: `src/components/app/coming-card.tsx`
- Create: `src/components/app/delete-account.tsx`
- Modify: `src/app/app/home/page.tsx`
- Modify: `src/app/app/challenges/page.tsx`
- Modify: `src/app/app/profile/page.tsx`

- [x] `ComingCard` es `AppCard` con icono, título, una línea y la etiqueta «Próximamente».
- [x] Noticias usa esa tarjeta: título «Noticias», texto «Aquí vas a ver los avisos del Observatorio.»
- [x] Retos usa esa tarjeta, centrada en la página. Título «Retos». Texto: «Aquí podrás lanzar retos públicos, anónimos o privados.»
- [x] Perfil lista nombre, puesto, WhatsApp y correo, sin inputs. «Cerrar sesión» usa el cierre que ya existe.
- [x] «Borrar cuenta» lleva la etiqueta «Próximamente» y abre `AlertDialog`. El diálogo explica que aún no se puede. No hay acción de borrado.

## Task 10: Empresa, calificación y checklist

**Files:**
- Create: `src/lib/app/company-actions.ts`
- Create: `src/lib/app/company-actions.test.ts`
- Create: `src/lib/app/load-company-home.ts`
- Create: `src/components/app/company-screen.tsx`
- Modify: `src/app/app/company/page.tsx`

- [x] `companyActions({ gaps, showEvaluation, sessionHref })` arma, en este orden, solo lo que aplica: «Sube el logo de tu empresa», «Agrega el sitio web», «Realiza tu primera evaluación» hacia `/metodologia`, «Unirme a la sesión» hacia el detalle. Nada aplica: lista vacía.
- [x] `loadCompanyHome` lee la empresa, el sector, el logo, el run más reciente con `score` y la próxima sesión del sector.
- [x] La pantalla muestra esos datos, la banda y `ismsNivel2` si hay score, luego `SectorRank`, luego el checklist. Lista vacía: no se pinta el checklist.
- [x] Run: `npx vitest run src/lib/app/company-actions.test.ts`

## Task 11: Quien ya terminó no regresa al onboarding

**Files:**
- Modify: `src/app/onboarding/supabase-screen.tsx`

- [x] Si el empresario ya tiene `onboarded_at`, `/onboarding` redirige a `/app/home`.
- [x] Quien no tiene `onboarded_at` sigue el onboarding, ahora con sitio web obligatorio.

## Orden

1. Destino y puerta.
2. Shell y rutas, para que el menú exista.
3. Saludo y lavas.
4. Columna del sitio web.
5. Sitio web en el alta nueva.
6. Banner de perfil.
7. Sesiones.
8. Banner de evaluación.
9. Próximamente: noticias, retos, borrar cuenta, y el perfil de solo lectura.
10. Empresa.
11. Sacar de `/onboarding` a quien ya terminó.

El 5 no se publica sin el 4. No se hace commit hasta que se pida.
