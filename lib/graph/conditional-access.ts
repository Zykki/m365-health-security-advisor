import { createGraphClient } from "@/lib/graph/client";

type ConditionalAccessPolicy = {
  id?: string;
  displayName?: string | null;
  state?: string | null;
  conditions?: {
    clientAppTypes?: string[] | null;
  } | null;
  grantControls?: {
    builtInControls?: string[] | null;
  } | null;
};

type ConditionalAccessPoliciesResponse = {
  value?: ConditionalAccessPolicy[];
  "@odata.nextLink"?: string;
};

export type ConditionalAccessBaseline = {
  totalPolicies: number;
  enabledPolicies: number;
  disabledPolicies: number;
};

export type LegacyAuthConditionalAccessEvidence = {
  detected: boolean;
  matchingPolicies: Array<{
    id: string;
    displayName: string;
    state: string;
  }>;
};

export async function getConditionalAccessBaseline(
  accessToken: string
): Promise<ConditionalAccessBaseline> {
  const client = createGraphClient(accessToken);
  let requestUrl = "/identity/conditionalAccess/policies";
  let totalPolicies = 0;
  let enabledPolicies = 0;

  while (requestUrl) {
    const request = client.api(requestUrl);

    if (!requestUrl.startsWith("https://")) {
      request.select("id,state");
    }

    const response =
      (await request.get()) as ConditionalAccessPoliciesResponse;
    const policies = response.value ?? [];

    totalPolicies += policies.length;
    enabledPolicies += policies.filter(
      (policy) => policy.state === "enabled"
    ).length;
    requestUrl = response["@odata.nextLink"] ?? "";
  }

  return {
    totalPolicies,
    enabledPolicies,
    disabledPolicies: totalPolicies - enabledPolicies
  };
}

function isLegacyAuthBlockingPolicy(policy: ConditionalAccessPolicy) {
  const clientAppTypes = policy.conditions?.clientAppTypes ?? [];
  const builtInControls = policy.grantControls?.builtInControls ?? [];

  return (
    policy.state === "enabled" &&
    builtInControls.includes("block") &&
    (clientAppTypes.includes("other") ||
      clientAppTypes.includes("exchangeActiveSync"))
  );
}

export async function getLegacyAuthConditionalAccessEvidence(
  accessToken: string
): Promise<LegacyAuthConditionalAccessEvidence> {
  try {
    const client = createGraphClient(accessToken);
    let requestUrl = "/identity/conditionalAccess/policies";
    const matchingPolicies: LegacyAuthConditionalAccessEvidence["matchingPolicies"] =
      [];

    while (requestUrl) {
      const response = (await client
        .api(requestUrl)
        .get()) as ConditionalAccessPoliciesResponse;
      const policies = response.value ?? [];

      matchingPolicies.push(
        ...policies.filter(isLegacyAuthBlockingPolicy).map((policy) => ({
          id: policy.id ?? "",
          displayName: policy.displayName ?? "Unnamed policy",
          state: policy.state ?? "unknown"
        }))
      );
      requestUrl = response["@odata.nextLink"] ?? "";
    }

    return {
      detected: matchingPolicies.length > 0,
      matchingPolicies
    };
  } catch {
    return {
      detected: false,
      matchingPolicies: []
    };
  }
}
