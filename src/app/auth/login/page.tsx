'use client';
import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { useNavigationWithLoading } from '../../hooks/useNavigationWithLoading';

function LoginPageContent() {
  const searchParams = useSearchParams();
  const initialRole = searchParams?.get('role') || 'buyer';
  const confirmed = searchParams?.get('confirmed') === 'true';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(confirmed ? 'ایمیل شما با موفقیت تایید شد! حالا می‌توانید وارد شوید.' : '');
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
        } else if (signInError.message.includes('Invalid login credentials')) {
          setError('ایمیل یا رمز عبور اشتباه است. لطفاً دوباره تلاش کنید.');
        } else if (signInError.message.includes('Invalid email or password')) {
          setError('ایمیل یا رمز عبور اشتباه است. لطفاً دوباره تلاش کنید.');
        } else if (signInError.message.includes('User not found')) {
          setError('کاربری با این ایمیل یافت نشد.');
        } else if (signInError.message.includes('Too many requests')) {
          setError('تعداد درخواست‌ها بیش از حد مجاز است. لطفاً کمی صبر کنید و دوباره تلاش کنید.');
        } else {
          setError('خطا در ورود: ' + signInError.message);
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
      console.log('Looking for user in users table with ID:', data.user.id);
      console.log('User email:', data.user.email);
      
      // First try to find by user_id
      let { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('user_id', data.user.id)
        .single();
        
      console.log('User data from users table (by user_id):', userData);
      console.log('User error from users table (by user_id):', userError);
      
      // If not found by user_id, try by email
      if (userError || !userData) {
        console.log('User not found by user_id, trying by email...');
        const { data: userDataByEmail, error: userErrorByEmail } = await supabase
          .from('users')
          .select('role')
          .eq('email', data.user.email)
          .single();
          
        console.log('User data from users table (by email):', userDataByEmail);
        console.log('User error from users table (by email):', userErrorByEmail);
        
        if (userDataByEmail && !userErrorByEmail) {
          userData = userDataByEmail;
          userError = null;
        }
      }
        
      if (userError || !userData) {
        // User exists in Auth but not in users table - try to create the missing record
        console.log('User not found in users table, attempting to create record');
        
        // Get role from user metadata (stored during registration)
        console.log('User metadata:', data.user.user_metadata);
        const userRole = data.user.user_metadata?.role || 'buyer';
        console.log('Using role:', userRole);
        
        // Try to insert the missing user record
        const { error: insertError } = await supabase.from('users').insert([
          {
            user_id: data.user.id,
            email: data.user.email,
            role: userRole
          }
        ]);
        
                 if (insertError) {
           console.error('Failed to create user record:', insertError);
           // If we can't create the record, still allow login with default role
           console.log('Using default role for login');
           await navigateWithLoading('/products');
           return;
         }
        
        // Also try to create the role-specific record (don't fail if this doesn't work)
        try {
          if (userRole === 'buyer') {
            await supabase.from('buyers').insert([{ user_id: data.user.id }]);
          } else if (userRole === 'seller') {
            await supabase.from('sellers').insert([{ user_id: data.user.id }]);
          }
        } catch (roleError) {
          console.error('Failed to create role-specific record:', roleError);
          // Continue anyway
        }
        
        // Use the role from metadata for redirection (only buyer or seller)
        if (userRole === 'seller') {
          await navigateWithLoading('/seller/reports');
        } else {
          // Default to buyer role and redirect to products
          await navigateWithLoading('/products');
        }
        return;
      }

      // Step 3: Redirect based on user role (only buyer or seller)
      if (userData.role === 'seller') {
        await navigateWithLoading('/seller/reports');
      } else {
        // Default to buyer role and redirect to products
        await navigateWithLoading('/products');
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
        // User not found in users table, but we'll still try to resend confirmation
        // The user might exist in Auth but not in our users table
        console.log('User not found in users table, but attempting to resend confirmation');
      }

      // Use Supabase's built-in resend confirmation
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/login?confirmed=true`,
        },
      });

      if (resendError) {
        setError('خطا در ارسال مجدد ایمیل: ' + resendError.message);
      } else {
        setSuccess('ایمیل تایید دوباره ارسال شد. لطفاً صندوق ورودی خود را بررسی کنید.');
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