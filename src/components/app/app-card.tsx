import { cn } from "@/lib/utils";

export function AppCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-[2rem] border border-line bg-elevated px-6 py-8 shadow-[0_16px_40px_-12px_rgb(22_40_79/0.18)]",
        className,
      )}
    >
      {children}
    </section>
  );
}
