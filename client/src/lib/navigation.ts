"use client";

// Compatibility layer: wouter API -> next/navigation
// Allows existing components to work with Next.js without mass rewrites

export { default as Link } from "next/link";
export { useParams } from "next/navigation";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

export function useLocation(): [
  string,
  (
    to: string,
    options?: { replace?: boolean; scroll?: boolean },
  ) => void,
] {
  const pathname = usePathname();
  const router = useRouter();

  const navigate = (
    to: string,
    options?: { replace?: boolean; scroll?: boolean },
  ) => {
    // Next.js App Router scrolls the window to the top on every push/replace by
    // default, which caused the "filter click yanks the page back to top" bug
    // on desktop. We default to scroll: false so callers stay put unless they
    // explicitly request otherwise (e.g. clicking the logo / nav links).
    const navOptions = { scroll: options?.scroll ?? false };
    if (options?.replace) {
      router.replace(to, navOptions);
    } else {
      router.push(to, navOptions);
    }
  };

  return [pathname, navigate];
}

export function useSearch(): string {
  const searchParams = useSearchParams();
  return searchParams.toString();
}

export function useRoute(pattern: string): [boolean, Record<string, string>] {
  const pathname = usePathname();

  const regexStr = pattern
    .replace(/:[a-zA-Z]+/g, '([^/]+)')
    .replace(/\//g, '\\/');
  const regex = new RegExp(`^${regexStr}$`);
  const match = pathname.match(regex);

  if (!match) return [false, {}];

  const paramNames = (pattern.match(/:([a-zA-Z]+)/g) || []).map(p => p.slice(1));
  const params: Record<string, string> = {};
  paramNames.forEach((name, i) => {
    params[name] = match[i + 1] || "";
  });

  return [true, params];
}
