-- Cierra la enumeración anónima de cuentas: email_has_account ya no se
-- puede llamar sin sesión. El registro público deja de usarla.
revoke execute on function public.email_has_account(text) from anon;

notify pgrst, 'reload schema';
