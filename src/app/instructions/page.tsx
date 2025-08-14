'use client';
import React from 'react';
import Link from 'next/link';

export default function InstructionsPage() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">راهنمای کامل ویپانا</h1>
          <p className="text-gray-600">تمام اطلاعات مورد نیاز شما در یک صفحه</p>
        </div>

        {/* Navigation Menu */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">فهرست مطالب</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => scrollToSection('quick-access')}
              className="text-right p-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors text-purple-700 font-medium"
            >
              دسترسی سریع
            </button>
            <button
              onClick={() => scrollToSection('customer-services')}
              className="text-right p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors text-blue-700 font-medium"
            >
              خدمات مشتریان
            </button>
            <button
              onClick={() => scrollToSection('partner-services')}
              className="text-right p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors text-green-700 font-medium"
            >
              خدمات همکاران
            </button>
            <button
              onClick={() => scrollToSection('shopping-guide')}
              className="text-right p-3 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors text-orange-700 font-medium"
            >
              راهنمای خرید
            </button>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          {/* Quick Access Section */}
          <section id="quick-access" className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">دسترسی سریع</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 rounded-lg bg-purple-50">
                <h3 className="font-bold text-purple-800 mb-2">درباره ما</h3>
                <p className="text-sm text-gray-600 mb-3">آشنایی با ویپانا و خدمات ما</p>
                <Link href="/instructions/about" className="text-purple-600 hover:text-purple-800 font-medium">
                  مشاهده بیشتر →
                </Link>
              </div>
              <div className="text-center p-4 rounded-lg bg-purple-50">
                <h3 className="font-bold text-purple-800 mb-2">اخبار</h3>
                <p className="text-sm text-gray-600 mb-3">آخرین اخبار و مقالات</p>
                <Link href="/instructions/news" className="text-purple-600 hover:text-purple-800 font-medium">
                  مشاهده بیشتر →
                </Link>
              </div>
              <div className="text-center p-4 rounded-lg bg-purple-50">
                <h3 className="font-bold text-purple-800 mb-2">تماس با ما</h3>
                <p className="text-sm text-gray-600 mb-3">راه‌های ارتباطی</p>
                <Link href="/instructions/contact" className="text-purple-600 hover:text-purple-800 font-medium">
                  مشاهده بیشتر →
                </Link>
              </div>
            </div>
          </section>

          {/* Customer Services Section */}
          <section id="customer-services" className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">خدمات مشتریان</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 rounded-lg bg-blue-50">
                <h3 className="font-bold text-blue-800 mb-2">حساب کاربری</h3>
                <p className="text-sm text-gray-600 mb-3">راهنمای ثبت نام، ورود و مدیریت پروفایل</p>
                <Link href="/instructions/account" className="text-blue-600 hover:text-blue-800 font-medium">
                  مشاهده بیشتر →
                </Link>
              </div>
              <div className="text-center p-4 rounded-lg bg-blue-50">
                <h3 className="font-bold text-blue-800 mb-2">مرجوعی سفارش</h3>
                <p className="text-sm text-gray-600 mb-3">شرایط و نحوه بازگشت کالا</p>
                <Link href="/instructions/return" className="text-blue-600 hover:text-blue-800 font-medium">
                  راهنمای مرجوعی →
                </Link>
              </div>
                              <div className="text-center p-4 rounded-lg bg-blue-50">
                  <h3 className="font-bold text-blue-800 mb-2">پشتیبانی</h3>
                  <p className="text-sm text-gray-600 mb-3">ثبت و پیگیری درخواست‌های پشتیبانی</p>
                  <Link href="/instructions/support" className="text-blue-600 hover:text-blue-800 font-medium">
                    درخواست پشتیبانی →
                  </Link>
                </div>
            </div>
          </section>

          {/* Partner Services Section */}
          <section id="partner-services" className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">خدمات همکاران</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 rounded-lg bg-green-50">
                <h3 className="font-bold text-green-800 mb-2">فروشنده شوید</h3>
                <p className="text-sm text-gray-600 mb-3">شروع فروش در ویپانا</p>
                <Link href="/instructions/seller" className="text-green-600 hover:text-green-800 font-medium">
                  درخواست فروشندگی →
                </Link>
              </div>
              <div className="text-center p-4 rounded-lg bg-green-50">
                <h3 className="font-bold text-green-800 mb-2">پنل فروشندگان</h3>
                <p className="text-sm text-gray-600 mb-3">مدیریت فروشگاه و محصولات</p>
                <Link href="/instructions/features" className="text-green-600 hover:text-green-800 font-medium">
                  ورود به پنل →
                </Link>
              </div>
              <div className="text-center p-4 rounded-lg bg-green-50">
                <h3 className="font-bold text-green-800 mb-2">لغو قرارداد</h3>
                <p className="text-sm text-gray-600 mb-3">شرایط و نحوه لغو همکاری</p>
                <Link href="/instructions/cancellation" className="text-green-600 hover:text-green-800 font-medium">
                  راهنمای لغو →
                </Link>
              </div>
            </div>
          </section>

          {/* Shopping Guide Section */}
          <section id="shopping-guide" className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">راهنمای خرید</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 rounded-lg bg-orange-50">
                <h3 className="font-bold text-orange-800 mb-2">نحوه ثبت سفارش</h3>
                <p className="text-sm text-gray-600 mb-3">مراحل کامل خرید از ویپانا</p>
                <Link href="/instructions/shopping" className="text-orange-600 hover:text-orange-800 font-medium">
                  راهنمای خرید →
                </Link>
              </div>
              <div className="text-center p-4 rounded-lg bg-orange-50">
                <h3 className="font-bold text-orange-800 mb-2">رویه های ارسال کالا</h3>
                <p className="text-sm text-gray-600 mb-3">زمان و نحوه ارسال سفارشات</p>
                <Link href="/instructions/shipping" className="text-orange-600 hover:text-orange-800 font-medium">
                  اطلاعات ارسال →
                </Link>
              </div>
              <div className="text-center p-4 rounded-lg bg-orange-50">
                <h3 className="font-bold text-orange-800 mb-2">شیوه های پرداخت</h3>
                <p className="text-sm text-gray-600 mb-3">روش‌های مختلف پرداخت</p>
                <Link href="/instructions/payment" className="text-orange-600 hover:text-orange-800 font-medium">
                  روش‌های پرداخت →
                </Link>
              </div>
            </div>
          </section>
        </div>

        {/* Back to Top Button */}
        <div className="text-center mt-12">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            بازگشت به بالا
          </button>
        </div>
      </div>
    </div>
  );
}
