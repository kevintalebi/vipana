'use client';
import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useNavigationWithLoading } from '../../hooks/useNavigationWithLoading';

export default function EmailConfirmationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { navigateWithLoading } = useNavigationWithLoading();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const confirmEmail = async () => {
      const token = searchParams.get('token');
      const email = searchParams.get('email');

      if (!token || !email) {
        setStatus('error');
        setMessage('لینک تایید نامعتبر است');
        return;
      }

      try {
        const response = await fetch(`/api/auth/confirm?token=${token}&email=${encodeURIComponent(email)}`);
        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage('ایمیل شما با موفقیت تایید شد!');
          // Redirect to login after 3 seconds
          setTimeout(() => {
            navigateWithLoading('/auth/login');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(data.error || 'خطا در تایید ایمیل');
        }
      } catch (error) {
        setStatus('error');
        setMessage('خطا در اتصال به سرور');
      }
    };

    confirmEmail();
  }, [searchParams, navigateWithLoading]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-purple-700 mb-2">تایید ایمیل</h1>
          <p className="text-gray-600">در حال تایید ایمیل شما...</p>
        </div>

        {status === 'loading' && (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
            <p className="text-gray-600">لطفاً صبر کنید...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-green-600 mb-2">تایید موفق</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <p className="text-sm text-gray-500">در حال انتقال به صفحه ورود...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-red-600 mb-2">خطا در تایید</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <div className="space-y-2">
              <button
                onClick={() => navigateWithLoading('/auth/login')}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-semibold transition"
              >
                بازگشت به صفحه ورود
              </button>
              <button
                onClick={() => navigateWithLoading('/auth/register')}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg font-semibold transition"
              >
                ثبت نام مجدد
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
