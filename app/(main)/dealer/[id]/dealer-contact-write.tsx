"use client";

import { Link } from "@/lib/navigation";
import {
  ChevronDown,
  Mail,
  MessageCircle,
  MessageSquare,
  Phone,
  Send,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const nnAutoLogo = "/logo-icon-only.png";

function digitsOnly(phone: string) {
  return phone.replace(/[^\d+]/g, "").replace(/^00/, "+");
}

type ChannelRowProps = {
  href?: string;
  to?: string;
  icon?: React.ComponentType<{ className?: string }>;
  iconSrc?: string;
  label: string;
  hint: string;
  iconClassName: string;
};

function ChannelRow({ href, to, icon: Icon, iconSrc, label, hint, iconClassName }: ChannelRowProps) {
  const inner = (
    <>
      <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconClassName}`}>
        {iconSrc ? (
          <img src={iconSrc} alt="" aria-hidden className="h-6 w-6 object-contain" />
        ) : Icon ? (
          <Icon className="h-5 w-5" />
        ) : null}
      </span>
      <span className="min-w-0 text-left">
        <span className="block text-sm font-medium leading-tight">{label}</span>
        <span className="block truncate text-xs text-muted-foreground">{hint}</span>
      </span>
    </>
  );

  const className =
    "flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-accent active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-ring";

  if (to) {
    return (
      <Link href={to} className={className}>
        {inner}
      </Link>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {inner}
    </a>
  );
}

export default function DealerContactWrite({
  phone,
  email,
  chatListingId,
  dealerName,
}: {
  phone?: string | null;
  email?: string | null;
  chatListingId?: string | null;
  dealerName: string;
}) {
  const text = `Dobrý den, mám zájem o vozy v nabídce ${dealerName}.`;
  const encoded = encodeURIComponent(text);
  const phoneClean = phone ? digitsOnly(phone) : "";
  const phoneE164 = phoneClean.replace(/^\+/, "");
  const subject = encodeURIComponent(`Dotaz – ${dealerName}`);

  const whatsapp = phone ? `https://wa.me/${phoneE164}?text=${encoded}` : null;
  const telegram = phone ? `https://t.me/+${phoneE164}` : null;
  const mailtoHref = email ? `mailto:${email}?subject=${subject}&body=${encoded}` : null;

  const hasAnyChannel = !!(chatListingId || whatsapp || telegram || mailtoHref);
  if (!hasAnyChannel) return null;

  return (
    <div className="mt-3 flex flex-col gap-2 sm:flex-row">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-amber-700 px-4 text-base font-bold text-white transition hover:bg-amber-800"
          >
            <MessageSquare className="h-5 w-5" />
            Napsat
            <ChevronDown className="h-4 w-4 opacity-80" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" sideOffset={8} className="w-72 p-1">
          {chatListingId ? (
            <ChannelRow
              to={`/zpravy?listingId=${chatListingId}`}
              iconSrc={nnAutoLogo}
              label="Napsat do chatu NNAuto"
              hint="NNAuto.cz"
              iconClassName="bg-[#B8860B]/10"
            />
          ) : null}
          {mailtoHref ? (
            <ChannelRow
              href={mailtoHref}
              icon={Mail}
              label="Napsat e-mail"
              hint="E-mail"
              iconClassName="bg-amber-100 text-amber-700"
            />
          ) : null}
          {telegram ? (
            <ChannelRow
              href={telegram}
              icon={Send}
              label="Napsat na Telegram"
              hint="Telegram"
              iconClassName="bg-sky-100 text-sky-700"
            />
          ) : null}
          {whatsapp ? (
            <ChannelRow
              href={whatsapp}
              icon={MessageCircle}
              label="Napsat na WhatsApp"
              hint="WhatsApp"
              iconClassName="bg-emerald-100 text-emerald-700"
            />
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
      {phone ? (
        <a
          href={`tel:${phoneClean}`}
          className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl border bg-white px-4 text-base font-bold transition hover:bg-amber-50"
        >
          <Phone className="h-5 w-5 text-amber-700" />
          Zavolat
        </a>
      ) : null}
    </div>
  );
}
