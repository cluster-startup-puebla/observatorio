create or replace function public.confirm_login_email(account_email text, account_password text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized text := lower(trim(account_email));
  found_id uuid;
  found_hash text;
begin
  if char_length(coalesce(account_password, '')) < 8 or position('@' in normalized) = 0 then
    return false;
  end if;

  select id, encrypted_password into found_id, found_hash
  from auth.users
  where lower(email) = normalized;

  if found_id is null or found_hash is null then
    return false;
  end if;
  if found_hash <> extensions.crypt(account_password, found_hash) then
    return false;
  end if;

  update auth.users
  set email_confirmed_at = coalesce(email_confirmed_at, now())
  where id = found_id;
  return true;
end;
$$;

revoke all on function public.confirm_login_email(text, text) from public, anon, authenticated;
grant execute on function public.confirm_login_email(text, text) to anon, authenticated;
