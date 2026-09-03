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
    <nav className="w-52 shrink-0 border-r border-black/10 dark:border-white/10 p-4 min-h-screen flex flex-col">
      <div className="text-lg font-semibold mb-6 px-2">myToDo</div>
      <ul className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`block rounded-md px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "hover:bg-black/5 dark:hover:bg-white/10"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-auto pt-4 border-t border-black/10 dark:border-white/10">
        {user ? (
          <div className="flex items-center gap-2 px-2">
            {user.avatarUrl && (
              <Image
                src={user.avatarUrl}
                alt={user.username}
                width={28}
                height={28}
                className="rounded-full"
                unoptimized
              />
            )}
            <span className="text-sm truncate flex-1">{user.username}</span>
            <a
              href="/auth/logout"
              className="text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 shrink-0"
            >
              로그아웃
            </a>
          </div>
        ) : (
          <a
            href="/login"
            className="block px-2 py-2 text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
          >
            로그인
          </a>
        )}
      </div>
    </nav>
  );
}
