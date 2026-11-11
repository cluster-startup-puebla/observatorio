import { Button, Text } from "@react-email/components";
import { mailBrand, publicFacts } from "./brand";
import { continueHref as loginHref } from "./continue-href";
import { MailShell } from "./shell";

export function WelcomeMail({ continueHref }: { continueHref: string | null }) {
  const href = continueHref ?? loginHref(undefined);
  return (
    <MailShell preview="Tu cuenta ya fue creada. Termina tu perfil." title="Tu cuenta ya fue creada">
      <Text style={{ margin: "0 0 16px", color: mailBrand.navy, fontSize: 16, lineHeight: "1.5" }}>
        Creamos tu cuenta en el Observatorio. Inicia sesión y termina el perfil de tu empresa. Ahí quedas en espera de
        que tu organismo te acepte.
      </Text>
      <FactRows />
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

function FactRows() {
  return (
    <>
      {publicFacts(null).map((fact) => (
        <Text key={fact.label} style={{ margin: "0 0 4px", color: mailBrand.muted, fontSize: 14 }}>
          {fact.label}: {fact.value}
        </Text>
      ))}
    </>
  );
}
