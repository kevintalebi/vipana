'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Product = {
  id: number;
  name: string;
  price: number;
  main_image?: string | null;
};

export default function WishlistPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const loadWishlist = async () => {
      setLoading(true);
      setError('');
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const uid = user?.id || null;
        setUserId(uid);
        if (!uid) {
          setProducts([]);
          setLoading(false);
          return;
        }
        // Read favorites
        const { data: favRows, error: favErr } = await supabase
          .from('favorites')
          .select('product_id')
          .eq('user_id', uid);
        if (favErr) throw favErr;
        const ids = (favRows || []).map((r: any) => r.product_id);
        if (ids.length === 0) {
          setProducts([]);
          setLoading(false);
          return;
        }
        const { data: prodRows, error: prodErr } = await supabase
          .from('products')
          .select('id, name, price, main_image')
          .in('id', ids)
          .order('id', { ascending: false });
        if (prodErr) throw prodErr;
        setProducts((prodRows as Product[]) || []);
      } catch (e: any) {
        setError(e.message || 'خطا در دریافت لیست علاقه‌مندی‌ها');
      } finally {
        setLoading(false);
      }
    };
    loadWishlist();
  }, []);

  const removeFavorite = async (productId: number) => {
    if (!userId) return;
    try {
      setProducts(prev => prev.filter(p => p.id !== productId));
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);
    } catch (e) {
      // ignore; optimistic removal
    }
  };

  return (
    <main className="min-h-screen p-4 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-center text-purple-700 mb-6">علاقه‌مندی‌ها</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-center">{error}</div>
        )}

        {!userId && !loading && (
          <div className="text-center text-gray-600 bg-white rounded-xl p-4 shadow">برای مشاهده علاقه‌مندی‌ها ابتدا وارد شوید.</div>
        )}

        {loading ? (
          <div className="text-center text-gray-500">در حال دریافت علاقه‌مندی‌ها...</div>
        ) : userId && products.length === 0 ? (
          <div className="text-center text-gray-500">محصولی در علاقه‌مندی‌ها وجود ندارد.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {products.map((p) => (
              <div key={p.id} className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
                <Link href={`/products/${p.id}`} className="w-full flex flex-col items-center hover:opacity-95 transition mb-2">
                  <div className="w-32 h-32 mb-3 flex items-center justify-center bg-gray-50 rounded-lg shadow sm:w-40 sm:h-40 sm:mb-4">
                    {p.main_image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.main_image} alt={p.name} className="w-full h-full object-cover rounded-lg sm:rounded-xl" />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs rounded-lg sm:rounded-xl">بدون تصویر</div>
                    )}
                  </div>
                  <h2 className="font-bold text-base mb-1 text-center w-full break-words sm:text-lg sm:mb-2">{p.name}</h2>
                  <div className="text-green-700 font-bold text-center w-full text-base sm:text-lg">{p.price.toLocaleString()} تومان</div>
                </Link>
                <div className="flex gap-2 w-full">
                  <button
                    className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
                    onClick={() => removeFavorite(p.id)}
                  >
                    حذف از علاقه‌مندی‌ها
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}


