'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

// SVG Components for Seller Panel Features
const DashboardIcon = () => (
  <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
  </svg>
);

const ProductIcon = () => (
  <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
  </svg>
);

const OrderIcon = () => (
  <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
  </svg>
);

const AnalyticsIcon = () => (
  <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
  </svg>
);

const CustomerIcon = () => (
  <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H17c-.8 0-1.54.37-2.01 1l-1.7 2.26V15h-1.5v-3.5l-1.7-2.26A2.5 2.5 0 0 0 7.54 8H6.46c-.8 0-1.54.37-2.01 1L1.96 15.5H4.5V22h2v-6h1.5v6h2V16h1.5v6h2V16H14v6h2v-6h1.5v6h2z"/>
  </svg>
);

const MarketingIcon = () => (
  <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
  </svg>
);

const FinanceIcon = () => (
  <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
  </svg>
);

const StoreIcon = () => (
  <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5zM12 15c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
  </svg>
);

const ShippingIcon = () => (
  <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h4c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
  </svg>
);

const CouponIcon = () => (
  <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"/>
  </svg>
);

const ReportIcon = () => (
  <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
  </svg>
);

// Dashboard Illustration
const DashboardIllustration = () => (
  <svg className="w-full h-full" viewBox="0 0 300 200" fill="none">
    {/* Main Dashboard Frame */}
    <rect x="20" y="20" width="260" height="160" rx="12" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="2"/>
    
    {/* Header */}
    <rect x="30" y="30" width="240" height="20" rx="4" fill="#3B82F6"/>
    <circle cx="40" cy="40" r="3" fill="white"/>
    <circle cx="50" cy="40" r="3" fill="white"/>
    <circle cx="60" cy="40" r="3" fill="white"/>
    
    {/* Sidebar */}
    <rect x="30" y="60" width="60" height="110" rx="4" fill="#F1F5F9"/>
    <rect x="40" y="70" width="40" height="8" rx="2" fill="#64748B"/>
    <rect x="40" y="85" width="40" height="8" rx="2" fill="#64748B"/>
    <rect x="40" y="100" width="40" height="8" rx="2" fill="#64748B"/>
    <rect x="40" y="115" width="40" height="8" rx="2" fill="#64748B"/>
    <rect x="40" y="130" width="40" height="8" rx="2" fill="#64748B"/>
    
    {/* Main Content Area */}
    <rect x="100" y="60" width="170" height="50" rx="4" fill="white" stroke="#E2E8F0" strokeWidth="1"/>
    <rect x="110" y="70" width="30" height="30" rx="4" fill="#10B981"/>
    <rect x="150" y="70" width="30" height="30" rx="4" fill="#F59E0B"/>
    <rect x="190" y="70" width="30" height="30" rx="4" fill="#EF4444"/>
    <rect x="230" y="70" width="30" height="30" rx="4" fill="#8B5CF6"/>
    
    {/* Chart Area */}
    <rect x="100" y="120" width="80" height="50" rx="4" fill="white" stroke="#E2E8F0" strokeWidth="1"/>
    <path d="M110 150 L120 140 L130 145 L140 135 L150 140 L160 130 L170 135" stroke="#3B82F6" strokeWidth="2" fill="none"/>
    
    {/* Stats Cards */}
    <rect x="190" y="120" width="80" height="25" rx="4" fill="white" stroke="#E2E8F0" strokeWidth="1"/>
    <rect x="190" y="150" width="80" height="20" rx="4" fill="white" stroke="#E2E8F0" strokeWidth="1"/>
    
    {/* Decorative Elements */}
    <circle cx="50" cy="50" r="8" fill="#10B981" opacity="0.2"/>
    <circle cx="250" cy="80" r="6" fill="#F59E0B" opacity="0.2"/>
    <circle cx="280" cy="150" r="5" fill="#EF4444" opacity="0.2"/>
  </svg>
);

// Feature Cards with Icons
const FeatureCard = ({ icon: Icon, title, description, color, delay }: {
  icon: React.ComponentType;
  title: string;
  description: string;
  color: string;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    viewport={{ once: true }}
    whileHover={{ y: -10, scale: 1.02 }}
    className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 relative overflow-hidden group"
  >
    <div className={`absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-5 transition-opacity duration-300 ${color}`}></div>
    <div className="relative z-10">
      <motion.div 
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ duration: 3, repeat: Infinity, delay: delay * 0.2 }}
        className={`w-16 h-16 mb-4 ${color.replace('bg-gradient-to-r', 'text')}`}
      >
        <Icon />
      </motion.div>
      <h3 className="text-xl font-bold text-gray-800 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  </motion.div>
);

