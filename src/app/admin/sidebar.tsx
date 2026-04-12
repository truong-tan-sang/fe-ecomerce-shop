"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CreditCard,
  ExternalLink,
  Home,
  LayoutGrid,
  List,
  LogOut,
  MessageCircle,
  MessageSquare,
  Settings,
  ShoppingCart,
  Ticket,
  UserCircle,
  Users,
} from "lucide-react";

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const mainMenuItems: SidebarItem[] = [
  { label: "Trang chủ", href: "/admin", icon: Home },
  { label: "Quản lý đơn hàng", href: "/admin/orders", icon: ShoppingCart },
  { label: "Khách hàng", href: "/admin/users", icon: Users },
  { label: "Danh mục", href: "/admin/categories", icon: LayoutGrid },
  { label: "Giao dịch", href: "/admin/transactions", icon: CreditCard },
  { label: "Chat", href: "/admin/chat", icon: MessageCircle },
  { label: "Voucher", href: "/admin/coupons", icon: Ticket },
];

const productItems: SidebarItem[] = [
  { label: "Danh sách sản phẩm", href: "/admin/products/list", icon: List },
  { label: "Review sản phẩm", href: "/admin/products/reviews", icon: MessageSquare },
];

const adminItems: SidebarItem[] = [
  { label: "Admin role", href: "/admin/roles", icon: UserCircle },
  { label: "Cài đặt Quyền", href: "/admin/authority", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string): boolean => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    if (href.startsWith("/admin/products")) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const isProductSectionActive = pathname.startsWith("/admin/products");

  const renderItem = (item: SidebarItem) => {
    const active = isActive(item.href);
    const Icon = item.icon;
    return (
      <Link
        key={item.href}
        href={item.href}
        className={`flex items-center gap-3 px-4 py-2.5 rounded-md text-[16px] cursor-pointer transition-colors ${
          active
            ? "bg-[var(--admin-green-mid)] text-[var(--admin-green-dark)] font-bold"
            : "text-[#6a717f] font-normal hover:bg-[var(--admin-green-light)]"
        }`}
        title={collapsed ? item.label : undefined}
      >
        <Icon className="w-[22px] h-[22px] shrink-0" />
        {!collapsed && <span>{item.label}</span>}
      </Link>
    );
  };

  const renderCollapsedItem = (item: SidebarItem) => {
    const active = isActive(item.href);
    const Icon = item.icon;
    return (
      <Link
        key={item.href}
        href={item.href}
        className={`flex items-center justify-center p-2.5 rounded-md cursor-pointer transition-colors ${
          active
            ? "bg-[var(--admin-green-mid)] text-[var(--admin-green-dark)]"
            : "text-[#6a717f] hover:bg-[var(--admin-green-light)]"
        }`}
        title={item.label}
      >
        <Icon className="w-[22px] h-[22px]" />
      </Link>
    );
  };

  const userName = session?.user?.name || "Dealport";
  const userEmail = session?.user?.email || "";

  return (
    <aside
      className={`bg-white flex flex-col h-screen transition-all duration-300 z-10 shadow-[0px_3px_4px_0px_rgba(0,0,0,0.12)] ${
        collapsed ? "w-16" : "w-[260px]"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
        {!collapsed && (
          <span className="text-xl font-bold tracking-tight">
            PPL <span className="font-normal">Paple</span>
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-md hover:bg-gray-100 cursor-pointer text-[#6a717f]"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Scrollable nav area */}
      <nav className="flex-1 overflow-y-auto py-4">
        {collapsed ? (
          <div className="space-y-1 px-2">
            {[...mainMenuItems, ...productItems, ...adminItems].map(
              renderCollapsedItem
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Menu chinh */}
            <div>
              <div className="text-[15px] text-gray-500 px-6 mb-2">
                Menu chính
              </div>
              <div className="space-y-1 px-2">{mainMenuItems.map(renderItem)}</div>
            </div>

            {/* San pham */}
            <div>
              <div className="text-[15px] text-gray-500 px-6 mb-2">
                Sản phẩm
              </div>
              <div className="space-y-1 px-2">{productItems.map(renderItem)}</div>
            </div>

            {/* Admin */}
            <div>
              <div className="text-[15px] text-gray-500 px-6 mb-2">Admin</div>
              <div className="space-y-1 px-2">{adminItems.map(renderItem)}</div>
            </div>
          </div>
        )}
      </nav>

      {/* Bottom area */}
      <div className="border-t border-gray-100">
        {/* User profile row */}
        <div className="flex items-center gap-3 px-4 py-3">
          {/* Avatar circle */}
          <div className="w-9 h-9 bg-[var(--admin-green-mid)] shrink-0 flex items-center justify-center text-[var(--admin-green-dark)] text-sm font-bold">
            {userName.charAt(0).toUpperCase()}
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900 truncate">
                  {userName}
                </div>
                {userEmail && (
                  <div className="text-xs text-gray-500 truncate">
                    {userEmail}
                  </div>
                )}
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/auth/login" })}
                className="p-1.5 rounded-md hover:bg-gray-100 cursor-pointer text-[#6a717f]"
                title="Log out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </>
          )}
          {collapsed && (
            <button
              onClick={() => signOut({ callbackUrl: "/auth/login" })}
              className="sr-only"
              title="Log out"
            >
              Log out
            </button>
          )}
        </div>

        {/* Your Shop link */}
        {!collapsed ? (
          <Link
            href="/admin/shop"
            className="flex items-center gap-2 px-4 py-3 text-[16px] text-[#6a717f] hover:bg-gray-100 cursor-pointer border-t border-gray-100"
          >
            <ExternalLink className="w-[22px] h-[22px]" />
            <span>Your Shop</span>
          </Link>
        ) : (
          <Link
            href="/admin/shop"
            className="flex items-center justify-center p-2.5 hover:bg-gray-100 cursor-pointer text-[#6a717f] border-t border-gray-100"
            title="Your Shop"
          >
            <ExternalLink className="w-[22px] h-[22px]" />
          </Link>
        )}
      </div>
    </aside>
  );
}
