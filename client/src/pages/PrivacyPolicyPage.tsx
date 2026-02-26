import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
          {/* Page Header */}
          <div className="max-w-4xl mx-auto mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 tracking-tight">
              Ochrana osobních údajů
            </h1>
            <p className="text-lg text-muted-foreground">
              Poslední aktualizace: 12. listopadu 2024
            </p>
          </div>

          {/* Privacy Policy Content */}
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Introduction */}
            <Card>
              <CardHeader>
                <CardTitle>1. Úvod</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm sm:prose max-w-none space-y-4">
                <p>
                  Vítejte na NNAuto. Vážíme si vašeho soukromí a zavazujeme se chránit vaše osobní údaje. 
                  Tato zásada ochrany osobních údajů vysvětluje, jak shromažďujeme, používáme, sdílíme a chráníme 
                  vaše osobní údaje v souladu s nařízením GDPR (Obecné nařízení o ochraně osobních údajů) a 
                  českým zákonem č. 110/2019 Sb., o zpracování osobních údajů.
                </p>
                <p>
                  <strong>Správce osobních údajů:</strong><br />
                  NNAuto
                </p>
              </CardContent>
            </Card>

            {/* Data We Collect */}
            <Card>
              <CardHeader>
                <CardTitle>2. Jaké osobní údaje zpracováváme</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">2.1 Údaje při registraci a vytváření inzerátů</h3>
                  <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
                    <li>Jméno a příjmení</li>
                    <li>E-mailová adresa</li>
                    <li>Telefonní číslo</li>
                    <li>Informace o vozidlech (značka, model, rok výroby, cena, popis)</li>
                    <li>Fotografie vozidel</li>
                  </ul>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-semibold mb-2">2.2 Údaje o používání webu</h3>
                  <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
                    <li>IP adresa</li>
                    <li>Typ a verze prohlížeče</li>
                    <li>Operační systém</li>
                    <li>Navigační vzorce a chování na webu</li>
                    <li>Cookies a podobné technologie</li>
                  </ul>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-semibold mb-2">2.3 Platební údaje</h3>
                  <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
                    <li>Informace o platbách za prémiové služby (zpracovává Stripe)</li>
                    <li>Historie transakcí</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Purpose of Processing */}
            <Card>
              <CardHeader>
                <CardTitle>3. Účel zpracování osobních údajů</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Vaše osobní údaje zpracováváme pro tyto účely:</h3>
                  <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
                    <li><strong>Poskytování služeb:</strong> Vytváření a správa vašeho účtu, zveřejňování inzerátů</li>
                    <li><strong>Komunikace:</strong> Odpovědi na dotazy, zasílání důležitých informací o službách</li>
                    <li><strong>Platby:</strong> Zpracování plateb za prémiové služby (TOP inzeráty)</li>
                    <li><strong>Zlepšování služeb:</strong> Analýza používání webu pro vylepšení uživatelského zážitku</li>
                    <li><strong>Bezpečnost:</strong> Prevence podvodů a zajištění bezpečnosti platformy</li>
                    <li><strong>Marketing:</strong> Zasílání novinek a nabídek (pouze se souhlasem)</li>
                    <li><strong>Právní povinnosti:</strong> Plnění zákonných požadavků</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Legal Basis */}
            <Card>
              <CardHeader>
                <CardTitle>4. Právní základ zpracování</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Vaše osobní údaje zpracováváme na základě těchto právních základů dle GDPR:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
                  <li><strong>Plnění smlouvy (čl. 6 odst. 1 písm. b GDPR):</strong> Pro poskytování našich služeb</li>
                  <li><strong>Souhlas (čl. 6 odst. 1 písm. a GDPR):</strong> Pro marketingové účely a cookies</li>
                  <li><strong>Oprávněný zájem (čl. 6 odst. 1 písm. f GDPR):</strong> Pro zlepšování služeb a bezpečnost</li>
                  <li><strong>Právní povinnost (čl. 6 odst. 1 písm. c GDPR):</strong> Pro plnění zákonných požadavků</li>
                </ul>
              </CardContent>
            </Card>

            {/* Data Sharing */}
            <Card>
              <CardHeader>
                <CardTitle>5. Sdílení osobních údajů</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Vaše osobní údaje můžeme sdílet s těmito třetími stranami:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
                  <li><strong>Stripe:</strong> Pro zpracování plateb za prémiové služby (v souladu se Standardními smluvními doložkami EU)</li>
                  <li><strong>Poskytovatelé hostingu:</strong> Pro ukládání dat (servery v EU)</li>
                  <li><strong>Analytické služby:</strong> Pro analýzu používání webu (anonymizovaná data)</li>
                  <li><strong>Orgány veřejné moci:</strong> V případě právní povinnosti nebo žádosti</li>
                </ul>
                <p className="text-sm text-muted-foreground mt-4">
                  Vaše údaje neprodáváme třetím stranám pro marketingové účely.
                </p>
              </CardContent>
            </Card>

            {/* Data Retention */}
            <Card>
              <CardHeader>
                <CardTitle>6. Doba uchovávání údajů</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
                  <li><strong>Aktivní účty:</strong> Po dobu trvání vaší registrace a aktivního využívání služeb</li>
                  <li><strong>Neaktivní účty:</strong> 3 roky od poslední aktivity, poté jsou údaje smazány</li>
                  <li><strong>Platební údaje:</strong> 10 let z důvodu daňových a účetních předpisů</li>
                  <li><strong>Komunikace:</strong> 2 roky od poslední komunikace</li>
                  <li><strong>Marketing:</strong> Do odvolání souhlasu nebo 3 roky od posledního souhlasu</li>
                </ul>
              </CardContent>
            </Card>

            {/* Data Security */}
            <Card>
              <CardHeader>
                <CardTitle>7. Zabezpečení údajů</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Implementovali jsme vhodná technická a organizační opatření k ochraně vašich osobních údajů:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
                  <li>Šifrování dat při přenosu (HTTPS/TLS)</li>
                  <li>Šifrování citlivých údajů při ukládání</li>
                  <li>Pravidelné bezpečnostní audity</li>
                  <li>Omezený přístup k osobním údajům pouze pro oprávněné osoby</li>
                  <li>Pravidelné zálohování dat</li>
                  <li>Systémy detekce a prevence útoků</li>
                </ul>
              </CardContent>
            </Card>

            {/* Your Rights */}
            <Card>
              <CardHeader>
                <CardTitle>8. Vaše práva</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  V souladu s GDPR máte následující práva:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
                  <li><strong>Právo na přístup (čl. 15 GDPR):</strong> Můžete požádat o kopii svých osobních údajů</li>
                  <li><strong>Právo na opravu (čl. 16 GDPR):</strong> Můžete požádat o opravu nepřesných údajů</li>
                  <li><strong>Právo na výmaz (čl. 17 GDPR):</strong> Můžete požádat o smazání svých údajů</li>
                  <li><strong>Právo na omezení zpracování (čl. 18 GDPR):</strong> Můžete požádat o omezení zpracování</li>
                  <li><strong>Právo na přenositelnost (čl. 20 GDPR):</strong> Můžete obdržet své údaje ve strukturovaném formátu</li>
                  <li><strong>Právo vznést námitku (čl. 21 GDPR):</strong> Můžete vznést námitku proti zpracování</li>
                  <li><strong>Právo odvolat souhlas (čl. 7 odst. 3 GDPR):</strong> Můžete kdykoliv odvolat svůj souhlas</li>
                </ul>
                <Separator className="my-4" />
                <div>
                  <h3 className="font-semibold mb-2">Jak uplatnit svá práva:</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Pro uplatnění svých práv nás kontaktujte na:
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Email: <a href="mailto:gdpr@zlateauto.cz" className="text-primary hover:underline">gdpr@zlateauto.cz</a><br />
                    Odpovíme vám do 30 dnů od obdržení žádosti.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Cookies */}
            <Card>
              <CardHeader>
                <CardTitle>9. Cookies a podobné technologie</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Používáme cookies a podobné technologie ke zlepšení vašeho zážitku na webu:
                </p>
                
                <div>
                  <h3 className="font-semibold mb-2">9.1 Nezbytné cookies</h3>
                  <p className="text-sm text-muted-foreground">
                    Tyto cookies jsou nutné pro správné fungování webu (např. přihlášení, košík).
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">9.2 Analytické cookies</h3>
                  <p className="text-sm text-muted-foreground">
                    Pomáhají nám pochopit, jak návštěvníci používají náš web (vyžaduje souhlas).
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">9.3 Marketingové cookies</h3>
                  <p className="text-sm text-muted-foreground">
                    Používají se k zobrazování relevantních reklam (vyžaduje souhlas).
                  </p>
                </div>
                
                <p className="text-sm text-muted-foreground mt-4">
                  Svůj souhlas můžete kdykoli změnit v nastavení cookies nebo ve vašem prohlížeči.
                </p>
              </CardContent>
            </Card>

            {/* International Transfers */}
            <Card>
              <CardHeader>
                <CardTitle>10. Mezinárodní předávání údajů</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Vaše osobní údaje ukládáme primárně na serverech v Evropské unii. V případě předávání 
                  údajů mimo EU (např. Stripe pro platby) používáme vhodná ochranná opatření:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
                  <li>Standardní smluvní doložky EU (čl. 46 odst. 2 písm. c GDPR)</li>
                  <li>Certifikace Privacy Shield (kde je k dispozici)</li>
                  <li>Rozhodnutí Komise o přiměřenosti</li>
                </ul>
              </CardContent>
            </Card>

            {/* Complaints and Contact */}
            <Card>
              <CardHeader>
                <CardTitle>11. Stížnosti a kontakt</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Kontakt na správce údajů:</h3>
                  <p className="text-sm text-muted-foreground">
                    NNAuto
                  </p>
                </div>
                
                <Separator className="my-4" />
                
                <div>
                  <h3 className="font-semibold mb-2">Dozorový úřad:</h3>
                  <p className="text-sm text-muted-foreground">
                    Máte právo podat stížnost u dozorového úřadu:<br /><br />
                    <strong>Úřad pro ochranu osobních údajů</strong><br />
                    Pplk. Sochora 27<br />
                    170 00 Praha 7<br />
                    Email: posta@uoou.cz<br />
                    Tel.: +420 234 665 111<br />
                    Web: <a href="https://www.uoou.cz" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.uoou.cz</a>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Updates */}
            <Card>
              <CardHeader>
                <CardTitle>12. Aktualizace těchto zásad</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Tyto zásady ochrany osobních údajů můžeme čas od času aktualizovat. O významných změnách 
                  vás budeme informovat e-mailem nebo oznámením na webu. Doporučujeme pravidelně kontrolovat 
                  tuto stránku pro aktuální informace.
                </p>
                <p className="text-sm text-muted-foreground mt-4">
                  <strong>Datum poslední aktualizace:</strong> 12. listopadu 2024
                </p>
              </CardContent>
            </Card>

            {/* Contact CTA */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-8 text-center">
                <h3 className="text-xl font-semibold mb-4">Máte otázky o ochraně vašich údajů?</h3>
                <p className="text-muted-foreground mb-6">
                  Rádi vám odpovíme na jakékoliv dotazy týkající se zpracování vašich osobních údajů.
                </p>
                <a 
                  href="mailto:info@nnauto.cz"
                  className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground hover-elevate active-elevate-2 px-6 py-3 text-sm font-medium"
                  data-testid="button-contact-gdpr"
                >
                  info@nnauto.cz
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
