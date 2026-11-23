import { Button, Text } from "@react-email/components";
import { mailBrand } from "./brand";

export function MailAccountCta({ href }: { href: string }) {
  return (
    <>
      <Text style={{ margin: "20px 0 12px", color: mailBrand.navy, fontSize: 16, lineHeight: "1.5" }}>
        Opcional: crea tu cuenta con el mismo correo para ver tu pase en la app y completar el perfil.
      </Text>
      <Button
        href={href}
        style={{
          display: "inline-block",
          backgroundColor: mailBrand.pink,
          color: mailBrand.white,
          padding: "12px 20px",
          borderRadius: 999,
          fontWeight: 700,
        }}
      >
        Crear cuenta
      </Button>
    </>
  );
}
