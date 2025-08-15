'use client';
import DashboardLayout from '../components/DashboardLayout';
import { ProductsIcon, OrdersIcon, ReportsIcon, LogoutIcon, ProfileIcon, PenIcon, CouponIcon, ReviewsIcon, CollectionIcon } from '../components/Icons';
import { createClient } from '@supabase/supabase-js';
import { useNavigationWithLoading } from '../hooks/useNavigationWithLoading';
import { useEffect, useState } from 'react';

const sellerLinks = [
  { href: '/seller/reports', label: 'آمار و گزارشات', icon: <ReportsIcon /> },
  { href: '/seller/profile', label: 'اطلاعات فروشگاه', icon: <ProfileIcon /> },
  { href: '/seller/collections', label: 'کلکسیون', icon: <CollectionIcon /> },
  { href: '/seller/products', label: 'محصولات', icon: <ProductsIcon /> },
  { href: '/seller/orders', label: 'سفارشات', icon: <OrdersIcon /> },
  { href: '/seller/content', label: 'تولید محتوا', icon: <PenIcon /> },
  { href: '/seller/coupons', label: 'تخفیفات', icon: <CouponIcon /> },
];

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const { navigateWithLoading } = useNavigationWithLoading();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Create Supabase client
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseKey) {
          console.error('Supabase environment variables are not configured');
          await navigateWithLoading('/');
          return;
        }
        
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // Check if user is authenticated
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.log('User not authenticated, redirecting to home');
          await navigateWithLoading('/');
          return;
        }

        // Check if user has seller role
        const { data: userData, error: roleError } = await supabase
          .from('users')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (roleError || !userData || userData.role !== 'seller') {
          console.log('User is not a seller, redirecting to home');
          await navigateWithLoading('/');
          return;
        }

        console.log('User is authorized as seller');
        setIsAuthorized(true);
      } catch (error) {
        console.error('Auth check error:', error);
        await navigateWithLoading('/');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigateWithLoading]);

  const handleLogout = async () => {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey);
        await supabase.auth.signOut();
      }
      await navigateWithLoading('/');
    } catch (error) {
      console.error('Logout error:', error);
      await navigateWithLoading('/');
    }
  };

  const customLinks = [
    ...sellerLinks,
    { 
      href: '#', 
      label: 'خروج', 
      icon: <LogoutIcon />,
      onClick: handleLogout
    }
  ];

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">در حال بررسی دسترسی...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authorized (redirect will happen)
  if (!isAuthorized) {
    return null;
  }

  return (
    <DashboardLayout links={customLinks} title="داشبورد فروشنده" homeLink="/seller/reports">
      {children}
    </DashboardLayout>
  );
} 