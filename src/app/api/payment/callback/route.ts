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

    // Get payment record by authority
    const { data: paymentRecord, error: paymentError } = await supabase
      .from('payment')
      .select('*')
      .eq('authority', authority)
      .single()

    console.log('Payment record query result:', { paymentRecord, paymentError, authority })

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
      // Payment successful - tokens are already calculated in payment record
      const tokens = paymentRecord.tokens

      console.log(`Payment successful! Adding ${tokens} tokens to user ${paymentRecord.user_id}`)
      
      // Check if tokens are valid
      if (!tokens || tokens <= 0) {
        console.log('Invalid tokens calculated, skipping token update')
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'https://vipana.ir'}/chat?error=invalid_tokens`)
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
      
      console.log(`User current tokens: ${userData.tokens}, Adding: ${tokens}, New balance: ${newTokenBalance}`)
      
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
        
        // Mark payment as processed by setting tokens to 0 (to prevent double processing)
        await supabase
          .from('payment')
          .update({ tokens: 0 })
          .eq('id', paymentRecord.id)
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
