"use client";

import { useState } from "react";
import {
  Phone,
  MessageCircle,
  Mail,
  MessageSquare,
  Send,
} from "lucide-react";
const nnAutoLogo = "/logo-icon-only.png";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { appendListingSourceTag } from "@shared/messageSource";
import { useIsAndroidDevice } from "@/hooks/useIsAndroidDevice";

// Reusable fixed bottom contact bar for listing detail pages.
// 3 design variants share the same data props but use different open
// patterns for the chat menu so we can compare UX.

export type StickyContactBarVariant = "minimal" | "icons" | "accent";

export type StickyContactBarProps = {
  variant?: StickyContactBarVariant;
  phone?: string | null;
  email?: string | null;
  carTitle?: string;
  // Optional callbacks for analytics (kept generic – page can wire them).
  onMessage?: (channel: "whatsapp" | "telegram" | "email") => void;
  onCall?: () => void;
  /**
   * Optional handler for the "Napsat do chatu NNAuto" entry that opens
   * the in-site /zpravy chat. When provided, the entry is rendered as
   * the FIRST item in the message menu (above WhatsApp/Telegram/Email)
   * so logged-in buyers always see the on-site option first.
   */
  onNNAutoChat?: () => void;
  // i18n-friendly overrides.
  labelMessage?: string;
  labelCall?: string;
  labelWhatsApp?: string;
  labelTelegram?: string;
  labelEmail?: string;
  labelNNAutoChat?: string;
  showWhatsApp?: boolean;
  showTelegram?: boolean;
};

const SAFE_BOTTOM = "pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]";

function buildPrefilledText(carTitle?: string): string {
  const base = carTitle
    ? `Dobrý den, mám zájem o vůz ${carTitle}. Je ještě k dispozici?`
    : "Dobrý den, mám zájem o vůz. Je ještě k dispozici?";
  return appendListingSourceTag(base);
}

function digitsOnly(phone: string): string {
  return phone.replace(/[^\d+]/g, "").replace(/^00/, "+");
}

function buildLinks(phone: string | null | undefined, email: string | null | undefined, carTitle: string | undefined) {
  const text = buildPrefilledText(carTitle);
  const encoded = encodeURIComponent(text);
  const phoneClean = phone ? digitsOnly(phone) : "";
  const phoneE164 = phoneClean.replace(/^\+/, ""); // wa.me wants no plus
  const subject = encodeURIComponent(carTitle ? `Zájem o vůz ${carTitle}` : "Zájem o vůz");
  return {
    tel: phone ? `tel:${phoneClean}` : null,
    whatsapp: phone ? `https://wa.me/${phoneE164}?text=${encoded}` : null,
    // Telegram has no public direct-message-by-phone deep link on web.
    // tg://msg?to=<phone> works on mobile when Telegram is installed; we fall
    // back to t.me share-search which still opens Telegram with the number.
    telegram: phone ? `https://t.me/+${phoneE164}` : null,
    email: email ? `mailto:${email}?subject=${subject}&body=${encoded}` : null,
  };
}

