// import { useState, useEffect } from "react";
// import { useAuth } from "@/hooks/useAuth";
// import { useTranslation } from "@/lib/translations";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { User, Mail, AtSign, Calendar, Camera, CheckCircle2, XCircle, Send, Phone } from "lucide-react";
// import { useMutation } from "@tanstack/react-query";
// import { apiRequest, queryClient } from "@/lib/queryClient";
// import { useToast } from "@/hooks/use-toast";
// import { useLocation } from "wouter";
// import Header from "@/components/Header";
// import Footer from "@/components/Footer";
// import { AvatarUploader } from "@/components/AvatarUploader";
// import { Badge } from "@/components/ui/badge";

// export default function ProfilePage() {
//   const { user, isAuthenticated, isLoading } = useAuth();
//   const t = useTranslation();
//   const { toast } = useToast();
//   const [, navigate] = useLocation();
//   const [isEditing, setIsEditing] = useState(false);

//   const [email, setEmail] = useState("");
//   const [username, setUsername] = useState("");
//   const [firstName, setFirstName] = useState("");
//   const [lastName, setLastName] = useState("");
//   const [phone, setPhone] = useState("");

//   // Email verification states
//   const [verificationCode, setVerificationCode] = useState("");
//   const [showVerificationInput, setShowVerificationInput] = useState(false);
//   const [showEmailChange, setShowEmailChange] = useState(false);
//   const [newEmail, setNewEmail] = useState("");
//   const [emailChangeCode, setEmailChangeCode] = useState("");

//   // Sync form state with user data - include user?.email in deps to catch async updates
//   useEffect(() => {
//     if (user) {
//       setEmail(user.email);
//       setUsername(user.username);
//       setFirstName(user.firstName || "");
//       setLastName(user.lastName || "");
//       setPhone(user.phone || "");
//     }
//   }, [user, user?.email, user?.username, user?.firstName, user?.lastName, user?.phone]);

//   useEffect(() => {
//     if (!isAuthenticated && !isLoading) {
//       navigate("/");
//     }
//   }, [isAuthenticated, isLoading, navigate]);

//   const updateMutation = useMutation({
//     mutationFn: async (data: { email?: string; username?: string; firstName?: string | null; lastName?: string | null; phone?: string | null }) => {
//       if (!user?.id) throw new Error("User not authenticated");
//       const res = await apiRequest("PATCH", `/api/users/${user.id}`, data);
//       return await res.json();
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
//       toast({
//         title: t("profile.updateSuccess"),
//         description: t("profile.updateSuccessDescription"),
//       });
//       setIsEditing(false);
//     },
//     onError: (error: any) => {
//       let errorMsg = t("profile.updateErrorDescription");
//       if (error.message) {
//         try {
//           const match = error.message.match(/:\s*(.+)$/);
//           if (match) {
//             const parsed = JSON.parse(match[1]);
//             errorMsg = parsed.error || errorMsg;
//           }
//         } catch {
//           errorMsg = error.message;
//         }
//       }
//       toast({
//         variant: "destructive",
//         title: t("profile.updateError"),
//         description: errorMsg,
//       });
//     },
//   });

//   const uploadAvatarMutation = useMutation({
//     mutationFn: async (avatarUrl: string) => {
//       if (!user?.id) throw new Error("User not authenticated");
//       const res = await apiRequest("PUT", `/api/users/${user.id}/avatar`, { avatarUrl });
//       return await res.json();
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
//       toast({
//         title: t("profile.avatarUpdateSuccess"),
//         description: t("profile.avatarUpdateSuccessDescription"),
//       });
//     },
//     onError: (error: any) => {
//       let errorMsg = t("profile.avatarUpdateErrorDescription");
//       if (error.message) {
//         try {
//           const match = error.message.match(/:\s*(.+)$/);
//           if (match) {
//             const parsed = JSON.parse(match[1]);
//             errorMsg = parsed.error || errorMsg;
//           }
//         } catch {
//           errorMsg = error.message;
//         }
//       }
//       toast({
//         variant: "destructive",
//         title: t("profile.avatarUpdateError"),
//         description: errorMsg,
//       });
//     },
//   });

//   // Email verification mutations - JWT-based for production cross-domain auth
//   const sendVerificationCodeMutation = useMutation({
//     mutationFn: async () => {
//       // Get JWT token from localStorage
//       const token = localStorage.getItem('nnauto_token');
//       console.log("[EMAIL-VERIFY] Token exists:", !!token, "Token length:", token?.length || 0);

