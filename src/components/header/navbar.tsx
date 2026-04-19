"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { ChevronDown } from "lucide-react";
import { theme } from "@/lib/theme";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { categoryService } from "@/services/category";
import type { CategoryDto } from "@/dto/category";

export default function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [categories, setCategories] = useState<CategoryDto[]>([]);

  useEffect(() => {
    categoryService.getAllCategories().then((res) => {
      if (Array.isArray(res?.data)) setCategories(res.data);
    }).catch(() => {});
  }, []);

  // Handle scroll to show/hide header
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < lastScrollY || currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const onSearch = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = ((new FormData(e.currentTarget)).get("q") as string ?? "").trim();
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
  }, [router]);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/auth/login' });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 w-full text-white shadow-lg z-50 transition-all duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}
      style={{
        background: theme.gradient.header,
        boxShadow: theme.shadow.lg,
      }}
    >
      {/* Top utility bar */}
      <div className="mx-auto max-w-7xl px-3 md:px-6">
        <div className="flex items-center justify-end gap-5 py-2 text-xs text-white/70">
          <span className="hidden sm:inline-flex items-center gap-2"><i className="fa-regular fa-circle-question" aria-hidden /> Hỗ trợ</span>
          <span className="hidden sm:inline-flex items-center gap-2"><i className="fa-regular fa-bell" aria-hidden /> Thông báo</span>
          <span className="hidden md:inline-flex items-center gap-2"><i className="fa-solid fa-globe" aria-hidden /> Tiếng Việt</span>

          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <button
                className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
              >
                <i className="fa-regular fa-user" aria-hidden /> Tài khoản
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/profile">Thông tin cá nhân</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/profile/notifications">Thông báo</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/profile/orders">Đơn hàng</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/profile/vouchers">Voucher</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={handleLogout}
                className="cursor-pointer font-medium"
              >
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main nav bar */}
      <div className="mx-auto max-w-7xl px-3 md:px-6 py-3">
        <div className="flex items-center gap-4 md:gap-8">
          {/* Logo */}
          <Link href="/homepage" className="flex items-center shrink-0" aria-label="Trang chủ">
            <Image
              src="/LOGO-dark.svg"
              alt="Logo"
              width={110}
              height={32}
              priority
            />
          </Link>

          {/* Primary nav */}
          <nav className="hidden lg:flex items-center gap-1">
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 px-3 py-2 text-sm md:text-base font-semibold text-white/90 hover:text-white transition-colors cursor-pointer select-none">
                  Danh mục <ChevronDown size={14} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-40 max-h-80 overflow-y-auto">
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/search">Tất cả sản phẩm</Link>
                </DropdownMenuItem>
                {categories.length > 0 && <DropdownMenuSeparator />}
                {categories.map((cat) => (
                  <DropdownMenuItem key={cat.id} asChild className="cursor-pointer">
                    <Link href={`/search?categoryId=${cat.id}`}>{cat.name}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Search + cart */}
          <div className="ml-auto flex items-center gap-3 md:gap-4">
            <form onSubmit={onSearch} className="hidden md:flex items-stretch border border-white/20">
              <input
                name="q"
                placeholder="Tìm kiếm sản phẩm"
                className="w-56 lg:w-72 px-3 py-2 text-sm focus:outline-none bg-white/10 text-white placeholder:text-white/50"
                autoComplete="off"
              />
              <button type="submit" className="px-4 transition-opacity hover:opacity-80 text-black bg-white cursor-pointer" aria-label="Tìm kiếm">
                <i className="fa-solid fa-magnifying-glass" />
              </button>
            </form>

            <Link href="/product/1" className="hidden" aria-hidden>
              {/* hidden placeholder to keep focus order deterministic */}
            </Link>
            <Link href="/cart" title="Giỏ hàng" className="p-2 transition-opacity hover:opacity-80 cursor-pointer">
              <i className="fa-solid fa-cart-shopping" />
            </Link>
          </div>
        </div>

        {/* Secondary nav for mobile */}
        {categories.length > 0 && (
          <nav className="mt-3 flex flex-wrap gap-1 lg:hidden">
            <Link
              href="/search"
              className="px-3 py-1.5 text-sm font-semibold text-white/90 hover:text-white transition-colors cursor-pointer"
            >
              Tất cả
            </Link>
            {categories.slice(0, 5).map((cat) => (
              <Link
                key={cat.id}
                href={`/search?categoryId=${cat.id}`}
                className="px-3 py-1.5 text-sm font-semibold text-white/90 hover:text-white transition-colors cursor-pointer"
              >
                {cat.name}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
