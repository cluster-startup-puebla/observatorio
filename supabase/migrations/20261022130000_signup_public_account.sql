create or replace function public.signup_public_account(
  account_email text,
  account_password text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_id uuid := gen_random_uuid();
  normalized text := lower(trim(account_email));
begin
  if char_length(trim(account_password)) < 8 then
    raise exception 'password_short';
  end if;

  if position('@' in normalized) = 0 or position('.' in split_part(normalized, '@', 2)) = 0 then
    raise exception 'email_invalid';
  end if;

  if exists (select 1 from auth.users where lower(email) = normalized) then
    raise exception 'already_registered';
  end if;

  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, email_change,
    email_change_token_new, recovery_token, is_sso_user, is_anonymous
  ) values (
    '00000000-0000-0000-0000-000000000000',
    new_id, 'authenticated', 'authenticated', normalized,
    extensions.crypt(account_password, extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(), now(), '', '', '', '', false, false
  );

  insert into auth.identities (
    id, user_id, identity_data, provider, provider_id,
    last_sign_in_at, created_at, updated_at
  ) values (
    gen_random_uuid(), new_id,
    jsonb_build_object('sub', new_id::text, 'email', normalized),
    'email', normalized, now(), now(), now()
  );
end;
$$;

revoke all on function public.signup_public_account(text, text) from public, authenticated, anon;
grant execute on function public.signup_public_account(text, text) to anon, authenticated;
