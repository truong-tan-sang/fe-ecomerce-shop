import React from "react";
import Link from "next/link";
import Sidebar from "./sidebar";
import { auth } from "@/auth";
import "@/styles/theme-admin.css";

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
    <div className="admin-theme h-screen flex bg-gray-50 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
