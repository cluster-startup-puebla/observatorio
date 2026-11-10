import { Img, Section, Text } from "@react-email/components";
import { mailBrand } from "./brand";
import {
  absoluteLogo,
  backingLogos,
  convenerLogos,
  operaLogos,
  type MailLogo,
} from "./footer-logos";

export function LogoRow({
  label,
  logos,
  assetBase,
}: {
  label: string;
  logos: MailLogo[];
  assetBase: string;
}) {
  return (
    <Section>
      <Text
        style={{
          margin: "0 0 8px",
          color: mailBrand.muted,
          fontSize: 11,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </Text>
      {logos.map((logo) => (
        <Img
          key={logo.src}
          src={absoluteLogo(logo.src, assetBase)}
          alt={logo.alt}
          width={88}
          height={32}
          style={{ display: "inline-block", margin: "0 12px 8px 0" }}
        />
      ))}
    </Section>
  );
}

export function MailFooter({ assetBase }: { assetBase: string }) {
  return (
    <Section style={{ backgroundColor: mailBrand.white, padding: "16px 32px 28px" }}>
      <LogoRow label="Opera" logos={operaLogos} assetBase={assetBase} />
      <LogoRow label="Con el respaldo de" logos={backingLogos} assetBase={assetBase} />
      <LogoRow label="Convocan" logos={convenerLogos} assetBase={assetBase} />
      <Text style={{ margin: 0, color: mailBrand.muted, fontSize: 12, lineHeight: "1.5" }}>
        Clúster de Startups e Innovación · Si respondes, llega a {mailBrand.replyTo}
      </Text>
      <Text style={{ margin: "12px 0 0", color: mailBrand.muted, fontSize: 12, lineHeight: "1.5" }}>
        Revisa la bandeja de correo no deseado.
      </Text>
    </Section>
  );
}
