"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { HeaderBar } from "@/components/header-bar";

type LayoutShellProps = {
  children: ReactNode;
};

export function LayoutShell({ children }: LayoutShellProps) {
  return (
    <div className="page-shell">
      <div className="ambient-orb ambient-orb-left" />
      <div className="ambient-orb ambient-orb-right" />
      <HeaderBar />
      {children}
      <footer className="footer-note">
        <span>
          Платформа помогает организаторам, судьям и командам работать в одном процессе без
          лишней рутины и потери контекста.
        </span>
        <div className="footer-note-links">
          <Link className="footer-note-link" href="/privacy">
            Политика конфиденциальности
          </Link>
        </div>
      </footer>
    </div>
  );
}
