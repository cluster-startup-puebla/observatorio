# Deuda técnica: filtro de la lista de retos

En `/app/challenges` la lista del empresario **excluye por query** los retos `cerrado` y `oculto` (`loadMyChallenges` → `.in("status", ["borrador", "publicado"])`).

Eso es un corte fijo, no un filtro de UI.

## Lo que falta

- Controles en la lista (pills / select) para ver activos, cerrados, ocultos por moderación, o todos.
- Conservar el default en «activos» (`borrador` + `publicado`).
- Contadores por estado si hacen falta.

Hasta entonces, cerrar u ocultar un reto lo saca de la lista sin forma de recuperarlo desde la app (solo admin puede re-publicar los `oculto`).
