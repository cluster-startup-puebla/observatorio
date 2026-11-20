# Planeación — Lavas

Concepto de producto. Todavía no es un plan de implementación ni un desglose a tareas.
Fecha de cierre de esta versión: 20 de noviembre de 2026.

## Qué son

Las **lavas** son la unidad de reconocimiento del Observatorio dentro de la app del empresario (`/app`). Miden participación útil: completar el perfil, evaluar, declarar necesidades, publicar retos y abrirse a co-crear con startups.

No son el score de la metodología (dimensión `innovacion` del diagnóstico). No se mezclan con bandas Bronce / Plata / Oro.

Hoy solo existe el chip UI: muestra `0 lavas` y el tooltip «Próximamente». No hay tabla, reglas ni saldo en base de datos.

## Relación con Empresa de Innovación Abierta (EIA)

Definición canónica (FAQ PXP): *empresas que se abren a probar y co-crear soluciones con startups*.

Hoy en producto «EIA» es un **opt-in de contacto** (`innovation_consents.accepted_at`), por correo o por el banner «Unirme» en `/app/home`. Ese permiso **no publica** la empresa.

### Decisión de producto propuesta

| Pieza | Regla |
| --- | --- |
| Consentimiento | Sigue siendo el permiso de contacto. No equivale solo a «ya eres EIA». |
| Estatus EIA | Se alcanza (o se confirma) cuando la empresa **acepta el permiso** y cruza un **umbral de lavas**, o cuando admin la marca tras un compromiso real de co-creación. |
| Ya eres EIA | Si la empresa ya tiene estatus EIA, **sube el valor** de las acciones que suman lavas (multiplicador) y se desbloquean acciones de mayor valor (p. ej. adoptar un piloto, validar un prototipo). |
| Copy del chip | Mientras no sea EIA: «Entre más lavas juntas, más cerca estás de ser una empresa de innovación abierta.» Cuando ya es EIA: «Como EIA, tus acciones suman más lavas.» |

Queda abierto si el umbral es fijo (p. ej. 100 lavas) o por temporada / sesión.

## Tabla pública de lavas

La tabla es **pública en la app** (página o sheet desde el chip). Cualquier empresario autenticado la ve. No es un secreto de admin.

Cada fila:

| Campo | Significado |
| --- | --- |
| Acción | Nombre legible de lo que hizo la empresa |
| Lavas | Valor base |
| Condición | Qué debe cumplirse para otorgarlas |
| Una vez / repetible | Si solo se dan una vez o pueden repetirse |
| Multiplicador EIA | Si aplica el boost al ya ser EIA |

### Propuesta inicial de valores

| Acción | Lavas base | Condición | Una vez / repetible | Notas |
| --- | --- | --- | --- | --- |
| Completar perfil (logo + sitio) | 10 | `companies` con logo y sitio | Una vez | Checklist de empresa ya existe |
| Terminar primera evaluación | 25 | Run v2 en fase terminada con `score` | Una vez por ciclo/año | No confundir con score del instrumento |
| Unirse / confirmar lugar en sesión del sector | 15 | Pase aceptado o llegada escaneada | Por sesión | Definir si cuenta la aceptación o el «Llegó» |
| Aceptar permiso de innovación abierta | 10 | `accepted_at` no nulo | Una vez | Opt-in; no basta para EIA plena |
| Publicar un reto en la red (privado) | 20 | Reto publicado con visibilidad `red` | Por reto (tope mensual) | Ver planeación de retos |
| Publicar un reto en el portal (público) | 35 | Reto publicado con visibilidad `publico` | Por reto (tope mensual) | Requiere revisión o auto-publicación con reglas |
| Publicar un reto anónimo agregado | 15 | Reto con visibilidad `anonimo` | Por reto | Alimenta el mapa sin nombre de empresa |
| Responder a un matching / interés de startup | 20 | La empresa responde en plazo | Por respuesta | Requiere módulo de matching |
| Adoptar o validar un piloto | 50 | Admin o flujo de adopción confirma | Por piloto | Solo desbloqueado si ya es EIA (propuesta) |
| Asistir a la sesión (QR escaneado) | 10 | Mesa marca «Llegó» | Por sesión | Complementa o sustituye la fila de «unirse» |

