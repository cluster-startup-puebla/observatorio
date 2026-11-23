-- Arranque Puebla x Puebla (Quinta Real) ya pasó.
update public.sessions
set is_current = false
where public_slug = '18-11-26-arranque-puebla-x-puebla';

update public.sessions
set is_current = true
where public_slug = '28-11-26-disruptors-2026';
