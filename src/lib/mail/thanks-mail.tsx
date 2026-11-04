import { Text } from "@react-email/components";
import { mailBrand, publicFacts } from "./brand";
import { MailShell } from "./shell";

export function ThanksMail({ sessionLabel }: { sessionLabel: string | null }) {
  return (
    <MailShell preview="Gracias por venir a la sesión." title="Gracias por venir">
      <Text style={{ margin: "0 0 12px", color: mailBrand.navy, fontSize: 16, lineHeight: "1.5" }}>
        Tu participación ya cuenta para el mapa del sector. En unos días te escribimos con el seguimiento.
      </Text>
      {publicFacts(sessionLabel).map((fact) => (
        <Text key={fact.label} style={{ margin: "8px 0 0", color: mailBrand.muted, fontSize: 14 }}>
          {fact.label}: {fact.value}
        </Text>
      ))}
    </MailShell>
  );
}
