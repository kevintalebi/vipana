'use client';
import React, { useEffect, useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { LoadingSpinnerIcon } from '../../components/Icons';
import Head from 'next/head';
import Dropzone from '../../components/Dropzone';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ProfileModal = ({ open, status, onClose }: { open: boolean; status: 'loading' | 'success'; onClose: () => void }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-xs w-full text-center">
        {status === 'loading' ? (
          <>
            <LoadingSpinnerIcon className="h-10 w-10 text-purple-600 mx-auto mb-4" />
            <div className="text-lg font-bold text-purple-700 mb-2">در حال ذخیره تغییرات...</div>
            <div className="text-gray-600">لطفاً منتظر بمانید</div>
          </>
        ) : (
          <>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="text-lg font-bold text-green-700 mb-2">تغییرات با موفقیت ذخیره شد!</div>
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

export default function SellerProfilePage() {
  const [activeTab, setActiveTab] = useState('profile');

  // Profile State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [seller, setSeller] = useState<any>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState<'loading' | 'success'>('loading');

  // Bank Info State
  const [accountHolder, setAccountHolder] = useState('');
  const [iban, setIban] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  // Verification State
  const [holderName, setHolderName] = useState('');
  const [holderSurname, setHolderSurname] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [verificationFile, setVerificationFile] = useState<File | null>(null);
  const [verificationImageUrl, setVerificationImageUrl] = useState<string | null>(null);

  // Social Media State
  const [socialMediaName, setSocialMediaName] = useState('Instagram');
  const [socialMediaUrl, setSocialMediaUrl] = useState('');
  const socialMediaOptions = [
    'Instagram',
    'Telegram',
    'WhatsApp',
    'LinkedIn',
    'Twitter',
    'Facebook',
    'YouTube',
    'Aparat',
    'Other',
  ];
  // Social Modal State
  const [socialModalOpen, setSocialModalOpen] = useState(false);
  const [socialModalStatus, setSocialModalStatus] = useState<'loading' | 'success'>('loading');
  const [socialError, setSocialError] = useState('');
  const [socialSuccess, setSocialSuccess] = useState('');

  // Socials State
  const [socials, setSocials] = useState<any[]>([]);

  // Edit social
  const [editingSocialId, setEditingSocialId] = useState<string | null>(null);

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editSocialId, setEditSocialId] = useState<string | null>(null);
  const [editSocialUrl, setEditSocialUrl] = useState('');
  const [editModalStatus, setEditModalStatus] = useState<'loading' | 'success'>('loading');
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState(false);

  // Social media icons
  const socialMediaIcons: Record<string, React.ReactNode> = {
    Instagram: (
      <svg className="w-6 h-6 text-pink-500" fill="currentColor" viewBox="0 0 24 24"><path d="M7.75 2A5.75 5.75 0 0 0 2 7.75v8.5A5.75 5.75 0 0 0 7.75 22h8.5A5.75 5.75 0 0 0 22 16.25v-8.5A5.75 5.75 0 0 0 16.25 2h-8.5zm0 1.5h8.5A4.25 4.25 0 0 1 20.5 7.75v8.5A4.25 4.25 0 0 1 16.25 20.5h-8.5A4.25 4.25 0 0 1 3.5 16.25v-8.5A4.25 4.25 0 0 1 7.75 3.5zm8.25 2a1 1 0 1 0 0 2 1 1 0 0 0 0-2zM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 1.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7z" /></svg>
    ),
    Telegram: (
      <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M21.944 4.667a1.5 1.5 0 0 0-1.7-.217L3.7 12.25a1.5 1.5 0 0 0 .1 2.75l3.7 1.5 1.5 3.7a1.5 1.5 0 0 0 2.75.1l7.8-16.544a1.5 1.5 0 0 0-.106-1.589z" /></svg>
    ),
    WhatsApp: (
      <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 0-8.94 14.19l-1.06 3.88a1 1 0 0 0 1.22 1.22l3.88-1.06A10 10 0 1 0 12 2zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm4.29-5.71a1 1 0 0 0-1.42 0l-.88.88a7.07 7.07 0 0 1-3.29-3.29l.88-.88a1 1 0 0 0 0-1.42l-2-2a1 1 0 0 0-1.42 0A5.94 5.94 0 0 0 6 12a6 6 0 0 0 6 6 5.94 5.94 0 0 0 3.41-1.29 1 1 0 0 0 0-1.42z" /></svg>
    ),
    LinkedIn: (
      <svg className="w-6 h-6 text-blue-700" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.28c-.97 0-1.75-.79-1.75-1.75s.78-1.75 1.75-1.75 1.75.79 1.75 1.75-.78 1.75-1.75 1.75zm13.5 11.28h-3v-5.5c0-1.1-.9-2-2-2s-2 .9-2 2v5.5h-3v-10h3v1.5c.41-.59 1.19-1.5 2.5-1.5 1.93 0 3.5 1.57 3.5 3.5v6.5z" /></svg>
    ),
    Twitter: (
      <svg className="w-6 h-6 text-sky-400" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557a9.93 9.93 0 0 1-2.828.775 4.932 4.932 0 0 0 2.165-2.724c-.951.564-2.005.974-3.127 1.195a4.92 4.92 0 0 0-8.384 4.482C7.691 8.095 4.066 6.13 1.64 3.161c-.542.929-.856 2.01-.857 3.17 0 2.188 1.115 4.117 2.823 5.254a4.904 4.904 0 0 1-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.936 4.936 0 0 1-2.224.084c.627 1.956 2.444 3.377 4.6 3.417A9.867 9.867 0 0 1 0 21.543a13.94 13.94 0 0 0 7.548 2.209c9.057 0 14.009-7.496 14.009-13.986 0-.213-.005-.425-.014-.636A10.012 10.012 0 0 0 24 4.557z" /></svg>
    ),
    Facebook: (
      <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.326 24h11.495v-9.294H9.691v-3.622h3.13V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0"/></svg>
    ),
    YouTube: (
      <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a2.994 2.994 0 0 0-2.112-2.112C19.458 3.5 12 3.5 12 3.5s-7.458 0-9.386.574A2.994 2.994 0 0 0 .502 6.186C0 8.114 0 12 0 12s0 3.886.502 5.814a2.994 2.994 0 0 0 2.112 2.112C4.542 20.5 12 20.5 12 20.5s7.458 0 9.386-.574a2.994 2.994 0 0 0 2.112-2.112C24 15.886 24 12 24 12s0-3.886-.502-5.814zM9.75 15.5v-7l6.5 3.5-6.5 3.5z"/></svg>
    ),
    Aparat: (
      <svg className="w-6 h-6 text-rose-500" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="4" fill="#fff" /><circle cx="12" cy="12" r="2" /><rect x="11" y="6" width="2" height="2" /><rect x="11" y="16" width="2" height="2" /><rect x="6" y="11" width="2" height="2" /><rect x="16" y="11" width="2" height="2" /></svg>
    ),
    Other: (
      <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 8h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2" /><rect x="7" y="4" width="10" height="4" rx="2" /></svg>
    ),
  };

  // Delete confirmation modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteSocialId, setDeleteSocialId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSeller = async () => {
      setLoading(true);
      setError('');
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) throw new Error('کاربر یافت نشد. لطفاً دوباره وارد شوید.');
        // فرض: جدول sellers با user_id
        const { data, error } = await supabase
          .from('sellers')
          .select('*')
          .eq('user_id', user.id)
          .single();
        if (error || !data) throw new Error('فروشگاه شما یافت نشد.');
        setSeller(data);
        setName(data.name || '');
        setDescription(data.description || '');
        if (data.profile_image) {
          setProfileImage(data.profile_image);
        } else {
          const d1 = supabase.storage.from('profiles').getPublicUrl('profile.jpg').data.publicUrl;
          const d2 = supabase.storage.from('profiles').getPublicUrl('profiles/profile.jpg').data.publicUrl;
          setProfileImage(d1 || d2 || '/vipana.png');
        }
        // Load bank info
        setAccountHolder(data.bank_account_holder || '');
        setIban(data.bank_account_iban || '');
        setAccountNumber(data.bank_account_number || '');
        // Load verification info
        setHolderName(data.holder_name || '');
        setHolderSurname(data.holder_surname || '');
        setNationalId(data.national_code || '');
        setVerificationImageUrl(data.verification_image || null);
      } catch (err: any) {
        setError(err.message || 'خطا در دریافت اطلاعات فروشگاه');
      } finally {
        setLoading(false);
      }
    };
    fetchSeller();
  }, []);

  // Fetch socials when tab is active or after save
  useEffect(() => {
    const fetchSocials = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) return;
      const { data, error } = await supabase
        .from('socials')
        .select('*')
        .eq('user_id', user.id);
      if (!error && data) setSocials(data);
    };
    if (activeTab === 'social' || socialSuccess || editSuccess) {
      fetchSocials();
      if (editSuccess) setEditSuccess(false);
    }
  }, [activeTab, socialSuccess, editSuccess]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setProfileImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    setModalStatus('loading');
    setModalOpen(true);
    try {
      if (!seller) {
        setError('اطلاعات فروشگاه یافت نشد.');
        setLoading(false);
        setModalOpen(false);
        return;
      }
      let uploadedImageUrl = seller.profile_image || null;
      if (imageFile) {
        // آپلود تصویر جدید به supabase storage
        const ext = imageFile.name.split('.').pop();
        const filePath = `profiles/${Date.now()}-profile.${ext}`;
        console.log('Uploading profile image to:', filePath);
        const { data: uploadData, error: uploadError } = await supabase.storage.from('profiles').upload(filePath, imageFile, { upsert: true });
        if (uploadError) {
          console.error('Image upload error:', uploadError);
          throw new Error('خطا در آپلود تصویر');
        }
        const { data: urlData } = supabase.storage.from('profiles').getPublicUrl(filePath);
        uploadedImageUrl = urlData.publicUrl;
        console.log('Profile image uploaded. Public URL:', uploadedImageUrl);
      }
      // بروزرسانی اطلاعات فروشگاه
      const updateData = { name, description, profile_image: uploadedImageUrl };
      console.log('Updating seller with data:', updateData, 'Seller ID:', seller.id);
      const { data: updateResult, error: updateError } = await supabase
        .from('sellers')
        .update(updateData)
        .eq('id', seller.id)
        .select();
      console.log('Update result:', updateResult, 'Update error:', updateError);
      if (updateError) throw new Error('خطا در بروزرسانی اطلاعات');
      setSuccess('اطلاعات با موفقیت ذخیره شد.');
      setImageFile(null);
      setModalStatus('success');
    } catch (err: any) {
      setError(err.message || 'خطا در ذخیره اطلاعات');
      setModalOpen(false);
      console.error('Save error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBankSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    setModalStatus('loading');
    setModalOpen(true);

    try {
      if (!seller) {
        throw new Error('اطلاعات فروشگاه یافت نشد.');
      }

      const updateData = {
        bank_account_holder: accountHolder,
        bank_account_iban: iban,
        bank_account_number: accountNumber,
      };

      const { error: updateError } = await supabase
        .from('sellers')
        .update(updateData)
        .eq('id', seller.id);

      if (updateError) {
        throw new Error('خطا در بروزرسانی اطلاعات بانکی');
      }

      setSuccess('اطلاعات بانکی با موفقیت ذخیره شد.');
      setModalStatus('success');
    } catch (err: any) {
      setError(err.message || 'خطا در ذخیره اطلاعات');
      setModalOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    setModalStatus('loading');
    setModalOpen(true);

    try {
      if (!seller) {
        throw new Error('اطلاعات فروشگاه یافت نشد.');
      }

      let finalImageUrl = verificationImageUrl;

      if (verificationFile) {
        const ext = verificationFile.name.split('.').pop();
        const filePath = `verifications/${seller.user_id}-${Date.now()}.${ext}`;
        
        const { error: uploadError } = await supabase.storage
          .from('verification')
          .upload(filePath, verificationFile, { upsert: true });

        if (uploadError) {
          throw new Error('خطا در آپلود فایل احراز هویت');
        }

        const { data: urlData } = supabase.storage
          .from('verification')
          .getPublicUrl(filePath);
        
        finalImageUrl = urlData.publicUrl;
      }

      const updateData = {
        holder_name: holderName,
        holder_surname: holderSurname,
        national_code: nationalId,
        verification_image: finalImageUrl,
      };

      const { error: updateError } = await supabase
        .from('sellers')
        .update(updateData)
        .eq('id', seller.id);

      if (updateError) {
        throw new Error('خطا در بروزرسانی اطلاعات احراز هویت');
      }

      setSuccess('اطلاعات احراز هویت با موفقیت ذخیره شد.');
      setVerificationImageUrl(finalImageUrl);
      setVerificationFile(null);
      setModalStatus('success');
    } catch (err: any) {
      setError(err.message || 'خطا در ذخیره اطلاعات');
      setModalOpen(false);
    } finally {
      setLoading(false);
    }
  };

  // Delete social
  const handleDeleteSocial = (id: string) => {
    setDeleteSocialId(id);
    setDeleteModalOpen(true);
  };

  const confirmDeleteSocial = async () => {
    if (!deleteSocialId) return;
    setDeleteModalOpen(false);
    setSocialModalStatus('loading');
    setSocialModalOpen(true);
    try {
      const { error } = await supabase.from('socials').delete().eq('id', deleteSocialId);
      if (error) throw new Error('خطا در حذف شبکه اجتماعی');
      setSocialSuccess('شبکه اجتماعی با موفقیت حذف شد.');
      setSocialModalStatus('success');
    } catch (err: any) {
      setSocialError(err.message || 'خطا در حذف اطلاعات');
      setSocialModalOpen(false);
    } finally {
      setDeleteSocialId(null);
    }
  };

  // Edit social
  const handleEditSocial = (item: any) => {
    setEditSocialId(item.id);
    setEditSocialUrl(item.social_url);
    setEditModalOpen(true);
    setEditError('');
  };

  // Edit modal submit
  const handleEditModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditModalStatus('loading');
    setEditError('');
    try {
      const { error } = await supabase
        .from('socials')
        .update({ social_url: editSocialUrl })
        .eq('id', editSocialId);
      if (error) throw new Error('خطا در بروزرسانی آدرس شبکه اجتماعی');
      setEditModalStatus('success');
      setEditSocialId(null);
      setEditSuccess(true);
      setTimeout(() => setEditModalOpen(false), 1000);
    } catch (err: any) {
      setEditError(err.message || 'خطا در بروزرسانی');
      setEditModalOpen(false);
    }
  };

  // Update or insert on submit
  const handleSocialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSocialError('');
    setSocialSuccess('');
    setSocialModalStatus('loading');
    setSocialModalOpen(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('کاربر یافت نشد. لطفاً دوباره وارد شوید.');
      if (editingSocialId) {
        // Update
        const { error: updateError } = await supabase
          .from('socials')
          .update({
            social_type: socialMediaName,
            social_url: socialMediaUrl,
          })
          .eq('id', editingSocialId);
        if (updateError) throw new Error('خطا در بروزرسانی اطلاعات شبکه اجتماعی');
        setSocialSuccess('اطلاعات شبکه اجتماعی با موفقیت ویرایش شد.');
      } else {
        // Insert
        const { error: insertError } = await supabase
          .from('socials')
          .insert({
            user_id: user.id,
            social_type: socialMediaName,
            social_url: socialMediaUrl,
          });
        if (insertError) throw new Error('خطا در ذخیره اطلاعات شبکه اجتماعی');
        setSocialSuccess('اطلاعات شبکه اجتماعی با موفقیت ذخیره شد.');
      }
      setSocialModalStatus('success');
      setSocialMediaUrl('');
      setEditingSocialId(null);
    } catch (err: any) {
      setSocialError(err.message || 'خطا در ذخیره اطلاعات');
      setSocialModalOpen(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                {profileImage ? (
                  <img src={profileImage} alt="پروفایل" className="object-cover w-full h-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">?</div>
                )}
                <button
                  type="button"
                  className="absolute bottom-2 left-2 bg-purple-600 text-white rounded-full p-2 text-xs hover:bg-purple-700"
                  onClick={() => fileInputRef.current?.click()}
                  title="تغییر تصویر"
                >
                  ویرایش
                </button>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                />
              </div>
            </div>
            <div>
              <label className="block mb-1 font-semibold">نام فروشگاه</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold">توضیحات فروشگاه</label>
              <textarea
                className="w-full border rounded px-3 py-2"
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex justify-center">
              <button
                type="submit"
                className="w-1/3 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded font-bold disabled:opacity-50"
                disabled={loading}
              >
                ذخیره تغییرات
              </button>
            </div>
            {success && <div className="text-green-600 text-center mt-2">{success}</div>}
          </form>
        );
      case 'bank':
        return (
          <form onSubmit={handleBankSubmit} className="space-y-6">
            <div>
              <label className="block mb-1 font-semibold">نام صاحب حساب</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                value={accountHolder}
                onChange={e => setAccountHolder(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold">شماره شبا (IBAN)</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                value={iban}
                onChange={e => setIban(e.target.value)}
                placeholder="IR..."
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold">شماره حساب</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                value={accountNumber}
                onChange={e => setAccountNumber(e.target.value)}
                required
              />
            </div>
            <div className="flex justify-center">
              <button
                type="submit"
                className="w-1/3 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded font-bold disabled:opacity-50"
                disabled={loading}
              >
                ذخیره اطلاعات بانکی
              </button>
            </div>
          </form>
        );
      case 'verification':
        return (
          <form onSubmit={handleVerificationSubmit} className="space-y-6">
            <div>
              <label className="block mb-1 font-semibold">نام</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                value={holderName}
                onChange={e => setHolderName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold">نام خانوادگی</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                value={holderSurname}
                onChange={e => setHolderSurname(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold">کد ملی</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                value={nationalId}
                onChange={e => setNationalId(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold">فایل احراز هویت</label>
              {verificationImageUrl && !verificationFile ? (
                <div className="mt-2 flex flex-col items-center">
                  <img src={verificationImageUrl} alt="تصویر احراز هویت" className="w-full max-w-full rounded-lg shadow-md border sm:max-w-xs" />
                  <button
                    type="button"
                    onClick={() => {
                      setVerificationImageUrl(null);
                      setVerificationFile(null);
                    }}
                    className="mt-2 text-sm text-purple-600 hover:underline"
                  >
                    تغییر یا حذف تصویر
                  </button>
                </div>
              ) : (
                <Dropzone onFileChange={setVerificationFile} />
              )}
            </div>
            <div className="flex justify-center">
              <button
                type="submit"
                className="w-1/3 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded font-bold disabled:opacity-50"
                disabled={loading}
              >
                ارسال برای تایید
              </button>
            </div>
          </form>
        );
      case 'social':
        return (
          <>
            <form className="space-y-6 max-w-md mx-auto mt-8" onSubmit={handleSocialSubmit}>
              <div>
                <label className="block mb-1 font-semibold">انتخاب شبکه اجتماعی</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={socialMediaName}
                  onChange={e => setSocialMediaName(e.target.value)}
                >
                  {socialMediaOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1 font-semibold">آدرس شبکه اجتماعی</label>
                <input
                  type="url"
                  className="w-full border rounded px-3 py-2"
                  value={socialMediaUrl}
                  onChange={e => setSocialMediaUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div className="flex justify-center">
                <button
                  type="submit"
                  className="w-1/3 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded font-bold disabled:opacity-50"
                  disabled={!socialMediaUrl}
                >
                  ذخیره اطلاعات
                </button>
              </div>
              {socialSuccess && <div className="text-green-600 text-center mt-2">{socialSuccess}</div>}
              {socialError && <div className="text-red-600 text-center mt-2">{socialError}</div>}
            </form>
            {/* Socials List */}
            <div className="max-w-md mx-auto mt-8">
              <h3 className="font-bold mb-2">شبکه‌های اجتماعی ثبت‌شده:</h3>
              {socials.length === 0 ? (
                <div className="text-gray-500 text-center">شبکه اجتماعی ثبت نشده است.</div>
              ) : (
                <ul className="space-y-2">
                  {socials.map((item) => (
                    <li key={item.id} className="flex items-center justify-between bg-gray-50 rounded px-3 py-2 gap-2 flex-wrap">
                      <span className="font-semibold flex items-center">{socialMediaIcons[item.social_type] || socialMediaIcons.Other}</span>
                      <a href={item.social_url} target="_blank" rel="noopener noreferrer" className="text-purple-700 hover:underline break-all">{item.social_url}</a>
                      <div className="flex gap-2">
                        <button
                          className="text-blue-600 hover:underline text-sm"
                          onClick={() => handleEditSocial(item)}
                          type="button"
                        >
                          ویرایش
                        </button>
                        <button
                          className="text-red-600 hover:underline text-sm"
                          onClick={() => handleDeleteSocial(item.id)}
                          type="button"
                        >
                          حذف
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Head>
        <title>تنظیمات فروشگاه</title>
        <meta name="description" content="تنظیمات پروفایل، اطلاعات بانکی و احراز هویت فروشگاه" />
      </Head>
      <div className="bg-white rounded-xl shadow-lg p-8 max-w mx-auto">
        <h1 className="text-2xl font-bold text-purple-700 mb-6">تنظیمات فروشگاه</h1>

        <div className="border-b border-gray-200">
          <div className="overflow-x-auto overflow-y-hidden">
            <nav className="-mb-px flex space-x-4 min-w-max" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('profile')}
                className={`${
                  activeTab === 'profile'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                پروفایل فروشگاه
              </button>
              <button
                onClick={() => setActiveTab('bank')}
                className={`${
                  activeTab === 'bank'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                اطلاعات بانکی
              </button>
              <button
                onClick={() => setActiveTab('verification')}
                className={`${
                  activeTab === 'verification'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                احراز هویت
              </button>
              <button
                onClick={() => setActiveTab('social')}
                className={`${
                  activeTab === 'social'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                شبکه‌های اجتماعی
              </button>
            </nav>
          </div>
        </div>

        <div className="mt-8">
          {loading && activeTab === 'profile' ? (
            <div className="text-center text-gray-500">در حال بارگذاری...</div>
          ) : error ? (
            <div className="text-center text-red-500 mb-4">{error}</div>
          ) : (
            renderContent()
          )}
        </div>
        
        <ProfileModal open={modalOpen} status={modalStatus} onClose={() => setModalOpen(false)} />
        <ProfileModal open={socialModalOpen} status={socialModalStatus} onClose={() => setSocialModalOpen(false)} />
        {/* Delete confirmation modal */}
        {deleteModalOpen && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-xs w-full text-center">
              <div className="text-lg font-bold text-purple-700 mb-2">آیا از حذف این شبکه اجتماعی مطمئن هستید؟</div>
              <div className="flex justify-center gap-4 mt-6">
                <button
                  onClick={confirmDeleteSocial}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
                >
                  بله، حذف شود
                </button>
                <button
                  onClick={() => { setDeleteModalOpen(false); setDeleteSocialId(null); }}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-semibold transition-colors"
                >
                  انصراف
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Edit Social Modal */}
        {editModalOpen && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-xs w-full text-center">
              <form onSubmit={handleEditModalSubmit} className="space-y-4">
                <div className="text-lg font-bold text-purple-700 mb-2">ویرایش آدرس شبکه اجتماعی</div>
                <input
                  type="url"
                  className="w-full border rounded px-3 py-2"
                  value={editSocialUrl}
                  onChange={e => setEditSocialUrl(e.target.value)}
                  placeholder="https://..."
                  required
                />
                <div className="flex justify-center gap-2 mt-4">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
                    disabled={!editSocialUrl}
                  >
                    ذخیره
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-semibold transition-colors"
                    onClick={() => setEditModalOpen(false)}
                  >
                    انصراف
                  </button>
                </div>
                {editError && <div className="text-red-600 text-center mt-2">{editError}</div>}
                {editModalStatus === 'loading' && <div className="text-gray-500 text-center mt-2">در حال ذخیره...</div>}
                {editModalStatus === 'success' && <div className="text-green-600 text-center mt-2">با موفقیت ویرایش شد.</div>}
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
} 