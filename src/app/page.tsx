import Link from "next/link";
import { MessageSquare, LogIn, ArrowLeft } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Logo and Title */}
        <div className="mb-12">
          <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageSquare className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            چت هوش مصنوعی
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            تجربه‌ای جدید از گفتگو با هوش مصنوعی به زبان فارسی
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 mb-12">
          <Link
            href="/chat"
            className="inline-flex items-center justify-center space-x-3 space-x-reverse w-full sm:w-auto px-8 py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium text-lg"
          >
            <MessageSquare className="w-6 h-6" />
            <span>شروع چت</span>
          </Link>
          
          <div className="text-gray-500 dark:text-gray-400">یا</div>
          
          <Link
            href="/login"
            className="inline-flex items-center justify-center space-x-3 space-x-reverse w-full sm:w-auto px-8 py-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium text-lg"
          >
            <LogIn className="w-6 h-6" />
            <span>ورود / ثبت‌نام</span>
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              چت هوشمند
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              گفتگو با پیشرفته‌ترین مدل‌های هوش مصنوعی
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🇮🇷</span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              پشتیبانی فارسی
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              رابط کاربری RTL و پشتیبانی کامل از زبان فارسی
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              پاسخ سریع
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              دریافت پاسخ‌های سریع و دقیق در کمترین زمان
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <p>© 2024 AI SaaS Chat. تمامی حقوق محفوظ است.</p>
        </div>
      </div>
    </div>
  );
}
