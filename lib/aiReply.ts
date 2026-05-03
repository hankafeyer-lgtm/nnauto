import type { Message } from "@shared/schema";

/**
 * Heuristic-based mock for "AI suggestion" in the dealer inbox.
 *
 * This is intentionally NOT a real LLM call — the spec asked for a
 * placeholder that returns mock text (later wired to a real provider).
 * The heuristic looks at the latest client message and produces a
 * sensible Czech reply that the dealer can edit before sending.
 *
 * Replacing this with OpenAI/Anthropic later means swapping just this
 * function: the API route + UI button never change.
 */
export function generateMockAiReply(args: {
  messages: Message[];
  listing?: {
    title?: string | null;
    brand?: string | null;
    model?: string | null;
    year?: number | null;
    price?: string | null;
    phone?: string | null;
  } | null;
  dealerName?: string | null;
}): string {
  const lastClient =
    [...args.messages].reverse().find((m) => m.sender === "client")?.content ??
    "";
  const lc = lastClient.toLowerCase();

  const listing = args.listing;
  const carName = [listing?.brand, listing?.model].filter(Boolean).join(" ").toUpperCase() ||
    listing?.title ||
    "vůz";

  const greeting = "Dobrý den, ";
  const signoff = args.dealerName ? `\n\nS pozdravem,\n${args.dealerName}` : "";

  const intents: Array<{ test: RegExp; reply: string }> = [
    {
      test: /(k dispozici|dostupn|available|доступн|ще є)/i,
      reply: `${greeting}děkuji za zájem o ${carName}. Ano, vůz je stále k dispozici. Můžeme se domluvit na prohlídce?`,
    },
    {
      test: /(cena|price|ціна|ціну|sleva|torg|торг|rabat|discount)/i,
      reply: `${greeting}cena je aktuální. Drobný smluvní prostor je možný při rychlém jednání. Kdy by vám vyhovovala prohlídka?`,
    },
    {
      test: /(prohlíd|inspection|огляд|test\s*drive|zkušebn)/i,
      reply: `${greeting}rád/a vás přivítám na prohlídce. Vyhovuje vám zítra odpoledne, případně víkend? Vůz je u nás v showroomu.`,
    },
    {
      test: /(telefon|phone|номер|callback|zavolat|zavolejte)/i,
      reply: listing?.phone
        ? `${greeting}děkuji za zájem. Můžete mě kontaktovat na čísle ${listing.phone}, ozvu se vám obratem.`
        : `${greeting}rád/a vám zavolám. Pošlete mi prosím vaše telefonní číslo a vhodný čas pro hovor.`,
    },
    {
      test: /(servisn|history|vin|technick|stav|kondicia|стан)/i,
      reply: `${greeting}vůz má kompletní servisní historii a všechny revize jsou v pořádku. Rád/a vám vše doložím při prohlídce, případně mohu zaslat dokumenty na e-mail.`,
    },
    {
      test: /(financov|leasing|úvěr|úver|кредит|installment|splátk)/i,
      reply: `${greeting}financování i operativní leasing umíme zařídit přímo u nás. Pošlu vám předběžnou kalkulaci, jakmile mi napíšete preferovanou délku a akontaci.`,
    },
    {
      test: /(výměn|protiúčet|trade[\- ]?in|обмін)/i,
      reply: `${greeting}protiúčet umíme zpracovat. Pošlete mi prosím rok výroby, najeté km a fotky vašeho vozu, připravím vám orientační nabídku.`,
    },
  ];

  const matched = intents.find((i) => i.test.test(lc));
  if (matched) return matched.reply + signoff;

  // Generic fallback — cover the case where there's no client message yet
  if (!lastClient) {
    return `${greeting}děkuji za zájem o ${carName}. Co konkrétně vás na voze zajímá? Rád/a vám pošlu více informací.${signoff}`;
  }

  return `${greeting}děkuji za vaši zprávu. Rád/a vám odpovím na všechny dotazy ohledně ${carName}. Můžeme se domluvit na prohlídce, nebo vám mám něco upřesnit písemně?${signoff}`;
}
