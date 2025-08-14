'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function NewsPage() {
  const news = [
    {
      id: 1,
      title: 'ویپانا به عنوان برترین پلتفرم تجارت الکترونیک ایران معرفی شد',
      excerpt: 'در مراسم سالانه تجارت الکترونیک ایران، ویپانا موفق به کسب عنوان برترین پلتفرم خرید و فروش آنلاین شد.',
      date: '۱۴۰۲/۱۲/۱۵',
      category: 'اخبار شرکت',
      image: '/vipana.png',
      readTime: '۵ دقیقه'
    },
    {
      id: 2,
      title: 'راه‌اندازی سیستم پرداخت اقساطی جدید در ویپانا',
      excerpt: 'ویپانا با همکاری بانک‌های معتبر، سیستم پرداخت اقساطی بدون چک و ضامن را راه‌اندازی کرد.',
      date: '۱۴۰۲/۱۲/۱۰',
      category: 'خدمات جدید',
      image: '/vipana.png',
      readTime: '۳ دقیقه'
    },
    {
      id: 3,
      title: 'افزایش ۵۰ درصدی تعداد فروشندگان فعال در ویپانا',
      excerpt: 'طی شش ماه گذشته، تعداد فروشندگان فعال در پلتفرم ویپانا ۵۰ درصد افزایش یافته است.',
      date: '۱۴۰۲/۱۱/۲۸',
      category: 'آمار و گزارش',
      image: '/vipana.png',
      readTime: '۴ دقیقه'
    },
    {
      id: 4,
      title: 'ویپانا و همکاری با شرکت‌های حمل و نقل معتبر',
      excerpt: 'ویپانا با انعقاد قرارداد با شرکت‌های حمل و نقل معتبر، سرعت ارسال کالا را بهبود بخشید.',
      date: '۱۴۰۲/۱۱/۲۰',
      category: 'همکاری‌ها',
      image: '/vipana.png',
      readTime: '۶ دقیقه'
    },
    {
      id: 5,
      title: 'راهنمای خرید امن از ویپانا منتشر شد',
      excerpt: 'ویپانا راهنمای جامع خرید امن را برای افزایش آگاهی کاربران منتشر کرد.',
      date: '۱۴۰۲/۱۱/۱۵',
      category: 'راهنما',
      image: '/vipana.png',
      readTime: '۸ دقیقه'
    },
    {
      id: 6,
      title: 'ویپانا در نمایشگاه فناوری اطلاعات تهران',
      excerpt: 'ویپانا با حضور در نمایشگاه فناوری اطلاعات تهران، آخرین دستاوردهای خود را معرفی کرد.',
      date: '۱۴۰۲/۱۱/۰۸',
      category: 'رویدادها',
      image: '/vipana.png',
      readTime: '۷ دقیقه'
    }
  ];

  const categories = [
    { name: 'همه', count: news.length },
    { name: 'اخبار شرکت', count: 1 },
    { name: 'خدمات جدید', count: 1 },
    { name: 'آمار و گزارش', count: 1 },
    { name: 'همکاری‌ها', count: 1 },
    { name: 'راهنما', count: 1 },
    { name: 'رویدادها', count: 1 }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">اخبار ویپانا</h1>
          <p className="text-gray-600">آخرین اخبار، مقالات و رویدادهای ویپانا</p>
        </div>

        {/* Categories Filter */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">دسته‌بندی اخبار</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category, index) => (
              <button
                key={index}
                className="px-4 py-2 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors text-purple-700 font-medium text-sm"
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </div>

        {/* Featured News */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">خبر ویژه</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                  {news[0].category}
                </span>
                <span className="text-gray-500 text-sm">{news[0].date}</span>
                <span className="text-gray-500 text-sm">•</span>
                <span className="text-gray-500 text-sm">{news[0].readTime}</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4 leading-tight">
                {news[0].title}
              </h3>
              <p className="text-gray-700 leading-relaxed mb-6">
                {news[0].excerpt}
              </p>
                             <Link 
                 href={`/instructions/news/${news[0].id}`}
                 className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-block"
               >
                 مطالعه کامل →
               </Link>
            </div>
            <div className="text-center">
              <div className="w-64 h-48 bg-purple-100 rounded-lg mx-auto flex items-center justify-center">
                <span className="text-2xl font-bold text-purple-700">تصویر خبر</span>
              </div>
            </div>
          </div>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.slice(1).map((article) => (
            <article key={article.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-48 bg-purple-100 flex items-center justify-center">
                <span className="text-lg font-bold text-purple-700">تصویر مقاله</span>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    {article.category}
                  </span>
                  <span className="text-gray-500 text-xs">{article.date}</span>
                  <span className="text-gray-500 text-xs">•</span>
                  <span className="text-gray-500 text-xs">{article.readTime}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-3 leading-tight">
                  {article.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  {article.excerpt}
                </p>
                                 <Link 
                   href={`/instructions/news/${article.id}`}
                   className="text-purple-600 hover:text-purple-800 font-medium text-sm transition-colors"
                 >
                   ادامه مطلب →
                 </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Newsletter Subscription */}
        <div className="bg-white rounded-xl shadow-lg p-8 mt-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">عضویت در خبرنامه</h2>
            <p className="text-gray-600 mb-6">برای دریافت آخرین اخبار و تخفیف‌ها، در خبرنامه ما عضو شوید</p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="ایمیل خود را وارد کنید"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                عضویت
              </button>
            </div>
          </div>
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
