import { Text } from "@react-email/components";
import { mailBrand, publicFacts } from "./brand";
import { PassBlock } from "./pass-block";
import { MailShell } from "./shell";

export function EventPassMail({ sessionLabel }: { sessionLabel: string | null }) {
  return (
    <MailShell preview="Guarda tu pase. En la mesa lo escanean." title="Tu pase ya está listo">
      <Text style={{ margin: "0 0 12px", color: mailBrand.navy, fontSize: 16, lineHeight: "1.5" }}>
        Tu lugar en la sesión ya quedó confirmado. Guarda este código.
      </Text>
      <PassBlock />
      <FactLine sessionLabel={sessionLabel} />
    </MailShell>
  );
}

function FactLine({ sessionLabel }: { sessionLabel: string | null }) {
  return (
    <>
      {publicFacts(sessionLabel).map((fact) => (
        <Text key={fact.label} style={{ margin: "12px 0 0", color: mailBrand.muted, fontSize: 14 }}>
          {fact.label}: {fact.value}
        </Text>
      ))}
    </>
  );
}
