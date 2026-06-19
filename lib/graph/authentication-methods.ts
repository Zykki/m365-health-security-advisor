import { createGraphClient } from "@/lib/graph/client";

type CredentialUserRegistrationDetail = {
  id?: string;
  isMfaRegistered?: boolean;
};

type CredentialUserRegistrationDetailsResponse = {
  value?: CredentialUserRegistrationDetail[];
  "@odata.nextLink"?: string;
};

export type MfaRegistrationCoverage = {
  totalUsers: number;
  registeredUsers: number;
  registrationCoverage: number;
};

export async function getMfaRegistrationCoverage(
  accessToken: string
): Promise<MfaRegistrationCoverage> {
  const client = createGraphClient(accessToken);
  let requestUrl = "/reports/credentialUserRegistrationDetails";
  let totalUsers = 0;
  let registeredUsers = 0;

  while (requestUrl) {
    const request = client.api(requestUrl);

    if (!requestUrl.startsWith("https://")) {
      request.version("beta");
    }

    const response =
      (await request.get()) as CredentialUserRegistrationDetailsResponse;
    const users = response.value ?? [];

    totalUsers += users.length;
    registeredUsers += users.filter((user) => user.isMfaRegistered).length;
    requestUrl = response["@odata.nextLink"] ?? "";
  }

  return {
    totalUsers,
    registeredUsers,
    registrationCoverage:
      totalUsers === 0 ? 0 : Math.round((registeredUsers / totalUsers) * 100)
  };
}
