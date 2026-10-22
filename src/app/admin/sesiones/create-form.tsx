export function CreateSessionForm() {
  return (
    <form action="/api/admin/sesiones" method="post" className="mt-8 grid max-w-xl gap-3">
      <input name="venue" placeholder="Lugar" required />
      <input name="format_name" placeholder="Formato" required />
      <input name="starts_local" type="time" required />
      <input name="ends_local" type="time" required />
      <input name="capacity_min" type="number" min={1} defaultValue={8} />
      <input name="capacity_max" type="number" min={1} defaultValue={12} />
      <input name="audience" placeholder="Público" required />
      <input name="includes" placeholder="Incluye" required />
      <button className="btn btn-primary" type="submit">
        Crear sesión
      </button>
    </form>
  );
}
