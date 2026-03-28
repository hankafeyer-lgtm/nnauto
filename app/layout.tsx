import type { Metadata } from "next";
import "./globals.css";
import "../client/src/index.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "NNAuto - Prémiový Marketplace Aut v ČR | Prodej a Nákup Vozidel",
  description:
    "NNAuto je prémiový marketplace pro prodej a nákup nových i ojetých vozidel v České republice.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="cs-CZ" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
