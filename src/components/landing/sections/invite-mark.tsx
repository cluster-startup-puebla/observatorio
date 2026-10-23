type InviteBrand = { name: string; logoSrc: string | null };

export function InviteMark({ brand }: { brand?: InviteBrand | null }) {
  if (!brand) return null;
  if (!brand.logoSrc) {
    return (
      <p data-testid="marca-organismo" className="text-small font-semibold text-ink">
        {brand.name}
      </p>
    );
  }
  return (
    <img
      data-testid="marca-organismo"
      src={brand.logoSrc}
      alt={brand.name}
      className="block h-auto w-auto max-h-32 max-w-[min(100%,18rem)] object-contain object-left sm:max-h-40 sm:max-w-sm"
    />
  );
}
