import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { JapaneseDecorations } from '@/components/japanese-decorations'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ComideX - Sistema de Gestão",
  description: "Sistema completo de gestão para restaurante japonês com rodízio e à la carte",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className="dark">
      <body className={inter.className}>
        <ThemeProvider>
          <JapaneseDecorations />
          {children}
          <Toaster 
            richColors 
            position="top-right"
            theme="dark"
          />
        </ThemeProvider>
      </body>
    </html>
  )
}