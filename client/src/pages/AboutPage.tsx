import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Car, Shield, Heart, Users, Award, TrendingUp } from "lucide-react";
import { useTranslation } from "@/lib/translations";

export default function AboutPage() {
  const t = useTranslation();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
          {/* Page Header */}
          <div className="max-w-4xl mx-auto mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 tracking-tight">
              {t("about.title")}
            </h1>
            <p className="text-lg text-black dark:text-white">
              {t("about.subtitle")}
            </p>
          </div>

          {/* About Content */}
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Story */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Car className="h-6 w-6 text-primary" />
                  {t("about.storyTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {t("about.storyP1")}
                </p>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {t("about.storyP2")}
                </p>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {t("about.storyP3")}
                </p>
              </CardContent>
            </Card>

            {/* Mission */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Heart className="h-6 w-6 text-primary" />
                  {t("about.missionTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {t("about.missionP1")}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                  <div className="bg-background/50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" />
                      {t("about.trustTitle")}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {t("about.trustDesc")}
                    </p>
                  </div>
                  <div className="bg-background/50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      {t("about.communityTitle")}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {t("about.communityDesc")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Values */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Award className="h-6 w-6 text-primary" />
                  {t("about.valuesTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">🎯 {t("about.value1Title")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("about.value1Desc")}
                  </p>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-semibold mb-2">🔒 {t("about.value2Title")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("about.value2Desc")}
                  </p>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-semibold mb-2">✨ {t("about.value3Title")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("about.value3Desc")}
                  </p>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-semibold mb-2">🌍 {t("about.value4Title")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("about.value4Desc")}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <TrendingUp className="h-6 w-6 text-primary" />
                  {t("about.statsTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">15K+</div>
                    <p className="text-sm text-muted-foreground">{t("about.stat1")}</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">50K+</div>
                    <p className="text-sm text-muted-foreground">{t("about.stat2")}</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">98%</div>
                    <p className="text-sm text-muted-foreground">{t("about.stat3")}</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">24/7</div>
                    <p className="text-sm text-muted-foreground">{t("about.stat4")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Team */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Users className="h-6 w-6 text-primary" />
                  {t("about.teamTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {t("about.teamP1")}
                </p>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {t("about.teamP2")}
                </p>
              </CardContent>
            </Card>

            {/* Contact CTA */}
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="pt-6">
                <div className="text-center">
                  <h3 className="text-xl sm:text-2xl font-bold mb-3">
                    {t("about.ctaTitle")}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {t("about.ctaDesc")}
                  </p>
                  <a 
                    href="mailto:info@nnauto.cz" 
                    className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-6 py-3 font-semibold hover-elevate active-elevate-2"
                    data-testid="link-contact-email"
                  >
                    info@nnauto.cz
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
