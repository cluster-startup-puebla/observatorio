import { DeleteAccount } from "@/components/app/delete-account";
import { EditProfile } from "@/components/app/edit-profile";
import { IdentityCard } from "@/components/app/identity-card";
import { profileFrame } from "@/components/app/profile-frame";
import { loadIdentity } from "@/lib/app/load-identity";
import { logoutHomeAction } from "@/lib/auth/logout-home";

export const instant = false;

export default async function ProfilePage() {
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
