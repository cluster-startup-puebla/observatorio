"use client";

export function ContentImages({
  images,
  onInsert,
}: {
  images: { id: string }[];
  onInsert: (id: string) => void;
}) {
  if (!images.length) return null;
  return (
    <ul className="grid gap-2">
      {images.map((image) => (
        <li key={image.id} className="flex items-center gap-3 rounded-lg border border-line p-2">
          <img src={`/api/medios/${image.id}`} alt="" className="size-16 rounded object-contain" />
          <button
            type="button"
            className="rounded-lg border border-line px-3 py-1.5 text-small"
            onClick={() => onInsert(image.id)}
          >
            Insertar
          </button>
        </li>
      ))}
    </ul>
  );
}
