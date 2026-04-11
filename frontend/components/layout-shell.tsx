"use client";

import { ReactNode } from "react";
import { HeaderBar } from "@/components/header-bar";

type LayoutShellProps = {
  children: ReactNode;
};

export function LayoutShell({ children }: LayoutShellProps) {
  return (
    <div className="page-shell">
      <HeaderBar />
      {children}
      <div className="footer-note">
        Демо-авторизация работает локально через mock users и готова к замене
        на реальный backend.
      </div>
    </div>
  );
}
