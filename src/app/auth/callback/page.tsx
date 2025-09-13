'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check for error parameters in URL
        const error = searchParams.get('error')
        // const errorCode = searchParams.get('error_code')
        const errorDescription = searchParams.get('error_description')

        if (error) {
          // Authentication failed, redirect to login with error
          const errorMessage = errorDescription 
            ? decodeURIComponent(errorDescription.replace(/\+/g, ' '))
            : 'خطایی در ورود رخ داد'
          
          router.push(`/login?error=${encodeURIComponent(errorMessage)}`)
          return
        }

        // Handle the OAuth callback
        const { data, error: authError } = await supabase.auth.getSession()
        
        if (authError) {
          console.error('Auth callback error:', authError)
          router.push(`/login?error=${encodeURIComponent('خطایی در ورود رخ داد')}`)
          return
        }

        if (data.session) {
          // Authentication successful, redirect to chat
          router.push('/chat')
        } else {
          // No session found, redirect to login
          router.push('/login?error=' + encodeURIComponent('ورود ناموفق بود'))
        }
      } catch (error) {
        console.error('Callback error:', error)
        router.push(`/login?error=${encodeURIComponent('خطایی در ورود رخ داد')}`)
      }
    }

    handleAuthCallback()
  }, [router, searchParams])

  // Show loading while processing
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">در حال پردازش ورود...</p>
      </div>
    </div>
  )
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">در حال بارگذاری...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}
