# Asistencia y cuenta estilo Luma — diseño

## Objetivo

Separar **lugar en el evento** (RSVP por correo) de **cuenta Observatorio** (login / app / diagnóstico). Multi-sesión. Cupo al confirmar. QR al confirmar aunque no haya cuenta.

## Estados RSVP

| Status | Significado | ¿Descuenta cupo? |
|---|---|---|
| `pending` | Registrado, espera confirmación admin | No |
| `confirmed` | Lugar otorgado | Sí |
| `cancelled` | Liberó el lugar | No |

## Mail

Un solo correo al confirmar: **pase con QR**. Reenviar = mismo pase del RSVP. Sin password. La cuenta es opcional después.

## Matriz de casos

| Caso | Flujo |
|---|---|
| Nuevo sin cuenta | `/registro` → RSVP `pending` → admin confirma → cupo −1 + QR por correo |
| Email ya con cuenta | No crear auth; “Inicia sesión” o claim en `/app` |
| Logueado | `/app/sesiones/[slug]` → Apartar → RSVP `confirmed` + QR |
| Enlace organismo | RSVP con `organization_id` / token; conversión = confirmed atribuido |
| Cupo lleno | No confirma; error claro |
| Multi-evento | Mismo email, N RSVPs (unique email+session) |
| Cancelar | Solo esa sesión; libera cupo |
| Attach cuenta | Liga `profile_id`/`company_id` a RSVPs; no regenera QR si ya existe |
| Legacy | Tablas viejas intactas; backfill a `session_rsvps` |

## Políticas v1

- Registro público → siempre `pending` hasta admin “Confirmar lugar”.
- Claim desde `/app` → `confirmed` si la cuenta ya tiene historial (`admitted_at` o algún RSVP confirmed).
- Disruptors sin quotas sectoriales → `capacity_max`.
- Con `session_sector_quotas` → tope por sector en esa sesión.
