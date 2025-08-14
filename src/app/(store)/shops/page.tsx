'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ShopsPage() {
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSellers = async () => {
      setLoading(true);
      setError('');
      try {
        const { data, error } = await supabase
          .from('sellers')
          .select('id, user_id, name, description, profile_image');
        if (error) throw error;
        setShops(data || []);
      } catch (err: any) {
        setError(err.message || 'خطا در دریافت فروشگاه‌ها');
      } finally {
        setLoading(false);
      }
    };
    fetchSellers();
  }, []);

  return (
    <main className="min-h-screen p-4 sm:p-6 bg-gray-50/50">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">فروشگاه‌های ویپانا</h1>
        {loading ? (
          <div className="text-center py-12 text-gray-500">در حال بارگذاری فروشگاه‌ها...</div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">{error}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {shops.length === 0 ? (
              <div className="col-span-full text-center text-gray-500">فروشگاهی یافت نشد.</div>
            ) : (
              shops.map((shop) => (
                <Link href={`/shops/${shop.user_id}`} key={shop.id}>
                  <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 ease-in-out cursor-pointer h-full flex flex-col">
                    <div className="relative h-40 bg-gray-100 flex items-center justify-center">
                      {(() => {
                        const img = shop.profile_image;
                        let isValid = false;
                        let src = '';
                        if (img && typeof img === 'string') {
                          if (img.startsWith('http://') || img.startsWith('https://')) {
                            isValid = true;
                            src = img;
                          } else if (img.startsWith('/')) {
                            isValid = true;
                            src = img;
                          } else {
                            // treat as relative to public folder
                            isValid = true;
                            src = '/' + img;
                          }
                        }
                        return isValid ? (
                          <Image src={src} alt={shop.name} fill className="object-cover absolute inset-0 w-full h-full" />
                        ) : (
                          <div className="w-20 h-20 bg-gray-200 flex items-center justify-center text-gray-400 text-3xl">?</div>
                        );
                      })()}
                    </div>
                    <div className="p-6 flex-grow">
                      <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">{shop.name}</h2>
                      <p className="text-gray-600 text-sm text-center">{shop.description}</p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </main>
  );
} 