import { Button, Text } from "@react-email/components";
import { mailBrand } from "./brand";
import { continueHref as loginHref } from "./continue-href";
import { MailShell } from "./shell";

export function WelcomeMail({ continueHref }: { continueHref: string | null }) {
  const href = continueHref ?? loginHref(undefined);
  return (
    <MailShell
      preview="Diagnóstico, innovación abierta, sesiones y tecnología para tu empresa."
      title="Tu cuenta ya está lista"
    >
      <Text style={{ margin: "0 0 16px", color: mailBrand.navy, fontSize: 16, lineHeight: "1.5" }}>
        Con tu cuenta puedes hacer el diagnóstico de tu sector, participar en programas de innovación abierta, asistir
        a sesiones y ser de los primeros en probar tecnología para tu empresa. Inicia sesión y termina el perfil.
      </Text>
      <Button
        href={href}
        style={{
          display: "inline-block",
          marginTop: 8,
          backgroundColor: mailBrand.pink,
          color: mailBrand.white,
          padding: "12px 20px",
          borderRadius: 999,
          fontWeight: 700,
        }}
      >
        Iniciar sesión
      </Button>
    </MailShell>
  );
}
