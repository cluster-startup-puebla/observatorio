import { logoutAction } from "@/lib/auth/logout-action";

export function AuthLogout() {
  return (
    <form action={logoutAction}>
      <button type="submit" className="text-link">
        Cerrar sesión
      </button>
    </form>
  );
}
