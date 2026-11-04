import { Button, Text } from "@react-email/components";
import { mailBrand, publicFacts } from "./brand";
import { MailShell } from "./shell";

export function WelcomeMail({ continueHref }: { continueHref: string | null }) {
  return (
    <MailShell preview="Termina tu perfil para llegar con el pase." title="Tu lugar ya está apartado">
      <Text style={{ margin: "0 0 16px", color: mailBrand.navy, fontSize: 16, lineHeight: "1.5" }}>
        Creamos tu cuenta para el Foro Puebla x Puebla. El siguiente paso: termina el perfil de tu empresa.
        Ahí queda tu pase.
      </Text>
      <FactRows />
      {continueHref ? (
        <Button
          href={continueHref}
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
          Terminar mi perfil
        </Button>
      ) : (
        <Text style={{ margin: "16px 0 0", color: mailBrand.navy, fontSize: 16 }}>
          Vuelve al registro e inicia sesión.
        </Text>
      )}
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
