'use client'

import { useEffect, useState } from 'react'
import Head from 'next/head'
import '../styles/globals.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useRouter } from 'next/router'
import { AuthProvider } from '../contexts/AuthContext'
import { Navbar } from '../components/layout/Navbar'
import { Footer } from '../components/layout/Footer'

function ErrorBoundary({ children }) {
  useEffect(() => {
    const handleError = (error) => {
      console.error('Global error:', error)
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleError)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleError)
    }
  }, [])

  return children
}

export default function App({ Component, pageProps }) {
  const router = useRouter()
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
            staleTime: 30000,
          },
        },
      })
  )

  const isAuthPage = router.pathname.startsWith('/auth')

  return (
    <ErrorBoundary>
      <Head>
        <title>Football Betting API</title>
        <meta name="description" content="Next.js Football Betting API Backend" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {!isAuthPage && <Navbar />}
          <Component {...pageProps} />
          {!isAuthPage && <Footer />}
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
