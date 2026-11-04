import { Text } from "@react-email/components";
import { mailBrand } from "./brand";
import { MailShell } from "./shell";

export function OpenInnovationMail() {
  return (
    <MailShell preview="Una pregunta del Observatorio." title="¿Quieres ser una empresa de innovación abierta?">
      <Text style={{ margin: 0, color: mailBrand.navy, fontSize: 16, lineHeight: "1.5" }}>
        Responde a este correo y te contamos cómo sumarte. El mapa del Observatorio ya tiene tu sector.
      </Text>
    </MailShell>
  );
}
