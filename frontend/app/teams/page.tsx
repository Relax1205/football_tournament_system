import { AccessGuard } from "@/components/access-guard";
import { LayoutShell } from "@/components/layout-shell";
import { TeamsClient } from "@/components/teams-client";

export default function TeamsPage() {
  return (
    <LayoutShell>
      <main className="page-layout">
        <AccessGuard roles={["admin", "organizer", "coach", "fan"]}>
          <TeamsClient />
        </AccessGuard>
      </main>
    </LayoutShell>
  );
}
