"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  LogOut,
  MessageCircle,
  MessageSquare,
  ShoppingCart,
  Ticket,
  Users,
} from "lucide-react";
import { userService, getAvatarUrl } from "@/services/user";

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const mainMenuItems: SidebarItem[] = [
  { label: "Quản lý đơn hàng", href: "/staff/orders",     icon: ShoppingCart },
  { label: "Khách hàng",        href: "/staff/users",      icon: Users },
  { label: "Danh mục",          href: "/staff/categories", icon: LayoutGrid },
  { label: "Chat",              href: "/staff/chat",       icon: MessageCircle },
  { label: "Voucher",           href: "/staff/coupons",    icon: Ticket },
];

const productItems: SidebarItem[] = [
  { label: "Danh sách sản phẩm", href: "/staff/products/list",    icon: List },
  { label: "Review sản phẩm",    href: "/staff/products/reviews", icon: MessageSquare },
];

export default function StaffSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const accessToken = session?.user?.access_token;
    const userId = session?.user?.id;
    if (!accessToken || !userId) return;
    userService.getUserWithMedia(userId, accessToken).then((res) => {
      const url = getAvatarUrl(res?.data?.userMedia);
      if (url) setAvatarUrl(url);
    }).catch(() => {});
  }, [session?.user?.access_token, session?.user?.id]);

  const isActive = (href: string): boolean => {
    if (href.startsWith("/staff/products")) return pathname === href;
    return pathname.startsWith(href);
  };

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

  const userName = session?.user?.name || "Nhân viên";
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
          title={collapsed ? "Mở rộng" : "Thu gọn"}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4">
        {collapsed ? (
          <div className="space-y-1 px-2">
            {[...mainMenuItems, ...productItems].map(renderCollapsedItem)}
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <div className="text-[15px] text-gray-500 px-6 mb-2">Menu chính</div>
              <div className="space-y-1 px-2">{mainMenuItems.map(renderItem)}</div>
            </div>
            <div>
              <div className="text-[15px] text-gray-500 px-6 mb-2">Sản phẩm</div>
              <div className="space-y-1 px-2">{productItems.map(renderItem)}</div>
            </div>
          </div>
        )}
      </nav>

      {/* Bottom */}
      <div className="border-t border-gray-100">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link href="/staff/profile" className="shrink-0 cursor-pointer">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={userName}
                width={36}
                height={36}
                className="rounded-full object-cover w-9 h-9"
                unoptimized
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[var(--admin-green-mid)] flex items-center justify-center text-[var(--admin-green-dark)] text-sm font-bold">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
          </Link>
          {!collapsed && (
            <>
              <Link href="/staff/profile" className="flex-1 min-w-0 cursor-pointer">
                <div className="text-sm font-semibold text-gray-900 truncate">{userName}</div>
                {userEmail && (
                  <div className="text-xs text-gray-500 truncate">{userEmail}</div>
                )}
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/auth/login" })}
                className="p-1.5 rounded-md hover:bg-gray-100 cursor-pointer text-[#6a717f]"
                title="Đăng xuất"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
