import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  locale?: string;
  noindex?: boolean;
  structuredData?: object;
  alternateLanguages?: { lang: string; url: string }[];
}

const baseUrl = 'https://nnauto.cz';
const defaultImage = `${baseUrl}/og-image.jpg`;
const siteName = 'NNAuto';

export function SEO({
  title,
  description = 'NNAuto je prémiový marketplace pro nákup a prodej automobilů, motocyklů a nákladních vozidel v České republice. Tisíce ověřených inzerátů, pokročilé filtry, snadné vyhledávání.',
  keywords = 'prodej aut, nákup aut, bazar aut, ojetá auta, nová auta, automobily, motocykly, nákladní vozy, autobazar, Česká republika, NNAuto, autobazar online, prodej vozidel, auto inzeráty, výkup aut',
  image = defaultImage,
  url = baseUrl,
  type = 'website',
  locale = 'cs_CZ',
  noindex = false,
  structuredData,
  alternateLanguages,
}: SEOProps) {
  const fullTitle = title 
    ? `${title} | ${siteName}` 
    : `${siteName} - Prémiový Marketplace Aut v České Republice`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Author and Publisher */}
      <meta name="author" content="NNAuto" />
      <meta name="publisher" content="NNAuto s.r.o." />
      
      {/* Geo Tags for Czech Republic */}
      <meta name="geo.region" content="CZ" />
      <meta name="geo.placename" content="Česká republika" />
      <meta name="geo.position" content="49.8175;15.4730" />
      <meta name="ICBM" content="49.8175, 15.4730" />
      
      {/* Language and Content */}
      <meta httpEquiv="content-language" content={locale.replace('_', '-')} />
      <meta name="language" content={locale.split('_')[0]} />
      
      {/* Robots */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}
      <meta name="googlebot" content="index, follow, max-image-preview:large" />
      <meta name="bingbot" content="index, follow" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
      
      {/* Alternate Language URLs (hreflang) */}
      {alternateLanguages?.map(({ lang, url: altUrl }) => (
        <link key={lang} rel="alternate" hrefLang={lang} href={altUrl} />
      ))}
      <link rel="alternate" hrefLang="x-default" href={baseUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title || 'NNAuto - Prodej a nákup automobilů'} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={locale} />
      <meta property="og:locale:alternate" content="cs_CZ" />
      <meta property="og:locale:alternate" content="uk_UA" />
      <meta property="og:locale:alternate" content="en_US" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content={title || 'NNAuto - Prodej a nákup automobilů'} />
      
      {/* Mobile App Meta */}
      <meta name="apple-mobile-web-app-title" content={siteName} />
      <meta name="application-name" content={siteName} />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}

