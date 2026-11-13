export const authPaths = [
  "/login",
  "/register",
  "/crear-cuenta",
  "/registro",
  "/recuperar",
  "/restablecer",
  "/verificar",
  "/onboarding",
  "/metodologia",
  "/admin",
];

export function isAuthPath(path: string) {
  return authPaths.some((item) => path === item || path.startsWith(`${item}/`));
}
