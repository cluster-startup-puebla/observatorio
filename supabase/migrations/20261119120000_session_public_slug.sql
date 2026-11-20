alter table public.sessions
  add column title text,
  add column public_slug text;

update public.sessions
set title = 'Arranque Puebla x Puebla',
    public_slug = '18-11-26-arranque-puebla-x-puebla'
where session_on = date '2026-11-18';

update public.sessions
set title = coalesce(title, venue),
    public_slug = coalesce(
      public_slug,
      to_char(session_on, 'DD-MM-YY') || '-' || trim(both '-' from regexp_replace(lower(venue), '[^a-z0-9]+', '-', 'g'))
    )
where title is null or public_slug is null;

alter table public.sessions
  alter column title set not null,
  alter column public_slug set not null;

alter table public.sessions
  add constraint sessions_public_slug_shape
  check (public_slug ~ '^[0-9]{2}-[0-9]{2}-[0-9]{2}-[a-z0-9]+(?:-[a-z0-9]+)*$');

create unique index sessions_public_slug_idx on public.sessions (public_slug);
