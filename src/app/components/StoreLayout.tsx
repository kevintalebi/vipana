'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { MenuIcon, CloseIcon, ProfileIcon, CartIcon, LoadingSpinnerIcon, ProductsIcon, ReviewsIcon, StoreIcon, HomeIcon, AdsIcon, CategoryIcon } from './Icons';
import { createClient } from '@supabase/supabase-js';
import { useNavigationWithLoading } from '../hooks/useNavigationWithLoading';
import Footer from './Footer';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface NavLink {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
}

const mainLinks = [
  { href: '/products', label: 'محصولات', icon: ProductsIcon },
  { href: '/categories', label: 'دسته بندی', icon: CategoryIcon },
  { href: '/shops', label: 'فروشگاه‌ها', icon: StoreIcon },
  { href: '/ads', label: 'تبلیغات', icon: AdsIcon },
];

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const pathname = usePathname();
  const { isNavigating, navigateWithLoading } = useNavigationWithLoading();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setIsLoggedIn(true);
        // Get user role from users table
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('user_id', user.id)
          .single();
        if (userData) {
          setUserRole(userData.role);
        }
      }
    };
    checkAuth();
  }, []);

  const handleProfileClick = async () => {
    if (isLoggedIn && userRole === 'buyer') {
      await navigateWithLoading('/profile');
    } else {
      await navigateWithLoading('/auth/login');
    }
  };

  const secondaryLinks: NavLink[] = [
    { href: '/cart', label: 'سبد خرید', icon: CartIcon },
    { 
      href: '#', 
      label: 'پروفایل', 
      icon: ProfileIcon,
      onClick: handleProfileClick
    },
  ];

  const allLinks = [...mainLinks, ...secondaryLinks] as (NavLink | { href: string; label: string })[];

  return (
    <div className="min-h-screen bg-gray-100/50 font-sans">
      {/* Loading Overlay */}
      {isNavigating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center gap-3">
            <LoadingSpinnerIcon className="h-6 w-6 text-purple-600" />
            <span className="text-gray-700">در حال بارگذاری...</span>
          </div>
        </div>
      )}
      
      <nav className="bg-white shadow-md sticky top-0 z-20 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Right side of Navbar */}
            <div className="flex items-center">
              {/* Brand Logo */}
              <Link href="/">
                <h1 className="text-xl font-bold text-purple-700 cursor-pointer">ویپانا</h1>
              </Link>
              {/* Desktop Main Links */}
              <div className="hidden md:block">
                <div className="mr-4 flex items-baseline space-x-4 space-x-reverse">
                  {mainLinks.map(link => (
                    <Link key={link.href} href={link.href}>
                      <div className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          (pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))) ? 'bg-purple-100 text-purple-700' : 'text-gray-700 hover:bg-gray-200'
                      }`}>
                        {link.label}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Left side of Navbar */}
            <div className="flex items-center">
                {/* Desktop Icons */}
                <div className="hidden md:flex items-center space-x-2 space-x-reverse">
                    {secondaryLinks.map(link => (
                    <div key={link.href}>
                        {link.onClick ? (
                          <div 
                            className={`p-2 rounded-full transition-colors cursor-pointer ${
                            (pathname === link.href || pathname.startsWith(link.href)) 
                                ? 'bg-purple-100 text-purple-700' 
                                : 'text-gray-600 hover:bg-gray-200 hover:text-gray-800'
                            }`}
                            onClick={link.onClick}
                          >
                            {isNavigating ? (
                              <LoadingSpinnerIcon className="h-6 w-6" />
                            ) : (
                              <link.icon className="h-6 w-6" />
                            )}
                          </div>
                        ) : (
                          <Link href={link.href}>
                            <div className={`p-2 rounded-full transition-colors ${
                            (pathname === link.href || pathname.startsWith(link.href)) 
                                ? 'bg-purple-100 text-purple-700' 
                                : 'text-gray-600 hover:bg-gray-200 hover:text-gray-800'
                            }`}>
                              <link.icon className="h-6 w-6" />
                            </div>
                          </Link>
                        )}
                    </div>
                    ))}
                </div>
                {/* Mobile Menu Button */}
                <div className="md:hidden">
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="bg-gray-200 inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-800 hover:bg-gray-300 focus:outline-none"
                    >
                        {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
                    </button>
                </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {allLinks.map(link => (
                <div key={link.href}>
                  {'onClick' in link && link.onClick ? (
                    <div 
                      className={`block px-3 py-2 rounded-md text-base font-medium transition-colors cursor-pointer ${
                          (pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))) ? 'bg-purple-600 text-white' : 'text-gray-700 hover:bg-gray-200'
                      }`} 
                      onClick={() => {
                        link.onClick?.();
                        setMobileMenuOpen(false);
                      }}
                    >
                      {isNavigating ? (
                        <div className="flex items-center gap-2">
                          <LoadingSpinnerIcon className="h-4 w-4" />
                          {link.label}
                        </div>
                      ) : (
                        link.label
                      )}
                    </div>
                  ) : (
                    <Link href={link.href}>
                      <div className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                          (pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))) ? 'bg-purple-600 text-white' : 'text-gray-700 hover:bg-gray-200'
                      }`} onClick={() => setMobileMenuOpen(false)}>
                        {link.label}
                      </div>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </nav>
      {/* Top Navigation Bar for Mobile (cart and profile only) */}
      <nav className="bg-white shadow-md sticky top-0 z-30 flex md:hidden items-center h-14 px-4">
        {/* Profile icon on far left */}
        <div className="flex-1 flex items-center justify-start">
          {secondaryLinks.filter(link => link.label === 'پروفایل').map(link => (
            <div key={link.href}>
              {link.onClick ? (
                <button
                  onClick={link.onClick}
                  className={`p-2 rounded-full transition-colors cursor-pointer ${
                    (pathname === link.href || pathname.startsWith(link.href))
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-600 hover:bg-gray-200 hover:text-gray-800'
                  }`}
                  aria-label="پروفایل"
                >
                  <link.icon className="h-6 w-6" />
                </button>
              ) : (
                <Link href={link.href}>
                  <div className={`p-2 rounded-full transition-colors ${
                    (pathname === link.href || pathname.startsWith(link.href))
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-600 hover:bg-gray-200 hover:text-gray-800'
                  }`}>
                    <link.icon className="h-6 w-6" />
                  </div>
                </Link>
              )}
            </div>
          ))}
        </div>
        {/* Centered logo */}
        <div className="flex-1 flex items-center justify-center absolute left-0 right-0 mx-auto pointer-events-none">
          <h1 className="text-lg font-bold text-purple-700 select-none">ویپانا</h1>
        </div>
        {/* Cart icon on far right */}
        <div className="flex-1 flex items-center justify-end">
          {secondaryLinks.filter(link => link.label === 'سبد خرید').map(link => (
            <div key={link.href}>
              <Link href={link.href}>
                <div className={`p-2 rounded-full transition-colors ${
                  (pathname === link.href || pathname.startsWith(link.href))
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:bg-gray-200 hover:text-gray-800'
                }`} aria-label="سبد خرید">
                  <link.icon className="h-6 w-6" />
                </div>
              </Link>
            </div>
          ))}
        </div>
      </nav>
      {/* Bottom Navigation Bar for Mobile (mainLinks only) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white rounded-t-2xl shadow-lg md:hidden border-t flex justify-between items-center py-2 px-2">
        {mainLinks.map((link) => (
          <Link key={link.href} href={link.href} className="flex-1 flex flex-col items-center justify-center">
            <div className={`flex flex-col items-center justify-center rounded-xl transition-colors duration-200 py-1 px-2 ${
              (pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href)))
                ? 'text-purple-700 bg-purple-50' : 'text-gray-500 hover:bg-gray-100'
            }`}>
              {link.icon && <link.icon className="h-7 w-7 mb-1" />}
              <span className="text-xs font-semibold leading-tight">{link.label}</span>
            </div>
          </Link>
        ))}
      </nav>
      <main className="p-2 md:p-6 pb-16 md:pb-6">
        {children}
      </main>
      <Footer />
    </div>
  );
} 