//       if (!token) {
//         console.error("[EMAIL-VERIFY] No JWT token found! User needs to re-login.");
//         throw new Error("Session expired. Please log out and log in again.");
//       }

//       // Make request with Authorization header
//       console.log("[EMAIL-VERIFY] Sending request with Authorization header...");
//       const res = await fetch("/api/auth/send-verification-code", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "Authorization": `Bearer ${token}`
//         },
//         credentials: "include",
//         body: JSON.stringify({})
//       });

//       console.log("[EMAIL-VERIFY] Response status:", res.status);

//       if (!res.ok) {
//         const error = await res.json();
//         console.error("[EMAIL-VERIFY] Error response:", error);
//         throw new Error(error.error || "Failed to send verification code");
//       }

//       const result = await res.json();
//       console.log("[EMAIL-VERIFY] Success:", result);
//       return result;
//     },
//     onSuccess: () => {
//       setShowVerificationInput(true);
//       toast({
//         title: t("settings.verificationCodeSent"),
//         description: t("settings.verificationCodeSentDescription"),
//       });
//     },
//     onError: (error: any) => {
//       toast({
//         variant: "destructive",
//         title: t("settings.verificationError"),
//         description: error.message || "Failed to send verification code",
//       });
//     },
//   });

//   const verifyEmailMutation = useMutation({
//     mutationFn: async (code: string) => {
//       // Get JWT token from localStorage
//       const token = localStorage.getItem('nnauto_token');
//       console.log("[VERIFY-CODE] Submitting code:", code, "length:", code.length);
//       console.log("[VERIFY-CODE] Token exists:", !!token);

//       // Make request with Authorization header
//       const res = await fetch("/api/auth/verify-email", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           ...(token ? { "Authorization": `Bearer ${token}` } : {})
//         },
//         credentials: "include",
//         body: JSON.stringify({ code })
//       });

//       console.log("[VERIFY-CODE] Response status:", res.status);

//       if (!res.ok) {
//         const error = await res.json();
//         console.error("[VERIFY-CODE] Error:", error);
//         throw new Error(error.error || "Failed to verify email");
//       }

//       const result = await res.json();
//       console.log("[VERIFY-CODE] Success:", result);
//       return result;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
//       setVerificationCode("");
//       setShowVerificationInput(false);
//       toast({
//         title: t("settings.emailVerifiedSuccess"),
//         description: t("settings.emailVerifiedSuccessDescription"),
//       });
//     },
//     onError: (error: any) => {
//       toast({
//         variant: "destructive",
//         title: t("settings.verificationError"),
//         description: error.message || t("settings.invalidCode"),
//       });
//     },
//   });

//   const requestEmailChangeMutation = useMutation({
//     mutationFn: async (email: string) => {
//       const res = await apiRequest("POST", "/api/auth/request-email-change", { newEmail: email });
//       return await res.json();
//     },
//     onSuccess: () => {
//       toast({
//         title: t("settings.verificationCodeSent"),
//         description: t("settings.verificationCodeSentDescription"),
//       });
//     },
//     onError: (error: any) => {
//       toast({
//         variant: "destructive",
//         title: t("settings.verificationError"),
//         description: error.message || t("settings.emailInUse"),
//       });
//     },
//   });

//   const confirmEmailChangeMutation = useMutation({
//     mutationFn: async (data: { code: string }) => {
//       const res = await apiRequest("POST", "/api/auth/confirm-email-change", data);
//       return await res.json();
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
//       setNewEmail("");
//       setEmailChangeCode("");
//       setShowEmailChange(false);
//       toast({
//         title: t("settings.emailChangeSuccess"),
//         description: t("settings.emailChangeSuccessDescription"),
//       });
//     },
//     onError: (error: any) => {
//       toast({
//         variant: "destructive",
//         title: t("settings.verificationError"),
//         description: error.message || t("settings.invalidCode"),
//       });
//     },
//   });

//   if (isLoading || !user) {
//     return (
//       <div className="min-h-screen flex flex-col">
//         <Header />
//         <main className="flex-1 flex items-center justify-center">
//           <div className="text-center" data-testid="loading-profile">
//             <p className="text-lg text-muted-foreground">{t("profile.loading")}</p>
//           </div>
//         </main>
//         <Footer />
//       </div>
//     );
//   }

