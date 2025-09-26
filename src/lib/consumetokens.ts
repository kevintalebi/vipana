import { supabase } from './supabase'

export interface UsageRecord {
  user_id: string
  model: string
  price: number
  created_at?: string
}

export interface TokenConsumptionResult {
  success: boolean
  newTokenBalance?: number
  error?: string
  usageRecord?: UsageRecord
}

/**
 * Consumes tokens for image and video generation services
 * Records usage in the usage table and updates user's token balance
 */
export async function consumeTokens(
  userId: string,
  model: string,
  price: number
): Promise<TokenConsumptionResult> {
  try {
    console.log('🪙 Starting token consumption process:', { userId, model, price })

    // Validate input parameters
    if (!userId || !model || price <= 0) {
      return {
        success: false,
        error: 'Invalid parameters: userId, model, and price are required'
      }
    }

    // Check if usage table exists, if not, we'll handle the error gracefully
    console.log('🔍 Checking if usage table exists...')
    const { data: tableCheck, error: tableError } = await supabase
      .from('usage')
      .select('*')
      .limit(1)

    if (tableError) {
      console.error('❌ Usage table does not exist or is not accessible:', tableError)
      return {
        success: false,
        error: `Usage table not found: ${tableError.message}. Please create the usage table in your database.`
      }
    }

    console.log('✅ Usage table exists and is accessible')

    // Get current user token balance
    console.log('📊 Fetching current user token balance...')
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('tokens')
      .eq('user_id', userId)
      .single()

    if (userError) {
      console.error('❌ Error fetching user data:', userError)
      return {
        success: false,
        error: `Failed to fetch user data: ${userError.message}`
      }
    }

    if (!userData) {
      return {
        success: false,
        error: 'User not found'
      }
    }

    const currentTokens = Number(userData.tokens) || 0
    console.log('💰 Current token balance:', currentTokens)

    // Check if user has enough tokens
    if (currentTokens < price) {
      return {
        success: false,
        error: `Insufficient tokens. Required: ${price}, Available: ${currentTokens}`
      }
    }

    // Calculate new token balance
    const newTokenBalance = currentTokens - price
    console.log('🧮 New token balance will be:', newTokenBalance)

    // Start transaction-like operations
    console.log('📝 Recording usage in database...')
    
    // Record usage in usage table
    const { data: usageData, error: usageError } = await supabase
      .from('usage')
      .insert({
        user_id: userId,
        model: model,
        price: price
      })
      .select()
      .single()

    if (usageError) {
      console.error('❌ Error recording usage:', usageError)
      return {
        success: false,
        error: `Failed to record usage: ${usageError.message}`
      }
    }

    console.log('✅ Usage recorded successfully:', usageData)

    // Update user's token balance
    console.log('🔄 Updating user token balance...')
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        tokens: newTokenBalance
      })
      .eq('user_id', userId)

    if (updateError) {
      console.error('❌ Error updating user tokens:', updateError)
      
      // Try to rollback the usage record
      console.log('🔄 Attempting to rollback usage record...')
      await supabase
        .from('usage')
        .delete()
        .eq('id', usageData.id)
      
      return {
        success: false,
        error: `Failed to update user tokens: ${updateError.message}`
      }
    }

    console.log('✅ Token consumption completed successfully')
    console.log('📊 Final balance:', newTokenBalance)

    return {
      success: true,
      newTokenBalance: newTokenBalance,
      usageRecord: usageData
    }

  } catch (error) {
    console.error('❌ Unexpected error in consumeTokens:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Get user's current token balance
 */
export async function getUserTokenBalance(userId: string): Promise<{ success: boolean; tokens?: number; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('tokens')
      .eq('user_id', userId)
      .single()

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    return {
      success: true,
      tokens: Number(data.tokens) || 0
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Get user's usage history
 */
export async function getUserUsageHistory(
  userId: string, 
  limit: number = 50
): Promise<{ success: boolean; usage?: UsageRecord[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('usage')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    return {
      success: true,
      usage: data || []
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Check if user has enough tokens for a specific price
 */
export async function checkTokenAvailability(
  userId: string, 
  requiredPrice: number
): Promise<{ success: boolean; hasEnoughTokens: boolean; currentTokens?: number; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('tokens')
      .eq('user_id', userId)
      .single()

    if (error) {
      return {
        success: false,
        hasEnoughTokens: false,
        error: error.message
      }
    }

    const currentTokens = Number(data.tokens) || 0
    const hasEnoughTokens = currentTokens >= requiredPrice

    return {
      success: true,
      hasEnoughTokens,
      currentTokens
    }
  } catch (error) {
    return {
      success: false,
      hasEnoughTokens: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Create the usage table if it doesn't exist
 * This function should be called during app initialization
 */
export async function createUsageTableIfNotExists(): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('🔧 Checking if usage table needs to be created...')
    
    // Try to query the table
    const { data, error } = await supabase
      .from('usage')
      .select('*')
      .limit(1)

    if (error) {
      console.log('📋 Usage table does not exist, creating it...')
      
      // Note: In Supabase, you typically create tables through the SQL editor or dashboard
      // This is just a placeholder - the actual table creation should be done in Supabase dashboard
      console.log('⚠️ Please create the usage table manually in your Supabase dashboard with this SQL:')
      console.log(`
        CREATE TABLE usage (
          id SERIAL PRIMARY KEY,
          user_id TEXT NOT NULL,
          model TEXT NOT NULL,
          price INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `)
      
      return {
        success: false,
        error: 'Usage table does not exist. Please create it manually in Supabase dashboard.'
      }
    }

    console.log('✅ Usage table already exists')
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}
