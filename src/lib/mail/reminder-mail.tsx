import { Text } from "@react-email/components";
import { mailBrand, publicFacts } from "./brand";
import { PassBlock } from "./pass-block";
import { MailShell } from "./shell";

export function ReminderMail({ sessionLabel }: { sessionLabel: string | null }) {
  return (
    <MailShell preview="Mañana es la sesión. Lleva tu pase." title="Mañana nos vemos">
      <Text style={{ margin: "0 0 12px", color: mailBrand.navy, fontSize: 16, lineHeight: "1.5" }}>
        La sesión del Observatorio es mañana. El desayuno está incluido. Lleva el mismo pase que recibiste al confirmar.
      </Text>
      <PassBlock />
      {publicFacts(sessionLabel).map((fact) => (
        <Text key={fact.label} style={{ margin: "12px 0 0", color: mailBrand.muted, fontSize: 14 }}>
          {fact.label}: {fact.value}
        </Text>
      ))}
    </MailShell>
  );
}
