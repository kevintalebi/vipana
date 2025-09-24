import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({} as Record<string, unknown>))
    const { amount, callback_url, description, email, mobile } = body || {}

    if (!amount || amount <= 0) {
      return NextResponse.json({ success: false, error: 'Invalid amount' }, { status: 400 })
    }

    const merchantId = process.env.NEXT_PUBLIC_ZARINPAL_API_KEY
    if (!merchantId) {
      return NextResponse.json({ success: false, error: 'Zarinpal API key is missing' }, { status: 500 })
    }

    const cbUrl = callback_url || `${process.env.NEXT_PUBLIC_APP_URL || ''}/payment/callback`
    const desc = description || 'شارژ حساب'

    const payload = {
      merchant_id: merchantId,
      amount: Number(amount),
      callback_url: cbUrl,
      description: desc,
      metadata: {
        email: email || undefined,
        mobile: mobile || undefined,
      },
    }

    const zarinpalRes = await fetch('https://api.zarinpal.com/pg/v4/payment/request.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      // Zarinpal expects JSON body; no auth header required, merchant id is in body
    })

    const json = await zarinpalRes.json().catch(() => ({} as Record<string, unknown>))

    // Expected shape: { data: { code: 100, authority: '...', fee_type: '...' }, errors: [] }
    const data = json?.data
    if (zarinpalRes.ok && data?.code === 100 && data?.authority) {
      const authority: string = data.authority
      const gatewayUrl = `https://www.zarinpal.com/pg/StartPay/${authority}`
      return NextResponse.json({ success: true, authority, url: gatewayUrl })
    }

    // If sandbox or other variations
    if (zarinpalRes.ok && data?.authority) {
      const authority: string = data.authority
      const gatewayUrl = `https://www.zarinpal.com/pg/StartPay/${authority}`
      return NextResponse.json({ success: true, authority, url: gatewayUrl })
    }

    return NextResponse.json({ success: false, error: json?.errors || 'Zarinpal request failed', raw: json }, { status: 502 })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unexpected error'
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}


