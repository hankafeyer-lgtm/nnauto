// import { useQuery } from "@tanstack/react-query";
// import { getQueryFn } from "@/lib/queryClient";
// import type { User } from "@shared/schema";

// export function useAuth() {
//   const { data, isLoading, error } = useQuery<{ user: Omit<User, "password"> | null }>({
//     queryKey: ["/api/auth/user"],
//     queryFn: getQueryFn({ on401: "returnNull" }),
//     retry: false,
//   });

//   // Use localStorage fallback for production (session issues)
//   let user = data?.user || null;
//   if (!user) {
//     try {
//       const storedUser = localStorage.getItem('nnauto_user');
//       if (storedUser) {
//         user = JSON.parse(storedUser);
//       }
//     } catch {
//       // Ignore parse errors
//     }
//   }

//   return {
//     user,
//     isLoading,
//     isAuthenticated: !!user,
//     error,
//   };
// }
// hooks/useAuth.ts
import { useCallback, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import type { User } from "@shared/schema";

const LS_USER_KEY = "nnauto_user";
const LS_TOKEN_KEY = "nnauto_token";

type SafeUser = Omit<User, "password">;

function clearAuth() {
  try {
    localStorage.removeItem(LS_USER_KEY);
    localStorage.removeItem(LS_TOKEN_KEY);
  } catch {}
}

function getToken(): string | null {
  try {
    return localStorage.getItem(LS_TOKEN_KEY);
  } catch {
    return null;
  }
}

function isJwtExpired(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return true;

    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    const payload = JSON.parse(json);
    const exp = payload?.exp;

    if (typeof exp !== "number") return true;
    return Date.now() >= exp * 1000;
  } catch {
    return true;
  }
}

async function callLogoutEndpoint() {
  // навіть якщо бек “не в курсі” про токен, cookie/сесія може бути активна
  // credentials: "include" — щоб cookie точно полетіли
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    // ігноруємо — все одно чистимо локально
  }
}

export function useAuth() {
  const queryClient = useQueryClient();

  const token = useMemo(
    () => (typeof window !== "undefined" ? getToken() : null),
    []
  );
  const hasToken = useMemo(() => !!token, [token]);
  const tokenInvalid = useMemo(() => {
    if (typeof window === "undefined") return true;
    // No token does not mean invalid auth state: session/cookie auth may still be valid.
    if (!token) return false;
    return isJwtExpired(token);
  }, [token]);

  const logout = useCallback(async () => {
    // 100% спроба вилогінити на бекенді + 100% чистка локально
    try {
      await callLogoutEndpoint();
    } finally {
      clearAuth();
      // щоб UI миттєво зрозумів, що user=null
      queryClient.setQueryData(["/api/auth/user"], { user: null });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    }
  }, [queryClient]);

  // Якщо токена нема/протух — локально чистимо і (опційно) валимо бек-сесію теж
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (tokenInvalid) {
      // не блокуємо рендер — просто “прибираємо” все
      logout();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenInvalid]);

  const { data, isLoading, error } = useQuery<{ user: SafeUser | null }>({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    enabled: true,
  });

  const serverUser = data?.user ?? null;

  // If a token exists but server returns user:null (or 401->returnNull),
  // perform a full logout/cleanup.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (hasToken && !tokenInvalid && !isLoading && !serverUser) {
      logout();
    }
  }, [hasToken, tokenInvalid, isLoading, serverUser, logout]);

  const user = tokenInvalid ? null : serverUser;

  return {
    user,
    isLoading: tokenInvalid ? false : isLoading,
    isAuthenticated: !!user,
    error,
    logout, // 👈 викликай з кнопки “Вийти”
  };
}
