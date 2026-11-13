# Deuda técnica: el pase no sabe de qué sesión sale

El QR se guarda en `passes` con `profile_id`, `image_asset_id` e `issued_at`. No hay `session_id`. El correo `event_pass` puede llevar `outbox_messages.session_id`, pero al encolarlo no se llena. `companies.session_interest` es texto libre de qué le interesa a la persona, no la sesión del evento.

Hoy hay una sola sesión vigente. Usarla como si fuera la del pase sería una suposición. Con dos vigentes, el detalle mentiría.

El detalle del pase muestra «Sin sesión» a propósito. No consulta la sesión vigente para rellenar ese hueco.

## Orden que debe quedar

1. Al emitir el pase se guarda la sesión a la que pertenece.
2. El detalle lee esa sesión y enlaza a `/admin/sesiones/[id]`.
3. Un pase viejo, sin sesión guardada, sigue diciendo «Sin sesión».
