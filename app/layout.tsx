import type { Metadata } from 'next'
import '@/styles/globals.css'
import '@/styles/markdown.css'
import AppContextProvider from '@/components/AppContext'
import EventBusContextProvider from '@/components/EventBusContext'
import {
  ClerkProvider,
} from '@clerk/nextjs'


export const metadata: Metadata = {
  title: 'Free Chat AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <AppContextProvider>
            <EventBusContextProvider>
              {children}
            </EventBusContextProvider>
          </AppContextProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
