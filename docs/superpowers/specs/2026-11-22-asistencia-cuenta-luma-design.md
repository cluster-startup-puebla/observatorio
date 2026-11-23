# Asistencia y cuenta estilo Luma — diseño

## Objetivo

Separar tres cosas:

1. **Lugar en el evento** (RSVP por correo) — cupo + QR  
2. **Cuenta Observatorio** — login / entrar al sistema  
3. **Cuenta verificada** — el superadmin marca la empresa; desbloquea **diagnósticos** y el resto del producto “serio”

Multi-sesión. Cupo al confirmar RSVP. QR al confirmar aunque no haya cuenta.

## Verificación de cuenta (Yamil)

Copy de producto: **verificada**, no “aprobada” (aprobada se confunde con el lugar del evento).

| Estado | Qué puede hacer |
|---|---|
| Sin cuenta | RSVP + recibir pase QR |
| Cuenta sin verificar | Crear cuenta, entrar a `/app`, ver perfil/empresa/sesiones, apartar lugar si aplica |
| Cuenta **verificada** (`companies.admitted_at` o flag equivalente) | Diagnósticos / metodología / lavas / lo que el producto reserve a verificados |

Quién verifica: **superadmin** (cola Empresas / path pending). No es el organismo quien “verifica la cuenta” para diagnóstico (el org sigue en el embudo CRM del enlace).

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
- Claim desde `/app` → `confirmed` si la cuenta ya tiene historial (verificada **o** algún RSVP confirmed). Verificación ≠ requisito del claim si ya tiene RSVP; sí es requisito de diagnóstico.
- Disruptors sin quotas sectoriales → `capacity_max`.
- Con `session_sector_quotas` → tope por sector en esa sesión.
- Gate diagnóstico: sin verificación → pantalla “Tu cuenta está en revisión” / CTA clara; no redirigir a limbo de onboarding de cupo.
