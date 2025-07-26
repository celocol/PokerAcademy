import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Dispensador CCOP - Poker Academy',
  description: 'Reclama tus tokens CCOP diarios en la blockchain de Celo',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  themeColor: '#35D07F',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Dispensador CCOP'
  },
  formatDetection: {
    telephone: false
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.className} bg-gradient-to-br from-celo-dark via-gray-900 to-black min-h-screen`}>
        {children}
      </body>
    </html>
  )
} 