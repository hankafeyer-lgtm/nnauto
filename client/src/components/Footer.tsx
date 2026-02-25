import { Link } from "wouter";
import { memo } from "react";
import { SiInstagram, SiTiktok, SiFacebook } from "react-icons/si";
import logoImage from "@assets/ADEE73F1-9859-4FA3-9185-00DC43A78326_1764497749332.png";

function Footer() {
  return (
    <footer className="border-t bg-muted/30 mt-12 sm:mt-16 lg:mt-24 pb-20 sm:pb-0">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <img
                src={logoImage}
                alt="NNAuto"
                className="w-14 h-14 sm:w-20 sm:h-20 object-contain"
              />
              <span className="text-xl sm:text-2xl font-semibold tracking-tight">
                <span className="text-[#B8860B]">NN</span>
                <span className="text-black dark:text-white">Auto.cz</span>
              </span>
            </div>
            <p className="text-sm text-primary leading-relaxed">
              Váš spolehlivý partner pro nákup a prodej automobilů v České
              republice.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-base sm:text-lg mb-4 sm:mb-6">
              Pro kupující
            </h3>
            <ul className="space-y-2 sm:space-y-3 text-sm">
              <li>
                <Link
                  href="/listings"
                  className="text-black dark:text-white hover:text-black/70 dark:hover:text-white/70 transition-colors"
                  data-testid="link-search"
                >
                  Hledat auto
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-base sm:text-lg mb-4 sm:mb-6">
              Pro prodejce
            </h3>
            <ul className="space-y-2 sm:space-y-3 text-sm">
              <li>
                <Link
                  href="/add-listing"
                  className="text-black dark:text-white hover:text-black/70 dark:hover:text-white/70 transition-colors"
                  data-testid="link-add-listing"
                >
                  Přidat inzerát
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-black dark:text-white hover:text-black/70 dark:hover:text-white/70 transition-colors"
                  data-testid="link-pricing"
                >
                  Ceník inzerátu
                </Link>
              </li>
              <li>
                <Link
                  href="/tips"
                  className="text-black dark:text-white hover:text-black/70 dark:hover:text-white/70 transition-colors"
                  data-testid="link-tips"
                >
                  Tipy pro prodej
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-base sm:text-lg mb-4 sm:mb-6">
              O nás
            </h3>
            <ul className="space-y-2 sm:space-y-3 text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-black dark:text-white hover:text-black/70 dark:hover:text-white/70 transition-colors"
                  data-testid="link-about"
                >
                  O společnosti
                </Link>
              </li>
              <li>
                <a
                  href="mailto:info@nnauto.cz"
                  className="text-black dark:text-white hover:text-black/70 dark:hover:text-white/70 transition-colors"
                  data-testid="link-contact"
                >
                  info@nnauto.cz
                </a>
              </li>
              <li>
                <Link
                  href="/"
                  className="text-black dark:text-white hover:text-black/70 dark:hover:text-white/70 transition-colors"
                  data-testid="link-privacy"
                >
                  IČ: 23974559
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-black dark:text-white hover:text-black/70 dark:hover:text-white/70 transition-colors"
                  data-testid="link-privacy"
                >
                  Ochrana osobních údajů
                </Link>
              </li>
            </ul>

            <h3 className="font-semibold text-base sm:text-lg mt-6 mb-4">
              Sledujte nás
            </h3>
            <div className="flex items-center gap-4">
              <a
                href="https://www.instagram.com/nnauto.cz?igsh=cDU0aTVsMTl2dnF5"
                target="_blank"
                rel="noopener noreferrer"
                className="text-black dark:text-white hover:text-[#E4405F] dark:hover:text-[#E4405F] transition-colors"
                data-testid="link-instagram"
                title="Instagram"
              >
                <SiInstagram className="w-6 h-6" />
              </a>
              <a
                href="https://www.tiktok.com/@nnauto.cz?_r=1&_t=ZN-92GyrkoUbSA"
                target="_blank"
                rel="noopener noreferrer"
                className="text-black dark:text-white hover:text-[#000000] dark:hover:text-[#69C9D0] transition-colors"
                data-testid="link-tiktok"
                title="TikTok"
              >
                <SiTiktok className="w-6 h-6" />
              </a>
              <a
                href="https://www.facebook.com/share/17ovF6KvxL/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-black dark:text-white hover:text-[#1877F2] dark:hover:text-[#1877F2] transition-colors"
                data-testid="link-facebook"
                title="Facebook"
              >
                <SiFacebook className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>

        {/* <div className="border-t mt-8 sm:mt-10 lg:mt-12 pt-8 sm:pt-10 lg:pt-12 text-center text-xs sm:text-sm text-muted-foreground space-y-2">
          <p>&copy; 2025 NNAuto. Všechna práva vyhrazena.</p>
          <p className="text-xs">
            Web Design by{" "}
            <a 
              href="https://pidhornyi.eu" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#B8860B] hover:underline"
              data-testid="link-developer"
            >
              pidhornyi.eu
            </a>
          </p>
        </div> */}
      </div>
    </footer>
  );
}

export default memo(Footer);
