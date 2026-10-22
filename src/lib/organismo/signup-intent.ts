import { cookies } from "next/headers";

const intentCookie = "org-intent";

export async function writeOrgIntent() {
  (await cookies()).set(intentCookie, "1", { httpOnly: true, sameSite: "lax", path: "/" });
}

export async function readOrgIntent() {
  return (await cookies()).get(intentCookie)?.value === "1";
}

export async function clearOrgIntent() {
  (await cookies()).delete(intentCookie);
}
