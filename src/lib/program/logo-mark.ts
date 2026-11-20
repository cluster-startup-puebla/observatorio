import sharp from "sharp";

const cache = new Map<string, string>();

export async function averageHash(bytes: Buffer) {
  const { data } = await sharp(bytes, { failOn: "none" })
    .resize(8, 8, { fit: "fill" })
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let sum = 0;
  for (const value of data) sum += value;
  const average = sum / data.length;
  let bits = "";
  for (const value of data) bits += value >= average ? "1" : "0";
  return bits;
}

export async function logoMarks(paths: string[], download: (path: string) => Promise<Buffer | null>) {
  return Promise.all(
    paths.map(async (path) => {
      const saved = cache.get(path);
      if (saved) return saved;
      try {
        const bytes = await download(path);
        if (!bytes) return undefined;
        const mark = await averageHash(bytes);
        cache.set(path, mark);
        return mark;
      } catch {
        return undefined;
      }
    }),
  );
}
