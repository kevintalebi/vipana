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

    // Get payment record by authority (try authority first, then fallback to latest)
    let paymentRecord = null
    let paymentError = null
    
    // First try to find by authority
    const { data: authPayment, error: authError } = await supabase
      .from('payment')
      .select('*')
      .eq('authority', authority)
      .single()

    if (authPayment && !authError) {
      paymentRecord = authPayment
      console.log('Payment record found by authority:', paymentRecord)
    } else {
      console.log('Authority search failed, trying latest payment record:', authError)
      
      // Fallback: get the latest payment record (most recent)
      const { data: latestPayment, error: latestError } = await supabase
        .from('payment')
        .select('*')
        .order('id', { ascending: false })
        .limit(1)
        .single()
      
      if (latestPayment && !latestError) {
        paymentRecord = latestPayment
        console.log('Latest payment record found:', paymentRecord)
      } else {
        paymentError = latestError
        console.error('No payment record found:', latestError)
      }
    }

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
      
      // Check if this payment was already processed (if status column exists)
      if (paymentRecord.status === 'success') {
        console.log('Payment already processed, skipping token update')
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'https://vipana.ir'}/chat?error=payment_already_processed`)
      }
      
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

      // Ensure both values are numbers
      const currentTokens = Number(userData.tokens) || 0
      const tokensToAdd = Number(tokens) || 0
      const newTokenBalance = currentTokens + tokensToAdd
      
      console.log('Token calculation details:', {
        userDataTokens: userData.tokens,
        userDataTokensType: typeof userData.tokens,
        paymentTokens: tokens,
        paymentTokensType: typeof tokens,
        currentTokens: currentTokens,
        tokensToAdd: tokensToAdd,
        newTokenBalance: newTokenBalance,
        newTokenBalanceType: typeof newTokenBalance
      })
      
      console.log(`User current tokens: ${currentTokens}, Adding: ${tokensToAdd}, New balance: ${newTokenBalance}`)
      
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
        
        // Mark payment as successful (if status column exists)
        try {
          const { error: statusError } = await supabase
            .from('payment')
            .update({ status: 'success' })
            .eq('id', paymentRecord.id)
          
          if (statusError) {
            console.log('Status column may not exist, continuing without status update:', statusError)
          } else {
            console.log('Payment status updated to success')
          }
        } catch (statusError) {
          console.log('Status update failed, continuing without it:', statusError)
        }
      }

      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'https://vipana.ir'}/chat?success=payment_successful&tokens=${tokens}`)
    } else {
      // Payment failed
      console.error('Payment verification failed:', verifyData)
      
      // Update payment record to mark as failed (if status column exists)
      try {
        const { error: statusError } = await supabase
          .from('payment')
          .update({ 
            status: 'failed',
            tokens: 0
          })
          .eq('id', paymentRecord.id)
        
        if (statusError) {
          console.log('Status column may not exist, continuing without status update:', statusError)
        } else {
          console.log('Payment status updated to failed')
        }
      } catch (statusError) {
        console.log('Status update failed, continuing without it:', statusError)
      }

      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'https://vipana.ir'}/chat?error=payment_verification_failed`)
    }

  } catch (error) {
    console.error('Payment callback error:', error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'https://vipana.ir'}/chat?error=callback_error`)
  }
}
