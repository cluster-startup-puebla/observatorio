import { cacheLife } from "next/cache";
import { Suspense } from "react";
import { SessionList } from "@/components/sessions/session-list";
import { SessionListSkeleton } from "@/components/sessions/session-list-skeleton";
import { listPublicSessions } from "@/lib/sessions/load-public";

async function CachedSessionList() {
  "use cache";
  cacheLife("max");
  const sessions = await listPublicSessions();
  return <SessionList sessions={sessions} />;
}

export function SessionCatalog() {
  return (
    <Suspense fallback={<SessionListSkeleton />}>
      <CachedSessionList />
    </Suspense>
  );
}
