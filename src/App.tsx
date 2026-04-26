'use client'

import { ThemeProvider } from 'next-themes'
import { LiquidSyntaxEditor } from './components/LiquidSyntaxEditor'
import { PwaInstallBanner } from './components/PwaInstallBanner'

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <LiquidSyntaxEditor />
      <PwaInstallBanner />
    </ThemeProvider>
  )
} 