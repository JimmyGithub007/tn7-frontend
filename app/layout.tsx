import type { Metadata } from "next";
//import { Archivo_Black, Audiowide, Inter, Lilita_One, Staatliches } from "next/font/google";

import { StoreProvider } from "@/store/StoreProvider";
//import { Dialog } from "@/components";

import { impact, opinionPro } from "@/components/Font";
import { MouseFollower } from "@/components";
import "./globals.css";

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
      <body className={impact.className} style={{ overflow: "hidden" }}>
        {children}
        {/*<Dialog />*/}
        {/*<MouseFollower />*/}
      </body>
    </html>
  </StoreProvider>);
}
