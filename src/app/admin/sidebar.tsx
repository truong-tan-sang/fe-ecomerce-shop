"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const linkClass = (href: string) =>
    `block py-2 px-3 rounded transition-colors ${
      pathname === href
        ? "bg-black text-white font-medium"
        : "text-gray-700 hover:bg-gray-100"
    }`;

  return (
    <aside
      className={`border-r border-gray-200 bg-white flex flex-col h-screen transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="p-4 flex items-center justify-between border-b border-gray-200">
        {!collapsed && <div className="font-semibold text-lg">Admin</div>}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </Button>
      </div>

      {!collapsed && (
        <>
          <nav className="p-4 space-y-6 flex-1 overflow-auto">
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
                Main menu
              </div>
              <div className="space-y-1">
                <Link href="/admin" className={linkClass("/admin")}>
                  Dashboard
                </Link>
                <Link href="/admin/orders" className={linkClass("/admin/orders")}>
                  Order Management
                </Link>
                <Link href="/admin/users" className={linkClass("/admin/users")}>
                  User
                </Link>
                <Link href="/admin/coupons" className={linkClass("/admin/coupons")}>
                  Coupon Code
                </Link>
                <Link
                  href="/admin/categories"
                  className={linkClass("/admin/categories")}
                >
                  Categories
                </Link>
                <Link
                  href="/admin/transactions"
                  className={linkClass("/admin/transactions")}
                >
                  Transaction
                </Link>
                <Link href="/admin/brands" className={linkClass("/admin/brands")}>
                  Brand
                </Link>
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
                Product
              </div>
              <div className="space-y-1">
                <Link
                  href="/admin/products/add"
                  className={linkClass("/admin/products/add")}
                >
                  Add Products
                </Link>
                <Link
                  href="/admin/products/media"
                  className={linkClass("/admin/products/media")}
                >
                  Product Media
                </Link>
                <Link
                  href="/admin/products/list"
                  className={linkClass("/admin/products/list")}
                >
                  Product List
                </Link>
                <Link
                  href="/admin/products/reviews"
                  className={linkClass("/admin/products/reviews")}
                >
                  Product Reviews
                </Link>
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
                Admin
              </div>
              <div className="space-y-1">
                <Link href="/admin/roles" className={linkClass("/admin/roles")}>
                  Admin role
                </Link>
                <Link
                  href="/admin/authority"
                  className={linkClass("/admin/authority")}
                >
                  Control Authority
                </Link>
              </div>
            </div>

            <Link href="/admin/shop" className={linkClass("/admin/shop")}>
              Your Shop
            </Link>
          </nav>

          <div className="p-4 border-t border-gray-200">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => signOut({ callbackUrl: "/auth/login" })}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Log out
            </Button>
          </div>
        </>
      )}

      {collapsed && (
        <div className="flex-1 flex items-end p-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-red-600 hover:text-red-700 hover:bg-red-50 w-full"
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
            title="Log out"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      )}
    </aside>
  );
}
