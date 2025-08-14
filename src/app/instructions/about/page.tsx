'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">درباره ویپانا</h1>
          <p className="text-gray-600">مرکز خرید و فروش مجازی در ایران</p>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Company Introduction */}
          <section className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">معرفی شرکت</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-gray-700 leading-relaxed mb-4">
                  ویپانا به عنوان یکی از پیشگامان تجارت الکترونیک در ایران، با هدف ارائه خدمات خرید و فروش آنلاین با کیفیت بالا تأسیس شده است. ما متعهد به ارائه تجربه‌ای امن، سریع و رضایت‌بخش برای مشتریان و فروشندگان خود هستیم.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  با بیش از ۵ سال تجربه در زمینه تجارت الکترونیک، ویپانا توانسته است به عنوان یکی از معتبرترین پلتفرم‌های خرید و فروش آنلاین در ایران شناخته شود.
                </p>
              </div>
              <div className="text-center">
                <div className="w-48 h-48 mx-auto bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-4xl font-bold text-purple-700">ویپانا</span>
                </div>
              </div>
            </div>
          </section>

          {/* Mission and Vision */}
          <section className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">ماموریت و چشم‌انداز</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="text-center p-6 bg-blue-50 rounded-lg">
                <h3 className="text-xl font-bold text-blue-800 mb-4">ماموریت ما</h3>
                <p className="text-gray-700">
                  ارائه پلتفرمی امن و کاربردی برای تسهیل خرید و فروش آنلاین، با تمرکز بر رضایت مشتری و کیفیت خدمات
                </p>
              </div>
              <div className="text-center p-6 bg-green-50 rounded-lg">
                <h3 className="text-xl font-bold text-green-800 mb-4">چشم‌انداز ما</h3>
                <p className="text-gray-700">
                  تبدیل شدن به برترین پلتفرم تجارت الکترونیک در ایران و منطقه، با ارائه خدمات نوآورانه و با کیفیت
                </p>
              </div>
            </div>
          </section>

          {/* Values */}
          <section className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">ارزش‌های ما</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-800 mb-2">اعتماد و امنیت</h3>
                <p className="text-sm text-gray-600">تضمین امنیت اطلاعات و معاملات کاربران</p>
              </div>
              <div className="text-center p-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-800 mb-2">کیفیت و سرعت</h3>
                <p className="text-sm text-gray-600">ارائه خدمات با کیفیت بالا و سرعت مناسب</p>
              </div>
              <div className="text-center p-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-800 mb-2">رضایت مشتری</h3>
                <p className="text-sm text-gray-600">اولویت قرار دادن رضایت و نیازهای مشتریان</p>
              </div>
            </div>
          </section>

          {/* Statistics */}
          <section className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">آمار و دستاوردها</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">۱۰۰,۰۰۰+</div>
                <div className="text-sm text-gray-600">مشتری راضی</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">۵,۰۰۰+</div>
                <div className="text-sm text-gray-600">فروشنده فعال</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">۵۰۰,۰۰۰+</div>
                <div className="text-sm text-gray-600">محصول متنوع</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">۹۹.۹%</div>
                <div className="text-sm text-gray-600">رضایت مشتری</div>
              </div>
            </div>
          </section>

          {/* Team */}
          <section className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">تیم ما</h2>
            <p className="text-gray-700 text-center mb-8">
              تیم ویپانا متشکل از متخصصان مجرب در زمینه‌های مختلف فناوری، تجارت الکترونیک و خدمات مشتریان است.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4">
                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-800 mb-2">تیم توسعه</h3>
                <p className="text-sm text-gray-600">متخصصان فناوری و برنامه‌نویسی</p>
              </div>
              <div className="text-center p-4">
                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-800 mb-2">پشتیبانی مشتریان</h3>
                <p className="text-sm text-gray-600">تیم متخصص خدمات مشتریان</p>
              </div>
              <div className="text-center p-4">
                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-800 mb-2">تیم تجاری</h3>
                <p className="text-sm text-gray-600">متخصصان بازاریابی و فروش</p>
              </div>
            </div>
          </section>

          {/* Contact Information */}
          <section className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">اطلاعات تماس</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold text-gray-800 mb-4">دفتر مرکزی</h3>
                <div className="space-y-2 text-gray-700">
                  <p>تهران، خیابان ولیعصر</p>
                  <p>پلاک ۱۲۳، طبقه ۴</p>
                  <p>کد پستی: ۱۲۳۴۵۶۷۸۹۰</p>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-4">راه‌های ارتباطی</h3>
                <div className="space-y-2 text-gray-700">
                  <p>تلفن: ۰۲۱-۱۲۳۴۵۶۷۸</p>
                  <p>ایمیل: info@vipana.ir</p>
                  <p>ساعات کاری: ۸ صبح تا ۸ شب</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Back to Instructions */}
        <div className="text-center mt-12">
          <Link 
            href="/instructions"
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-block"
          >
            بازگشت به راهنمای کامل
          </Link>
        </div>
      </div>
    </div>
  );
}

