# Planeación de funcionalidad — Observatorio Tecnológico de Puebla

Concepto cerrado el 21 de octubre de 2026. El producto es el Observatorio Tecnológico de Puebla: una empresa reserva lugar en la sesión de su sector, contesta una metodología y descarga su diagnóstico. Lo opera el Clúster de Startups e Innovación. El organismo empresarial convoca. VIA Partners es la firma del estudio T-MEC.

Las reglas de código están en `docs/componentes.md`. La integración paso a paso está en `docs/superpowers/plans/2026-10-21-integracion-observatorio.md`.

## Etapas

1. **Ahora.** Una landing genérica, con la estructura del pizarrón, para validar: objetivo, datos del evento, temas, datos de VIA Partners y la lista de sectores.
2. **Después.** Una landing por sector, con su propio mensaje. La ruta `/{sector}` existe desde la etapa 1 porque el enlace de invitación la usa. En la etapa 1 esa ruta muestra la misma landing y deja el sector seleccionado.

Analítica de contenidos y el módulo de conexiones quedan fuera de la etapa 1. El espacio del organismo sí reserva las tres entradas: tablero, CRM y analítica.

## Roles

| Rol | Alcance |
| --- | --- |
| Superadmin | Control total: contenido, sectores, organismos, personas, cupo, correos masivos y la mesa de registro. |
| Moderador | Opera la mesa de registro. El resto de sus permisos sigue abierto. |
| Empresario | El asistente. Crea su cuenta, llena su perfil, recibe su QR y contesta la metodología. |
| Director del organismo | Dueño de la cuenta del organismo. Configura marca y ve el CRM completo. |
| Capturista | Carga el Excel y captura registros dentro del organismo. |
| Persona que invita | Crea invitaciones y copia la URL del evento. |

El organismo empresarial es una sola cuenta con esas tres personas adentro. Cubre cámara, clúster y el resto de quienes convocan.

## Landing

La principal lista los sectores. No desarrolla el mensaje de cada uno.

| Bloque | Qué muestra |
| --- | --- |
| Objetivo | Para qué es la sesión. |
| Datos del evento | Quinta Real, desayuno, 8:00–12:00, 15 a 30 empresas. |
| Temas | Los temas de la sesión. |
| Datos de VIA Partners | El estudio del T-MEC. |
| Sectores | Cada uno apunta a `/{sector}`. |

Quien llega sin sector elige el suyo al entrar. Quien llega a `/{sector}`, o con el enlace de un organismo, trae el sector ya elegido y se guarda.

## Dos altas, el mismo esqueleto

Organismo y empresario crean primero la cuenta, con correo y contraseña. Después completan el perfil en un onboarding de varios pasos. Sin perfil terminado no hay invitación ni QR.

En todo el onboarding, y otra vez en la metodología, se dice con claridad que la información es estadística, no se comparte y es confidencial.

### Empresario

1. Entra a la landing general, elige sector, o llega ya con sector y referencia.
2. Crea su cuenta.
3. Completa el perfil: sector, tamaño de empresa y el resto de sus datos. Si el sector vino en la ruta o en el enlace, queda seleccionado.
4. Al terminar se crea su QR único y se envía por correo con los detalles del evento.
5. Entra a la metodología.

El cupo de la sesión es de 15 a 30 empresas.

### Organismo

1. Crea su cuenta.
2. Completa nombre, colores y logo. El logo se guarda en Supabase Storage.
3. Al terminar se desbloquea invitar: copiar la URL del evento.
4. Descarga la plantilla de Excel, la llena y la sube. Cada fila entra al CRM.
5. También puede crear una invitación a mano.

La marca del organismo se ve en la landing cuando alguien abre su URL.

La invitación a mano cubre al asesor que llama y la persona dice que sí va. Se capturan los datos básicos, le llega un correo para poner su contraseña, entra y sigue el onboarding. El QR se crea al terminar ese onboarding.

El tablero del organismo, cuando esté armado, abre tres lugares: tablero general, CRM de invitaciones y analítica. En esta etapa se prepara la entrada. La analítica se llena después.

## CRM

El CRM es una lista de personas con un estatus. El estatus lo mueven los hechos, no una persona arrastrando la fila.

| Estatus | Qué lo prende |
| --- | --- |
| Cargado | La fila entró por Excel o por alta manual. |
| Contactado | Alguien del organismo registró el contacto. |
| Confirmó | La persona puso su contraseña. |
| Registrado | Terminó el onboarding. |
| Llegó | En la mesa escanearon su QR. |
| No | Se marcó que no participa. |

