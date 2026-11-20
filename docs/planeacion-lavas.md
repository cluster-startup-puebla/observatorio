# Planeación — Lavas

Concepto de producto. El plan tarea por tarea está en `docs/superpowers/plans/2026-11-20-lavas.md`.
Fecha de cierre de esta versión: 20 de noviembre de 2026.

## Qué son

Las **lavas** son un **sistema de loyalty / gamificación** del Observatorio en la app del empresario (`/app`). Reconocen participación útil: completar perfil, evaluar, asistir a la sesión («Llegó»), publicar retos, etc.

No son el score de la metodología. **No condicionan ni desbloquean el estatus EIA.** EIA sigue siendo el permiso / compromiso de innovación abierta, independiente de las lavas.

Hoy solo existe el chip UI: `0 lavas` + tooltip «Próximamente».

## Relación con EIA (cerrada)

| Pieza | Regla |
| --- | --- |
| Lavas | Solo gamificación / loyalty. No importan para ser EIA. |
| EIA | Flujo de consentimiento / unirse existente (`innovation_consents`). Independiente. |
| Boost | Si la empresa ya es EIA (tiene `accepted_at`), aplica **multiplicador y/o bono fijo**, ambos **configurables** por superadmin. |
| Copy del chip | Tabla de valores + saldo. Sin narrativa de «juntar lavas para ser EIA». |

## Tabla pública de lavas

Visible para cualquier empresario autenticado (sheet o página desde el chip).

| Campo | Significado |
| --- | --- |
| Acción | Nombre legible |
| Lavas | Valor base |
| Condición | Qué debe cumplirse |
| Una vez / repetible | Idempotencia |
| Multiplicador EIA | Si aplica el boost configurable |
| Bono EIA | Bono fijo configurable (además del multiplicador) |

### Catálogo inicial propuesto

| Acción | Lavas base | Condición | Una vez / repetible |
| --- | --- | --- | --- |
| Completar perfil (logo + sitio) | 10 | Logo + sitio en `companies` | Una vez |
| Terminar primera evaluación | 25 | Run v2 terminado con `score` | Una vez por ciclo |
| Asistir a la sesión («Llegó») | 15 | Mesa escanea QR / hecho llegar | Por sesión |
| Aceptar permiso innovación abierta | 10 | `accepted_at` | Una vez |
| Publicar reto (cualquier visibilidad pública/red) | 20–35 | Reto publicado (no borrador, no oculto) | Por reto, **sin tope** |

Valores exactos los edita el **superadmin** en UI. Seed inicial en migración.

## Decisiones cerradas

1. Solo gamificación; **no afecta EIA**.
2. **«Llegó»** (asistencia) suma lavas.
3. **Sin topes** mensuales ni por acción repetible (salvo idempotencia «una vez»).
4. Boost EIA = **multiplicador y bono fijo**, ambos configurables.
5. Tras instalar el sistema: **barrido (backfill)** de acciones históricas para asignar lavas ya ganadas.
6. Catálogo y config de boost: **edita superadmin**.

## Quién ve qué

| Actor | Qué ve |
| --- | --- |
| Empresario | Chip con saldo, tabla de valores, historial propio |
| Superadmin | CRUD catálogo, config boost, saldos, ajuste manual, disparo de barrido |
| Público / organismo | No ven lavas en v1 |

## Modelo de datos

1. **Catálogo de acciones** — código, nombre, valor base, flags, editable por admin.
2. **Config boost** — multiplicador + bono fijo (filas o settings).
3. **Ledger** — filas inmutables: empresa, acción, valor otorgado, ref, `created_at`, origen (`live` \| `backfill` \| `manual`).
4. **Saldo** — suma del ledger.

## Reglas de otorgamiento

- Solo servidor otorga. Cliente no manda el valor.
- Idempotencia en acciones «una vez».
- Retos: al publicar (visible); no al borrador; no se revierten si admin oculta el reto (ajuste solo manual/fraude).
- Barrido: script/RPC admin que recorre hechos existentes y escribe ledger con `origen = backfill` sin duplicar.

## Fuera de alcance

- Canje / tienda.
- Ranking público de empresas.
- Mezclar con score del diagnóstico.
- Usar lavas como gate de EIA.

## Referencias

- `src/lib/app/lavas.ts`, `src/components/app/lavas-chip.tsx`
- Mesa / Llegó: pases y `crm` hechos
- Hermana: `docs/planeacion-retos.md`
- Plan de tareas: `docs/superpowers/plans/2026-11-20-lavas.md`
