import { Header } from '@/layouts/header';
import QueryProvider from '@/lib/react-query';
import ContextProvider from '@/lib/wagmi/provider';
import type { Metadata } from 'next';
import { Bebas_Neue } from 'next/font/google';
import { headers } from 'next/headers';
import './globals.css';

const poppins = Bebas_Neue({
  variable: '--font-beba',
  subsets: ['latin'],
  weight: '400',
});

export const metadata: Metadata = {
  title: 'Nad.fun',
  description: 'Nad.fun',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookies = (await headers()).get('cookie');
  return (
    <html lang="en-US">
      <body className={`${poppins} bg-[#0b0b0b]`}>
        <ContextProvider cookies={cookies}>
          <QueryProvider>
            <Header />
            {children}
          </QueryProvider>
        </ContextProvider>
      </body>
    </html>
  );
}
