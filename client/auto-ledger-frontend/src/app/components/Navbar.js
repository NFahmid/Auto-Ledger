"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/categories", label: "Categories", icon: "category" },
  { href: "/budgets", label: "Budgets", icon: "account_balance_wallet" },
  { href: "/add-transaction", label: "Add Transaction", icon: "sync_alt" },
];

export default function Navbar() {
  const pathname = usePathname();
  return (
    <nav className="w-full flex justify-center sticky top-0 z-50 animate-fadeIn">
      <div className="w-full max-w-5xl bg-gradient-to-r from-blue-50 via-purple-50 to-blue-100 rounded-2xl shadow-xl mt-4 mb-4 px-8 py-3 flex justify-between items-center border border-blue-100/60 backdrop-blur-md">
        <div className="text-2xl font-bold tracking-wide flex items-center gap-2 text-blue-700">
          <span className="material-icons text-blue-400 animate-navbarIcon">
            menu_book
          </span>
          Auto Ledger
        </div>
        <div className="flex gap-2 text-blue-400 font-medium">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex items-center gap-1 px-4 py-2 rounded-lg transition-all duration-300
                  ${
                    isActive
                      ? "bg-gradient-to-r from-blue-200 to-purple-200 text-blue-900 shadow-lg scale-105"
                      : "hover:bg-blue-100 hover:text-blue-700"
                  }
                `}
                style={{
                  boxShadow: isActive
                    ? "0 2px 16px 0 rgba(99, 102, 241, 0.10)"
                    : undefined,
                }}
              >
                <span className="material-icons text-lg transition-transform duration-300 group-hover:scale-110 animate-navbarIcon">
                  {link.icon}
                </span>
                {link.label}
                {isActive && (
                  <span className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-4 h-1 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 shadow-lg animate-glow"></span>
                )}
              </Link>
            );
          })}
          <Link
            href="/login"
            className="flex items-center gap-1 px-4 py-2 rounded-lg hover:bg-red-100 hover:text-red-600 transition-all duration-300"
          >
            <span className="material-icons text-lg">logout</span>
            Logout
          </Link>
        </div>
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
          rel="stylesheet"
        />
        <style jsx global>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          .animate-fadeIn {
            animation: fadeIn 0.7s;
          }
          @keyframes navbarIcon {
            0% {
              transform: scale(0.9) rotate(-10deg);
            }
            60% {
              transform: scale(1.1) rotate(8deg);
            }
            100% {
              transform: scale(1) rotate(0deg);
            }
          }
          .animate-navbarIcon {
            animation: navbarIcon 0.7s;
          }
          @keyframes glow {
            0% {
              box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.3);
            }
            100% {
              box-shadow: 0 0 12px 4px rgba(139, 92, 246, 0.18);
            }
          }
          .animate-glow {
            animation: glow 1.2s infinite alternate;
          }
        `}</style>
      </div>
    </nav>
  );
}
