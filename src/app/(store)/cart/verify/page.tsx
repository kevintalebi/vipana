'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function ZarinpalVerifyPageContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'failed'>('idle');
  const [message, setMessage] = useState('');
  const [refId, setRefId] = useState<number | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      const authority = searchParams.get('Authority');
      const statusParam = searchParams.get('Status');
      if (!authority || statusParam !== 'OK') {
        setStatus('failed');
        setMessage('پرداخت لغو شد یا نامعتبر است.');
        return;
      }
      setStatus('verifying');
      try {
        const amount = Number(localStorage.getItem('vipana-last-amount')) || 0;
        const res = await fetch('/api/payment/zarinpal/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ authority, amount }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || 'خطا در تایید پرداخت');
        setRefId(data.ref_id);
        setStatus('success');
        setMessage('پرداخت با موفقیت تایید شد.');

        // Create pending orders for each product
        try {
          const productIdsRaw = localStorage.getItem('vipana-last-product-ids');
          const productIds: number[] = productIdsRaw ? JSON.parse(productIdsRaw) : [];
          const { data: { user } } = await supabase.auth.getUser();
          const userId = user?.id || null;
          if (userId && Array.isArray(productIds) && productIds.length > 0) {
            const payload = productIds.map(pid => ({ user_id: userId, product_id: pid, status: 'pending' }));
            await supabase.from('orders').insert(payload);
          }
        } catch {}

        // Clear cart and temp storage on success
        localStorage.removeItem('vipana-cart');
        localStorage.removeItem('vipana-last-product-ids');
      } catch (e: any) {
        setStatus('failed');
        setMessage(e.message || 'خطا در تایید پرداخت');
      }
    };
    verifyPayment();
  }, [searchParams]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-xl shadow p-6 max-w-md w-full text-center">
        <h1 className="text-xl font-bold mb-4">نتیجه پرداخت</h1>
        {status === 'verifying' && <div className="text-gray-600">در حال تایید پرداخت...</div>}
        {status === 'success' && (
          <div className="text-green-600">
            <div className="font-bold mb-2">پرداخت موفق</div>
            {refId && <div className="text-sm">کد پیگیری: {refId}</div>}
          </div>
        )}
        {status === 'failed' && <div className="text-red-600">{message || 'پرداخت ناموفق بود'}</div>}
      </div>
    </main>
  );
}

export default function ZarinpalVerifyPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-xl shadow p-6 max-w-md w-full text-center">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </main>
    }>
      <ZarinpalVerifyPageContent />
    </Suspense>
  );
}


