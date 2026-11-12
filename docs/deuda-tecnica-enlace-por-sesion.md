# Deuda técnica: el enlace sale de la sesión

Hoy, en el inicio del organismo, el sector y la sesión se eligen juntos. El selector de sector no mira la sesión. Muestra `inviteSectors` en `src/lib/sectors.ts`: el catálogo del diagnóstico menos tres nombres fijos (Química, Minerales no metálicos y Tecnología y servicios de TI). Ese recorte es solo de interfaz.

`copySupabaseEventLink` sigue aceptando cualquier sector que exista en la tabla `sectors` y lo amarra a la sesión vigente. El sello del enlace solo identifica al organismo. El sector es la ruta. Con un enlace válido se puede abrir otra ruta de sector y el registro queda ahí, atribuido a ese organismo.

Para esta sesión alcanza. Los tres que no se convocan no aparecen en el selector.

## Orden que debe quedar

1. Primero se elige la sesión.
2. El selector pide los sectores convocados de esa sesión, los de `session_sector_quotas`. Si la sesión no convoca un sector, no aparece.
3. El enlace se genera solo con esa pareja. El servidor rechaza un sector que la sesión no convocó. El sello amarra organismo, sesión y sector, para que cambiar la ruta no registre a la persona en otro sector.

Cuando el selector lea los cupos de la sesión elegida, se borra la lista fija `heldThisSession`.
