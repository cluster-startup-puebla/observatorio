-- Solo una sesión vigente (sessions_one_current_idx).
update public.sessions
set is_current = false
where is_current = true;

update public.sessions
set is_current = true
where public_slug = '28-11-26-disruptors-2026';
