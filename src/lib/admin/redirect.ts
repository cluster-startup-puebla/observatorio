import { NextResponse, type NextRequest } from "next/server";

export function redirectTo(request: NextRequest, path: string) {
  const host = request.headers.get("host") ?? request.nextUrl.host;
  const proto = request.nextUrl.protocol.replace(":", "") || "http";
  return NextResponse.redirect(new URL(path, `${proto}://${host}`), 303);
}
