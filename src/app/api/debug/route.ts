import { NextResponse } from 'next/server'

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
