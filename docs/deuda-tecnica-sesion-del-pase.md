# Deuda técnica: el pase y la sesión

## Resuelto parcialmente (RSVP / QR)

El correo de confirmación y la mesa pueden trabajar con el **`rsvp_id`** estable de `session_rsvps` (no regenerar QR al reenviar). El adjunto de cuenta liga `profile_id` en `session_rsvps`; el flujo nuevo ya no depende de password temporal.

## Pendiente en `passes`

La tabla `passes` sigue sin `session_id` ni `rsvp_id` obligatorio: el QR puede vivir en RSVP mientras el detalle admin de pase aún muestra «Sin sesión» si no hay columna guardada.

Orden deseado:

1. Al emitir o sincronizar pase, persistir `session_id` y/o `rsvp_id` en `passes`.
2. El detalle admin enlaza a `/admin/sesiones/[id]`.
3. Pases viejos sin sesión guardada siguen mostrando «Sin sesión».

## Otras lecturas legacy

- `private.sector_occupied_ids` / `sector_is_full` aún mezclan `admitted_at` y CRM para cupo **viejo** por sector; cupo por sesión debe usar `private.session_is_full` + `session_rsvps`.
- `companies.session_interest` es texto libre, no sustituye `session_id` del RSVP.

## Dual-write registro

Ver [rsvp-dual-write.md](../superpowers/notes/rsvp-dual-write.md) (`public_registrations` vs `session_rsvps`).