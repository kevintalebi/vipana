'use client';

import { MessageSquare, AlertCircle, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const { signInWithGoogle, loading, error, clearError } = useAuth();
  const [localError, setLocalError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  // Handle error from URL parameters (from OAuth callback)
  useEffect(() => {
    const urlError = searchParams.get('error');
    if (urlError) {
      setLocalError(decodeURIComponent(urlError));
      // Clear the error from URL
      const url = new URL(window.location.href);
      url.searchParams.delete('error');
      window.history.replaceState({}, '', url.toString());
    }
  }, [searchParams]);

  const handleGoogleLogin = async () => {
    try {
      setLocalError(null);
      clearError();
      
      const result = await signInWithGoogle();
      
      if (!result.success && result.error) {
        setLocalError(result.error);
      }
    } catch (error: unknown) {
      setLocalError(error instanceof Error ? error.message : 'خطایی در ورود رخ داد');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">

        {/* Login Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              خوش آمدید
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              برای شروع چت با هوش مصنوعی وارد شوید
            </p>
          </div>

          {/* Error Display */}
          {(error || localError) && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-start space-x-3 space-x-reverse">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {error || localError}
                  </p>
                </div>
                <button
                  onClick={() => {
                    clearError();
                    setLocalError(null);
                  }}
                  className="text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Google Login Button */}
          <div className="space-y-4">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-3 space-x-reverse px-6 py-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              <span className="font-medium">
                {loading ? 'در حال ورود...' : 'ورود با گوگل'}
              </span>
            </button>
          </div>

          {/* Terms and Privacy */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              با ورود به حساب کاربری، شما با{' '}
              <a href="#" className="text-blue-500 hover:underline">
                شرایط استفاده
              </a>{' '}
              و{' '}
              <a href="#" className="text-blue-500 hover:underline">
                حریم خصوصی
              </a>{' '}
              موافقت می‌کنید.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
