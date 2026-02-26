type OAuthTokenResponse = {
  access_token: string;
  token_type?: string;
  expires_in?: number;
  scope?: string;
};

const CEBIA_API_BASE_URL =
  (process.env.CEBIA_API_BASE_URL || "https://app.cebia.com/api/Autotracer").replace(
    /\/+$/,
    "",
  );

const TOKEN_URL = process.env.CEBIA_TOKEN_URL || "https://www.cebianet.cz/pub/oauth/token";

function requiredEnv(name: string): string {
  const v = process.env[name];
  if (!v || !v.trim()) throw new Error(`${name} is not configured`);
  return v.trim();
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function toForm(data: Record<string, string>): string {
  return Object.entries(data)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
}

let cachedToken: { token: string; expiresAtMs: number } | null = null;
let inflightToken: Promise<string> | null = null;

async function fetchToken(): Promise<string> {
  const clientId = requiredEnv("CEBIA_CLIENT_ID");
  const clientSecret = requiredEnv("CEBIA_CLIENT_SECRET");

  const username = (process.env.CEBIA_USERNAME || "").trim();
  const password = (process.env.CEBIA_PASSWORD || "").trim();

  // Swagger advertises "password" flow; partners often use client_credentials.
  // Support both without branching config elsewhere.
  const grantType = username && password ? "password" : "client_credentials";

  const body =
    grantType === "password"
      ? toForm({ grant_type: "password", username, password })
      : toForm({ grant_type: "client_credentials" });

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const resp = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basic}`,
      Accept: "application/json",
    },
    body,
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    // Common partner setup: client_credentials is not enabled; password grant is required.
    if (resp.status === 400 && grantType === "client_credentials" && text.includes("unauthorized_client")) {
      throw new Error(
        "[CEBIA] OAuth client_credentials is not enabled for this client. " +
          "Cebia Autotracer typically requires password grant: set CEBIA_USERNAME and CEBIA_PASSWORD " +
          "or ask Cebia to enable client_credentials for this client.",
      );
    }
    throw new Error(
      `[CEBIA] Token request failed (${resp.status}) ${text ? `- ${text}` : ""}`.trim(),
    );
  }

  const json = (await resp.json()) as OAuthTokenResponse;
  if (!json?.access_token) throw new Error("[CEBIA] Token response missing access_token");

  const ttlSec = typeof json.expires_in === "number" ? json.expires_in : 3600;
  // Refresh a minute early.
  cachedToken = { token: json.access_token, expiresAtMs: Date.now() + (ttlSec - 60) * 1000 };
  return json.access_token;
}

async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAtMs) return cachedToken.token;
  if (!inflightToken) {
    inflightToken = fetchToken().finally(() => {
      inflightToken = null;
    });
  }
  return inflightToken;
}

async function cebiaFetchJson<T>(path: string): Promise<T> {
  const token = await getToken();
  const url = `${CEBIA_API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;

  // Basic retry for 429 / transient 5xx.
  for (let attempt = 0; attempt < 4; attempt++) {
    const resp = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    if (resp.status === 401 && attempt === 0) {
      cachedToken = null;
      continue;
    }

    if (resp.status === 429 || (resp.status >= 500 && resp.status <= 599)) {
      const backoff = 400 * Math.pow(2, attempt);
      await sleep(backoff);
      continue;
    }

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      throw new Error(
        `[CEBIA] Request failed ${resp.status} ${path} ${text ? `- ${text}` : ""}`.trim(),
      );
    }

    return (await resp.json()) as T;
  }

  throw new Error(`[CEBIA] Request failed after retries: ${path}`);
}

export type CebiaQueueStatus = 1 | 2 | 3 | 4 | 6;

export type CebiaCreatePdfResponse = {
  vin?: string | null;
  status?: number;
  message?: string | null;
  queueStatus?: CebiaQueueStatus;
  queueId?: string | null;
};

export type CebiaPdfDataResponse = {
  vin?: string | null;
  status?: number;
  message?: string | null;
  queueStatus?: CebiaQueueStatus;
  queueId?: string | null;
  couponNumber?: string | null;
  createdAt?: string;
  validTo?: string | null;
  pdfData?: string | null; // base64
  reportUrl?: string | null;
};

export async function cebiaVinCheck(vin: string) {
  return await cebiaFetchJson<any>(`/v1/VinCheck/${encodeURIComponent(vin)}`);
}

export async function cebiaCreatePdfQueue(vin: string): Promise<CebiaCreatePdfResponse> {
  return await cebiaFetchJson<CebiaCreatePdfResponse>(
    `/v1/CreatePdfQueue/${encodeURIComponent(vin)}`,
  );
}

export async function cebiaGetPdfData(queueId: string): Promise<CebiaPdfDataResponse> {
  return await cebiaFetchJson<CebiaPdfDataResponse>(
    `/v1/GetPdfData/${encodeURIComponent(queueId)}`,
  );
}

