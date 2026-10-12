import { AdminData, AdminPageHeader } from "@/components/admin/admin-page";
import { TeamManager } from "@/components/admin/team-manager";
import { adminGetTeam } from "@/lib/admin-data";

export default function AdminTeamPage() {
  return (
    <>
      <AdminPageHeader title="Team" description="People shown in the “Team” section of the home page." />
      <AdminData>
        <Loader />
      </AdminData>
    </>
  );
}

async function Loader() {
  return <TeamManager team={await adminGetTeam()} />;
}
