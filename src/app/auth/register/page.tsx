'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useNavigationWithLoading } from '../../hooks/useNavigationWithLoading';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [role, setRole] = useState('buyer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
      
      // Step 1: Register user in Supabase Auth (with email confirmation)
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role },
          emailRedirectTo: `${window.location.origin}/auth/login?confirmed=true`,
        },
      });
      
      if (signUpError) {
        // Check if it's a duplicate email error from Supabase Auth
        if (signUpError.message.includes('User already registered') || 
            signUpError.message.includes('already registered') ||
            signUpError.message.includes('duplicate')) {
          setError('این ایمیل قبلا ثبت نام کرده است');
        } else {
          setError(signUpError.message);
        }
        setLoading(false);
        return;
      }

      if (!data.user) {
        setError('خطا در ایجاد حساب کاربری');
        setLoading(false);
        return;
      }

      // Check if user needs email confirmation
      if (data.user && !data.user.email_confirmed_at) {
        // User created but email not confirmed - this is expected
        console.log('User created, email confirmation required');
      }

      // Step 2: Insert basic user data into users table
      const { error: userError } = await supabase.from('users').insert([
        {
          user_id: data.user.id,
          email: email,
          mobile: mobile || null,
          role: role
        }
      ]);

      if (userError) {
        // Check if it's a duplicate key constraint error
        if (userError.message.includes('duplicate key value violates unique constraint "users_user_id_key"') || 
            userError.message.includes('duplicate key value violates unique constraint "users_email_key"')) {
          setError('این ایمیل قبلا ثبت نام کرده است');
        } else {
          setError('ثبت نام انجام شد اما ذخیره اطلاعات در دیتابیس users با خطا مواجه شد: ' + userError.message);
        }
        setLoading(false);
        return;
      }

      // Step 3: Insert role-specific data into appropriate table
      if (role === 'buyer') {
        const { error: buyerError } = await supabase.from('buyers').insert([
          {
            user_id: data.user.id
          }
        ]);

        if (buyerError) {
          // Check if it's a duplicate key constraint error
          if (buyerError.message.includes('duplicate key value violates unique constraint "buyers_user_id_key"')) {
            setError('این ایمیل قبلا ثبت نام کرده است');
          } else {
            setError('ثبت نام انجام شد اما ذخیره اطلاعات در دیتابیس buyers با خطا مواجه شد: ' + buyerError.message);
          }
          setLoading(false);
          return;
        }
      } else if (role === 'seller') {
        const { error: sellerError } = await supabase.from('sellers').insert([
          {
            user_id: data.user.id
          }
        ]);

        if (sellerError) {
          // Check if it's a duplicate key constraint error
          if (sellerError.message.includes('duplicate key value violates unique constraint "sellers_user_id_key"')) {
            setError('این ایمیل قبلا ثبت نام کرده است');
          } else {
            setError('ثبت نام انجام شد اما ذخیره اطلاعات در دیتابیس sellers با خطا مواجه شد: ' + sellerError.message);
          }
          setLoading(false);
          return;
        }
      }

      // Step 4: Show success message (Supabase handles email confirmation automatically)
      setSuccess('حساب کاربری با موفقیت ایجاد شد! لطفاً ایمیل خود را تایید کنید.');
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigateWithLoading('/auth/login');
      }, 3000);
      
    } catch (err: any) {
      setError('خطا در ثبت نام: ' + (err.message || 'خطای نامشخص'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center text-purple-700 mb-6">ثبت نام</h1>
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
          <div>
            <label className="block mb-1 font-semibold text-gray-700" htmlFor="mobile">شماره موبایل (اختیاری)</label>
            <input 
              type="tel" 
              id="mobile"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400" 
              placeholder="09123456789" 
              value={mobile}
              onChange={e => setMobile(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold text-gray-700" htmlFor="role">نوع کاربری</label>
            <select 
              id="role"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400" 
              value={role}
              onChange={e => setRole(e.target.value)}
            >
              <option value="buyer">خریدار</option>
              <option value="seller">فروشنده</option>
            </select>
          </div>
          <button 
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition mt-4"
            disabled={loading}
          >
            {loading ? 'در حال ثبت نام...' : 'ثبت نام'}
          </button>
        </form>
        
        {error && <p className="text-red-600 text-center mt-4">{error}</p>}
        {success && <p className="text-green-600 text-center mt-4">{success}</p>}
        
        <p className="text-center text-gray-600 mt-6">
          قبلاً حساب کاربری دارید؟
          <a href="/auth/login" className="text-purple-600 hover:underline font-semibold"> وارد شوید</a>
        </p>
      </div>
    </main>
  );
} 