import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const authority = searchParams.get('Authority')
    const status = searchParams.get('Status')
    
    console.log('Payment callback received:', { authority, status })

    if (!authority) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'https://vipana.ir'}/chat?error=authority_missing`)
    }

    if (status !== 'OK') {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'https://vipana.ir'}/chat?error=payment_failed`)
    }

    // Verify payment with Zarinpal
    const merchantId = process.env.NEXT_PUBLIC_ZARINPAL_API_KEY
    if (!merchantId) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'https://vipana.ir'}/chat?error=merchant_id_missing`)
    }

    // Get the most recent payment record for this user
    // Since we don't have authority field, we'll get the latest payment
    const { data: paymentRecord, error: paymentError } = await supabase
      .from('payment')
      .select('*')
      .order('id', { ascending: false })
      .limit(1)
      .single()

    if (paymentError || !paymentRecord) {
      console.error('Payment record not found:', paymentError)
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'https://vipana.ir'}/chat?error=payment_record_not_found`)
    }

    const verifyResponse = await fetch('https://api.zarinpal.com/pg/v4/payment/verify.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        merchant_id: merchantId,
        authority: authority,
        amount: paymentRecord.total_pay
      })
    })

    const verifyData = await verifyResponse.json()
    console.log('Zarinpal verify response:', verifyData)

    if (verifyData.data?.code === 100) {
      // Payment successful
      const amount = paymentRecord.total_pay // Use the original payment amount
      
      // Get the current coin price from the price table
      const { data: priceData, error: priceError } = await supabase
        .from('price')
        .select('price')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      console.log('Price fetch result:', { priceData, priceError })

      if (priceError || !priceData) {
        console.error('Error fetching coin price:', priceError)
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'https://vipana.ir'}/chat?error=price_fetch_failed`)
      }

      // Calculate tokens based on actual price
      const coinPrice = priceData.price
      const tokens = Math.floor(amount / coinPrice)

      console.log(`Payment amount: ${amount} Rials, Coin price: ${coinPrice} Rials, Tokens to add: ${tokens}`)

      // Update payment record with calculated tokens and price
      const { error: updatePaymentError } = await supabase
        .from('payment')
        .update({ 
          tokens: tokens,
          price: coinPrice
        })
        .eq('id', paymentRecord.id)

      if (updatePaymentError) {
        console.error('Error updating payment status:', updatePaymentError)
      }

      // Get current user tokens and update them
      const { data: userData, error: userFetchError } = await supabase
        .from('users')
        .select('tokens')
        .eq('user_id', paymentRecord.user_id)
        .single()

      if (userFetchError || !userData) {
        console.error('Error fetching user tokens:', userFetchError)
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'https://vipana.ir'}/chat?error=user_fetch_failed`)
      }

      const newTokenBalance = userData.tokens + tokens
      
      const { error: tokenError } = await supabase
        .from('users')
        .update({ 
          tokens: newTokenBalance
        })
        .eq('user_id', paymentRecord.user_id)

      if (tokenError) {
        console.error('Error updating tokens:', tokenError)
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'https://vipana.ir'}/chat?error=token_update_failed`)
      } else {
        console.log(`Successfully added ${tokens} tokens to user ${paymentRecord.user_id}`)
      }

      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'https://vipana.ir'}/chat?success=payment_successful&tokens=${tokens}`)
    } else {
      // Payment failed
      console.error('Payment verification failed:', verifyData)
      
      // Update payment record to mark as failed (set tokens to 0)
      await supabase
        .from('payment')
        .update({ 
          tokens: 0
        })
        .eq('id', paymentRecord.id)

      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'https://vipana.ir'}/chat?error=payment_verification_failed`)
    }

  } catch (error) {
    console.error('Payment callback error:', error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'https://vipana.ir'}/chat?error=callback_error`)
  }
}
