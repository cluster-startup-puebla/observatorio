import { headers } from "next/headers";

export async function publicOrigin() {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-host") ?? headerList.get("host");
  const host = forwarded?.split(",")[0]?.trim();
  if (!host) return null;

  const forwardedProto = headerList.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const local = host.startsWith("localhost") || host.startsWith("127.0.0.1");
  const proto = forwardedProto || (local ? "http" : "https");
  return new URL(`${proto}://${host}`);
}
