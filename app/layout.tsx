import type { Metadata } from "next";
//import { Archivo_Black, Audiowide, Inter, Lilita_One, Staatliches } from "next/font/google";

import { StoreProvider } from "@/store/StoreProvider";
//import { Dialog } from "@/components";

import { impact, opinionPro } from "@/components/Font";
import { Dialog, MouseFollower } from "@/components";
import WalletProviders from "@/components/WalletProviders";
import { NotistackProvider } from '@/components/NotistackProvider';

import "./globals.css";
import Script from 'next/script'

//const archivo_black = Archivo_Black({ subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  title: "TN7",
  description: "TN7 UNIVERSE",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (<StoreProvider>
    <html lang="en" className={opinionPro.variable}>
    <head>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-G17004Z8T3"
          strategy="afterInteractive"
        />
        <Script
          id="ga-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-G17004Z8T3');
            `,
          }}
        />

        {/* Google Ads */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-16681839486"
          strategy="afterInteractive"
        />
        <Script
          id="ads-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'AW-16681839486');
            `,
          }}
        />

        {/* Optional: Conversion event snippet */}
        <Script
          id="conversion-snippet"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              gtag('event', 'conversion', {'send_to': 'AW-16681839486/rzxbCO7D-dEZEP7WwpI-'});
            `,
          }}
        />
      </head>
      <body className={impact.className} style={{ overflow: "hidden" }}>
        <NotistackProvider>
          <WalletProviders>
            {children}
          </WalletProviders>
        </NotistackProvider>
        <Dialog />
        {/*<MouseFollower />*/}
      </body>
    </html>
  </StoreProvider>);
}