Valores sujetos a ajuste en la bajada a tareas. Lo importante de esta planeación es **cerrar el catálogo de acciones** y que la tabla sea visible.

### Multiplicador si ya eres EIA

Propuesta: **×1.5** sobre el valor base de acciones repetibles y de publicación de retos. Las acciones «una vez» del onboarding no se re-multiplican si ya se cobraron antes del estatus.

Alternativa a decidir: en vez de multiplicador, un bono fijo mensual por mantenerse EIA activa.

## Quién ve qué

| Actor | Qué ve |
| --- | --- |
| Empresario | Saldo en el chip (todo `/app`), historial propio, tabla pública de valores |
| Superadmin | Catálogo editable de valores, saldos, otorgamientos manuales, umbral EIA |
| Moderador | Fuera de alcance en v1 (salvo lectura si se necesita en mesa) |
| Público sin cuenta | No ve lavas ni saldos. Sí puede ver el portal de retos públicos (otro concepto) |
| Organismo | No ve lavas de sus empresas en v1 |

## Modelo mental de datos (para la bajada a tareas)

Sin SQL todavía. Conceptos:

1. **Catálogo de acciones** — código estable, nombre, valor, flags (una vez, requiere EIA, tope).
2. **Ledger de lavas** — filas inmutables: empresa, acción, valor otorgado, referencia (reto_id, sesión, run…), `created_at`.
3. **Saldo** — suma del ledger (materializada o calculada).
4. **Estatus EIA** — distinto del solo consentimiento; campos candidatos: `eia_status`, `eia_since`, vínculo con umbral y/o marca admin.

El chip deja de ser hardcode `0` y lee el saldo de la empresa del perfil autenticado.

## Reglas de otorgamiento

- Solo el servidor otorga lavas. El cliente nunca manda el valor.
- Idempotencia: la misma acción «una vez» no se cobra dos veces.
- Retos: al publicar (o al aprobar, si hay moderación), no al guardar borrador.
- Si se borra o se oculta un reto, decidir si se **revierten** lavas (propuesta: no revertir; registrar ajuste solo en fraude / admin).
- No se restan lavas por uso cotidiano. No hay «tienda» en esta planeación.

## Fuera de alcance (esta planeación)

- Canje de lavas por premios o dinero.
- Ranking público de empresas por lavas (puede venir después; hoy el reconocimiento es privado a la cuenta + tabla de valores).
- Mezclar lavas con el score del diagnóstico.
- Notificaciones push; el toast / banner existentes bastan al cobrar un bono grande.

## Decisiones abiertas

1. ¿El umbral a EIA es por lavas, por compromiso admin, o ambos?
2. ¿«Llegó» a la sesión y «pase aceptado» son dos acciones o una sola?
3. ¿Hay tope mensual de lavas por publicación de retos?
4. ¿El multiplicador EIA es ×1.5, bono fijo, o ambas?
5. ¿Se restaura ya el tooltip del plan de home o se espera al primer otorgamiento real?
6. ¿El catálogo de valores lo edita solo superadmin en UI o vive en código/seed?

## Criterios de listo para bajar a tareas

- [ ] Catálogo de acciones cerrado (nombres y valores v1).
- [ ] Relación consentimiento ↔ EIA ↔ lavas escrita en una sola frase de producto.
- [ ] UI: chip + tabla pública + (opcional) historial.
- [ ] Eventos del producto que disparan el ledger identificados (perfil, evaluación, sesión, consentimiento, retos).
- [ ] Esta planeación enlazada con `docs/planeacion-retos.md` sin contradicciones de valor.

## Referencias en el repo

- Chip y placeholder: `src/lib/app/lavas.ts`, `src/components/app/lavas-chip.tsx`
- Banner EIA: `src/components/app/innovation-banner.tsx`
- Consentimiento: migraciones `innovation_consents`, RPCs `join_open_innovation` / `accept_open_innovation`
- Plan home (copy aspiracional): `docs/superpowers/plans/2026-11-20-cuenta-libre-y-home.md`
- FAQ EIA: `src/components/program/pxp/faq.tsx`
- Retos (placeholder): `src/app/app/challenges/page.tsx`
- Hermana de esta planeación: `docs/planeacion-retos.md`
