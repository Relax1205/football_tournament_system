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
        Платформа помогает организаторам, судьям и командам работать в одном процессе без лишней
        рутины и потери контекста.
      </div>
    </div>
  );
}
