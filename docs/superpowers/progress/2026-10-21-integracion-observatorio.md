# Avance — integración del Observatorio

Registro para retomar si el trabajo se corta. Rama: `cursor/integracion-observatorio-c6bf`.

## Cómo retomar

1. `git status` y el último commit de esta rama.
2. La siguiente tarea pendiente está marcada abajo.
3. No abrir la etapa siguiente si el e2e de la actual falla.
4. Cada tarea es un commit, sin `Co-authored-by`.

## Decisiones

- Las pruebas del plan se conservan y se agregan rechazos, bordes y entradas vacías. No se inventan reglas de negocio nuevas.
- La UI nueva usa la landing: `container-site`, `Kicker`, `text-h1`/`text-h2`/`text-body-lg`, `text-ink`, `border-line`, `btn`, `Field` y `controlClass`. Archivo para títulos, Raleway para el cuerpo. Claro y oscuro siguen en `data-theme`.
- Los llamados «Reservar mi lugar» de la landing se quedan (encabezado, hero y cierre). El e2e de onboarding usa el primero porque la landing ya tiene varios.
- El archivo `cluster/evaluaicon/.../evaluation-data.ts` no está en este repo ni en los repos accesibles de la organización. El instrumento cumple el contrato del plan: 18 preguntas, `a=1` `b=2` `c=4` `d=6`, prioridad por la severidad del rango 1, piso 18 Bronce, techo 108 Oro, fuera de rango `Sin categoría`.
- Playwright corre con `workers: 1` para que el directory en memoria no se pise entre specs. `POST /test/reset` solo existe con `DIRECTORY=memory`.

## Tareas

| Tarea | Estado | Commit | Notas |
| --- | --- | --- | --- |
| 0.1 Vitest | hecho | 92484ed | vitest@3.2.4 porque vitest 5 choca con @types/node 20 |
| 0.2 Playwright | pendiente | | |
| 1.1 Permisos | hecho | 6d43e89 | matriz completa de rol por acción |
| 1.2 CRM | hecho | ad42cb0 | rechazos desde null, doble carga y estados cerrados |
| 1.3 Sector | hecho | 72d4665 | la ruta gana, el nombre no es slug, enlace de reserva |
| 1.4 Enlace | hecho | e991e9d | token vacío, truncado, acentos y secreto oculto |
| 1.5 Excel | hecho | e3e7f8d | encabezado con espacios, correo en mayúsculas y hoja vacía |
| 1.6 Diagnóstico | pendiente | | |
| 2.1 Landing | pendiente | | |
| 3.1 Directory | pendiente | | |
| 3.2 Onboarding | pendiente | | |
| 4.1 CRM directory | pendiente | | |
| 4.2 Organismo | pendiente | | |
| 5.1 Metodología | pendiente | | |
| 6.1 Mesa | pendiente | | |
| 6.2 E2E mesa | pendiente | | |
