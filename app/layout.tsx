import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers'; // Create this component

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Rentfy - Real Estate Platform',
  description: 'Find your perfect property for rent or sale',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}