import type { Metadata } from "next";
import { ReadingDock } from "@/components/diagnostico/reading-dock";
import { contents } from "@/components/diagnostico/tmec/contents";
import { Definicion } from "@/components/diagnostico/tmec/definicion";
import { DocHero } from "@/components/diagnostico/tmec/doc-hero";
import { DocIndex } from "@/components/diagnostico/tmec/doc-index";
import { Dual } from "@/components/diagnostico/tmec/dual";
import { EstadosUnidos } from "@/components/diagnostico/tmec/estados-unidos";
import { Estrategia } from "@/components/diagnostico/tmec/estrategia";
import { Industrias } from "@/components/diagnostico/tmec/industrias";
import { Informacion } from "@/components/diagnostico/tmec/informacion";
import { Retos } from "@/components/diagnostico/tmec/retos";
import { Tratados } from "@/components/diagnostico/tmec/tratados";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Puebla ante el T-MEC",
  description:
    "Análisis de VIA Partners para Puebla x Puebla. Resumen del diagnóstico ante el T-MEC, con las gráficas del documento.",
  path: "/diagnostico-tmec-puebla",
});

export default function DiagnosticoTmecPage() {
  return (
    <article className="doc-page">
      <ReadingDock sections={contents} />
      <DocHero />
      <DocIndex />
      <Definicion />
      <Dual />
      <EstadosUnidos />
      <Industrias />
      <Tratados />
      <Retos />
      <Informacion />
      <Estrategia />
    </article>
  );
}
