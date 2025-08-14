'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type RootCategory = {
  id: number;
  name: string;
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<RootCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRootCategories = async () => {
      try {
        setLoading(true);
        setError('');
        // Public read using anon key; requires RLS policy to allow anon read of roots
        const { data, error } = await supabase
          .from('categories')
          .select('id, name')
          .is('parent_id', null)
          .order('name', { ascending: true });

        if (error) throw error;
        setCategories((data || []) as RootCategory[]);
      } catch (err: any) {
        setError(err.message || 'خطا در دریافت دسته‌بندی‌ها');
      } finally {
        setLoading(false);
      }
    };
    fetchRootCategories();
  }, []);

  // Simple icon set (inline SVGs) to represent common categories
  const IconPhone = (className = 'w-8 h-8 text-purple-600') => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="7" y="2" width="10" height="20" rx="2" />
      <circle cx="12" cy="18" r="1" />
    </svg>
  );
  const IconLaptop = (className = 'w-8 h-8 text-indigo-600') => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="4" y="5" width="16" height="10" rx="2" />
      <path d="M2 18h20" />
    </svg>
  );
  const IconCamera = (className = 'w-8 h-8 text-sky-600') => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="6" width="18" height="14" rx="2" />
      <circle cx="12" cy="13" r="4" />
      <path d="M8 6l2-2h4l2 2" />
    </svg>
  );
  const IconShirt = (className = 'w-8 h-8 text-pink-600') => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M16 3l4 3-3 3v12H7V9L4 6l4-3 4 3 4-3z" />
    </svg>
  );
  const IconBeauty = (className = 'w-8 h-8 text-rose-600') => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M12 3c3 3 3 6 0 9-3-3-3-6 0-9z" />
      <path d="M12 12v9" />
    </svg>
  );
  const IconHome = (className = 'w-8 h-8 text-amber-600') => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M3 12l9-7 9 7" />
      <path d="M5 10v10h14V10" />
    </svg>
  );
  const IconGrocery = (className = 'w-8 h-8 text-green-600') => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M3 6h18l-2 10H7L5 6z" />
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="17" cy="20" r="1.5" />
    </svg>
  );
  const IconSport = (className = 'w-8 h-8 text-teal-600') => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a12 12 0 010 18" />
    </svg>
  );
  const IconBook = (className = 'w-8 h-8 text-blue-600') => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M4 5h12a3 3 0 013 3v11H7a3 3 0 01-3-3V5z" />
      <path d="M7 5v11" />
    </svg>
  );
  const IconToy = (className = 'w-8 h-8 text-orange-600') => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="8" cy="8" r="3" />
      <circle cx="16" cy="8" r="3" />
      <path d="M5 16h14l-2 4H7l-2-4z" />
    </svg>
  );
  const IconPet = (className = 'w-8 h-8 text-lime-600') => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="5.5" cy="10" r="2.5" />
      <circle cx="18.5" cy="10" r="2.5" />
      <circle cx="8.5" cy="5.5" r="2.5" />
      <circle cx="15.5" cy="5.5" r="2.5" />
      <path d="M7 19c1.2-2.2 3.2-3.5 5-3.5S15.8 16.8 17 19c.3.6-.1 1-1 1H8c-.9 0-1.3-.4-1-1z" />
    </svg>
  );
  const IconTools = (className = 'w-8 h-8 text-gray-600') => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M14 7l3 3-7 7H7v-3l7-7z" />
      <path d="M14 3l3 3" />
    </svg>
  );
  const IconJewelry = (className = 'w-8 h-8 text-yellow-600') => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M12 3l4 4-4 4-4-4 4-4z" />
      <path d="M6 11l6 10 6-10" />
    </svg>
  );
  const IconGeneric = (className = 'w-8 h-8 text-purple-600') => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="3" width="7" height="7" rx="2" />
      <rect x="14" y="3" width="7" height="7" rx="2" />
      <rect x="3" y="14" width="7" height="7" rx="2" />
      <circle cx="17.5" cy="17.5" r="3.5" />
    </svg>
  );

  const getCategoryIcon = (name: string, idx: number) => {
    const n = name.toLowerCase();
    const includesAny = (arr: string[]) => arr.some(k => n.includes(k));

    if (includesAny(['mobile', 'phone', 'cell', 'موبایل', 'گوشی'])) return IconPhone();
    if (includesAny(['laptop', 'computer', 'pc', 'کامپیوتر', 'لپ تاپ', 'دیجیتال'])) return IconLaptop();
    if (includesAny(['camera', 'dslr', 'دوربین'])) return IconCamera();
    if (includesAny(['fashion', 'clothes', 'apparel', 'پوشاک', 'لباس', 'فشن', 'کفش', 'کیف'])) return IconShirt();
    if (includesAny(['beauty', 'health', 'cosmetic', 'زیبایی', 'آرایشی', 'بهداشتی', 'سلامت', 'پوست'])) return IconBeauty();
    if (includesAny(['home', 'kitchen', 'appliance', 'خانه', 'آشپزخانه', 'لوازم خانگی', 'دکور'])) return IconHome();
    if (includesAny(['grocery', 'food', 'سوپرمارکت', 'خوراکی', 'مواد غذایی'])) return IconGrocery();
    if (includesAny(['sport', 'fitness', 'gym', 'ورزش', 'ورزشی', 'بدنسازی'])) return IconSport();
    if (includesAny(['book', 'stationery', 'کتاب', 'تحریر', 'فرهنگی'])) return IconBook();
    if (includesAny(['toy', 'baby', 'kids', 'اسباب بازی', 'کودک', 'نوزاد'])) return IconToy();
    if (includesAny(['pet', 'animal', 'animals', 'dog', 'cat', 'bird', 'حیوان', 'حیوانات', 'سگ', 'گربه', 'پرنده', 'حیوانات خانگی'])) return IconPet();
    if (includesAny(['tool', 'industrial', 'ابزار', 'صنعت'])) return IconTools();
    if (includesAny(['jewelry', 'watch', 'زیور', 'جواهر', 'ساعت'])) return IconJewelry();

    // Fallback with varying colors
    const colors = ['text-purple-600', 'text-indigo-600', 'text-pink-600', 'text-blue-600', 'text-teal-600', 'text-rose-600'];
    return IconGeneric(`w-8 h-8 ${colors[idx % colors.length]}`);
  };

  return (
    <main className="min-h-screen p-4 sm:p-6 bg-gray-50/50">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">دسته‌بندی‌ها</h1>

        {loading && (
          <div className="text-center py-12 text-gray-500">در حال بارگذاری دسته‌بندی‌ها...</div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 p-3 rounded mb-6 text-center">
            {error}
          </div>
        )}

        {!loading && categories.length === 0 && (
          <div className="text-center text-gray-500">دسته‌بندی ریشه‌ای یافت نشد.</div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat, idx) => (
            <Link key={cat.id} href={`/products?category=${encodeURIComponent(cat.name)}`}>
              <div className="bg-white rounded-xl shadow hover:shadow-lg transition p-4 flex flex-col items-center gap-3 cursor-pointer">
                {getCategoryIcon(cat.name, idx)}
                <div className="text-sm font-semibold text-gray-800 text-center line-clamp-2">{cat.name}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}


