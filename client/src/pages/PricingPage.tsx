import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PricingCard from "@/components/PricingCard";
import LoginModal from "@/components/LoginModal";
import { useState } from "react";
import { SEO, generateFAQSchema } from "@/components/SEO";
import { PRIVATE_LISTING_PRICE_LABEL } from "@shared/privateListingBilling";

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
      answer: `Soukromí prodejci platí jednorázově ${PRIVATE_LISTING_PRICE_LABEL} za každé ohlášení. Platba není měsíční.`,
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
      period: "jednorázově za inzerát",
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
      price: "99 Kč",
      period: "na 30 dní",
      badge: "Volitelné",
      highlighted: true,
      features: [
        "Vyšší pozice ve výsledcích",
        "Pro soukromé + zveřejnění 168,99 Kč",
        "Lze dokoupit k běžnému inzerátu",
        "Platí 30 dní",
      ],
      buttonText: "Vystavit TOP inzerát",
    },
    {
      title: "Autobazar / Dealer",
      description: "Pro autosalony a autobazary",
      price: "Balíčky",
      period: "dle objemu",
      features: [
        "Více vozidel v nabídce",
        "Import a hromadná správa",
        "Dealerský kabinet a statistiky",
        "Individuální podmínky",
      ],
      buttonText: "Kontaktovat / dealer",
    },
  ];

  const handlePlanSelect = () => {
    setIsLoginModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO 
        title="Ceník inzerátu - Ceny za inzerování vozidel"
        description={`Ceník inzerce na NNAuto.cz. Soukromí prodejci platí jednorázově ${PRIVATE_LISTING_PRICE_LABEL} za inzerát — bez měsíčního předplatného. TOP zvýraznění od 99 Kč.`}
        keywords="ceník inzerátu, cena inzerátu, autobazar ceník, prodej auta cena, NNAuto ceník, inzerce vozidel cena"
        url="https://nnauto.cz/pricing"
        structuredData={faqSchema}
      />
      <Header />
      
      <main className="flex-1">
        <section className="py-12 sm:py-16 lg:py-24 bg-gradient-to-b from-muted/50 to-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight mb-4 sm:mb-6">Ceník inzerátu</h1>
            <p className="text-base sm:text-lg lg:text-xl text-black dark:text-white max-w-3xl mx-auto leading-relaxed px-4">
              Transparentní ceny bez skrytých poplatků. Soukromí prodejci platí jednou — inzerát zůstane aktivní, dokud jej sami nesmažete.
            </p>
          </div>
        </section>

        <section className="py-8 sm:py-12 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 max-w-7xl mx-auto">
              {plans.map((plan) => (
                <PricingCard 
                  key={plan.title} 
                  {...plan} 
                  onSelect={handlePlanSelect}
                  featureTextColor="text-black dark:text-white text-sm"
                />
              ))}
            </div>

            <div className="mt-12 sm:mt-16 lg:mt-24 bg-card border rounded-xl sm:rounded-2xl p-6 sm:p-8 lg:p-12 max-w-4xl mx-auto shadow-xl">
              <h2 className="text-2xl sm:text-3xl font-semibold mb-6 sm:mb-8 text-center tracking-tight">Často kladené otázky</h2>
              <div className="space-y-6 sm:space-y-8">
                {faqs.map((faq) => (
                  <div key={faq.question}>
                    <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3">{faq.question}</h3>
                    <p className="text-sm sm:text-base text-black dark:text-white leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
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
