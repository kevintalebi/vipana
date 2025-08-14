'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type ProfileRow = {
  id?: string | number;
  email?: string;
  role?: string;
  full_name?: string | null;
  mobile?: string | null;
  dob?: string | null; // YYYY-MM-DD
  avatar_url?: string | null;
};

type BuyerRow = {
  user_id: string;
  email?: string | null;
  name?: string | null;
  mobile?: string | null;
  birthday?: string | null;
  image_url?: string | null;
};

export default function UserInfoPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [authEmail, setAuthEmail] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [dob, setDob] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fallbackUrls, setFallbackUrls] = useState<string[]>([]);
  const [fallbackIdx, setFallbackIdx] = useState(0);

  // Phone verification state
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState('');
  const [phoneVerifying, setPhoneVerifying] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      setError('');
      setSuccess('');
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          throw new Error('کاربر یافت نشد. لطفاً وارد شوید.');
        }
        setAuthEmail(user.email || '');
        setEmailInput(user.email || '');

        // Prepare default/fallback avatar URLs
        const u1 = supabase.storage.from('profiles').getPublicUrl('profile.jpg').data.publicUrl;
        const u2 = supabase.storage.from('profiles').getPublicUrl('profiles/profile.jpg').data.publicUrl;
        setFallbackUrls([u1, u2, '/vipana.png']);

        // Load from buyers first
        const { data: buyer, error: buyerError } = await supabase
          .from('buyers')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (!buyerError && buyer) {
          const b = buyer as BuyerRow;
          setFullName(b.name || '');
          setMobile(b.mobile || '');
          setDob(b.birthday || '');
          setAvatarUrl(b.image_url || null);
        }

        // Set default avatar if none present
        setAvatarUrl((prev) => prev || u1 || u2 || '/vipana.png');
      } catch (e: any) {
        setError(e.message || 'خطا در بارگذاری اطلاعات');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const preview = URL.createObjectURL(file);
      setAvatarUrl(preview);
    }
  };

  const uploadAvatarIfNeeded = async (): Promise<string | null> => {
    if (!avatarFile) return avatarUrl || null;
    try {
      const ext = avatarFile.name.split('.').pop();
      const filePath = `profiles/${Date.now()}-avatar.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, avatarFile, { upsert: true });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('profiles').getPublicUrl(filePath);
      return data.publicUrl;
    } catch (e) {
      throw new Error('خطا در آپلود تصویر پروفایل');
    }
  };

  const saveBasicInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('کاربر یافت نشد');

      const finalAvatarUrl = await uploadAvatarIfNeeded();

      // Insert or update buyers row by user_id (avoid on_conflict requirement)
      const updateFields: Partial<BuyerRow> = {
        name: fullName || null,
        birthday: dob || null,
        image_url: finalAvatarUrl || null,
        email: user.email || null,
      };

      const { data: existingRows } = await supabase
        .from('buyers')
        .select('user_id')
        .eq('user_id', user.id)
        .limit(1);

      if (existingRows && existingRows.length > 0) {
        const { error: updErr } = await supabase
          .from('buyers')
          .update(updateFields)
          .eq('user_id', user.id);
        if (updErr) throw updErr;
      } else {
        const insertRow: BuyerRow = {
          user_id: user.id,
          email: user.email || null,
          name: fullName || null,
          birthday: dob || null,
          image_url: finalAvatarUrl || null,
          mobile: mobile || null,
        } as BuyerRow;
        const { error: insErr } = await supabase
          .from('buyers')
          .insert([insertRow]);
        if (insErr) throw insErr;
      }

      setSuccess('اطلاعات با موفقیت ذخیره شد.');
      setAvatarFile(null);
    } catch (e: any) {
      setError(e.message || 'خطا در ذخیره اطلاعات');
    } finally {
      setSaving(false);
    }
  };

  const startPhoneVerification = async () => {
    setError('');
    setSuccess('');
    try {
      if (!mobile) throw new Error('شماره موبایل را وارد کنید');
      // Trigger Supabase phone change OTP
      const { error: updErr } = await supabase.auth.updateUser({ phone: mobile });
      if (updErr) throw updErr;
      setPhoneOtpSent(true);
      setSuccess('کد تایید به شماره وارد شده ارسال شد.');
    } catch (e: any) {
      setError(e.message || 'ارسال کد تایید با خطا مواجه شد');
    }
  };

  const verifyPhoneCode = async () => {
    setPhoneVerifying(true);
    setError('');
    setSuccess('');
    try {
      if (!mobile || !phoneOtp) throw new Error('شماره و کد تایید را وارد کنید');
      const { error: verifyErr } = await supabase.auth.verifyOtp({
        phone: mobile,
        token: phoneOtp,
        type: 'phone_change',
      } as any);
      if (verifyErr) throw verifyErr;
      // Persist mobile to buyers table after successful verification
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) {
        const { data: existingRows } = await supabase
          .from('buyers')
          .select('user_id')
          .eq('user_id', user.id)
          .limit(1);
        if (existingRows && existingRows.length > 0) {
          await supabase.from('buyers').update({ mobile }).eq('user_id', user.id);
        } else {
          await supabase.from('buyers').insert([{ user_id: user.id, email: user.email || null, mobile }]);
        }
      }
      setSuccess('شماره موبایل با موفقیت تایید شد.');
      setPhoneOtp('');
      setPhoneOtpSent(false);
    } catch (e: any) {
      setError(e.message || 'تایید کد با خطا مواجه شد');
    } finally {
      setPhoneVerifying(false);
    }
  };

  const changeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (!emailInput) throw new Error('ایمیل را وارد کنید');
      if (emailInput === authEmail) {
        setSuccess('ایمیل تغییری نکرد.');
        return;
      }
      const { error: updErr } = await supabase.auth.updateUser({ email: emailInput });
      if (updErr) throw updErr;
      setSuccess('لینک تایید به ایمیل جدید ارسال شد. پس از تایید، مجدداً وارد شوید.');
    } catch (e: any) {
      setError(e.message || 'تغییر ایمیل با خطا مواجه شد');
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangingPassword(true);
    setError('');
    setSuccess('');
    try {
      if (!newPassword || newPassword.length < 6) throw new Error('رمز عبور جدید حداقل ۶ کاراکتر باشد');
      if (newPassword !== confirmNewPassword) throw new Error('تکرار رمز عبور جدید مطابقت ندارد');
      const { error: updErr } = await supabase.auth.updateUser({ password: newPassword });
      if (updErr) throw updErr;
      setSuccess('رمز عبور با موفقیت تغییر کرد.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (e: any) {
      setError(e.message || 'تغییر رمز عبور با خطا مواجه شد');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen p-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-purple-700 text-center mb-6">اطلاعات کاربری</h1>
          <div className="text-center text-gray-500">در حال بارگذاری...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-purple-700 text-center mb-6">اطلاعات کاربری</h1>

        {(error || success) && (
          <div className="mb-4">
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-center">{error}</div>}
            {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded text-center mt-2">{success}</div>}
          </div>
        )}

        {/* Basic info + avatar */}
        <form onSubmit={saveBasicInfo} className="bg-white rounded-xl shadow p-4 mb-6 space-y-4">
          <div className="flex flex-col items-center gap-3">
            <div className="relative w-28 h-28 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt=""
                  className="object-cover w-full h-full"
                  onError={() => {
                    setFallbackIdx((idx) => {
                      const next = Math.min(idx + 1, Math.max(0, fallbackUrls.length - 1));
                      if (fallbackUrls[next] && fallbackUrls[next] !== avatarUrl) {
                        setAvatarUrl(fallbackUrls[next]);
                      }
                      return next;
                    });
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">?</div>
              )}
              <button
                type="button"
                className="absolute bottom-2 left-2 bg-purple-600 text-white rounded-full px-3 py-1 text-xs hover:bg-purple-700"
                onClick={() => fileInputRef.current?.click()}
              >
                تغییر تصویر
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">نام و نام خانوادگی</label>
            <input
              className="w-full border rounded-lg px-3 py-2"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="مثلاً علی رضایی"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">تاریخ تولد</label>
              <input
                type="date"
                className="w-full border rounded-lg px-3 py-2"
                value={dob || ''}
                onChange={(e) => setDob(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-center">
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold disabled:opacity-50"
              disabled={saving}
            >
              {saving ? 'در حال ذخیره...' : 'ذخیره اطلاعات'}
            </button>
          </div>
        </form>

        {/* Mobile with verification */}
        <div className="bg-white rounded-xl shadow p-4 mb-6 space-y-3">
          <div className="font-bold text-gray-800">شماره موبایل</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-600 mb-1">شماره موبایل</label>
              <input
                className="w-full border rounded-lg px-3 py-2"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="09xxxxxxxxx"
                inputMode="tel"
              />
            </div>
            <div>
              {!phoneOtpSent ? (
                <button
                  onClick={startPhoneVerification}
                  className="w-full px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                >
                  ارسال کد تایید
                </button>
              ) : (
                <button
                  onClick={() => setPhoneOtpSent(false)}
                  className="w-full px-4 py-2 rounded-lg border font-semibold"
                >
                  تغییر شماره
                </button>
              )}
            </div>
          </div>
          {phoneOtpSent && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600 mb-1">کد تایید</label>
                <input
                  className="w-full border rounded-lg px-3 py-2"
                  value={phoneOtp}
                  onChange={(e) => setPhoneOtp(e.target.value)}
                  placeholder="کد ۶ رقمی"
                  inputMode="numeric"
                />
              </div>
              <div>
                <button
                  onClick={verifyPhoneCode}
                  className="w-full px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold disabled:opacity-50"
                  disabled={phoneVerifying}
                >
                  {phoneVerifying ? 'در حال تایید...' : 'تایید شماره'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Email with verification link */}
        <form onSubmit={changeEmail} className="bg-white rounded-xl shadow p-4 mb-6 space-y-3">
          <div className="font-bold text-gray-800">ایمیل</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-600 mb-1">ایمیل</label>
              <input
                type="email"
                className="w-full border rounded-lg px-3 py-2"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="example@email.com"
              />
            </div>
            <div>
              <button
                type="submit"
                className="w-full px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
              >
                تغییر ایمیل
              </button>
            </div>
          </div>
          <div className="text-xs text-gray-500">برای تایید ایمیل جدید، لینک ارسال‌شده را باز کنید.</div>
        </form>

        {/* Password change */}
        <form onSubmit={changePassword} className="bg-white rounded-xl shadow p-4 mb-8 space-y-3">
          <div className="font-bold text-gray-800">تغییر رمز عبور</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">رمز عبور فعلی</label>
              <input
                type="password"
                className="w-full border rounded-lg px-3 py-2"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">رمز عبور جدید</label>
              <input
                type="password"
                className="w-full border rounded-lg px-3 py-2"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">تکرار رمز جدید</label>
              <input
                type="password"
                className="w-full border rounded-lg px-3 py-2"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>
          <div className="flex justify-center">
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold disabled:opacity-50"
              disabled={changingPassword}
            >
              {changingPassword ? 'در حال بروزرسانی...' : 'تغییر رمز عبور'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}