// Generate comprehensive Vehicle structured data for listings
export function generateVehicleSchema(listing: {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuelType?: string[];
  transmission?: string[];
  color?: string;
  bodyType?: string;
  engineVolume?: string;
  power?: number;
  vin?: string;
  photos?: string[];
  description?: string;
  condition?: string;
  sellerType?: string;
  doors?: number;
  seats?: number;
  driveType?: string[];
  region?: string;
}) {
  const baseUrl = 'https://nnauto.cz';
  
  const fuelTypeMap: Record<string, string> = {
    'benzin': 'Gasoline',
    'diesel': 'Diesel',
    'hybrid': 'HybridElectric',
    'elektro': 'Electric',
    'lpg': 'NaturalGas',
    'cng': 'NaturalGas',
  };
  
  const transmissionMap: Record<string, string> = {
    'manual': 'ManualTransmission',
    'automat': 'AutomaticTransmission',
    'dsg': 'AutomaticTransmission',
    'cvt': 'AutomaticTransmission',
  };
  
  const bodyTypeMap: Record<string, string> = {
    'sedan': 'Sedan',
    'hatchback': 'Hatchback',
    'kombi': 'StationWagon',
    'suv': 'SUV',
    'crossover': 'Crossover',
    'coupe': 'Coupe',
    'cabrio': 'Convertible',
    'liftback': 'Hatchback',
    'pickup': 'Pickup',
    'minivan': 'Minivan',
    'van': 'Van',
  };
  
  const driveTypeMap: Record<string, string> = {
    'fwd': 'FrontWheelDriveConfiguration',
    'rwd': 'RearWheelDriveConfiguration',
    'awd': 'AllWheelDriveConfiguration',
    '4x4': 'FourWheelDriveConfiguration',
  };

  const conditionUrl = listing.condition === 'new' 
    ? 'https://schema.org/NewCondition' 
    : 'https://schema.org/UsedCondition';

  const images = listing.photos && listing.photos.length > 0 
    ? listing.photos.map(p => `${baseUrl}/objects/${p.replace(/^\/+/, '')}`)
    : [`${baseUrl}/og-image.jpg`];

  return {
    "@context": "https://schema.org",
    "@type": "Car",
    "@id": `${baseUrl}/listing/${listing.id}#vehicle`,
    "name": `${listing.year} ${listing.brand} ${listing.model}`,
    "brand": {
      "@type": "Brand",
      "name": listing.brand
    },
    "manufacturer": {
      "@type": "Organization",
      "name": listing.brand
    },
    "model": listing.model,
    "modelDate": listing.year.toString(),
    "productionDate": listing.year.toString(),
    "vehicleIdentificationNumber": listing.vin || undefined,
    "mileageFromOdometer": {
      "@type": "QuantitativeValue",
      "value": listing.mileage,
      "unitCode": "KMT",
      "unitText": "km"
    },
    "fuelType": listing.fuelType?.[0] ? fuelTypeMap[listing.fuelType[0]] || listing.fuelType[0] : undefined,
    "vehicleTransmission": listing.transmission?.[0] ? transmissionMap[listing.transmission[0]] || listing.transmission[0] : undefined,
    "driveWheelConfiguration": listing.driveType?.[0] ? driveTypeMap[listing.driveType[0]] || listing.driveType[0] : undefined,
    "color": listing.color || undefined,
    "bodyType": listing.bodyType ? bodyTypeMap[listing.bodyType] || listing.bodyType : undefined,
    "numberOfDoors": listing.doors || undefined,
    "vehicleSeatingCapacity": listing.seats || undefined,
    "vehicleEngine": listing.engineVolume || listing.power ? {
      "@type": "EngineSpecification",
      ...(listing.engineVolume && {
        "engineDisplacement": {
          "@type": "QuantitativeValue",
          "value": parseFloat(listing.engineVolume),
          "unitCode": "LTR",
          "unitText": "L"
        }
      }),
      ...(listing.power && {
        "enginePower": {
          "@type": "QuantitativeValue",
          "value": listing.power,
          "unitCode": "KWT",
          "unitText": "kW"
        }
      })
    } : undefined,
    "description": listing.description || `Prodej ${listing.year} ${listing.brand} ${listing.model}. Najeto ${listing.mileage.toLocaleString('cs-CZ')} km. ${listing.fuelType?.[0] || ''} ${listing.transmission?.[0] || ''}. Cena ${listing.price.toLocaleString('cs-CZ')} Kč.`,
    "image": images,
    "url": `${baseUrl}/listing/${listing.id}`,
    "offers": {
      "@type": "Offer",
      "@id": `${baseUrl}/listing/${listing.id}#offer`,
      "url": `${baseUrl}/listing/${listing.id}`,
      "price": listing.price,
      "priceCurrency": "CZK",
      "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      "availability": "https://schema.org/InStock",
      "itemCondition": conditionUrl,
      "seller": {
        "@type": listing.sellerType === 'dealer' ? "AutoDealer" : "Person",
        "name": listing.sellerType === 'dealer' ? "Autobazar" : "Soukromý prodejce",
        "areaServed": {
          "@type": "Country",
          "name": "Česká republika"
        }
      },
      "offeredBy": {
        "@type": "Organization",
        "name": "NNAuto",
        "url": baseUrl
      }
    },
    "additionalProperty": [
      ...(listing.region ? [{
        "@type": "PropertyValue",
        "name": "Lokalita",
        "value": listing.region
      }] : []),
      ...(listing.condition ? [{
        "@type": "PropertyValue",
        "name": "Stav",
        "value": listing.condition === 'new' ? 'Nové' : 'Ojeté'
      }] : [])
    ]
  };
}

