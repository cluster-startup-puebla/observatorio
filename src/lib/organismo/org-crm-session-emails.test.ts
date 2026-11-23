import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("org crm por sesión", () => {
  it("el CRM de /sesiones filtra con select ?sesion=", () => {
    const emails = readFileSync("src/lib/organismo/org-crm-session-emails.ts", "utf8");
    const read = readFileSync("src/lib/organismo/org-crm-read.ts", "utf8");
    const page = readFileSync("src/app/sesiones/[slug]/[piece]/crm/page.tsx", "utf8");
    expect(emails).toContain("session_rsvps");
    expect(read).toContain("orgCrmSessionEmails");
    expect(page).toContain("crmSessionChoice");
    expect(page).toContain("CrmSessionSelect");
    expect(page).toContain("listOrgCrm(owner.id, selectedId)");
  });
});
