'use client';
import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { useNavigationWithLoading } from '../../hooks/useNavigationWithLoading';

function LoginPageContent() {
  const searchParams = useSearchParams();
  const initialRole = searchParams?.get('role') || 'buyer';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendingEmail, setResendingEmail] = useState(false);
  const { navigateWithLoading } = useNavigationWithLoading();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Create Supabase client
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        setError('خطای پیکربندی سرور');
        setLoading(false);
        return;
      }
      
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // Step 1: Authenticate user with Supabase Auth
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (signInError) {
        // Handle email not confirmed error specifically
        if (signInError.message.includes('Email not confirmed') || signInError.message.includes('email')) {
          setError('ایمیل شما تایید نشده است. لطفاً ایمیل خود را تایید کنید یا دوباره ارسال کنید.');
        } else {
          setError(signInError.message);
        }
        setLoading(false);
        return;
      }

      if (!data.user) {
        setError('کاربر یافت نشد');
        setLoading(false);
        return;
      }

      // Step 2: Get user role from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('user_id', data.user.id)
        .single();
        
      if (userError || !userData) {
        setError('ورود موفق بود اما نقش کاربر یافت نشد.');
        setLoading(false);
        return;
      }

      // Step 3: Redirect based on user role
      if (userData.role === 'admin') {
        await navigateWithLoading('/admin');
      } else if (userData.role === 'seller') {
        await navigateWithLoading('/seller/reports');
      } else {
        await navigateWithLoading('/');
      }
      
    } catch (err: any) {
      setError('خطا در ورود: ' + (err.message || 'خطای نامشخص'));
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email) {
      setError('لطفاً ایمیل خود را وارد کنید');
      return;
    }

    setResendingEmail(true);
    setError('');
    setSuccess('');

    try {
      // Create Supabase client
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        setError('خطای پیکربندی سرور');
        setResendingEmail(false);
        return;
      }
      
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // Get user role from database
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('email', email)
        .single();

      if (userError || !userData) {
        setError('کاربری با این ایمیل یافت نشد');
        setResendingEmail(false);
        return;
      }

      // Send custom confirmation email
      const response = await fetch('/api/auth/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          role: userData.role
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('ایمیل تایید دوباره ارسال شد. لطفاً صندوق ورودی خود را بررسی کنید.');
      } else {
        setError('خطا در ارسال مجدد ایمیل: ' + (data.error || 'خطای نامشخص'));
      }
    } catch (err: any) {
      setError('خطا در ارسال مجدد ایمیل: ' + (err.message || 'خطای نامشخص'));
    } finally {
      setResendingEmail(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center text-purple-700 mb-6">ورود به حساب کاربری</h1>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div>
            <label className="block mb-1 font-semibold text-gray-700" htmlFor="email">ایمیل</label>
            <input 
              type="email" 
              id="email"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400" 
              placeholder="example@email.com" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold text-gray-700" htmlFor="password">رمز عبور</label>
            <input 
              type="password" 
              id="password"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400" 
              placeholder="••••••••" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition mt-4"
            disabled={loading}
          >
            {loading ? 'در حال ورود...' : 'ورود'}
          </button>
        </form>
        
        {error && (
          <div className="mt-4">
            <p className="text-red-600 text-center mb-2">{error}</p>
            {error.includes('تایید نشده') && (
              <button
                onClick={handleResendConfirmation}
                disabled={resendingEmail}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition disabled:opacity-50"
              >
                {resendingEmail ? 'در حال ارسال...' : 'ارسال مجدد ایمیل تایید'}
              </button>
            )}
          </div>
        )}
        
        {success && <p className="text-green-600 text-center mt-4">{success}</p>}
        
        <p className="text-center text-gray-600 mt-6">
          حساب کاربری ندارید؟
          <a href="/auth/register" className="text-purple-600 hover:underline font-semibold"> ثبت‌نام کنید</a>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded mt-4"></div>
            </div>
          </div>
        </div>
      </main>
    }>
      <LoginPageContent />
    </Suspense>
  );
} 