'use client';
import React, { useState } from 'react';
import Link from 'next/link';

export default function SupportInstructionsPage() {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'پشتیبانی عمومی', icon: '📞' },
    { id: 'technical', label: 'مشکلات فنی', icon: '🔧' },
    { id: 'orders', label: 'مشکلات سفارش', icon: '📦' },
    { id: 'payment', label: 'مشکلات پرداخت', icon: '💳' },
    { id: 'disclaimer', label: 'نکات مهم', icon: '⚠️' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">پشتیبانی ویپانا</h1>
          <p className="text-gray-600">ثبت و پیگیری درخواست‌های پشتیبانی</p>
        </div>

        {/* Important Disclaimer */}
        <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6 mb-8">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="mr-3">
              <h3 className="text-lg font-bold text-red-800 mb-2">نکته مهم و ضروری</h3>
              <p className="text-red-700 text-sm leading-relaxed">
                <strong>تمام مکالمات، پیام‌ها و ارتباطات بین فروشندگان و خریداران خارج از حوزه مسئولیت ویپانا می‌باشد.</strong> 
                این پلتفرم صرفاً به عنوان واسط برای تسهیل معاملات عمل می‌کند و مسئولیتی در قبال محتوای پیام‌های رد و بدل شده بین طرفین ندارد. 
                در صورت بروز اختلاف یا مشکل در ارتباطات مستقیم، کاربران موظف هستند از طریق مراجع قانونی مربوطه اقدام نمایند.
              </p>
            </div>
          </div>
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
                    ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
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
          {/* General Support Section */}
          {activeTab === 'general' && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">📞 پشتیبانی عمومی</h2>
                <p className="text-gray-600">راه‌های ارتباطی و خدمات پشتیبانی عمومی</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="p-6 rounded-lg bg-green-50 border-r-4 border-green-500">
                    <h3 className="font-bold text-green-800 mb-3">اطلاعات تماس</h3>
                    <div className="space-y-3">
                      <div className="bg-white p-3 rounded-lg">
                        <span className="font-medium text-gray-800">شماره تماس اصلی:</span>
                        <p className="text-sm text-gray-600">۰۲۱-۱۲۳۴۵۶۷۸ (شنبه تا چهارشنبه، ۸ صبح تا ۶ عصر)</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <span className="font-medium text-gray-800">ایمیل پشتیبانی:</span>
                        <p className="text-sm text-gray-600">support@vipana.com (پاسخ در کمتر از ۲۴ ساعت)</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <span className="font-medium text-gray-800">چت آنلاین:</span>
                        <p className="text-sm text-gray-600">۲۴ ساعته در تمام روزهای هفته</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-lg bg-blue-50 border-r-4 border-blue-500">
                    <h3 className="font-bold text-blue-800 mb-3">ساعات کاری</h3>
                    <ul className="text-blue-700 space-y-2 text-sm">
                      <li>• شنبه تا چهارشنبه: ۸ صبح تا ۶ عصر (پشتیبانی تلفنی)</li>
                      <li>• پنجشنبه: ۸ صبح تا ۲ عصر (پشتیبانی تلفنی)</li>
                      <li>• جمعه: تعطیل (فقط چت آنلاین فعال)</li>
                      <li>• روزهای تعطیل رسمی: تعطیل (فقط چت آنلاین فعال)</li>
                      <li>• چت آنلاین: ۲۴ ساعته در تمام روزهای هفته</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-6 rounded-lg bg-purple-50 border-r-4 border-purple-500">
                    <h3 className="font-bold text-purple-800 mb-3">نحوه ثبت درخواست</h3>
                    <ol className="text-purple-700 space-y-2 text-sm list-decimal list-inside">
                      <li>کاربر موظف است به بخش "پشتیبانی" در پنل کاربری مراجعه نماید</li>
                      <li>نوع مشکل خود را از دسته‌بندی‌های موجود انتخاب کند</li>
                      <li>فرم درخواست پشتیبانی را با دقت تکمیل نموده و شرح کامل مشکل را ارائه دهد</li>
                      <li>در صورت نیاز، تصاویر یا فایل‌های مربوطه را ضمیمه نماید</li>
                      <li>درخواست را ثبت کرده و کد پیگیری دریافت نماید</li>
                    </ol>
                  </div>

                  <div className="p-6 rounded-lg bg-orange-50 border-r-4 border-orange-500">
                    <h3 className="font-bold text-orange-800 mb-3">اطلاعات مورد نیاز</h3>
                    <ul className="text-orange-700 space-y-2 text-sm">
                      <li>• نام و نام خانوادگی کامل کاربر</li>
                      <li>• شماره موبایل ثبت شده در حساب کاربری</li>
                      <li>• شماره سفارش (در صورت مرتبط بودن)</li>
                      <li>• شرح دقیق و کامل مشکل</li>
                      <li>• تصاویر یا فایل‌های مربوطه (در صورت نیاز)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Technical Issues Section */}
          {activeTab === 'technical' && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">🔧 مشکلات فنی</h2>
                <p className="text-gray-600">راه‌حل مشکلات فنی و تکنیکی</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="p-6 rounded-lg bg-red-50 border-r-4 border-red-500">
                    <h3 className="font-bold text-red-800 mb-3">مشکلات ورود و حساب کاربری</h3>
                    <ul className="text-red-700 space-y-2 text-sm">
                      <li>• فراموشی رمز عبور و عدم امکان بازیابی</li>
                      <li>• قفل شدن حساب کاربری به دلیل ورودهای ناموفق</li>
                      <li>• عدم دریافت کد تایید در زمان ورود</li>
                      <li>• مشکل در تایید دو مرحله‌ای</li>
                      <li>• عدم دسترسی به حساب کاربری</li>
                    </ul>
                  </div>

                  <div className="p-6 rounded-lg bg-blue-50 border-r-4 border-blue-500">
                    <h3 className="font-bold text-blue-800 mb-3">مشکلات سایت و اپلیکیشن</h3>
                    <ul className="text-blue-700 space-y-2 text-sm">
                      <li>• عدم بارگذاری صفحات یا کندی سایت</li>
                      <li>• خطاهای سیستمی و پیام‌های خطا</li>
                      <li>• مشکل در جستجو و فیلتر محصولات</li>
                      <li>• عدم عملکرد صحیح سبد خرید</li>
                      <li>• مشکل در آپلود تصاویر یا فایل‌ها</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-6 rounded-lg bg-green-50 border-r-4 border-green-500">
                    <h3 className="font-bold text-green-800 mb-3">راه‌حل‌های اولیه</h3>
                    <ul className="text-green-700 space-y-2 text-sm">
                      <li>• پاک کردن کش مرورگر و کوکی‌ها</li>
                      <li>• استفاده از مرورگرهای مختلف (Chrome، Firefox، Safari)</li>
                      <li>• بررسی اتصال اینترنت و سرعت آن</li>
                      <li>• غیرفعال کردن موقت افزونه‌های مرورگر</li>
                      <li>• به‌روزرسانی مرورگر به آخرین نسخه</li>
                    </ul>
                  </div>

                  <div className="p-6 rounded-lg bg-purple-50 border-r-4 border-purple-500">
                    <h3 className="font-bold text-purple-800 mb-3">مشکلات اپلیکیشن موبایل</h3>
                    <ul className="text-purple-700 space-y-2 text-sm">
                      <li>• عدم نصب یا اجرای اپلیکیشن</li>
                      <li>• کندی یا هنگ کردن اپلیکیشن</li>
                      <li>• عدم دریافت اعلان‌ها</li>
                      <li>• مشکل در ورود با اثر انگشت یا Face ID</li>
                      <li>• عدم همگام‌سازی اطلاعات</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Order Issues Section */}
          {activeTab === 'orders' && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">📦 مشکلات سفارش</h2>
                <p className="text-gray-600">راه‌حل مشکلات مربوط به سفارشات</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="p-6 rounded-lg bg-orange-50 border-r-4 border-orange-500">
                    <h3 className="font-bold text-orange-800 mb-3">مشکلات ثبت سفارش</h3>
                    <ul className="text-orange-700 space-y-2 text-sm">
                      <li>• عدم امکان افزودن محصول به سبد خرید</li>
                      <li>• خطا در محاسبه قیمت نهایی</li>
                      <li>• مشکل در انتخاب آدرس ارسال</li>
                      <li>• عدم نمایش کدهای تخفیف</li>
                      <li>• خطا در نهایی کردن سفارش</li>
                    </ul>
                  </div>

                  <div className="p-6 rounded-lg bg-red-50 border-r-4 border-red-500">
                    <h3 className="font-bold text-red-800 mb-3">مشکلات ارسال و تحویل</h3>
                    <ul className="text-red-700 space-y-2 text-sm">
                      <li>• تاخیر در ارسال سفارش</li>
                      <li>• عدم دریافت کد پیگیری</li>
                      <li>• مشکل در پیگیری وضعیت سفارش</li>
                      <li>• عدم تحویل در زمان مقرر</li>
                      <li>• آسیب دیدن بسته در حین ارسال</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-6 rounded-lg bg-blue-50 border-r-4 border-blue-500">
                    <h3 className="font-bold text-blue-800 mb-3">مشکلات کیفیت کالا</h3>
                    <ul className="text-blue-700 space-y-2 text-sm">
                      <li>• عدم تطابق کالای دریافتی با سفارش</li>
                      <li>• معیوب بودن کالای دریافتی</li>
                      <li>• عدم کامل بودن قطعات و لوازم جانبی</li>
                      <li>• انقضای تاریخ مصرف (برای کالاهای خوراکی)</li>
                      <li>• عدم کیفیت مناسب بسته‌بندی</li>
                    </ul>
                  </div>

                  <div className="p-6 rounded-lg bg-green-50 border-r-4 border-green-500">
                    <h3 className="font-bold text-green-800 mb-3">نکات مهم سفارش</h3>
                    <ul className="text-green-700 space-y-2 text-sm">
                      <li>• کاربر موظف است قبل از ثبت سفارش، اطلاعات محصول را به دقت بررسی نماید</li>
                      <li>• در صورت بروز مشکل، کاربر موظف است فوراً با پشتیبانی تماس گیرد</li>
                      <li>• تصاویر واضح از مشکل برای بررسی دقیق‌تر الزامی است</li>
                      <li>• حفظ فاکتور خرید و رسید پرداخت برای پیگیری ضروری است</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment Issues Section */}
          {activeTab === 'payment' && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">💳 مشکلات پرداخت</h2>
                <p className="text-gray-600">راه‌حل مشکلات مربوط به پرداخت و تراکنش‌های مالی</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="p-6 rounded-lg bg-red-50 border-r-4 border-red-500">
                    <h3 className="font-bold text-red-800 mb-3">مشکلات تراکنش</h3>
                    <ul className="text-red-700 space-y-2 text-sm">
                      <li>• عدم موفقیت در پرداخت آنلاین</li>
                      <li>• کسر مبلغ از حساب بدون ثبت سفارش</li>
                      <li>• عدم بازگشت مبلغ در صورت لغو سفارش</li>
                      <li>• خطا در محاسبه مالیات و هزینه ارسال</li>
                      <li>• مشکل در استفاده از کدهای تخفیف</li>
                    </ul>
                  </div>

                  <div className="p-6 rounded-lg bg-blue-50 border-r-4 border-blue-500">
                    <h3 className="font-bold text-blue-800 mb-3">مشکلات کارت بانکی</h3>
                    <ul className="text-blue-700 space-y-2 text-sm">
                      <li>• عدم پذیرش کارت بانکی</li>
                      <li>• خطا در وارد کردن اطلاعات کارت</li>
                      <li>• عدم دریافت پیامک تایید</li>
                      <li>• مشکل در احراز هویت 3D Secure</li>
                      <li>• محدودیت مبلغ تراکنش</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-6 rounded-lg bg-green-50 border-r-4 border-green-500">
                    <h3 className="font-bold text-green-800 mb-3">راه‌حل‌های پرداخت</h3>
                    <ul className="text-green-700 space-y-2 text-sm">
                      <li>• بررسی موجودی کافی در حساب بانکی</li>
                      <li>• فعال بودن سرویس پرداخت آنلاین کارت</li>
                      <li>• استفاده از مرورگرهای مختلف</li>
                      <li>• تماس با بانک صادرکننده کارت</li>
                      <li>• استفاده از درگاه‌های پرداخت مختلف</li>
                    </ul>
                  </div>

                  <div className="p-6 rounded-lg bg-purple-50 border-r-4 border-purple-500">
                    <h3 className="font-bold text-purple-800 mb-3">بازپرداخت و استرداد</h3>
                    <ul className="text-purple-700 space-y-2 text-sm">
                      <li>• بازپرداخت خودکار در صورت عدم موفقیت تراکنش</li>
                      <li>• بازپرداخت دستی در صورت نیاز (۳ تا ۷ روز کاری)</li>
                      <li>• ارسال اعلان بازپرداخت به کاربر</li>
                      <li>• امکان پیگیری وضعیت بازپرداخت</li>
                      <li>• بازپرداخت به همان کارت استفاده شده</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Disclaimer Section */}
          {activeTab === 'disclaimer' && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">⚠️ نکات مهم و محدودیت‌ها</h2>
                <p className="text-gray-600">محدودیت‌های مسئولیت و نکات مهم پشتیبانی</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="p-6 rounded-lg bg-red-50 border-r-4 border-red-500">
                    <h3 className="font-bold text-red-800 mb-3">محدودیت‌های مسئولیت</h3>
                    <ul className="text-red-700 space-y-2 text-sm">
                      <li>• <strong>مکالمات بین فروشندگان و خریداران:</strong> ویپانا مسئولیتی در قبال محتوای پیام‌های رد و بدل شده بین طرفین ندارد</li>
                      <li>• <strong>کیفیت کالاهای فروشندگان:</strong> مسئولیت کیفیت کالاها بر عهده فروشندگان است</li>
                      <li>• <strong>تاخیرهای غیرقابل پیش‌بینی:</strong> در صورت بروز بلایای طبیعی یا مشکلات زیرساختی</li>
                      <li>• <strong>استفاده نادرست از خدمات:</strong> در صورت نقض قوانین و مقررات سایت</li>
                      <li>• <strong>مشکلات شخص ثالث:</strong> مشکلات مربوط به بانک‌ها، ادارات پست و سایر سرویس‌ها</li>
                    </ul>
                  </div>

                  <div className="p-6 rounded-lg bg-orange-50 border-r-4 border-orange-500">
                    <h3 className="font-bold text-orange-800 mb-3">نکات مهم ارتباطی</h3>
                    <ul className="text-orange-700 space-y-2 text-sm">
                      <li>• کاربر موظف است اطلاعات صحیح و کامل ارائه دهد</li>
                      <li>• در صورت عدم پاسخگویی، پیام صوتی ثبت خواهد شد</li>
                      <li>• برای پیگیری سریع‌تر، استفاده از چت آنلاین توصیه می‌شود</li>
                      <li>• در صورت بروز مشکل فنی، از طریق ایمیل اقدام به ثبت درخواست نماید</li>
                      <li>• حفظ کد پیگیری برای پیگیری‌های بعدی الزامی است</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-6 rounded-lg bg-blue-50 border-r-4 border-blue-500">
                    <h3 className="font-bold text-blue-800 mb-3">زمان‌بندی پاسخگویی</h3>
                    <ul className="text-blue-700 space-y-2 text-sm">
                      <li>• درخواست‌های فوری: حداکثر ۲ ساعت (چت آنلاین)</li>
                      <li>• درخواست‌های عادی: حداکثر ۲۴ ساعت</li>
                      <li>• درخواست‌های پیچیده: حداکثر ۷۲ ساعت</li>
                      <li>• درخواست‌های فنی: حداکثر ۵ روز کاری</li>
                      <li>• درخواست‌های حقوقی: حداکثر ۱۰ روز کاری</li>
                    </ul>
                  </div>

                  <div className="p-6 rounded-lg bg-green-50 border-r-4 border-green-500">
                    <h3 className="font-bold text-green-800 mb-3">نحوه پیگیری</h3>
                    <ul className="text-green-700 space-y-2 text-sm">
                      <li>• استفاده از کد پیگیری در پنل کاربری</li>
                      <li>• تماس با پشتیبانی و ارائه کد پیگیری</li>
                      <li>• پیگیری از طریق ایمیل با ذکر کد پیگیری</li>
                      <li>• استفاده از چت آنلاین برای پیگیری سریع</li>
                      <li>• بررسی وضعیت در بخش "درخواست‌های من"</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Important Notice */}
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div className="mr-3">
                    <h3 className="text-lg font-bold text-yellow-800 mb-2">تذکر مهم</h3>
                    <p className="text-yellow-700 text-sm leading-relaxed">
                      <strong>ویپانا به عنوان یک پلتفرم واسط عمل می‌کند و مسئولیتی در قبال محتوای پیام‌ها، کیفیت کالاهای فروشندگان، 
                      و ارتباطات مستقیم بین طرفین ندارد.</strong> در صورت بروز اختلاف، کاربران موظف هستند از طریق مراجع قانونی مربوطه اقدام نمایند.
                    </p>
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