//   const handleAvatarUpload = (objectPath: string) => {
//     uploadAvatarMutation.mutate(objectPath);
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!user) return;

//     const updateData: any = {};

//     const trimmedEmail = email.trim();
//     const trimmedUsername = username.trim();
//     const trimmedFirstName = firstName.trim();
//     const trimmedLastName = lastName.trim();
//     const trimmedPhone = phone.trim();

//     if (trimmedEmail && trimmedEmail !== user.email) {
//       updateData.email = trimmedEmail;
//     }
//     if (trimmedUsername && trimmedUsername !== user.username) {
//       updateData.username = trimmedUsername;
//     }
//     if (trimmedFirstName !== (user.firstName || "")) {
//       updateData.firstName = trimmedFirstName || null;
//     }
//     if (trimmedLastName !== (user.lastName || "")) {
//       updateData.lastName = trimmedLastName || null;
//     }
//     if (trimmedPhone !== (user.phone || "")) {
//       updateData.phone = trimmedPhone || null;
//     }

//     if (Object.keys(updateData).length === 0) {
//       toast({
//         title: t("profile.noChanges"),
//         description: t("profile.noChangesDescription"),
//       });
//       setIsEditing(false);
//       return;
//     }

//     updateMutation.mutate(updateData);
//   };

//   const handleCancel = () => {
//     if (user) {
//       setEmail(user.email);
//       setUsername(user.username);
//       setFirstName(user.firstName || "");
//       setLastName(user.lastName || "");
//       setPhone(user.phone || "");
//     }
//     setIsEditing(false);
//   };

//   const getInitials = () => {
//     if (user.firstName && user.lastName) {
//       return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
//     }
//     if (user.username) {
//       return user.username.substring(0, 2).toUpperCase();
//     }
//     return user.email.substring(0, 2).toUpperCase();
//   };

//   const formatDate = (date: Date | string) => {
//     return new Date(date).toLocaleDateString(undefined, {
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//     });
//   };

//   return (
//     <div className="min-h-screen flex flex-col">
//       <Header />
//       <main className="flex-1 container mx-auto px-4 py-8 sm:py-12">
//         <div className="max-w-3xl mx-auto space-y-6">
//           <div>
//             <h1 className="text-3xl sm:text-4xl font-bold tracking-tight" data-testid="text-profile-title">
//               {t("profile.title")}
//             </h1>
//             <p className="text-muted-foreground mt-2">{t("profile.subtitle")}</p>
//           </div>

//           <Card>
//             <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-4">
//               <div className="relative">
//                 <Avatar className="h-20 w-20">
//                   {user.avatarUrl && (
//                     <AvatarImage src={`/objects/${user.avatarUrl}`} alt={user.username} data-testid="img-avatar" />
//                   )}
//                   <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
//                 </Avatar>
//                 <div className="absolute bottom-0 right-0">
//                   <AvatarUploader
//                     onUploadComplete={handleAvatarUpload}
//                     buttonClassName="h-8 w-8 rounded-full p-0"
//                   />
//                 </div>
//               </div>
//               <div className="flex-1">
//                 <CardTitle className="text-2xl" data-testid="text-profile-username">
//                   {user.username}
//                 </CardTitle>
//                 <CardDescription data-testid="text-profile-email">{user.email}</CardDescription>
//               </div>
//             </CardHeader>
//             <CardContent>
//               <form onSubmit={handleSubmit} className="space-y-6">
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="firstName">{t("profile.firstName")}</Label>
//                     <Input
//                       id="firstName"
//                       type="text"
//                       placeholder={t("profile.firstNamePlaceholder")}
//                       value={firstName}
//                       onChange={(e) => setFirstName(e.target.value)}
//                       disabled={!isEditing}
//                       data-testid="input-first-name"
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="lastName">{t("profile.lastName")}</Label>
//                     <Input
//                       id="lastName"
//                       type="text"
//                       placeholder={t("profile.lastNamePlaceholder")}
//                       value={lastName}
//                       onChange={(e) => setLastName(e.target.value)}
//                       disabled={!isEditing}
//                       data-testid="input-last-name"
//                     />
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="username">{t("profile.username")}</Label>
//                   <div className="relative">
//                     <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//                     <Input
//                       id="username"
//                       type="text"
//                       placeholder={t("profile.usernamePlaceholder")}
//                       value={username}
//                       onChange={(e) => setUsername(e.target.value)}
//                       disabled={!isEditing}
//                       className="pl-10"
//                       data-testid="input-username"
//                     />
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="email">{t("profile.email")}</Label>
//                   <div className="relative">
//                     <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//                     <Input
//                       id="email"
//                       type="email"
//                       placeholder={t("profile.emailPlaceholder")}
//                       value={email}
//                       onChange={(e) => setEmail(e.target.value)}
//                       disabled={!isEditing}
//                       className="pl-10"
//                       data-testid="input-email"
//                     />
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="phone">{t("profile.phone")}</Label>
//                   <div className="relative">
//                     <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//                     <Input
//                       id="phone"
//                       type="tel"
//                       placeholder={t("profile.phonePlaceholder")}
//                       value={phone}
//                       onChange={(e) => setPhone(e.target.value)}
//                       disabled={!isEditing}
//                       className="pl-10"
//                       data-testid="input-phone"
//                     />
//                   </div>
//                 </div>

