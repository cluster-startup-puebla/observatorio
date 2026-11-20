import { Suspense } from "react";
import { cacheLife, cacheTag } from "next/cache";
import { DeleteAccount } from "@/components/app/delete-account";
import { EditProfile } from "@/components/app/edit-profile";
import { IdentityCard } from "@/components/app/identity-card";
import { profileFrame } from "@/components/app/profile-frame";
import { ProfileSkeleton } from "@/components/app/profile-skeleton";
import { identityTag, loadIdentity } from "@/lib/app/load-identity";
import { steadyLife } from "@/lib/app/view-cache";
import { logoutHomeAction } from "@/lib/auth/logout-home";
import { readSessionAccount } from "@/lib/auth/session-account";

export const instant = false;

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfileBody />
    </Suspense>
  );
}

async function ProfileBody() {
  "use cache: private";
  cacheLife(steadyLife);
  const account = await readSessionAccount();
  if (account) cacheTag(identityTag(account.id));
  const person = await loadIdentity();

  return (
    <div className={profileFrame}>
      <IdentityCard person={person} />
      <div className="flex flex-col gap-3 md:flex-row md:flex-wrap">
        <form action={logoutHomeAction} className="w-full md:w-[300px]">
          <button type="submit" className="btn btn-secondary w-full">
            Cerrar sesión
          </button>
        </form>
        <EditProfile />
        <DeleteAccount />
      </div>
    </div>
  );
}
