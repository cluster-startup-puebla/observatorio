import type { Metadata } from "next";
import { LegalArticle } from "@/components/legal/legal-article";
import { PrivacyRights } from "@/components/legal/privacy-rights";
import { PrivacyTreatment } from "@/components/legal/privacy-treatment";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Aviso de privacidad",
  description:
    "Aviso de privacidad integral del Observatorio Tecnológico de Puebla, conforme a la ley federal de datos personales.",
  path: "/aviso-de-privacidad",
});

export default function PrivacyPage() {
  return (
    <LegalArticle title="Aviso de privacidad" updated="15 de octubre de 2026">
      <PrivacyTreatment />
      <PrivacyRights />
    </LegalArticle>
  );
}
