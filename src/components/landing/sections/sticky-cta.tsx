import { ctaLabel } from "@/content/landing";

export function StickyCta() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 p-3 backdrop-blur lg:hidden">
      <a href="/register" className="btn btn-primary w-full">
        {ctaLabel}
      </a>
    </div>
  );
}
