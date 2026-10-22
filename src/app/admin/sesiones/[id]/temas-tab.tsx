import { FormSheet } from "@/components/admin/form-sheet";
import { SheetSubmit } from "@/components/admin/sheet-submit";

export function TemasTab({
  id,
  topics,
  open,
}: {
  id: string;
  topics: { id: string; position: number; title: string }[];
  open?: boolean;
}) {
  return (
    <div className="grid gap-4">
      <ul className="grid gap-1 text-small">
        {topics.map((topic) => (
          <li key={topic.id}>
            {topic.position}. {topic.title}
          </li>
        ))}
      </ul>
      <FormSheet action="Crear" resource="tema" open={open}>
        <form action={`/api/admin/sesiones/${id}/temas`} method="post" className="grid gap-3">
          <label className="grid gap-1 text-small">
            Orden
            <input name="position" type="number" min={1} required className="rounded-lg border border-line px-3 py-2" />
          </label>
          <label className="grid gap-1 text-small">
            Título
            <input name="title" required className="rounded-lg border border-line px-3 py-2" />
          </label>
          <SheetSubmit>Agregar tema</SheetSubmit>
        </form>
      </FormSheet>
    </div>
  );
}
