"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, Users, Eye } from "lucide-react";

export function TabBar() {
  const pathname = usePathname();

  const tabs = [
    { href: "/home", label: "Everyone", icon: Globe, match: /^\/home/ },
    { href: "/village", label: "Village", icon: Users, match: /^\/village/ },
    { href: "/you", label: "You", icon: Eye, match: /^\/you/ },
  ];

  return (
    <nav className="tab-bar">
      {tabs.map((tab) => {
        const active = tab.match.test(pathname);
        const Icon = tab.icon;
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
