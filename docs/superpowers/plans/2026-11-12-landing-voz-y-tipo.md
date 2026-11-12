# Voz, tipo y salida del T-MEC

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que la portada se lea como una invitación a un desayuno, con una letra más humana y un inicio que se distinga del resto, y que el diagnóstico largo del T-MEC deje de estar en el sitio.

**Architecture:** El cambio de letra vive en `src/app/layout.tsx` y en la escala de `src/app/globals.css`, así aplica a toda la página pública. El titular de la sesión, la lista de sectores y el bloque de inicio se editan en sus secciones. El T-MEC se quita de la portada, del pie y de la ruta pública. El PDF y la lista de industrias se quedan, porque el registro y los sectores todavía los usan.

**Tech Stack:** Next.js 16, `next/font/google`, Tailwind v4.

**Fuera de este plan:** no rehacer gráficas del T-MEC, no agrandar su índice y no redactar una versión corta. Esas notas quedan cubiertas al sacar el texto.

---

### Task 1: Titular de la sesión

Hoy `src/components/landing/sections/session.tsx` abre con «Estrategia estatal de vinculación industrial con el ecosistema de innovación.» Suena a documento, no a invitación.

**Files:**
- Modify: `src/components/landing/sections/session.tsx`
- Modify: `src/content/session-program.ts` (la línea de las 09:15–09:25 usa la misma frase)

- [ ] **Step 1:** Cambiar el `SectionHeading` de la sesión a:

```tsx
<SectionHeading title="Qué vamos a hacer el 18 de noviembre" />
```

- [ ] **Step 2:** En el programa, dejar el bloque de las 09:15 como «Apertura: para qué es esta sesión». No repetir la frase larga.

- [ ] **Step 3:** Revisar en el navegador, en escritorio y en teléfono, que el título quepa en dos líneas y que no vuelva a aparecer la frase vieja en la portada.

### Task 2: Otra letra, y que se lea en la computadora

Hoy los títulos son Archivo al 112% de ancho y el cuerpo es Raleway. Ese par, más las etiquetas de 12px (`--text-micro: 0.75rem`), es lo que se siente generado. Raquel lo nota en la computadora: letra chica y poco texto con aire.

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css` (variables `--font-*`, `--text-*`, y la regla de `h1, h2, h3, .display`)

- [ ] **Step 1:** Quitar Archivo y Raleway. Cargar con `next/font/google`:
  - Títulos: `Newsreader` (serif, pesos 500 y 600).
  - Cuerpo: `Source Sans 3` (pesos 400, 500, 600).

- [ ] **Step 2:** Apuntar `--font-display` a Newsreader y `--font-body` / `--font-sans` a Source Sans 3. Quitar `font-stretch: 112%` de los títulos.

- [ ] **Step 3:** Subir el cuerpo y las etiquetas:
  - `--text-body`: `1.125rem` con interlineado `1.6`.
  - `--text-small`: `1rem`.
  - `--text-micro`: `0.875rem`. Deja de usarse para párrafos. Solo para una etiqueta corta, nunca para una frase.

- [ ] **Step 4:** Recorrer la portada en una ventana ancha. El párrafo bajo el título, los datos de la sesión y las preguntas frecuentes tienen que leerse sin acercarse. Si algún bloque sigue en 12px, subirlo a `text-small`.

### Task 3: Los 13 sectores no son un menú

`Sectores participantes · 13` está en `src/components/landing/sections/forum-sectors.tsx`. Cada pastilla es un enlace a la ficha del sector (`/automotriz-y-autopartes`, etc.). Por eso no se entiende a dónde lleva: parece un botón y no dice que abre la página de ese sector.

**Files:**
- Modify: `src/components/landing/sections/forum-sectors.tsx`

- [ ] **Step 1:** Quitarle el enlace. La lista solo muestra quiénes están en el desayuno.

- [ ] **Step 2:** Cambiar la etiqueta de micro-mayúsculas a una frase en cuerpo:

```tsx
<p className="text-body text-ink">Estos 13 sectores están en el desayuno.</p>
<ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-body text-ink-secondary">
  {forumSectors.map((sector) => (
    <li key={sector.name}>{sector.name}</li>
  ))}
</ul>
```

Sin borde, sin pastilla, sin `text-micro`.

### Task 4: El inicio se tiene que ver distinto

El inicio (`src/components/landing/sections/hero.tsx`) usa el mismo contenedor, el mismo borde y el mismo ritmo que la sesión, el problema y las preguntas. Lo principal es el observatorio y la frase de portada.

**Files:**
- Modify: `src/components/landing/sections/hero.tsx`
- Modify: `src/components/landing/atoms/event-title.tsx`

- [ ] **Step 1:** El nombre de la sesión («Sesión Desayuno: Foro Puebla x Puebla») pasa a `text-h2` con la letra de títulos, no a `text-h3`.

- [ ] **Step 2:** El `h1` de la portada usa la clase `display` (Newsreader, tamaño `--text-display`). El párrafo de abajo se queda en `text-body-lg`, con `max-w-2xl`, para que no se estire a todo el ancho de 80rem.

- [ ] **Step 3:** El fondo del inicio pasa a `bg-surface-subtle` y pierde el `border-b`. Las secciones de abajo siguen en `bg-surface`. Así el primer pantallazo se separa del resto sin inventar un segundo diseño.

- [ ] **Step 4:** Ver la portada en 1280px y en 390px. El título no debe chocar con los botones. Los logos de gobierno siguen en una sola línea.

### Task 5: Sacar el T-MEC de la lectura pública

El texto, las gráficas y el índice viven en `/diagnostico-tmec-puebla`. No se reescriben. Se dejan de mostrar.

No borrar `src/content/diagnostico-tmec.ts` ni `src/app/diagnostico-tmec-puebla/descarga/route.ts`. `src/lib/sectors.ts` importa `diagnosticIndustries`, y el registro sigue pudiendo ofrecer el PDF.

**Files:**
- Modify: `src/components/landing/landing-body.tsx` (quitar `<DiagnosticBanner />`)
- Modify: `src/components/site/footer.tsx` (quitar el enlace «Diagnóstico T-MEC»)
- Modify: `src/components/site/header.tsx` (quitar el caso especial de `onDiagnostic`)
- Modify: `src/app/diagnostico-tmec-puebla/page.tsx` para que responda `notFound()`
- Buscar y quitar enlaces restantes a `/diagnostico-tmec-puebla` en componentes de portada (`diagnostic-banner.tsx` puede quedar sin uso y borrarse si nadie más lo importa)

- [ ] **Step 1:** Quitar el banner de la portada y el enlace del pie.

- [ ] **Step 2:** La ruta pública del diagnóstico llama a `notFound()`.

- [ ] **Step 3:** `rg "diagnostico-tmec-puebla" src` no debe devolver enlaces visibles. Puede seguir saliendo la ruta de descarga y los imports del PDF.

- [ ] **Step 4:** Abrir `/`, el pie y `/diagnostico-tmec-puebla`. La portada no menciona el diagnóstico. La ruta larga responde 404. `/diagnostico-tmec-puebla/descarga` sigue existiendo para quien ya tenga el enlace del registro.

---

## Verificación

- Portada en 1280px y en 390px.
- La frase «ecosistema de innovación» no aparece en la portada.
- Los 13 sectores se leen como lista, y un clic no cambia de página.
- El inicio se distingue del bloque de la sesión por fondo y tamaño de título.
- No hay enlace a leer el diagnóstico.
- Los logos de gobierno siguen en una sola línea.
