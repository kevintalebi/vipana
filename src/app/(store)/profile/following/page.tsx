'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Image from 'next/image';
import Link from 'next/link';
import LoginPromptModal from '../../../components/LoginPromptModal';

type Seller = {
  user_id: string;
  id?: number;
  name: string;
  profile_image?: string | null;
  description?: string | null;
};

export default function FollowingPage() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [isFollowingMap, setIsFollowingMap] = useState<Record<string, boolean>>({});
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);

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
        setCurrentUserId(uid);
        if (!uid) {
          setLoading(false);
          return;
        }

        // Load followed seller ids
        const { data: followRows, error: fErr } = await supabase
          .from('follows')
          .select('seller_id')
          .eq('user_id', uid);
        if (fErr) throw fErr;
        const sellerIds = (followRows || []).map((r: any) => r.seller_id).filter(Boolean);
        setIsFollowingMap(Object.fromEntries(sellerIds.map((id: string) => [id, true])));

        if (sellerIds.length === 0) {
          setSellers([]);
          setLoading(false);
          return;
        }

        // Fetch seller details
        const { data: sellerRows, error: sErr } = await supabase
          .from('sellers')
          .select('user_id, id, name, profile_image, description')
          .in('user_id', sellerIds);
        if (sErr) throw sErr;
        setSellers((sellerRows as Seller[]) || []);
      } catch (e: any) {
        setError(e.message || 'خطا در دریافت لیست دنبال‌شده‌ها');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleToggleFollow = async (sellerUserId: string) => {
    if (!currentUserId) {
      setLoginPromptOpen(true);
      return;
    }
    try {
      // Create Supabase client
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        console.error('Supabase environment variables are not configured');
        return;
      }
      
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      const currentlyFollowing = !!isFollowingMap[sellerUserId];
      if (currentlyFollowing) {
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('user_id', currentUserId)
          .eq('seller_id', sellerUserId);
        if (error) throw error;
        setIsFollowingMap(prev => ({ ...prev, [sellerUserId]: false }));
        setSellers(prev => prev.filter(s => s.user_id !== sellerUserId));
      } else {
        const { error } = await supabase
          .from('follows')
          .insert({ user_id: currentUserId, seller_id: sellerUserId });
        if (error) throw error;
        setIsFollowingMap(prev => ({ ...prev, [sellerUserId]: true }));
      }
    } catch (e) {
      // Silent error; can display toast in the future
    }
  };

  const content = useMemo(() => {
    if (loading) return <div className="text-center text-gray-500">در حال بارگذاری...</div>;
    if (error) return <div className="text-center text-red-600">{error}</div>;
    if (!currentUserId) return <div className="text-center text-gray-600">برای مشاهده لیست دنبال‌شده‌ها ابتدا وارد شوید.</div>;
    if (sellers.length === 0) return <div className="text-center text-gray-500">فروشنده‌ای را دنبال نکرده‌اید.</div>;
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sellers.map((s) => (
          <div key={s.user_id} className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center mb-3">
              {s.profile_image ? (
                <Image src={s.profile_image} alt={s.name} width={96} height={96} className="object-cover w-full h-full" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-3xl">?</div>
              )}
            </div>
            <Link href={`/shops/${s.user_id}`} className="font-bold text-gray-800 mb-1 hover:text-purple-700">
              {s.name}
            </Link>
            {s.description && (
              <div className="text-gray-600 text-sm text-center line-clamp-2 mb-3">{s.description}</div>
            )}
            <button
              onClick={() => handleToggleFollow(s.user_id)}
              className={`w-full font-semibold py-2 px-4 rounded-lg transition-colors ${isFollowingMap[s.user_id] ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white'}`}
            >
              {isFollowingMap[s.user_id] ? 'لغو دنبال کردن' : 'دنبال کنید'}
            </button>
          </div>
        ))}
      </div>
    );
  }, [loading, error, currentUserId, sellers, isFollowingMap]);

  return (
    <main className="min-h-screen p-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-center text-purple-700 mb-6">فروشندگان دنبال‌شده</h1>
        {content}
      </div>
      <LoginPromptModal open={loginPromptOpen} onClose={() => setLoginPromptOpen(false)} message="برای مدیریت دنبال‌شده‌ها ابتدا وارد شوید." />
    </main>
  );
}


