'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useNavigationWithLoading } from '../../hooks/useNavigationWithLoading';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
      // Step 1: Register user in Supabase Auth (without email confirmation)
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role },
        },
      });
      
      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      if (!data.user) {
        setError('خطا در ایجاد حساب کاربری');
        setLoading(false);
        return;
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
        setError('ثبت نام انجام شد اما ذخیره اطلاعات در دیتابیس users با خطا مواجه شد: ' + userError.message);
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
          setError('ثبت نام انجام شد اما ذخیره اطلاعات در دیتابیس buyers با خطا مواجه شد: ' + buyerError.message);
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
          setError('ثبت نام انجام شد اما ذخیره اطلاعات در دیتابیس sellers با خطا مواجه شد: ' + sellerError.message);
          setLoading(false);
          return;
        }
      }

      // Step 4: Send custom confirmation email
      try {
        const response = await fetch('/api/auth/confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email,
            role: role
          }),
        });

        const emailData = await response.json();

        if (response.ok) {
          setSuccess('ثبت‌نام با موفقیت انجام شد! ایمیل تایید ارسال شد. لطفاً ایمیل خود را بررسی کنید.');
        } else {
          console.warn('Email sending failed:', emailData.error);
          setSuccess('ثبت‌نام با موفقیت انجام شد! اما ارسال ایمیل تایید با مشکل مواجه شد. لطفاً با پشتیبانی تماس بگیرید.');
        }
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError);
        setSuccess('ثبت‌نام با موفقیت انجام شد! اما ارسال ایمیل تایید با مشکل مواجه شد. لطفاً با پشتیبانی تماس بگیرید.');
      }

      setTimeout(async () => {
        await navigateWithLoading('/auth/login');
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
        <h1 className="text-2xl font-bold text-center text-purple-700 mb-6">ایجاد حساب کاربری</h1>
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
            <label className="block mb-1 font-semibold text-gray-700" htmlFor="mobile">شماره موبایل</label>
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
            <label className="block mb-1 font-semibold text-gray-700" htmlFor="role">نوع کاربری</label>
            <select 
              id="role" 
              className="w-full border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
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
            {loading ? 'در حال ثبت‌نام...' : 'ثبت نام'}
          </button>
        </form>
        {error && <p className="text-red-600 text-center mt-4">{error}</p>}
        {success && <p className="text-green-600 text-center mt-4">{success}</p>}
        <p className="text-center text-gray-600 mt-6">
          حساب کاربری دارید؟ 
          <a href="/auth/login" className="text-purple-600 hover:underline font-semibold"> وارد شوید</a>
        </p>
      </div>
    </main>
  );
} 