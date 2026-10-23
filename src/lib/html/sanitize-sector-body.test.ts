import { describe, expect, it } from "vitest";
import { sanitizeSectorBody } from "./sanitize-sector-body";

const id = "550e8400-e29b-41d4-a716-446655440000";
const img = `<img src="/api/medios/${id}" alt="">`;

describe("cuerpo de la página del sector", () => {
  it("conserva texto, énfasis, saltos, enlaces http(s) e imágenes de medios", () => {
    expect(sanitizeSectorBody("<p>Hola <strong>tú</strong><br><em>allá</em></p>")).toBe(
      "<p>Hola <strong>tú</strong><br><em>allá</em></p>",
    );
    expect(sanitizeSectorBody('<a href="https://ejemplo.mx/a">ir</a>')).toBe(
      '<a href="https://ejemplo.mx/a">ir</a>',
    );
    expect(sanitizeSectorBody('<a href="http://ejemplo.mx">ir</a>')).toBe(
      '<a href="http://ejemplo.mx">ir</a>',
    );
    expect(sanitizeSectorBody(img)).toBe(img);
    expect(sanitizeSectorBody(`<IMG SRC="/api/medios/${id.toUpperCase()}" ALT="">`)).toBe(img);
    expect(sanitizeSectorBody("Solo texto")).toBe("Solo texto");
    expect(sanitizeSectorBody("<div><p>Hola</p></div>")).toBe("<p>Hola</p>");
  });

  it("quita script, style, on*, iframes y cualquier otro src", () => {
    expect(sanitizeSectorBody("<script>alert(1)</script><p>ok</p>")).toBe("<p>ok</p>");
    expect(sanitizeSectorBody("<SCRIPT>alert(1)</SCRIPT>")).toBe("");
    expect(sanitizeSectorBody("<style>body{display:none}</style>")).toBe("");
    expect(sanitizeSectorBody('<iframe src="/api/medios/' + id + '"></iframe>')).toBe("");
    expect(sanitizeSectorBody('<p onclick="alert(1)" style="color:red">hi</p>')).toBe("<p>hi</p>");
    expect(sanitizeSectorBody('<img src="https://evil.test/a.png" onerror="alert(1)">')).toBe("");
    expect(sanitizeSectorBody('<img src="/api/medios/nope" alt="">')).toBe("");
    expect(sanitizeSectorBody(`<img src="/api/medios/${id}?x=1" alt="">`)).toBe("");
    expect(sanitizeSectorBody(`${img.slice(0, -1)} onerror="alert(1)">`)).toBe(img);
    expect(sanitizeSectorBody('<a href="javascript:alert(1)">x</a>')).toBe("x");
    expect(sanitizeSectorBody('<a href="&#106;avascript:alert(1)">x</a>')).toBe("x");
    expect(sanitizeSectorBody('<a href="//evil.test">x</a>')).toBe("x");
    expect(sanitizeSectorBody(`<a href="https://ok.test" src="/api/medios/${id}" onclick="n">x</a>`)).toBe(
      '<a href="https://ok.test">x</a>',
    );
    expect(sanitizeSectorBody("<!-- <script>alert(1)</script> --><p>ok</p>")).toBe("<p>ok</p>");
    expect(sanitizeSectorBody("<p>   </p><br>")).toBe("");
    expect(sanitizeSectorBody("")).toBe("");
    expect(sanitizeSectorBody(sanitizeSectorBody(`<p>Hola</p>${img}`))).toBe(`<p>Hola</p>${img}`);
  });
});
