"use client";

import { AccessGuard } from "@/components/access-guard";
import { DashboardRolePanels } from "@/components/dashboard-role-panels";
import { LayoutShell } from "@/components/layout-shell";
import { TeamManagementPanels } from "@/components/team-management-panels";
import { useAuth } from "@/components/auth-provider";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <LayoutShell>
      <main className="page-layout">
        <AccessGuard>
          <DashboardRolePanels />
          {user?.role === "admin" || user?.role === "organizer" || user?.role === "coach" ? (
            <TeamManagementPanels />
          ) : null}
        </AccessGuard>
      </main>
    </LayoutShell>
  );
}
