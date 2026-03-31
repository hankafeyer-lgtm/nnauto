import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { Car, Home, Search } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Stránka nenalezena (404)"
        description="Hledaná stránka nebyla nalezena. Prohlédněte si nabídku automobilů na NNAuto.cz."
        noindex
      />
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-lg">
          <div className="mx-auto h-20 w-20 rounded-2xl bg-amber-50 flex items-center justify-center mb-6">
            <Car className="h-10 w-10 text-amber-700" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">404</h1>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Stránka nenalezena
          </h2>
          <p className="text-muted-foreground mb-8">
            Omlouváme se, ale hledaná stránka neexistuje nebo byla přesunuta.
            Zkuste vyhledat auto v naší nabídce.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild className="bg-amber-700 hover:bg-amber-800">
              <a href="/">
                <Home className="h-4 w-4 mr-2" />
                Domů
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href="/listings">
                <Search className="h-4 w-4 mr-2" />
                Hledat auto
              </a>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
