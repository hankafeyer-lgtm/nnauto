import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PricingCard from "@/components/PricingCard";
import LoginModal from "@/components/LoginModal";
import { useState } from "react";
import { SEO, generateFAQSchema } from "@/components/SEO";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PRIVATE_LISTING_PRICE_LABEL } from "@shared/privateListingBilling";
import {
  Building2,
  CreditCard,
  Crown,
  Infinity,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";

const TOP_PRICE_LABEL = "99 Kč";
const PRIVATE_PLUS_TOP_LABEL = "168 Kč";

export default function PricingPage() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const faqs = [
    {
      question: "Jak dlouho je inzerát aktivní?",
      answer:
        "Po jednorázové platbě zůstává inzerát aktivní natrvalo — dokud jej sami nesmažete. Nejde o měsíční předplatné.",
    },
    {
      question: "Kolik stojí zveřejnění inzerátu pro soukromé prodejce?",
      answer: `Soukromí prodejci platí jednorázově ${PRIVATE_LISTING_PRICE_LABEL} za každý inzerát. Platba není měsíční.`,
    },
    {
      question: "Co je TOP inzerát a kolik stojí?",
      answer: `TOP zvýrazní váš inzerát ve výsledcích na 30 dní za ${TOP_PRICE_LABEL}. Pokud ještě nemáte zaplacené zveřejnění, zaplatíte ${PRIVATE_PLUS_TOP_LABEL} (zveřejnění ${PRIVATE_LISTING_PRICE_LABEL} + TOP ${TOP_PRICE_LABEL}).`,
    },
    {
      question: "Jaké platební metody přijímáte?",
      answer:
        "Přijímáme platby kartou (Visa, Mastercard) přes Stripe. Pro autobazary nabízíme také balíčky inzerce.",
    },
    {
      question: "Nabízíte slevy pro větší objemy?",
      answer:
        "Pro autosalony a autobazary s většími požadavky připravíme individuální cenovou nabídku. Kontaktujte nás pro diskusi o vašich potřebách.",
    },
  ];

  const faqSchema = generateFAQSchema(faqs);

  const plans = [
    {
      title: "Soukromý prodejce",
      description: "Ideální pro prodej jednoho vozidla",
      price: PRIVATE_LISTING_PRICE_LABEL,
      period: "jednorázově · navždy aktivní",
      badge: "Nejčastější",
      icon: UserRound,
      features: [
        "1 inzerát natrvalo (dokud sami nesmažete)",
        "Fotogalerie a kompletní údaje",
        "Bez měsíčního předplatného",
        "Email podpora",
      ],
      buttonText: "Vystavit inzerát",
    },
    {
      title: "TOP inzerát",
      description: "Zvýraznění ve výsledcích hledání",
      price: TOP_PRICE_LABEL,
      period: "na 30 dní · volitelné",
      badge: "Rychlejší prodej",
      highlighted: true,
      icon: Crown,
      features: [
        "Vyšší pozice ve výsledcích",
        `Spolu se zveřejněním: ${PRIVATE_PLUS_TOP_LABEL}`,
        "Lze dokoupit k běžnému inzerátu",
        "Platí přesně 30 dní",
      ],
      buttonText: "Vystavit TOP inzerát",
    },
    {
      title: "Autobazar / Dealer",
      description: "Pro autosalony a autobazary",
      price: "Balíčky",
      period: "dle objemu inzerátů",
      icon: Building2,
      features: [
        "Více vozidel v nabídce",
        "Import a hromadná správa",
        "Dealerský kabinet a statistiky",
        "Individuální podmínky",
      ],
      buttonText: "Kontaktovat / dealer",
    },
  ];

  const trustPoints = [
    {
      icon: CreditCard,
      title: "Platba kartou",
      text: "Bezpečně přes Stripe",
    },
    {
      icon: Infinity,
      title: "Bez předplatného",
      text: "Jednorázově za inzerát",
    },
    {
      icon: ShieldCheck,
      title: "Bez skrytých poplatků",
      text: "Cena je finální",
    },
  ];

  const handlePlanSelect = () => {
    setIsLoginModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Ceník inzerátu - Ceny za inzerování vozidel"
        description={`Ceník inzerce na NNAuto.cz. Soukromí prodejci platí jednorázově ${PRIVATE_LISTING_PRICE_LABEL} za inzerát — bez měsíčního předplatného. TOP zvýraznění od ${TOP_PRICE_LABEL}.`}
        keywords="ceník inzerátu, cena inzerátu, autobazar ceník, prodej auta cena, NNAuto ceník, inzerce vozidel cena"
        url="https://nnauto.cz/pricing"
        structuredData={faqSchema}
      />
      <Header />

      <main className="relative flex-1 overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 70% 45% at 50% -5%, rgba(212,175,55,0.22), transparent 58%), radial-gradient(ellipse 40% 30% at 100% 20%, rgba(184,134,11,0.08), transparent 50%), radial-gradient(ellipse 35% 28% at 0% 30%, rgba(212,175,55,0.08), transparent 50%), linear-gradient(180deg, #faf6ee 0%, #ffffff 38%, #f8f4ec 100%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.35] dark:hidden"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23B8860B' fill-opacity='0.045'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />

        <section className="relative pt-11 pb-7 sm:pt-16 sm:pb-10 lg:pt-20 lg:pb-12">
          <div className="container mx-auto px-4 text-center sm:px-6 lg:px-8">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-[#B8860B]/30 bg-white/70 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-[#8a6a10] shadow-sm backdrop-blur-sm dark:border-[#B8860B]/40 dark:bg-black/30 dark:text-[#D4AF37] sm:text-sm">
              <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Transparentní ceny · bez skrytých poplatků
            </div>

            <h1 className="mt-5 bg-gradient-to-b from-[#5c4508] to-[#B8860B] bg-clip-text text-4xl font-semibold tracking-tight text-transparent dark:from-[#F0D78C] dark:to-[#B8860B] sm:mt-6 sm:text-5xl lg:text-[3.4rem]">
              Ceník inzerátu
            </h1>
            <div
              aria-hidden
              className="mx-auto mt-4 h-1 w-16 rounded-full bg-gradient-to-r from-[#B8860B] to-[#D4AF37] sm:mt-5 sm:w-20"
            />
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:mt-5 sm:text-base lg:text-lg">
              Soukromí prodejci platí jednou {PRIVATE_LISTING_PRICE_LABEL} —
              inzerát zůstane aktivní, dokud jej sami nesmažete. TOP je volitelné
              zvýraznění na 30 dní.
            </p>
          </div>
        </section>

        <section className="pb-6 sm:pb-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
              {trustPoints.map((item) => (
                <div
                  key={item.title}
                  className="flex items-center gap-3 rounded-2xl border border-black/5 bg-white/75 px-4 py-3 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-card/70 sm:flex-col sm:items-center sm:px-3 sm:py-4 sm:text-center"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#B8860B]/12 text-[#8a6a10] dark:text-[#D4AF37]">
                    <item.icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {item.title}
                    </p>
                    <p className="text-xs text-muted-foreground sm:mt-0.5">
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="pb-12 sm:pb-16 lg:pb-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto grid max-w-6xl grid-cols-1 items-stretch gap-5 sm:gap-6 md:grid-cols-3 md:gap-5 lg:gap-7">
              {plans.map((plan) => (
                <PricingCard
                  key={plan.title}
                  {...plan}
                  onSelect={handlePlanSelect}
                  featureTextColor="text-sm text-foreground/90"
                />
              ))}
            </div>

            <div className="mx-auto mt-8 max-w-3xl overflow-hidden rounded-2xl border border-[#B8860B]/20 bg-gradient-to-br from-white/90 via-[#fffdf8] to-[#B8860B]/[0.07] shadow-[0_12px_36px_rgba(40,30,10,0.06)] dark:from-card/90 dark:via-card/80 dark:to-[#B8860B]/10 sm:mt-10">
              <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-7 sm:py-6">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#B8860B]/15 text-[#8a6a10] dark:text-[#D4AF37]">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground sm:text-base">
                      Jak to vychází
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                      Běžný inzerát {PRIVATE_LISTING_PRICE_LABEL} · s TOP
                      zvýrazněním {PRIVATE_PLUS_TOP_LABEL} ({PRIVATE_LISTING_PRICE_LABEL}{" "}
                      + {TOP_PRICE_LABEL})
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 sm:justify-end">
                  <span className="inline-flex items-center rounded-full border border-[#B8860B]/25 bg-white/80 px-3 py-1.5 text-xs font-semibold text-[#8a6a10] dark:bg-black/20 dark:text-[#D4AF37]">
                    {PRIVATE_LISTING_PRICE_LABEL} jednou
                  </span>
                  <span className="inline-flex items-center rounded-full bg-gradient-to-r from-[#B8860B] to-[#D4AF37] px-3 py-1.5 text-xs font-semibold text-white shadow-sm">
                    + TOP = {PRIVATE_PLUS_TOP_LABEL}
                  </span>
                </div>
              </div>
            </div>

            <div className="mx-auto mt-12 max-w-3xl overflow-hidden rounded-[1.5rem] border border-black/5 bg-white/85 shadow-[0_18px_50px_rgba(40,30,10,0.08)] backdrop-blur-sm dark:border-white/10 dark:bg-card/85 sm:mt-16">
              <div className="relative border-b border-[#B8860B]/15 px-5 py-5 sm:px-8 sm:py-6">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#B8860B]/10 via-transparent to-[#D4AF37]/10"
                />
                <h2 className="relative text-center text-xl font-semibold tracking-tight sm:text-2xl">
                  Často kladené otázky
                </h2>
              </div>
              <Accordion type="single" collapsible className="px-2 sm:px-4">
                {faqs.map((faq, index) => (
                  <AccordionItem
                    key={faq.question}
                    value={`faq-${index}`}
                    className="border-border/50 px-3 sm:px-4"
                  >
                    <AccordionTrigger className="gap-3 py-5 text-left hover:no-underline sm:py-6">
                      <span className="flex items-start gap-3 sm:gap-4">
                        <span className="mt-0.5 hidden h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#B8860B]/10 text-xs font-bold text-[#8a6a10] dark:text-[#D4AF37] sm:inline-flex">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="text-base font-semibold text-foreground sm:text-lg">
                          {faq.question}
                        </span>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground sm:pb-6 sm:pl-12 sm:text-[15px]">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <LoginModal
        open={isLoginModalOpen}
        onOpenChange={setIsLoginModalOpen}
      />
    </div>
  );
}
