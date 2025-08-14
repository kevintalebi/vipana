"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type OrderRow = { user_id: string; product_id: number; status: string };
type ProductRow = { id: number; name: string; price: number; main_image?: string | null };
type BuyerRow = { user_id: string; name?: string | null; image_url?: string | null };

export default function SellerOrdersPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewOrders, setViewOrders] = useState<Array<{ id: string; buyer: string; products: string; total: number; status: string; userId: string; productId: number }>>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('pending');
  const [selectedOrder, setSelectedOrder] = useState<{ userId: string; productId: number } | null>(null);
  const [buyerDetail, setBuyerDetail] = useState<BuyerRow | null>(null);
  const [buyerAddress, setBuyerAddress] = useState<any | null>(null);
  const [productDetail, setProductDetail] = useState<ProductRow | null>(null);
  const [trackingCode, setTrackingCode] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('ابتدا وارد شوید');

        // Fetch this seller's products
        const { data: products, error: prodErr } = await supabase
          .from('products')
          .select('id, name, price, main_image')
          .eq('user_id', user.id);
        if (prodErr) throw prodErr;
        const productList = (products || []) as ProductRow[];
        const productIds = productList.map(p => p.id);

        if (productIds.length === 0) {
          setViewOrders([]);
          setLoading(false);
          return;
        }

        // Fetch orders for these products
        const { data: orders, error: ordErr } = await supabase
          .from('orders')
          .select('user_id, product_id, status')
          .in('product_id', productIds);
        if (ordErr) throw ordErr;
        const orderList = (orders || []) as OrderRow[];

        // Fetch buyers names
        const buyerIds = Array.from(new Set(orderList.map(o => o.user_id)));
        let buyersMap: Record<string, BuyerRow> = {};
        if (buyerIds.length > 0) {
          const { data: buyers } = await supabase
            .from('buyers')
            .select('user_id, name')
            .in('user_id', buyerIds);
          (buyers || []).forEach((b: any) => {
            buyersMap[b.user_id] = { user_id: b.user_id, name: b.name } as BuyerRow;
          });
        }

        const productMap = Object.fromEntries(productList.map(p => [p.id, p] as const));
        const view = orderList.map((o, idx) => {
          const prod = productMap[o.product_id];
          const buyerName = buyersMap[o.user_id]?.name || '—';
          return {
            id: `${o.user_id}-${o.product_id}-${idx}`,
            buyer: buyerName,
            products: prod?.name || `محصول #${o.product_id}`,
            total: prod?.price || 0,
            status: o.status || 'pending',
            userId: o.user_id,
            productId: o.product_id,
          };
        });
        setViewOrders(view);
      } catch (e: any) {
        setError(e.message || 'خطا در دریافت سفارشات');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 md:p-8">
      <h2 className="text-xl font-bold text-green-700 mb-6">مدیریت سفارشات من</h2>
      
      <div className="space-y-4">
        <div className="hidden md:grid md:grid-cols-5 gap-4 font-bold text-gray-600 p-2 bg-gray-100 rounded-lg text-right">
          <div>خریدار</div>
          <div>محصولات</div>
          <div>مبلغ کل (تومان)</div>
          <div>وضعیت</div>
          <div className="text-center">عملیات</div>
        </div>

        {loading && (
          <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">در حال بارگذاری...</div>
        )}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-center">{error}</div>
        )}
        {!loading && !error && viewOrders.map(order => (
          <div key={order.id} className="bg-gray-50 rounded-lg p-4 md:grid md:grid-cols-5 md:gap-4 items-center text-right">
            <div className="flex justify-between items-center md:block border-b md:border-none pb-2 mb-2">
              <span className="font-bold md:hidden">خریدار:</span>
              <span>{order.buyer}</span>
            </div>
            <div className="flex justify-between items-center md:block border-b md:border-none pb-2 mb-2">
              <span className="font-bold md:hidden">محصولات:</span>
              <span>{order.products}</span>
            </div>
            <div className="flex justify-between items-center md:block border-b md:border-none pb-2 mb-2">
              <span className="font-bold md:hidden">مبلغ کل:</span>
              <span>{order.total.toLocaleString()} تومان</span>
            </div>
            <div className="flex justify-between items-center md:block">
              <span className="font-bold md:hidden">وضعیت:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  order.status === 'تکمیل شده' ? 'bg-green-100 text-green-700' :
                  order.status === 'لغو شده' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                {order.status}
              </span>
            </div>
            <div className="mt-4 md:mt-0 flex flex-wrap gap-2 justify-center w-full">
              <button
                className="w-full md:w-auto bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm flex items-center justify-center gap-1"
                onClick={async () => {
                  setModalError('');
                  setModalOpen(true);
                  setModalLoading(true);
                  setSelectedOrder({ userId: order.userId, productId: order.productId });
                  setSelectedStatus(order.status);
                  setTrackingCode('');
                  try {
                    // Fetch buyer detail
                    const { data: buyer } = await supabase
                      .from('buyers')
                      .select('user_id, name, image_url')
                      .eq('user_id', order.userId)
                      .single();
                    setBuyerDetail((buyer as any) || null);
                    // Fetch latest address
                    const { data: address } = await supabase
                      .from('addresses')
                      .select('title, province, city, address, postal')
                      .eq('user_id', order.userId)
                      .order('id', { ascending: false })
                      .limit(1)
                      .maybeSingle();
                    setBuyerAddress(address || null);
                    // Product detail
                    const { data: product } = await supabase
                      .from('products')
                      .select('id, name, price, main_image')
                      .eq('id', order.productId)
                      .single();
                    setProductDetail((product as any) || null);

                    // Fetch order meta like tracking code if exists
                    const { data: orderDetail } = await supabase
                      .from('orders')
                      .select('tracking_code, status')
                      .eq('user_id', order.userId)
                      .eq('product_id', order.productId)
                      .maybeSingle();
                    if (orderDetail?.tracking_code) setTrackingCode(orderDetail.tracking_code as any);
                    if (orderDetail?.status) setSelectedStatus(orderDetail.status as any);
                  } catch (e: any) {
                    setModalError(e.message || 'خطا در دریافت جزئیات سفارش');
                  } finally {
                    setModalLoading(false);
                  }
                }}
                title="مشاهده"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 5c-7.633 0-11 7-11 7s3.367 7 11 7 11-7 11-7-3.367-7-11-7zm0 12a5 5 0 110-10 5 5 0 010 10zm0-8a3 3 0 100 6 3 3 0 000-6z"/></svg>
                <span className="inline">نمایش</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="text-lg font-bold text-gray-800">جزئیات سفارش</div>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setModalOpen(false)}>×</button>
            </div>
            {modalLoading ? (
              <div className="text-center text-gray-500">در حال بارگذاری...</div>
            ) : modalError ? (
              <div className="text-center text-red-600">{modalError}</div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                    {buyerDetail?.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={buyerDetail.image_url} alt={buyerDetail?.name || ''} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-gray-400">?</div>
                    )}
                  </div>
                  <div>
                    <div className="font-bold">{buyerDetail?.name || '—'}</div>
                    {buyerAddress && (
                      <div className="text-sm text-gray-600">{buyerAddress.province}، {buyerAddress.city}، {buyerAddress.address} {buyerAddress.postal ? `- ${buyerAddress.postal}` : ''}</div>
                    )}
                  </div>
                </div>
                <div className="border rounded-lg p-3">
                  <div className="font-semibold mb-2">مشخصات محصول</div>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                      {productDetail?.main_image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={productDetail.main_image} alt={productDetail?.name || ''} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-gray-400">?</div>
                      )}
                    </div>
                    <div>
                      <div className="font-bold">{productDetail?.name || `#${selectedOrder?.productId}`}</div>
                      <div className="text-green-600 font-semibold text-sm">{productDetail?.price?.toLocaleString()} تومان</div>
                    </div>
                  </div>
                </div>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!selectedOrder) return;
                    try {
                      const { error: updErr } = await supabase
                        .from('orders')
                        .update({ status: selectedStatus, tracking_code: trackingCode })
                        .eq('user_id', selectedOrder.userId)
                        .eq('product_id', selectedOrder.productId);
                      if (updErr) throw updErr;
                      setViewOrders(prev => prev.map(o => (o.userId === selectedOrder.userId && o.productId === selectedOrder.productId) ? { ...o, status: selectedStatus } : o));
                      setModalOpen(false);
                    } catch (e) {
                      setModalError('بروزرسانی وضعیت با خطا مواجه شد');
                    }
                  }}
                  className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-3 items-end"
                >
                  <div className="flex-1">
                    <label className="block text-sm text-gray-600 mb-1 text-right">کد پیگیری مرسوله</label>
                    <input className="w-full border rounded px-3 py-2" value={trackingCode} onChange={(e) => setTrackingCode(e.target.value)} placeholder="مثلاً 123456789" />
                  </div>
                  <select className="border rounded px-3 py-2 min-w-[160px]" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                    <option value="pending">pending</option>
                    <option value="confirmed">confirmed</option>
                    <option value="shipped">shipped</option>
                    <option value="completed">completed</option>
                    <option value="canceled">canceled</option>
                  </select>
                  <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded md:ml-2">ثبت</button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}