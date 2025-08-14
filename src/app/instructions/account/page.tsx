'use client';
import React, { useState } from 'react';
import Link from 'next/link';

export default function AccountInstructionsPage() {
  const [activeTab, setActiveTab] = useState('registration');

  const tabs = [
    { id: 'registration', label: 'ثبت نام', icon: '📝' },
    { id: 'login', label: 'ورود', icon: '🔑' },
    { id: 'profile', label: 'پروفایل', icon: '👤' },
    { id: 'privacy', label: 'حریم خصوصی', icon: '🔒' },
    { id: 'security', label: 'امنیت', icon: '🛡️' },
    { id: 'troubleshooting', label: 'رفع مشکل', icon: '🔧' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">راهنمای حساب کاربری</h1>
          <p className="text-gray-600">تمام اطلاعات مورد نیاز برای مدیریت حساب کاربری شما</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-wrap justify-center gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="ml-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Sections */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Registration Section */}
          {activeTab === 'registration' && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">📝 ثبت نام در ویپانا</h2>
                <p className="text-gray-600">مراحل کامل ثبت نام و ایجاد حساب کاربری</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="p-6 rounded-lg bg-blue-50 border-r-4 border-blue-500">
                    <h3 className="font-bold text-blue-800 mb-3">مرحله ۱: ورود به صفحه ثبت نام</h3>
                                         <ul className="text-blue-700 space-y-2 text-sm">
                       <li>• کاربر می‌بایست روی دکمه "ثبت نام" در منوی اصلی کلیک نماید</li>
                       <li>• یا مستقیماً به آدرس <code className="bg-blue-100 px-2 py-1 rounded">/auth/register</code> مراجعه کند</li>
                       <li>• فرم ثبت نام به صورت خودکار برای کاربر نمایش داده خواهد شد</li>
                     </ul>
                  </div>

                  <div className="p-6 rounded-lg bg-green-50 border-r-4 border-green-500">
                    <h3 className="font-bold text-green-800 mb-3">مرحله ۲: تکمیل اطلاعات</h3>
                                         <ul className="text-green-700 space-y-2 text-sm">
                       <li>• کاربر موظف است نام و نام خانوادگی کامل خود را به صورت صحیح وارد نماید</li>
                       <li>• شماره موبایل معتبر و فعال خود را در فیلد مربوطه ثبت کند</li>
                       <li>• رمز عبور قوی و امن مطابق با استانداردهای امنیتی انتخاب نماید</li>
                       <li>• کد تایید ارسال شده به شماره موبایل را در فیلد مربوطه وارد کند</li>
                     </ul>
                  </div>

                  <div className="p-6 rounded-lg bg-purple-50 border-r-4 border-purple-500">
                    <h3 className="font-bold text-purple-800 mb-3">مرحله ۳: تایید حساب</h3>
                                         <ul className="text-purple-700 space-y-2 text-sm">
                       <li>• کد تایید به صورت خودکار از طریق پیامک به شماره موبایل ثبت شده ارسال خواهد شد</li>
                       <li>• کاربر می‌بایست کد دریافتی را در فیلد مربوطه وارد نماید</li>
                       <li>• پس از وارد کردن کد، روی دکمه "تایید" کلیک کند</li>
                       <li>• پس از تایید موفق، حساب کاربری به صورت خودکار فعال خواهد شد</li>
                     </ul>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-6 rounded-lg bg-orange-50 border-r-4 border-orange-500">
                    <h3 className="font-bold text-orange-800 mb-3">نکات مهم ثبت نام</h3>
                                         <ul className="text-orange-700 space-y-2 text-sm">
                       <li>• شماره موبایل ارائه شده می‌بایست معتبر، فعال و در دسترس کاربر باشد</li>
                       <li>• رمز عبور انتخابی حداقل ۸ کاراکتر و مطابق با استانداردهای امنیتی باشد</li>
                       <li>• کاربر موظف است از ترکیب حروف، اعداد و نمادهای خاص استفاده نماید</li>
                       <li>• تمامی اطلاعات شخصی ارائه شده می‌بایست صحیح، کامل و به‌روز باشد</li>
                     </ul>
                  </div>

                  <div className="p-6 rounded-lg bg-red-50 border-r-4 border-red-500">
                    <h3 className="font-bold text-red-800 mb-3">مشکلات رایج</h3>
                                         <ul className="text-red-700 space-y-2 text-sm">
                       <li>• شماره موبایل ارائه شده قبلاً در سیستم ثبت شده و قابل استفاده نمی‌باشد</li>
                       <li>• کد تایید ارسال شده منقضی شده و نیاز به درخواست مجدد دارد</li>
                       <li>• رمز عبور انتخابی ضعیف بوده و مطابق با استانداردهای امنیتی نمی‌باشد</li>
                       <li>• در صورت بروز مشکل در ارسال پیامک، کاربر می‌تواند درخواست ارسال مجدد نماید</li>
                     </ul>
                  </div>

                  
                </div>
              </div>
            </div>
          )}

          {/* Login Section */}
          {activeTab === 'login' && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">🔑 ورود به حساب کاربری</h2>
                <p className="text-gray-600">نحوه ورود امن و سریع به حساب کاربری</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="p-6 rounded-lg bg-blue-50 border-r-4 border-blue-500">
                    <h3 className="font-bold text-blue-800 mb-3">روش‌های ورود</h3>
                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded-lg">
                                                 <h4 className="font-bold text-gray-800 mb-2">۱. ورود با شماره موبایل</h4>
                         <p className="text-sm text-gray-600">کاربر می‌بایست شماره موبایل و رمز عبور ثبت شده خود را وارد نماید</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg">
                                                 <h4 className="font-bold text-gray-800 mb-2">۲. ورود با کد تایید</h4>
                         <p className="text-sm text-gray-600">کاربر می‌تواند کد تایید ارسال شده به شماره موبایل خود را وارد نماید</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-lg bg-green-50 border-r-4 border-green-500">
                    <h3 className="font-bold text-green-800 mb-3">مراحل ورود</h3>
                                         <ol className="text-green-700 space-y-2 text-sm list-decimal list-inside">
                       <li>کاربر می‌بایست به صفحه ورود مراجعه نماید</li>
                       <li>شماره موبایل ثبت شده خود را در فیلد مربوطه وارد کند</li>
                       <li>رمز عبور انتخاب شده را در فیلد مربوطه وارد نماید</li>
                       <li>روی دکمه "ورود" کلیک کند تا فرآیند احراز هویت آغاز شود</li>
                       <li>در صورت فعال بودن تایید دو مرحله‌ای، کد تایید ارسال شده را وارد کند</li>
                     </ol>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-6 rounded-lg bg-purple-50 border-r-4 border-purple-500">
                    <h3 className="font-bold text-purple-800 mb-3">امنیت ورود</h3>
                                         <ul className="text-purple-700 space-y-2 text-sm">
                       <li>• کاربر موظف است رمز عبور خود را محرمانه نگه داشته و در اختیار هیچ شخص دیگری قرار ندهد</li>
                       <li>• استفاده از مرورگرهای امن و به‌روزرسانی شده برای حفظ امنیت حساب کاربری الزامی است</li>
                       <li>• در مکان‌های عمومی و شبکه‌های ناامن، کاربر می‌بایست احتیاط لازم را رعایت نماید</li>
                       <li>• گزینه "مرا به خاطر بسپار" می‌بایست با احتیاط و تنها در دستگاه‌های شخصی استفاده شود</li>
                     </ul>
                  </div>

                  <div className="p-6 rounded-lg bg-orange-50 border-r-4 border-orange-500">
                    <h3 className="font-bold text-orange-800 mb-3">فراموشی رمز عبور</h3>
                                         <ul className="text-orange-700 space-y-2 text-sm">
                       <li>• کاربر می‌بایست روی گزینه "فراموشی رمز عبور" کلیک نماید</li>
                       <li>• شماره موبایل ثبت شده در حساب کاربری خود را وارد کند</li>
                       <li>• کد تایید ارسال شده به شماره موبایل را در فیلد مربوطه وارد نماید</li>
                       <li>• رمز عبور جدید و امن مطابق با استانداردهای امنیتی انتخاب کند</li>
                     </ul>
                  </div>

                  
                </div>
              </div>
            </div>
          )}

          {/* Profile Section */}
          {activeTab === 'profile' && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">👤 مدیریت پروفایل</h2>
                <p className="text-gray-600">نحوه ویرایش و مدیریت اطلاعات پروفایل</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="p-6 rounded-lg bg-blue-50 border-r-4 border-blue-500">
                    <h3 className="font-bold text-blue-800 mb-3">اطلاعات شخصی</h3>
                    <div className="space-y-3">
                      <div className="bg-white p-3 rounded-lg">
                                                 <span className="font-medium text-gray-800">نام و نام خانوادگی:</span>
                         <p className="text-sm text-gray-600">اطلاعات هویتی رسمی کاربر که می‌بایست مطابق با مدارک شناسایی باشد</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                                                 <span className="font-medium text-gray-800">شماره موبایل:</span>
                         <p className="text-sm text-gray-600">شماره تماس رسمی برای ارتباطات و تاییدات امنیتی حساب کاربری</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                                                 <span className="font-medium text-gray-800">ایمیل:</span>
                         <p className="text-sm text-gray-600">آدرس الکترونیکی رسمی برای دریافت اخبار، اطلاعیه‌ها و مکاتبات رسمی</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-lg bg-green-50 border-r-4 border-green-500">
                    <h3 className="font-bold text-green-800 mb-3">تنظیمات پروفایل</h3>
                                         <ul className="text-green-700 space-y-2 text-sm">
                       <li>• کاربر می‌تواند عکس پروفایل خود را مطابق با قوانین و مقررات تغییر دهد</li>
                       <li>• ویرایش و به‌روزرسانی اطلاعات شخصی مطابق با قوانین حاکم بر حریم خصوصی</li>
                       <li>• تنظیم زبان و منطقه زمانی مطابق با ترجیحات شخصی کاربر</li>
                       <li>• مدیریت اعلان‌ها و تنظیمات ارتباطی مطابق با نیازهای کاربر</li>
                       <li>• تنظیمات حریم خصوصی و کنترل دسترسی‌های شخصی</li>
                     </ul>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-6 rounded-lg bg-purple-50 border-r-4 border-purple-500">
                    <h3 className="font-bold text-purple-800 mb-3">آدرس‌های ثبت شده</h3>
                                         <ul className="text-purple-700 space-y-2 text-sm">
                       <li>• کاربر می‌تواند آدرس‌های جدید را مطابق با استانداردهای پستی اضافه نماید</li>
                       <li>• ویرایش و به‌روزرسانی آدرس‌های موجود در صورت تغییر اطلاعات</li>
                       <li>• تعیین آدرس پیش‌فرض برای ارسال و دریافت کالا و خدمات</li>
                       <li>• حذف آدرس‌های غیرضروری و غیرفعال از لیست آدرس‌های ثبت شده</li>
                     </ul>
                  </div>

                  <div className="p-6 rounded-lg bg-orange-50 border-r-4 border-orange-500">
                    <h3 className="font-bold text-orange-800 mb-3">تاریخچه فعالیت</h3>
                                         <ul className="text-orange-700 space-y-2 text-sm">
                       <li>• مشاهده و پیگیری تاریخچه کامل سفارشات گذشته و وضعیت آنها</li>
                       <li>• مدیریت لیست علاقه‌مندی‌ها و محصولات مورد نظر کاربر</li>
                       <li>• ثبت و مدیریت نظرات، امتیازات و بازخوردهای ارائه شده</li>
                       <li>• مشاهده فعالیت‌های اخیر و تاریخچه استفاده از خدمات</li>
                     </ul>
                  </div>

                  
                </div>
              </div>
            </div>
          )}

          {/* Privacy Section */}
          {activeTab === 'privacy' && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">🔒 حریم خصوصی</h2>
                <p className="text-gray-600">نحوه محافظت از اطلاعات شخصی شما</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="p-6 rounded-lg bg-blue-50 border-r-4 border-blue-500">
                    <h3 className="font-bold text-blue-800 mb-3">تنظیمات حریم خصوصی</h3>
                    <div className="space-y-3">
                      <div className="bg-white p-3 rounded-lg">
                                                 <span className="font-medium text-gray-800">نمایش پروفایل:</span>
                         <p className="text-sm text-gray-600">کنترل کامل نمایش اطلاعات شخصی و تعیین سطح دسترسی سایر کاربران</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                                                 <span className="font-medium text-gray-800">اشتراک‌گذاری اطلاعات:</span>
                         <p className="text-sm text-gray-600">مدیریت کامل دسترسی سایر کاربران و کنترل اشتراک‌گذاری اطلاعات شخصی</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                                                 <span className="font-medium text-gray-800">اعلان‌ها:</span>
                         <p className="text-sm text-gray-600">کنترل کامل پیام‌های دریافتی و تنظیمات اعلان‌های سیستم</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-lg bg-green-50 border-r-4 border-green-500">
                    <h3 className="font-bold text-green-800 mb-3">محافظت از اطلاعات</h3>
                                         <ul className="text-green-700 space-y-2 text-sm">
                       <li>• تمامی اطلاعات شخصی کاربران به صورت کامل رمزگذاری و محافظت می‌شود</li>
                       <li>• دسترسی به داده‌های شخصی به صورت محدود و کنترل شده انجام می‌شود</li>
                       <li>• اطلاعات غیرضروری و منقضی شده به صورت خودکار حذف می‌شود</li>
                       <li>• کنترل کامل دسترسی‌های شخص ثالث و مدیریت مجوزهای دسترسی</li>
                     </ul>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-6 rounded-lg bg-purple-50 border-r-4 border-purple-500">
                    <h3 className="font-bold text-purple-800 mb-3">حقوق کاربری</h3>
                                         <ul className="text-purple-700 space-y-2 text-sm">
                       <li>• کاربر حق دسترسی کامل به تمامی اطلاعات شخصی خود را دارد</li>
                       <li>• امکان درخواست حذف کامل اطلاعات شخصی مطابق با قوانین حاکم</li>
                       <li>• حق محدود کردن پردازش داده‌ها و کنترل نحوه استفاده از اطلاعات</li>
                       <li>• امکان انتقال اطلاعات شخصی به سرویس‌های دیگر در صورت نیاز</li>
                     </ul>
                  </div>

                  <div className="p-6 rounded-lg bg-red-50 border-r-4 border-red-500">
                    <h3 className="font-bold text-red-800 mb-3">نکات امنیتی</h3>
                                         <ul className="text-red-700 space-y-2 text-sm">
                       <li>• کاربر موظف است رمز عبور قوی و امن مطابق با استانداردهای امنیتی انتخاب نماید</li>
                       <li>• اطلاعات شخصی و محرمانه به هیچ عنوان نباید با سایرین به اشتراک گذاشته شود</li>
                       <li>• کاربر می‌بایست مراقب حملات فیشینگ و کلاهبرداری‌های اینترنتی باشد</li>
                       <li>• تغییر منظم رمز عبور برای حفظ امنیت حساب کاربری الزامی است</li>
                     </ul>
                  </div>

                  
                </div>
              </div>
            </div>
          )}

          {/* Security Section */}
          {activeTab === 'security' && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">🛡️ امنیت حساب</h2>
                <p className="text-gray-600">راه‌های محافظت از حساب کاربری</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="p-6 rounded-lg bg-blue-50 border-r-4 border-blue-500">
                    <h3 className="font-bold text-blue-800 mb-3">رمز عبور قوی</h3>
                                         <ul className="text-blue-700 space-y-2 text-sm">
                       <li>• رمز عبور می‌بایست حداقل ۸ کاراکتر و ترجیحاً بیشتر باشد</li>
                       <li>• ترکیب حروف بزرگ و کوچک برای افزایش امنیت الزامی است</li>
                       <li>• استفاده از اعداد و نمادهای خاص برای تقویت رمز عبور ضروری است</li>
                       <li>• عدم استفاده از اطلاعات شخصی مانند تاریخ تولد یا شماره موبایل</li>
                       <li>• تغییر منظم رمز عبور هر ۳ تا ۶ ماه برای حفظ امنیت توصیه می‌شود</li>
                     </ul>
                  </div>

                  <div className="p-6 rounded-lg bg-green-50 border-r-4 border-green-500">
                    <h3 className="font-bold text-green-800 mb-3">تایید دو مرحله‌ای</h3>
                                         <ul className="text-green-700 space-y-2 text-sm">
                       <li>• فعال‌سازی احراز هویت دو مرحله‌ای برای افزایش امنیت حساب کاربری الزامی است</li>
                       <li>• دریافت کد تایید از طریق پیامک به شماره موبایل ثبت شده</li>
                       <li>• استفاده از اپلیکیشن‌های احراز هویت مانند Google Authenticator برای امنیت بیشتر</li>
                       <li>• نگهداری کدهای پشتیبان در مکان امن برای مواقع اضطراری</li>
                     </ul>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-6 rounded-lg bg-purple-50 border-r-4 border-purple-500">
                    <h3 className="font-bold text-purple-800 mb-3">نشست‌های فعال</h3>
                                         <ul className="text-purple-700 space-y-2 text-sm">
                       <li>• مشاهده و کنترل تمامی دستگاه‌های متصل به حساب کاربری</li>
                       <li>• امکان خروج از همه دستگاه‌ها به صورت همزمان برای امنیت بیشتر</li>
                       <li>• حذف نشست‌های مشکوک و غیرمجاز از حساب کاربری</li>
                       <li>• محدود کردن دسترسی‌های غیرضروری و کنترل سطح دسترسی‌ها</li>
                     </ul>
                  </div>

                  <div className="p-6 rounded-lg bg-orange-50 border-r-4 border-orange-500">
                    <h3 className="font-bold text-orange-800 mb-3">هشدارهای امنیتی</h3>
                                         <ul className="text-orange-700 space-y-2 text-sm">
                       <li>• هشدار ورود از دستگاه جدید و ناشناس به حساب کاربری</li>
                       <li>• اطلاع‌رسانی تغییر رمز عبور و تأیید امنیتی</li>
                       <li>• هشدار تغییر اطلاعات شخصی و تأیید هویت کاربر</li>
                       <li>• تشخیص و هشدار فعالیت‌های مشکوک و غیرعادی در حساب کاربری</li>
                     </ul>
                  </div>

                  
                </div>
              </div>
            </div>
          )}

          {/* Troubleshooting Section */}
          {activeTab === 'troubleshooting' && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">🔧 رفع مشکلات رایج</h2>
                <p className="text-gray-600">راه‌حل مشکلات معمول حساب کاربری</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="p-6 rounded-lg bg-red-50 border-r-4 border-red-500">
                    <h3 className="font-bold text-red-800 mb-3">مشکلات ورود</h3>
                    <div className="space-y-3">
                      <div className="bg-white p-3 rounded-lg">
                        <h4 className="font-bold text-gray-800">رمز عبور اشتباه</h4>
                        <p className="text-sm text-gray-600">در صورت فراموشی یا اشتباه در وارد کردن رمز عبور، کاربر موظف است از دکمه "فراموشی رمز عبور" استفاده نموده و مراحل بازیابی رمز عبور را طبق دستورالعمل‌های ارائه شده دنبال نماید. این فرآیند شامل تأیید هویت از طریق شماره موبایل ثبت شده و دریافت کد تایید می‌باشد.</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <h4 className="font-bold text-gray-800">حساب مسدود شده</h4>
                        <p className="text-sm text-gray-600">در صورت مسدود شدن حساب کاربری به دلیل نقض قوانین و مقررات سایت، کاربر موظف است با تیم پشتیبانی تماس گرفته و مدارک لازم برای اثبات هویت و رفع مشکل را ارائه دهد. بررسی درخواست کاربر طبق قوانین و مقررات داخلی انجام خواهد شد.</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <h4 className="font-bold text-gray-800">کد تایید دریافت نشد</h4>
                        <p className="text-sm text-gray-600">در صورت عدم دریافت کد تایید، کاربر می‌تواند درخواست ارسال مجدد کد را ثبت نماید. این درخواست حداکثر سه بار در هر ساعت قابل انجام است. در صورت عدم موفقیت، کاربر موظف است با پشتیبانی تماس گرفته و مشکل را گزارش دهد.</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-lg bg-orange-50 border-r-4 border-orange-500">
                    <h3 className="font-bold text-orange-800 mb-3">مشکلات پروفایل</h3>
                    <ul className="text-orange-700 space-y-2 text-sm">
                      <li>• عدم ذخیره تغییرات: در صورت عدم ذخیره تغییرات پروفایل، کاربر موظف است ابتدا اتصال اینترنت خود را بررسی نموده و سپس مرورگر را به‌روزرسانی کند. در صورت تداوم مشکل، کاربر باید با پشتیبانی تماس گیرد.</li>
                      <li>• مشکل در آپلود عکس: کاربر موظف است فایل‌های تصویری را طبق استانداردهای تعیین شده (فرمت JPG یا PNG، حداکثر حجم 2 مگابایت) آپلود نماید. در صورت عدم رعایت این شرایط، آپلود با خطا مواجه خواهد شد.</li>
                      <li>• عدم نمایش اطلاعات: در صورت عدم نمایش صحیح اطلاعات پروفایل، کاربر موظف است کش مرورگر را پاک کرده و صفحه را مجدداً بارگذاری نماید. این مشکل معمولاً به دلیل ذخیره اطلاعات قدیمی در مرورگر رخ می‌دهد.</li>
                      <li>• خطا در ویرایش آدرس: کاربر موظف است تمام فیلدهای اجباری آدرس را تکمیل نموده و کد پستی معتبر وارد کند. در صورت عدم رعایت این موارد، سیستم اجازه ذخیره آدرس را نخواهد داد.</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-6 rounded-lg bg-blue-50 border-r-4 border-blue-500">
                    <h3 className="font-bold text-blue-800 mb-3">راه‌حل‌های عمومی</h3>
                    <ul className="text-blue-700 space-y-2 text-sm">
                      <li>• پاک کردن کش مرورگر: کاربر موظف است به صورت منظم کش مرورگر خود را پاک نموده تا از ذخیره اطلاعات قدیمی و منسوخ جلوگیری شود. این عمل باید طبق دستورالعمل‌های ارائه شده برای هر مرورگر انجام گیرد.</li>
                      <li>• استفاده از مرورگر دیگر: در صورت بروز مشکل در مرورگر فعلی، کاربر موظف است از مرورگرهای پشتیبانی شده (Chrome، Firefox، Safari، Edge) استفاده نموده و نسخه به‌روزرسانی شده آن‌ها را نصب کند.</li>
                      <li>• بررسی اتصال اینترنت: کاربر موظف است قبل از استفاده از خدمات، اتصال اینترنت خود را بررسی نموده و از پایداری آن اطمینان حاصل کند. سرعت اینترنت باید حداقل 1 مگابیت بر ثانیه باشد.</li>
                      <li>• غیرفعال کردن افزونه‌ها: کاربر موظف است افزونه‌های مرورگر که ممکن است با عملکرد سایت تداخل داشته باشند را موقتاً غیرفعال نموده و در صورت رفع مشکل، آن‌ها را به‌روزرسانی کند.</li>
                      <li>• به‌روزرسانی مرورگر: کاربر موظف است مرورگر خود را به آخرین نسخه به‌روزرسانی نموده تا از امنیت و عملکرد بهینه اطمینان حاصل کند. نسخه‌های قدیمی ممکن است با مشکلات امنیتی مواجه شوند.</li>
                    </ul>
                  </div>

                  <div className="p-6 rounded-lg bg-green-50 border-r-4 border-green-500">
                    <h3 className="font-bold text-green-800 mb-3">تماس با پشتیبانی</h3>
                    <ul className="text-green-700 space-y-2 text-sm">
                      <li>• شماره تماس: ۰۲۱-۱۲۳۴۵۶۷۸ - کاربر می‌تواند در ساعات کاری (شنبه تا چهارشنبه، 8 صبح تا 6 عصر) با تیم پشتیبانی تماس گرفته و مشکلات خود را مطرح نماید. در صورت عدم پاسخگویی، پیام صوتی ثبت خواهد شد.</li>
                      <li>• ایمیل: support@vipana.com - کاربر موظف است در ایمیل ارسالی، شماره کاربری، شرح کامل مشکل و تصاویر مربوطه را ضمیمه نموده تا بررسی دقیق‌تری انجام شود. پاسخ در کمتر از 24 ساعت ارسال خواهد شد.</li>
                      <li>• چت آنلاین در سایت: کاربر می‌تواند از طریق چت آنلاین موجود در سایت با پشتیبانی ارتباط برقرار نموده و در کمترین زمان ممکن پاسخ دریافت کند. این سرویس در تمام ساعات شبانه‌روز فعال می‌باشد.</li>
                      <li>• فرم تماس در بخش راهنما: کاربر موظف است فرم تماس موجود در بخش راهنما را با دقت تکمیل نموده و تمام اطلاعات درخواستی را ارائه دهد. این فرم شامل فیلدهای اجباری برای شناسایی دقیق مشکل می‌باشد.</li>
                    </ul>
                  </div>

                  
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Back to Instructions */}
        <div className="text-center mt-12">
          <Link 
            href="/instructions"
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            بازگشت به راهنما
          </Link>
        </div>
      </div>
    </div>
  );
}
