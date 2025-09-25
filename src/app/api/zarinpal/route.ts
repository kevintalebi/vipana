import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

interface RequestBody {
  amount?: number;
  callback_url?: string;
  description?: string;
  email?: string;
  mobile?: string;
  user_id?: string;
}

interface ZarinpalResponse {
  data?: {
    code?: number;
    authority?: string;
    fee_type?: string;
  };
  errors?: string[];
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({} as RequestBody))
    const { amount, callback_url, description, email, mobile, user_id } = body || {}

    // Validation
    if (!amount || amount <= 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'مبلغ نامعتبر است' 
      }, { status: 400 })
    }

    if (!user_id) {
      return NextResponse.json({ 
        success: false, 
        error: 'شناسه کاربر الزامی است' 
      }, { status: 400 })
    }

    const merchantId = process.env.NEXT_PUBLIC_ZARINPAL_API_KEY
    if (!merchantId) {
      return NextResponse.json({ 
        success: false, 
        error: 'کلید API زرین‌پال تنظیم نشده است' 
      }, { status: 500 })
    }

    // Set callback URL
    const cbUrl = callback_url || `${process.env.NEXT_PUBLIC_APP_URL || 'https://vipana.ir'}/api/payment/callback`
    const desc = description || 'شارژ حساب ویپانا'

    const payload = {
      merchant_id: merchantId,
      amount: Number(amount),
      callback_url: cbUrl,
      description: desc,
      metadata: {
        user_id: user_id,
        email: email || undefined,
        mobile: mobile || undefined,
      },
    }

    console.log('Zarinpal request payload:', payload)

    const zarinpalRes = await fetch('https://api.zarinpal.com/pg/v4/payment/request.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const json = await zarinpalRes.json().catch(() => ({} as ZarinpalResponse))
    console.log('Zarinpal response:', json)

    const data = json?.data
    if (zarinpalRes.ok && data?.code === 100 && data?.authority) {
      const authority: string = data.authority
      const gatewayUrl = `https://www.zarinpal.com/pg/StartPay/${authority}`
      
      // Save payment record to database
      try {
        const { error: dbError } = await supabase
          .from('payment')
          .insert({
            user_id: user_id,
            total_pay: amount,
            price: 0, // Will be calculated and updated later
            tokens: 0 // Will be calculated and updated later
          })

        if (dbError) {
          console.error('Database error:', dbError)
          // Continue anyway, don't fail the payment
        }
      } catch (dbError) {
        console.error('Database error:', dbError)
        // Continue anyway
      }

      return NextResponse.json({ 
        success: true, 
        authority, 
        url: gatewayUrl 
      })
    }

    // Handle other success cases
    if (zarinpalRes.ok && data?.authority) {
      const authority: string = data.authority
      const gatewayUrl = `https://www.zarinpal.com/pg/StartPay/${authority}`
      return NextResponse.json({ success: true, authority, url: gatewayUrl })
    }

    return NextResponse.json({ 
      success: false, 
      error: json?.errors || 'درخواست پرداخت ناموفق بود', 
      raw: json as unknown 
    }, { status: 502 })

  } catch (error: unknown) {
    console.error('Zarinpal API error:', error)
    const errorMessage = error instanceof Error ? error.message : 'خطای غیرمنتظره'
    return NextResponse.json({ 
      success: false, 
      error: errorMessage 
    }, { status: 500 })
  }
}


