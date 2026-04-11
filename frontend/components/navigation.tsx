"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserRole } from "@/components/mock-data";
import { useAuth } from "@/components/auth-provider";

type NavLink = {
  href: string;
  label: string;
  roles?: UserRole[];
};

const links: NavLink[] = [
  { href: "/", label: "Главная" },
  { href: "/dashboard", label: "Кабинет", roles: ["admin", "organizer", "referee", "coach", "fan"] },
  { href: "/tournaments", label: "Турниры", roles: ["admin", "organizer"] },
  { href: "/matches", label: "Матчи", roles: ["admin", "organizer", "referee"] },
  { href: "/standings", label: "Таблица", roles: ["admin", "organizer", "referee", "coach", "fan"] },
  { href: "/teams", label: "Команды", roles: ["admin", "organizer", "coach", "fan"] },
  { href: "/login", label: "Вход" },
];

export function Navigation() {
  const pathname = usePathname();
  const { user } = useAuth();

  const visibleLinks = links.filter((link) => {
    if (link.href === "/login") {
      return !user;
    }

    if (!link.roles) {
      return true;
    }

    return user ? link.roles.includes(user.role) : false;
  });

  return (
    <nav className="nav" aria-label="Основная навигация">
      {visibleLinks.map((link) => {
        const isActive = pathname === link.href;

        return (
          <Link
            key={link.href}
            className={`nav-link${isActive ? " active" : ""}`}
            href={link.href}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
