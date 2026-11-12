import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("envío del pase aceptado", () => {
  const source = readFileSync("src/lib/mail/send-accepted-pass.ts", "utf8");

  it("encola, pinta el pase y registra el resultado", () => {
    expect(source).toContain('rpc("enqueue_accepted_pass"');
    expect(source).toContain('kind: "event_pass"');
    expect(source).toContain("mailFrom");
    expect(source).toContain('rpc("record_accepted_pass"');
    expect(source).toContain("already_sent");
    expect(source.indexOf("await writePass")).toBeLessThan(source.indexOf("if (row.already_sent)"));
    expect(source.indexOf("if (row.already_sent)")).toBeLessThan(source.indexOf("emails.send"));
  });

  it("el organismo y el superadmin mandan el pase después de aceptar", () => {
    const org = readFileSync("src/lib/crm-actions.ts", "utf8");
    const admin = readFileSync("src/app/api/admin/crm/[id]/evento/route.ts", "utf8");
    expect(org.indexOf("approve_link_signup")).toBeLessThan(org.indexOf("await sendAcceptedPass"));
    expect(admin.indexOf("approve_link_signup")).toBeLessThan(admin.indexOf("await sendAcceptedPass"));
  });
});
