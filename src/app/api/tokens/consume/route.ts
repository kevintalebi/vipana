import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { userId, model, price } = await request.json()

    if (!userId || !model || typeof price !== 'number' || price <= 0) {
      return NextResponse.json({ success: false, error: 'Invalid parameters' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    console.log('[api/tokens/consume] Environment check:', {
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!serviceKey,
      hasAnonKey: !!anonKey
    })

    if (!supabaseUrl) {
      return NextResponse.json({ success: false, error: 'NEXT_PUBLIC_SUPABASE_URL not set' }, { status: 500 })
    }

    if (!serviceKey && !anonKey) {
      return NextResponse.json({ success: false, error: 'No Supabase keys available (need SERVICE_ROLE_KEY or ANON_KEY)' }, { status: 500 })
    }

    // Use service key if available, otherwise fall back to anon key
    const supabase = createClient(supabaseUrl, serviceKey || anonKey!)
    
    console.log('[api/tokens/consume] Using key type:', serviceKey ? 'SERVICE_ROLE' : 'ANON')

    // Helper: attempt RPC once with 30s timeout
    const tryRpcOnce = async () => {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 30000)
      try {
        const { data, error } = await supabase.rpc('consume_tokens', {
          p_user_id: userId,
          p_model: model,
          p_price: price,
        }, { signal: controller.signal as unknown as undefined })
        clearTimeout(timeout)
        return { data, error }
      } catch (e) {
        clearTimeout(timeout)
        throw e
      }
    }

    // 1) Try RPC first (preferred, atomic)
    try {
      const { data, error } = await tryRpcOnce()
      if (!error) {
        const newBalance = Array.isArray(data) && data[0]?.new_balance != null
          ? Number(data[0].new_balance)
          : (typeof (data as any)?.new_balance === 'number' ? (data as any).new_balance : undefined)
        if (typeof newBalance !== 'number') {
          return NextResponse.json({ success: false, error: 'Malformed RPC response' }, { status: 500 })
        }
        return NextResponse.json({ success: true, newBalance })
      }
      console.error('[api/tokens/consume] RPC error, will fallback:', error)
    } catch (e) {
      console.error('[api/tokens/consume] RPC call threw, will fallback:', e)
    }

    // 2) Fallback: server-side two-step with safeguards and compensation
    const maxAttempts = 3
    let attempt = 0
    let lastError: unknown = null

    while (attempt < maxAttempts) {
      attempt++
      const startedAt = Date.now()
      try {
        // read current tokens
        console.log(`[api/tokens/consume] Looking up user: ${userId}`)
        const { data: userRow, error: selErr } = await supabase
          .from('users')
          .select('tokens')
          .eq('user_id', userId)
          .maybeSingle()

        console.log(`[api/tokens/consume] User lookup result:`, { userRow, error: selErr })

        if (selErr) {
          console.error('[api/tokens/consume] User select error:', selErr)
          throw selErr
        }
        
        if (!userRow) {
          console.error(`[api/tokens/consume] User ${userId} not found in database`)
          throw new Error('User not found in database')
        }
        
        const currentTokens = userRow.tokens as number
        if (currentTokens < price) {
          return NextResponse.json({ success: false, error: 'Insufficient tokens' }, { status: 400 })
        }

        // optimistic update with guard tokens >= price
        console.log(`[api/tokens/consume] Updating tokens from ${currentTokens} to ${currentTokens - price}`)
        const { data: updated, error: updErr } = await supabase
          .from('users')
          .update({ tokens: currentTokens - price })
          .eq('user_id', userId)
          .eq('tokens', currentTokens)  // Ensure we're updating the exact current value
          .select('tokens')

        console.log(`[api/tokens/consume] Update result:`, { updated, error: updErr })

        if (updErr) {
          console.error('[api/tokens/consume] Update error:', updErr)
          throw updErr
        }
        
        if (!updated || updated.length === 0) {
          throw new Error('Update failed - no rows affected (insufficient tokens or user not found)')
        }

        // insert usage
        const { error: insErr } = await supabase
          .from('usage')
          .insert({ user_id: userId, model, price })

        if (insErr) {
          // compensate: revert tokens
          console.log(`[api/tokens/consume] Compensating: reverting tokens to ${updated[0].tokens + price}`)
          await supabase
            .from('users')
            .update({ tokens: updated[0].tokens + price })
            .eq('user_id', userId)
          throw insErr
        }

        console.log(`[api/tokens/consume] fallback attempt ${attempt} succeeded in ${Date.now() - startedAt}ms`)
        return NextResponse.json({ success: true, newBalance: Number(updated[0].tokens) })
      } catch (e) {
        lastError = e
        console.error(`[api/tokens/consume] fallback attempt ${attempt} failed in ${Date.now() - startedAt}ms:`, e)
        if (attempt < maxAttempts) {
          const base = Math.pow(2, attempt - 1) * 1000
          const jitter = base * (0.6 + Math.random() * 0.8)
          await new Promise(r => setTimeout(r, jitter))
        }
      }
    }

    return NextResponse.json({ success: false, error: lastError instanceof Error ? lastError.message : 'Unknown error' }, { status: 500 })
  } catch (error) {
    console.error('[api/tokens/consume] request error:', error)
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}


