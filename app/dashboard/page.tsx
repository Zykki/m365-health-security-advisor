import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { GlobalAdminsCheck } from "@/app/dashboard/global-admins-check";
import { GuestUsersRatioCheck } from "@/app/dashboard/guest-users-ratio-check";
import { UsersOverview } from "@/app/dashboard/users-overview";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  return (
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

      <section className="identity-grid" aria-label="Prihlaseny pouzivatel">
        <article>
          <span>Meno</span>
          <strong>{session.user.name ?? "Nezname"}</strong>
        </article>
        <article>
          <span>Email</span>
          <strong>{session.user.email ?? "Neznamy"}</strong>
        </article>
        <article>
          <span>Tenant ID</span>
          <strong>{session.user.tenantId ?? "Nenajdeny v tokene"}</strong>
        </article>
      </section>

      <UsersOverview />
      <GlobalAdminsCheck />
      <GuestUsersRatioCheck />
    </main>
  );
}
