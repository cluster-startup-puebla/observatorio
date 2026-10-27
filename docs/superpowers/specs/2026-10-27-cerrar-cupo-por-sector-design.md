# Cerrar el cupo por sector

## Problema

`session_sector_quotas.capacity` es una etiqueta. El empresario termina su perfil, el organismo acepta el enlace y el superadmin acepta el alta externa sin leer ese número. Con 20 lugares y 22 aceptados, el tablero muestra «22 de 20» y el registro sigue abierto.

## Regla

Un lugar se ocupa cuando alguien acepta, y se suelta cuando el empresario cancela.

- El empresario siempre puede terminar el onboarding. Si nadie lo ha aceptado, sigue en espera y no resta cupo.
- El organismo acepta un registro por enlace con `approve_link_signup`. El superadmin acepta un alta de la landing (`sector_source = path`) con `approve_external_signup`.
- Esas dos funciones, en la misma transacción, bloquean la fila de cupo de la sesión vigente y cuentan los lugares ya ocupados. Si el conteo ya es el cupo, la función lanza `sector_lleno` y no acepta.
- Un sector sin fila de cupo en la sesión vigente no se bloquea. No se inventa un límite.
- Quien ya estaba aceptado antes de este cierre se queda. Si el sector ya va arriba del cupo, no entra nadie más hasta que una cancelación baje el conteo.

El lugar cuenta si la empresa es de ese sector, el perfil es empresario con onboarding terminado, no hay cancelación, y además:

- llegó por enlace y su contacto `enlace` está en `confirmo`, `registrado` o `llego`, o
- llegó por la landing y `companies.admitted_at` ya tiene fecha.

## Aviso de lleno

El organismo, en `/{slug}/crm`, y el superadmin, en `/admin/empresas/[id]` y en `/admin/crm/[id]`, ven un `Alert`: «Este sector ya está lleno. La persona sigue en espera.» La persona no cambia de estado.

## Indicador del organismo

En el detalle del sector del panel (`/{slug}?corte={sector}`), para la sesión vigente:

- Barra con dos tramos: los aceptados de ese organismo y los aceptados de los demás.
- Texto `15/20 · 5 lugares`.
- Quien sigue en espera no entra en el número.
- Sin cupo para ese sector, el texto es «Esta sesión no tiene cupo para este sector.»

«De este organismo» es la empresa cuyo contacto `enlace` pertenece a ese organismo. El resto de los ocupados, incluidas las altas de la landing, va en el otro tramo. Una empresa cuenta una sola vez en el total.

## Cancelación

El empresario que ya ocupa lugar escribe por qué cancela. El texto es obligatorio, recortado, de 1 a 280 caracteres. Se guarda en `attendance_cancellations` y esa empresa deja de ocupar. Nadie de la espera entra solo: el organismo o el superadmin acepta a mano, y ahí vuelve a correr la misma regla de lleno.

Quien todavía está en espera no ve el formulario. Cancelar no rebobina el CRM ni borra la empresa.

## Fuera de este diseño

- Lista de espera con turno automático.
- Cerrar el onboarding antes de terminarlo.
- Amarrar la empresa a `session_id`. El conteo usa la sesión `is_current`.
- Impedir la llegada en mesa o cambiar el embudo de Excel.
- Bajar de golpe a quien ya dejó el sector por encima del cupo.
- El directorio en memoria. La app viva usa Supabase.
