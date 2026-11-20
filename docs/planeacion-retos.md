# Planeación — Retos

Concepto de producto. Todavía no es un plan de implementación ni un desglose a tareas.
Fecha de cierre de esta versión: 20 de noviembre de 2026.

## Qué es un reto

En el Observatorio, un **reto** es una **necesidad tecnológica concreta de la operación** de una empresa, escrita para que startups y equipos de desarrollo puedan entenderla y proponer solución.

Definición canónica (FAQ PXP): *«Un reto concreto de la operación de tu empresa que podría resolverse con tecnología.»*

No confundir con:

| Uso de la palabra «reto» | Dónde vive | ¿Es este módulo? |
| --- | --- | --- |
| Necesidad tecnológica publicable | App `/app/challenges` + portal | **Sí** |
| Texto de banda Bronce/Plata/Oro | Metodología v1 (`section_bands.reto`) | No |
| Fila Tema / Reto / Oportunidad | Diagnóstico TMEC editorial | No |
| Demanda explícita P5 | Respuestas del instrumento v2 (JSON) | Insumo; no es el estándar de publicación |

Hoy `/app/challenges` es un placeholder: «Aquí podrás lanzar retos públicos, anónimos o privados.» Sin formulario ni tabla.

## Estándar de publicación

Todo reto publicado —en la red o en el portal— sigue el mismo esquema. Lo que cambia es la **visibilidad**, no los campos.

### Campos obligatorios

| Campo | Qué es | Regla |
| --- | --- | --- |
| Nombre | Título corto del reto | 8–80 caracteres. Sin nombre de marca de terceros. |
| Área | Área funcional de la operación | Catálogo cerrado (abajo). Una sola área principal. |
| Descripción | Qué duele hoy y en qué contexto | 120–1 200 caracteres. Hechos de operación, no pitch. |
| Meta | Qué se considera éxito | Medible o verificable (tiempo, costo, calidad, trazabilidad, etc.). |

### Campos recomendados (v1)

| Campo | Qué es | Regla |
| --- | --- | --- |
| Sector | Sector industrial de la empresa | Se hereda de `companies.sector_id`; editable solo si admin lo pide. |
| Urgencia | Baja / media / alta | Default media. |
| Horizonte | Ya / este trimestre / este año | Opcional. |
| Restricciones | Presupuesto, stack, cumplimiento | Texto corto opcional. |
| Visibilidad | `red` \| `portal` \| `anonimo` | Obligatoria al publicar. |
| Estado | `borrador` \| `publicado` \| `cerrado` \| `adoptado` | Ciclo de vida. |

### Campos fuera de v1

Matching automático, adjuntos, multi-área, KPI numérico estructurado, comentarios públicos, chat con startups.

## Catálogo de áreas

El área etiqueta **dónde duele la operación**, no el sector industrial (automotriz, muebles…). Sectores ya existen en el producto; las áreas son la taxonomía nueva del estándar de retos.

Propuesta v1 (cerrada para planeación; ajustable en tareas):

| Código | Área | Ejemplos de reto |
| --- | --- | --- |
| `rrhh` | Personas / RRHH | Asistencia, capacitación, reclutamiento, clima |
| `finanzas` | Finanzas | Flujo de caja, costeo, proyección, cobranza |
| `contabilidad` | Contabilidad | Facturación, conciliaciones, CFDI, cierre |
| `almacen` | Almacén e inventarios | WMS, mermas, ubicación, conteos |
| `produccion` | Producción / planta | Paros, OEE, calidad en línea, mantenimiento |
| `compras` | Compras y proveedores | Cotizaciones, lead time, homologación |
| `ventas` | Ventas y comercial | CRM, cotizador, pipeline, postventa |
| `logistica` | Logística y distribución | Rutas, tracking, última milla |
| `ti` | TI / sistemas | ERP, integraciones, ciberseguridad, datos |
| `calidad` | Calidad y cumplimiento | ISO, trazabilidad, no conformidades |
| `otro` | Otro | Obliga a una nota corta de contexto |

Una sola área principal por reto. Si el dolor cruza dos, se elige la de mayor impacto y se menciona la otra en la descripción.

## Visibilidad: red vs portal vs anónimo

Tensión actual del producto: el FAQ promete que **no se publica** el nombre ni la necesidad individual; el placeholder de la app anticipa retos **públicos, anónimos o privados**. Esta planeación la resuelve así:

| Visibilidad | Dónde se ve | Qué se muestra | Quién lo ve |
| --- | --- | --- | --- |
| `red` (privado en la red) | Solo app autenticada / espacio de la red EIA | Nombre del reto, área, descripción, meta; empresa según permiso de red | Empresas EIA y operadores del Observatorio. No indexable en el sitio público. |
| `portal` (público) | Portal de retos del sitio | Reto completo con atribución acordada (empresa o seudónimo de red) | Cualquiera en internet |
| `anonimo` | Portal y/o mapa agregado | Área + sector + texto sin nombre de empresa | Público; alimenta estadística |

### Reglas de privacidad

