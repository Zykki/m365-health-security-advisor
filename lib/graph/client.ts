import { Client } from "@microsoft/microsoft-graph-client";
import type { AuthenticationProvider } from "@microsoft/microsoft-graph-client";

export function createGraphClient(accessToken: string) {
  const authProvider: AuthenticationProvider = {
    getAccessToken: async () => accessToken
  };

  return Client.initWithMiddleware({
    authProvider,
    defaultVersion: "v1.0"
  });
}
