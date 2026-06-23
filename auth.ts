import NextAuth from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";

function requiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

const tenantId = process.env.AZURE_AD_TENANT_ID ?? "common";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: requiredEnv("NEXTAUTH_SECRET"),
  session: {
    strategy: "jwt"
  },
  providers: [
    AzureADProvider({
      clientId: requiredEnv("AZURE_AD_CLIENT_ID"),
      clientSecret: requiredEnv("AZURE_AD_CLIENT_SECRET"),
      issuer: `https://login.microsoftonline.com/${tenantId}/v2.0`,
      authorization: {
        params: {
          scope:
            "openid profile email offline_access User.Read Directory.Read.All Reports.Read.All"
        }
      }
    })
  ],
  callbacks: {
    jwt({ token, profile, account }) {
      if (profile && "tid" in profile && typeof profile.tid === "string") {
        token.tenantId = profile.tid;
      }

      if (account?.access_token) {
        token.accessToken = account.access_token;
      }

      return token;
    },
    session({ session, token }) {
      session.user.tenantId =
        typeof token.tenantId === "string" ? token.tenantId : null;
      session.accessToken =
        typeof token.accessToken === "string" ? token.accessToken : null;

      return session;
    }
  },
  pages: {
    signIn: "/"
  }
});
