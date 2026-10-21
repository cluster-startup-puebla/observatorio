import { cookies } from "next/headers";

const accountCookie = "observatorio-account";

export async function readAccountId() {
  return (await cookies()).get(accountCookie)?.value ?? null;
}

export async function writeAccountId(id: string) {
  (await cookies()).set(accountCookie, id, { httpOnly: true, sameSite: "lax", path: "/" });
}
