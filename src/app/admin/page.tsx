import { auth } from "@/auth";
import DashboardClient from "@/components/admin/dashboard/DashboardClient";

export default async function AdminDashboardPage() {
  const session = await auth();
  const token = session?.user?.access_token ?? "";

  return <DashboardClient token={token} />;
}
