"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useState, useRef, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";

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
    <header className={`fixed top-0 left-0 right-0 w-full bg-gradient-to-b from-[#121212] to-[#1a1a1a] text-white shadow z-50 transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
      {/* Top utility bar */}
      <div className="mx-auto max-w-7xl px-3 md:px-6">
        <div className="flex items-center justify-end gap-5 py-2 text-xs text-white/70">
          <span className="hidden sm:inline-flex items-center gap-2"><i className="fa-regular fa-circle-question" aria-hidden /> Hỗ trợ</span>
          <span className="hidden sm:inline-flex items-center gap-2"><i className="fa-regular fa-bell" aria-hidden /> Thông báo</span>
          <span className="hidden md:inline-flex items-center gap-2"><i className="fa-solid fa-globe" aria-hidden /> Tiếng Việt</span>
          <div className="relative" ref={accountMenuRef}>
            <button
              onMouseEnter={() => setShowAccountMenu(true)}
              onClick={() => setShowAccountMenu(!showAccountMenu)}
              className="inline-flex items-center gap-2 hover:text-white transition-colors cursor-pointer"
            >
              <i className="fa-regular fa-user" aria-hidden /> Tài khoản
            </button>
            {showAccountMenu && (
              <div 
                className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 text-gray-700 border border-gray-200"
                onMouseLeave={() => setShowAccountMenu(false)}
              >
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-sm hover:bg-gray-100"
                  onClick={() => setShowAccountMenu(false)}
                >
                  Thông tin cá nhân
                </Link>
                <Link
                  href="/profile/notifications"
                  className="block px-4 py-2 text-sm hover:bg-gray-100"
                  onClick={() => setShowAccountMenu(false)}
                >
                  Thông báo
                </Link>
                <Link
                  href="/profile/orders"
                  className="block px-4 py-2 text-sm hover:bg-gray-100"
                  onClick={() => setShowAccountMenu(false)}
                >
                  Đơn hàng
                </Link>
                <Link
                  href="/profile/vouchers"
                  className="block px-4 py-2 text-sm hover:bg-gray-100"
                  onClick={() => setShowAccountMenu(false)}
                >
                  Voucher
                </Link>
                <hr className="my-1" />
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600"
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
            <form onSubmit={onSearch} className="hidden md:flex items-stretch bg-white border border-gray-300">
              <input
                name="q"
                placeholder="Tìm kiếm sản phẩm"
                className="w-56 lg:w-72 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none"
                autoComplete="off"
              />
              <button type="submit" className="px-4 bg-black hover:bg-gray-900 transition-colors text-white cursor-pointer" aria-label="Tìm kiếm">
                <i className="fa-solid fa-magnifying-glass" />
              </button>
            </form>

            <Link href="/product/1" className="hidden" aria-hidden>
              {/* hidden placeholder to keep focus order deterministic */}
            </Link>
            <Link href="/cart" title="Giỏ hàng" className="p-2 hover:bg-white/20 transition-colors">
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
