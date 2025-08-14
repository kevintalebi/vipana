'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Address = {
  id: number;
  user_id: string;
  title: string;
  province: string;
  city: string;
  address: string;
  postal?: string | null;
};

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState<Partial<Address>>({
    title: '',
    province: '',
    city: '',
    address: '',
    postal: '',
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      setError('');
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id || null;
      setCurrentUserId(uid);
      if (!uid) {
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', uid)
        .order('id', { ascending: false });
      if (error) setError('خطا در دریافت آدرس‌ها');
      setAddresses((data as Address[]) || []);
      setLoading(false);
    };
    init();
  }, []);

  const resetForm = () => {
    setForm({ title: '', province: '', city: '', address: '', postal: '' });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId) return;
    setError('');
    try {
      if (editingId) {
        const { error } = await supabase
          .from('addresses')
          .update({
            title: form.title,
            province: form.province,
            city: form.city,
            address: form.address,
            postal: form.postal || null,
          })
          .eq('id', editingId)
          .eq('user_id', currentUserId);
        if (error) throw error;
        setAddresses(prev => prev.map(a => a.id === editingId ? { ...a, ...(form as Address) } : a));
      } else {
        const { data, error } = await supabase
          .from('addresses')
          .insert([
            {
              user_id: currentUserId,
              title: form.title,
              province: form.province,
              city: form.city,
              address: form.address,
              postal: form.postal || null,
            },
          ])
          .select()
          .single();
        if (error) throw error;
        if (data) setAddresses(prev => [data as Address, ...prev]);
      }
      resetForm();
    } catch (e) {
      setError('ثبت/ویرایش آدرس با خطا مواجه شد');
    }
  };

  const handleEdit = (addr: Address) => {
    setEditingId(addr.id);
    setForm({
      title: addr.title,
      province: addr.province,
      city: addr.city,
      address: addr.address,
      postal: addr.postal || '',
    });
  };

  const handleDelete = async (id: number) => {
    if (!currentUserId) return;
    try {
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', id)
        .eq('user_id', currentUserId);
      if (error) throw error;
      setAddresses(prev => prev.filter(a => a.id !== id));
      if (editingId === id) resetForm();
    } catch (e) {
      setError('حذف آدرس با خطا مواجه شد');
    }
  };

  return (
    <main className="min-h-screen p-4 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-center text-purple-700 mb-6">آدرس‌ها</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-center">{error}</div>
        )}

        {/* Form */}
        {currentUserId ? (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-4 mb-6 grid grid-cols-1 gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">عنوان آدرس (مثلاً خانه، محل کار)</label>
                <input className="w-full border rounded-lg px-3 py-2" value={form.title || ''} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">استان</label>
                <input className="w-full border rounded-lg px-3 py-2" value={form.province || ''} onChange={e => setForm(p => ({ ...p, province: e.target.value }))} required />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">شهر</label>
                <input className="w-full border rounded-lg px-3 py-2" value={form.city || ''} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">کد پستی</label>
                <input className="w-full border rounded-lg px-3 py-2" value={form.postal || ''} onChange={e => setForm(p => ({ ...p, postal: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">آدرس</label>
              <textarea className="w-full border rounded-lg px-3 py-2 min-h-[90px]" value={form.address || ''} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} required />
            </div>
            <div className="flex gap-3 justify-center">
              {editingId && (
                <button type="button" onClick={resetForm} className="px-4 py-2 rounded-lg border">لغو ویرایش</button>
              )}
              <button type="submit" className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold">
                {editingId ? 'به‌روزرسانی آدرس' : 'افزودن آدرس'}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center text-gray-600 bg-white rounded-xl p-4 shadow mb-6">برای مدیریت آدرس‌ها، ابتدا وارد شوید.</div>
        )}

        {/* List */}
        <div className="grid gap-3">
          {loading ? (
            <div className="text-center text-gray-500">در حال دریافت آدرس‌ها...</div>
          ) : addresses.length === 0 ? (
            <div className="text-center text-gray-500">آدرسی ثبت نشده است.</div>
          ) : (
            addresses.map(addr => (
              <div key={addr.id} className="bg-white rounded-xl shadow p-4 flex items-start justify-between gap-4">
                <div>
                  <div className="font-bold text-gray-800">{addr.title}</div>
                  <div className="text-sm text-gray-600 mt-1">{addr.province} • {addr.city} • {addr.postal || '-'}</div>
                  <div className="text-gray-700 mt-2">{addr.address}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(addr)} className="px-3 py-2 rounded-lg border text-sm">ویرایش</button>
                  <button onClick={() => handleDelete(addr.id)} className="px-3 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm">حذف</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}


