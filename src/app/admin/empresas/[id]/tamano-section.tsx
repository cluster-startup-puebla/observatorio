export function TamanoSection({ employee_label }: { employee_label: string }) {
  return (
    <ul className="rounded-lg border border-line">
      <li className="px-4 py-3 text-sm font-medium text-ink">{employee_label || "Sin tamaño."}</li>
    </ul>
  );
}
