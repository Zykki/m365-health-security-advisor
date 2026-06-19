type GraphErrorLike = {
  statusCode?: unknown;
  code?: unknown;
  message?: unknown;
  body?: unknown;
};

function getGraphErrorBody(error: GraphErrorLike) {
  if (typeof error.body !== "string") {
    return null;
  }

  try {
    return JSON.parse(error.body) as unknown;
  } catch {
    return null;
  }
}

function getNestedGraphError(error: GraphErrorLike) {
  const body = getGraphErrorBody(error);

  if (!body || typeof body !== "object") {
    return null;
  }

  const payload = body as Record<string, unknown>;

  if (!payload.error || typeof payload.error !== "object") {
    return null;
  }

  return payload.error as Record<string, unknown>;
}

function getErrorText(error: unknown) {
  if (!error || typeof error !== "object") {
    return "";
  }

  const graphError = error as GraphErrorLike;
  const nestedError = getNestedGraphError(graphError);
  const parts = [
    graphError.message,
    graphError.code,
    nestedError?.message,
    nestedError?.code
  ];

  return parts.filter((part) => typeof part === "string").join(" ");
}

export function isExpiredGraphTokenError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const graphError = error as GraphErrorLike;
  const nestedError = getNestedGraphError(graphError);
  const statusCode = graphError.statusCode;
  const code = graphError.code ?? nestedError?.code;
  const text = getErrorText(error).toLowerCase();

  return (
    statusCode === 401 &&
    code === "InvalidAuthenticationToken" &&
    (text.includes("token is expired") ||
      text.includes("lifetime validation failed"))
  );
}

export function mapGraphError(error: unknown) {
  if (isExpiredGraphTokenError(error)) {
    return {
      code: "SESSION_EXPIRED",
      message: "Your Microsoft Graph session has expired.",
      action: "Please sign out and sign in again to continue."
    };
  }

  return {
    code: "GRAPH_ERROR",
    message: "Unable to complete Microsoft Graph request.",
    action: "Please try again later."
  };
}
