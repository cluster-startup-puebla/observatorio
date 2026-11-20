# Deuda técnica: la traza de la evaluación

Empresa ya muestra el cierre de la metodología: la medalla, de dónde sale la nota, el lugar en el sector, el pentágono, la operación y los siguientes pasos. Esos pasos salen de las respuestas guardadas y de la hoja de ruta del sector. No se guardan aparte.

`methodology_v2_runs` tiene una sola fila por perfil. Cerrar otra evaluación pisa `answers`, `score` y `finished_at`. Se pierde la anterior y, con ella, las acciones que se le mostraron ese día.

## Lo que ya queda listo

`evaluationTrace` en `src/lib/app/evaluation-trace.ts` arma la foto que habría que conservar:

- cuándo cerró y con qué instrumento
- la banda y la nota de conjunto
- las acciones, en el mismo orden y con el mismo corte que «Siguientes pasos»: señal, paso suelto, en la empresa (capa A) y con la región (capa B)

`loadCompanyHome` ya la calcula en `result.trace` cada vez que entra a Empresa. No la escribe.

## Lo que falta

Al cerrar una evaluación, insertar esa foto en una tabla nueva, una fila por cierre, sin pisar las anteriores. Empresa lee la última para el resultado y puede listar las previas. Hasta entonces no hay historial: solo la evaluación que está viva en `methodology_v2_runs`.
