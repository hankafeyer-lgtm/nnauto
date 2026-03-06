import session from "express-session";
import type { Express, RequestHandler } from "express";
import createMemoryStore from "memorystore";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db";
import { verifyToken } from "./jwt";

const MemoryStore = createMemoryStore(session);
const PgSession = connectPgSimple(session);
const AUTH_DEBUG_LOGS = process.env.AUTH_DEBUG_LOGS === "true";

// Store reference for diagnostics
let sessionStoreRef: any = null;

export function getSessionStore() {
  return sessionStoreRef;
}

export function getPool() {
  return pool;
}

export function getSession() {
  const defaultSessionTtlMs = 24 * 60 * 60 * 1000; // 24h
  const envSessionTtlHours = Number(process.env.SESSION_TTL_HOURS || "24");
  const sessionTtl =
    Number.isFinite(envSessionTtlHours) && envSessionTtlHours > 0
      ? Math.floor(envSessionTtlHours * 60 * 60 * 1000)
      : defaultSessionTtlMs;
  // Replit uses REPLIT_DEPLOYMENT for production - check for any truthy value, not just "1"
  const replitDeployment = process.env.REPLIT_DEPLOYMENT;
  const isProduction =
    process.env.NODE_ENV === "production" ||
    !!(replitDeployment && replitDeployment.length > 0);
  
  if (AUTH_DEBUG_LOGS) {
    console.log("[Session] getSession called, NODE_ENV:", process.env.NODE_ENV);
    console.log("[Session] REPLIT_DEPLOYMENT:", replitDeployment);
    console.log("[Session] REPLIT_DEPLOYMENT length:", replitDeployment?.length);
    console.log("[Session] isProduction:", isProduction);
    console.log("[Session] DATABASE_URL exists:", !!process.env.DATABASE_URL);
  }
  
  let sessionStore;
  
  const hasDbUrl = !!(process.env.DATABASE_URL_POOLED || process.env.PRODUCTION_DATABASE_URL || process.env.DATABASE_URL);
  if (isProduction && hasDbUrl) {
    if (AUTH_DEBUG_LOGS) {
      console.log("[Session] Initializing PostgreSQL session store...");
    }

    // Test connection asynchronously (do not block startup)
    pool.query("SELECT 1").then(() => {
      if (AUTH_DEBUG_LOGS) {
        console.log("[Session] PostgreSQL pool connected successfully");
      }
      // Also test session table
      return pool.query("SELECT COUNT(*) FROM session");
    }).then((result) => {
      if (AUTH_DEBUG_LOGS) {
        console.log("[Session] Session table accessible, current count:", result.rows[0].count);
      }
    }).catch((err) => {
      console.error("[Session] PostgreSQL pool/table error:", err.message);
    });
    
    // Handle pool errors
    pool.on('error', (err) => {
      console.error("[Session] PostgreSQL pool error:", err.message);
    });
    
    sessionStore = new PgSession({
      pool: pool,
      tableName: 'session',
      createTableIfMissing: false,
      pruneSessionInterval: 60 * 15,
      errorLog: (err) => {
        console.error("[Session] PgSession store error:", err.message);
        console.error("[Session] PgSession store error stack:", err.stack);
      }
    });
    
    sessionStoreRef = sessionStore;
    if (AUTH_DEBUG_LOGS) {
      console.log("[Session] Using PostgreSQL session store for production");
    }
  } else {
    sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
    sessionStoreRef = sessionStore;
    if (AUTH_DEBUG_LOGS) {
      console.log("[Session] Using MemoryStore for development");
      console.log("[Session] Reason: isProduction=", isProduction, "hasDbUrl=", hasDbUrl);
    }
  }
  
  const fallbackSessionSecret = "zlateauto-dev-secret-change-in-production";
  const sessionSecret = process.env.SESSION_SECRET || fallbackSessionSecret;
  if (isProduction && (!process.env.SESSION_SECRET || sessionSecret === fallbackSessionSecret)) {
    throw new Error("SESSION_SECRET must be set in production");
  }
  if (AUTH_DEBUG_LOGS) {
    console.log("[Session] Using secret length:", sessionSecret.length);
  }
  
  // Use "auto" for secure - express-session will check X-Forwarded-Proto
  // This works with Replit's reverse proxy which sets this header
  if (AUTH_DEBUG_LOGS) {
    console.log("[Session] Cookie config: secure=auto, sameSite=lax, isProduction=", isProduction);
  }
  
  return session({
    secret: sessionSecret,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    proxy: true, // Trust the reverse proxy
    cookie: {
      httpOnly: true,
      // "auto" - secure if connection is HTTPS (via X-Forwarded-Proto)
      secure: "auto",
      // "lax" for same-site - works without cross-origin issues
      sameSite: "lax",
      maxAge: sessionTtl,
      path: "/",
    },
  });
}

