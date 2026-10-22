export const authPaths = [
  "/login",
  "/register",
  "/recuperar",
  "/restablecer",
  "/verificar",
  "/onboarding",
  "/admin",
];

export function isAuthPath(path: string) {
  return authPaths.some((item) => path === item || path.startsWith(`${item}/`));
}