//                 <div className="flex items-center gap-2 text-sm text-muted-foreground">
//                   <Calendar className="h-4 w-4" />
//                   <span>
//                     {t("profile.memberSince")} {formatDate(user.createdAt)}
//                   </span>
//                 </div>

//                 <div className="flex gap-3 pt-4">
//                   {!isEditing ? (
//                     <Button type="button" onClick={() => setIsEditing(true)} className="gap-2" data-testid="button-edit-profile">
//                       <User className="h-4 w-4" />
//                       {t("profile.editProfile")}
//                     </Button>
//                   ) : (
//                     <>
//                       <Button type="submit" disabled={updateMutation.isPending} data-testid="button-save-profile">
//                         {updateMutation.isPending ? t("profile.saving") : t("profile.saveChanges")}
//                       </Button>
//                       <Button type="button" variant="outline" onClick={handleCancel} disabled={updateMutation.isPending} data-testid="button-cancel-edit">
//                         {t("profile.cancel")}
//                       </Button>
//                     </>
//                   )}
//                 </div>
//               </form>
//             </CardContent>
//           </Card>

//           {/* Email Verification Card */}
//           <Card>
//             <CardHeader>
//               <div className="flex items-center justify-between">
//                 <div>
//                   <CardTitle>{t("settings.emailVerification")}</CardTitle>
//                   <CardDescription>{t("settings.emailVerificationDescription")}</CardDescription>
//                 </div>
//                 <Badge variant={user.emailVerified ? "default" : "destructive"} className="gap-1" data-testid="badge-email-verified">
//                   {user.emailVerified ? (
//                     <>
//                       <CheckCircle2 className="h-3 w-3" />
//                       {t("settings.emailVerified")}
//                     </>
//                   ) : (
//                     <>
//                       <XCircle className="h-3 w-3" />
//                       {t("settings.emailNotVerified")}
//                     </>
//                   )}
//                 </Badge>
//               </div>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               {!user.emailVerified && !showVerificationInput && (
//                 <div className="flex gap-2">
//                   <Button
//                     onClick={() => sendVerificationCodeMutation.mutate()}
//                     disabled={sendVerificationCodeMutation.isPending}
//                     className="gap-2"
//                     data-testid="button-send-verification-code"
//                   >
//                     <Send className="h-4 w-4" />
//                     {sendVerificationCodeMutation.isPending ? t("settings.verifying") : t("settings.sendVerificationCode")}
//                   </Button>
//                 </div>
//               )}

//               {!user.emailVerified && showVerificationInput && (
//                 <div className="space-y-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="verificationCode">{t("settings.verificationCode")}</Label>
//                     <Input
//                       id="verificationCode"
//                       type="text"
//                       maxLength={6}
//                       placeholder={t("settings.verificationCodePlaceholder")}
//                       value={verificationCode}
//                       onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
//                       data-testid="input-verification-code"
//                     />
//                   </div>
//                   <div className="flex gap-2">
//                     <Button
//                       onClick={() => verifyEmailMutation.mutate(verificationCode)}
//                       disabled={verificationCode.length !== 6 || verifyEmailMutation.isPending}
//                       data-testid="button-verify-code"
//                     >
//                       {verifyEmailMutation.isPending ? t("settings.verifying") : t("settings.verifyCode")}
//                     </Button>
//                     <Button
//                       variant="outline"
//                       onClick={() => {
//                         setVerificationCode("");
//                         setShowVerificationInput(false);
//                       }}
//                       data-testid="button-cancel-verification"
//                     >
//                       {t("profile.cancel")}
//                     </Button>
//                   </div>
//                 </div>
//               )}

