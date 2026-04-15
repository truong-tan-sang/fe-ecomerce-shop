"use client";

import { useEffect } from "react";

/** Adds `admin-theme` to <body> while any admin page is mounted.
 *  This ensures Dialog/Sheet/Tooltip portals (which render at body level)
 *  inherit the admin CSS custom properties (--radius, --primary, etc.).
 */
export default function AdminBodyTheme() {
  useEffect(() => {
    document.body.classList.add("admin-theme");
    return () => {
      document.body.classList.remove("admin-theme");
    };
  }, []);

  return null;
}
