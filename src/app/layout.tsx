import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Compromiso Legal | Dashboard de Reportes',
  description: 'Dashboard mensual de métricas de ventas, tráfico y redes sociales',
  icons: {
    icon: '/logo-mono.png',
    apple: '/logo-mono.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-brand-cream text-brand-ink antialiased">{children}</body>
    </html>
  )
}