La plantilla de Excel trae nombre, empresa y correo. Al subirla, las filas válidas pasan al CRM. Una fila repetida actualiza a la persona, no crea otra.

## Enlace del evento

La persona que invita copia esta URL, y solo después de que el organismo terminó su onboarding. Cada copia se registra.

```text
{dominio}/{sector}?{parCifrado}
```

`{parCifrado}` es el cifrado autenticado del par completo `ref={organismo}`. En la barra no aparece la clave `ref` ni el organismo. Si se altera, la visita no se atribuye.

El par viaja de la landing al alta y al onboarding. La conversión, por organismo y por sector, es registros entre copias. El organismo ve las suyas. El superadmin ve todas.

## Metodología

Después del onboarding, el empresario entra a un cuestionario por secciones. Cada respuesta se guarda en el momento en que la contesta, con un upsert. Cerrar la página no pierde lo ya contestado. Si el guardado falla, se reintenta y la pantalla lo dice.

Un panel, para superadmin y moderador, muestra en vivo quién va llenando y hasta qué pregunta. En el ejercicio anterior la respuesta solo se escribía al pulsar siguiente, sin esperar el resultado, y algunas no quedaron.

El motor sale del proyecto de agro: secciones, pregunta con tipo, opciones, condición para mostrarse y selección múltiple. El reporte sale del mismo proyecto: resultado por sección, nivel y una hoja descargable. Las preguntas de esta etapa son las del ejercicio anterior, como placeholder, hasta cargar el instrumento nuevo.

Placeholder, 19 preguntas en cuatro secciones, de `evaluaicon`:

| Sección | Qué cubre |
| --- | --- |
| Infraestructura y digitalización | Cómo se capturan los datos. |
| Situación del equipo productivo | Maquinaria y paros. |
| Gestión financiera y costos | Costeo y cierre. |
| Operación, paros y calidad | Prioridad de causas de paro. |

Cada sección cierra en Bronce, Plata u Oro, con un riesgo y un reto. El resultado integral usa la misma escala. Al terminar, la persona descarga su diagnóstico.

## Mesa de registro

En el superadmin, y en el moderador, hay una mesa. Se escanea el QR del asistente y la pantalla confirma el acceso: el nombre de la persona y la bienvenida. Ese escaneo prende el estatus Llegó.

## Correo

El envío sale por el SMTP del dominio del Clúster. Las plantillas se arman con React Email.

| Correo | Cuándo |
| --- | --- |
| Contraseña | Invitación a mano o alta que todavía no tiene acceso. |
| QR y detalles del evento | Al terminar el onboarding del empresario. |
| Innovación abierta | El superadmin pulsa un botón y se envía a todos los registrados. |

El botón de innovación abierta es el primer envío masivo. El mismo mecanismo sirve para los correos que sigan.

## Datos

Supabase guarda las cuentas, los perfiles, el CRM, las respuestas y los archivos. En Storage viven el logo del organismo y el archivo del QR.

## Fuera de esta etapa

- Mensaje distinto por sector.
- Contenido de analítica.
- Módulo de conexiones: escanear el QR de otra persona y hacer match. Queda oculto.
- Reporte en `v` y CSV del pizarrón. Sigue sin formato ni dueño.

## Dudas abiertas

- Qué puede hacer cada persona del organismo, además de lo escrito arriba, y qué más puede hacer el moderador fuera de la mesa.
- Si el estatus Llegó es solo el escaneo en la mesa.
- Si el QR de una invitación telefónica puede existir antes de terminar el onboarding.
- Si el Excel se queda en nombre, empresa y correo.
- Si el diagnóstico placeholder se entrega en Bronce, Plata y Oro hasta que llegue el instrumento nuevo.

## Transcripción del pizarrón

Dos fotos del mismo pizarrón, título **ObservaTono**. «vPartner» y «vPSP» fueron un error de escritura. El nombre correcto es VIA Partners.

### Foto 1 — participante

1. **Landing.** Objetivo, datos del evento, temas, datos vPartner.
2. **Registro.** Sign up, formulario vPSP, lista de lo que tienen y lo que desean, cupo limitado. Descarga de reporte (`v` y CSV). Correo de confirmación, detalles del evento y QR.
3. **Login.**
4. **Formulario** adecuado por sector.
5. **Diagnóstico** de descargas.
6. **Analítica.** Dashboard, próximamente.

### Foto 2 — organismo

1. **Landing.** `/sector`.
2. **Registro.** Sign up, formulario de logo, links de traza, carga de contenido para descargar.
3. **CRM.** Base de registros, crear registro, carga Excel.
6. **Analítica.** Próximamente.
