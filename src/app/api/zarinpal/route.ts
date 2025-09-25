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
    console.log('Zarinpal API called')
    
    const body = await request.json().catch(() => ({} as RequestBody))
    console.log('Request body:', body)
    
    const { amount, callback_url, description, email, mobile, user_id } = body || {}
    console.log('Extracted parameters:', { amount, user_id, email, description })

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
    const desc = description || `شارژ حساب ویپانا - ${amount} تومان`

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
    console.log('Payment data:', { amount, user_id, email, description })

    let zarinpalRes: Response
    let json: ZarinpalResponse

    try {
      // Create AbortController for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      zarinpalRes = await fetch('https://api.zarinpal.com/pg/v4/payment/request.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!zarinpalRes.ok) {
        console.error('Zarinpal API error:', zarinpalRes.status, zarinpalRes.statusText)
        return NextResponse.json({ 
          success: false, 
          error: 'خطا در ارتباط با درگاه پرداخت زرین‌پال' 
        }, { status: 502 })
      }

      json = await zarinpalRes.json()
      console.log('Zarinpal response:', json)
    } catch (fetchError) {
      console.error('Fetch error:', fetchError)
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return NextResponse.json({ 
          success: false, 
          error: 'زمان اتصال به درگاه پرداخت به پایان رسید' 
        }, { status: 504 })
      }
      
      return NextResponse.json({ 
        success: false, 
        error: 'خطا در ارتباط با سرور پرداخت' 
      }, { status: 503 })
    }

    const data = json?.data
    if (zarinpalRes.ok && data?.code === 100 && data?.authority) {
      const authority: string = data.authority
      const gatewayUrl = `https://www.zarinpal.com/pg/StartPay/${authority}`
      
    // Get current coin price and calculate tokens
    console.log('Fetching coin price from database...')
    const { data: priceData, error: priceError } = await supabase
      .from('price')
      .select('price')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    console.log('Price query result:', { priceData, priceError })

    if (priceError || !priceData) {
      console.error('Error fetching coin price:', priceError)
      return NextResponse.json({ 
        success: false, 
        error: 'خطا در دریافت قیمت سکه',
        details: priceError?.message || 'No price data found'
      }, { status: 500 })
    }

      const coinPrice = priceData.price
      const tokens = Math.floor(amount / coinPrice)

      // Save payment record to database
      const paymentData = {
        user_id: user_id,
        total_pay: amount,
        price: coinPrice,
        tokens: tokens
      }
      
      console.log('Inserting payment record:', paymentData)
      
      const { data: insertedPayment, error: dbError } = await supabase
        .from('payment')
        .insert(paymentData)
        .select()

      console.log('Database insertion result:', { insertedPayment, dbError })

      if (dbError) {
        console.error('Database error:', dbError)
        console.error('Database error details:', {
          message: dbError.message,
          code: dbError.code,
          hint: dbError.hint,
          details: dbError.details
        })
        return NextResponse.json({ 
          success: false, 
          error: 'خطا در ثبت اطلاعات پرداخت در پایگاه داده',
          details: dbError.message,
          code: dbError.code
        }, { status: 500 })
      }

      console.log('Payment record inserted successfully:', insertedPayment)
      
      // Try to update the record with authority if the column exists
      if (insertedPayment && insertedPayment.length > 0) {
        const paymentId = insertedPayment[0].id
        try {
          await supabase
            .from('payment')
            .update({ authority: authority })
            .eq('id', paymentId)
          console.log('Authority updated for payment record:', paymentId)
        } catch (authError) {
          console.log('Authority column may not exist, continuing without it:', authError)
        }
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
    console.error('Error type:', typeof error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack')
    
    const errorMessage = error instanceof Error ? error.message : 'خطای غیرمنتظره'
    return NextResponse.json({ 
      success: false, 
      error: errorMessage,
      errorType: typeof error,
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}


