export function CuposTab({
  quotas,
}: {
  quotas: { sectorId: string; name: string; capacity: number }[];
}) {
  if (!quotas.length) {
    return <p className="text-small text-ink-muted">Sin cupos por sector. Edítalos desde la lista.</p>;
  }
  const total = quotas.reduce((sum, row) => sum + row.capacity, 0);
  return (
    <div className="grid gap-3">
      <table className="w-full text-left text-small">
        <thead>
          <tr className="border-b border-line text-ink-muted">
            <th className="py-2 font-medium">Sector</th>
            <th className="py-2 font-medium">Invitados</th>
          </tr>
        </thead>
        <tbody>
          {quotas.map((row) => (
            <tr key={row.sectorId} className="border-b border-line">
              <td className="py-2">{row.name}</td>
              <td className="py-2">{row.capacity}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-small text-ink-muted">
        Total: <span className="font-medium text-ink">{total}</span>
      </p>
    </div>
  );
}
