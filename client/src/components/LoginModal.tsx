import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect, useRef, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient, setSessionId } from "@/lib/queryClient";
import { useTranslation } from "@/lib/translations";
import { Eye, EyeOff, Shield, CheckCircle } from "lucide-react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import Swal from "sweetalert2";
import { useLocation } from "wouter";
interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTab?: "login" | "register";
}

const TURNSTILE_SITE_KEY =
  import.meta.env.VITE_TURNSTILE_SITE_KEY || "1x00000000000000000000AA";

export default function LoginModal({
  open,
  onOpenChange,
  initialTab = "login",
}: LoginModalProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerFirstName, setRegisterFirstName] = useState("");
  const [registerLastName, setRegisterLastName] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [loginTurnstileToken, setLoginTurnstileToken] = useState<string>("");
  const [registerTurnstileToken, setRegisterTurnstileToken] =
    useState<string>("");
  const [loginVerified, setLoginVerified] = useState(false);
  const [registerVerified, setRegisterVerified] = useState(false);
  const loginTurnstileRef = useRef<TurnstileInstance>(null);
  const registerTurnstileRef = useRef<TurnstileInstance>(null);
  const [, setLocation] = useLocation();

  const { toast } = useToast();
  const t = useTranslation();
  const reloadAfterAuth = useCallback(() => {
    setTimeout(() => window.location.reload(), 250);
  }, []);

  useEffect(() => {
    if (open) {
      setActiveTab(initialTab);
    } else {
      setLoginTurnstileToken("");
      setRegisterTurnstileToken("");
      setLoginVerified(false);
      setRegisterVerified(false);
      loginTurnstileRef.current?.reset();
      registerTurnstileRef.current?.reset();
    }
  }, [open, initialTab]);

  const handleLoginTurnstileSuccess = useCallback((token: string) => {
    setLoginTurnstileToken(token);
    setLoginVerified(true);
  }, []);

  const handleRegisterTurnstileSuccess = useCallback((token: string) => {
    setRegisterTurnstileToken(token);
    setRegisterVerified(true);
  }, []);

  const loginMutation = useMutation({
    mutationFn: async (data: {
      email: string;
      password: string;
      turnstileToken: string;
    }) => {
      const res = await apiRequest("POST", "/api/login", data);
      return await res.json();
    },
    onSuccess: (data) => {
      // Store JWT token for production cross-domain auth
      console.log(
        "[AUTH] Login response received, token exists:",
        !!data.token,
      );
      if (data.token) {
        localStorage.setItem("nnauto_token", data.token);
        console.log("[AUTH] JWT token stored, length:", data.token.length);
      } else {
        console.warn("[AUTH] No token in login response!");
      }

      // Store session ID for Replit webview fallback
      if (data.sessionId) {
        setSessionId(data.sessionId);
      }

      // Store user in localStorage for production fallback (session issues)
      if (data.user) {
        localStorage.setItem("nnauto_user", JSON.stringify(data.user));
      }

      // Normalize auth cache shape to ensure consistent structure
      queryClient.setQueryData(["/api/auth/user"], {
        user: data.user ?? null,
        sessionId: data.sessionId ?? null,
      });

      // PURGE listings cache to prevent stale anonymous data from showing after login/register
      queryClient.removeQueries({
        predicate: (query) => query.queryKey[0] === "/api/listings",
      });

      toast({
        title: t("auth.loginSuccess"),
        description: t("auth.loginSuccessDescription"),
      });
      onOpenChange(false);
      setEmail("");
      setPassword("");
      setLoginTurnstileToken("");
      setLoginVerified(false);
      loginTurnstileRef.current?.reset();
      reloadAfterAuth();
    },
    onError: (error: any) => {
      // Reset Turnstile for retry (tokens are single-use)
      setLoginTurnstileToken("");
      setLoginVerified(false);
      loginTurnstileRef.current?.reset();

      // Parse error message - apiRequest throws "status: body" format
      let errorMsg = t("auth.loginErrorDescription");
      if (error.message) {
        try {
          const match = error.message.match(/:\s*(.+)$/);
          if (match) {
            const parsed = JSON.parse(match[1]);
            errorMsg = parsed.error || errorMsg;
          }
        } catch {
          errorMsg = error.message;
        }
      }
      toast({
        variant: "destructive",
        title: t("auth.loginError"),
        description: errorMsg,
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: {
      email: string;
      password: string;
      firstName?: string;
      lastName?: string;
      phone: string;
      turnstileToken: string;
    }) => {
      const res = await apiRequest("POST", "/api/register", data);
      return await res.json();
    },
    onSuccess: async (data) => {
      // Store JWT token for production cross-domain auth
      if (data.token) {
        localStorage.setItem("nnauto_token", data.token);
        console.log("[AUTH] JWT token stored after registration");
      }

      // Store session ID for Replit webview fallback
      if (data.sessionId) {
        setSessionId(data.sessionId);
      }

      // Store user in localStorage for production fallback (session issues)
      if (data.user) {
        localStorage.setItem("nnauto_user", JSON.stringify(data.user));
      }

      // Normalize auth cache shape to ensure consistent structure
      queryClient.setQueryData(["/api/auth/user"], {
        user: data.user ?? null,
        sessionId: data.sessionId ?? null,
      });

      // PURGE listings cache to prevent stale anonymous data from showing after login/register
      queryClient.removeQueries({
        predicate: (query) => query.queryKey[0] === "/api/listings",
      });

      toast({
        title: t("auth.registerSuccess"),
        description: t("auth.registerSuccessDescription"),
      });
      onOpenChange(false);
      setRegisterEmail("");
      setRegisterPassword("");
      setRegisterFirstName("");
      setRegisterLastName("");
      setRegisterPhone("");
      setRegisterTurnstileToken("");
      setRegisterVerified(false);
      registerTurnstileRef.current?.reset();
      // reloadAfterAuth();
      await Swal.fire({
        icon: "success",
        title: t("auth.registerSuccessPopupTitle"),
        text: t("auth.registerSuccessPopupText"),
        confirmButtonText: t("auth.continue"),
      });

      // ✅ редірект на сторінку додавання оголошення
      setLocation("/add-listing");
    },
    onError: (error: any) => {
      // Reset Turnstile for retry (tokens are single-use)
      setRegisterTurnstileToken("");
      setRegisterVerified(false);
      registerTurnstileRef.current?.reset();

      // Parse error message - apiRequest throws "status: body" format
      let errorMsg = t("auth.registerErrorDescription");
      if (error.message) {
        try {
          const match = error.message.match(/:\s*(.+)$/);
          if (match) {
            const parsed = JSON.parse(match[1]);
            errorMsg = parsed.error || errorMsg;
          }
        } catch {
          errorMsg = error.message;
        }
      }
      toast({
        variant: "destructive",
        title: t("auth.registerError"),
        description: errorMsg,
      });
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginTurnstileToken) {
      toast({
        variant: "destructive",
        title: t("auth.verificationRequired"),
        description: t("auth.pleaseVerify"),
      });
      return;
    }
    loginMutation.mutate({
      email,
      password,
      turnstileToken: loginTurnstileToken,
    });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerTurnstileToken) {
      toast({
        variant: "destructive",
        title: t("auth.verificationRequired"),
        description: t("auth.pleaseVerify"),
      });
      return;
    }
    registerMutation.mutate({
      email: registerEmail,
      password: registerPassword,
      firstName: registerFirstName || undefined,
      lastName: registerLastName || undefined,
      phone: registerPhone,
      turnstileToken: registerTurnstileToken,
    });
  };

  const forgotPasswordMutation = useMutation({
    mutationFn: async (data: { email: string }) => {
      const res = await apiRequest("POST", "/api/auth/forgot-password", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: t("auth.passwordSentSuccess"),
        description: t("auth.passwordSentDescription"),
      });
      setForgotPasswordOpen(false);
      setForgotPasswordEmail("");
    },
    onError: (error: any) => {
      let errorMsg = t("auth.passwordSentError");
      if (error.message) {
        try {
          const match = error.message.match(/:\s*(.+)$/);
          if (match) {
            const parsed = JSON.parse(match[1]);
            errorMsg = parsed.error || errorMsg;
          }
        } catch {
          errorMsg = error.message;
        }
      }
      toast({
        variant: "destructive",
        title: t("auth.passwordSentError"),
        description: errorMsg,
      });
    },
  });

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    forgotPasswordMutation.mutate({ email: forgotPasswordEmail });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("auth.login")}</DialogTitle>
            <DialogDescription>{t("auth.loginOrRegister")}</DialogDescription>
          </DialogHeader>

          <Tabs
            value={activeTab}
            onValueChange={(value) =>
              setActiveTab(value as "login" | "register")
            }
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger
                value="login"
                data-testid="tab-login"
                className="text-black dark:text-white"
              >
                {t("auth.login")}
              </TabsTrigger>
              <TabsTrigger
                value="register"
                data-testid="tab-register"
                className="text-black dark:text-white"
              >
                {t("auth.register")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t("auth.email")}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t("auth.emailPlaceholder")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="text-black dark:text-white"
                    data-testid="input-login-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">{t("auth.password")}</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showLoginPassword ? "text" : "password"}
                      placeholder={t("auth.passwordPlaceholder")}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="text-black dark:text-white pr-10"
                      data-testid="input-login-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      data-testid="button-toggle-login-password"
                    >
                      {showLoginPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    <span>{t("auth.securityVerification")}</span>
                  </div>

                  {loginVerified ? (
                    <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 px-4 py-2 rounded-lg">
                      <CheckCircle className="h-4 w-4" />
                      <span>{t("auth.verified")}</span>
                    </div>
                  ) : (
                    <Turnstile
                      ref={loginTurnstileRef}
                      siteKey={TURNSTILE_SITE_KEY}
                      onSuccess={handleLoginTurnstileSuccess}
                      onError={() => {
                        setLoginVerified(false);
                        setLoginTurnstileToken("");
                      }}
                      onExpire={() => {
                        setLoginVerified(false);
                        setLoginTurnstileToken("");
                      }}
                      options={{
                        theme: "light",
                        size: "normal",
                      }}
                    />
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loginMutation.isPending || !loginVerified}
                  data-testid="button-login-submit"
                >
                  {loginMutation.isPending
                    ? t("auth.loggingIn")
                    : t("auth.login")}
                </Button>
                <div className="text-center mt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-sm text-muted-foreground hover:text-primary"
                    onClick={() => setForgotPasswordOpen(true)}
                    data-testid="button-forgot-password"
                  >
                    {t("auth.forgotPassword")}
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="register-first-name">
                      {t("auth.firstName")}
                    </Label>
                    <Input
                      id="register-first-name"
                      type="text"
                      placeholder={t("auth.firstNamePlaceholder")}
                      value={registerFirstName}
                      onChange={(e) => setRegisterFirstName(e.target.value)}
                      className="text-black dark:text-white"
                      data-testid="input-register-first-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-last-name">
                      {t("auth.lastName")}
                    </Label>
                    <Input
                      id="register-last-name"
                      type="text"
                      placeholder={t("auth.lastNamePlaceholder")}
                      value={registerLastName}
                      onChange={(e) => setRegisterLastName(e.target.value)}
                      className="text-black dark:text-white"
                      data-testid="input-register-last-name"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email">{t("auth.email")}</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder={t("auth.emailPlaceholder")}
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    required
                    className="text-black dark:text-white"
                    data-testid="input-register-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">
                    {t("auth.password")}
                  </Label>
                  <div className="relative">
                    <Input
                      id="register-password"
                      type={showRegisterPassword ? "text" : "password"}
                      placeholder={t("auth.passwordPlaceholder")}
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      required
                      className="text-black dark:text-white pr-10"
                      data-testid="input-register-password"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowRegisterPassword(!showRegisterPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      data-testid="button-toggle-register-password"
                    >
                      {showRegisterPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-phone">{t("auth.phone")} *</Label>
                  <Input
                    id="register-phone"
                    type="tel"
                    placeholder="+420 XXX XXX XXX"
                    value={registerPhone}
                    onChange={(e) => setRegisterPhone(e.target.value)}
                    required
                    className="text-black dark:text-white"
                    data-testid="input-register-phone"
                  />
                </div>
                <div className="flex flex-col items-center gap-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    <span>{t("auth.securityVerification")}</span>
                  </div>

                  {registerVerified ? (
                    <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 px-4 py-2 rounded-lg">
                      <CheckCircle className="h-4 w-4" />
                      <span>{t("auth.verified")}</span>
                    </div>
                  ) : (
                    <Turnstile
                      ref={registerTurnstileRef}
                      siteKey={TURNSTILE_SITE_KEY}
                      onSuccess={handleRegisterTurnstileSuccess}
                      onError={() => {
                        setRegisterVerified(false);
                        setRegisterTurnstileToken("");
                      }}
                      onExpire={() => {
                        setRegisterVerified(false);
                        setRegisterTurnstileToken("");
                      }}
                      options={{
                        theme: "light",
                        size: "normal",
                      }}
                    />
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={registerMutation.isPending || !registerVerified}
                  data-testid="button-register-submit"
                >
                  {registerMutation.isPending
                    ? t("auth.registering")
                    : t("auth.register")}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Forgot Password Dialog */}
      <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("auth.forgotPasswordTitle")}</DialogTitle>
            <DialogDescription>
              {t("auth.forgotPasswordDescription")}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="forgot-email">{t("auth.email")}</Label>
              <Input
                id="forgot-email"
                type="email"
                placeholder={t("auth.emailPlaceholder")}
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                required
                className="text-black dark:text-white"
                data-testid="input-forgot-password-email"
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setForgotPasswordOpen(false);
                  setForgotPasswordEmail("");
                }}
                data-testid="button-forgot-password-cancel"
              >
                {t("auth.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={forgotPasswordMutation.isPending}
                data-testid="button-forgot-password-submit"
              >
                {forgotPasswordMutation.isPending
                  ? t("auth.sending")
                  : t("auth.sendPassword")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
