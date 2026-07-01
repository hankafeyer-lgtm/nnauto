import { useEffect, useImperativeHandle, useRef, useState, forwardRef } from "react";
import {
  Turnstile,
  type TurnstileInstance,
} from "@marsidev/react-turnstile";
import { Loader2, RefreshCw, AlertTriangle } from "lucide-react";

interface ReliableTurnstileProps {
  siteKey: string;
  onSuccess: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  /** Called when all retry attempts are exhausted and the widget cannot load. */
  onRetriesExhausted?: () => void;
  /** Render only when the parent dialog/page is fully visible. Required for
   *  iOS Safari where the widget can fail to paint if mounted during a
   *  CSS transition. */
  ready?: boolean;
  /** Cloudflare widget options. Defaults are tuned for mobile reliability. */
  theme?: "light" | "dark" | "auto";
  language?: string;
  maxRetries?: number;
}

export type ReliableTurnstileHandle = TurnstileInstance;

const FALLBACK_TIMEOUT_MS = 6_000;
const DEFAULT_MAX_RETRIES = 2;

/**
 * Wraps `@marsidev/react-turnstile` with iOS Safari / slow-network safeguards:
 *   - Deferred mount until parent dialog is visible (`ready` prop) and a
 *     short rAF tick has passed, so the widget never initializes mid-
 *     animation (root cause of empty widget on iOS).
 *   - Always uses size="flexible" so the widget fills the container width
 *     instead of the unreliable compact 130×120 layout on phones.
 *   - Shows a loading skeleton with reserved height to avoid layout shift.
 *   - After FALLBACK_TIMEOUT_MS without success or error, shows a user-
 *     visible "Obnovit ověření" retry button that re-mounts the widget.
 *   - After maxRetries exhausted, calls onRetriesExhausted so the parent
 *     can let the user proceed without client-side verification.
 */
const ReliableTurnstile = forwardRef<
  ReliableTurnstileHandle,
  ReliableTurnstileProps
>(function ReliableTurnstile(
  { siteKey, onSuccess, onError, onExpire, onRetriesExhausted, ready = true, theme = "light", language = "cs", maxRetries = DEFAULT_MAX_RETRIES },
  ref,
) {
  const innerRef = useRef<TurnstileInstance | null>(null);
  useImperativeHandle(
    ref,
    () => innerRef.current as TurnstileInstance,
    [],
  );

  const [mountTick, setMountTick] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [widgetPainted, setWidgetPainted] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [status, setStatus] = useState<"loading" | "ok" | "error" | "timeout" | "exhausted">(
    "loading",
  );

  // Mount as soon as the parent dialog is ready. Extra rAF delays made the
  // widget feel stuck on "loading" especially on desktop Safari.
  useEffect(() => {
    if (!ready) {
      setMounted(false);
      setWidgetPainted(false);
      setStatus("loading");
      return;
    }
    setMounted(true);
    return () => {
      setMounted(false);
      setWidgetPainted(false);
    };
  }, [ready, mountTick]);

  // Fallback timeout: if no success/error arrived after N seconds, give the
  // user a way out instead of leaving them stuck on an empty widget.
  useEffect(() => {
    if (!mounted || status !== "loading") return;
    const id = setTimeout(() => {
      setStatus((s) => (s === "loading" ? "timeout" : s));
    }, FALLBACK_TIMEOUT_MS);
    return () => clearTimeout(id);
  }, [mounted, status]);

  const handleSuccess = (token: string) => {
    setStatus("ok");
    onSuccess(token);
  };
  const handleError = () => {
    setStatus("error");
    onError?.();
  };
  const handleExpire = () => {
    setStatus("loading");
    onExpire?.();
  };

  const retry = () => {
    const nextRetry = retryCount + 1;
    if (nextRetry >= maxRetries) {
      setStatus("exhausted");
      onRetriesExhausted?.();
      return;
    }
    setRetryCount(nextRetry);
    setStatus("loading");
    setMounted(false);
    setWidgetPainted(false);
    // Do NOT call innerRef.current?.reset() here — the widget is about to
    // be unmounted and re-created with a new key, so calling reset() on a
    // widget that is simultaneously being destroyed causes the Turnstile SDK
    // to lose track of the instance, leaving the next widget silently dead.
    setMountTick((n) => n + 1);
  };

  if (!ready) {
    return (
      <div
        className="flex h-[70px] w-full max-w-[300px] items-center justify-center rounded-md border border-dashed border-muted-foreground/30 bg-muted/30"
        aria-hidden="true"
      />
    );
  }

  if (status === "exhausted") {
    return (
      <div className="flex w-full max-w-[300px] flex-col items-center gap-2 rounded-md border border-amber-300/60 bg-amber-50 px-3 py-3 text-center text-xs text-amber-900 dark:border-amber-700/50 dark:bg-amber-950/30 dark:text-amber-200">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <span>
          Bezpečnostní ověření je dočasně nedostupné. Můžete pokračovat bez něj.
        </span>
      </div>
    );
  }

  if (status === "timeout" || status === "error") {
    return (
      <div className="flex w-full max-w-[300px] flex-col items-center gap-2 rounded-md border border-amber-300/60 bg-amber-50 px-3 py-3 text-center text-xs text-amber-900 dark:border-amber-700/50 dark:bg-amber-950/30 dark:text-amber-200">
        <span>
          Ověření se nepodařilo načíst. Zkontrolujte připojení a zkuste znovu.
        </span>
        <button
          type="button"
          onClick={retry}
          className="inline-flex items-center gap-1.5 rounded-md bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700"
          data-testid="button-turnstile-retry"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Obnovit ověření
        </button>
      </div>
    );
  }

  return (
    <div
      className="relative flex min-h-[70px] w-full max-w-[300px] items-center justify-center"
      data-testid="turnstile-container"
    >
      {!widgetPainted && status === "loading" ? (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center text-muted-foreground"
          aria-hidden="true"
        >
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      ) : null}
      {mounted ? (
        <Turnstile
          key={mountTick}
          ref={(instance) => {
            innerRef.current = instance ?? null;
          }}
          siteKey={siteKey}
          onLoadScript={() => setWidgetPainted(true)}
          onWidgetLoad={() => setWidgetPainted(true)}
          onSuccess={handleSuccess}
          onError={handleError}
          onExpire={handleExpire}
          options={{
            theme,
            language,
            size: "normal",
            appearance: "interaction-only",
            retry: "auto",
            retryInterval: 1500,
            refreshExpired: "auto",
          }}
        />
      ) : null}
    </div>
  );
});

export default ReliableTurnstile;
