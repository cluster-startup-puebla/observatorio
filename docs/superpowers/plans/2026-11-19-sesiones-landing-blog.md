# Sesiones, landing de programa y blog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** La home deja de ser el desayuno del 18 de noviembre y pasa a explicar el programa. Esa sesión vive en `/sesiones/[slug]`, el listado sale de `public.sessions`, el portal de invitación se mueve a `/sesiones/[slug]/[org]`, y el lanzamiento se publica como nota en un blog de markdown copiado del clúster.

**Architecture:** Un cimiento secuencial agrega `title` y `public_slug` a la sesión y deja tres funciones puras de ruta. Después corren cuatro subagentes en paralelo, cada uno dueño de un directorio distinto. Un cierre secuencial convierte `/{sector}` y `/{org}` en redirecciones y actualiza los enlaces internos. La nota no inventa el presídium: en `src/content/session-program.ts` el acto protocolario tiene `host: ""`.

**Tech Stack:** Next.js 16 (`export const instant = false` en páginas que leen cookies o `searchParams`), Supabase, Vitest, `gray-matter` y `marked` como en el blog del clúster. Archivos `.ts` y `.tsx` de máximo 90 líneas.

**Rama:** `develop`. Este plan y lo que salga de él se trabaja ahí. `main` se queda como está.

---

## Identidad

La portada de la presentación del 18 de noviembre es la identidad pública. Referencia: `docs/superpowers/plans/assets/foro-puebla-x-puebla-hero.png`, tomada de `2026-11-18 - Presentación - Estrategia de vinculación CSI - Yamil Álvarez.pptx`, lámina 1.

El hero se reconstruye en HTML, con el mismo arreglo. No se publica la captura.

| Token | Valor | Uso |
|---|---|---|
| Campo | `#a71c6f` | Fondo del hero y de las bandas de cierre |
| Tipo | `#ffffff` | Título, kicker y renglón del observatorio |
| X chica | `#d865aa` | Solo la «x» de «Puebla x Puebla» |
| X grande | `#ffffff` | La X de la derecha, a altura del título |
| Filete | blanco al 70% | Línea con punto a cada extremo |

Arreglo del hero, de arriba a abajo y de izquierda a derecha:

1. Marca del Clúster de Startups e Innovación, arriba a la izquierda, en blanco.
2. Kicker en versalitas: `Levantamiento de necesidades tecnológicas`.
3. Título en tres líneas: `Foro`, `Puebla`, `x Puebla`. La x va en `#d865aa`.
4. Una X blanca enorme a la derecha, alineada con el título.
5. Renglón: `Observatorio Tecnológico de Puebla`.
6. Filete horizontal con un punto al inicio y otro al final.
7. `clusterdestartups.org` en el pie del hero, pequeño.

La home, `/sesiones`, `/blog` y `/crear-cuenta` usan estos tokens. El panel `/admin` conserva el navy actual en este plan.

## Qué dice la home

Fuente: las 21 láminas de esa presentación. Entra lo que define el programa. Se queda fuera el glosario (qué es un clúster, qué es una startup, el desafío de mentalidad), los casos 3M y J&J, la lámina vacía «Presentación Roberto», el marco legal marcado `[POR CONFIRMAR]` y las fechas `26 nov 2026` y `primavera 2027`, también marcadas por confirmar. La misión del clúster al 2030 no es el título del observatorio.

| Pregunta | Texto que se publica | Lámina |
|---|---|---|
| Qué es | El Observatorio Tecnológico documenta de forma sistemática las necesidades tecnológicas del Estado para exponer oportunidades de innovación en cada área. Reúne a más de 13 sectores. La plataforma sigue viva: una empresa responde en la sesión o desde su cuenta, cada año o cuando implementa una tecnología nueva. | 11 y 13 |
| Objetivo | Incrementar la competitividad del Estado a través de la inserción de la tecnología en la industria, y acompañar a cada empresa a su siguiente nivel de competitividad. | 7 y 13 |
| Por qué | Hoy la industria local no tiene solución para sus problemas específicos, y las startups construyen ideas sin validación. Puebla x Puebla las acerca. | 10 |
| Cómo | 1. La empresa expresa la necesidad en el Observatorio. 2. Un equipo de desarrollo aporta la solución. 3. El trabajo toma una de tres formas: piloto en operación real, codesarrollo, o adopción de una tecnología ya probada. | 12, 18 y 20 |

