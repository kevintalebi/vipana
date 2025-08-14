"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { LoadingSpinnerIcon } from '../../components/Icons';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function generateRandomCode(length = 8) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

const CouponModal = ({ open, status, onClose }: { open: boolean; status: 'loading' | 'success'; onClose: () => void }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-xs w-full text-center">
        {status === 'loading' ? (
          <>
            <LoadingSpinnerIcon className="h-10 w-10 text-purple-600 mx-auto mb-4" />
            <div className="text-lg font-bold text-purple-700 mb-2">در حال ثبت تخفیف...</div>
            <div className="text-gray-600">لطفاً منتظر بمانید</div>
          </>
        ) : (
          <>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="text-lg font-bold text-green-700 mb-2">تخفیف با موفقیت ثبت شد!</div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors mt-4"
            >
              بستن
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const DeleteCouponModal = ({ open, status, onConfirm, onClose }: { open: boolean; status: 'confirm' | 'loading' | 'success'; onConfirm: () => void; onClose: () => void }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-xs w-full text-center">
        {status === 'confirm' && (
          <>
            <div className="text-lg font-bold text-purple-700 mb-2">آیا از حذف این تخفیف مطمئن هستید؟</div>
            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={onConfirm}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
              >
                بله، حذف شود
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-semibold transition-colors"
              >
                انصراف
              </button>
            </div>
          </>
        )}
        {status === 'loading' && (
          <>
            <LoadingSpinnerIcon className="h-10 w-10 text-purple-600 mx-auto mb-4" />
            <div className="text-lg font-bold text-purple-700 mb-2">در حال حذف تخفیف...</div>
            <div className="text-gray-600">لطفاً منتظر بمانید</div>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="text-lg font-bold text-green-700 mb-2">تخفیف با موفقیت حذف شد!</div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors mt-4"
            >
              بستن
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// تاریخ را به شمسی نمایش بده
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fa-IR');
};

export default function AddCouponPage() {
  const [activeTab, setActiveTab] = useState<'add' | 'list'>('add');
  const [name, setName] = useState("");
  const [numberOfCoupons, setNumberOfCoupons] = useState(1);
  const [discountPercent, setDiscountPercent] = useState(10);
  const [selectedJalaliDate, setSelectedJalaliDate] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [coupons, setCoupons] = useState<any[]>([]);
  const [couponsLoading, setCouponsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState<'loading' | 'success'>('loading');
  const [expiresAt, setExpiresAt] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteModalStatus, setDeleteModalStatus] = useState<'confirm' | 'loading' | 'success'>('confirm');
  const [couponToDelete, setCouponToDelete] = useState<string | null>(null);

  useEffect(() => {
    // Fetch seller's products
    const fetchProducts = async () => {
      setLoading(true);
      setError("");
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) throw new Error("کاربر یافت نشد");
        const { data, error } = await supabase
          .from("products")
          .select("id, name")
          .eq("user_id", user.id);
        if (error) throw new Error("خطا در دریافت محصولات");
        setProducts(data || []);
      } catch (err: any) {
        setError(err.message || "خطا در دریافت محصولات");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (activeTab === 'list') {
      const fetchCoupons = async () => {
        setCouponsLoading(true);
        setError("");
        try {
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          if (userError || !user) throw new Error("کاربر یافت نشد");
          const { data, error } = await supabase
            .from("coupons")
            .select("*")
            .eq("user_id", user.id)
            .order('created_at', { ascending: false });
          if (error) throw new Error("خطا در دریافت تخفیف‌ها");
          setCoupons(data || []);
        } catch (err: any) {
          setError(err.message || "خطا در دریافت تخفیف‌ها");
        } finally {
          setCouponsLoading(false);
        }
      };
      fetchCoupons();
    }
  }, [activeTab, success]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setModalStatus('loading');
    setModalOpen(true);
    setError("");
    setSuccess("");
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("کاربر یافت نشد");
      // Use expiresAt directly from input
      let expiresAtIso = expiresAt ? new Date(expiresAt).toISOString() : '';
      // Generate and insert multiple coupons with unique codes
      const couponsToInsert = Array.from({ length: numberOfCoupons }).map(() => ({
        user_id: user.id,
        name,
        code: generateRandomCode(),
        discount_percent: discountPercent,
        expires_at: expiresAtIso,
      }));
      const { error: insertError } = await supabase
        .from("coupons")
        .insert(couponsToInsert);
      if (insertError) throw new Error("خطا در ثبت تخفیف");
      setSuccess("تخفیف‌ها با موفقیت ثبت شدند!");
      setModalStatus('success');
      setName("");
      setDiscountPercent(10);
      setExpiresAt("");
      setNumberOfCoupons(1);
    } catch (err: any) {
      setError(err.message || "خطا در ثبت تخفیف");
      setModalOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleDeleteCoupon = async (couponId: string) => {
    setCouponToDelete(couponId);
    setDeleteModalStatus('confirm');
    setDeleteModalOpen(true);
  };

  const confirmDeleteCoupon = async () => {
    if (!couponToDelete) return;
    setDeleteModalStatus('loading');
    try {
      const { error } = await supabase.from('coupons').delete().eq('id', couponToDelete);
      if (error) throw new Error('خطا در حذف تخفیف');
      setCoupons((prev) => prev.filter((c) => c.id !== couponToDelete));
      setDeleteModalStatus('success');
    } catch (err: any) {
      setError(err.message || 'خطا در حذف تخفیف');
      setDeleteModalOpen(false);
    } finally {
      setCouponToDelete(null);
      setCouponsLoading(false);
    }
  };

  return (
    <div className="max-w mx-auto bg-white rounded-lg shadow p-8">
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-4" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('add')}
            className={`whitespace-nowrap py-4 px-1 font-medium text-sm ${
              activeTab === 'add'
                ? 'border-b-2 border-purple-600 text-purple-700'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            مدیریت تخفیف جدید
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`whitespace-nowrap py-4 px-1 font-medium text-sm ${
              activeTab === 'list'
                ? 'border-b-2 border-purple-600 text-purple-700'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            لیست تخفیف‌ها
          </button>
        </nav>
      </div>
      {activeTab === 'add' ? (
        <>
          <h1 className="text-2xl font-bold text-purple-700 mb-6">افزودن تخفیف جدید</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-1 font-semibold">نام تخفیف</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold">تعداد تخفیف</label>
              <input
                type="number"
                className="w-full border rounded px-3 py-2"
                value={numberOfCoupons}
                onChange={(e) => setNumberOfCoupons(Number(e.target.value))}
                min={1}
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold">درصد تخفیف</label>
              <input
                type="number"
                className="w-full border rounded px-3 py-2"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(Number(e.target.value))}
                min={1}
                max={100}
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold">تاریخ انقضا</label>
              <input
                type="date"
                className="w-full border rounded px-3 py-2"
                value={expiresAt}
                onChange={e => setExpiresAt(e.target.value)}
                required
              />
            </div>
            <div className="flex justify-center">
              <button
                type="submit"
                className="w-1/3 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded font-bold disabled:opacity-50"
                disabled={loading}
              >
                ثبت تخفیف
              </button>
            </div>
            {success && <div className="text-green-600 text-center mt-2">{success}</div>}
            {error && <div className="text-red-600 text-center mt-2">{error}</div>}
          </form>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold text-purple-700 mb-6">لیست تخفیف‌ها</h1>
          {couponsLoading ? (
            <div className="text-gray-500">در حال بارگذاری تخفیف‌ها...</div>
          ) : coupons.length === 0 ? (
            <div className="text-gray-400">تخفیفی ثبت نشده است.</div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="w-full text-sm border mt-4 min-w-[600px]">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 text-center">نام</th>
                    <th className="p-2 text-center">کد تخفیف</th>
                    <th className="p-2 text-center">درصد تخفیف</th>
                    <th className="p-2 text-center">تاریخ انقضا</th>
                    <th className="p-2 text-center">ایجاد شده در</th>
                    <th className="p-2 text-center">مصرف شده</th>
                    <th className="p-2 text-center">عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((coupon) => (
                    <tr key={coupon.id} className="border-t">
                      <td className="p-2 text-center">{coupon.name}</td>
                      <td className="p-2 font-mono text-center">{coupon.code}</td>
                      <td className="p-2 text-center">{coupon.discount_percent}%</td>
                      <td className="p-2 text-center">{formatDate(coupon.expires_at)}</td>
                      <td className="p-2 text-center">{formatDate(coupon.created_at)}</td>
                      <td className="p-2 text-center">{coupon.used_count ?? (coupon.used ?? coupon.is_used ? 'بله' : 'خیر') ?? 'خیر'}</td>
                      <td className="p-2 text-center">
                        <button
                          className="text-red-600 hover:underline text-sm"
                          onClick={() => handleDeleteCoupon(coupon.id)}
                          disabled={couponsLoading}
                        >
                          حذف
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
      <CouponModal open={modalOpen} status={modalStatus} onClose={() => setModalOpen(false)} />
      <DeleteCouponModal
        open={deleteModalOpen}
        status={deleteModalStatus}
        onConfirm={confirmDeleteCoupon}
        onClose={() => setDeleteModalOpen(false)}
      />
    </div>
  );
} 