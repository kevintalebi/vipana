import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Store confirmation tokens in memory (in production, use Redis or database)
const confirmationTokens = new Map<string, { userId: string; email: string; role: string; expiresAt: number }>();

export async function POST(request: NextRequest) {
  try {
    const { email, role } = await request.json();

    if (!email || !role) {
      return NextResponse.json(
        { error: 'ایمیل و نوع کاربری الزامی است' },
        { status: 400 }
      );
    }

    // Generate confirmation token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    // Store token temporarily
    confirmationTokens.set(token, {
      userId: '', // Will be set after user creation
      email,
      role,
      expiresAt
    });

    // Import email service dynamically to avoid server-side issues
    const { sendConfirmationEmail } = await import('../../../services/emailService');
    
    const emailSent = await sendConfirmationEmail({
      email,
      confirmationToken: token,
      role
    });

    if (emailSent) {
      return NextResponse.json(
        { message: 'ایمیل تایید ارسال شد' },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: 'خطا در ارسال ایمیل تایید' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in confirmation email API:', error);
    return NextResponse.json(
      { error: 'خطای سرور: ' + (error instanceof Error ? error.message : 'خطای نامشخص') },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token || !email) {
      return NextResponse.json(
        { error: 'توکن یا ایمیل نامعتبر است' },
        { status: 400 }
      );
    }

    // Get stored token data
    const tokenData = confirmationTokens.get(token);
    
    if (!tokenData) {
      return NextResponse.json(
        { error: 'توکن نامعتبر یا منقضی شده است' },
        { status: 400 }
      );
    }

    if (tokenData.email !== email) {
      return NextResponse.json(
        { error: 'ایمیل با توکن مطابقت ندارد' },
        { status: 400 }
      );
    }

    if (Date.now() > tokenData.expiresAt) {
      confirmationTokens.delete(token);
      return NextResponse.json(
        { error: 'توکن منقضی شده است' },
        { status: 400 }
      );
    }

    // Confirm the user's email in Supabase
    const { error } = await supabase.auth.updateUser({
      email_confirm: true
    });

    if (error) {
      console.error('Error confirming email:', error);
      return NextResponse.json(
        { error: 'خطا در تایید ایمیل' },
        { status: 500 }
      );
    }

    // Clean up the token
    confirmationTokens.delete(token);

    return NextResponse.json(
      { message: 'ایمیل با موفقیت تایید شد' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in email confirmation:', error);
    return NextResponse.json(
      { error: 'خطای سرور' },
      { status: 500 }
    );
  }
}