---

Los comandos se corren desde `/Users/alvarocastillo/dev/levantamiento`. No arranques otro `next dev` si el puerto 3000 ya está ocupado. No uses `supabase db push`. La migración se aplica con el MCP `apply_migration` del proyecto `jnshenkmexsxiylpqhdh` y el mismo SQL se guarda en `supabase/migrations/`.

## Cómo se ataca

```text
Ola 0 (un agente, bloquea al resto)
  slug público + funciones de ruta

Ola 1 (cuatro agentes a la vez, sin archivos compartidos)
  A  /sesiones y /sesiones/[slug]     dueño de src/app/sesiones/page.tsx y src/app/sesiones/[slug]/page.tsx
  B  portal del organismo             dueño de src/app/sesiones/[slug]/[piece]/
  C  blog y nota                      dueño de content/blog/ y src/app/blog/
  D  home de programa y logos         dueño de src/app/page.tsx y src/components/program/

Ola 2 (un agente, cuando A y B terminaron)
  /{org} y /{sector} redirigen
  enlaces internos usan sessionPiecePath
```

Contrato que los cuatro respetan. No lo redefinas en tu frente.

```ts
export function sessionPublicSlug(sessionOn: string, title: string): string

export function sessionPath(publicSlug: string): string
// "/sesiones/18-11-26-arranque-puebla-x-puebla"

export function sessionPiecePath(publicSlug: string, piece: string): string
// "/sesiones/18-11-26-arranque-puebla-x-puebla/canacintra"
```

La primera sesión publicada queda así:

| Campo | Valor |
|---|---|
| `session_on` | `2026-11-18` (ya está) |
| `title` | `Arranque Puebla x Puebla` |
| `public_slug` | `18-11-26-arranque-puebla-x-puebla` |

El ejemplo `/sesiones/05-10-20-club-de-empresarios/canacintra` es el mismo patrón: `dd-mm-aa` más el título en slug, y el segundo segmento es el organismo. Un segmento que sea sector (`turismo`) sigue siendo la landing de ese sector dentro de la sesión. La resolución es la de hoy en `src/app/[sector]/page.tsx`: primero `ownerBySlug`, después `resolveSector`.

## Ya está en el árbol (no lo reescribas)

- `src/components/landing/**` es la sesión del 18 de noviembre. El agente A la monta en `/sesiones/[slug]`. No rediseñes esas secciones.
- `src/app/[sector]/page.tsx` hoy hace tres trabajos: portal si el slug es organismo, landing de sector si es sector, y `EventLanding` si no es ninguno. La ola 2 lo deja solo en redirección. Los agentes A, B, C y D no lo editan.
- `src/app/[sector]/crm`, `invitaciones` y `seguridad` son del organismo. Los mueve el agente B. Hasta la ola 2 siguen vivos en la ruta vieja.
- `public.companies.show_logo_on_event` y `public.company_logo_is_public` ya deciden qué logo se puede mostrar. El agente D solo lee esas filas.
- `src/content/confirmed-speakers.ts` y `src/content/session-program.ts` son la fuente de la nota. No agregues ponentes.

## Mapa de archivos

| Archivo | Frente | Responsabilidad |
|---|---|---|
| `supabase/migrations/20261119120000_session_public_slug.sql` | 0 | `title` y `public_slug` |
| `src/lib/sessions/public-path.ts` | 0 | Las tres funciones del contrato |
| `src/lib/sessions/public-path.test.ts` | 0 | Fechas, títulos y rutas |
| `src/lib/sessions/load-public.ts` | A | Lista y una sesión por slug |
| `src/app/sesiones/page.tsx` | A | Listado |
| `src/app/sesiones/[slug]/page.tsx` | A | La landing actual de esa sesión |
| `src/components/sessions/session-list.tsx` | A | Tarjetas del listado |
| `src/app/sesiones/[slug]/[piece]/page.tsx` | B | Organismo o sector |
| `src/app/sesiones/[slug]/[piece]/crm/page.tsx` | B | CRM del organismo |
| `src/app/sesiones/[slug]/[piece]/invitaciones/page.tsx` | B | Invitaciones |
| `src/app/sesiones/[slug]/[piece]/seguridad/page.tsx` | B | Seguridad |
| `src/lib/notes/markdown.ts` | C | Lee `content/blog/*.es.md` |
| `src/app/blog/page.tsx` | C | Índice |
| `src/app/blog/[slug]/page.tsx` | C | Nota |
| `content/blog/arranque-puebla-x-puebla-2026.es.md` | C | El texto de abajo, tal cual |
| `src/lib/program/public-logos.ts` | D | Logos con permiso |
| `src/components/program/program-hero.tsx` | D | La portada magenta, reconstruida |
| `src/components/program/program-home.tsx` | D | Qué es, objetivo, porqué y cómo |
| `src/app/page.tsx` | D | Deja de renderizar `EventLanding` |
| `src/app/[sector]/page.tsx` | 2 | Redirige a la sesión vigente |

