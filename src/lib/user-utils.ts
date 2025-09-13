import { supabase } from './supabase'
import { User } from '@supabase/supabase-js'

export interface UserProfile {
  user_id: string
  email: string
  image_url: string
  full_name: string
  tokens: number
}

export async function upsertUserProfile(user: User): Promise<UserProfile | null> {
  try {
    console.log('🔍 User data from auth:', {
      id: user.id,
      email: user.email,
      metadata: user.user_metadata
    })

    // Extract user data from auth user
    const email = user.email || ''
    const imageUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || ''
    const fullName = user.user_metadata?.full_name || 
                    user.user_metadata?.name || 
                    user.user_metadata?.display_name || 
                    ''

    console.log('📝 Extracted data:', { email, imageUrl, fullName })

    // First, check if user exists by user_id
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (existingUser) {
      // User exists, update their data
      console.log('🔄 User exists, updating...')
      const { data, error } = await supabase
        .from('users')
        .update({
          email,
          image_url: imageUrl,
          full_name: fullName
        })
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        console.error('❌ Error updating user profile:', {
          error,
          errorCode: error.code,
          errorMessage: error.message,
          errorDetails: error.details
        })
        return null
      }

      console.log('✅ Successfully updated user profile:', data)
      return data
    } else {
      // User doesn't exist, check if email already exists
      const { data: emailExists } = await supabase
        .from('users')
        .select('user_id')
        .eq('email', email)
        .single()

      if (emailExists) {
        // Email exists but with different user_id, update that record
        console.log('🔄 Email exists with different user_id, updating...')
        const { data, error } = await supabase
          .from('users')
          .update({
            user_id: user.id,
            image_url: imageUrl,
            full_name: fullName
          })
          .eq('email', email)
          .select()
          .single()

        if (error) {
          console.error('❌ Error updating existing email record:', {
            error,
            errorCode: error.code,
            errorMessage: error.message,
            errorDetails: error.details
          })
          return null
        }

        console.log('✅ Successfully updated existing email record:', data)
        return data
      } else {
        // New user, insert new record
        console.log('➕ Creating new user...')
        const userData = {
          user_id: user.id,
          email,
          image_url: imageUrl,
          full_name: fullName
        }

        console.log('🔍 About to insert user data:', JSON.stringify(userData, null, 2))
        
        const { data, error } = await supabase
          .from('users')
          .insert(userData)
          .select()
          .single()

        console.log('🔍 Insert result - data:', data)
        console.log('🔍 Insert result - error:', error)
        console.log('🔍 Error type:', typeof error)
        console.log('🔍 Error is null:', error === null)
        console.log('🔍 Error is undefined:', error === undefined)

        if (error) {
          console.error('❌ Error inserting user profile:')
          console.error('Error object:', error)
          console.error('Error stringified:', JSON.stringify(error, null, 2))
          console.error('User data:', JSON.stringify(userData, null, 2))
          console.error('Error code:', error.code)
          console.error('Error message:', error.message)
          console.error('Error details:', error.details)
          console.error('Error hint:', error.hint)
          
          // Show alert for immediate debugging
          alert(`Database Insert Error:\nCode: ${error.code || 'No code'}\nMessage: ${error.message || 'No message'}\nDetails: ${error.details || 'No details'}`)
          
          return null
        }

        console.log('✅ Successfully created new user profile:', data)
        return data
      }
    }
  } catch (error) {
    console.error('❌ Error in upsertUserProfile:', error)
    return null
  }
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      // If it's a "not found" error (PGRST116), that's expected for new users
      if (error.code === 'PGRST116') {
        console.log('📋 No existing profile found for user:', userId)
        return null
      }
      console.error('❌ Error fetching user profile:', error)
      return null
    }

    console.log('📋 Found existing profile:', data)
    return data
  } catch (error) {
    console.error('❌ Error in getUserProfile:', error)
    return null
  }
}

export async function updateUserTokens(userId: string, tokens: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('users')
      .update({ 
        tokens
      })
      .eq('user_id', userId)

    if (error) {
      console.error('Error updating user tokens:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in updateUserTokens:', error)
    return false
  }
}


export async function checkTableStructure(): Promise<void> {
  try {
    console.log('🔍 Checking users table structure...')
    
    // Try to get table info by selecting with limit 0
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(0)
    
    console.log('🔍 Table structure check result:')
    console.log('Data:', data)
    console.log('Error:', error)
    
    if (error) {
      console.error('❌ Table structure check failed:')
      console.error('Error code:', error.code)
      console.error('Error message:', error.message)
      console.error('Error details:', error.details)
      console.error('Error hint:', error.hint)
      
      alert(`Table Structure Error:\nCode: ${error.code || 'No code'}\nMessage: ${error.message || 'No message'}\nDetails: ${error.details || 'No details'}`)
    } else {
      console.log('✅ Table structure check passed')
    }
  } catch (error) {
    console.error('❌ Table structure check error:', error)
  }
}

export async function cleanupDuplicateUsers(): Promise<boolean> {
  try {
    console.log('🧹 Cleaning up duplicate users...')
    
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise<boolean>((_, reject) => {
      setTimeout(() => reject(new Error('Cleanup timeout')), 10000) // 10 second timeout
    })

    const cleanupPromise = async (): Promise<boolean> => {
      // Get all users grouped by email
      const { data: users, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .order('user_id')

      if (fetchError) {
        console.error('❌ Error fetching users:', fetchError)
        return false
      }

      if (!users || users.length === 0) {
        console.log('✅ No users to clean up')
        return true
      }

      // Group by email and find duplicates
      const emailGroups = users.reduce((acc: { [email: string]: any[] }, user) => {
        if (!acc[user.email]) {
          acc[user.email] = []
        }
        acc[user.email].push(user)
        return acc
      }, {})

      let duplicatesFound = 0

      // Remove duplicates, keeping the first one for each email
      for (const [email, userList] of Object.entries(emailGroups)) {
        if (userList.length > 1) {
          console.log(`🔄 Found ${userList.length} duplicates for email: ${email}`)
          duplicatesFound += userList.length - 1
          
          // Keep the first user, delete the rest
          const usersToDelete = userList.slice(1)
          
          for (const userToDelete of usersToDelete) {
            const { error: deleteError } = await supabase
              .from('users')
              .delete()
              .eq('user_id', userToDelete.user_id)
            
            if (deleteError) {
              console.error(`❌ Error deleting duplicate user ${userToDelete.user_id}:`, deleteError)
            } else {
              console.log(`✅ Deleted duplicate user: ${userToDelete.user_id}`)
            }
          }
        }
      }

      if (duplicatesFound === 0) {
        console.log('✅ No duplicates found')
      } else {
        console.log(`✅ Duplicate cleanup completed - removed ${duplicatesFound} duplicates`)
      }
      return true
    }

    return await Promise.race([cleanupPromise(), timeoutPromise])
  } catch (error) {
    console.error('❌ Error in cleanupDuplicateUsers:', error)
    return false
  }
}
