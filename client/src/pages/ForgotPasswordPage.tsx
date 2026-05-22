"use client";

import { useState, useRef, useCallback } from "react";
import { useTranslation } from "@/lib/translations";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "@/lib/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Mail } from "lucide-react";
import ReliableTurnstile, {
  type ReliableTurnstileHandle,
} from "@/components/ReliableTurnstile";

const TURNSTILE_SITE_KEY =
  (typeof import.meta !== "undefined" &&
    import.meta.env?.VITE_TURNSTILE_SITE_KEY) ||
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ||
  "1x00000000000000000000AA";

const TURNSTILE_UI_OFF =
  typeof process !== "undefined" &&
  process.env.NEXT_PUBLIC_TURNSTILE_UI_OFF === "true";

export default function ForgotPasswordPage() {
  const t = useTranslation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedAt, setSubmittedAt] = useState<number | null>(null);
  const turnstileRef = useRef<ReliableTurnstileHandle>(null);

  const handleTurnstileSuccess = useCallback((tok: string) => {
    setTurnstileToken(tok);
  }, []);

  const forgotPasswordMutation = useMutation({
    mutationFn: async (data: { email: string; turnstileToken: string }) => {
      const res = await apiRequest("POST", "/api/auth/forgot-password", data);
      return await res.json();
    },
    onSuccess: () => {
      setSubmittedAt(Date.now());
      toast({
        title: t("auth.forgotPasswordTitle"),
        description:
          "Pokud je e-mail registrován, byl vám odeslán odkaz pro obnovení hesla.",
      });
      setTurnstileToken("");
      turnstileRef.current?.reset();
    },
    onError: (err: any) => {
      const msg = err?.message || "Něco se pokazilo. Zkuste to prosím znovu.";
      setErrorMessage(msg);
      setTurnstileToken("");
      turnstileRef.current?.reset();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!email.trim()) {
      setErrorMessage("Zadejte prosím e-mail.");
      return;
    }
    if (!TURNSTILE_UI_OFF && !turnstileToken) {
      setErrorMessage("Dokončete prosím bezpečnostní ověření.");
      return;
    }
    forgotPasswordMutation.mutate({
      email: email.trim(),
      turnstileToken: turnstileToken || "",
    });
  };

  return (
    <>
      <SEO
        title="Zapomenuté heslo | NNAuto"
        description="Obnovte si heslo k účtu na NNAuto."
        noindex
      />
      <Header />
      <main className="min-h-[60vh] flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              {t("auth.forgotPasswordTitle")}
            </CardTitle>
            <CardDescription>
              {t("auth.forgotPasswordDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submittedAt ? (
              <div className="space-y-4 text-sm">
                <p>
                  Pokud je e-mail <strong>{email}</strong> registrován,
                  zaslali jsme vám odkaz pro obnovení hesla. Zkontrolujte
                  schránku (i složku spam).
                </p>
                <p className="text-muted-foreground">
                  Odkaz je platný 15 minut a lze jej použít jen jednou.
                </p>
                <div className="flex gap-3">
                  <Link
                    href="/"
                    className="text-sm text-muted-foreground underline hover:text-primary transition-colors"
                  >
                    Zpět na hlavní stránku
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="forgot-email">Email</Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder={t("auth.emailPlaceholder")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    data-testid="input-forgot-password-email"
                  />
                </div>

                {!TURNSTILE_UI_OFF && (
                  <div className="flex justify-center">
                    <ReliableTurnstile
                      ref={turnstileRef}
                      siteKey={TURNSTILE_SITE_KEY}
                      theme="auto"
                      onSuccess={handleTurnstileSuccess}
                      onError={() => setTurnstileToken("")}
                      onExpire={() => setTurnstileToken("")}
                    />
                  </div>
                )}

                {errorMessage && (
                  <p className="text-sm text-destructive" role="alert">
                    {errorMessage}
                  </p>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={forgotPasswordMutation.isPending}
                  data-testid="button-forgot-password-submit"
                >
                  {forgotPasswordMutation.isPending
                    ? t("auth.sending")
                    : "Odeslat odkaz pro obnovení"}
                </Button>

                <div className="text-center">
                  <Link
                    href="/"
                    className="text-sm text-muted-foreground underline hover:text-primary transition-colors"
                  >
                    {t("auth.cancel")}
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </>
  );
}
