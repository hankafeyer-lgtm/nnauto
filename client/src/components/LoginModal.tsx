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
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useTranslation } from "@/lib/translations";
import { Eye, EyeOff, Shield, CheckCircle } from "lucide-react";
import ReliableTurnstile, {
  type ReliableTurnstileHandle,
} from "@/components/ReliableTurnstile";
import Swal from "sweetalert2";
import { useLocation } from "@/lib/navigation";
import { consumePostAuthRedirect } from "@/lib/authRedirect";
interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTab?: "login" | "register";
}

const TURNSTILE_SITE_KEY =
  (typeof import.meta !== "undefined" &&
    (import.meta as unknown as { env?: { VITE_TURNSTILE_SITE_KEY?: string } }).env
      ?.VITE_TURNSTILE_SITE_KEY) ||
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ||
  "1x00000000000000000000AA";

/** Skip Turnstile UI in local development; production still requires server verification. */
const TURNSTILE_UI_OFF =
  process.env.NODE_ENV !== "production" ||
  (typeof process !== "undefined" &&
    process.env.NEXT_PUBLIC_TURNSTILE_UI_OFF === "true");

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
  const [registerType, setRegisterType] = useState<"private" | "dealer">(
    "private",
  );
  const [dealerCompanyName, setDealerCompanyName] = useState("");
  const [dealerIco, setDealerIco] = useState("");
  const [dealerEmail, setDealerEmail] = useState("");
  const [dealerPassword, setDealerPassword] = useState("");
  const [dealerPhone, setDealerPhone] = useState("");
  const [showDealerPassword, setShowDealerPassword] = useState(false);
  const [dealerTurnstileToken, setDealerTurnstileToken] = useState<string>("");
  const [dealerVerified, setDealerVerified] = useState(false);
  const dealerTurnstileRef = useRef<ReliableTurnstileHandle>(null);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordTurnstileToken, setForgotPasswordTurnstileToken] =
    useState<string>("");
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false);
  const forgotPasswordTurnstileRef = useRef<ReliableTurnstileHandle>(null);
  // Defer Turnstile mount until the dialog open animation has finished —
  // mounting it mid-animation is the root cause of the blank widget seen
  // on iOS Safari.
  const [dialogReady, setDialogReady] = useState(false);
  useEffect(() => {
    if (!open) {
      setDialogReady(false);
      return;
    }
    const id = window.requestAnimationFrame(() => setDialogReady(true));
    return () => window.cancelAnimationFrame(id);
  }, [open]);
  const [forgotDialogReady, setForgotDialogReady] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [loginTurnstileToken, setLoginTurnstileToken] = useState<string>("");
  const [registerTurnstileToken, setRegisterTurnstileToken] =
    useState<string>("");
  const [loginVerified, setLoginVerified] = useState(false);
  const [registerVerified, setRegisterVerified] = useState(false);
  const [loginErrorMessage, setLoginErrorMessage] = useState<string | null>(null);
  const loginTurnstileRef = useRef<ReliableTurnstileHandle>(null);
  const registerTurnstileRef = useRef<ReliableTurnstileHandle>(null);
  const [, setLocation] = useLocation();

  const { toast } = useToast();
  const t = useTranslation();

  // Map raw (often English) server error messages to a localized message in
  // the active site language, so users always see the error in their language.
  const localizeAuthError = (raw?: string): string => {
    const fallback = t("auth.registerErrorDescription");
    if (!raw || typeof raw !== "string") return fallback;
    const m = raw.toLowerCase();
    if (m.includes("email already")) return t("auth.errorEmailExists");
    if (m.includes("username already")) return t("auth.errorUsernameTaken");
    if (m.includes("phone")) return t("auth.errorPhoneRequired");
    if (m.includes("security verification") || m.includes("turnstile"))
      return t("auth.errorTurnstile");
    if (m.includes("too many")) return t("auth.errorRateLimit");
    if (m.includes("invalid") && m.includes("password"))
      return t("auth.errorInvalidCredentials");
    return fallback;
  };

  const extractServerError = (error: unknown): string | undefined => {
    const msg = (error as { message?: string })?.message;
    if (!msg) return undefined;
    try {
      const match = msg.match(/:\s*(.+)$/);
      if (match) {
        const parsed = JSON.parse(match[1]);
        if (parsed?.error) return parsed.error as string;
      }
    } catch {
      return msg;
    }
    return msg;
  };
  const reloadAfterAuth = useCallback(() => {
    setTimeout(() => window.location.reload(), 250);
  }, []);

  useEffect(() => {
    if (open) {
      setActiveTab(initialTab);
    } else {
      setLoginTurnstileToken("");
      setRegisterTurnstileToken("");
      setDealerTurnstileToken("");
      setLoginVerified(false);
      setRegisterVerified(false);
      setDealerVerified(false);
      setLoginErrorMessage(null);
      setRegisterType("private");
      loginTurnstileRef.current?.reset();
      registerTurnstileRef.current?.reset();
      dealerTurnstileRef.current?.reset();
    }
  }, [open, initialTab]);

  useEffect(() => {
    if (activeTab !== "login" && loginErrorMessage) {
      setLoginErrorMessage(null);
    }
  }, [activeTab, loginErrorMessage]);

  const handleLoginTurnstileSuccess = useCallback((token: string) => {
    setLoginTurnstileToken(token);
    setLoginVerified(true);
  }, []);

  const handleLoginTurnstileExhausted = useCallback(() => {
    setLoginTurnstileToken("__client_fallback__");
    setLoginVerified(true);
  }, []);

  const handleRegisterTurnstileSuccess = useCallback((token: string) => {
    setRegisterTurnstileToken(token);
    setRegisterVerified(true);
  }, []);

  const handleRegisterTurnstileExhausted = useCallback(() => {
    setRegisterTurnstileToken("__client_fallback__");
    setRegisterVerified(true);
  }, []);

  const handleDealerTurnstileSuccess = useCallback((token: string) => {
    setDealerTurnstileToken(token);
    setDealerVerified(true);
  }, []);

  const handleDealerTurnstileExhausted = useCallback(() => {
    setDealerTurnstileToken("__client_fallback__");
    setDealerVerified(true);
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
      if (process.env.NODE_ENV !== "production") {
        console.log(
          "[AUTH] Login response received, token exists:",
          !!data.token,
        );
      }
      if (data.token) {
        localStorage.setItem("nnauto_token", data.token);
        if (process.env.NODE_ENV !== "production") {
          console.log("[AUTH] JWT token stored, length:", data.token.length);
        }
      } else {
        console.warn("[AUTH] No token in login response!");
      }

      // Store user in localStorage for production fallback (session issues)
      if (data.user) {
        localStorage.setItem("nnauto_user", JSON.stringify(data.user));
      }

      // Normalize auth cache shape to ensure consistent structure
      queryClient.setQueryData(["/api/auth/user"], {
        user: data.user ?? null,
        sessionId: null,
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
      setLoginErrorMessage(null);
      loginTurnstileRef.current?.reset();
      const next = consumePostAuthRedirect();
      if (next) {
        window.location.assign(next);
        return;
      }
      reloadAfterAuth();
    },
    onError: (error: any) => {
      // Reset Turnstile for retry (tokens are single-use)
      setLoginTurnstileToken("");
      setLoginVerified(false);
      loginTurnstileRef.current?.reset();

      const raw = extractServerError(error);
      const lower = (raw || "").toLowerCase();
      const errorMsg =
        lower.includes("invalid") || lower.includes("credentials") || lower.includes("password") || lower.includes("email")
          ? t("auth.errorInvalidCredentials")
          : lower.includes("too many")
            ? t("auth.errorRateLimit")
            : lower.includes("security verification") || lower.includes("turnstile")
              ? t("auth.errorTurnstile")
              : t("auth.loginErrorDescription");
      setLoginErrorMessage(errorMsg);
      toast({
        variant: "destructive",
        title: t("auth.loginError"),
        description: errorMsg,
        duration: 8000,
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
        if (process.env.NODE_ENV !== "production") {
          console.log("[AUTH] JWT token stored after registration");
        }
      }

      // Store user in localStorage for production fallback (session issues)
      if (data.user) {
        localStorage.setItem("nnauto_user", JSON.stringify(data.user));
      }

      // Normalize auth cache shape to ensure consistent structure
      queryClient.setQueryData(["/api/auth/user"], {
        user: data.user ?? null,
        sessionId: null,
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

      const next = consumePostAuthRedirect();
      if (next) {
        window.location.assign(next);
        return;
      }
      window.location.assign("/profile");
    },
    onError: (error: any) => {
      // Reset Turnstile for retry (tokens are single-use)
      setRegisterTurnstileToken("");
      setRegisterVerified(false);
      registerTurnstileRef.current?.reset();

      const errorMsg = localizeAuthError(extractServerError(error));
      toast({
        variant: "destructive",
        title: t("auth.registerError"),
        description: errorMsg,
        duration: 8000,
      });
    },
  });

  const dealerRegisterMutation = useMutation({
    mutationFn: async (data: {
      companyName: string;
      ico?: string;
      email: string;
      password: string;
      phone: string;
      turnstileToken: string;
    }) => {
      // Step 1 — create the underlying user account (this also returns the JWT
      // that authenticates the dealer-profile call below).
      const regRes = await apiRequest("POST", "/api/register", {
        email: data.email,
        password: data.password,
        firstName: data.companyName,
        phone: data.phone,
        turnstileToken: data.turnstileToken,
      });
      const regData = await regRes.json();
      if (regData.token) {
        localStorage.setItem("nnauto_token", regData.token);
      }
      if (regData.user) {
        localStorage.setItem("nnauto_user", JSON.stringify(regData.user));
      }

      // Step 2 — upgrade the fresh account into a dealer/autobazar profile.
      const dealerRes = await apiRequest("POST", "/api/dealer/register", {
        companyName: data.companyName,
        ico: data.ico || undefined,
        phone: data.phone,
        email: data.email,
      });
      const dealerData = await dealerRes.json();
      return { user: regData.user, dealer: dealerData.dealer };
    },
    onSuccess: async (data) => {
      queryClient.setQueryData(["/api/auth/user"], {
        user: data.user ?? null,
        sessionId: null,
      });
      queryClient.removeQueries({
        predicate: (query) => query.queryKey[0] === "/api/listings",
      });

      toast({
        title: t("auth.dealerRegisterSuccess"),
        description: t("auth.dealerRegisterSuccessDescription"),
      });
      onOpenChange(false);
      setDealerCompanyName("");
      setDealerIco("");
      setDealerEmail("");
      setDealerPassword("");
      setDealerPhone("");
      setDealerTurnstileToken("");
      setDealerVerified(false);
      dealerTurnstileRef.current?.reset();

      window.location.assign("/dealer");
    },
    onError: (error: any) => {
      setDealerTurnstileToken("");
      setDealerVerified(false);
      dealerTurnstileRef.current?.reset();

      const errorMsg = localizeAuthError(extractServerError(error));
      toast({
        variant: "destructive",
        title: t("auth.registerError"),
        description: errorMsg,
        duration: 8000,
      });
    },
  });

  const handleDealerRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!TURNSTILE_UI_OFF && !dealerTurnstileToken) {
      toast({
        variant: "destructive",
        title: t("auth.verificationRequired"),
        description: t("auth.pleaseVerify"),
      });
      return;
    }
    dealerRegisterMutation.mutate({
      companyName: dealerCompanyName,
      ico: dealerIco || undefined,
      email: dealerEmail,
      password: dealerPassword,
      phone: dealerPhone,
      turnstileToken: dealerTurnstileToken || "",
    });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErrorMessage(null);
    if (!TURNSTILE_UI_OFF && !loginTurnstileToken) {
      const verifyMsg = t("auth.pleaseVerify");
      setLoginErrorMessage(verifyMsg);
      toast({
        variant: "destructive",
        title: t("auth.verificationRequired"),
        description: verifyMsg,
      });
      return;
    }
    loginMutation.mutate({
      email,
      password,
      turnstileToken: loginTurnstileToken || "",
    });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!TURNSTILE_UI_OFF && !registerTurnstileToken) {
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
      turnstileToken: registerTurnstileToken || "",
    });
  };

  const forgotPasswordMutation = useMutation({
    mutationFn: async (data: { email: string; turnstileToken: string }) => {
      const res = await apiRequest("POST", "/api/auth/forgot-password", data);
      return await res.json();
    },
    onSuccess: () => {
      setForgotPasswordSent(true);
      toast({
        title: t("auth.passwordSentSuccess"),
        description: t("auth.passwordSentDescription"),
      });
      setForgotPasswordTurnstileToken("");
      forgotPasswordTurnstileRef.current?.reset();
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
      setForgotPasswordTurnstileToken("");
      forgotPasswordTurnstileRef.current?.reset();
    },
  });

  const handleForgotPasswordTurnstileSuccess = useCallback((token: string) => {
    setForgotPasswordTurnstileToken(token);
  }, []);

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!TURNSTILE_UI_OFF && !forgotPasswordTurnstileToken) {
      toast({
        variant: "destructive",
        title: t("auth.passwordSentError"),
        description: "Dokončete prosím bezpečnostní ověření.",
      });
      return;
    }
    forgotPasswordMutation.mutate({
      email: forgotPasswordEmail,
      turnstileToken: forgotPasswordTurnstileToken || "",
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
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
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (loginErrorMessage) setLoginErrorMessage(null);
                    }}
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
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (loginErrorMessage) setLoginErrorMessage(null);
                      }}
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
                {!TURNSTILE_UI_OFF && (
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
                      <ReliableTurnstile
                        ref={loginTurnstileRef}
                        siteKey={TURNSTILE_SITE_KEY}
                        ready={dialogReady && activeTab === "login"}
                        onSuccess={handleLoginTurnstileSuccess}
                        onRetriesExhausted={handleLoginTurnstileExhausted}
                        onError={() => {
                          setLoginVerified(false);
                          setLoginTurnstileToken("");
                        }}
                        onExpire={() => {
                          setLoginVerified(false);
                          setLoginTurnstileToken("");
                        }}
                      />
                    )}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loginMutation.isPending}
                  data-testid="button-login-submit"
                >
                  {loginMutation.isPending
                    ? t("auth.loggingIn")
                    : t("auth.login")}
                </Button>
                {loginErrorMessage && (
                  <p
                    className="text-sm text-destructive text-center"
                    data-testid="text-login-error"
                  >
                    {loginErrorMessage}
                  </p>
                )}
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
              <div className="mb-4 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRegisterType("private")}
                  aria-pressed={registerType === "private"}
                  className={`relative flex flex-col items-start rounded-xl border-2 p-3 pr-8 text-left transition ${
                    registerType === "private"
                      ? "border-primary bg-primary/10 ring-2 ring-primary/40 shadow-sm"
                      : "border-border bg-transparent hover:border-primary/60 hover:bg-muted/40"
                  }`}
                  data-testid="button-account-type-private"
                >
                  {registerType === "private" && (
                    <CheckCircle className="absolute right-2 top-2 h-4 w-4 text-primary" />
                  )}
                  <span className="text-sm font-semibold text-black dark:text-white">
                    {t("auth.accountTypePrivate")}
                  </span>
                  <span className="mt-0.5 text-xs text-muted-foreground">
                    {t("auth.accountTypePrivateHint")}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setRegisterType("dealer")}
                  aria-pressed={registerType === "dealer"}
                  className={`relative flex flex-col items-start rounded-xl border-2 p-3 pr-8 text-left transition ${
                    registerType === "dealer"
                      ? "border-primary bg-primary/10 ring-2 ring-primary/40 shadow-sm"
                      : "border-border bg-transparent hover:border-primary/60 hover:bg-muted/40"
                  }`}
                  data-testid="button-account-type-dealer"
                >
                  {registerType === "dealer" && (
                    <CheckCircle className="absolute right-2 top-2 h-4 w-4 text-primary" />
                  )}
                  <span className="text-sm font-semibold text-black dark:text-white">
                    {t("auth.accountTypeDealer")}
                  </span>
                  <span className="mt-0.5 text-xs text-muted-foreground">
                    {t("auth.accountTypeDealerHint")}
                  </span>
                </button>
              </div>

              {registerType === "private" && (
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
                {!TURNSTILE_UI_OFF && (
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
                      <ReliableTurnstile
                        ref={registerTurnstileRef}
                        siteKey={TURNSTILE_SITE_KEY}
                        ready={dialogReady && activeTab === "register"}
                        onSuccess={handleRegisterTurnstileSuccess}
                        onRetriesExhausted={handleRegisterTurnstileExhausted}
                        onError={() => {
                          setRegisterVerified(false);
                          setRegisterTurnstileToken("");
                        }}
                        onExpire={() => {
                          setRegisterVerified(false);
                          setRegisterTurnstileToken("");
                        }}
                      />
                    )}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={
                    registerMutation.isPending ||
                    (!TURNSTILE_UI_OFF && !registerVerified)
                  }
                  data-testid="button-register-submit"
                >
                  {registerMutation.isPending
                    ? t("auth.registering")
                    : t("auth.register")}
                </Button>
              </form>
              )}

              {registerType === "dealer" && (
              <form onSubmit={handleDealerRegister} className="space-y-4">
                <p className="rounded-lg bg-muted/60 p-3 text-sm text-muted-foreground">
                  {t("auth.dealerIntro")}
                </p>
                <div className="space-y-2">
                  <Label htmlFor="dealer-company-name">
                    {t("dealer.companyName")} *
                  </Label>
                  <Input
                    id="dealer-company-name"
                    type="text"
                    placeholder={t("dealer.companyName")}
                    value={dealerCompanyName}
                    onChange={(e) => setDealerCompanyName(e.target.value)}
                    required
                    className="text-black dark:text-white"
                    data-testid="input-dealer-company-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dealer-ico">{t("dealer.ico")}</Label>
                  <Input
                    id="dealer-ico"
                    type="text"
                    placeholder={t("dealer.ico")}
                    value={dealerIco}
                    onChange={(e) => setDealerIco(e.target.value)}
                    className="text-black dark:text-white"
                    data-testid="input-dealer-ico"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dealer-email">{t("auth.email")}</Label>
                  <Input
                    id="dealer-email"
                    type="email"
                    placeholder={t("auth.emailPlaceholder")}
                    value={dealerEmail}
                    onChange={(e) => setDealerEmail(e.target.value)}
                    required
                    className="text-black dark:text-white"
                    data-testid="input-dealer-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dealer-password">{t("auth.password")}</Label>
                  <div className="relative">
                    <Input
                      id="dealer-password"
                      type={showDealerPassword ? "text" : "password"}
                      placeholder={t("auth.passwordPlaceholder")}
                      value={dealerPassword}
                      onChange={(e) => setDealerPassword(e.target.value)}
                      required
                      className="text-black dark:text-white pr-10"
                      data-testid="input-dealer-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowDealerPassword(!showDealerPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      data-testid="button-toggle-dealer-password"
                    >
                      {showDealerPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dealer-phone">{t("auth.phone")} *</Label>
                  <Input
                    id="dealer-phone"
                    type="tel"
                    placeholder="+420 XXX XXX XXX"
                    value={dealerPhone}
                    onChange={(e) => setDealerPhone(e.target.value)}
                    required
                    className="text-black dark:text-white"
                    data-testid="input-dealer-phone"
                  />
                </div>
                {!TURNSTILE_UI_OFF && (
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Shield className="h-4 w-4" />
                      <span>{t("auth.securityVerification")}</span>
                    </div>

                    {dealerVerified ? (
                      <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 px-4 py-2 rounded-lg">
                        <CheckCircle className="h-4 w-4" />
                        <span>{t("auth.verified")}</span>
                      </div>
                    ) : (
                      <ReliableTurnstile
                        ref={dealerTurnstileRef}
                        siteKey={TURNSTILE_SITE_KEY}
                        ready={
                          dialogReady &&
                          activeTab === "register" &&
                          registerType === "dealer"
                        }
                        onSuccess={handleDealerTurnstileSuccess}
                        onRetriesExhausted={handleDealerTurnstileExhausted}
                        onError={() => {
                          setDealerVerified(false);
                          setDealerTurnstileToken("");
                        }}
                        onExpire={() => {
                          setDealerVerified(false);
                          setDealerTurnstileToken("");
                        }}
                      />
                    )}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={
                    dealerRegisterMutation.isPending ||
                    (!TURNSTILE_UI_OFF && !dealerVerified)
                  }
                  data-testid="button-dealer-register-submit"
                >
                  {dealerRegisterMutation.isPending
                    ? t("auth.dealerRegistering")
                    : t("dealer.register")}
                </Button>
              </form>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Forgot Password Dialog */}
      <Dialog
        open={forgotPasswordOpen}
        onOpenChange={(o) => {
          setForgotPasswordOpen(o);
          if (o) {
            window.requestAnimationFrame(() => setForgotDialogReady(true));
          } else {
            setForgotDialogReady(false);
            setForgotPasswordEmail("");
            setForgotPasswordTurnstileToken("");
            setForgotPasswordSent(false);
            forgotPasswordTurnstileRef.current?.reset();
          }
        }}
      >
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("auth.forgotPasswordTitle")}</DialogTitle>
            <DialogDescription>
              {t("auth.forgotPasswordDescription")}
            </DialogDescription>
          </DialogHeader>

          {forgotPasswordSent ? (
            <div className="space-y-4 text-sm">
              <p>
                Pokud je e-mail <strong>{forgotPasswordEmail}</strong>{" "}
                registrován, byl vám odeslán odkaz pro obnovení hesla. Odkaz
                je platný 15 minut.
              </p>
              <DialogFooter>
                <Button
                  type="button"
                  onClick={() => setForgotPasswordOpen(false)}
                >
                  {t("auth.cancel")}
                </Button>
              </DialogFooter>
            </div>
          ) : (
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

              {!TURNSTILE_UI_OFF && (
                <div className="flex justify-center">
                  <ReliableTurnstile
                    ref={forgotPasswordTurnstileRef}
                    siteKey={TURNSTILE_SITE_KEY}
                    ready={forgotDialogReady}
                    theme="auto"
                    onSuccess={handleForgotPasswordTurnstileSuccess}
                    onError={() => setForgotPasswordTurnstileToken("")}
                    onExpire={() => setForgotPasswordTurnstileToken("")}
                  />
                </div>
              )}

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setForgotPasswordOpen(false);
                    setForgotPasswordEmail("");
                    setForgotPasswordTurnstileToken("");
                    forgotPasswordTurnstileRef.current?.reset();
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
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
