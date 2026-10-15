import type { Metadata } from "next";
import { Backers } from "@/components/landing/sections/backers";
import { Benefits } from "@/components/landing/sections/benefits";
import { Boundaries } from "@/components/landing/sections/boundaries";
import { Faq } from "@/components/landing/sections/faq";
import { Hero } from "@/components/landing/sections/hero";
import { Pipeline } from "@/components/landing/sections/pipeline";
import { Problem } from "@/components/landing/sections/problem";
import { Session } from "@/components/landing/sections/session";
import { StickyCta } from "@/components/landing/sections/sticky-cta";
import { Vision } from "@/components/landing/sections/vision";
import { pageMetadata, siteDescription, siteName } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: siteName,
  description: siteDescription,
  path: "/",
  absolute: true,
});

export default function Home() {
  return (
    <div className="pb-24 lg:pb-0">
      <Hero />
      <Problem />
      <Pipeline />
      <Vision />
      <Benefits />
      <Session />
      <Backers />
      <Boundaries />
      <Faq />
      <section id="registro" className="scroll-mt-24 band-ink py-20">
        <div className="container-site">
          <div className="max-w-2xl">
            <h2 className="text-h2 text-balance">Reserva tu lugar en la sesión de tu sector.</h2>
            <p className="text-body-lg band-ink-muted mt-4">
              Sin costo, con cupo limitado y la confirmación llega cuando el registro quede
              conectado.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a href="/register" className="btn btn-on-dark">
                Reservar mi lugar
              </a>
              <a href="/login" className="text-small band-ink-muted underline underline-offset-4">
                ¿Ya tienes cuenta? Entra
              </a>
            </div>
          </div>
        </div>
      </section>
      <StickyCta />
    </div>
  );
}
