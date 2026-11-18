import { cookies } from "next/headers";

export const accountCookie = "observatorio-account";

const accountCookieOptions = { httpOnly: true, sameSite: "lax" as const, path: "/" };

export async function readAccountId() {
  return (await cookies()).get(accountCookie)?.value ?? null;
}

export async function writeAccountId(id: string) {
  (await cookies()).set(accountCookie, id, accountCookieOptions);
}

export async function clearAccountId() {
  (await cookies()).delete(accountCookie);
}
