import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Rentfy - Real Estate Platform',
  description: 'Find your dream property with our real estate platform',
}

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={inter.className}>
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  )
}