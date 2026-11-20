# Planeación — Retos

Concepto de producto. El plan tarea por tarea está en `docs/superpowers/plans/2026-11-20-retos.md`.
Fecha de cierre de esta versión: 20 de noviembre de 2026.

## Qué es un reto

Una **necesidad tecnológica concreta de la operación**, publicada para que después startups, incubadoras o emprendedores puedan **aplicar** a resolverla (tipo licitación).

Definición FAQ: *«Un reto concreto de la operación de tu empresa que podría resolverse con tecnología.»*

**v1:** solo se **publican** retos (crear, listar, detalle, moderar).  
**Después (schema preparado ya):** aplicaciones de startups / incubadoras / emprendedores.

No confundir con el «reto» de bandas metodológicas ni con las filas TMEC.

## Roles

| Actor | Puede |
| --- | --- |
| Empresa (empresario onboarded) | Crear, editar borrador, publicar, ver los suyos |
| Superadmin | Moderar: ocultar, bajar, re-publicar; ver todos; no crea a nombre de la empresa en v1 |
| Público | Ver portal `/retos` (retos publicados no ocultos, según atribución) |

## Estándar de publicación

| Campo | Obligatorio | Regla |
| --- | --- | --- |
| Nombre | Sí | 8–80 caracteres |
| Área | Sí | Catálogo cerrado |
| Descripción | Sí | **TipTap 3** (WYSIWYG). Se guarda y se rinde como **HTML** (`editor.getHTML()`), no como `.md`. Extensiones: starter-kit, underline, text-align, highlight, color — mismo enfoque que contratos en otros productos del equipo |
| Meta | Sí | Qué se considera éxito (texto) |
| Sector | Heredado | De `companies.sector_id` |
| Urgencia | No | baja / media / alta |
| Visibilidad + atribución | Sí al publicar | Ver abajo |
| Estado | Sí | `borrador` \| `publicado` \| `oculto` \| `cerrado` |

## Catálogo de áreas

`rrhh`, `finanzas`, `contabilidad`, `almacen`, `produccion`, `compras`, `ventas`, `logistica`, `ti`, `calidad`, `otro`.

## Visibilidad y atribución (cerradas)

Un reto puede ser **público en el portal** y a la vez **privado de empresa** (no muestra razón social): licitación abierta.

| Modo | En portal `/retos` | Muestra empresa | Quién aplica (futuro) |
| --- | --- | --- | --- |
| Público con empresa | Sí | Sí, razón social | Cualquiera (futuro) |
| Público sin empresa (licitación) | Sí | No | Cualquiera (futuro) |
| Solo red | No (solo app autenticada) | Según reglas de red | Red (futuro) |

Campos: `visibility` (`portal` \| `red`) + `show_company` (boolean).  
`portal` + `show_company = false` = licitación anónima de empresa.

Default al crear: `red` o borrador; al publicar a portal, checkbox de atribución.

## Canales v1 (todo en este release)

| Canal | Ruta | Contenido |
| --- | --- | --- |
| App | `/app/challenges` | CRUD de la empresa |
| Portal | `/retos` y `/retos/[id]` | Listado + detalle públicos |
| Admin | `/admin/retos` | Moderación superadmin |

## Moderación

Superadmin puede **ocultar** / bajar un reto (calidad, incumplimiento, spam). Estado `oculto`: no sale en portal ni en listados de red; la empresa lo ve como oculto por moderación. Puede volver a `publicado`.

Publicación de la empresa: **auto-publica** al confirmar; moderación es reactiva (ocultar), no cola previa obligatoria en v1.

## Editor

- TipTap 3: `@tiptap/react` + starter-kit, underline, text-align, highlight, color.
- Persistencia: columna `description_html` (text).
- Render público: HTML sanitizado (misma política que se use en admin preview).
- **No** usar `react-markdown` para el cuerpo del reto.

## Modelo de datos

1. Tabla `challenges` (o `retos`): campos del estándar, `company_id`, `created_by`, timestamps, `hidden_at` / status.
2. Tabla futura `challenge_applications` (o equivalente): preparada en migración v1 con RLS restrictivo / sin UI — startups, incubadoras, emprendedores aplican después.
3. RLS: empresa CRUD de los suyos; público lee publicados no ocultos en portal; superadmin todo.

## Aplicaciones (solo plan / schema)

Más adelante: aplicar para resolver el reto. En v1 dejar tabla (o comentario + stub de migración) lista: `challenge_id`, solicitante, tipo (`startup` \| `incubadora` \| `emprendedor`), pitch, estado. Sin formularios ni listados todavía.

## Lavas

Publicar un reto suma lavas según `docs/planeacion-lavas.md`. Ocultar no revierte.

## FAQ / Uso de datos

Actualizar copy en el mismo release: ya no «nunca se publica la necesidad»; se publica con o sin nombre según elija la empresa.

## Decisiones cerradas

1. Crea la **empresa**; modera el **superadmin**.
2. Portal `/retos` **sí** en este release.
3. Público **con** empresa y público **sin** empresa (licitación) ambos existen.
4. Descripción = TipTap HTML.
5. Aplicar = después; schema preparado.
6. Sin topes de publicación ligados a lavas.

## Referencias

- Placeholder: `src/app/app/challenges/page.tsx`
- Admin nav: `src/components/admin/nav.ts`
- FAQ: `src/components/program/pxp/faq.tsx`
- Hermana: `docs/planeacion-lavas.md`
- Plan de tareas: `docs/superpowers/plans/2026-11-20-retos.md`
