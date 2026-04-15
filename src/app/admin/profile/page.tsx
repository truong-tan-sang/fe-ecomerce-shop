import { auth } from "@/auth";
import AdminProfilePage from "@/components/admin/profile/AdminProfilePage";

export default async function ProfilePage() {
  const session = await auth();
  return <AdminProfilePage session={session} />;
}
