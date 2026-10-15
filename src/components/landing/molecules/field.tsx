export function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-small font-semibold text-ink">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-small text-mark">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export const controlClass =
  "w-full rounded-sm border border-line bg-surface-subtle px-4 py-3 text-body text-ink outline-none focus:border-brand";
