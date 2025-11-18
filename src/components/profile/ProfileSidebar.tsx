"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type SidebarItem = {
    id: string;
    label: string;
    icon: string;
    href: string;
};

const items: SidebarItem[] = [
    { id: "account", label: "Tài khoản của tôi", icon: "fa-user", href: "/profile" },
    { id: "notifications", label: "Thông báo", icon: "fa-bell", href: "/profile/notifications" },
    { id: "orders", label: "Đơn hàng", icon: "fa-receipt", href: "/profile/orders" },
    { id: "vouchers", label: "Voucher của bạn", icon: "fa-ticket", href: "/profile/vouchers" },
];

export default function ProfileSidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 min-h-[calc(100vh-80px)]">
            <nav className="py-6">
                {items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.id}
                            href={item.href}
                            className={`flex items-center gap-3 py-3 text-sm transition-all ${isActive
                                    ? "font-bold text-black translate-x-2"
                                    : "text-gray-700 hover:text-black"
                                }`}
                        >
                            <i className={`fa ${item.icon} w-5`} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
