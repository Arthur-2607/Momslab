import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/toaster"
import { BranchThemeProvider } from "@/lib/branch-theme-context"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "공동구매 플랫폼 - Momslab",
  description: "지점별 공동구매를 운영하는 멀티테넌트 웹 플랫폼",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body className={`font-sans antialiased`}>
        <BranchThemeProvider>
          {children}
          <Toaster />
          <Analytics />
        </BranchThemeProvider>
      </body>
    </html>
  )
}
