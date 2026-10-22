import { FormAlert } from "@/components/auth/form-alert";
import { PasswordInput } from "@/components/auth/password-input";
import { controlClass, Field } from "@/components/landing/molecules/field";
import { loginAction } from "@/lib/auth/login-action";

export function LoginForm({ error, errorCode }: { error?: string; errorCode?: string }) {
  const fieldError = errorCode === "correo" || errorCode === "contrasena";
  return (
    <form action={loginAction} noValidate className="grid gap-5" data-testid="login">
      <Field id="correo" label="Correo">
        <input
          id="correo"
          name="correo"
          type="email"
          autoComplete="email"
          className={controlClass}
          aria-invalid={errorCode === "correo"}
          aria-describedby={fieldError ? "login-error" : undefined}
        />
      </Field>
      <Field id="contrasena" label="Contraseña">
        <PasswordInput
          id="contrasena"
          name="contrasena"
          label="contraseña"
          autoComplete="current-password"
          ariaInvalid={errorCode === "contrasena"}
          ariaDescribedBy={fieldError ? "login-error" : undefined}
        />
      </Field>
      <div id="login-error">
        <FormAlert message={error} />
      </div>
      <button type="submit" className="btn btn-primary">
        Entrar
      </button>
    </form>
  );
}