function ChannelButton({
  href,
  onClick,
  icon: Icon,
  label,
  hint,
  iconClassName,
  testId,
}: {
  href: string;
  onClick?: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  hint?: string;
  iconClassName?: string;
  testId?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      data-testid={testId}
      className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-accent active:scale-[0.98] transition-[background,transform] focus:outline-none focus:ring-2 focus:ring-ring"
    >
      <span
        className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconClassName ?? "bg-muted"}`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 text-left">
        <span className="block text-sm font-medium leading-tight">{label}</span>
        {hint ? (
          <span className="block text-xs text-muted-foreground truncate">
            {hint}
          </span>
        ) : null}
      </span>
    </a>
  );
}

/**
 * Same visual contract as ChannelButton but rendered as a real
 * <button> so it can invoke client-side JS (auth check, navigation
 * to /zpravy with the prefill payload, …) instead of following a
 * link. Reused only by the NNAuto in-site chat entry.
 */
function ChannelAction({
  onClick,
  icon: Icon,
  iconSrc,
  label,
  hint,
  iconClassName,
  testId,
}: {
  onClick: () => void;
  icon?: React.ComponentType<{ className?: string }>;
  iconSrc?: string;
  label: string;
  hint?: string;
  iconClassName?: string;
  testId?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testId}
      className="w-full text-left flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-accent active:scale-[0.98] transition-[background,transform] focus:outline-none focus:ring-2 focus:ring-ring"
    >
      <span
        className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconClassName ?? "bg-muted"}`}
      >
        {iconSrc ? (
          <img
            src={iconSrc}
            alt=""
            aria-hidden="true"
            className="h-6 w-6 object-contain"
            decoding="async"
          />
        ) : Icon ? (
          <Icon className="h-5 w-5" />
        ) : null}
      </span>
      <span className="min-w-0 text-left">
        <span className="block text-sm font-medium leading-tight">{label}</span>
        {hint ? (
          <span className="block text-xs text-muted-foreground truncate">
            {hint}
          </span>
        ) : null}
      </span>
    </button>
  );
}

function MessageMenuItems({
  links,
  onMessage,
  onNNAutoChat,
  labels,
  showWhatsApp = true,
  showTelegram = true,
}: {
  links: ReturnType<typeof buildLinks>;
  onMessage?: StickyContactBarProps["onMessage"];
  onNNAutoChat?: () => void;
  labels: { wa: string; tg: string; email: string; nn: string };
  showWhatsApp?: boolean;
  showTelegram?: boolean;
}) {
  return (
    <div className="grid gap-1 p-1">
      {onNNAutoChat ? (
        <ChannelAction
          onClick={onNNAutoChat}
          iconSrc={nnAutoLogo}
          label={labels.nn}
          hint="NNAuto.cz"
          iconClassName="bg-[#B8860B]/10"
          testId="sticky-contact-nnauto-chat"
        />
      ) : null}
      {showWhatsApp && links.whatsapp ? (
        <ChannelButton
          href={links.whatsapp}
          onClick={() => onMessage?.("whatsapp")}
          icon={MessageCircle}
          label={labels.wa}
          hint="WhatsApp"
          iconClassName="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
          testId="sticky-contact-whatsapp"
        />
      ) : null}
      {showTelegram && links.telegram ? (
        <ChannelButton
          href={links.telegram}
          onClick={() => onMessage?.("telegram")}
          icon={Send}
          label={labels.tg}
          hint="Telegram"
          iconClassName="bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300"
          testId="sticky-contact-telegram"
        />
      ) : null}
      {links.email ? (
        <ChannelButton
          href={links.email}
          onClick={() => onMessage?.("email")}
          icon={Mail}
          label={labels.email}
          hint="E-mail"
          iconClassName="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
          testId="sticky-contact-email"
        />
      ) : null}
    </div>
  );
}

