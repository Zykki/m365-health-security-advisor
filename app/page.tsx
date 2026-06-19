import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";

export default async function HomePage({
  searchParams
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await auth();
  const { callbackUrl } = await searchParams;

  if (session) {
    redirect(callbackUrl ?? "/dashboard");
  }

  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <p className="eyebrow">Release 0.1</p>
        <h1>M365 Health & Security Advisor</h1>
        <p>
          Prihlasenie cez Microsoft Entra ID. Dashboard je dostupny iba po
          prihlaseni.
        </p>
        <form
          action={async () => {
            "use server";
            await signIn("azure-ad", { redirectTo: "/dashboard" });
          }}
        >
          <button type="submit">Prihlasit cez Microsoft</button>
        </form>
      </section>
    </main>
  );
}
