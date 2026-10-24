"use client";

/**
 * Demo auth session for the advertising system.
 * Replace with real authentication (NextAuth / JWT / cookies) later.
 */

import { useSyncExternalStore } from "react";
import {
  DEMO_ADMIN_USER,
  DEMO_ADVERTISER_USER,
} from "./demo-seed";
import type { AdsDemoUser, AdsRole } from "./types";

const SESSION_KEY = "nnauto_demo_ads_session_v1";
const CHANGE_EVENT = "nn-ads-session-changed";

let memoryUser: AdsDemoUser | null = null;
let hydrated = false;
const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((l) => l());
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
  }
}

function parseUser(raw: string): AdsDemoUser | null {
  try {
    const u = JSON.parse(raw) as AdsDemoUser;
    if (u?.role === "ADMIN" || u?.role === "ADVERTISER") return u;
  } catch {
    /* ignore */
  }
  return null;
}

function readUser(): AdsDemoUser {
  if (typeof window === "undefined") {
    return DEMO_ADVERTISER_USER;
  }
  if (memoryUser && hydrated) return memoryUser;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
      const parsed = parseUser(raw);
      if (parsed) {
        memoryUser = parsed;
        hydrated = true;
        return parsed;
      }
    }
  } catch {
    /* ignore */
  }
  memoryUser = DEMO_ADVERTISER_USER;
  hydrated = true;
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(memoryUser));
  } catch {
    /* ignore */
  }
  return memoryUser;
}

function writeUser(user: AdsDemoUser): void {
  memoryUser = user;
  hydrated = true;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } catch {
      /* ignore */
    }
  }
  emit();
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  if (typeof window !== "undefined") {
    const handler = () => onChange();
    window.addEventListener(CHANGE_EVENT, handler);
    window.addEventListener("storage", handler);
    return () => {
      listeners.delete(onChange);
      window.removeEventListener(CHANGE_EVENT, handler);
      window.removeEventListener("storage", handler);
    };
  }
  return () => listeners.delete(onChange);
}

export function getAdsDemoUser(): AdsDemoUser {
  return readUser();
}

export function setAdsDemoRole(role: AdsRole): AdsDemoUser {
  const next = role === "ADMIN" ? DEMO_ADMIN_USER : DEMO_ADVERTISER_USER;
  writeUser(next);
  return next;
}

export function useAdsDemoSession(): {
  user: AdsDemoUser;
  role: AdsRole;
  setRole: (role: AdsRole) => void;
  isAdmin: boolean;
  isAdvertiser: boolean;
  advertiserId: string | null;
} {
  const user = useSyncExternalStore(subscribe, readUser, () => DEMO_ADVERTISER_USER);
  return {
    user,
    role: user.role,
    setRole: setAdsDemoRole,
    isAdmin: user.role === "ADMIN",
    isAdvertiser: user.role === "ADVERTISER",
    advertiserId: user.advertiserId,
  };
}
