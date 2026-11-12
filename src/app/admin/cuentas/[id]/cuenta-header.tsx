import { User } from "lucide-react";
import { PersonCard } from "@/components/admin/person-card";
import { Badge } from "@/components/ui/badge";
import { cuentaStat, type AccountKind } from "@/lib/admin/cuentas/account-kind";

export function CuentaHeader({
  name,
  role,
  jobTitle,
  kind,
  place,
  placeHref,
  hasPass,
}: {
  name: string;
  role: string;
  jobTitle: string;
  kind: AccountKind;
  place: string;
  placeHref: string;
  hasPass: boolean;
}) {
  const stat = cuentaStat(kind, hasPass);
  return (
    <PersonCard
      mark={<User className="size-8" />}
      title={name}
      line={jobTitle}
      href={placeHref}
      hrefLabel={place}
      note={
        <Badge variant="outline" className="border-line bg-elevated text-ink">
          {role}
        </Badge>
      }
      stat={stat.value}
      statLabel={stat.label}
    />
  );
}
