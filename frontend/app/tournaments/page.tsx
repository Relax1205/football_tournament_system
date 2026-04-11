import { AccessGuard } from "@/components/access-guard";
import { LayoutShell } from "@/components/layout-shell";
import { TournamentsClient } from "@/components/tournaments-client";

export default function TournamentsPage() {
  return (
    <LayoutShell>
      <main className="page-layout">
        <AccessGuard roles={["admin", "organizer"]}>
          <TournamentsClient />
        </AccessGuard>
      </main>
    </LayoutShell>
  );
}
