type OAuthTokenResponse = {
  access_token: string;
  token_type?: string;
  expires_in?: number;
};

const CEBIA_API_BASE_URL = (
  process.env.CEBIA_API_BASE_URL || "https://app.cebia.com/api/Autotracer"
).replace(/\/+$/, "");

const TOKEN_URL =
  process.env.CEBIA_TOKEN_URL || "https://www.cebianet.cz/pub/oauth/token";

function requiredEnv(name: string): string {
  const v = process.env[name];
  if (!v?.trim()) throw new Error(`${name} is not configured`);
  return v.trim();
}

let cachedToken: { token: string; expiresAtMs: number } | null = null;
let inflightToken: Promise<string> | null = null;

async function fetchToken(): Promise<string> {
  const clientId = requiredEnv("CEBIA_CLIENT_ID");
  const clientSecret = requiredEnv("CEBIA_CLIENT_SECRET");
  const username = (process.env.CEBIA_USERNAME || "").trim();
  const password = (process.env.CEBIA_PASSWORD || "").trim();
  const grantType = username && password ? "password" : "client_credentials";
  const body =
    grantType === "password"
      ? new URLSearchParams({ grant_type: "password", username, password }).toString()
      : new URLSearchParams({ grant_type: "client_credentials" }).toString();
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
  if (!resp.ok) throw new Error(`[CEBIA] Token request failed (${resp.status})`);
  const json = (await resp.json()) as OAuthTokenResponse;
  if (!json?.access_token) throw new Error("[CEBIA] No access_token in response");
  const ttl = typeof json.expires_in === "number" ? json.expires_in : 3600;
  cachedToken = {
    token: json.access_token,
    expiresAtMs: Date.now() + (ttl - 60) * 1000,
  };
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
  for (let attempt = 0; attempt < 4; attempt++) {
    const resp = await fetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    if (resp.status === 401 && attempt === 0) {
      cachedToken = null;
      continue;
    }
    if (resp.status === 429 || resp.status >= 500) {
      await new Promise((r) => setTimeout(r, 400 * 2 ** attempt));
      continue;
    }
    if (!resp.ok) throw new Error(`[CEBIA] ${resp.status} ${path}`);
    return (await resp.json()) as T;
  }
  throw new Error(`[CEBIA] Retries exhausted: ${path}`);
}

export async function cebiaCreatePdfQueue(vin: string) {
  return cebiaFetchJson<any>(`/v1/CreatePdfQueue/${encodeURIComponent(vin)}`);
}

export async function cebiaGetPdfData(queueId: string) {
  return cebiaFetchJson<any>(`/v1/GetPdfData/${encodeURIComponent(queueId)}`);
}
