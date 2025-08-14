import './globals.css'
import type { ReactNode } from 'react'
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang='pt-BR'>
      <body><main className='min-h-screen p-6'>{children}</main></body>
    </html>
  )
}
