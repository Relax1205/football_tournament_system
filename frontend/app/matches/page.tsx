import { AccessGuard } from "@/components/access-guard";
import { LayoutShell } from "@/components/layout-shell";
import { MatchesClient } from "@/components/matches-client";

export default function MatchesPage() {
  return (
    <LayoutShell>
      <main className="page-layout">
        <AccessGuard roles={["admin", "organizer", "referee"]}>
          <MatchesClient />
        </AccessGuard>
      </main>
    </LayoutShell>
  );
}
