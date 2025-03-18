'use client'

import { ThemeProvider } from 'next-themes'
import { LiquidSyntaxEditor } from './components/LiquidSyntaxEditor'

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <LiquidSyntaxEditor />
    </ThemeProvider>
  )
} 