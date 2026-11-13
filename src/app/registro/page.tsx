import type { Metadata } from "next";
import { AuthBack } from "@/components/auth/auth-back";
import { Kicker } from "@/components/landing/atoms/kicker";
import { SessionFacts } from "@/components/landing/sections/session-facts";
import { forumKicker, forumName } from "@/content/forum-public";
import { pageMetadata } from "@/lib/metadata";
import { RegistroForm } from "./registro-form";

const heading = `Desayuno ${forumName}`;

export const metadata: Metadata = pageMetadata({
  title: "Desayuno Foro Puebla x Puebla",
  description: "Regístrate al desayuno. Sin cuenta.",
  path: "/registro",
});

export const instant = false;

type Search = Promise<Record<string, string | string[] | undefined>>;

export default async function RegistroPage({ searchParams }: { searchParams: Search }) {
  const params = await searchParams;
  const sector = typeof params.sector === "string" ? params.sector : undefined;
  const invitacion = typeof params.invitacion === "string" ? params.invitacion : undefined;

  return (
    <div className="container-site py-6 lg:py-10">
      <AuthBack />
      <header className="mt-8 grid gap-3">
        <Kicker>{forumKicker}</Kicker>
        <h1 className="text-h1 text-balance text-ink">{heading}</h1>
      </header>
      <SessionFacts />
      <div className="mt-10 max-w-3xl">
        <RegistroForm sector={sector} invitacion={invitacion} />
      </div>
    </div>
  );
}
