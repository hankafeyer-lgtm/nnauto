import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export function parseApiError(error: unknown): { status?: number; message: string } {
  if (!(error instanceof Error)) {
    return { message: "An unknown error occurred" };
  }

  const match = error.message.match(/^(\d+):\s*(.+)$/);
  if (!match) {
    return { message: error.message };
  }

  const status = parseInt(match[1], 10);
  const body = match[2];

  try {
    const parsed = JSON.parse(body);
    return { status, message: parsed.error || parsed.message || body };
  } catch {
    return { status, message: body };
  }
}

// JWT token helper for cross-domain auth.
// (Legacy `x-session-id` localStorage fallback removed — it only existed
// for the old Replit-hosted Express server; the live Next.js login flow
// uses JWT + cookies and never wrote that key.)
function getJwtToken(): string | null {
  try {
    return localStorage.getItem('nnauto_token');
  } catch {
    return null;
  }
}

/** Headers so GET /api/listings sees the current user (cabinet: include sold listings). */
export function listingsFetchHeaders(
  extra: Record<string, string> = {},
): Record<string, string> {
  const headers: Record<string, string> = { ...extra };
  const token = getJwtToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const headers: Record<string, string> = data ? { "Content-Type": "application/json" } : {};

  // Add JWT token if available (production cross-domain auth)
  const token = getJwtToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const headers: Record<string, string> = {};

    // Add JWT token if available (production cross-domain auth)
    const token = getJwtToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(queryKey.join("/") as string, {
      headers,
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "returnNull" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 10 * 60 * 1000, // 10 minutes - data considered fresh (increased)
      gcTime: 60 * 60 * 1000, // 60 minutes - keep in cache longer
      retry: 1, // One retry for network failures
      retryDelay: 1000, // 1 second delay before retry
      networkMode: "offlineFirst", // Use cache first, then network
    },
    mutations: {
      retry: false,
    },
  },
});

export function canPrefetchHeavyResources() {
  if (typeof window === "undefined") return false;

  const connection = (
    navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
      mozConnection?: { saveData?: boolean; effectiveType?: string };
      webkitConnection?: { saveData?: boolean; effectiveType?: string };
    }
  ).connection ||
    (navigator as any).mozConnection ||
    (navigator as any).webkitConnection;

  if (connection?.saveData) return false;

  const effectiveType = String(connection?.effectiveType || "").toLowerCase();
  if (effectiveType.includes("slow-2g") || effectiveType.includes("2g")) return false;

  return true;
}

// Prefetch listings data for faster navigation
export function prefetchListings() {
  return queryClient.prefetchQuery({
    queryKey: ['/api/listings?limit=20'],
    staleTime: 10 * 60 * 1000,
  });
}

// Prefetch a single listing for faster navigation
export function prefetchListing(id: string) {
  if (!canPrefetchHeavyResources()) return Promise.resolve();
  return queryClient.prefetchQuery({
    queryKey: [`/api/listings/${id}`],
    staleTime: 10 * 60 * 1000,
  });
}

const prefetchedListingDocs = new Set<string>();
const prefetchedListingDocLinks = new Set<string>();
const warmedListingFrames = new Set<string>();

export function warmListingFrame(_id: string) {
  // Disabled: hidden iframes are too heavy and cause UI jank on mobile/desktop.
  // Navigation is fast enough with API prefetch + link rel=prefetch alone.
}

export function prefetchListingDocument(id: string) {
  if (typeof window === "undefined") return;
  if (!id || !canPrefetchHeavyResources()) return;
  const url = `/listing/${id}`;

  if (prefetchedListingDocLinks.has(url)) return;
  prefetchedListingDocLinks.add(url);

  const link = document.createElement("link");
  link.rel = "prefetch";
  link.as = "document";
  link.href = url;
  document.head.appendChild(link);
}
