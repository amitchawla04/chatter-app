"use client";

/**
 * Bottom nav — 5 tabs matching 03-FEATURE-INVENTORY.md G1.
 * Home · Explore · Compose (raised gold) · Passes · You
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, PenLine, Send, User } from "lucide-react";
import { useT } from "./I18nProvider";

export function TabBar() {
  const pathname = usePathname();
  const t = useT();

  const tabs = [
    { href: "/home", label: t("tab.home"), icon: Home, match: /^\/home/, active: false },
    { href: "/explore", label: t("tab.explore"), icon: Compass, match: /^\/explore/, active: false },
    { href: "/compose", label: t("tab.whisper"), icon: PenLine, match: /^\/compose/, active: false, compose: true },
    { href: "/passes", label: t("tab.passes"), icon: Send, match: /^\/passes/, active: false },
    { href: "/you", label: t("tab.you"), icon: User, match: /^\/you/, active: false },
  ] as const;

  return (
    <nav className="tab-bar">
      {tabs.map((tab) => {
        const active = tab.match.test(pathname);
        const Icon = tab.icon;
        if ("compose" in tab && tab.compose) {
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-label={tab.label}
              className="flex items-center justify-center -mt-4 w-14 h-14 rounded-full bg-red text-paper hover:bg-paper transition-colors shadow-lg"
            >
              <Icon size={22} strokeWidth={1.8} />
            </Link>
          );
        }
        return (
          <Link
            key={tab.href}
            href={tab.href}
            data-active={active}
            className="tab-bar-item relative"
          >
            <Icon size={20} strokeWidth={1.5} />
            <span className="label-text text-[9px]">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
