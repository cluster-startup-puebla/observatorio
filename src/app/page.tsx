import type { Metadata } from "next";
import { ProgramHome } from "@/components/program/program-home";
import { redirectIfSession } from "@/lib/auth/redirect-if-session";
import { pageMetadata } from "@/lib/metadata";

export const instant = false;

export const metadata: Metadata = pageMetadata({
  title: "Puebla x Puebla · Levantamiento de necesidades tecnológicas",
  description:
    "Las empresas de Puebla declaran sus necesidades tecnológicas y startups y equipos de desarrollo construyen la solución, validada con ellas. Una iniciativa del Observatorio Tecnológico de Puebla y el Clúster de Startups e Innovación.",
  path: "/",
  absolute: true,
});

export default async function Home() {
  await redirectIfSession("/");
  return <ProgramHome />;
}