export function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  if (AUTH_DEBUG_LOGS) {
    console.log("[isAuthenticated] Checking auth for:", req.path);
  }
  
  // 1. First try JWT from Authorization header (production-safe, works cross-domain)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const payload = verifyToken(token);
      if (payload?.userId) {
        if (AUTH_DEBUG_LOGS) {
          console.log("[isAuthenticated] AUTHORIZED via JWT - userId:", payload.userId);
        }
        req.session.userId = payload.userId; // Set for compatibility with existing code
        return next();
      }
    } catch (err) {
      if (AUTH_DEBUG_LOGS) {
        console.log("[isAuthenticated] JWT verification failed:", err);
      }
    }
  }
  
  // 2. Try session-based auth
  if (AUTH_DEBUG_LOGS) {
    console.log("[isAuthenticated] Session ID:", req.sessionID);
    console.log("[isAuthenticated] Session userId:", req.session.userId);
  }
  
  const allowSessionHeaderFallback =
    process.env.ENABLE_SESSION_HEADER_FALLBACK === "true" &&
    process.env.NODE_ENV !== "production";

  // Session header fallback for cross-origin requests (dev-only)
  if (!req.session.userId && allowSessionHeaderFallback) {
    const sessionIdHeader = req.headers['x-session-id'] as string;
    if (AUTH_DEBUG_LOGS) {
      console.log("[isAuthenticated] No session userId, trying header fallback. X-Session-Id:", sessionIdHeader);
    }
    
    if (sessionIdHeader) {
      const sessionStore = req.sessionStore;
      await new Promise<void>((resolve) => {
        sessionStore.get(sessionIdHeader, (err, sessionData) => {
          if (err) {
            console.error("[isAuthenticated] Error loading session from header:", err.message);
          }
          if (AUTH_DEBUG_LOGS) {
            console.log("[isAuthenticated] Session data from store:", sessionData ? "found" : "not found");
          }
          if (!err && sessionData && sessionData.userId) {
            req.session.userId = sessionData.userId;
            if (AUTH_DEBUG_LOGS) {
              console.log("[isAuthenticated] Loaded userId from header session:", sessionData.userId);
            }
          }
          resolve();
        });
      });
    }
  }
  
  if (!req.session.userId) {
    if (AUTH_DEBUG_LOGS) {
      console.log("[isAuthenticated] UNAUTHORIZED - no userId in session or JWT");
    }
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (AUTH_DEBUG_LOGS) {
    console.log("[isAuthenticated] AUTHORIZED via session - userId:", req.session.userId);
  }
  next();
};

export const isAdmin: RequestHandler = async (req, res, next) => {
  // 1. First try JWT from Authorization header (production-safe)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const payload = verifyToken(token);
      if (payload?.userId) {
        req.session.userId = payload.userId; // Set for compatibility
      }
    } catch (err) {
      if (AUTH_DEBUG_LOGS) {
        console.log("[isAdmin] JWT verification failed");
      }
    }
  }
  
  const allowSessionHeaderFallback =
    process.env.ENABLE_SESSION_HEADER_FALLBACK === "true" &&
    process.env.NODE_ENV !== "production";

  // 2. Session header fallback for cross-origin requests (dev-only)
  if (!req.session.userId && allowSessionHeaderFallback) {
    const sessionIdHeader = req.headers['x-session-id'] as string;
    
    if (sessionIdHeader) {
      const sessionStore = req.sessionStore;
      await new Promise<void>((resolve) => {
        sessionStore.get(sessionIdHeader, (err, sessionData) => {
          if (err) {
            console.error("[Session] Error loading session from header:", err.message);
          }
          if (!err && sessionData && sessionData.userId) {
            req.session.userId = sessionData.userId;
          }
          resolve();
        });
      });
    }
  }
  
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  const { storage } = await import("./storage");
  const user = await storage.getUser(req.session.userId);
  
  if (!user || !user.isAdmin) {
    return res.status(403).json({ message: "Forbidden - Admin access required" });
  }
  
  next();
};
