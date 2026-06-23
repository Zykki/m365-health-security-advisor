import { createGraphClient } from "@/lib/graph/client";

type SecureScoreControlScore = {
  controlName?: string | null;
  score?: number | null;
  maxScore?: number | null;
};

type SecureScore = {
  controlScores?: SecureScoreControlScore[];
};

type SecureScoresResponse = {
  value?: SecureScore[];
};

type SecureScoreControlProfile = {
  id?: string | null;
  controlName?: string | null;
  title?: string | null;
};

type SecureScoreControlProfilesResponse = {
  value?: SecureScoreControlProfile[];
  "@odata.nextLink"?: string;
};

export type LegacyAuthSecureScoreEvidence = {
  implemented: boolean | null;
  evidence: string;
};

const LEGACY_AUTH_SECURE_SCORE_TERMS = [
  "legacy authentication",
  "basic authentication",
  "modern authentication"
];

function isLegacyAuthControl(profile: SecureScoreControlProfile) {
  const searchableText =
    `${profile.id ?? ""} ${profile.controlName ?? ""} ${
      profile.title ?? ""
    }`.toLowerCase();

  return LEGACY_AUTH_SECURE_SCORE_TERMS.some((term) =>
    searchableText.includes(term)
  );
}

async function getSecureScoreControlProfiles(accessToken: string) {
  const client = createGraphClient(accessToken);
  let requestUrl = "/security/secureScoreControlProfiles";
  const profiles: SecureScoreControlProfile[] = [];

  while (requestUrl) {
    const request = client.api(requestUrl);

    if (!requestUrl.startsWith("https://")) {
      request.select("id,controlName,title");
    }

    const response =
      (await request.get()) as SecureScoreControlProfilesResponse;

    profiles.push(...(response.value ?? []));
    requestUrl = response["@odata.nextLink"] ?? "";
  }

  return profiles;
}

export async function getLegacyAuthSecureScoreEvidence(
  accessToken: string
): Promise<LegacyAuthSecureScoreEvidence> {
  try {
    const client = createGraphClient(accessToken);
    const [profiles, scoresResponse] = await Promise.all([
      getSecureScoreControlProfiles(accessToken),
      client
        .api("/security/secureScores")
        .top(1)
        .orderby("createdDateTime desc")
        .get() as Promise<SecureScoresResponse>
    ]);
    const matchingProfiles = profiles.filter(isLegacyAuthControl);

    if (matchingProfiles.length === 0) {
      return {
        implemented: null,
        evidence: "No legacy authentication Secure Score control profile was found."
      };
    }

    const currentScore = scoresResponse.value?.[0];

    if (!currentScore?.controlScores) {
      return {
        implemented: null,
        evidence: "Secure Score data was available, but no current control scores were returned."
      };
    }

    const matchingControlNames = new Set(
      matchingProfiles
        .flatMap((profile) => [profile.id, profile.controlName, profile.title])
        .filter((value): value is string => Boolean(value))
        .map((value) => value.toLowerCase())
    );
    const matchingScores = currentScore.controlScores.filter((controlScore) =>
      matchingControlNames.has((controlScore.controlName ?? "").toLowerCase())
    );

    if (matchingScores.length === 0) {
      return {
        implemented: null,
        evidence:
          "Legacy authentication Secure Score controls were found, but no matching current score was returned."
      };
    }

    const implemented = matchingScores.some((controlScore) => {
      const score = controlScore.score ?? 0;
      const maxScore = controlScore.maxScore ?? 0;

      return maxScore > 0 && score >= maxScore;
    });

    return {
      implemented,
      evidence: implemented
        ? "Secure Score indicates a legacy/basic authentication control is implemented."
        : "Secure Score indicates a legacy/basic authentication control is not fully implemented."
    };
  } catch {
    return {
      implemented: null,
      evidence: "Secure Score evidence could not be loaded."
    };
  }
}
