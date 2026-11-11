import { Body, Container, Head, Hr, Html, Preview, Section, Text } from "@react-email/components";
import type { ReactNode } from "react";
import { forumKicker, forumName } from "@/content/forum-public";
import { mailBrand } from "./brand";
import { mailOrigin } from "./continue-href";
import { MailFooter } from "./mail-footer";

export function MailShell({
  preview,
  title,
  children,
  assetBase,
}: {
  preview: string;
  title: string;
  children: ReactNode;
  assetBase?: string;
}) {
  const base = assetBase ?? mailOrigin(process.env.NEXT_PUBLIC_SITE_URL);
  return (
    <Html lang="es">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ margin: 0, backgroundColor: mailBrand.canvas, fontFamily: mailBrand.font }}>
        <Container style={{ width: "100%", maxWidth: 560, margin: "0 auto", padding: "24px 16px" }}>
          <Section style={{ height: 6, backgroundColor: mailBrand.pink, borderRadius: "12px 12px 0 0" }} />
          <Section style={{ backgroundColor: mailBrand.navy, padding: "28px 32px 24px" }}>
            <Text
              style={{
                margin: 0,
                color: "#b8c0ce",
                fontSize: 12,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              {forumKicker}
            </Text>
            <Text style={{ margin: "8px 0 0", color: mailBrand.white, fontSize: 28, fontWeight: 700 }}>
              {forumName}
            </Text>
          </Section>
          <Section style={{ backgroundColor: mailBrand.white, padding: "32px" }}>
            <Text style={{ margin: "0 0 16px", color: mailBrand.navy, fontSize: 26, fontWeight: 700, lineHeight: "1.2" }}>
              {title}
            </Text>
            {children}
          </Section>
          <Hr style={{ borderColor: mailBrand.line, margin: 0 }} />
          <MailFooter assetBase={base} />
        </Container>
      </Body>
    </Html>
  );
}
