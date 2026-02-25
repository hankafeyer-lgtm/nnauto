import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, FileText, DollarSign, Users, CheckCircle, AlertCircle, Clock, TrendingUp } from "lucide-react";
import { useTranslation } from "@/lib/translations";

export default function TipsPage() {
  const t = useTranslation();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
          {/* Page Header */}
          <div className="max-w-4xl mx-auto mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 tracking-tight">
              {t("tips.title")}
            </h1>
            <p className="text-lg text-muted-foreground">
              {t("tips.subtitle")}
            </p>
          </div>

          {/* Tips Content */}
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Photography Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Camera className="h-6 w-6 text-primary" />
                  {t("tips.photosTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {t("tips.photosIntro")}
                </p>
                <ul className="space-y-3">
                  <li className="flex gap-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">{t("tips.photo1Title")}</p>
                      <p className="text-sm text-muted-foreground">{t("tips.photo1Desc")}</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">{t("tips.photo2Title")}</p>
                      <p className="text-sm text-muted-foreground">{t("tips.photo2Desc")}</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">{t("tips.photo3Title")}</p>
                      <p className="text-sm text-muted-foreground">{t("tips.photo3Desc")}</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">{t("tips.photo4Title")}</p>
                      <p className="text-sm text-muted-foreground">{t("tips.photo4Desc")}</p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Description Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <FileText className="h-6 w-6 text-primary" />
                  {t("tips.descriptionTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {t("tips.descriptionIntro")}
                </p>
                <ul className="space-y-3">
                  <li className="flex gap-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">{t("tips.desc1Title")}</p>
                      <p className="text-sm text-muted-foreground">{t("tips.desc1Desc")}</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">{t("tips.desc2Title")}</p>
                      <p className="text-sm text-muted-foreground">{t("tips.desc2Desc")}</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">{t("tips.desc3Title")}</p>
                      <p className="text-sm text-muted-foreground">{t("tips.desc3Desc")}</p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Pricing Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <DollarSign className="h-6 w-6 text-primary" />
                  {t("tips.pricingTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm sm:text-base text-primary leading-relaxed">
                  {t("tips.pricingIntro")}
                </p>
                <ul className="space-y-3">
                  <li className="flex gap-3">
                    <TrendingUp className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-primary">{t("tips.price1Title")}</p>
                      <p className="text-sm text-primary">{t("tips.price1Desc")}</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <TrendingUp className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-primary">{t("tips.price2Title")}</p>
                      <p className="text-sm text-primary">{t("tips.price2Desc")}</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <TrendingUp className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-primary">{t("tips.price3Title")}</p>
                      <p className="text-sm text-primary">{t("tips.price3Desc")}</p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Communication Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Users className="h-6 w-6 text-primary" />
                  {t("tips.communicationTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex gap-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">{t("tips.comm1Title")}</p>
                      <p className="text-sm text-muted-foreground">{t("tips.comm1Desc")}</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">{t("tips.comm2Title")}</p>
                      <p className="text-sm text-muted-foreground">{t("tips.comm2Desc")}</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">{t("tips.comm3Title")}</p>
                      <p className="text-sm text-muted-foreground">{t("tips.comm3Desc")}</p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Common Mistakes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <AlertCircle className="h-6 w-6 text-destructive" />
                  {t("tips.mistakesTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-3">
                  <li className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">{t("tips.mistake1")}</p>
                  </li>
                  <li className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">{t("tips.mistake2")}</p>
                  </li>
                  <li className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">{t("tips.mistake3")}</p>
                  </li>
                  <li className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">{t("tips.mistake4")}</p>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Clock className="h-6 w-6 text-primary" />
                  {t("tips.timelineTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {t("tips.timelineIntro")}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-background/50 p-4 rounded-lg text-center">
                    <div className="text-3xl font-bold text-primary mb-2">1-3</div>
                    <p className="text-sm text-muted-foreground">{t("tips.timelineDays")}</p>
                  </div>
                  <div className="bg-background/50 p-4 rounded-lg text-center">
                    <div className="text-3xl font-bold text-primary mb-2">7-14</div>
                    <p className="text-sm text-muted-foreground">{t("tips.timelineWeeks")}</p>
                  </div>
                  <div className="bg-background/50 p-4 rounded-lg text-center">
                    <div className="text-3xl font-bold text-primary mb-2">21+</div>
                    <p className="text-sm text-muted-foreground">{t("tips.timelineMonth")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CTA */}
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="pt-6">
                <div className="text-center">
                  <h3 className="text-xl sm:text-2xl font-bold mb-3">
                    {t("tips.ctaTitle")}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {t("tips.ctaDesc")}
                  </p>
                  <a 
                    href="/" 
                    className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-6 py-3 font-semibold hover-elevate active-elevate-2"
                    data-testid="link-add-listing-cta"
                  >
                    {t("tips.ctaButton")}
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
