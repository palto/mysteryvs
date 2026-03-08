import { getParticipants } from "@/app/login/getParticipants";
import { AdminPage } from "@/app/admin/AdminPage";
import { TopNav } from "@/app/TopNav";

export default async function AdminPageServer() {
  const participants = await getParticipants();
  return (
    <>
      <TopNav />
      <AdminPage participants={participants} />
    </>
  );
}