---

### Task 0: Slug público y rutas puras

**Files:**
- Create: `supabase/migrations/20261119120000_session_public_slug.sql`
- Create: `src/lib/sessions/public-path.ts`
- Create: `src/lib/sessions/public-path.test.ts`

- [ ] **Step 1: Escribe el test que falla**

```ts
import { describe, expect, it } from "vitest";
import { sessionPath, sessionPiecePath, sessionPublicSlug } from "./public-path";

describe("slug público de la sesión", () => {
  it("arma dd-mm-aa y el título", () => {
    expect(sessionPublicSlug("2026-11-18", "Arranque Puebla x Puebla")).toBe(
      "18-11-26-arranque-puebla-x-puebla",
    );
  });

  it("la ruta de la sesión y la del organismo no se pisan", () => {
    const slug = "05-10-26-club-de-empresarios";
    expect(sessionPath(slug)).toBe("/sesiones/05-10-26-club-de-empresarios");
    expect(sessionPiecePath(slug, "canacintra")).toBe(
      "/sesiones/05-10-26-club-de-empresarios/canacintra",
    );
  });
});
```

- [ ] **Step 2: Corre el test y confirma que falla**

Run: `npx vitest run src/lib/sessions/public-path.test.ts`
Expected: FAIL, no existe el módulo.

- [ ] **Step 3: Implementa las tres funciones**

`sessionPublicSlug` parte `sessionOn` en año, mes y día, se queda con los dos últimos dígitos del año y pega el título con la misma `sectorSlug` de `src/lib/sectors.ts`. `sessionPath` y `sessionPiecePath` solo concatenan. Ninguna toca la base.

- [ ] **Step 4: Migración**

```sql
alter table public.sessions
  add column title text,
  add column public_slug text;

update public.sessions
set title = 'Arranque Puebla x Puebla',
    public_slug = '18-11-26-arranque-puebla-x-puebla'
where session_on = date '2026-11-18';

update public.sessions
set title = coalesce(title, venue),
    public_slug = coalesce(
      public_slug,
      to_char(session_on, 'DD-MM-YY') || '-' || regexp_replace(lower(venue), '[^a-z0-9]+', '-', 'g')
    )
where title is null or public_slug is null;

alter table public.sessions
  alter column title set not null,
  alter column public_slug set not null;

alter table public.sessions
  add constraint sessions_public_slug_shape
  check (public_slug ~ '^[0-9]{2}-[0-9]{2}-[0-9]{2}-[a-z0-9]+(?:-[a-z0-9]+)*$');

create unique index sessions_public_slug_idx on public.sessions (public_slug);
```

Aplícala con `apply_migration` en `jnshenkmexsxiylpqhdh` y guarda el mismo SQL en el archivo de migración. No cambies `capacity_max` ni los cupos.

- [ ] **Step 5: El test pasa**

Run: `npx vitest run src/lib/sessions/public-path.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/20261119120000_session_public_slug.sql src/lib/sessions/public-path.ts src/lib/sessions/public-path.test.ts
git commit -m "feat: give each session a public slug"
```

A partir de aquí los frentes A, B, C y D pueden correr juntos.

---

### Task A: Listado y página de la sesión

**Files:**
- Create: `src/lib/sessions/load-public.ts`
- Create: `src/lib/sessions/load-public.test.ts`
- Create: `src/components/sessions/session-list.tsx`
- Create: `src/app/sesiones/page.tsx`
- Create: `src/app/sesiones/[slug]/page.tsx`
- Modify: `src/components/landing/event-landing.tsx` solo para recibir `sessionPath` y armar los href de sector con `sessionPiecePath`

