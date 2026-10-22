import { redirect } from "next/navigation";

export function signupErrorCode(message: string) {
  const known = message.toLowerCase();
  if (known.includes("already") || known.includes("registered") || known.includes("unique")) return "existe";
  if (known.includes("password")) return "contrasena";
  if (known.includes("rate limit")) return "limite";
  return "auth";
}

export function signupBack(sector: string, code: string): never {
  const query = new URLSearchParams({ cuenta: "organismo", error: code });
  if (sector) query.set("sector", sector);
  redirect(`/register?${query.toString()}`);
}
