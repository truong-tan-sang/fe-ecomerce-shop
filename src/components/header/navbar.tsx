"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback } from "react";

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
  const onSearch = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const q = (formData.get("q") as string) ?? "";
    // Placeholder search action
    console.log("TODO: Search for", q);
  }, []);

  return (
    <header className="w-full bg-gradient-to-b from-[#121212] to-[#1a1a1a] text-white shadow">
      {/* Top utility bar */}
      <div className="mx-auto max-w-7xl px-3 md:px-6">
        <div className="flex items-center justify-end gap-5 py-2 text-xs text-white/70">
          <span className="hidden sm:inline-flex items-center gap-2"><i className="fa-regular fa-circle-question" aria-hidden /> Hỗ trợ</span>
          <span className="hidden sm:inline-flex items-center gap-2"><i className="fa-regular fa-bell" aria-hidden /> Thông báo</span>
          <span className="hidden md:inline-flex items-center gap-2"><i className="fa-solid fa-globe" aria-hidden /> Tiếng Việt</span>
          <Link href="/profile" className="inline-flex items-center gap-2 hover:text-white transition-colors cursor-pointer"><i className="fa-regular fa-user" aria-hidden /> Tài khoản</Link>
        </div>
      </div>

      {/* Main nav bar */}
      <div className="mx-auto max-w-7xl px-3 md:px-6 py-3">
        <div className="flex items-center gap-4 md:gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0" aria-label="Trang chủ">
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
              <button type="submit" className="px-4 bg-black hover:bg-gray-800 transition-colors text-white" aria-label="Tìm kiếm">
                <i className="fa-solid fa-magnifying-glass" />
              </button>
            </form>

            <Link href="/product/1" className="hidden" aria-hidden>
              {/* hidden placeholder to keep focus order deterministic */}
            </Link>
            <Link href="/cart" title="Giỏ hàng" className="p-2 rounded-md bg-white/10 hover:bg-white/20 transition-colors">
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
