import { auth } from "@/auth";
import { userService } from "@/services/user";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function AdminUsersPage() {
  const session = await auth();
  const accessToken = session?.access_token || session?.user?.access_token;
  let users: Awaited<ReturnType<typeof userService.getAll>> | null = null;
  try {
    users = await userService.getAll(accessToken);
    console.log("[AdminUsersPage] Response:", users);
  } catch (e) {
    console.log("[AdminUsersPage] Failed to load users:", e);
  }

  const data = users?.data ?? [];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">Customers</h1>
      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-gray-500">
                  No customers found
                </TableCell>
              </TableRow>
            ) : (
              data.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">
                    #{String(u.id).padStart(6, "0")}
                  </TableCell>
                  <TableCell>{u.name}</TableCell>
                  <TableCell className="text-gray-600">{u.phone || "—"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        u.status === "ACTIVE"
                          ? "default"
                          : u.status === "VIP"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {u.status || "—"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
