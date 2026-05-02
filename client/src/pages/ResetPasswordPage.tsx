"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
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
import { Link, useLocation } from "@/lib/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Lock, Eye, EyeOff } from "lucide-react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";

const TURNSTILE_SITE_KEY =
  (typeof import.meta !== "undefined" &&
    import.meta.env?.VITE_TURNSTILE_SITE_KEY) ||
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ||
  "1x00000000000000000000AA";

const TURNSTILE_UI_OFF =
  typeof process !== "undefined" &&
  process.env.NEXT_PUBLIC_TURNSTILE_UI_OFF === "true";

export default function ResetPasswordPage() {
  const t = useTranslation();
  const { toast } = useToast();
  const params = useSearchParams();
  const [, navigate] = useLocation();
  const token = useMemo(() => params.get("token") || "", [params]);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const turnstileRef = useRef<TurnstileInstance>(null);

  const handleTurnstileSuccess = useCallback((tok: string) => {
    setTurnstileToken(tok);
  }, []);

  const resetMutation = useMutation({
    mutationFn: async (data: {
      token: string;
      newPassword: string;
      turnstileToken: string;
    }) => {
      const res = await apiRequest("POST", "/api/auth/reset-password", data);
      return await res.json();
    },
    onSuccess: () => {
      setDone(true);
      toast({
        title: "Heslo bylo změněno",
        description: "Nyní se můžete přihlásit s novým heslem.",
      });
      setTimeout(() => navigate("/"), 1500);
    },
    onError: (err: any) => {
      const msg = err?.message || "Reset link is invalid or has expired.";
      setErrorMessage(msg);
      setTurnstileToken("");
      turnstileRef.current?.reset();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!token) {
      setErrorMessage("Chybí token pro obnovení hesla.");
      return;
    }
    if (newPassword.length < 6) {
      setErrorMessage("Heslo musí mít alespoň 6 znaků.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage("Hesla se neshodují.");
      return;
    }
    if (!TURNSTILE_UI_OFF && !turnstileToken) {
      setErrorMessage("Dokončete prosím bezpečnostní ověření.");
      return;
    }

    resetMutation.mutate({
      token,
      newPassword,
      turnstileToken: turnstileToken || "",
    });
  };

  return (
    <>
      <SEO
        title="Nastavení nového hesla | NNAuto"
        description="Nastavte si nové heslo k účtu na NNAuto."
        noindex
      />
      <Header />
      <main className="min-h-[60vh] flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Nastavení nového hesla
            </CardTitle>
            <CardDescription>
              Zadejte nové heslo k vašemu účtu. Odkaz je platný 15 minut a lze
              jej použít jen jednou.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!token ? (
              <div className="text-sm text-destructive">
                Chybí token pro obnovení hesla. Zkontrolujte odkaz v e-mailu nebo
                si{" "}
                <Link href="/forgot-password" className="underline">
                  vyžádejte nový
                </Link>
                .
              </div>
            ) : done ? (
              <div className="space-y-3 text-sm">
                <p>Heslo bylo úspěšně změněno. Přesměrováváme vás…</p>
                <Link href="/" className="underline">
                  Pokračovat na hlavní stránku
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nové heslo</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Alespoň 6 znaků"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                      className="pr-10"
                      data-testid="input-reset-new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="toggle password visibility"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Potvrzení hesla</Label>
                  <Input
                    id="confirm-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Zadejte heslo znovu"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    data-testid="input-reset-confirm-password"
                  />
                </div>

                {!TURNSTILE_UI_OFF && (
                  <div className="flex justify-center">
                    <Turnstile
                      ref={turnstileRef}
                      siteKey={TURNSTILE_SITE_KEY}
                      onSuccess={handleTurnstileSuccess}
                      onError={() => setTurnstileToken("")}
                      onExpire={() => setTurnstileToken("")}
                      options={{ theme: "auto" }}
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
                  disabled={resetMutation.isPending}
                  data-testid="button-reset-submit"
                >
                  {resetMutation.isPending
                    ? "Ukládám…"
                    : "Nastavit nové heslo"}
                </Button>

                <div className="text-center">
                  <Link
                    href="/"
                    className="text-sm text-muted-foreground underline hover:text-primary transition-colors"
                  >
                    Zpět na hlavní stránku
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
