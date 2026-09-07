"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SessionUser } from "@/lib/auth";

const NAV_ITEMS = [
  { href: "/", label: "대시보드" },
  { href: "/todos", label: "할 일" },
  { href: "/weekly", label: "주간 계획" },
  { href: "/goals", label: "1년 목표" },
];

export function Sidebar({ user }: { user: SessionUser | null }) {
  const pathname = usePathname();

  return (
    <nav className="flex min-h-screen w-56 shrink-0 flex-col border-r border-border bg-surface p-4">
      <div className="mb-6 flex items-center gap-2 px-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
          T
        </span>
        <span className="text-lg font-semibold tracking-tight">myToDo</span>
      </div>
      <ul className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-body-text hover:bg-black/[.04] dark:hover:bg-white/[.06]"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-auto border-t border-border pt-4">
        {user ? (
          <div className="flex items-center gap-2 px-2">
            {user.avatarUrl && (
              <Image
                src={user.avatarUrl}
                alt={user.username}
                width={28}
                height={28}
                className="rounded-full ring-1 ring-border"
                unoptimized
              />
            )}
            <span className="flex-1 truncate text-sm">{user.username}</span>
            <a href="/auth/logout" className="link-muted shrink-0 text-xs">
              로그아웃
            </a>
          </div>
        ) : (
          <a href="/login" className="link-muted block px-2 py-2 text-sm">
            로그인
          </a>
        )}
      </div>
    </nav>
  );
}
