import { createGraphClient } from "@/lib/graph/client";
import { getPrivilegedAdminUsers } from "@/lib/graph/admins";

type CredentialUserRegistrationDetail = {
  id?: string;
  userPrincipalName?: string;
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

export type AdminMfaCoverage = {
  totalAdmins: number;
  registeredAdmins: number;
  unregisteredAdmins: number;
  coverage: number;
};

async function getCredentialUserRegistrationDetails(accessToken: string) {
  const client = createGraphClient(accessToken);
  let requestUrl = "/reports/credentialUserRegistrationDetails";
  const details: CredentialUserRegistrationDetail[] = [];

  while (requestUrl) {
    const request = client.api(requestUrl);

    if (!requestUrl.startsWith("https://")) {
      request.version("beta");
    }

    const response =
      (await request.get()) as CredentialUserRegistrationDetailsResponse;

    details.push(...(response.value ?? []));
    requestUrl = response["@odata.nextLink"] ?? "";
  }

  return details;
}

export async function getMfaRegistrationCoverage(
  accessToken: string
): Promise<MfaRegistrationCoverage> {
  const users = await getCredentialUserRegistrationDetails(accessToken);
  const totalUsers = users.length;
  const registeredUsers = users.filter((user) => user.isMfaRegistered).length;

  return {
    totalUsers,
    registeredUsers,
    registrationCoverage:
      totalUsers === 0 ? 0 : Math.round((registeredUsers / totalUsers) * 100)
  };
}

export async function getAdminMfaCoverage(
  accessToken: string
): Promise<AdminMfaCoverage> {
  const [adminUsers, registrationDetails] = await Promise.all([
    getPrivilegedAdminUsers(accessToken),
    getCredentialUserRegistrationDetails(accessToken)
  ]);
  const registrationById = new Map(
    registrationDetails
      .filter((detail) => detail.id)
      .map((detail) => [detail.id?.toLowerCase() ?? "", detail])
  );
  const registrationByUserPrincipalName = new Map(
    registrationDetails
      .filter((detail) => detail.userPrincipalName)
      .map((detail) => [
        detail.userPrincipalName?.toLowerCase() ?? "",
        detail
      ])
  );
  const totalAdmins = adminUsers.length;
  const registeredAdmins = adminUsers.filter((admin) => {
    const registration =
      registrationById.get(admin.id.toLowerCase()) ??
      registrationByUserPrincipalName.get(
        admin.userPrincipalName.toLowerCase()
      );

    return Boolean(registration?.isMfaRegistered);
  }).length;
  const unregisteredAdmins = totalAdmins - registeredAdmins;

  return {
    totalAdmins,
    registeredAdmins,
    unregisteredAdmins,
    coverage:
      totalAdmins === 0
        ? 0
        : Math.round((registeredAdmins / totalAdmins) * 100)
  };
}
