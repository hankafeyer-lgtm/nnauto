// Czech display labels for listing spec values. Mirrors the maps used in the
// client app (translations.ts) so that server-rendered pages (e.g. the public
// dealer profile) show the same human-readable values as the listings grid.

const fuelTypeLabelsCs: Record<string, string> = {
  benzin: "Benzín",
  diesel: "Nafta",
  hybrid: "Hybridní",
  electric: "Elektro",
  lpg: "LPG + benzín",
  cng: "CNG + benzín",
  ethanol: "Ethanol",
  hydrogen: "Vodík",
  other: "Jiné",
};

const transmissionLabelsCs: Record<string, string> = {
  manual: "Manuální",
  automatic: "Automatická",
  robot: "Robotizovaná",
  cvt: "CVT",
};

const regionLabelsCs: Record<string, string> = {
  // Kraje
  praha: "Praha",
  stredocesky: "Středočeský kraj",
  jihocesky: "Jihočeský kraj",
  plzensky: "Plzeňský kraj",
  karlovarsky: "Karlovarský kraj",
  ustecky: "Ústecký kraj",
  liberecky: "Liberecký kraj",
  kralovehradecky: "Královéhradecký kraj",
  pardubicky: "Pardubický kraj",
  vysocina: "Kraj Vysočina",
  jihomoravsky: "Jihomoravský kraj",
  olomoucky: "Olomoucký kraj",
  zlinsky: "Zlínský kraj",
  moravskoslezsky: "Moravskoslezský kraj",
  // Praha - městské části
  "praha-1": "Praha 1",
  "praha-2": "Praha 2",
  "praha-3": "Praha 3",
  "praha-4": "Praha 4",
  "praha-5": "Praha 5",
  "praha-6": "Praha 6",
  "praha-7": "Praha 7",
  "praha-8": "Praha 8",
  "praha-9": "Praha 9",
  "praha-10": "Praha 10",
  // Středočeský kraj
  kladno: "Kladno",
  "mlada-boleslav": "Mladá Boleslav",
  pribram: "Příbram",
  kolin: "Kolín",
  "kutna-hora": "Kutná Hora",
  melnik: "Mělník",
  benesov: "Benešov",
  beroun: "Beroun",
  rakovnik: "Rakovník",
  nymburk: "Nymburk",
  podebrady: "Poděbrady",
  "brandys-nad-labem": "Brandýs nad Labem",
  // Jihočeský kraj
  "ceske-budejovice": "České Budějovice",
  tabor: "Tábor",
  pisek: "Písek",
  strakonice: "Strakonice",
  "jindrichuv-hradec": "Jindřichův Hradec",
  "cesky-krumlov": "Český Krumlov",
  prachatice: "Prachatice",
  // Plzeňský kraj
  plzen: "Plzeň",
  klatovy: "Klatovy",
  rokycany: "Rokycany",
  domazlice: "Domažlice",
  tachov: "Tachov",
  // Karlovarský kraj
  "karlovy-vary": "Karlovy Vary",
  cheb: "Cheb",
  sokolov: "Sokolov",
  "marianske-lazne": "Mariánské Lázně",
  "frantiskovy-lazne": "Františkovy Lázně",
  // Ústecký kraj
  "usti-nad-labem": "Ústí nad Labem",
  most: "Most",
  teplice: "Teplice",
  decin: "Děčín",
  chomutov: "Chomutov",
  litvinov: "Litvínov",
  louny: "Louny",
  litomerice: "Litoměřice",
  // Liberecký kraj
  liberec: "Liberec",
  "jablonec-nad-nisou": "Jablonec nad Nisou",
  "ceska-lipa": "Česká Lípa",
  turnov: "Turnov",
  semily: "Semily",
  // Královéhradecký kraj
  "hradec-kralove": "Hradec Králové",
  trutnov: "Trutnov",
  nachod: "Náchod",
  jicin: "Jičín",
  "rychnov-nad-kneznou": "Rychnov nad Kněžnou",
  // Pardubický kraj
  pardubice: "Pardubice",
  chrudim: "Chrudim",
  svitavy: "Svitavy",
  "usti-nad-orlici": "Ústí nad Orlicí",
  // Kraj Vysočina
  jihlava: "Jihlava",
  trebic: "Třebíč",
  "zdar-nad-sazavou": "Žďár nad Sázavou",
  "havlickuv-brod": "Havlíčkův Brod",
  pelhrimov: "Pelhřimov",
  // Jihomoravský kraj
  brno: "Brno",
  znojmo: "Znojmo",
  hodonin: "Hodonín",
  breclav: "Břeclav",
  vyskov: "Vyškov",
  blansko: "Blansko",
  // Olomoucký kraj
  olomouc: "Olomouc",
  prostejov: "Prostějov",
  prerov: "Přerov",
  sumperk: "Šumperk",
  jesenik: "Jeseník",
  // Zlínský kraj
  zlin: "Zlín",
  kromeriz: "Kroměříž",
  vsetin: "Vsetín",
  "uherske-hradiste": "Uherské Hradiště",
  // Moravskoslezský kraj
  ostrava: "Ostrava",
  opava: "Opava",
  havirov: "Havířov",
  karvina: "Karviná",
  "frydek-mistek": "Frýdek-Místek",
  "novy-jicin": "Nový Jičín",
  bruntal: "Bruntál",
  trinec: "Třinec",
  orlova: "Orlová",
  bohumin: "Bohumín",
};

function firstOf(value: string[] | string | null | undefined): string {
  if (Array.isArray(value)) return value[0]?.trim() || "";
  return (value || "").trim();
}

export function fuelTypeLabelCs(value: string[] | string | null | undefined): string {
  const key = firstOf(value);
  if (!key) return "";
  return fuelTypeLabelsCs[key] || key;
}

export function transmissionLabelCs(value: string[] | string | null | undefined): string {
  const key = firstOf(value);
  if (!key) return "";
  return transmissionLabelsCs[key] || key;
}

export function regionLabelCs(value: string | null | undefined): string {
  const key = (value || "").trim();
  if (!key) return "";
  return regionLabelsCs[key] || key;
}
