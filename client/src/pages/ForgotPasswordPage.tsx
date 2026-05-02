"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/translations";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");

  const forgotPasswordMutation = useMutation({
    mutationFn: async (data: { email: string }) => {
      const res = await apiRequest("POST", "/api/auth/forgot-password", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: t("auth.forgotPasswordTitle"),
        description: t("auth.forgotPasswordDescription"),
      });
      setEmail("");
    },
    onError: () => {
      toast({
        title: "Chyba",
        description: "Něco se pokazilo. Zkuste to prosím znovu.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      forgotPasswordMutation.mutate({ email: email.trim() });
    }
  };

  return (
    <>
      <SEO title="Zapomenuté heslo | NNAuto" description="Obnovte si heslo k účtu na NNAuto." />
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

              <Button
                type="submit"
                className="w-full"
                disabled={forgotPasswordMutation.isPending}
                data-testid="button-forgot-password-submit"
              >
                {forgotPasswordMutation.isPending
                  ? t("auth.sending")
                  : t("auth.sendPassword")}
              </Button>

              <div className="text-center">
                <Link
                  href="/settings"
                  className="text-sm text-muted-foreground underline hover:text-primary transition-colors"
                >
                  {t("auth.cancel")}
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </>
  );
}
