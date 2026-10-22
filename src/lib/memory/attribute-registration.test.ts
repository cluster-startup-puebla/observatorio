import { beforeEach, describe, expect, it } from "vitest";
import { getDirectory, resetDirectory } from "../memory-directory";
import { sealRef } from "../ref-token";
import { refSecret } from "./store";

describe("conversión del enlace", () => {
  beforeEach(() => resetDirectory());

  it("cuenta el sector del enlace aunque no haya copia en memoria", async () => {
    const directory = getDirectory();
    const org = await directory.createAccount({ email: "dir@camara.mx", role: "director" });
    const token = sealRef(org.id, refSecret());
    await directory.attributeRegistration({
      token,
      email: "ana@norte.mx",
      sectorSlug: "minerales-no-metalicos",
    });
    await directory.attributeRegistration({
      token,
      email: "ana@norte.mx",
      sectorSlug: "minerales-no-metalicos",
    });
    expect(await directory.conversion(org.id, "minerales-no-metalicos")).toEqual({
      copies: 0,
      registrations: 1,
    });
    expect(await directory.conversion(org.id, "turismo")).toEqual({ copies: 0, registrations: 0 });
  });
});
