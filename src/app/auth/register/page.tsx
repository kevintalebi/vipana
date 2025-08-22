'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useNavigationWithLoading } from '../../hooks/useNavigationWithLoading';

// Modal Component for showing messages
const MessageModal = ({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  title: string; 
  message: string; 
  type: 'error' | 'success' 
}) => {
  if (!isOpen) return null;
  
  const bgColor = type === 'error' ? 'bg-red-50' : 'bg-green-50';
  const borderColor = type === 'error' ? 'border-red-200' : 'border-green-200';
  const iconColor = type === 'error' ? 'text-red-600' : 'text-green-600';
  const titleColor = type === 'error' ? 'text-red-800' : 'text-green-800';
  const messageColor = type === 'error' ? 'text-red-700' : 'text-green-700';
  const buttonColor = type === 'error' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700';
  
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className={`bg-white rounded-lg shadow-xl max-w-md w-full p-6 border ${borderColor} ${bgColor}`} onClick={e => e.stopPropagation()}>
        <div className="flex flex-col items-center text-center">
          <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${type === 'error' ? 'bg-red-100' : 'bg-green-100'} mb-4`}>
            {type === 'error' ? (
              <svg className={`h-6 w-6 ${iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className={`h-6 w-6 ${iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <h3 className={`text-lg font-bold ${titleColor} mb-2`}>{title}</h3>
          <p className={`${messageColor} mb-4`}>{message}</p>
          <button
            onClick={onClose}
            className={`px-4 py-2 ${buttonColor} text-white rounded-lg font-semibold transition-colors`}
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [role, setRole] = useState('buyer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<{ title: string; message: string; type: 'error' | 'success' }>({ title: '', message: '', type: 'error' });
  const { navigateWithLoading } = useNavigationWithLoading();

  const showModal = (title: string, message: string, type: 'error' | 'success') => {
    setModalData({ title, message, type });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalData({ title: '', message: '', type: 'error' });
  };

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
        showModal('خطای پیکربندی', 'خطای پیکربندی سرور', 'error');
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
          showModal('خطا در ثبت نام', 'این ایمیل قبلا ثبت نام کرده است', 'error');
        } else {
          showModal('خطا در ثبت نام', signUpError.message, 'error');
        }
        setLoading(false);
        return;
      }

      if (!data.user) {
        showModal('خطا در ثبت نام', 'خطا در ایجاد حساب کاربری', 'error');
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
          showModal('خطا در ثبت نام', 'این ایمیل قبلا ثبت نام کرده است', 'error');
        } else {
          showModal('خطا در ثبت نام', 'ثبت نام انجام شد اما ذخیره اطلاعات در دیتابیس users با خطا مواجه شد: ' + userError.message, 'error');
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
            showModal('خطا در ثبت نام', 'این ایمیل قبلا ثبت نام کرده است', 'error');
          } else {
            showModal('خطا در ثبت نام', 'ثبت نام انجام شد اما ذخیره اطلاعات در دیتابیس buyers با خطا مواجه شد: ' + buyerError.message, 'error');
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
            showModal('خطا در ثبت نام', 'این ایمیل قبلا ثبت نام کرده است', 'error');
          } else {
            showModal('خطا در ثبت نام', 'ثبت نام انجام شد اما ذخیره اطلاعات در دیتابیس sellers با خطا مواجه شد: ' + sellerError.message, 'error');
          }
          setLoading(false);
          return;
        }
      }

      // Step 4: Show success message (Supabase handles email confirmation automatically)
      showModal('ثبت نام موفق', 'حساب کاربری با موفقیت ایجاد شد! لطفاً ایمیل خود را تایید کنید.', 'success');
      
    } catch (err: any) {
      showModal('خطا در ثبت نام', 'خطا در ثبت نام: ' + (err.message || 'خطای نامشخص'), 'error');
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
        
        <p className="text-center text-gray-600 mt-6">
          قبلاً حساب کاربری دارید؟
          <a href="/auth/login" className="text-purple-600 hover:underline font-semibold"> وارد شوید</a>
        </p>
      </div>
      
      <MessageModal
        isOpen={modalOpen}
        onClose={closeModal}
        title={modalData.title}
        message={modalData.message}
        type={modalData.type}
      />
    </main>
  );
} 