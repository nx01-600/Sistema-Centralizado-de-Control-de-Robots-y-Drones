import '@/styles/globals.css'
import { Inter } from 'next/font/google'
import { NotificationProvider } from '@/components/Notifications'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Sistema de Gestión de Robots y Drones',
  description: 'Sistema Centralizado de Gestión de Robots y Drones Universitarios',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <NotificationProvider>
          <div className="min-h-screen bg-gray-50">
            {children}
          </div>
        </NotificationProvider>
      </body>
    </html>
  )
}