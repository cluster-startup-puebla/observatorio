"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export function FormSheet({
  action,
  resource,
  label,
  open,
  trigger,
  children,
}: {
  action: string;
  resource: string;
  label?: string;
  open?: boolean;
  trigger?: React.ReactNode;
  children: React.ReactNode;
}) {
  const subtitle = `${action} ${resource}`;
  return (
    <Sheet defaultOpen={open}>
      <SheetTrigger asChild>
        {trigger ?? (
          <Button type="button" size="sm">
            {label ?? subtitle}
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="flex w-full flex-col gap-0 overflow-hidden sm:max-w-lg">
        <SheetHeader className="border-b border-line pr-10">
          <SheetTitle className="font-display text-h3 text-ink">Observatorio</SheetTitle>
          <SheetDescription className="text-small text-ink-secondary">{subtitle}</SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-4 py-4">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
