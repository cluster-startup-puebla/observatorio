-- El índice único de una sola vigente ya no existe (20261022210000).
-- Quedan activas Disruptors y Arranque Puebla x Puebla.
update public.sessions
set is_current = true
where public_slug in (
  '28-11-26-disruptors-2026',
  '18-11-26-arranque-puebla-x-puebla'
);
