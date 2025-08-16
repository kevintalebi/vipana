'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

type OrderRow = {
  user_id: string;
  product_id: number;
  status: string;
};

type Product = {
  id: number;
  name: string;
  price: number;
  main_image?: string | null;
};

export default function OrdersPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [products, setProducts] = useState<Record<number, Product>>({});
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        // Create Supabase client
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseKey) {
          setError('خطای پیکربندی سرور');
          setLoading(false);
          return;
        }
        
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        setLoading(true);
        setError('');
        const { data: { user } } = await supabase.auth.getUser();
        const uid = user?.id || null;
        setUserId(uid);
        if (!uid) {
          setOrders([]);
          setLoading(false);
          return;
        }
        const { data: orderRows, error: orderErr } = await supabase
          .from('orders')
          .select('user_id, product_id, status')
          .eq('user_id', uid);
        if (orderErr) throw orderErr;
        const orderList = (orderRows || []) as OrderRow[];
        setOrders(orderList);

        // Fetch products in a single query
        const uniqueIds = Array.from(new Set(orderList.map(o => o.product_id)));
        if (uniqueIds.length > 0) {
          const { data: productRows, error: prodErr } = await supabase
            .from('products')
            .select('id, name, price, main_image')
            .in('id', uniqueIds);
          if (prodErr) throw prodErr;
          const map: Record<number, Product> = {};
          (productRows || []).forEach((p: any) => {
            map[p.id] = {
              id: p.id,
              name: p.name,
              price: p.price,
              main_image: p.main_image || null,
            } as Product;
          });
          setProducts(map);
        } else {
          setProducts({});
        }
      } catch (e: any) {
        setError(e.message || 'خطا در دریافت سفارش‌ها');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const enriched = useMemo(() => {
    return orders.map((o, idx) => ({
      key: `${o.product_id}-${o.status}-${idx}`,
      order: o,
      product: products[o.product_id],
    }));
  }, [orders, products]);

  return (
    <main className="min-h-screen p-4 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-center text-purple-700 mb-6">سفارش‌های من</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-center">{error}</div>
        )}

        {!userId && !loading && (
          <div className="text-center text-gray-600 bg-white rounded-xl p-4 shadow">برای مشاهده سفارش‌ها ابتدا وارد شوید.</div>
        )}

        {loading ? (
          <div className="text-center text-gray-500">در حال دریافت سفارش‌ها...</div>
        ) : userId && enriched.length === 0 ? (
          <div className="text-center text-gray-500">سفارشی ثبت نشده است.</div>
        ) : (
          <div className="grid gap-3">
            {enriched.map(item => (
              <div key={item.key} className="bg-white rounded-xl shadow p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                    {item.product?.main_image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.product.main_image} alt={item.product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-gray-400">?</div>
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-gray-800">{item.product?.name || `محصول #${item.order.product_id}`}</div>
                    {item.product && (
                      <div className="text-green-600 font-semibold text-sm">{item.product.price?.toLocaleString()} تومان</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm ${item.order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : item.order.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {item.order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}


