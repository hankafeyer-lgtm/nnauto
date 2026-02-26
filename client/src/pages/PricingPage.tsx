import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PricingCard from "@/components/PricingCard";
import LoginModal from "@/components/LoginModal";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { SEO, generateFAQSchema } from "@/components/SEO";

export default function PricingPage() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { toast } = useToast();

  const faqs = [
    {
      question: "Jak dlouho je inzerát aktivní?",
      answer: "Všechny inzeráty jsou aktivní po dobu 30 dní od jejich zveřejnění."
    },
    {
      question: "Mohu kombinovat různé balíčky?",
      answer: "Ano, můžete si kdykoli dokoupit další inzeráty nebo přejít na vyšší balíček podle aktuálních potřeb. Vaše stávající inzeráty zůstanou aktivní."
    },
    {
      question: "Jaké platební metody přijímáte?",
      answer: "Přijímáme platby kartou (Visa, Mastercard), bankovním převodem a pro balíček Pro také nabízíme fakturaci s prodlouženou splatností."
    },
    {
      question: "Nabízíte slevy pro větší objemy?",
      answer: "Pro autosalony a autobazary s většími požadavky připravíme individuální cenovou nabídku. Kontaktujte nás pro diskusi o vašich potřebách."
    }
  ];

  const faqSchema = generateFAQSchema(faqs);

  const plans = [
    {
      title: "Basic",
      description: "Ideální pro prodej jednoho vozidla",
      price: "60 Kč",
      period: "za inzerát",
      features: [
        "1 inzerát na 30 dní",
        "Fotogalerie až 10 fotografií",
        "Kompletní technické údaje",
        "Email podpora",
      ],
      buttonText: "Zdarma do 15.01.2026",
    },
    {
      title: "Premium",
      description: "Pro aktivní prodejce a sběratele",
      price: "370 Kč",
      period: "za balíček",
      badge: "Nejoblíbenější",
      highlighted: true,
      features: [
        "5 až 10 inzerátů na 30 dní",
        "Zvýrazněné zobrazení",
        "Neomezená fotogalerie",
        "Prioritní podpora",
      ],
      buttonText: "Zdarma do 15.01.2026",
    },
    {
      title: "Pro",
      description: "Pro autosalony a autobazary",
      price: "850 Kč",
      period: "za balíček",
      features: [
        "15 až 25 inzerátů na 30 dní",
        "VIP pozice ve výsledcích",
        "Označení \"Certifikovaný autobazar\"",
        "Flexibilní platební podmínky",
      ],
      buttonText: "Zdarma do 15.01.2026",
    },
  ];

  const handlePlanSelect = () => {
    setIsLoginModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO 
        title="Ceník inzerátu - Ceny za inzerování vozidel"
        description="Transparentní ceník inzerce vozidel na NNAuto.cz. Vyberte si z balíčků Basic od 60 Kč, Premium od 370 Kč nebo Pro od 850 Kč. Bez skrytých poplatků."
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
              Transparentní ceny bez skrytých poplatků. Platíte pouze za to, co skutečně využijete.
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
                <div>
                  <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3">Jak dlouho je inzerát aktivní?</h3>
                  <p className="text-sm sm:text-base text-black dark:text-white leading-relaxed">
                    Všechny inzeráty jsou aktivní po dobu 30 dní od jejich zveřejnění. U balíčků Premium a Pro máte navíc možnost automatického obnovení.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3">Mohu kombinovat různé balíčky?</h3>
                  <p className="text-sm sm:text-base text-black dark:text-white leading-relaxed">
                    Ano, můžete si kdykoli dokoupit další inzeráty nebo přejít na vyšší balíček podle aktuálních potřeb. Vaše stávající inzeráty zůstanou aktivní.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3">Jaké platební metody přijímáte?</h3>
                  <p className="text-sm sm:text-base text-black dark:text-white leading-relaxed">
                    Přijímáme platby kartou (Visa, Mastercard), bankovním převodem a pro balíček Pro také nabízíme fakturaci s prodlouženou splatností.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3">Nabízíte slevy pro větší objemy?</h3>
                  <p className="text-sm sm:text-base text-black dark:text-white leading-relaxed">
                    Pro autosalony a autobazary s většími požadavky připravíme individuální cenovou nabídku. Kontaktujte nás pro diskusi o vašich potřebách.
                  </p>
                </div>
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
