"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationItems = [
  { href: "/", label: "トップ" },
  { href: "/japan", label: "日本" },
  { href: "/global", label: "世界" },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-3 text-white transition hover:opacity-90"
        >
          <span className="flex size-11 items-center justify-center rounded-2xl bg-emerald-500/15 text-xl ring-1 ring-emerald-300/30">
            🌍
          </span>
          <div className="min-w-0">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-emerald-200/80">
              Live Climate Monitor
            </p>
            <p className="truncate text-base font-semibold tracking-[0.03em]">
              環境ダッシュボード
            </p>
          </div>
        </Link>

        <nav className="flex flex-wrap items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1.5">
          {navigationItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === item.href
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20"
                    : "text-slate-200 hover:bg-white/8 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
