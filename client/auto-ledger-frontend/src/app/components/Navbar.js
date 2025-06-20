"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full bg-zinc-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
      <div className="text-xl font-semibold tracking-wide">📒 Auto Ledger</div>
      <div className="flex gap-6 text-sm font-medium">
        <Link
          href="/dashboard"
          className="hover:text-blue-400 transition-colors"
        >
          Dashboard
        </Link>
        <Link
          href="/add-entry"
          className="hover:text-blue-400 transition-colors"
        >
          Add Entry
        </Link>
        <Link href="/login" className="hover:text-red-400 transition-colors">
          Logout
        </Link>
      </div>
    </nav>
  );
}