export default function SellerInstructionsPage() {
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [showDashboard, setShowDashboard] = useState(false);

  const sellerFeatures = [
    {
      id: 'dashboard',
      icon: DashboardIcon,
      title: 'داشبورد مدیریتی',
      description: 'نمای کلی فروش، آمار و گزارشات لحظه‌ای از عملکرد فروشگاه شما',
      color: 'text-blue-500',
      gradient: 'from-blue-400 to-cyan-500'
    },
    {
      id: 'products',
      icon: ProductIcon,
      title: 'مدیریت محصولات',
      description: 'افزودن، ویرایش و مدیریت کامل محصولات با تصاویر و مشخصات دقیق',
      color: 'text-green-500',
      gradient: 'from-green-400 to-emerald-500'
    },
    {
      id: 'orders',
      icon: OrderIcon,
      title: 'مدیریت سفارشات',
      description: 'پیگیری سفارشات، مدیریت وضعیت ارسال و ارتباط با مشتریان',
      color: 'text-purple-500',
      gradient: 'from-purple-400 to-pink-500'
    },
    {
      id: 'analytics',
      icon: AnalyticsIcon,
      title: 'گزارشات تحلیلی',
      description: 'تحلیل فروش، رفتار مشتریان و گزارشات مالی پیشرفته',
      color: 'text-orange-500',
      gradient: 'from-orange-400 to-red-500'
    },
    {
      id: 'customers',
      icon: CustomerIcon,
      title: 'مدیریت مشتریان',
      description: 'پایگاه داده مشتریان، تاریخچه خرید و سیستم امتیازدهی',
      color: 'text-indigo-500',
      gradient: 'from-indigo-400 to-blue-500'
    },
    {
      id: 'marketing',
      icon: MarketingIcon,
      title: 'ابزارهای بازاریابی',
      description: 'کمپین‌های تبلیغاتی، تخفیف‌ها و ابزارهای جذب مشتری',
      color: 'text-pink-500',
      gradient: 'from-pink-400 to-rose-500'
    },
    {
      id: 'finance',
      icon: FinanceIcon,
      title: 'مدیریت مالی',
      description: 'گزارشات مالی، تسویه حساب و مدیریت درآمد',
      color: 'text-yellow-500',
      gradient: 'from-yellow-400 to-orange-500'
    },
    {
      id: 'store',
      icon: StoreIcon,
      title: 'فروشگاه اختصاصی',
      description: 'طراحی و شخصی‌سازی فروشگاه اختصاصی با قالب‌های متنوع',
      color: 'text-teal-500',
      gradient: 'from-teal-400 to-cyan-500'
    },
    {
      id: 'shipping',
      icon: ShippingIcon,
      title: 'مدیریت ارسال',
      description: 'تنظیم روش‌های ارسال، مناطق تحت پوشش و هزینه‌های حمل',
      color: 'text-cyan-500',
      gradient: 'from-cyan-400 to-blue-500'
    },
    {
      id: 'coupons',
      icon: CouponIcon,
      title: 'مدیریت کوپن‌ها',
      description: 'ایجاد و مدیریت کدهای تخفیف و پیشنهادات ویژه',
      color: 'text-red-500',
      gradient: 'from-red-400 to-pink-500'
    },
    {
      id: 'reports',
      icon: ReportIcon,
      title: 'گزارشات پیشرفته',
      description: 'گزارشات تفصیلی فروش، موجودی و عملکرد محصولات',
      color: 'text-gray-500',
      gradient: 'from-gray-400 to-gray-500'
    },
    {
      id: 'settings',
      icon: SettingsIcon,
      title: 'تنظیمات فروشگاه',
      description: 'تنظیمات امنیتی، پروفایل فروشگاه و ترجیحات شخصی',
      color: 'text-slate-500',
      gradient: 'from-slate-400 to-gray-500'
    }
  ];

  const dashboardStats = [
    { label: 'فروش امروز', value: '۲,۵۰۰,۰۰۰', unit: 'تومان', change: '+۱۲%', color: 'text-green-500' },
    { label: 'سفارشات جدید', value: '۴۵', unit: 'عدد', change: '+۸%', color: 'text-blue-500' },
    { label: 'بازدید فروشگاه', value: '۱,۲۴۰', unit: 'بازدید', change: '+۱۵%', color: 'text-purple-500' },
    { label: 'محصولات فعال', value: '۱۲۸', unit: 'عدد', change: '+۳%', color: 'text-orange-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 left-10 w-32 h-32 opacity-10"
        >
          <DashboardIllustration />
        </motion.div>
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-40 right-20 w-24 h-24 opacity-10"
        >
          <DashboardIllustration />
        </motion.div>
        </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <motion.div 
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mb-6 shadow-2xl relative"
          >
            <span className="text-5xl">🏪</span>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 border-4 border-white border-opacity-30 rounded-full"
            />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl font-bold text-gray-800 mb-4"
          >
            پنل فروشندگان ویپانا
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl text-gray-600 mb-8"
          >
            مدیریت کامل فروشگاه و محصولات با ابزارهای پیشرفته
          </motion.p>

          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="w-80 h-52 mx-auto mb-8"
          >
            <DashboardIllustration />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex justify-center space-x-4 space-x-reverse"
          >
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowDashboard(!showDashboard)}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-full font-medium shadow-lg hover:shadow-xl transition-all"
            >
              {showDashboard ? 'مخفی کردن آمار' : 'مشاهده آمار نمونه'}
            </motion.button>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
                             <Link 
                 href="/instructions/seller"
                 className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-8 py-4 rounded-full font-medium shadow-lg hover:shadow-xl transition-all inline-block"
               >
                 ورود به پنل
               </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Dashboard Stats Preview */}
        <AnimatePresence>
          {showDashboard && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-12"
            >
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-3xl font-bold text-gray-800 mb-8 text-center"
              >
                آمار نمونه فروشگاه
              </motion.h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {dashboardStats.map((stat, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
                  >
                    <div className="text-center">
                      <h3 className="text-gray-600 text-sm mb-2">{stat.label}</h3>
                      <div className="text-2xl font-bold text-gray-800 mb-1">
                        {stat.value}
                        <span className="text-sm text-gray-500 mr-1">{stat.unit}</span>
                </div>
                      <div className={`text-sm font-medium ${stat.color}`}>
                        {stat.change}
                </div>
              </div>
                  </motion.div>
                ))}
                </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Features Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-gray-800 mb-8 text-center"
          >
            امکانات کامل پنل فروشندگان
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sellerFeatures.map((feature, index) => (
              <FeatureCard
                key={feature.id}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                color={feature.color}
                delay={index * 0.1}
              />
            ))}
            </div>
        </motion.div>

        {/* Key Benefits Section */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl shadow-xl p-8 mb-12 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600"></div>
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-gray-800 mb-8 text-center"
          >
            مزایای پنل فروشندگان ویپانا
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '🚀',
                title: 'رابط کاربری پیشرفته',
                description: 'طراحی مدرن و کاربرپسند با تجربه کاربری عالی'
              },
              {
                icon: '📊',
                title: 'گزارشات لحظه‌ای',
                description: 'دسترسی به آمار و گزارشات به‌روزرسانی شده در لحظه'
              },
              {
                icon: '🔒',
                title: 'امنیت بالا',
                description: 'سیستم امنیتی پیشرفته برای محافظت از اطلاعات شما'
              }
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                className="text-center"
              >
                <motion.div 
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
                  className="text-4xl mb-4"
                >
                  {benefit.icon}
                </motion.div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </motion.div>
          ))}
        </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl p-8 text-white text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="relative z-10">
            <motion.h2 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-3xl font-bold mb-4"
            >
              آماده شروع فروش هستید؟
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-blue-100 mb-8 text-lg"
            >
              همین امروز فروشگاه خود را راه‌اندازی کنید
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
              className="flex justify-center space-x-4 space-x-reverse"
            >
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-blue-600 px-8 py-4 rounded-full font-medium hover:bg-gray-100 transition-colors shadow-lg"
              >
                شروع فروش
              </motion.button>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
            <Link 
              href="/instructions"
                  className="border-2 border-white text-white px-8 py-4 rounded-full font-medium hover:bg-white hover:text-blue-600 transition-colors inline-block shadow-lg"
            >
              بازگشت به راهنما
            </Link>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
        </div>
    </div>
  );
}
