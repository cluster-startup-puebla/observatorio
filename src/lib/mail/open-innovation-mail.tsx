import { Button, Text } from "@react-email/components";
import { mailBrand } from "./brand";
import { MailShell } from "./shell";

export function OpenInnovationMail({ acceptHref }: { acceptHref: string }) {
  return (
    <MailShell preview="Una pregunta del Observatorio." title="¿Quieres ser una empresa de innovación abierta?">
      <Text style={{ margin: "0 0 16px", color: mailBrand.navy, fontSize: 16, lineHeight: "1.5" }}>
        Si aceptas, el Observatorio puede escribirte para contarte cómo sumarte. Este permiso no publica tu empresa.
      </Text>
      <Button
        href={acceptHref}
        style={{
          display: "inline-block",
          backgroundColor: mailBrand.pink,
          color: mailBrand.white,
          padding: "12px 20px",
          borderRadius: 999,
          fontWeight: 700,
        }}
      >
        Sí, pueden contactarme
      </Button>
    </MailShell>
  );
}
