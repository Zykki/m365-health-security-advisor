import { createGraphClient } from "@/lib/graph/client";

type UserCountResponse = {
  "@odata.count"?: number;
};

async function getUsersCount(accessToken: string, filter?: string) {
  const client = createGraphClient(accessToken);
  let request = client
    .api("/users")
    .header("ConsistencyLevel", "eventual")
    .count(true)
    .top(1);

  if (filter) {
    request = request.filter(filter);
  }

  const response = (await request.get()) as UserCountResponse;

  if (typeof response["@odata.count"] !== "number") {
    throw new Error("Microsoft Graph response did not include @odata.count.");
  }

  return response["@odata.count"];
}

export function getUserCount(accessToken: string) {
  return getUsersCount(accessToken);
}

export function getMemberCount(accessToken: string) {
  return getUsersCount(accessToken, "userType eq 'Member'");
}

export function getGuestCount(accessToken: string) {
  return getUsersCount(accessToken, "userType eq 'Guest'");
}

export function getEnabledUserCount(accessToken: string) {
  return getUsersCount(accessToken, "accountEnabled eq true");
}

export function getDisabledUserCount(accessToken: string) {
  return getUsersCount(accessToken, "accountEnabled eq false");
}
