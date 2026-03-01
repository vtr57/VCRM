import { useAuthStore } from "@/features/auth/store/auth-store";
import { env } from "@/lib/env";

type ApiFetchOptions = {
  auth?: boolean;
  retryOnAuth?: boolean;
};

let refreshRequest: Promise<string | null> | null = null;

function buildHeaders(init?: RequestInit, auth = true) {
  const headers = new Headers(init?.headers ?? {});
  const hasJsonBody = init?.body !== undefined && !(init.body instanceof FormData);
  if (hasJsonBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const { accessToken, activeOrganizationSlug } = useAuthStore.getState();
  if (auth && accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }
  if (auth && activeOrganizationSlug) {
    headers.set("X-Organization-Slug", activeOrganizationSlug);
  }

  return headers;
}

async function fetchWithAuth(
  path: string,
  init?: RequestInit,
  options: ApiFetchOptions = {},
): Promise<Response> {
  const auth = options.auth ?? true;
  const retryOnAuth = options.retryOnAuth ?? true;
  const response = await fetch(`${env.apiUrl}${path}`, {
    ...init,
    headers: buildHeaders(init, auth),
  });

  if (response.status === 401 && auth && retryOnAuth) {
    const refreshedToken = await refreshAccessToken();
    if (refreshedToken) {
      return fetch(`${env.apiUrl}${path}`, {
        ...init,
        headers: buildHeaders(init, auth),
      });
    }
  }

  return response;
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}

async function refreshAccessToken(): Promise<string | null> {
  const { refreshToken, clearSession, updateAccessToken } = useAuthStore.getState();
  if (!refreshToken) {
    clearSession();
    return null;
  }

  if (refreshRequest) {
    return refreshRequest;
  }

  refreshRequest = fetch(`${env.apiUrl}/auth/refresh/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh: refreshToken }),
  })
    .then(async (response) => {
      if (!response.ok) {
        clearSession();
        return null;
      }

      const data = (await parseResponse<{ access: string }>(response)) ?? null;
      if (!data?.access) {
        clearSession();
        return null;
      }

      updateAccessToken(data.access);
      return data.access;
    })
    .catch(() => {
      clearSession();
      return null;
    })
    .finally(() => {
      refreshRequest = null;
    });

  return refreshRequest;
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
  options: ApiFetchOptions = {},
): Promise<T> {
  const response = await fetchWithAuth(path, init, options);

  if (response.ok) {
    return parseResponse<T>(response);
  }

  const errorBody = await parseResponse<Record<string, unknown> | undefined>(response).catch(() => undefined);
  const message =
    (typeof errorBody === "object" && errorBody !== null && "detail" in errorBody
      ? String(errorBody.detail)
      : undefined) ?? `Request failed with status ${response.status}`;

  throw new Error(message);
}

export async function apiFetchBlob(
  path: string,
  init?: RequestInit,
  options: ApiFetchOptions = {},
): Promise<{ blob: Blob; filename: string | null }> {
  const response = await fetchWithAuth(path, init, options);

  if (!response.ok) {
    const errorBody = await parseResponse<Record<string, unknown> | undefined>(response).catch(() => undefined);
    const message =
      (typeof errorBody === "object" && errorBody !== null && "detail" in errorBody
        ? String(errorBody.detail)
        : undefined) ?? `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  const contentDisposition = response.headers.get("Content-Disposition");
  const filenameMatch = contentDisposition?.match(/filename="?(.*?)"?$/);
  return {
    blob: await response.blob(),
    filename: filenameMatch?.[1] ?? null,
  };
}
