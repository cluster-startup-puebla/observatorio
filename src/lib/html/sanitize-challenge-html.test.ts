import { describe, expect, it } from "vitest";
import { sanitizeChallengeHtml } from "./sanitize-challenge-html";

describe("sanitizeChallengeHtml", () => {
  it("keeps tip tap markup", () => {
    const html =
      "<h1>Titulo</h1>" +
      '<p style="text-align: center">Hola <u>mundo</u> <mark>resaltado</mark></p>' +
      "<ul><li><strong>a</strong></li></ul>";
    expect(sanitizeChallengeHtml(html)).toContain("<h1>Titulo</h1>");
    expect(sanitizeChallengeHtml(html)).toContain("<u>mundo</u>");
    expect(sanitizeChallengeHtml(html)).toContain("<mark>");
    expect(sanitizeChallengeHtml(html)).toContain("text-align: center");
  });

  it("strips scripts and event handlers", () => {
    expect(sanitizeChallengeHtml("<script>alert(1)</script><p>ok</p>")).toBe("<p>ok</p>");
    expect(sanitizeChallengeHtml('<p onclick="x" style="color:red">hi</p>')).toContain("hi");
    expect(sanitizeChallengeHtml('<p onclick="x" style="color:red">hi</p>')).not.toContain(
      "onclick",
    );
  });

  it("allows safe http(s) links only", () => {
    expect(sanitizeChallengeHtml('<a href="https://ejemplo.mx">ir</a>')).toContain("https://");
    expect(sanitizeChallengeHtml('<a href="javascript:alert(1)">x</a>')).toBe("x");
  });
});
