# Registro público y RSVPs (dual-write)

## Dos tablas, un lugar por sesión

| Tabla | Rol hoy |
|---|---|
| `public_registrations` | Formulario `/registro` por correo; fila histórica y cola admin “Confirmar lugar”. |
| `session_rsvps` | **Fuente de verdad del cupo** por `(email, session_id)` con `status` (`pending` / `confirmed` / `cancelled`). |

Al registrar o confirmar desde admin, el flujo **sigue escribiendo** `public_registrations` y **sincroniza** la fila equivalente en `session_rsvps`. No hay `DROP` en v1: el backfill (`20261123050100`) copió lo completado; las lecturas nuevas de cupo y conversiones prefieren `session_rsvps`.

## Qué leer según pantalla

- **Cupo / conversiones / tablero RSVP:** `session_rsvps` con `status = confirmed`.
- **Lista legacy de registros públicos:** aún puede leer `public_registrations` hasta migrar cada pantalla.
- **Cuenta verificada (`companies.admitted_at`):** solo gate de diagnóstico/metodología; **no** descuenta cupo.

## Huérfanos

Puede haber filas en `public_registrations` sin RSVP (pre-migración o error de sync). El plan de asistencia pide auditar `count(completed)` ≤ RSVPs mapeados antes de apagar lecturas legacy.