import { connection, NextResponse } from "next/server";
import { metodologiaReloadCookie } from "@/lib/auth/metodologia-reload";

export const instant = false;

export async function GET(request: Request) {
  await connection();
  const response = NextResponse.redirect(new URL("/onboarding", request.url));
  response.cookies.set(metodologiaReloadCookie, "", { path: "/", maxAge: 0, sameSite: "lax" });
  return response;
}
