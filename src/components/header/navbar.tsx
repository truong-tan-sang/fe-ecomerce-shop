"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useState, useRef, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { Moon, Sun } from "lucide-react";
import { theme } from "@/lib/theme";

type NavLinkProps = {
  label: string;
};

function NavLinkPlaceholder({ label }: NavLinkProps) {
  const onClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    // Placeholder action so it's easy to find later
    // TODO: wire real navigation
    console.log(`TODO: Navigate to ${label}`);
  }, [label]);

  return (
    <a
      href="#"
      onClick={onClick}
      title={`TODO: Điều hướng đến ${label}`}
      className="px-3 py-2 text-sm md:text-base font-semibold text-white/90 hover:text-white transition-colors cursor-pointer select-none"
    >
      {label}
    </a>
  );
}

export default function Header() {
  const { data: session } = useSession();
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isDark, setIsDark] = useState(false);

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

  // Check dark mode on mount
  useEffect(() => {
    const dark = document.documentElement.classList.contains("dark");
    setIsDark(dark);
  }, []);

  // Close account menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setShowAccountMenu(false);
      }
    };

    if (showAccountMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showAccountMenu]);

  const onSearch = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const q = (formData.get("q") as string) ?? "";
    // Placeholder search action
    console.log("TODO: Search for", q);
  }, []);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/auth/login' });
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 w-full text-[var(--text-primary)] shadow-lg z-50 transition-all duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}
      style={{
        background: theme.gradient.header,
        boxShadow: theme.shadow.lg,
      }}
    >
      {/* Top utility bar */}
      <div className="mx-auto max-w-7xl px-3 md:px-6">
        <div className="flex items-center justify-end gap-5 py-2 text-xs" style={{ color: theme.text.tertiary }}>
          <span className="hidden sm:inline-flex items-center gap-2"><i className="fa-regular fa-circle-question" aria-hidden /> Hỗ trợ</span>
          <span className="hidden sm:inline-flex items-center gap-2"><i className="fa-regular fa-bell" aria-hidden /> Thông báo</span>
          <span className="hidden md:inline-flex items-center gap-2"><i className="fa-solid fa-globe" aria-hidden /> Tiếng Việt</span>
          
          {/* Theme toggle */}
          <button
            onClick={() => {
              (window as any).toggleTheme?.();
              setIsDark(!isDark);
            }}
            className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          
          <div className="relative" ref={accountMenuRef}>
            <button
              onMouseEnter={() => setShowAccountMenu(true)}
              onClick={() => setShowAccountMenu(!showAccountMenu)}
              className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <i className="fa-regular fa-user" aria-hidden /> Tài khoản
            </button>
            {showAccountMenu && (
              <div 
                className="absolute right-0 mt-2 w-48 rounded-md py-1 border"
                style={{
                  background: theme.bg.secondary,
                  color: theme.text.secondary,
                  borderColor: theme.border.light,
                  boxShadow: theme.shadow.lg,
                }}
                onMouseLeave={() => setShowAccountMenu(false)}
              >
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-sm transition-opacity hover:opacity-80"
                  onClick={() => setShowAccountMenu(false)}
                >
                  Thông tin cá nhân
                </Link>
                <Link
                  href="/profile/notifications"
                  className="block px-4 py-2 text-sm transition-opacity hover:opacity-80"
                  onClick={() => setShowAccountMenu(false)}
                >
                  Thông báo
                </Link>
                <Link
                  href="/profile/orders"
                  className="block px-4 py-2 text-sm transition-opacity hover:opacity-80"
                  onClick={() => setShowAccountMenu(false)}
                >
                  Đơn hàng
                </Link>
                <Link
                  href="/profile/vouchers"
                  className="block px-4 py-2 text-sm transition-opacity hover:opacity-80"
                  onClick={() => setShowAccountMenu(false)}
                >
                  Voucher
                </Link>
                <hr className="my-1" style={{ borderColor: theme.border.light }} />
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm transition-opacity hover:opacity-80"
                  style={{ color: theme.status.error }}
                >
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
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
              className="dark:hidden"
            />
            <Image
              src="/LOGO-dark.svg"
              alt="Logo"
              width={110}
              height={32}
              priority
              className="hidden dark:block"
            />
          </Link>

          {/* Primary nav */}
          <nav className="hidden lg:flex items-center gap-1">
            <NavLinkPlaceholder label="Áo" />
            <NavLinkPlaceholder label="Quần" />
            <NavLinkPlaceholder label="Giày" />
            <NavLinkPlaceholder label="Đồ Nam" />
            <NavLinkPlaceholder label="Đồ Nữ" />
          </nav>

          {/* Search + cart */}
          <div className="ml-auto flex items-center gap-3 md:gap-4">
            <form onSubmit={onSearch} className="hidden md:flex items-stretch border" style={{ borderColor: theme.border.light }}>
              <input
                name="q"
                placeholder="Tìm kiếm sản phẩm"
                className="w-56 lg:w-72 px-3 py-2 text-sm focus:outline-none"
                style={{
                  background: theme.bg.primary,
                  color: theme.text.primary,
                }}
                autoComplete="off"
              />
              <button type="submit" className="px-4 transition-opacity hover:opacity-80 text-white cursor-pointer" style={{ background: theme.bg.button }} aria-label="Tìm kiếm">
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
        <nav className="mt-3 grid grid-cols-3 gap-2 lg:hidden">
          {[
            "Áo",
            "Quần",
            "Giày",
            "Đồ Nam",
            "Đồ Nữ",
          ].map((label) => (
            <NavLinkPlaceholder key={label} label={label} />
          ))}
        </nav>
      </div>
    </header>
  );
}
