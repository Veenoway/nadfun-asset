import { Header } from "@/layouts/header";
import ContextProvider from "@/lib/wagmi/provider";
import type { Metadata } from "next";
import { Bebas_Neue } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const poppins = Bebas_Neue({
  variable: "--font-beba",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Tentacle Of Beholdak | Mint",
  description: "Mint your Tentacle Of Beholdak NFTs on Monad testnet.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookies = (await headers()).get("cookie");
  return (
    <html lang="en-US">
      <body className={`${poppins} `}>
        {/* <Analytics /> */}
        <ContextProvider cookies={cookies}>
          <Header />
          {children}
        </ContextProvider>
      </body>
    </html>
  );
}