//               {/* Change Email Section */}
//               <div className="pt-4 border-t">
//                 <h3 className="text-sm font-medium mb-3">{t("settings.changeEmail")}</h3>
//                 {!showEmailChange ? (
//                   <Button
//                     variant="outline"
//                     onClick={() => setShowEmailChange(true)}
//                     data-testid="button-show-email-change"
//                   >
//                     {t("settings.changeEmail")}
//                   </Button>
//                 ) : (
//                   <div className="space-y-4">
//                     <div className="space-y-2">
//                       <Label htmlFor="newEmail">{t("settings.newEmail")}</Label>
//                       <Input
//                         id="newEmail"
//                         type="email"
//                         placeholder={t("settings.newEmailPlaceholder")}
//                         value={newEmail}
//                         onChange={(e) => setNewEmail(e.target.value)}
//                         data-testid="input-new-email"
//                       />
//                     </div>

//                     {newEmail && !emailChangeCode && (
//                       <Button
//                         onClick={() => requestEmailChangeMutation.mutate(newEmail)}
//                         disabled={!newEmail || requestEmailChangeMutation.isPending}
//                         className="gap-2"
//                         data-testid="button-request-email-change"
//                       >
//                         <Send className="h-4 w-4" />
//                         {requestEmailChangeMutation.isPending ? t("settings.verifying") : t("settings.requestEmailChange")}
//                       </Button>
//                     )}

//                     {emailChangeCode !== "" || requestEmailChangeMutation.isSuccess ? (
//                       <div className="space-y-4">
//                         <div className="space-y-2">
//                           <Label htmlFor="emailChangeCode">{t("settings.verificationCode")}</Label>
//                           <Input
//                             id="emailChangeCode"
//                             type="text"
//                             maxLength={6}
//                             placeholder={t("settings.verificationCodePlaceholder")}
//                             value={emailChangeCode}
//                             onChange={(e) => setEmailChangeCode(e.target.value.replace(/\D/g, ""))}
//                             data-testid="input-email-change-code"
//                           />
//                         </div>
//                         <div className="flex gap-2">
//                           <Button
//                             onClick={() => confirmEmailChangeMutation.mutate({ code: emailChangeCode })}
//                             disabled={emailChangeCode.length !== 6 || confirmEmailChangeMutation.isPending}
//                             data-testid="button-confirm-email-change"
//                           >
//                             {confirmEmailChangeMutation.isPending ? t("settings.verifying") : t("settings.confirmEmailChange")}
//                           </Button>
//                           <Button
//                             variant="outline"
//                             onClick={() => {
//                               setNewEmail("");
//                               setEmailChangeCode("");
//                               setShowEmailChange(false);
//                             }}
//                             data-testid="button-cancel-email-change"
//                           >
//                             {t("profile.cancel")}
//                           </Button>
//                         </div>
//                       </div>
//                     ) : null}
//                   </div>
//                 )}
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </main>
//       <Footer />
//     </div>
//   );
// }
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Mail,
  AtSign,
  Calendar,
  Camera,
  CheckCircle2,
  XCircle,
  Send,
  Phone,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AvatarUploader } from "@/components/AvatarUploader";
