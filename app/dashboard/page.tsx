import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { DashboardOverviewPanel } from "@/app/dashboard/dashboard-overview";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  return (
    <div className="app-shell">
      <aside className="app-sidebar" aria-label="Primary navigation">
        <div className="app-brand">M365 Advisor</div>
        <nav className="sidebar-nav">
          <a className="sidebar-link active" href="#overview" aria-current="page">
            Overview
          </a>
          <a className="sidebar-link" href="#security">
            Security
          </a>
          <a className="sidebar-link" href="#governance">
            Governance
          </a>
          <span className="sidebar-link disabled" aria-disabled="true">
            Reports
          </span>
          <span className="sidebar-link disabled" aria-disabled="true">
            Settings
          </span>
        </nav>
      </aside>

      <main className="dashboard-shell">
        <section className="dashboard-header">
          <div>
            <p className="eyebrow">Protected route</p>
            <h1>Dashboard</h1>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button type="submit" className="secondary-button">
              Odhlasit
            </button>
          </form>
        </section>

        <DashboardOverviewPanel />
      </main>
    </div>
  );
}
