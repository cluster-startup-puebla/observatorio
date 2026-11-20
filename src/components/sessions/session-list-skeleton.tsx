import { Skeleton } from "@/components/ui/skeleton";

export function SessionListSkeleton() {
  return (
    <ul className="mt-10 grid gap-4" aria-hidden>
      {["one", "two", "three"].map((key) => (
        <li key={key} className="flex items-center gap-4 rounded-2xl border border-line bg-elevated p-4 sm:gap-5 sm:p-5">
          <Skeleton className="h-[5.25rem] w-16 shrink-0 rounded-xl" />
          <div className="grid min-w-0 flex-1 gap-2">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-6 w-2/3 max-w-sm" />
            <Skeleton className="h-3 w-1/3 max-w-[10rem]" />
          </div>
        </li>
      ))}
    </ul>
  );
}
