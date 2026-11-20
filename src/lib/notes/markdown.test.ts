import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { listNotes, noteBySlug } from "./markdown";

const body = `---
title: "Nota de prueba"
description: "Descripción de prueba"
excerpt: "Extracto de prueba"
date: "2026-11-18"
author: "Observatorio Tecnológico de Puebla"
category: "sala-de-prensa"
tags: ["Puebla"]
---

Párrafo.

![Mapa](/mapa.png)
![Remota](https://observatorio.example/mapa.png)
![Insegura](http://evil.example/x.png)
![Relativa](mapa.png)
![Proto](//cdn.example/a.png)
`;

describe("notas en markdown", () => {
  let dir = "";

  afterEach(() => {
    if (dir) fs.rmSync(dir, { recursive: true, force: true });
    dir = "";
  });

  it("lista una nota y lee su título", () => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "notes-"));
    fs.writeFileSync(path.join(dir, "nota-de-prueba.es.md"), body);
    fs.writeFileSync(path.join(dir, "ignorar.en.md"), "no");

    const notes = listNotes(dir);
    expect(notes).toHaveLength(1);
    expect(notes[0]?.title).toBe("Nota de prueba");
    expect(noteBySlug("nota-de-prueba", dir)?.title).toBe("Nota de prueba");
    expect(noteBySlug("../package", dir)).toBeNull();

    const html = notes[0]?.contentHtml ?? "";
    expect(html).toContain('<img src="/mapa.png" alt="Mapa" />');
    expect(html).toContain('src="https://observatorio.example/mapa.png"');
    expect(html).not.toContain("http://evil.example");
    expect(html).not.toContain('src="mapa.png"');
    expect(html).not.toContain("//cdn.example");
  });
});
