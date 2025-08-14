import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 mt-12 pt-10 pb-4 px-2 md:px-0 text-gray-700 text-sm">
      <div className="max-w-7xl mx-auto">
        {/* Top Sections */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-10 border-b border-gray-200">
          {/* Quick Access */}
          <div className="col-span-1">
            <h3 className="font-bold text-lg mb-2 text-center md:text-right">دسترسی سریع</h3>
                         <ul className="space-y-2 text-center md:text-right">
               <li><Link href="/instructions/about">درباره ما</Link></li>
               <li><Link href="/instructions/news">اخبار</Link></li>
               <li><Link href="/instructions/contact">تماس با ما</Link></li>
               <li><Link href="/instructions">راهنمای کامل</Link></li>
             </ul>
          </div>
          {/* Customer Services */}
          <div className="col-span-1">
            <h3 className="font-bold text-lg mb-2 text-center md:text-right">خدمات مشتریان</h3>
                         <ul className="space-y-2 text-center md:text-right">
               <li><Link href="/instructions/account">ثبت نام / ورود</Link></li>
               <li><Link href="/instructions/return">مرجوعی سفارش</Link></li>
               <li><Link href="/instructions/support">شکایات</Link></li>
             </ul>
          </div>
          {/* Colleagues Services */}
          <div className="col-span-1">
            <h3 className="font-bold text-lg mb-2 text-center md:text-right">خدمات همکاران</h3>
            <ul className="space-y-2 text-center md:text-right">
              <li><Link href="/instructions/seller">فروشنده شوید</Link></li>
              <li><Link href="/seller">پنل فروشندگان</Link></li>
              <li><Link href="/instructions/cancellation">لغو قرارداد</Link></li>
            </ul>
          </div>
          {/* Buy Guide */}
          <div className="col-span-1">
            <h3 className="font-bold text-lg mb-2 text-center md:text-right">راهنمای خرید</h3>
            <ul className="space-y-2 text-center md:text-right">
              <li><Link href="/instructions/shopping">نحوه ثبت سفارش</Link></li>
              <li><Link href="/instructions/shipping">رویه های ارسال کالا</Link></li>
              <li><Link href="/instructions/payment">شیوه های پرداخت</Link></li>
            </ul>
          </div>
          {/* Socials */}
          <div className="col-span-1 flex flex-col items-center md:items-end justify-between">
            <h3 className="font-bold text-lg mb-2">دسترسی سریع</h3>
            <p className="mb-2 text-xs text-gray-500">برای اطلاع از جدیدترین تخفیف ها، در شبکه های اجتماعی ما را دنبال کنید.</p>
            <div className="flex gap-4 mt-2">
              <a href="#" aria-label="Instagram" className="hover:text-purple-600"><i className="fab fa-instagram text-xl"></i></a>
              <a href="#" aria-label="LinkedIn" className="hover:text-purple-600"><i className="fab fa-linkedin text-xl"></i></a>
              <a href="#" aria-label="Twitter" className="hover:text-purple-600"><i className="fab fa-twitter text-xl"></i></a>
              <a href="#" aria-label="Telegram" className="hover:text-purple-600"><i className="fab fa-telegram text-xl"></i></a>
            </div>
          </div>
        </div>

        {/* Advantages */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-white rounded-xl shadow p-4 my-8 text-center items-center">
          <div className="flex flex-col items-center gap-2">
            <span className="text-base font-bold text-gray-700">پشتیبانی تا ۱۲ شب</span>
            <span className="text-xs text-gray-500">حتی جمعه ها</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-base font-bold text-gray-700">تضمین اصالت کالا</span>
            <span className="text-xs text-gray-500">واقعی!</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-base font-bold text-gray-700">امکان خرید اقساطی</span>
            <span className="text-xs text-gray-500">بدون چک و ضامن</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-base font-bold text-gray-700">۱۰ روز ضمانت بازگشت</span>
            <span className="text-xs text-gray-500">حتی سلیقه ای!</span>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 my-8">
          <a href="https://trustseal.enamad.ir/?id=559858&code=null" target="_blank" rel="noopener noreferrer">
            <Image src="/enamad.png" alt="نماد اعتماد الکترونیکی" width={80} height={80} className="rounded-xl bg-white p-2 border hover:shadow-lg transition-shadow" />
          </a>
          <Image src="/nasr.png" alt="نماد نصر" width={80} height={80} className="rounded-xl bg-white p-2 border" />
          <a href="https://www.zarinpal.com/trustPage/vipana.ir" target="_blank" rel="noopener noreferrer">
            <Image src="/zarinpal.png" alt="نماد زرین‌پال" width={80} height={80} className="rounded-xl bg-white p-2 border hover:shadow-lg transition-shadow" />
          </a>
        </div>

        {/* Description */}
        <div className="text-center text-gray-500 text-base mb-2">
          <span className="text-blue-500 font-bold text-xl">ویپانا</span><br />
          ویپانا مرکز خرید و فروش مجازی در ایران با مجوز رسمی از وزارت صنعت معدن و تجارت می باشد.<br />
          برای ایجاد فروشگاه <Link href="#" className="text-purple-600 underline">اینجا</Link> را کلیک کنید.
        </div>
        <div className="text-center text-xs text-gray-400 mt-4">تمامی حقوق برای ویپانا محفوظ است.</div>
      </div>
    </footer>
  );
} 