// Generate BreadcrumbList for navigation
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
}

// Generate ItemList for listings page
export function generateListingsSchema(listings: Array<{
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  photos?: string[];
}>) {
  const baseUrl = 'https://nnauto.cz';
  
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Inzeráty vozidel na NNAuto",
    "description": "Aktuální nabídka automobilů, motocyklů a nákladních vozidel k prodeji",
    "numberOfItems": listings.length,
    "itemListElement": listings.slice(0, 20).map((listing, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `${baseUrl}/listing/${listing.id}`,
      "name": `${listing.year} ${listing.brand} ${listing.model}`,
      "item": {
        "@type": "Car",
        "name": `${listing.year} ${listing.brand} ${listing.model}`,
        "brand": listing.brand,
        "model": listing.model,
        "modelDate": listing.year.toString(),
        "image": listing.photos?.[0] ? `${baseUrl}/objects/${listing.photos[0].replace(/^\/+/, '')}` : undefined,
        "offers": {
          "@type": "Offer",
          "price": listing.price,
          "priceCurrency": "CZK"
        }
      }
    }))
  };
}

// Generate Organization schema for the website
export function generateOrganizationSchema() {
  const baseUrl = 'https://nnauto.cz';
  
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${baseUrl}/#organization`,
    "name": "NNAuto",
    "alternateName": "NNAuto.cz",
    "url": baseUrl,
    "logo": {
      "@type": "ImageObject",
      "url": `${baseUrl}/favicon.svg`,
      "width": 512,
      "height": 512
    },
    "description": "Prémiový online marketplace pro prodej a nákup automobilů, motocyklů a nákladních vozidel v České republice.",
    "email": "info@nnauto.cz",
    "areaServed": {
      "@type": "Country",
      "name": "Česká republika"
    },
    "sameAs": []
  };
}

// Generate WebSite schema with search action
export function generateWebsiteSchema() {
  const baseUrl = 'https://nnauto.cz';
  
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${baseUrl}/#website`,
    "name": "NNAuto",
    "alternateName": "NNAuto.cz - Prodej a nákup aut",
    "url": baseUrl,
    "description": "Prémiový marketplace pro prodej a nákup automobilů v České republice",
    "publisher": {
      "@id": `${baseUrl}/#organization`
    },
    "inLanguage": ["cs-CZ", "uk-UA", "en-US"],
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}/listings?brand={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };
}

// Generate FAQ schema
export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

// Generate keywords based on listing attributes
export function generateListingKeywords(listing: {
  brand: string;
  model: string;
  year: number;
  bodyType?: string;
  fuelType?: string[];
  region?: string;
  condition?: string;
}): string {
  const keywords: string[] = [
    listing.brand,
    listing.model,
    `${listing.brand} ${listing.model}`,
    `${listing.year} ${listing.brand}`,
    `${listing.year} ${listing.brand} ${listing.model}`,
    `prodej ${listing.brand}`,
    `koupit ${listing.brand} ${listing.model}`,
    `${listing.brand} bazar`,
    `${listing.brand} ojetý`,
    'auto bazar',
    'prodej auta',
    'NNAuto',
  ];
  
  if (listing.bodyType) {
    keywords.push(listing.bodyType);
    keywords.push(`${listing.brand} ${listing.bodyType}`);
  }
  
  if (listing.fuelType?.[0]) {
    keywords.push(listing.fuelType[0]);
    keywords.push(`${listing.brand} ${listing.fuelType[0]}`);
  }
  
  if (listing.region) {
    keywords.push(listing.region);
    keywords.push(`auto ${listing.region}`);
    keywords.push(`${listing.brand} ${listing.region}`);
  }
  
  if (listing.condition === 'new') {
    keywords.push('nové auto');
    keywords.push(`nový ${listing.brand}`);
  } else {
    keywords.push('ojeté auto');
    keywords.push(`ojetý ${listing.brand}`);
  }
  
  return keywords.join(', ');
}

export default SEO;
