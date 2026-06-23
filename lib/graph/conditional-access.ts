import { createGraphClient } from "@/lib/graph/client";

type ConditionalAccessPolicy = {
  id?: string;
  state?: string | null;
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
