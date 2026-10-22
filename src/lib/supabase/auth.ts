export function roleForSignup(requested: string) {
  if (requested === "director") return "director";
  return "empresario";
}
