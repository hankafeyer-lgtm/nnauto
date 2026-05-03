import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Send, CheckCircle2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/translations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

/**
 * Public buyer → seller contact form. Mounted inside the existing
 * "contact seller" dialog on the listing detail page. POSTs to
 * /api/conversations/contact which creates (or appends to) a Conversation
 * in the dealer inbox.
 *
 * Intentionally plain — no auth required, no captcha. Anti-spam is
 * handled server-side via per-IP rate limiting.
 */
export function ContactSellerForm({
  listingId,
  defaultName,
  defaultEmail,
  defaultPhone,
  defaultMessage,
}: {
  listingId: string;
  defaultName?: string;
  defaultEmail?: string;
  defaultPhone?: string;
  defaultMessage?: string;
}) {
  const t = useTranslation();
  const { toast } = useToast();

  const [name, setName] = useState(defaultName ?? "");
  const [email, setEmail] = useState(defaultEmail ?? "");
  const [phone, setPhone] = useState(defaultPhone ?? "");
  const [message, setMessage] = useState(
    defaultMessage ?? t("detail.contactSellerDefaultMessage"),
  );
  const [sent, setSent] = useState(false);

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/conversations/contact", {
        listingId,
        name: name.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        message: message.trim(),
      });
      return res.json();
    },
    onSuccess: () => {
      setSent(true);
      toast({
        title: t("detail.contactSellerSentTitle"),
        description: t("detail.contactSellerSentDescription"),
      });
    },
    onError: (e: unknown) => {
      const msg = e instanceof Error ? e.message : "Network error";
      toast({
        title: t("detail.contactSellerErrorTitle"),
        description: msg,
        variant: "destructive",
      });
    },
  });

  if (sent) {
    return (
      <div
        className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm flex items-start gap-3"
        data-testid="contact-form-success"
      >
        <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600 mt-0.5" />
        <div className="space-y-1">
          <p className="font-medium text-green-900">
            {t("detail.contactSellerSentTitle")}
          </p>
          <p className="text-green-800">
            {t("detail.contactSellerSentDescription")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <form
      className="space-y-3"
      data-testid="contact-seller-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (!message.trim()) return;
        if (!email.trim() && !phone.trim()) {
          toast({
            title: t("detail.contactSellerErrorTitle"),
            description: t("detail.contactSellerNeedContact"),
            variant: "destructive",
          });
          return;
        }
        mutation.mutate();
      }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="contact-form-name">{t("detail.contactFormName")}</Label>
          <Input
            id="contact-form-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            data-testid="input-contact-name"
            autoComplete="name"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="contact-form-phone">{t("detail.phone")}</Label>
          <Input
            id="contact-form-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            data-testid="input-contact-phone"
            autoComplete="tel"
          />
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor="contact-form-email">{t("detail.email")}</Label>
        <Input
          id="contact-form-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          data-testid="input-contact-email"
          autoComplete="email"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="contact-form-message">
          {t("detail.contactFormMessage")}
        </Label>
        <Textarea
          id="contact-form-message"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          data-testid="textarea-contact-message"
          maxLength={4000}
        />
      </div>
      <Button
        type="submit"
        className="w-full gap-2"
        disabled={mutation.isPending || !message.trim()}
        data-testid="button-send-contact"
      >
        <Send className="h-4 w-4" />
        {mutation.isPending
          ? t("detail.contactFormSending")
          : t("detail.contactFormSend")}
      </Button>
    </form>
  );
}

export default ContactSellerForm;
