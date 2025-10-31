"use client";
import { signOut } from "next-auth/react";

export default function HomePage() {
  return (
    <div>
      <h1>Home Page</h1>
      <button
        className="rounded-2xl border bg-amber-100"
        type="button"
        onClick={() => signOut()}
      >
        Sign Out
      </button>
    </div>
  );
}
