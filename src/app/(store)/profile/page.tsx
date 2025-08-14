'use client';
import StoreLayout from '../../components/StoreLayout';
import React from 'react';
import Link from 'next/link';
import { OrdersIcon, ReviewsIcon, LogoutIcon } from '@/app/components/Icons';
import { createClient } from '@supabase/supabase-js';
import { useNavigationWithLoading } from '../../hooks/useNavigationWithLoading';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ProfilePage() {
  const { navigateWithLoading } = useNavigationWithLoading();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    await navigateWithLoading('/');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h1 className="text-2xl font-bold text-green-700 mb-6">پروفایل کاربری</h1>
      <p className="text-gray-600 mb-8">به حساب کاربری خود خوش آمدید. از اینجا می‌توانید سفارشات و نظرات خود را مدیریت کنید.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Link href="/profile/orders">
          <div className="bg-purple-100 hover:bg-purple-200 p-6 rounded-lg flex items-center gap-4 transition cursor-pointer">
            <OrdersIcon className="h-8 w-8 text-purple-700" />
            <div>
              <h2 className="font-bold text-purple-800">سفارشات من</h2>
              <p className="text-sm text-gray-600">مشاهده تاریخچه و وضعیت سفارشات</p>
            </div>
          </div>
        </Link>
        <Link href="/profile/reviews">
          <div className="bg-yellow-100 hover:bg-yellow-200 p-6 rounded-lg flex items-center gap-4 transition cursor-pointer">
            <ReviewsIcon className="h-8 w-8 text-yellow-700" />
            <div>
              <h2 className="font-bold text-yellow-800">نظرات من</h2>
              <p className="text-sm text-gray-600">مشاهده و مدیریت نظرات ثبت‌شده</p>
            </div>
          </div>
        </Link>
        <Link href="/profile/addresses">
          <div className="bg-blue-100 hover:bg-blue-200 p-6 rounded-lg flex items-center gap-4 transition cursor-pointer">
            <svg className="h-8 w-8 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <div>
              <h2 className="font-bold text-blue-800">آدرس‌ها</h2>
              <p className="text-sm text-gray-600">مدیریت آدرس‌های تحویل</p>
            </div>
          </div>
        </Link>
        <Link href="/profile/following">
          <div className="bg-green-100 hover:bg-green-200 p-6 rounded-lg flex items-center gap-4 transition cursor-pointer">
            <svg className="h-8 w-8 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <div>
              <h2 className="font-bold text-green-800">فروشندگان دنبال شده</h2>
              <p className="text-sm text-gray-600">مشاهده فروشندگان دنبال شده</p>
            </div>
          </div>
        </Link>
        <Link href="/profile/wishlist">
          <div className="bg-pink-100 hover:bg-pink-200 p-6 rounded-lg flex items-center gap-4 transition cursor-pointer">
            <svg className="h-8 w-8 text-pink-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <div>
              <h2 className="font-bold text-pink-800">علاقمندی‌ها</h2>
              <p className="text-sm text-gray-600">محصولات مورد علاقه</p>
            </div>
          </div>
        </Link>
        <Link href="/profile/user-info">
          <div className="bg-indigo-100 hover:bg-indigo-200 p-6 rounded-lg flex items-center gap-4 transition cursor-pointer">
            <svg className="h-8 w-8 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
            </svg>
            <div>
              <h2 className="font-bold text-indigo-800">اطلاعات کاربری</h2>
              <p className="text-sm text-gray-600">ویرایش اطلاعات شخصی</p>
            </div>
          </div>
        </Link>
      </div>
      <div className="flex justify-center">
        <button 
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition"
        >
          <LogoutIcon className="h-5 w-5" />
          خروج از حساب کاربری
        </button>
      </div>
    </div>
  );
} 