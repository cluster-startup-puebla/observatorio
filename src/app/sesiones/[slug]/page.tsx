import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EventLanding } from "@/components/landing/event-landing";
import { pageMetadata } from "@/lib/metadata";
import { sessionBySlug } from "@/lib/sessions/load-public";
import { sessionPath } from "@/lib/sessions/public-path";

export const instant = false;

type SessionPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: SessionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const session = await sessionBySlug(slug);
  const description = session
    ? `${session.title}. ${session.venue}.`
    : "Sesión del Observatorio Tecnológico de Puebla.";
  return pageMetadata({
    title: session?.title ?? "Sesión",
    description,
    path: sessionPath(slug),
  });
}

export default async function SessionPage({ params }: SessionPageProps) {
  const { slug } = await params;
  const session = await sessionBySlug(slug);
  if (!session) notFound();
  return <EventLanding sessionSlug={session.publicSlug} />;
}
