import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('Debug API called')
    
    // Check environment variables
    const merchantId = process.env.NEXT_PUBLIC_ZARINPAL_API_KEY
    const appUrl = process.env.NEXT_PUBLIC_APP_URL
    
    console.log('Environment check:', {
      merchantId: merchantId ? 'SET' : 'NOT SET',
      appUrl: appUrl || 'NOT SET'
    })
    
    return NextResponse.json({ 
      success: true,
      merchantId: merchantId ? 'SET' : 'NOT SET',
      appUrl: appUrl || 'NOT SET',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Debug API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Log arbitrary client diagnostics to server terminal
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { tag = 'client-log', message, context } = body || {}

    // Print a structured log so it is easy to spot in terminal
    console.error(`[${tag}]`, message ?? 'No message provided', context ?? {})

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Debug log POST error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Lightweight Supabase connectivity probe with timing
export async function PUT() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const details = {
      urlSet: !!supabaseUrl,
      keySet: !!supabaseAnonKey,
    }

    const start = Date.now()
    let status: 'ok' | 'error' = 'ok'
    let error: string | undefined

    if (!supabaseUrl || !supabaseAnonKey) {
      status = 'error'
      error = 'Supabase env not set'
    } else {
      try {
        const res = await fetch(`${supabaseUrl}/rest/v1/`, {
          method: 'GET',
          headers: { apikey: supabaseAnonKey },
        })
        if (!res.ok) {
          status = 'error'
          error = `HTTP ${res.status}`
        }
      } catch (e) {
        status = 'error'
        error = e instanceof Error ? e.message : 'Unknown fetch error'
      }
    }

    const durationMs = Date.now() - start
    console.log('[supabase-probe]', { status, durationMs, details, error })

    return NextResponse.json({ success: status === 'ok', durationMs, details, error })
  } catch (e) {
    console.error('Supabase probe error:', e)
    return NextResponse.json({ success: false, error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}