import { Badge } from "@/components/ui/badge";

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const t = useTranslation();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isEditing, setIsEditing] = useState(false);

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  // Email verification states
  const [verificationCode, setVerificationCode] = useState("");
  const [showVerificationInput, setShowVerificationInput] = useState(false);
  const [showEmailChange, setShowEmailChange] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailChangeCode, setEmailChangeCode] = useState("");

  // Sync form state with user data - include user?.email in deps to catch async updates
  useEffect(() => {
    if (user) {
      setEmail(user.email);
      setUsername(user.username);
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setPhone(user.phone || "");
    }
  }, [
    user,
    user?.email,
    user?.username,
    user?.firstName,
    user?.lastName,
    user?.phone,
  ]);

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      navigate("/");
    }
  }, [isAuthenticated, isLoading, navigate]);

  const updateMutation = useMutation({
    mutationFn: async (data: {
      email?: string;
      username?: string;
      firstName?: string | null;
      lastName?: string | null;
      phone?: string | null;
    }) => {
      if (!user?.id) throw new Error("User not authenticated");
      const res = await apiRequest("PATCH", `/api/users/${user.id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: t("profile.updateSuccess"),
        description: t("profile.updateSuccessDescription"),
      });
      setIsEditing(false);
    },
    onError: (error: any) => {
      let errorMsg = t("profile.updateErrorDescription");
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
        title: t("profile.updateError"),
        description: errorMsg,
      });
    },
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: async (avatarUrl: string) => {
      if (!user?.id) throw new Error("User not authenticated");
      const res = await apiRequest("PUT", `/api/users/${user.id}/avatar`, {
        avatarUrl,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: t("profile.avatarUpdateSuccess"),
        description: t("profile.avatarUpdateSuccessDescription"),
      });
    },
    onError: (error: any) => {
      let errorMsg = t("profile.avatarUpdateErrorDescription");
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
        title: t("profile.avatarUpdateError"),
        description: errorMsg,
      });
    },
  });

  // Email verification mutations - JWT-based for production cross-domain auth
  const sendVerificationCodeMutation = useMutation({
    mutationFn: async () => {
      // Get JWT token from localStorage
      const token = localStorage.getItem("nnauto_token");
      console.log(
        "[EMAIL-VERIFY] Token exists:",
        !!token,
        "Token length:",
        token?.length || 0,
      );

      if (!token) {
        console.error(
          "[EMAIL-VERIFY] No JWT token found! User needs to re-login.",
        );
        throw new Error("Session expired. Please log out and log in again.");
      }

      // Make request with Authorization header
      console.log(
        "[EMAIL-VERIFY] Sending request with Authorization header...",
      );
      const res = await fetch("/api/auth/send-verification-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({}),
      });

      console.log("[EMAIL-VERIFY] Response status:", res.status);

      if (!res.ok) {
        const error = await res.json();
        console.error("[EMAIL-VERIFY] Error response:", error);
        throw new Error(error.error || "Failed to send verification code");
      }

      const result = await res.json();
      console.log("[EMAIL-VERIFY] Success:", result);
      return result;
    },
    onSuccess: () => {
      setShowVerificationInput(true);
      toast({
        title: t("settings.verificationCodeSent"),
        description: t("settings.verificationCodeSentDescription"),
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: t("settings.verificationError"),
        description: error.message || "Failed to send verification code",
      });
    },
  });

  const verifyEmailMutation = useMutation({
    mutationFn: async (code: string) => {
      // Get JWT token from localStorage
      const token = localStorage.getItem("nnauto_token");
      console.log(
        "[VERIFY-CODE] Submitting code:",
        code,
        "length:",
        code.length,
      );
      console.log("[VERIFY-CODE] Token exists:", !!token);

      // Make request with Authorization header
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ code }),
      });

      console.log("[VERIFY-CODE] Response status:", res.status);

      if (!res.ok) {
        const error = await res.json();
        console.error("[VERIFY-CODE] Error:", error);
        throw new Error(error.error || "Failed to verify email");
      }

      const result = await res.json();
      console.log("[VERIFY-CODE] Success:", result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setVerificationCode("");
      setShowVerificationInput(false);
      toast({
        title: t("settings.emailVerifiedSuccess"),
        description: t("settings.emailVerifiedSuccessDescription"),
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: t("settings.verificationError"),
        description: error.message || t("settings.invalidCode"),
      });
    },
  });

  const requestEmailChangeMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await apiRequest("POST", "/api/auth/request-email-change", {
        newEmail: email,
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: t("settings.verificationCodeSent"),
        description: t("settings.verificationCodeSentDescription"),
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: t("settings.verificationError"),
        description: error.message || t("settings.emailInUse"),
      });
    },
  });

  const confirmEmailChangeMutation = useMutation({
    mutationFn: async (data: { code: string }) => {
      const res = await apiRequest(
        "POST",
        "/api/auth/confirm-email-change",
        data,
      );
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setNewEmail("");
      setEmailChangeCode("");
      setShowEmailChange(false);
      toast({
        title: t("settings.emailChangeSuccess"),
        description: t("settings.emailChangeSuccessDescription"),
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: t("settings.verificationError"),
        description: error.message || t("settings.invalidCode"),
      });
    },
  });

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center" data-testid="loading-profile">
            <p className="text-lg text-muted-foreground">
              {t("profile.loading")}
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleAvatarUpload = (objectPath: string) => {
    uploadAvatarMutation.mutate(objectPath);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    const updateData: any = {};

    const trimmedEmail = email.trim();
    const trimmedUsername = username.trim();
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedPhone = phone.trim();

    if (trimmedEmail && trimmedEmail !== user.email) {
      updateData.email = trimmedEmail;
    }
    if (trimmedUsername && trimmedUsername !== user.username) {
      updateData.username = trimmedUsername;
    }
    if (trimmedFirstName !== (user.firstName || "")) {
      updateData.firstName = trimmedFirstName || null;
    }
    if (trimmedLastName !== (user.lastName || "")) {
      updateData.lastName = trimmedLastName || null;
    }
    if (trimmedPhone !== (user.phone || "")) {
      updateData.phone = trimmedPhone || null;
    }

    if (Object.keys(updateData).length === 0) {
      toast({
        title: t("profile.noChanges"),
        description: t("profile.noChangesDescription"),
      });
      setIsEditing(false);
      return;
    }

    updateMutation.mutate(updateData);
  };

  const handleCancel = () => {
    if (user) {
      setEmail(user.email);
      setUsername(user.username);
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setPhone(user.phone || "");
    }
    setIsEditing(false);
  };

  const getInitials = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user.username) {
      return user.username.substring(0, 2).toUpperCase();
    }
    return user.email.substring(0, 2).toUpperCase();
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-3xl mx-auto space-y-6">
          <div>
            <h1
              className="text-3xl sm:text-4xl font-bold tracking-tight"
              data-testid="text-profile-title"
            >
              {t("profile.title")}
            </h1>
            <p className="text-muted-foreground mt-2">
              {t("profile.subtitle")}
            </p>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-4">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  {user.avatarUrl && (
                    <AvatarImage
                      src={`/objects/${user.avatarUrl}`}
                      alt={user.username}
                      data-testid="img-avatar"
                    />
                  )}
                  <AvatarFallback className="text-2xl">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute bottom-0 right-0">
                  <AvatarUploader
                    onUploadComplete={handleAvatarUpload}
                    buttonClassName="h-8 w-8 rounded-full p-0"
                  />
                </div>
              </div>
              <div className="flex-1">
                <CardTitle
                  className="text-2xl"
                  data-testid="text-profile-username"
                >
                  {user.username}
                </CardTitle>
                <CardDescription data-testid="text-profile-email">
                  {user.email}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">{t("profile.firstName")}</Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder={t("profile.firstNamePlaceholder")}
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={!isEditing}
                      data-testid="input-first-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">{t("profile.lastName")}</Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder={t("profile.lastNamePlaceholder")}
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      disabled={!isEditing}
                      data-testid="input-last-name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">{t("profile.username")}</Label>
                  <div className="relative">
                    <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="username"
                      type="text"
                      placeholder={t("profile.usernamePlaceholder")}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={!isEditing}
                      className="pl-10"
                      data-testid="input-username"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{t("profile.email")}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder={t("profile.emailPlaceholder")}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={!isEditing}
                      className="pl-10"
                      data-testid="input-email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">{t("profile.phone")}</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder={t("profile.phonePlaceholder")}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={!isEditing}
                      className="pl-10"
                      data-testid="input-phone"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {t("profile.memberSince")} {formatDate(user.createdAt)}
                  </span>
                </div>

                <div className="flex gap-3 pt-4">
                  {!isEditing ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsEditing(true);
                      }}
                      className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-primary-foreground"
                    >
                      <User className="h-4 w-4" />
                      {t("profile.editProfile")}
                    </button>
                  ) : (
                    <>
                      <Button
                        type="submit"
                        disabled={updateMutation.isPending}
                        data-testid="button-save-profile"
                      >
                        {updateMutation.isPending
                          ? t("profile.saving")
                          : t("profile.saveChanges")}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={updateMutation.isPending}
                        data-testid="button-cancel-edit"
                      >
                        {t("profile.cancel")}
                      </Button>
                    </>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Email Verification Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t("settings.emailVerification")}</CardTitle>
                  <CardDescription>
                    {t("settings.emailVerificationDescription")}
                  </CardDescription>
                </div>
                <Badge
                  variant={user.emailVerified ? "default" : "destructive"}
                  className="gap-1"
                  data-testid="badge-email-verified"
                >
                  {user.emailVerified ? (
                    <>
                      <CheckCircle2 className="h-3 w-3" />
                      {t("settings.emailVerified")}
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3" />
                      {t("settings.emailNotVerified")}
                    </>
                  )}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {!user.emailVerified && !showVerificationInput && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => sendVerificationCodeMutation.mutate()}
                    disabled={sendVerificationCodeMutation.isPending}
                    className="gap-2"
                    data-testid="button-send-verification-code"
                  >
                    <Send className="h-4 w-4" />
                    {sendVerificationCodeMutation.isPending
                      ? t("settings.verifying")
                      : t("settings.sendVerificationCode")}
                  </Button>
                </div>
              )}

              {!user.emailVerified && showVerificationInput && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="verificationCode">
                      {t("settings.verificationCode")}
                    </Label>
                    <Input
                      id="verificationCode"
                      type="text"
                      maxLength={6}
                      placeholder={t("settings.verificationCodePlaceholder")}
                      value={verificationCode}
                      onChange={(e) =>
                        setVerificationCode(e.target.value.replace(/\D/g, ""))
                      }
                      data-testid="input-verification-code"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() =>
                        verifyEmailMutation.mutate(verificationCode)
                      }
                      disabled={
                        verificationCode.length !== 6 ||
                        verifyEmailMutation.isPending
                      }
                      data-testid="button-verify-code"
                    >
                      {verifyEmailMutation.isPending
                        ? t("settings.verifying")
                        : t("settings.verifyCode")}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setVerificationCode("");
                        setShowVerificationInput(false);
                      }}
                      data-testid="button-cancel-verification"
                    >
                      {t("profile.cancel")}
                    </Button>
                  </div>
                </div>
              )}

              {/* Change Email Section */}
              <div className="pt-4 border-t">
                <h3 className="text-sm font-medium mb-3">
                  {t("settings.changeEmail")}
                </h3>
                {!showEmailChange ? (
                  <Button
                    variant="outline"
                    onClick={() => setShowEmailChange(true)}
                    data-testid="button-show-email-change"
                  >
                    {t("settings.changeEmail")}
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="newEmail">{t("settings.newEmail")}</Label>
                      <Input
                        id="newEmail"
                        type="email"
                        placeholder={t("settings.newEmailPlaceholder")}
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        data-testid="input-new-email"
                      />
                    </div>

                    {newEmail && !emailChangeCode && (
                      <Button
                        onClick={() =>
                          requestEmailChangeMutation.mutate(newEmail)
                        }
                        disabled={
                          !newEmail || requestEmailChangeMutation.isPending
                        }
                        className="gap-2"
                        data-testid="button-request-email-change"
                      >
                        <Send className="h-4 w-4" />
                        {requestEmailChangeMutation.isPending
                          ? t("settings.verifying")
                          : t("settings.requestEmailChange")}
                      </Button>
                    )}

                    {emailChangeCode !== "" ||
                    requestEmailChangeMutation.isSuccess ? (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="emailChangeCode">
                            {t("settings.verificationCode")}
                          </Label>
                          <Input
                            id="emailChangeCode"
                            type="text"
                            maxLength={6}
                            placeholder={t(
                              "settings.verificationCodePlaceholder",
                            )}
                            value={emailChangeCode}
                            onChange={(e) =>
                              setEmailChangeCode(
                                e.target.value.replace(/\D/g, ""),
                              )
                            }
                            data-testid="input-email-change-code"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() =>
                              confirmEmailChangeMutation.mutate({
                                code: emailChangeCode,
                              })
                            }
                            disabled={
                              emailChangeCode.length !== 6 ||
                              confirmEmailChangeMutation.isPending
                            }
                            data-testid="button-confirm-email-change"
                          >
                            {confirmEmailChangeMutation.isPending
                              ? t("settings.verifying")
                              : t("settings.confirmEmailChange")}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setNewEmail("");
                              setEmailChangeCode("");
                              setShowEmailChange(false);
                            }}
                            data-testid="button-cancel-email-change"
                          >
                            {t("profile.cancel")}
                          </Button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
