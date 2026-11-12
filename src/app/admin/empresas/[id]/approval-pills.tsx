import Link from "next/link";

export function ApprovalPills({
  label,
  conveners,
}: {
  label: string;
  conveners: { name: string; href: string }[];
}) {
  if (!conveners.length) {
    return (
      <div className="mb-6 inline-flex rounded-full border border-line bg-elevated px-4 py-2 text-sm text-ink">
        Aprobación: {label}
      </div>
    );
  }
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {conveners.map((org) => (
        <Link
          key={org.href}
          href={org.href}
          className="inline-flex rounded-full border border-line bg-elevated px-4 py-2 text-sm text-ink hover:bg-surface-subtle"
        >
          Aprobación: {label}
          <span className="mx-2 text-ink-secondary">·</span>
          <span className="font-semibold">{org.name}</span>
        </Link>
      ))}
    </div>
  );
}
