alter table public.challenges
  add column if not exists area_note text
  check (
    area_note is null
    or char_length(area_note) between 4 and 160
  );

comment on column public.challenges.area_note is
  'Nota corta obligatoria cuando area = otro.';