- [ ] **Step 1: Test del cargador**

El cargador devuelve `{ publicSlug, title, sessionOn, venue }` ordenado por `session_on` descendente. `sessionBySlug` devuelve `null` si el slug no está. El test usa un doble del cliente, no pega a Supabase.

- [ ] **Step 2: `/sesiones`**

`export const instant = false`. Lista las filas de `public.sessions`. Cada tarjeta enlaza con `sessionPath`. La del 18 de noviembre se lee «Arranque Puebla x Puebla» y muestra la fecha en español.

- [ ] **Step 3: `/sesiones/[slug]`**

Si el slug no existe, `notFound()`. Si existe, renderiza el `EventLanding` actual. Los href de sector que hoy son `/${sector.slug}` pasan a `sessionPiecePath(slug, sector.slug)`. El texto, los ponentes y el programa no se reescriben.

- [ ] **Step 4: Prueba**

Run: `npx vitest run src/lib/sessions/load-public.test.ts src/lib/organismo/dispatch.test.ts`
Expected: PASS. `dispatch.test.ts` sigue esperando `EventLanding` en la ruta vieja; no lo cambies en este frente.

---

### Task B: Invitación bajo la sesión

**Files:**
- Create: `src/app/sesiones/[slug]/[piece]/page.tsx`
- Create: `src/app/sesiones/[slug]/[piece]/crm/page.tsx`
- Create: `src/app/sesiones/[slug]/[piece]/invitaciones/page.tsx`
- Create: `src/app/sesiones/[slug]/[piece]/seguridad/page.tsx`
- Create: `src/lib/sessions/resolve-piece.ts`
- Create: `src/lib/sessions/resolve-piece.test.ts`
- Modify: los `href` de `src/components/organismo/**` que hoy arman `/${slug}`

- [ ] **Step 1: Test de resolución**

```ts
import { describe, expect, it } from "vitest";
import { pieceKind } from "./resolve-piece";

describe("segmento de la sesión", () => {
  it("un organismo gana sobre un sector con el mismo texto", () => {
    expect(pieceKind({ owner: true, sector: true })).toBe("organismo");
  });

  it("sin organismo y con sector es la landing de sector", () => {
    expect(pieceKind({ owner: false, sector: true })).toBe("sector");
  });

  it("si no es ninguno, no hay página", () => {
    expect(pieceKind({ owner: false, sector: false })).toBe("ninguno");
  });
});
```

- [ ] **Step 2: Página**

`/sesiones/[slug]/[piece]` carga la sesión con `sessionBySlug`. Si no hay sesión, `notFound()`. `organismo` reutiliza `OrgHome` con el mismo `searchParams` de hoy (`enlace`, `sector`, `corte`, `error`). `sector` reutiliza `SectorLanding`. `ninguno` es `notFound()`. `export const instant = false`.

- [ ] **Step 3: Subrutas**

Mueve el cuerpo de `src/app/[sector]/crm/page.tsx`, `invitaciones/page.tsx` y `seguridad/page.tsx` a las rutas nuevas. Cada archivo nuevo se queda bajo 90 líneas: si el actual ya pasa, parte el cuerpo antes de copiarlo. Los href internos usan `sessionPiecePath`.

- [ ] **Step 4: Las rutas viejas siguen vivas hasta la ola 2**

No borres `src/app/[sector]`. No cambies `src/app/[sector]/page.tsx`.

---

### Task C: Blog y nota del arranque

El modelo está en `/Users/alvarocastillo/dev/cluster/clusterdestartups.org`.

Qué sí se copia:

- Un markdown por nota en `content/blog/{slug}.es.md`, con frontmatter `title`, `description`, `excerpt`, `date`, `author`, `category`, `tags`, `image`.
- `gray-matter` y `marked` leen el archivo en el servidor. No hay tabla de posts.
- `src/app/blog/page.tsx` lista. `src/app/blog/[slug]/page.tsx` renderiza el HTML y responde `notFound()` si no hay archivo.
- Categoría de esta nota: `sala-de-prensa`.

Qué no se copia: `next-intl`, el locale en la URL, el feed, las empresas vinculadas ni los fundadores. Una sola lengua, español, sin `/es/`.

