import { AuthBack } from "@/components/auth/auth-back";
import { Kicker } from "@/components/landing/atoms/kicker";

export function AuthShell({
  kicker,
  title,
  lead,
  links,
  children,
  footer,
}: {
  kicker?: string;
  title: string;
  lead?: string;
  links?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="container-site py-6 lg:py-10">
      <AuthBack />
      <div className="mx-auto mt-8 flex max-w-lg flex-col gap-8">
        <header className="grid gap-3">
          {kicker ? <Kicker>{kicker}</Kicker> : null}
          <h1 className="text-h1 text-balance text-ink">{title}</h1>
          {lead ? <p className="text-body-lg text-ink-secondary">{lead}</p> : null}
          {links}
        </header>
        {children}
        {footer ? <div className="flex flex-wrap gap-x-4 gap-y-2 text-small">{footer}</div> : null}
      </div>
    </div>
  );
}
