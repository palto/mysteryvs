import { getParticipants } from "@/app/login/getParticipants";
import { AdminPage } from "@/app/admin/AdminPage";

export default async function AdminPageServer() {
  const participants = await getParticipants();
  return <AdminPage participants={participants} />;
}
