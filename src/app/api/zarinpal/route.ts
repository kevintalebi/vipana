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
    console.log('=== ZARINPAL API CALLED ===')
    
    const body = await request.json().catch(() => ({} as RequestBody))
    console.log('Request body:', body)
    
    const { amount, callback_url, description, email, mobile, user_id } = body || {}
    console.log('Extracted parameters:', { amount, user_id, email, description })
    
    console.log('Environment check:', {
      merchantId: process.env.NEXT_PUBLIC_ZARINPAL_API_KEY ? 'SET' : 'NOT SET',
      appUrl: process.env.NEXT_PUBLIC_APP_URL || 'NOT SET'
    })

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

    console.log('=== CALLING ZARINPAL API ===')
    const zarinpalRes = await fetch('https://api.zarinpal.com/pg/v4/payment/request.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    console.log('Zarinpal response status:', zarinpalRes.status)
    console.log('Zarinpal response ok:', zarinpalRes.ok)

    const json = await zarinpalRes.json().catch(() => ({} as ZarinpalResponse))
    console.log('Zarinpal response JSON:', json)

    const data = json?.data
    if (zarinpalRes.ok && data?.code === 100 && data?.authority) {
      const authority: string = data.authority
      const gatewayUrl = `https://www.zarinpal.com/pg/StartPay/${authority}`
      
      // Get current coin price and calculate tokens
      console.log('=== FETCHING COIN PRICE ===')
      let priceData = null
      let priceError = null
      
      try {
        const result = await supabase
          .from('price')
          .select('price')
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        priceData = result.data
        priceError = result.error
        console.log('Price query result:', { priceData, priceError })
      } catch (fetchError) {
        console.error('Price fetch error:', fetchError)
        // Use default price if database fetch fails
        priceData = { price: 1000 } // Default price
        console.log('Using default price due to network error')
      }

      if (priceError || !priceData) {
        console.error('Error fetching coin price:', priceError)
        // Use default price instead of failing
        priceData = { price: 1000 } // Default price
        console.log('Using default price due to database error')
      }

      const coinPrice = priceData.price
      const tokens = Math.floor(amount / coinPrice)

      // Save payment record to database
      console.log('=== INSERTING PAYMENT RECORD ===')
      const paymentData = {
        user_id: user_id,
        total_pay: amount,
        price: coinPrice,
        tokens: tokens,
        status: 'pending'
      }
      
      console.log('Inserting payment record:', paymentData)
      
      let insertedPayment = null
      let dbError = null
      
      try {
        const result = await supabase
          .from('payment')
          .insert(paymentData)
          .select()

        insertedPayment = result.data
        dbError = result.error
        console.log('Database insertion result:', { insertedPayment, dbError })
      } catch (fetchError) {
        console.error('Database fetch error:', fetchError)
        // Continue without database insertion - don't fail the payment
        console.log('Continuing without database insertion due to network error')
      }

      if (dbError) {
        console.error('Database error:', dbError)
        // Don't fail the payment if database insertion fails
        console.log('Database insertion failed, but continuing with payment')
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
    const errorMessage = error instanceof Error ? error.message : 'خطای غیرمنتظره'
    return NextResponse.json({ 
      success: false, 
      error: errorMessage 
    }, { status: 500 })
  }
}


