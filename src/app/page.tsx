import type { Metadata } from "next";
import { PortalHome } from "@/components/landing/portal-home";
import { redirectIfSession } from "@/lib/auth/redirect-if-session";
import { pageMetadata } from "@/lib/metadata";

export const instant = false;

export const metadata: Metadata = pageMetadata({
  title: "Puebla x Puebla · Ecosistema de innovación",
  description:
    "Estrategia de vinculación del ecosistema de innovación del Estado de Puebla. Observatorio tecnológico y Startups B2B.",
  path: "/",
  absolute: true,
});

export default async function Home() {
  await redirectIfSession("/");
  return <PortalHome />;
}