- [ ] **Step 1: Dependencias**

Run: `npm install gray-matter@^4.0.3 marked@^18.0.12`

- [ ] **Step 2: Lector**

`src/lib/notes/markdown.ts` expone `listNotes()` y `noteBySlug(slug)`. Solo acepta archivos que terminen en `.es.md`. El HTML sale de `marked`. Una imagen del markdown se queda como `<img>` con el `src` del archivo. No abras `http:` arbitrario fuera de rutas que empiecen con `/`.

`src/lib/notes/markdown.test.ts` escribe un markdown temporal, lista una nota y lee su título. Borra el temporal al final.

- [ ] **Step 3: Página índice y página de nota**

Índice en `/blog`, nota en `/blog/arranque-puebla-x-puebla-2026`. `export const instant = false` no hace falta aquí: no leen cookies ni `searchParams`. El título y la descripción salen del frontmatter.

- [ ] **Step 4: Pega esta nota**

Guárdala en `content/blog/arranque-puebla-x-puebla-2026.es.md`. No agregues nombres al acto protocolario.

```md
---
title: "Arrancó el Foro Puebla x Puebla con 114 personas"
description: "El 18 de noviembre de 2026, en el Hotel Quinta Real, 114 personas abrieron el Observatorio Tecnológico de Puebla. Hubo estrategia de vinculación, el levantamiento en sala, un panel de economía circular y una lectura del T-MEC."
excerpt: "La primera sesión del observatorio reunió a 114 personas en el Hotel Quinta Real para medir, en sala, la necesidad tecnológica de la industria poblana."
date: "2026-11-18"
author: "Observatorio Tecnológico de Puebla"
category: "sala-de-prensa"
tags: ["Foro Puebla x Puebla", "Observatorio", "Puebla", "T-MEC", "economía circular"]
---

El martes 18 de noviembre de 2026 el Hotel Quinta Real, en Puebla, recibió la primera sesión del Observatorio Tecnológico. El encuentro, Foro Puebla x Puebla, reunió a 114 personas entre el registro de las 8:30 y el cierre de las 11:35. Fue un desayuno de trabajo, no una feria: la mañana sirvió para oír el contexto y, enseguida, para que las empresas dejaran por escrito la necesidad tecnológica de su operación.

La jornada abrió con el acto protocolario, de 9:00 a 9:20. Enseguida, el Clúster de Startups e Innovación presentó la estrategia de vinculación del ecosistema de innovación de Puebla. De 9:50 a 10:30 las empresas pasaron a la construcción del observatorio: cada quien contestó desde su sector, y el resultado de esa hora es un mapa agregado, sin el nombre de la empresa.

El panel de las 10:30 puso en la misma mesa a Puebla y a Nuevo León. Silvia Ávila Cholula, presidenta del Clúster de Plásticos y Economía Circular de Puebla, y Arturo Rech, presidente y CEO del MexHub de Economía Circular, hablaron de cómo la economía circular ya es una decisión de planta y no un discurso aparte. A las 11:00 tomó la palabra Fausto López Aguilar, gerente de Tratados Internacionales de Volkswagen de México y vicepresidente del COMCE Sur. Su tema fue la ventaja de adoptar tecnología en la industria poblana de cara al T-MEC. Yamil Álvarez, presidente del Clúster de Startups e Innovación, cerró a las 11:30.

Esta sesión es el arranque. El observatorio sigue en sesiones periódicas, y el diagnóstico también se puede contestar desde la empresa, sin esperar al siguiente desayuno. Lo que se publicó este día es el tamaño de la convocatoria y la calidad de la conversación. Lo que sigue es el mapa del sector, anónimo, unas semanas después.
```

- [ ] **Step 5: Prueba**

Run: `npx vitest run src/lib/notes/markdown.test.ts`
Expected: PASS

---

### Task D: Home de programa y logos autorizados

**Files:**
- Create: `src/lib/program/public-logos.ts`
- Create: `src/lib/program/public-logos.test.ts`
- Create: `src/components/program/program-hero.tsx`
- Create: `src/components/program/program-home.tsx`
- Create: `src/components/program/logo-wall.tsx`
- Modify: `src/app/page.tsx`

