import { createGraphClient } from "@/lib/graph/client";

const GLOBAL_ADMIN_ROLE_TEMPLATE_ID = "62e90394-69f5-4237-9190-012177145e10";

type DirectoryRoleMembersResponse = {
  value?: Array<{ id?: string }>;
  "@odata.nextLink"?: string;
};

export async function getGlobalAdminCount(accessToken: string) {
  const client = createGraphClient(accessToken);
  let requestUrl = `/directoryRoles/roleTemplateId=${GLOBAL_ADMIN_ROLE_TEMPLATE_ID}/members`;
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
