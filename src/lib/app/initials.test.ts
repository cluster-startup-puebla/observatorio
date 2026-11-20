import { describe, expect, it } from "vitest";
import { personInitials } from "./initials";

describe("personInitials", () => {
  it("toma la primera y la última palabra", () => {
    expect(personInitials("Ana López")).toBe("AL");
    expect(personInitials("Juan Carlos Pérez")).toBe("JP");
  });

  it("usa dos letras cuando solo hay un nombre", () => {
    expect(personInitials("Ana")).toBe("AN");
    expect(personInitials("  ")).toBe("?");
  });
});
