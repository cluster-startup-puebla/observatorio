alter table public.profiles
  add column email text;

alter table public.profiles
  add constraint profiles_email_lowercase check (email is null or email = lower(email)),
  add constraint profiles_email_shape check (
    email is null or email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  );

create unique index profiles_email_key on public.profiles (email) where email is not null;
