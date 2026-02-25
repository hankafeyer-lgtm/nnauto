import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/lib/translations";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Lock, Trash2, AlertTriangle, Eye, EyeOff } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient, parseApiError } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { changePasswordSchema, type ChangePasswordRequest } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function SettingsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const t = useTranslation();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<ChangePasswordRequest>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  if (!isAuthenticated && !authLoading) {
    navigate("/");
    return null;
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center" data-testid="loading-settings">
            <p className="text-lg text-muted-foreground">{t("settings.loading")}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const changePasswordMutation = useMutation({
    mutationFn: async (data: ChangePasswordRequest) => {
      const res = await apiRequest("POST", `/api/users/${user.id}/change-password`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: t("settings.passwordChangeSuccess"),
        description: t("settings.passwordChangeSuccessDescription"),
      });
      form.reset();
      queryClient.setQueryData(["/api/auth/user"], { user: null });
      setTimeout(() => navigate("/"), 1000);
    },
    onError: (error: unknown) => {
      const { message } = parseApiError(error);
      toast({
        variant: "destructive",
        title: t("settings.passwordChangeError"),
        description: message || t("settings.passwordChangeErrorDescription"),
      });
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", `/api/users/${user.id}`);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: t("settings.accountDeleteSuccess"),
        description: t("settings.accountDeleteSuccessDescription"),
      });
      queryClient.setQueryData(["/api/auth/user"], { user: null });
      setTimeout(() => navigate("/"), 1000);
    },
    onError: (error: unknown) => {
      const { message } = parseApiError(error);
      toast({
        variant: "destructive",
        title: t("settings.accountDeleteError"),
        description: message || t("settings.accountDeleteErrorDescription"),
      });
    },
  });

  const handlePasswordChange = (data: ChangePasswordRequest) => {
    changePasswordMutation.mutate(data);
  };

  const handleDeleteAccount = () => {
    deleteAccountMutation.mutate();
    setDeleteDialogOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-3xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight" data-testid="text-settings-title">
              {t("settings.title")}
            </h1>
            <p className="text-muted-foreground mt-2" data-testid="text-settings-subtitle">{t("settings.subtitle")}</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2" data-testid="text-change-password-title">
                <Lock className="h-5 w-5" />
                {t("settings.changePassword")}
              </CardTitle>
              <CardDescription data-testid="text-change-password-description">{t("settings.changePasswordDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handlePasswordChange)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("settings.currentPassword")}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showCurrentPassword ? "text" : "password"}
                              placeholder={t("settings.currentPasswordPlaceholder")}
                              {...field}
                              className="pr-10"
                              data-testid="input-current-password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                              data-testid="button-toggle-current-password"
                            >
                              {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage data-testid="error-current-password" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("settings.newPassword")}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showNewPassword ? "text" : "password"}
                              placeholder={t("settings.newPasswordPlaceholder")}
                              {...field}
                              className="pr-10"
                              data-testid="input-new-password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                              data-testid="button-toggle-new-password"
                            >
                              {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage data-testid="error-new-password" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmNewPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("settings.confirmNewPassword")}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder={t("settings.confirmNewPasswordPlaceholder")}
                              {...field}
                              className="pr-10"
                              data-testid="input-confirm-new-password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                              data-testid="button-toggle-confirm-password"
                            >
                              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage data-testid="error-confirm-new-password" />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    disabled={changePasswordMutation.isPending}
                    className="gap-2"
                    data-testid="button-change-password"
                  >
                    <Lock className="h-4 w-4" />
                    <span data-testid="text-submit-button">
                      {changePasswordMutation.isPending ? t("settings.changing") : t("settings.changePassword")}
                    </span>
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive" data-testid="text-danger-zone-title">
                <AlertTriangle className="h-5 w-5" />
                {t("settings.dangerZone")}
              </CardTitle>
              <CardDescription data-testid="text-danger-zone-description">{t("settings.dangerZoneDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground" data-testid="text-delete-warning">
                  {t("settings.deleteAccountWarning")}
                </p>
                <Button 
                  variant="destructive"
                  onClick={() => setDeleteDialogOpen(true)}
                  disabled={deleteAccountMutation.isPending}
                  className="gap-2"
                  data-testid="button-delete-account"
                >
                  <Trash2 className="h-4 w-4" />
                  <span data-testid="text-delete-button">
                    {deleteAccountMutation.isPending ? t("settings.deleting") : t("settings.deleteAccount")}
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle data-testid="text-delete-confirm-title">{t("settings.deleteAccountConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription data-testid="text-delete-confirm-description">
              {t("settings.deleteAccountConfirmDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">{t("settings.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deleteAccountMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              <span data-testid="text-confirm-delete-button">
                {deleteAccountMutation.isPending ? t("settings.deleting") : t("settings.deleteAccountConfirm")}
              </span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
