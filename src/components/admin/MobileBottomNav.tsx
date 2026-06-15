"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { UserRole } from "@prisma/client";
import { getMobileNavItems, isNavItemActive } from "@/lib/adminNav";

export function MobileBottomNav({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const navItems = getMobileNavItems(role);

  return (
    <nav
      className="mobile-bottom-nav lg:hidden"
      aria-label="Navigation principale"
      style={{
        gridTemplateColumns: `repeat(${navItems.length}, minmax(0, 1fr))`,
      }}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isNavItemActive(pathname, item.href);

        if (item.highlight) {
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`mobile-bottom-nav-scan ${active ? "mobile-bottom-nav-scan--active" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              <span className="mobile-bottom-nav-scan-icon" aria-hidden>
                <Icon size={22} strokeWidth={2.25} />
                {active && <span className="mobile-bottom-nav-active-dot" />}
              </span>
              <span className="mobile-bottom-nav-label">{item.label}</span>
            </Link>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`mobile-bottom-nav-item ${active ? "mobile-bottom-nav-item--active" : ""}`}
            aria-current={active ? "page" : undefined}
          >
            <span className="mobile-bottom-nav-item-inner" aria-hidden>
              <Icon size={20} strokeWidth={active ? 2.25 : 2} />
            </span>
            <span className="mobile-bottom-nav-label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
