"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/lib/translations";
import { Link } from "@/lib/navigation";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Cookie } from "lucide-react";
import {
  getConsent,
  saveConsent,
  OPEN_SETTINGS_EVENT,
} from "@/lib/cookieConsent";

/**
 * GDPR / ePrivacy cookie consent.
 *
 * Level 1 — compact bottom banner with three equally reachable actions
 * (Accept all / Only necessary / Settings). No category toggles here.
 * Level 2 — a separate dialog (opened from "Nastavení" or a footer link)
 * with per-category toggles that default to OFF.
 *
 * Analytics/marketing trackers stay disabled until the user consents
 * (see app/layout.tsx + lib/cookieConsent runWhenConsent).
 */
export default function CookieConsentBanner() {
  const t = useTranslation();
  // Assume decided until mounted so the banner never flashes during SSR/hydration.
  const [decided, setDecided] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const current = getConsent();
    setDecided(!!current);
    if (current) {
      setAnalytics(current.analytics);
      setMarketing(current.marketing);
    }
    const openHandler = () => {
      const c = getConsent();
      setAnalytics(c?.analytics ?? false);
      setMarketing(c?.marketing ?? false);
      setSettingsOpen(true);
    };
    window.addEventListener(OPEN_SETTINGS_EVENT, openHandler);
    return () => window.removeEventListener(OPEN_SETTINGS_EVENT, openHandler);
  }, []);

  const acceptAll = () => {
    saveConsent({ analytics: true, marketing: true });
    setDecided(true);
    setSettingsOpen(false);
  };
  const rejectAll = () => {
    saveConsent({ analytics: false, marketing: false });
    setDecided(true);
    setSettingsOpen(false);
  };
  const saveChoice = () => {
    saveConsent({ analytics, marketing });
    setDecided(true);
    setSettingsOpen(false);
  };

  const showBanner = !decided && !settingsOpen;

  return (
    <>
      {showBanner ? (
        <div
          className="fixed inset-x-0 bottom-0 z-[120] p-3 sm:p-4"
          role="dialog"
          aria-label={t("cookie.title")}
          data-testid="cookie-consent-banner"
        >
          <div className="mx-auto w-full max-w-[640px] rounded-2xl border bg-background/95 backdrop-blur shadow-2xl p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <Cookie className="h-6 w-6 text-primary shrink-0 mt-0.5" />
              <div className="min-w-0 space-y-1.5">
                <p className="font-semibold leading-tight">{t("cookie.title")}</p>
                <p className="text-sm text-muted-foreground">
                  {t("cookie.description")}
                </p>
                <Link
                  href="/privacy#cookies"
                  prefetch={false}
                  className="inline-block text-sm text-primary underline underline-offset-2"
                >
                  {t("cookie.more")}
                </Link>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={acceptAll}
                  data-testid="cookie-accept-all"
                >
                  {t("cookie.acceptAll")}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={rejectAll}
                  data-testid="cookie-reject"
                >
                  {t("cookie.reject")}
                </Button>
              </div>
              <Button
                variant="ghost"
                className="w-full text-muted-foreground"
                onClick={() => setSettingsOpen(true)}
                data-testid="cookie-settings"
              >
                {t("cookie.settings")}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-w-md" data-testid="cookie-settings-dialog">
          <DialogHeader>
            <DialogTitle>{t("cookie.settingsTitle")}</DialogTitle>
            <DialogDescription>{t("cookie.settingsDesc")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-1">
            <ConsentRow
              title={t("cookie.necessary")}
              description={t("cookie.necessaryDesc")}
              checked
              disabled
              badge={t("cookie.alwaysActive")}
            />
            <ConsentRow
              title={t("cookie.analytics")}
              description={t("cookie.analyticsDesc")}
              checked={analytics}
              onChange={setAnalytics}
              testId="cookie-toggle-analytics"
            />
            <ConsentRow
              title={t("cookie.marketing")}
              description={t("cookie.marketingDesc")}
              checked={marketing}
              onChange={setMarketing}
              testId="cookie-toggle-marketing"
            />
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button
              className="w-full"
              onClick={saveChoice}
              data-testid="cookie-save"
            >
              {t("cookie.save")}
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={acceptAll}
                data-testid="cookie-dialog-accept-all"
              >
                {t("cookie.acceptAll")}
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={rejectAll}
                data-testid="cookie-dialog-reject"
              >
                {t("cookie.reject")}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ConsentRow({
  title,
  description,
  checked,
  disabled = false,
  onChange,
  testId,
  badge,
}: {
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (v: boolean) => void;
  testId?: string;
  badge?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border bg-muted/20 p-3">
      <div className="min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <Switch
          checked={checked}
          disabled={disabled}
          onCheckedChange={onChange}
          data-testid={testId}
        />
        {badge ? (
          <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            {badge}
          </span>
        ) : null}
      </div>
    </div>
  );
}
