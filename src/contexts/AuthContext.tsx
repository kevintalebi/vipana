'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { upsertUserProfile, getUserProfile, UserProfile, cleanupDuplicateUsers, checkTableStructure } from '@/lib/user-utils'

interface AuthContextType {
  user: User | null
  session: Session | null
  userProfile: UserProfile | null
  loading: boolean
  error: string | null
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  clearError: () => void
  updateUserTokens: (newTokens: number) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Check table structure first
    checkTableStructure()
    
    // Clean up duplicates on app start (non-blocking)
    cleanupDuplicateUsers().catch(error => {
      console.error('Cleanup failed:', error)
    })

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      
      // Sync user profile if user exists
      if (session?.user) {
        await syncUserProfile(session.user)
      }
      
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 Auth state change:', event, session?.user?.id)
      
      setSession(session)
      setUser(session?.user ?? null)
      
      // Sync user profile on sign in
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('🚀 User signed in, syncing profile...')
        await syncUserProfile(session.user)
      } else if (event === 'SIGNED_OUT') {
        console.log('👋 User signed out')
        setUserProfile(null)
      }
      
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Function to sync user profile
  const syncUserProfile = async (user: User) => {
    try {
      console.log('🔄 Syncing user profile for:', user.id, user.email)
      
      // First try to get existing profile
      let profile = await getUserProfile(user.id)
      
      // If no profile exists, create one
      if (!profile) {
        console.log('➕ Creating new user profile...')
        profile = await upsertUserProfile(user)
        if (profile) {
          console.log('✅ Created profile:', profile)
        } else {
          console.warn('⚠️ Failed to create user profile, but continuing...')
          // Create a minimal profile object for the UI
          profile = {
            user_id: user.id,
            email: user.email || '',
            image_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.user_metadata?.display_name || '',
            tokens: 0
          }
        }
      } else {
        console.log('🔄 Updating existing profile...')
        profile = await upsertUserProfile(user)
        if (profile) {
          console.log('✅ Updated profile:', profile)
        } else {
          console.warn('⚠️ Failed to update user profile, using existing data')
        }
      }
      
      if (profile) {
        setUserProfile(profile)
      }
    } catch (error) {
      console.error('❌ Error syncing user profile:', error)
      // Create a minimal profile object even if sync fails
      const fallbackProfile = {
        user_id: user.id,
        email: user.email || '',
        image_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.user_metadata?.display_name || '',
        tokens: 0
      }
      setUserProfile(fallbackProfile)
    }
  }

  const signInWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null)
      setLoading(true)
      
      // Force production URL if we're not in development
      const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      const productionUrl = 'https://vipana.ir'
      
      const redirectUrl = isDevelopment 
        ? `${window.location.origin}/auth/callback`
        : `${process.env.NEXT_PUBLIC_SITE_URL || productionUrl}/auth/callback`
      
      console.log('=== OAuth Debug Info ===')
      console.log('Is development:', isDevelopment)
      console.log('Window hostname:', window.location.hostname)
      console.log('Window origin:', window.location.origin)
      console.log('Environment SITE_URL:', process.env.NEXT_PUBLIC_SITE_URL)
      console.log('Final redirect URL:', redirectUrl)
      console.log('========================')
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          skipBrowserRedirect: false,
        },
      })
      
      if (error) {
        console.error('OAuth error:', error)
        setError(error.message)
        setLoading(false)
        return { success: false, error: error.message }
      }
      
      // If we reach here, the OAuth flow should have started
      console.log('OAuth flow initiated successfully')
      return { success: true }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'خطایی در ورود رخ داد'
      setError(errorMessage)
      setLoading(false)
      console.error('Error signing in with Google:', error)
      return { success: false, error: errorMessage }
    }
  }

  const signOut = async () => {
    try {
      console.log('🚪 User signing out...')
      setError(null)
      setLoading(true)
      
      // Clear local state immediately
      setUser(null)
      setSession(null)
      setUserProfile(null)
      
      // Redirect immediately - don't wait for Supabase
      console.log('🔄 Redirecting to login page immediately...')
      router.push('/login')
      window.location.href = '/login'
      
      // Sign out from Supabase in background (non-blocking)
      supabase.auth.signOut().then(({ error }) => {
        if (error) {
          console.error('❌ Error signing out:', error)
        } else {
          console.log('✅ User signed out successfully')
        }
        setLoading(false)
      }).catch(error => {
        console.error('❌ Error in signOut:', error)
        setLoading(false)
      })
      
    } catch (error) {
      console.error('❌ Error in signOut:', error)
      setError('خطایی در خروج رخ داد')
      setLoading(false)
      
      // Force redirect even if there's an error
      console.log('🔄 Force redirect to login after error...')
      router.push('/login')
      window.location.href = '/login'
    }
  }

  const clearError = () => {
    setError(null)
  }

  const updateUserTokens = (newTokens: number) => {
    if (userProfile) {
      setUserProfile(prev => prev ? { ...prev, tokens: newTokens } : null)
      console.log('Updated user tokens in context:', newTokens)
    }
  }

  const value = {
    user,
    session,
    userProfile,
    loading,
    error,
    signInWithGoogle,
    signOut,
    clearError,
    updateUserTokens,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
