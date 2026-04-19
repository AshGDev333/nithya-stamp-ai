import type { Metadata, Viewport } from 'next'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'Nithya Stamp AI — AI-Powered Custom Stamp Designer India',
  description: 'Create professional custom rubber stamps with AI. Address stamps, round seals, logo stamps — designed in seconds, delivered in 3–5 days across India.',
  keywords: 'custom stamp india, rubber stamp, AI stamp design, order stamp online, address stamp',
  openGraph: {
    title: 'Nithya Stamp AI — Custom Stamps Designed by AI',
    description: 'Professional rubber stamps for Indian businesses. AI generates 3 designs instantly.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <Toaster
          richColors
          position="top-center"
          toastOptions={{
            style: { borderRadius: '14px', fontSize: '0.875rem' },
          }}
        />
      </body>
    </html>
  )
}