1. Default al crear: `red`.
2. Pasar a `portal` exige confirmación explícita (checkbox): *«Autorizo publicar este reto fuera de la red.»* Alinea con Uso de datos: *un dato solo se atribuye a tu empresa si tú lo autorizas por escrito, para ese caso.*
3. `anonimo` nunca muestra razón social ni datos de contacto.
4. El mapa agregado del Observatorio sigue siendo estadística por sector; los retos `portal` son el canal de ítems individuales.
5. El copy del FAQ PXP debe actualizarse cuando exista el portal, para no contradecir «nunca se publica la necesidad».

### Canales

| Canal | Ruta / superficie | Contenido |
| --- | --- | --- |
| App empresario | `/app/challenges` | Crear, editar borrador, publicar, ver los propios y (si EIA) los de la red |
| Red privada | Misma app, filtro «Red» | Retos `red` de empresas con estatus EIA / permiso de red |
| Portal de retos | Ruta pública nueva (propuesta `/retos`) | Listado filtrable por área, sector, urgencia; solo `portal` y, si aplica, cards anónimas |

## Flujo del empresario

1. Entra a Retos → «Nuevo reto».
2. Llena el estándar (nombre, área, descripción, meta).
3. Guarda borrador (sin lavas).
4. Elige visibilidad y publica.
5. Si `portal`, confirma autorización de atribución.
6. Ve el reto en su lista; si es `red` o `portal`, suma lavas según `docs/planeacion-lavas.md`.
7. Puede cerrar el reto o marcarlo adoptado cuando haya piloto (flujo futuro con admin / startup).

## Relación con metodología e innovación abierta

- **P5 demanda explícita** del instrumento v2 puede ofrecer «Convertir en reto» (prefill de descripción). No publica solo.
- **EIA**: publicar en `red` puede requerir (o incentivar) ser EIA. Publicar en `portal` puede estar abierto a cualquier empresa onboarded, con moderación.
- **Lavas**: valores en la tabla pública de lavas; no se duplican aquí.

## Moderación (v1 mínima)

| Caso | Regla |
| --- | --- |
| `red` | Auto-publicado al confirmar; superadmin puede ocultar |
| `portal` | Cola de revisión superadmin **o** auto-publicado con reporte; decidir en tareas |
| `anonimo` | Auto-publicado; sin atribución |
| Contenido | Sin datos personales de terceros, sin secretos industriales explícitos, sin spam |

## Modelo mental de datos (para la bajada a tareas)

Conceptos, sin SQL todavía:

1. Tabla / entidad `challenges` (o `retos`) con los campos del estándar.
2. Enums: `area`, `visibility`, `status`, `urgency`.
3. FK a `companies` (y opcional a `profiles` autor).
4. Flag o timestamp de autorización de publicación portal.
5. RLS: autor y admin ven borradores; red solo retos `red`/`portal` según reglas; anónimos sin empresa en vistas públicas.
6. Vista o ruta pública que **nunca** filtre por empresa en modo anónimo.

## Fuera de alcance (esta planeación)

- Marketplace de soluciones ni pagos.
- Chat in-app con startups.
- Importación masiva desde Excel del organismo.
- Sustituir el mapa agregado: el portal lo complementa, no lo borra.
- Reescribir el diagnóstico TMEC.

## Decisiones abiertas

1. ¿Publicar en `red` exige estatus EIA o basta el consentimiento de contacto?
2. ¿El portal `/retos` es listado + detalle, o también un mapa?
3. ¿Moderación previa obligatoria para `portal`?
4. ¿Se permite más de un reto activo por área a la vez?
5. ¿«Privado» del placeholder = solo `red`, o existe un modo solo-yo (ni red ni portal)?
6. ¿Actualizamos el FAQ y Uso de datos en el mismo release que el portal?

### Propuesta para el punto 5

El placeholder decía «públicos, anónimos o privados». Mapeo:

- público → `portal`
- anónimo → `anonimo`
- privado → `red` (visible en la red, no en el sitio abierto)

Si se necesita «solo mi empresa», sería `borrador` eterno o un cuarto modo `interno`; **no** entra en v1 salvo que producto lo pida.

## Criterios de listo para bajar a tareas

- [ ] Estándar de campos cerrado (obligatorios + recomendados).
- [ ] Catálogo de áreas v1 cerrado.
- [ ] Tres visibilidades con reglas de privacidad escritas.
- [ ] Canales app / red / portal definidos.
- [ ] Enlace limpio con lavas y con EIA.
- [ ] Lista de decisiones abiertas resuelta o explícitamente diferida.

## Referencias en el repo

- Placeholder: `src/app/app/challenges/page.tsx`
- Nav: `src/lib/app/nav.ts`
- FAQ necesidad / anonimato / EIA: `src/components/program/pxp/faq.tsx`
- Uso de datos: `src/app/uso-de-datos/page.tsx`
- Plan home: `docs/superpowers/plans/2026-11-20-cuenta-libre-y-home.md`
- Demanda P5: instrumentos en `src/content/methodology/v2/`
- Hermana de esta planeación: `docs/planeacion-lavas.md`
