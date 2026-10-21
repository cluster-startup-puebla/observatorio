# Avance — integración del Observatorio

Registro para retomar si el trabajo se corta. Rama: `cursor/integracion-observatorio-c6bf`.

## Cómo retomar

1. `git status` y el último commit de esta rama.
2. La integración de este plan ya está en verde: `npm test` (54) y `npm run test:e2e` (18).
3. No abrir la etapa siguiente si el e2e de la actual falla.
4. Cada tarea es un commit, sin `Co-authored-by` de Cursor.

## Decisiones

- Las pruebas del plan se conservan y se agregan rechazos, bordes y entradas vacías. No se inventan reglas de negocio nuevas.
- La UI nueva usa la landing: `container-site`, `Kicker`, `text-h1`/`text-h2`/`text-body-lg`, `text-ink`, `border-line`, `btn`, `Field` y `controlClass`. Archivo para títulos, Raleway para el cuerpo. Claro y oscuro siguen en `data-theme`.
- Los llamados «Reservar mi lugar» de la landing se quedan (encabezado, hero y cierre). El e2e de onboarding usa el primero porque la landing ya tiene varios.
- El archivo `cluster/evaluaicon/.../evaluation-data.ts` no está en este repo ni en los repos accesibles de la organización. El instrumento cumple el contrato del plan: 18 preguntas, `a=1` `b=2` `c=4` `d=6`, prioridad por la severidad del rango 1, piso 18 Bronce, techo 108 Oro, fuera de rango `Sin categoría`.
- Playwright corre con `workers: 1` para que el directory en memoria no se pise entre specs. `POST /test/reset` solo existe con `DIRECTORY=memory`.
- El dev server de Playwright usa `127.0.0.1`. `allowedDevOrigins` deja pasar los recursos de desarrollo y el `<html>` declara `data-scroll-behavior="smooth"`.
- Guardar una respuesta o cargar un archivo no puede depender de que el clic ocurra antes de hidratar. El formulario usa la acción de servidor. Un listener en `document` envía el formulario al cambiar el radio o el archivo, y el e2e espera `data-testid` de que ese listener ya está.
- Leer `cookies()` durante el refresh de una acción que solo regresa estado rompe el render en este Next. El empresario, la mesa, el correo y la carga de invitaciones cierran con `redirect()`. La tabla del CRM vive en la página `/organismo/crm`, porque el layout cacheaba la lista vacía.

## Tareas

| Tarea | Estado | Commit | Notas |
| --- | --- | --- | --- |
| 0.1 Vitest | hecho | 92484ed | vitest@3.2.4 porque vitest 5 choca con @types/node 20 |
| 0.2 Playwright | hecho | 8ec3b81 | workers 1; chromium instalado |
| 1.1 Permisos | hecho | 92c1bd9 | matriz completa de rol por acción |
| 1.2 CRM | hecho | cc1eb5d | rechazos desde null, doble carga y estados cerrados |
| 1.3 Sector | hecho | ad50863 | la ruta gana, el nombre no es slug, enlace de reserva |
| 1.4 Enlace | hecho | 4b8361b | token vacío, truncado, acentos y secreto oculto |
| 1.5 Excel | hecho | 1bcb543 | encabezado con espacios, correo en mayúsculas y hoja vacía |
| 1.6 Diagnóstico | hecho | febf665 | instrumento local: el archivo del ejercicio anterior no está en el repo |
| 2.1 Landing | hecho | ae1f9ba | testids sobre la landing existente; varios CTA se conservan |
| 3.1 Directory | hecho | 106cfe9 | respuestas por persona, QR solo al terminar, correo duplicado no crea otra cuenta |
| 3.2 Onboarding | hecho | c0965bc | aviso exacto, sector de la ruta, pase al terminar; contraseña corta y tamaño vacío no abren el QR |
| 4.1 CRM directory | hecho | 5c6e921 | repetidos, filas inválidas y token alterado no atribuyen |
| 4.2 Organismo | hecho | 55555d5 | plantilla, fila Cargado, analítica «Próximamente»; un CSV solo con encabezado no inventa filas |
| 5.1 Metodología | hecho | 4277f49 | la primera respuesta sobrevive al recargar; 17 veces «a» más prioridad de materiales es Bronce |
| 6.1 Mesa | hecho | 53f77fc | segundo escaneo no retrocede; el invitado sin perfil no recibe correo |
| 6.2 E2E mesa | hecho | d2846b3 | saludo a Ana López, código vacío o desconocido, segundo escaneo inválido, un correo encolado |
