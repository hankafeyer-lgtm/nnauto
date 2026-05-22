import { useEffect, useImperativeHandle, useRef, useState, forwardRef } from "react";
import {
  Turnstile,
  type TurnstileInstance,
} from "@marsidev/react-turnstile";
import { Loader2, RefreshCw } from "lucide-react";

interface ReliableTurnstileProps {
  siteKey: string;
  onSuccess: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  /** Render only when the parent dialog/page is fully visible. Required for
   *  iOS Safari where the widget can fail to paint if mounted during a
   *  CSS transition. */
  ready?: boolean;
  /** Cloudflare widget options. Defaults are tuned for mobile reliability. */
  theme?: "light" | "dark" | "auto";
  language?: string;
}

export type ReliableTurnstileHandle = TurnstileInstance;

const FALLBACK_TIMEOUT_MS = 8000;

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
 */
const ReliableTurnstile = forwardRef<
  ReliableTurnstileHandle,
  ReliableTurnstileProps
>(function ReliableTurnstile(
  { siteKey, onSuccess, onError, onExpire, ready = true, theme = "light", language = "cs" },
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
  const [status, setStatus] = useState<"loading" | "ok" | "error" | "timeout">(
    "loading",
  );

  // Defer the actual mount one frame after `ready` becomes true so the
  // surrounding dialog/page has fully painted. iOS Safari occasionally
  // skips iframe rendering when mounted during an animation, which leaves
  // the user staring at an empty space (the reported bug).
  useEffect(() => {
    if (!ready) {
      setMounted(false);
      setStatus("loading");
      return;
    }
    let raf1 = 0;
    let raf2 = 0;
    let timer = 0 as unknown as ReturnType<typeof setTimeout>;
    raf1 = window.requestAnimationFrame(() => {
      raf2 = window.requestAnimationFrame(() => {
        timer = setTimeout(() => setMounted(true), 80);
      });
    });
    return () => {
      window.cancelAnimationFrame(raf1);
      window.cancelAnimationFrame(raf2);
      clearTimeout(timer);
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
    setStatus("loading");
    setMounted(false);
    setMountTick((n) => n + 1);
    innerRef.current?.reset();
  };

  if (!ready) {
    return (
      <div
        className="flex h-[70px] w-full max-w-[300px] items-center justify-center rounded-md border border-dashed border-muted-foreground/30 bg-muted/30"
        aria-hidden="true"
      />
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
      {!mounted || status === "loading" ? (
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
            innerRef.current = instance;
          }}
          siteKey={siteKey}
          onSuccess={handleSuccess}
          onError={handleError}
          onExpire={handleExpire}
          options={{
            theme,
            language,
            size: "flexible",
            appearance: "always",
            retry: "auto",
            retryInterval: 2000,
            refreshExpired: "auto",
          }}
        />
      ) : null}
    </div>
  );
});

export default ReliableTurnstile;
