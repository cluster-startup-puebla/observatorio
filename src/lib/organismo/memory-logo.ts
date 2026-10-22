import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { readLogoFile } from "@/lib/admin/organismos/logo-file";
import { memoryStore, type StoredLogo } from "@/lib/memory/store";

const root = path.join(process.cwd(), ".data", "org-logos");

function extFor(contentType: string) {
  if (contentType === "image/png") return "png";
  if (contentType === "image/webp") return "webp";
  return "jpg";
}

async function writeDisk(personId: string, logo: StoredLogo) {
  await mkdir(root, { recursive: true });
  const file = path.join(root, `${personId}.${extFor(logo.contentType)}`);
  const meta = path.join(root, `${personId}.json`);
  await writeFile(file, logo.bytes);
  await writeFile(meta, JSON.stringify({ contentType: logo.contentType, objectPath: logo.objectPath }));
}

async function readDisk(personId: string): Promise<StoredLogo | null> {
  try {
    const meta = JSON.parse(await readFile(path.join(root, `${personId}.json`), "utf8")) as {
      contentType: string;
      objectPath: string;
    };
    const bytes = new Uint8Array(
      await readFile(path.join(root, `${personId}.${extFor(meta.contentType)}`)),
    );
    return { bytes, contentType: meta.contentType, objectPath: meta.objectPath };
  } catch {
    return null;
  }
}

export async function saveDirectorLogo(personId: string, file: FormDataEntryValue | null) {
  const parsed = await readLogoFile(file);
  if (!parsed || "error" in parsed) return false;
  const person = memoryStore().people.find((item) => item.id === personId && !item.orgId);
  if (!person) return false;
  const objectPath = `logos/${personId}`;
  const logo: StoredLogo = { bytes: parsed.bytes, contentType: parsed.contentType, objectPath };
  person.logoKey = objectPath;
  person.logo = logo;
  await writeDisk(personId, logo);
  return true;
}

export async function readDirectorLogo(personId: string) {
  const person = memoryStore().people.find((item) => item.id === personId && !item.orgId);
  if (person?.logo) return person.logo;
  const fromDisk = await readDisk(personId);
  if (fromDisk && person) person.logo = fromDisk;
  return fromDisk;
}