La home usa la tabla «Qué dice la home» y el hero de «Identidad». La sesión del 18 de noviembre se enlaza, no se vuelve a narrar: `/sesiones/18-11-26-arranque-puebla-x-puebla` y `/blog/arranque-puebla-x-puebla-2026`.

Secciones, en este orden. Si `program-home.tsx` va a pasar de 90 líneas, cada sección va en su archivo:

1. Hero, como la lámina 1.
2. Qué es.
3. Objetivo.
4. Por qué.
5. Cómo, en los tres pasos, y debajo las tres formas de trabajo: piloto, codesarrollo, adopción. El llamado es `Crear cuenta` hacia `/crear-cuenta`.
6. Quién ya participa. El muro de logos.
7. Dónde sigue. Enlace al listado `/sesiones` y a la nota.

- [ ] **Step 1: Test del filtro de logos**

Una fila entra al muro solo si `show_logo_on_event` es verdadero y tiene `media_assets.purpose = 'company_logo'`. El test cubre las dos rechazadas: permiso apagado, y permiso encendido sin archivo.

- [ ] **Step 2: Consulta**

`public-logos.ts` lee empresas con ese permiso y devuelve `{ name, src }`. `src` es la URL pública del bucket `company-logos`, que ya exige `company_logo_is_public`. Si la lista viene vacía, el muro no se renderiza.

- [ ] **Step 3: Sustituye la home**

`src/app/page.tsx` deja de importar `EventLanding`. Sigue con `redirectIfSession("/")` y `export const instant = false`. Renderiza `ProgramHome`.

- [ ] **Step 4: Prueba**

Run: `npx vitest run src/lib/program/public-logos.test.ts`
Expected: PASS

---

### Task 2: Las rutas viejas redirigen

Entra cuando A y B ya están en el árbol. Un solo agente.

**Files:**
- Modify: `src/app/[sector]/page.tsx`
- Modify: `src/app/[sector]/crm/page.tsx`
- Modify: `src/app/[sector]/invitaciones/page.tsx`
- Modify: `src/app/[sector]/seguridad/page.tsx`
- Modify: `src/lib/organismo/dispatch.test.ts`
- Modify: los generadores de enlace que hoy publican `https://…/{org}` o `/{sector}`

- [ ] **Step 1: Redirección**

`/{piece}` busca la sesión con `session_on` más reciente que tenga `public_slug`. Si `piece` es organismo o sector, redirige a `sessionPiecePath`. Si no es ninguno, `notFound()`. Ya no renderiza `EventLanding` ni `OrgHome`.

Las subrutas `/{org}/crm`, `/invitaciones` y `/seguridad` redirigen al mismo sufijo bajo `/sesiones/[slug]/[org]`. Conservan la query (`enlace`, `sector`, `corte`).

- [ ] **Step 2: Enlaces que se imprimen o se mandan**

Busca los armados de URL del organismo (`copy-link-action`, correos, CRM). El enlace nuevo es `sessionPiecePath`. Un enlace viejo sigue cayendo en la redirección de este task, así que lo ya enviado no se rompe.

- [ ] **Step 3: Ajusta el test de dispatch**

`src/lib/organismo/dispatch.test.ts` deja de esperar `EventLanding` en `src/app/[sector]/page.tsx` y espera `redirect` hacia `/sesiones/`.

- [ ] **Step 4: Prueba**

Run: `npx vitest run src/lib/organismo/dispatch.test.ts src/lib/sessions/public-path.test.ts src/lib/sessions/resolve-piece.test.ts src/lib/notes/markdown.test.ts src/lib/program/public-logos.test.ts`
Expected: PASS

---

## Revisión del plan

- La landing actual se muda a `/sesiones/[slug]`: Task A.
- `/sesiones` lee `public.sessions`: Task A.
- La invitación queda en `/sesiones/[slug]/[org]`: Task B.
- El blog copia el markdown del clúster y publica la nota: Task C.
- La home usa la lámina 1 como hero y publica qué es, el objetivo, el porqué y el cómo de la presentación: Task D.
- Los frentes de la ola 1 no comparten archivos. La ola 0 y la ola 2 son las únicas secuenciales.
- La nota usa 114 personas, la fecha, la sede y los cuatro nombres que están en `confirmed-speakers.ts`. El presídium no se nombra porque el programa no lo trae.
