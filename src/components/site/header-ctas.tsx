import { ctaLabel } from "@/content/landing";
import { reserveHref } from "@/lib/sectors";

const orgHref = "/register?cuenta=organismo";

export function HeaderCtas({ path, onNavigate }: { path: string; onNavigate?: () => void }) {
  return (
    <>
      <a href={reserveHref(path)} onClick={onNavigate} className="btn btn-primary px-4 py-2 text-small whitespace-nowrap">
        {ctaLabel}
      </a>
      <a href={orgHref} onClick={onNavigate} className="btn btn-secondary px-4 py-2 text-small whitespace-nowrap">
        Quiero invitar
      </a>
    </>
  );
}
