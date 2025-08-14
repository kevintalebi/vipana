'use client';
import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

// Add global styles to prevent horizontal scrolling
const globalStyles = `
  * {
    box-sizing: border-box;
  }
  
  body {
    overflow-x: hidden;
  }
  
  .prose {
    max-width: 100% !important;
    overflow-x: hidden !important;
  }
  
  .prose * {
    max-width: 100% !important;
    overflow-wrap: break-word !important;
    word-wrap: break-word !important;
  }
`;

export default function SingleNewsPage() {
  const params = useParams();
  const newsId = params.id;

  // Sample news data - in a real app, this would come from an API
  const newsData = {
    1: {
      id: 1,
      title: 'ویپانا به عنوان برترین پلتفرم تجارت الکترونیک ایران معرفی شد',
      content: `
        <p>در مراسم سالانه تجارت الکترونیک ایران که با حضور بیش از ۵۰۰ شرکت فعال در حوزه تجارت الکترونیک برگزار شد، ویپانا موفق به کسب عنوان برترین پلتفرم خرید و فروش آنلاین شد.</p>
        
        <p>این مراسم که توسط انجمن تجارت الکترونیک ایران برگزار می‌شود، هر ساله شرکت‌های برتر این حوزه را معرفی می‌کند. ویپانا با ارائه خدمات با کیفیت و رضایت بالای مشتریان، توانست این عنوان ارزشمند را کسب کند.</p>
        
        <h3>معیارهای انتخاب</h3>
        <p>بر اساس اعلام دبیرخانه این مراسم، معیارهای انتخاب برترین پلتفرم شامل موارد زیر بوده است:</p>
        <ul>
          <li>رضایت مشتریان و کاربران</li>
          <li>کیفیت خدمات ارائه شده</li>
          <li>امنیت و اعتماد کاربران</li>
          <li>نوآوری در ارائه خدمات</li>
          <li>تعداد کاربران فعال</li>
        </ul>
        
        <h3>دستاوردهای ویپانا</h3>
        <p>ویپانا در سال گذشته موفق به دستیابی به دستاوردهای قابل توجهی شده است:</p>
        <ul>
          <li>افزایش ۵۰ درصدی تعداد کاربران فعال</li>
          <li>راه‌اندازی سیستم پرداخت اقساطی</li>
          <li>بهبود سرعت ارسال کالا</li>
          <li>افزایش رضایت مشتریان به ۹۹.۹ درصد</li>
        </ul>
        
        <h3>سخنان مدیرعامل</h3>
        <p>مهندس احمدی، مدیرعامل ویپانا در این مراسم اظهار داشت: "این موفقیت حاصل تلاش بی‌وقفه تیم ویپانا و اعتماد مشتریان عزیزمان است. ما متعهد به ارائه خدمات بهتر و با کیفیت‌تر در آینده هستیم."</p>
        
        <p>وی همچنین از برنامه‌های آینده ویپانا برای توسعه خدمات و بهبود تجربه کاربری خبر داد.</p>
      `,
      date: '۱۴۰۲/۱۲/۱۵',
      category: 'اخبار شرکت',
      author: 'تیم تحریریه ویپانا',
      readTime: '۵ دقیقه',
      image: '/vipana.png'
    },
    2: {
      id: 2,
      title: 'راه‌اندازی سیستم پرداخت اقساطی جدید در ویپانا',
      content: `
        <p>ویپانا با همکاری بانک‌های معتبر کشور، سیستم پرداخت اقساطی بدون چک و ضامن را راه‌اندازی کرد. این سرویس جدید امکان خرید اقساطی را برای تمام کاربران ویپانا فراهم می‌کند.</p>
        
        <h3>ویژگی‌های سیستم جدید</h3>
        <p>سیستم پرداخت اقساطی جدید ویپانا دارای ویژگی‌های منحصر به فردی است:</p>
        <ul>
          <li>بدون نیاز به چک و ضامن</li>
          <li>تایید سریع در کمتر از ۲۴ ساعت</li>
          <li>امکان خرید تا سقف ۵۰ میلیون تومان</li>
          <li>بهره‌بندی مناسب و شفاف</li>
          <li>پشتیبانی از تمام محصولات</li>
        </ul>
        
        <h3>شرایط استفاده</h3>
        <p>برای استفاده از این سرویس، کاربران باید شرایط زیر را داشته باشند:</p>
        <ul>
          <li>حساب کاربری تایید شده در ویپانا</li>
          <li>سابقه خرید حداقل ۳ ماهه</li>
          <li>عدم وجود بدهی معوق</li>
          <li>تایید هویت کامل</li>
        </ul>
        
        <h3>مراحل ثبت درخواست</h3>
        <p>فرآیند درخواست خرید اقساطی به شرح زیر است:</p>
        <ol>
          <li>انتخاب محصول مورد نظر</li>
          <li>انتخاب گزینه پرداخت اقساطی</li>
          <li>تکمیل فرم درخواست</li>
          <li>ارسال مدارک مورد نیاز</li>
          <li>بررسی و تایید درخواست</li>
          <li>تحویل کالا و شروع اقساط</li>
        </ol>
        
        <h3>همکاری با بانک‌ها</h3>
        <p>ویپانا با بانک‌های معتبر کشور از جمله بانک ملی، بانک ملت و بانک پارسیان همکاری می‌کند تا بهترین شرایط را برای کاربران فراهم کند.</p>
      `,
      date: '۱۴۰۲/۱۲/۱۰',
      category: 'خدمات جدید',
      author: 'تیم فنی ویپانا',
      readTime: '۳ دقیقه',
      image: '/vipana.png'
    },
    3: {
      id: 3,
      title: 'افزایش ۵۰ درصدی تعداد فروشندگان فعال در ویپانا',
      content: `
        <p>طی شش ماه گذشته، تعداد فروشندگان فعال در پلتفرم ویپانا ۵۰ درصد افزایش یافته است. این رشد قابل توجه نشان‌دهنده اعتماد فروشندگان به پلتفرم ویپانا است.</p>
        
        <h3>آمار رشد</h3>
        <p>بر اساس گزارش‌های منتشر شده:</p>
        <ul>
          <li>تعداد فروشندگان فعال: از ۳,۰۰۰ به ۴,۵۰۰ افزایش یافته</li>
          <li>تعداد محصولات: از ۲۰۰,۰۰۰ به ۳۰۰,۰۰۰ افزایش یافته</li>
          <li>فروش ماهانه: ۴۰ درصد رشد داشته</li>
          <li>رضایت فروشندگان: ۹۵ درصد</li>
        </ul>
        
        <h3>دلایل رشد</h3>
        <p>عوامل مختلفی در این رشد نقش داشته‌اند:</p>
        <ul>
          <li>بهبود پنل فروشندگان</li>
          <li>کاهش کارمزد تراکنش‌ها</li>
          <li>افزایش سرعت پرداخت</li>
          <li>پشتیبانی بهتر</li>
          <li>امکانات جدید برای فروشندگان</li>
        </ul>
        
        <h3>برنامه‌های آینده</h3>
        <p>ویپانا برنامه‌های مختلفی برای جذب فروشندگان بیشتر دارد:</p>
        <ul>
          <li>راه‌اندازی برنامه‌های تشویقی</li>
          <li>بهبود ابزارهای مدیریت فروشگاه</li>
          <li>افزایش امکانات بازاریابی</li>
          <li>آموزش‌های رایگان برای فروشندگان</li>
        </ul>
      `,
      date: '۱۴۰۲/۱۱/۲۸',
      category: 'آمار و گزارش',
      author: 'تیم تحلیل داده',
      readTime: '۴ دقیقه',
      image: '/vipana.png'
    },
    4: {
      id: 4,
      title: 'ویپانا و همکاری با شرکت‌های حمل و نقل معتبر',
      content: `
        <p>ویپانا با انعقاد قرارداد با شرکت‌های حمل و نقل معتبر، سرعت ارسال کالا را بهبود بخشید. این همکاری‌ها باعث افزایش رضایت مشتریان و کاهش زمان انتظار شده است.</p>
        
        <h3>شرکت‌های همکار</h3>
        <p>ویپانا با شرکت‌های زیر همکاری می‌کند:</p>
        <ul>
          <li>پست جمهوری اسلامی ایران</li>
          <li>تیپاکس</li>
          <li>پیک موتوری</li>
          <li>شرکت‌های حمل و نقل خصوصی</li>
        </ul>
        
        <h3>بهبودهای اعمال شده</h3>
        <p>این همکاری‌ها منجر به بهبودهای زیر شده است:</p>
        <ul>
          <li>کاهش زمان ارسال از ۷۲ ساعت به ۲۴ ساعت</li>
          <li>امکان ردیابی لحظه‌ای کالا</li>
          <li>ارسال رایگان برای خریدهای بالای ۵۰۰ هزار تومان</li>
          <li>پشتیبانی بهتر در زمان ارسال</li>
        </ul>
        
        <h3>خدمات جدید</h3>
        <p>خدمات جدید ارائه شده شامل:</p>
        <ul>
          <li>ارسال در همان روز</li>
          <li>ارسال در ساعات مشخص</li>
          <li>امکان تغییر آدرس تا قبل از ارسال</li>
          <li>بیمه کالا در زمان حمل</li>
        </ul>
      `,
      date: '۱۴۰۲/۱۱/۲۰',
      category: 'همکاری‌ها',
      author: 'تیم لجستیک',
      readTime: '۶ دقیقه',
      image: '/vipana.png'
    },
    5: {
      id: 5,
      title: 'راهنمای خرید امن از ویپانا منتشر شد',
      content: `
        <p>ویپانا راهنمای جامع خرید امن را برای افزایش آگاهی کاربران منتشر کرد. این راهنما شامل نکات مهم برای خرید امن و جلوگیری از کلاهبرداری است.</p>
        
        <h3>محتویات راهنما</h3>
        <p>راهنمای خرید امن شامل بخش‌های زیر است:</p>
        <ul>
          <li>نکات امنیتی قبل از خرید</li>
          <li>تشخیص فروشگاه‌های معتبر</li>
          <li>روش‌های پرداخت امن</li>
          <li>نحوه بررسی محصولات</li>
          <li>اقدامات لازم در صورت مشکل</li>
        </ul>
        
        <h3>نکات امنیتی مهم</h3>
        <p>برخی از نکات مهم امنیتی:</p>
        <ul>
          <li>همیشه از درگاه‌های پرداخت معتبر استفاده کنید</li>
          <li>اطلاعات شخصی خود را محافظت کنید</li>
          <li>قبل از خرید، نظرات دیگران را مطالعه کنید</li>
          <li>از خرید از فروشگاه‌های مشکوک خودداری کنید</li>
          <li>رسید خرید را نگهداری کنید</li>
        </ul>
        
        <h3>پشتیبانی امنیتی</h3>
        <p>ویپانا خدمات پشتیبانی امنیتی ارائه می‌دهد:</p>
        <ul>
          <li>گارانتی بازگشت کالا</li>
          <li>پشتیبانی ۲۴ ساعته</li>
          <li>سیستم شکایت آنلاین</li>
          <li>بیمه خرید</li>
        </ul>
      `,
      date: '۱۴۰۲/۱۱/۱۵',
      category: 'راهنما',
      author: 'تیم امنیت',
      readTime: '۸ دقیقه',
      image: '/vipana.png'
    },
    6: {
      id: 6,
      title: 'ویپانا در نمایشگاه فناوری اطلاعات تهران',
      content: `
        <p>ویپانا با حضور در نمایشگاه فناوری اطلاعات تهران، آخرین دستاوردهای خود را معرفی کرد. این نمایشگاه که بزرگترین رویداد فناوری کشور است، فرصت مناسبی برای معرفی خدمات جدید ویپانا بود.</p>
        
        <h3>دستاوردهای معرفی شده</h3>
        <p>در این نمایشگاه، ویپانا دستاوردهای زیر را معرفی کرد:</p>
        <ul>
          <li>سیستم هوش مصنوعی برای پیشنهاد محصولات</li>
          <li>اپلیکیشن موبایل جدید</li>
          <li>سیستم پرداخت اقساطی</li>
          <li>پنل فروشندگان بهبود یافته</li>
          <li>سیستم ردیابی هوشمند</li>
        </ul>
        
        <h3>بازخورد بازدیدکنندگان</h3>
        <p>بازدیدکنندگان از غرفه ویپانا بازخورد مثبتی داشتند:</p>
        <ul>
          <li>استقبال از خدمات جدید</li>
          <li>درخواست برای توسعه بیشتر</li>
          <li>پیشنهادات مفید برای بهبود</li>
          <li>علاقه به همکاری</li>
        </ul>
        
        <h3>برنامه‌های آینده</h3>
        <p>بر اساس بازخوردهای دریافتی، ویپانا برنامه‌های زیر را در دستور کار دارد:</p>
        <ul>
          <li>توسعه خدمات هوش مصنوعی</li>
          <li>بهبود تجربه کاربری</li>
          <li>افزایش سرعت سایت</li>
          <li>راه‌اندازی خدمات جدید</li>
        </ul>
      `,
      date: '۱۴۰۲/۱۱/۰۸',
      category: 'رویدادها',
      author: 'تیم روابط عمومی',
      readTime: '۷ دقیقه',
      image: '/vipana.png'
    }
  };

  const article = newsData[newsId as unknown as keyof typeof newsData];

  if (!article) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
        <div className="min-h-screen bg-gray-50 py-8 overflow-x-hidden">
          <div className="max-w-4xl mx-auto px-4 w-full">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-800 mb-4">مقاله یافت نشد</h1>
              <p className="text-gray-600 mb-8">متأسفانه مقاله مورد نظر یافت نشد.</p>
              <Link 
                href="/instructions/news"
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-block"
              >
                بازگشت به اخبار
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
      <div className="min-h-screen bg-gray-50 py-8 overflow-x-hidden">
        <div className="max-w-4xl mx-auto px-4 w-full">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <ol className="flex items-center flex-wrap gap-2 text-sm text-gray-600">
              <li><Link href="/instructions" className="hover:text-purple-600">راهنمای کامل</Link></li>
              <li>/</li>
              <li><Link href="/instructions/news" className="hover:text-purple-600">اخبار</Link></li>
              <li>/</li>
              <li className="text-gray-800 truncate max-w-[200px] sm:max-w-none">{article.title}</li>
            </ol>
          </nav>

          {/* Article Header */}
          <article className="bg-white rounded-xl shadow-lg overflow-hidden w-full">
            {/* Article Image */}
            <div className="h-64 bg-purple-100 flex items-center justify-center">
              <span className="text-2xl font-bold text-purple-700">تصویر مقاله</span>
            </div>

            {/* Article Content */}
            <div className="p-4 sm:p-8">
              {/* Article Meta */}
              <div className="flex items-center flex-wrap gap-2 mb-6 text-sm text-gray-600">
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
                  {article.category}
                </span>
                <span>{article.date}</span>
                <span>•</span>
                <span>{article.readTime}</span>
                <span>•</span>
                <span className="truncate">نویسنده: {article.author}</span>
              </div>

              {/* Article Title */}
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 leading-tight break-words">
                {article.title}
              </h1>

              {/* Article Body */}
              <div 
                className="prose prose-sm sm:prose-lg max-w-none text-gray-700 leading-relaxed overflow-hidden break-words"
                style={{ 
                  wordWrap: 'break-word', 
                  overflowWrap: 'break-word',
                  maxWidth: '100%',
                  overflowX: 'hidden'
                }}
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            </div>
          </article>

          {/* Related Articles */}
          <div className="mt-12 w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">مقالات مرتبط</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              {Object.values(newsData)
                .filter(item => item.id !== article.id)
                .slice(0, 2)
                .map((relatedArticle) => (
                  <Link 
                    key={relatedArticle.id}
                    href={`/instructions/news/${relatedArticle.id}`}
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow w-full"
                  >
                    <div className="h-32 bg-purple-100 flex items-center justify-center">
                      <span className="text-lg font-bold text-purple-700">تصویر مقاله</span>
                    </div>
                    <div className="p-4 w-full">
                      <div className="flex items-center flex-wrap gap-2 mb-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          {relatedArticle.category}
                        </span>
                        <span className="text-gray-500 text-xs">{relatedArticle.date}</span>
                      </div>
                      <h3 className="font-bold text-gray-800 mb-2 leading-tight break-words">
                        {relatedArticle.title}
                      </h3>
                      <p className="text-purple-600 text-sm font-medium">
                        ادامه مطلب →
                      </p>
                    </div>
                  </Link>
                ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-12">
            <Link 
              href="/instructions/news"
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors w-full sm:w-auto text-center"
            >
              بازگشت به اخبار
            </Link>
            <Link 
              href="/instructions"
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors w-full sm:w-auto text-center"
            >
              راهنمای کامل
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
