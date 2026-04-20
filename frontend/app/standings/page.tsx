import { AccessGuard } from "@/components/access-guard";
import { LayoutShell } from "@/components/layout-shell";
import { StandingsClient } from "@/components/standings-client";

export default function StandingsPage() {
  return (
    <LayoutShell>
      <main className="page-layout">
        <AccessGuard roles={["admin", "organizer", "referee", "coach", "fan"]}>
          <StandingsClient />
        </AccessGuard>
      </main>
    </LayoutShell>
  );
}
