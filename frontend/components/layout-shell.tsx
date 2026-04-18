"use client";

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
      <div className="footer-note">
        Интерфейс подключён к реальному backend с ролями, заявками, расписанием,
        таблицей и экспортом отчётов.
      </div>
    </div>
  );
}
