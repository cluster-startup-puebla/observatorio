import { Img, Section, Text } from "@react-email/components";
import { mailBrand } from "./brand";
import {
  absoluteLogo,
  backingLogos,
  convenerLogos,
  logoBox,
  logoRows,
  operaLogos,
  type MailLogo,
} from "./footer-logos";

const labelStyle = {
  margin: "0 0 8px",
  color: mailBrand.muted,
  fontSize: 11,
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
};

function LogoTable({ logos, assetBase }: { logos: MailLogo[]; assetBase: string }) {
  return (
    <table role="presentation" cellPadding={0} cellSpacing={0} style={{ margin: "0 0 4px" }}>
      <tbody>
        {logoRows(logos, 4).map((row) => (
          <tr key={row[0].src}>
            {row.map((logo) => {
              const box = logoBox(logo);
              return (
                <td key={logo.src} style={{ padding: "0 16px 14px 0", verticalAlign: "middle" }}>
                  <Img
                    src={absoluteLogo(logo.src, assetBase)}
                    alt={logo.alt}
                    width={box.width}
                    height={box.height}
                    style={{ display: "block" }}
                  />
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

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
      <Text style={labelStyle}>{label}</Text>
      <LogoTable logos={logos} assetBase={assetBase} />
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
