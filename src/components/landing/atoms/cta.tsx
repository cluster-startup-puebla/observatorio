import Link from "next/link";
import { cn } from "cn";

export function Cta({
  href,
  children,
  variant = "primary",
  className,
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "on-dark";
  className?: string;
}) {
  return (
    <Link href={href} className={cn("btn", `btn-${variant}`, className)}>
      {children}
    </Link>
  );
}
