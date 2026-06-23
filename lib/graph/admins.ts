import { createGraphClient } from "@/lib/graph/client";

const GLOBAL_ADMIN_ROLE_TEMPLATE_ID = "62e90394-69f5-4237-9190-012177145e10";

const PRIVILEGED_ROLE_DEFINITIONS = [
  {
    roleName: "Global Administrator",
    roleTemplateId: GLOBAL_ADMIN_ROLE_TEMPLATE_ID
  },
  {
    roleName: "Privileged Role Administrator",
    roleTemplateId: "e8611ab8-c189-46e8-94e1-60213ab1f814"
  },
  {
    roleName: "Exchange Administrator",
    roleTemplateId: "29232cdf-9323-42fd-ade2-1d097af3e4de"
  },
  {
    roleName: "SharePoint Administrator",
    roleTemplateId: "f28a1f50-f6e7-4571-818b-6a12f2af6b6c"
  },
  {
    roleName: "Teams Administrator",
    roleTemplateId: "69091246-20e8-4a56-aa4d-066075b2a7a8"
  },
  {
    roleName: "Intune Administrator",
    roleTemplateId: "3a2c62db-5318-420d-8d74-23affee5d9d5"
  },
  {
    roleName: "Security Administrator",
    roleTemplateId: "194ae4cb-b126-40b2-bd5b-6091b380977d"
  },
  {
    roleName: "User Administrator",
    roleTemplateId: "fe930be7-5e62-47db-91af-98c3a49a38b1"
  }
] as const;

type DirectoryRoleMembersResponse = {
  value?: Array<{ id?: string }>;
  "@odata.nextLink"?: string;
};

type DirectoryRoleUserMember = {
  id?: string;
  displayName?: string | null;
  userPrincipalName?: string | null;
};

type DirectoryRoleUserMembersResponse = {
  value?: DirectoryRoleUserMember[];
  "@odata.nextLink"?: string;
};

type PrivilegedRoleMemberSummaryRole = {
  roleName: string;
  count: number;
};

export type BreakGlassCandidate = {
  id: string;
  displayName: string;
  userPrincipalName: string;
};

export type PrivilegedAdminUser = {
  id: string;
  displayName: string;
  userPrincipalName: string;
};

export type BreakGlassCandidateSummary = {
  count: number;
  candidates: BreakGlassCandidate[];
  globalAdminCount: number;
};

export type PrivilegedRoleMemberSummary = {
  globalAdmins: number;
  privilegedAdmins: number;
  roles: PrivilegedRoleMemberSummaryRole[];
};

const BREAK_GLASS_NAME_PATTERNS = [
  "break",
  "emergency",
  "glass",
  "cloudadmin",
  "breakglass",
  "bg-"
];

async function getDirectoryRoleMemberCount(
  accessToken: string,
  roleTemplateId: string
) {
  const client = createGraphClient(accessToken);
  let requestUrl = `/directoryRoles/roleTemplateId=${roleTemplateId}/members`;
  let count = 0;

  while (requestUrl) {
    const request = client.api(requestUrl);

    if (!requestUrl.startsWith("https://")) {
      request.select("id");
    }

    const response = (await request.get()) as DirectoryRoleMembersResponse;

    count += response.value?.length ?? 0;
    requestUrl = response["@odata.nextLink"] ?? "";
  }

  return count;
}

export function getGlobalAdminCount(accessToken: string) {
  return getDirectoryRoleMemberCount(accessToken, GLOBAL_ADMIN_ROLE_TEMPLATE_ID);
}

async function getDirectoryRoleUserMembers(
  accessToken: string,
  roleTemplateId: string
) {
  const client = createGraphClient(accessToken);
  let requestUrl = `/directoryRoles/roleTemplateId=${roleTemplateId}/members/microsoft.graph.user`;
  const members: PrivilegedAdminUser[] = [];

  while (requestUrl) {
    const request = client.api(requestUrl);

    if (!requestUrl.startsWith("https://")) {
      request.select("id,displayName,userPrincipalName");
    }

    const response =
      (await request.get()) as DirectoryRoleUserMembersResponse;
    const users = response.value ?? [];

    members.push(
      ...users
        .filter((user) => user.id)
        .map((user) => ({
          id: user.id ?? "",
          displayName: user.displayName ?? "",
          userPrincipalName: user.userPrincipalName ?? ""
        }))
    );
    requestUrl = response["@odata.nextLink"] ?? "";
  }

  return members;
}

export async function getPrivilegedAdminUsers(accessToken: string) {
  const roleMembers = await Promise.all(
    PRIVILEGED_ROLE_DEFINITIONS.map((role) =>
      getDirectoryRoleUserMembers(accessToken, role.roleTemplateId)
    )
  );
  const usersById = new Map<string, PrivilegedAdminUser>();

  for (const user of roleMembers.flat()) {
    usersById.set(user.id, user);
  }

  return Array.from(usersById.values());
}

function isBreakGlassCandidate(member: BreakGlassCandidate) {
  const searchableName =
    `${member.displayName} ${member.userPrincipalName}`.toLowerCase();

  return BREAK_GLASS_NAME_PATTERNS.some((pattern) =>
    searchableName.includes(pattern)
  );
}

export async function getBreakGlassCandidates(
  accessToken: string
): Promise<BreakGlassCandidateSummary> {
  const globalAdminMembers = await getDirectoryRoleUserMembers(
    accessToken,
    GLOBAL_ADMIN_ROLE_TEMPLATE_ID
  );

  const candidates = globalAdminMembers.filter(isBreakGlassCandidate);

  return {
    count: candidates.length,
    candidates,
    globalAdminCount: globalAdminMembers.length
  };
}

export async function getPrivilegedRoleMemberSummary(
  accessToken: string
): Promise<PrivilegedRoleMemberSummary> {
  const roles = await Promise.all(
    PRIVILEGED_ROLE_DEFINITIONS.map(async (role) => ({
      roleName: role.roleName,
      count: await getDirectoryRoleMemberCount(
        accessToken,
        role.roleTemplateId
      )
    }))
  );
  const globalAdmins =
    roles.find((role) => role.roleName === "Global Administrator")?.count ?? 0;
  const privilegedAdmins = roles.reduce((total, role) => total + role.count, 0);

  return {
    globalAdmins,
    privilegedAdmins,
    roles
  };
}
