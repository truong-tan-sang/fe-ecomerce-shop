import React from "react";
import Link from "next/link";
import Sidebar from "./sidebar";
import { auth } from "@/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  // Basic guard (middleware also protects)
  const isAdmin = !!session && (session.user?.role === "ADMIN" || session.user?.isAdmin === true);
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-gray-800">
        Unauthorized
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
}
