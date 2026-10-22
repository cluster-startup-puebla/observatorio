create or replace function public.create_staff_account(
  staff_email text,
  staff_password text,
  staff_role public.account_role,
  staff_organization_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_id uuid := gen_random_uuid();
  normalized text := lower(trim(staff_email));
  org_id uuid := staff_organization_id;
begin
  if not coalesce(private.is_superadmin(), false) then
    raise exception 'forbidden';
  end if;

  if staff_role not in ('moderador', 'capturista', 'invitador') then
    raise exception 'ese rol no se crea aquí';
  end if;

  if staff_role = 'moderador' then
    org_id := null;
  elsif org_id is null then
    raise exception 'ese rol exige organismo';
  end if;

  if char_length(trim(staff_password)) < 8 then
    raise exception 'Usa al menos 8 caracteres.';
  end if;

  if position('@' in normalized) = 0 or position('.' in split_part(normalized, '@', 2)) = 0 then
    raise exception 'Escribe un correo válido.';
  end if;

  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token,
    is_sso_user,
    is_anonymous
  ) values (
    '00000000-0000-0000-0000-000000000000',
    new_id,
    'authenticated',
    'authenticated',
    normalized,
    extensions.crypt(staff_password, extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    '',
    false,
    false
  );

  insert into auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  ) values (
    gen_random_uuid(),
    new_id,
    jsonb_build_object('sub', new_id::text, 'email', normalized),
    'email',
    normalized,
    now(),
    now(),
    now()
  );

  update public.profiles
  set
    role = staff_role,
    organization_id = org_id,
    email = normalized
  where id = new_id;

  if not found then
    insert into public.profiles (id, role, email, organization_id)
    values (new_id, staff_role, normalized, org_id);
  end if;

  return new_id;
end;
$$;

revoke all on function public.create_staff_account(text, text, public.account_role, uuid)
  from public, anon, authenticated, service_role;
grant execute on function public.create_staff_account(text, text, public.account_role, uuid)
  to authenticated;
