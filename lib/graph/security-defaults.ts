import { createGraphClient } from "@/lib/graph/client";

type IdentitySecurityDefaultsEnforcementPolicy = {
  isEnabled?: boolean | null;
};

export type SecurityDefaultsStatus = {
  enabled: boolean | null;
};

export async function getSecurityDefaultsStatus(
  accessToken: string
): Promise<SecurityDefaultsStatus> {
  try {
    const client = createGraphClient(accessToken);
    const response = (await client
      .api("/policies/identitySecurityDefaultsEnforcementPolicy")
      .get()) as IdentitySecurityDefaultsEnforcementPolicy;

    return {
      enabled:
        typeof response.isEnabled === "boolean" ? response.isEnabled : null
    };
  } catch {
    return {
      enabled: null
    };
  }
}
