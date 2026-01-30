import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Compromiso Legal - Dashboard de Reportes',
  description: 'Dashboard mensual de métricas de ventas, tráfico y redes sociales',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="bg-gray-50">{children}</body>
    </html>
  )
}
