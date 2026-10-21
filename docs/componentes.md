# Componentes y código

Reglas para construir el Observatorio. La estructura visual sale de las pantallas de ordina-panel. La tabla sale de `rocka-web-client`. El motor de preguntas y el reporte salen del levantamiento de agro. Este proyecto no usa Keystone ni Apollo.

## Cómo se parte una pantalla

Una pantalla se lee de arriba hacia abajo. Cada pieza tiene un trabajo.

| Pieza | Trabajo |
| --- | --- |
| Página | Server Component. Lee datos y compone. No lleva estado de interacción. |
| Encabezado | Título, ruta y la acción principal. |
| Lista | Pide los datos, muestra carga, vacío o la tabla. |
| Tabla | Pinta filas. La paginación viene del servidor. |
| Detalle | Ficha de la entidad y, si hay relaciones, pestañas. |
| Formulario | Un paso o un campo. No el flujo completo. |

El detalle sigue el orden de ordina: ficha primero, error antes del contenido, pestañas después. Cada pestaña recibe el id del padre y filtra su lista.

## Tabla

La tabla reutilizable recibe datos, columnas y paginación. No busca sola en el cliente.

- Página, total y tamaño los manda quien la usa.
- Puede seleccionar filas y avisar la selección.
- Puede pintar una tarjeta en lugar de la fila cuando la pantalla es angosta.
- Tiene estado de carga y estado vacío.
- El clic de la fila no se mezcla con el clic del checkbox.

CRM, invitaciones y el panel de la metodología usan esta tabla.

## Preguntas

Las preguntas son datos, no pantallas. Una sección tiene id, título y una lista de preguntas. Una pregunta tiene id, tipo, texto, opciones y, si aplica, la condición para mostrarse.

Tipos de esta etapa: texto, una opción, varias opciones y prioridad.

El componente de pregunta pinta una. El asistente del formulario avanza de sección. Ninguno calcula el diagnóstico. Eso es una función pura: entra el instrumento y las respuestas, sale el nivel por sección y el nivel integral.

Cada respuesta se persiste al contestarla. La pantalla de la sesión escucha los cambios y muestra el avance. No se espera al botón de siguiente para guardar.

## Límites

- Un componente que pasa de 120 líneas se parte.
- Una función hace una cosa y no toca la red ni el estado de React.
- La red, el cifrado, el Excel, el puntaje y los estatus viven en funciones puras o en módulos de servidor, aparte del componente.
- El navegador no escribe directo en tablas privilegiadas. Escribe por una acción de servidor o una ruta.
- El logo y el QR se suben a Supabase Storage. El componente pide la subida. No arma la política del bucket.

## Dónde vive cada cosa

```text
src/app/                  páginas y rutas
src/components/ui/        piezas visuales sin negocio
src/components/           composición de una pantalla
src/lib/                  funciones puras y acceso a datos
```

Una pantalla no importa el cliente de Supabase para decidir un estatus, un puntaje o si un enlace es válido. Eso regresa ya resuelto desde el servidor.
