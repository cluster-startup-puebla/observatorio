const pageSize = 1000;

type Page<T> = { data: T[] | null; error: { message: string } | null };

export async function readPages<T>(read: (from: number, to: number) => PromiseLike<Page<T>>) {
  const rows: T[] = [];
  for (let page = 0; page < 20; page += 1) {
    const from = page * pageSize;
    const result = await read(from, from + pageSize - 1);
    if (result.error) throw new Error(result.error.message);
    const batch = result.data ?? [];
    rows.push(...batch);
    if (batch.length < pageSize) return rows;
  }
  return rows;
}
