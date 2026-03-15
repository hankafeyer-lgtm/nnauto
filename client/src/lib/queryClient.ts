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

// Session ID storage helpers (for Replit webview fallback)
function getSessionId(): string | null {
  try {
    return localStorage.getItem('x-session-id');
  } catch {
    return null;
  }
}

// JWT token helper for cross-domain auth
function getJwtToken(): string | null {
  try {
    return localStorage.getItem('nnauto_token');
  } catch {
    return null;
  }
}

export function setSessionId(sessionId: string | null) {
  try {
    if (sessionId) {
      localStorage.setItem('x-session-id', sessionId);
    } else {
      localStorage.removeItem('x-session-id');
    }
  } catch {
    // Ignore localStorage errors
  }
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
  
  // Add session ID header if available (Replit webview fallback)
  const sessionId = getSessionId();
  if (sessionId) {
    headers['X-Session-Id'] = sessionId;
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
    
    // Add session ID header if available (Replit webview fallback)
    const sessionId = getSessionId();
    if (sessionId) {
      headers['X-Session-Id'] = sessionId;
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

export function warmListingFrame(id: string) {
  if (typeof window === "undefined") return;
  if (!id) return;
  if (!canPrefetchHeavyResources()) return;

  const url = `/listing/${id}?embedded=1`;
  if (warmedListingFrames.has(url)) return;
  warmedListingFrames.add(url);

  const iframe = document.createElement("iframe");
  iframe.src = url;
  iframe.setAttribute("aria-hidden", "true");
  iframe.tabIndex = -1;
  iframe.style.position = "absolute";
  iframe.style.width = "1px";
  iframe.style.height = "1px";
  iframe.style.opacity = "0";
  iframe.style.pointerEvents = "none";
  iframe.style.left = "-9999px";
  iframe.style.top = "-9999px";

  const cleanup = () => {
    window.clearTimeout(timeout);
    iframe.remove();
  };

  const timeout = window.setTimeout(cleanup, 5000);
  iframe.addEventListener("load", cleanup, { once: true });
  iframe.addEventListener("error", cleanup, { once: true });
  document.body.appendChild(iframe);
}

// Warm listing page document cache (helps iframe open faster on mobile)
export function prefetchListingDocument(id: string) {
  if (typeof window === "undefined") return;
  if (!id) return;
  const url = `/listing/${id}?embedded=1`;

  if (!prefetchedListingDocLinks.has(url)) {
    prefetchedListingDocLinks.add(url);
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.as = "document";
    link.href = url;
    document.head.appendChild(link);
  }

  if (prefetchedListingDocs.has(url)) return;
  prefetchedListingDocs.add(url);

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 6000);

  fetch(url, {
    method: "GET",
    credentials: "include",
    signal: controller.signal,
    cache: "force-cache",
  })
    .catch(() => {
      // Ignore warmup failures; real navigation still handles loading/errors.
    })
    .finally(() => {
      window.clearTimeout(timeout);
    });
}
