import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Poker Academy - Celo Token Claim',
  description: 'Claim your daily Poker Academy tokens on Celo blockchain',
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