export default function StickyContactBar(props: StickyContactBarProps) {
  const isAndroidDevice = useIsAndroidDevice();
  const {
    variant = "minimal",
    phone,
    email,
    carTitle,
    onMessage,
    onCall,
    onNNAutoChat,
    labelMessage = "Napsat prodejci",
    labelCall = "Zavolat",
    labelWhatsApp = "Napsat na WhatsApp",
    labelTelegram = "Napsat na Telegram",
    labelEmail = "Napsat e-mail",
    labelNNAutoChat = "Napsat do chatu NNAuto",
    showWhatsApp = true,
    showTelegram = true,
  } = props;

  const links = buildLinks(phone, email, carTitle);
  // NNAuto in-site chat counts as a channel — keep the trigger enabled
  // even when phone/email aren't published on the listing.
  const hasAnyChannel =
    !!(links.whatsapp || links.telegram || links.email) || !!onNNAutoChat;
  const labels = {
    wa: labelWhatsApp,
    tg: labelTelegram,
    email: labelEmail,
    nn: labelNNAutoChat,
  };
  // Drawer state lives at the top to keep hook order stable across variant changes.
  const [drawerOpen, setDrawerOpen] = useState(false);

  // -------- v1: Minimalist (DropdownMenu, equal-width buttons) -------------
  if (variant === "minimal") {
    return (
      <div
        className={`fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 ${SAFE_BOTTOM} pt-3 ${
          isAndroidDevice
            ? "max-w-[100vw] overflow-x-clip px-2 sm:px-3"
            : "px-3"
        }`}
        data-testid="sticky-contact-bar"
        data-variant="minimal"
      >
        <div
          className={
            isAndroidDevice
              ? "mx-auto flex w-full max-w-screen-sm min-w-0 items-center gap-2"
              : "container mx-auto flex items-center gap-2"
          }
        >
          {hasAnyChannel ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="lg"
                  className={`flex-1 h-12 rounded-xl ${
                    isAndroidDevice
                      ? "min-w-0 px-2 text-sm sm:px-4 sm:text-base"
                      : "text-base"
                  }`}
                  data-testid="sticky-contact-message-trigger"
                >
                  <MessageSquare
                    className={`h-5 w-5 ${
                      isAndroidDevice ? "mr-1.5 shrink-0 sm:mr-2" : "mr-2"
                    }`}
                  />
                  {isAndroidDevice ? (
                    <span className="truncate">{labelMessage}</span>
                  ) : (
                    labelMessage
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="start"
                sideOffset={10}
                className="w-72 p-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=top]:slide-in-from-bottom-2"
              >
                <MessageMenuItems
                  links={links}
                  onMessage={onMessage}
                  onNNAutoChat={onNNAutoChat}
                  labels={labels}
                  showWhatsApp={showWhatsApp}
                  showTelegram={showTelegram}
                />
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              size="lg"
              className={`flex-1 h-12 rounded-xl ${
                isAndroidDevice
                  ? "min-w-0 px-2 text-sm sm:px-4 sm:text-base"
                  : "text-base"
              }`}
              disabled
            >
              <MessageSquare
                className={`h-5 w-5 ${
                  isAndroidDevice ? "mr-1.5 shrink-0 sm:mr-2" : "mr-2"
                }`}
              />
              {isAndroidDevice ? (
                <span className="truncate">{labelMessage}</span>
              ) : (
                labelMessage
              )}
            </Button>
          )}
          {links.tel ? (
            <Button
              asChild
              size="lg"
              variant="outline"
              className={`flex-1 h-12 rounded-xl ${
                isAndroidDevice
                  ? "min-w-0 px-2 text-sm sm:px-4 sm:text-base"
                  : "text-base"
              }`}
              data-testid="sticky-contact-call"
            >
              <a
                href={links.tel}
                onClick={onCall}
                className={isAndroidDevice ? "min-w-0" : undefined}
              >
                <Phone
                  className={`h-5 w-5 ${
                    isAndroidDevice ? "mr-1.5 shrink-0 sm:mr-2" : "mr-2"
                  }`}
                />
                {isAndroidDevice ? (
                  <span className="truncate">{labelCall}</span>
                ) : (
                  labelCall
                )}
              </a>
            </Button>
          ) : null}
        </div>
      </div>
    );
  }

  // -------- v2: Iconic / floating glass pill (Popover) ---------------------
  if (variant === "icons") {
    return (
      <div
        className={`fixed inset-x-0 bottom-0 z-40 pointer-events-none ${SAFE_BOTTOM} px-3 pt-3`}
        data-testid="sticky-contact-bar"
        data-variant="icons"
      >
        <div className="container mx-auto pointer-events-auto">
          <div className="mx-auto max-w-md rounded-full border bg-background/85 backdrop-blur-xl shadow-lg flex items-stretch gap-1 p-1">
            {hasAnyChannel ? (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    size="lg"
                    variant="ghost"
                    className="flex-1 h-12 rounded-full text-sm font-medium gap-2 hover:bg-foreground/5"
                    data-testid="sticky-contact-message-trigger"
                  >
                    <MessageSquare className="h-5 w-5" />
                    <span className="truncate">{labelMessage}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  side="top"
                  align="center"
                  sideOffset={12}
                  className="w-[min(20rem,calc(100vw-1.5rem))] p-1 rounded-2xl shadow-xl border data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[side=top]:slide-in-from-bottom-2"
                >
                  <MessageMenuItems
                    links={links}
                    onMessage={onMessage}
                    onNNAutoChat={onNNAutoChat}
                    labels={labels}
                    showWhatsApp={showWhatsApp}
                    showTelegram={showTelegram}
                  />
                </PopoverContent>
              </Popover>
            ) : (
              <Button size="lg" variant="ghost" className="flex-1 h-12 rounded-full" disabled>
                <MessageSquare className="h-5 w-5 mr-2" />
                {labelMessage}
              </Button>
            )}
            <span aria-hidden className="self-center w-px h-7 bg-border" />
            {links.tel ? (
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="flex-1 h-12 rounded-full text-sm font-medium gap-2 hover:bg-foreground/5"
                data-testid="sticky-contact-call"
              >
                <a href={links.tel} onClick={onCall}>
                  <Phone className="h-5 w-5" />
                  <span className="truncate">{labelCall}</span>
                </a>
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  // -------- v3: Accent CTA (Drawer / bottom sheet) -------------------------
  // Right-side big gold "Zavolat" button, secondary "Napsat" on the left.
  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 ${SAFE_BOTTOM} pt-3 px-3`}
      data-testid="sticky-contact-bar"
      data-variant="accent"
    >
      <div className="container mx-auto flex items-center gap-3">
        {hasAnyChannel ? (
          <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
            <DrawerTrigger asChild>
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-4 rounded-2xl text-sm font-medium"
                data-testid="sticky-contact-message-trigger"
              >
                <MessageSquare className="h-5 w-5 mr-2" />
                <span className="hidden sm:inline">{labelMessage}</span>
                <span className="sm:hidden">Napsat</span>
              </Button>
            </DrawerTrigger>
            <DrawerContent className="px-3 pb-[max(1rem,env(safe-area-inset-bottom,0px))]">
              <DrawerHeader className="text-left">
                <DrawerTitle>{labelMessage}</DrawerTitle>
                {carTitle ? (
                  <DrawerDescription>{carTitle}</DrawerDescription>
                ) : null}
              </DrawerHeader>
              <MessageMenuItems
                links={links}
                onMessage={(c) => {
                  onMessage?.(c);
                  setDrawerOpen(false);
                }}
                onNNAutoChat={
                  onNNAutoChat
                    ? () => {
                        setDrawerOpen(false);
                        onNNAutoChat();
                      }
                    : undefined
                }
                labels={labels}
                showWhatsApp={showWhatsApp}
                showTelegram={showTelegram}
              />
              <DrawerFooter />
            </DrawerContent>
          </Drawer>
        ) : (
          <Button size="lg" variant="outline" className="h-14 px-4 rounded-2xl" disabled>
            <MessageSquare className="h-5 w-5 mr-2" />
            <span className="hidden sm:inline">{labelMessage}</span>
            <span className="sm:hidden">Napsat</span>
          </Button>
        )}
        {links.tel ? (
          <Button
            asChild
            size="lg"
            className="flex-1 h-14 rounded-2xl text-base font-semibold bg-[#B8860B] hover:bg-[#9c7308] text-white shadow-md shadow-[#B8860B]/20"
            data-testid="sticky-contact-call"
          >
            <a href={links.tel} onClick={onCall}>
              <Phone className="h-5 w-5 mr-2" />
              {labelCall}
            </a>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
