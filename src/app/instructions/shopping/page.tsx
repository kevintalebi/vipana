'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

// Astonishing SVG Components for Shopping Guide
const SearchIcon = () => (
  <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
  </svg>
);

const CartIcon = () => (
  <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
    <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
  </svg>
);

const PaymentIcon = () => (
  <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
  </svg>
);

const CheckIcon = () => (
  <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
  </svg>
);

const UserIcon = () => (
  <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
  </svg>
);

const LocationIcon = () => (
  <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
  </svg>
);

const PhoneIcon = () => (
  <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
  </svg>
);

const StarIcon = () => (
  <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
  </svg>
);

// Floating Elements Component
const FloatingElement = ({ delay, duration, children }: {
  delay: number;
  duration: number;
  children: React.ReactNode;
}) => (
  <motion.div
    animate={{
      y: [0, -20, 0],
      rotate: [0, 5, -5, 0],
      scale: [1, 1.1, 1]
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: "easeInOut"
    }}
    className="absolute"
  >
    {children}
  </motion.div>
);

// Shopping Step Component with Astonishing Animations
const ShoppingStep = ({ step, title, description, icon: Icon, color, gradient, delay, tips }: {
  step: number;
  title: string;
  description: string;
  icon: React.ComponentType;
  color: string;
  gradient: string;
  delay: number;
  tips: string[];
}) => (
  <motion.div
    initial={{ opacity: 0, x: -100, scale: 0.8 }}
    whileInView={{ opacity: 1, x: 0, scale: 1 }}
    transition={{ duration: 0.8, delay, type: "spring", stiffness: 100 }}
    viewport={{ once: true }}
    whileHover={{ 
      scale: 1.05, 
      rotateY: 5,
      boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
    }}
    className="relative group"
  >
    <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 relative overflow-hidden">
      {/* Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
      
      {/* Animated Border */}
      <motion.div
        className={`absolute inset-0 rounded-2xl border-2 ${color.replace('text', 'border')} opacity-0 group-hover:opacity-30`}
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      
      <div className="relative z-10">
        <div className="flex items-center mb-4">
          <motion.div
            whileHover={{ scale: 1.2, rotate: 360 }}
            transition={{ duration: 0.5 }}
            className={`flex-shrink-0 w-16 h-16 rounded-full ${color} flex items-center justify-center text-white shadow-lg mr-4`}
          >
            <Icon />
          </motion.div>
          <div>
            <span className="bg-gray-200 text-gray-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
              {step}
            </span>
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-gray-800 mb-3">{title}</h3>
        <p className="text-gray-600 leading-relaxed mb-4">{description}</p>
        
        {/* Tips Section */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-700 mb-2">نکات مهم:</h4>
          <ul className="space-y-1">
            {tips.map((tip, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: delay + index * 0.1 }}
                viewport={{ once: true }}
                className="flex items-center text-sm text-gray-600"
              >
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                {tip}
              </motion.li>
            ))}
          </ul>
        </div>
        
        {/* Animated Underline */}
        <motion.div
          className={`h-1 ${color.replace('text', 'bg')} rounded-full mt-4`}
          initial={{ width: 0 }}
          whileInView={{ width: "100%" }}
          transition={{ duration: 1, delay: delay + 0.5 }}
          viewport={{ once: true }}
        />
      </div>
    </div>
  </motion.div>
);

// Feature Card with Advanced Animations
const FeatureCard = ({ title, description, icon: Icon, color, gradient, delay }: {
  title: string;
  description: string;
  icon: React.ComponentType;
  color: string;
  gradient: string;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 50, rotateX: -15 }}
    whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
    transition={{ duration: 0.8, delay, type: "spring", stiffness: 100 }}
    viewport={{ once: true }}
    whileHover={{ 
      y: -15, 
      scale: 1.03,
      rotateY: 2
    }}
    className="bg-white rounded-2xl p-6 shadow-2xl border border-gray-100 relative overflow-hidden group"
  >
    {/* Animated Background */}
    <motion.div 
      className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
      animate={{ 
        backgroundPosition: ['0% 0%', '100% 100%'],
      }}
      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
    />
    
    {/* Floating Particles */}
    <motion.div
      className="absolute top-4 right-4 w-2 h-2 bg-yellow-400 rounded-full opacity-60"
      animate={{ 
        y: [0, -10, 0],
        opacity: [0.6, 1, 0.6]
      }}
      transition={{ duration: 2, repeat: Infinity, delay: delay * 0.2 }}
    />
    
    <div className="relative z-10">
      <motion.div 
        animate={{ 
          rotate: [0, 10, -10, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 4, repeat: Infinity, delay: delay * 0.3 }}
        className={`w-16 h-16 mb-4 ${color}`}
      >
        <Icon />
      </motion.div>
      
      <h3 className="text-xl font-bold text-gray-800 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  </motion.div>
);

// Astonishing Hero Illustration
const HeroIllustration = () => (
  <svg className="w-full h-full" viewBox="0 0 400 300" fill="none">
    {/* Main Shopping Platform */}
    <rect x="50" y="200" width="300" height="80" rx="20" fill="#F0F9FF" stroke="#BAE6FD" strokeWidth="2"/>
    
    {/* Shopping Cart */}
    <motion.rect x="80" y="220" width="60" height="40" rx="8" fill="#3B82F6" opacity="0.8">
      <animate attributeName="y" values="220;210;220" dur="3s" repeatCount="indefinite"/>
    </motion.rect>
    
    {/* Payment Card */}
    <motion.rect x="170" y="220" width="60" height="40" rx="8" fill="#10B981" opacity="0.8">
      <animate attributeName="y" values="220;215;220" dur="2.5s" repeatCount="indefinite"/>
    </motion.rect>
    
    {/* Success Check */}
    <motion.rect x="260" y="220" width="60" height="40" rx="8" fill="#F59E0B" opacity="0.8">
      <animate attributeName="y" values="220;205;220" dur="4s" repeatCount="indefinite"/>
    </motion.rect>
    
    {/* Floating Shopping Elements */}
    <motion.circle cx="100" cy="100" r="15" fill="#3B82F6" opacity="0.6">
      <animate attributeName="cy" values="100;80;100" dur="4s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite"/>
    </motion.circle>
    
    <motion.circle cx="300" cy="120" r="12" fill="#10B981" opacity="0.6">
      <animate attributeName="cy" values="120;100;120" dur="3.5s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.6;1;0.6" dur="2.5s" repeatCount="indefinite"/>
    </motion.circle>
    
    <motion.circle cx="200" cy="80" r="18" fill="#F59E0B" opacity="0.6">
      <animate attributeName="cy" values="80;60;80" dur="5s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.6;1;0.6" dur="4s" repeatCount="indefinite"/>
    </motion.circle>
    
    {/* Connection Lines with Animation */}
    <path d="M100 100 L200 80 L300 120" stroke="#BAE6FD" strokeWidth="3" strokeDasharray="5,5">
      <animate attributeName="stroke-dashoffset" values="0;10" dur="2s" repeatCount="indefinite"/>
      <animate attributeName="stroke-opacity" values="0.5;1;0.5" dur="3s" repeatCount="indefinite"/>
    </path>
    
    {/* Shopping Icons */}
    <motion.path d="M50 50 L70 30 L90 50 L70 70 Z" fill="#3B82F6" opacity="0.7">
      <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite"/>
    </motion.path>
    
    <motion.path d="M310 40 L330 20 L350 40 L330 60 Z" fill="#10B981" opacity="0.7">
      <animate attributeName="opacity" values="0.7;1;0.7" dur="2.5s" repeatCount="indefinite"/>
    </motion.path>
  </svg>
);

export default function ShoppingGuidePage() {
  const [activeTab, setActiveTab] = useState('steps');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const shoppingSteps = [
    {
      step: 1,
      title: 'جستجو و انتخاب محصول',
      description: 'محصول مورد نظر خود را جستجو کرده و از بین گزینه‌های موجود انتخاب کنید',
      icon: SearchIcon,
      color: 'text-blue-500',
      gradient: 'from-blue-400 to-cyan-500',
      tips: [
        'از فیلترهای پیشرفته استفاده کنید',
        'نظرات و امتیازات را بررسی کنید',
        'قیمت‌ها را مقایسه کنید',
        'تصاویر محصول را با دقت ببینید'
      ]
    },
    {
      step: 2,
      title: 'افزودن به سبد خرید',
      description: 'محصول انتخاب شده را به سبد خرید اضافه کرده و تعداد مورد نظر را مشخص کنید',
      icon: CartIcon,
      color: 'text-green-500',
      gradient: 'from-green-400 to-emerald-500',
      tips: [
        'موجودی محصول را بررسی کنید',
        'تعداد مناسب را انتخاب کنید',
        'ویژگی‌های محصول را دوباره چک کنید',
        'محصولات مشابه را مقایسه کنید'
      ]
    },
    {
      step: 3,
      title: 'تکمیل اطلاعات شخصی',
      description: 'اطلاعات شخصی، آدرس و شماره تماس خود را وارد کنید',
      icon: UserIcon,
      color: 'text-purple-500',
      gradient: 'from-purple-400 to-pink-500',
      tips: [
        'اطلاعات را با دقت وارد کنید',
        'آدرس دقیق و کامل بنویسید',
        'شماره تماس معتبر وارد کنید',
        'کد پستی صحیح وارد کنید'
      ]
    },
    {
      step: 4,
      title: 'انتخاب روش ارسال',
      description: 'روش ارسال مناسب را انتخاب کرده و هزینه حمل را مشاهده کنید',
      icon: LocationIcon,
      color: 'text-orange-500',
      gradient: 'from-orange-400 to-red-500',
      tips: [
        'زمان ارسال را بررسی کنید',
        'هزینه حمل را محاسبه کنید',
        'روش ارسال امن را انتخاب کنید',
        'آدرس تحویل را تایید کنید'
      ]
    },
    {
      step: 5,
      title: 'انتخاب روش پرداخت',
      description: 'روش پرداخت مناسب را انتخاب کرده و اطلاعات پرداخت را وارد کنید',
      icon: PaymentIcon,
      color: 'text-indigo-500',
      gradient: 'from-indigo-400 to-blue-500',
      tips: [
        'روش پرداخت امن انتخاب کنید',
        'اطلاعات کارت را با دقت وارد کنید',
        'کد امنیتی را وارد کنید',
        'پرداخت را تایید کنید'
      ]
    },
    {
      step: 6,
      title: 'تایید نهایی سفارش',
      description: 'اطلاعات سفارش را بررسی کرده و تایید نهایی را انجام دهید',
      icon: CheckIcon,
      color: 'text-teal-500',
      gradient: 'from-teal-400 to-cyan-500',
      tips: [
        'تمام اطلاعات را بررسی کنید',
        'قیمت نهایی را چک کنید',
        'شرایط و قوانین را مطالعه کنید',
        'سفارش را تایید کنید'
      ]
    }
  ];

  const features = [
    {
      title: 'جستجوی هوشمند',
      description: 'جستجوی پیشرفته با فیلترهای متعدد و نتایج مرتب شده',
      icon: SearchIcon,
      color: 'text-blue-500',
      gradient: 'from-blue-400 to-cyan-500'
    },
    {
      title: 'سبد خرید امن',
      description: 'مدیریت آسان سبد خرید با امکان ذخیره و ویرایش',
      icon: CartIcon,
      color: 'text-green-500',
      gradient: 'from-green-400 to-emerald-500'
    },
    {
      title: 'پرداخت امن',
      description: 'روش‌های پرداخت متنوع و امن با درگاه‌های معتبر',
      icon: PaymentIcon,
      color: 'text-purple-500',
      gradient: 'from-purple-400 to-pink-500'
    },
    {
      title: 'پیگیری سفارش',
      description: 'پیگیری لحظه‌ای سفارش از ثبت تا تحویل',
      icon: CheckIcon,
      color: 'text-orange-500',
      gradient: 'from-orange-400 to-red-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 relative overflow-hidden">
      {/* Interactive Background */}
      <motion.div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.1), transparent 80%)`
        }}
      />

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <FloatingElement delay={0} duration={6} className="top-20 left-10 w-40 h-40 opacity-5">
          <HeroIllustration />
        </FloatingElement>
        <FloatingElement delay={2} duration={8} className="top-40 right-20 w-32 h-32 opacity-5">
          <HeroIllustration />
        </FloatingElement>
        <FloatingElement delay={4} duration={7} className="bottom-20 left-1/4 w-24 h-24 opacity-5">
          <HeroIllustration />
        </FloatingElement>
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center mb-12"
        >
          <motion.div 
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full mb-6 shadow-2xl relative"
          >
            <span className="text-5xl">🛒</span>
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 border-4 border-white border-opacity-30 rounded-full"
            />
            <motion.div
              animate={{ 
                scale: [1, 1.4, 1],
                opacity: [0.1, 0.3, 0.1]
              }}
              transition={{ duration: 3, repeat: Infinity, delay: 1 }}
              className="absolute inset-0 border-4 border-white border-opacity-20 rounded-full"
            />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl font-bold text-gray-800 mb-4"
          >
            نحوه ثبت سفارش
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
          >
            راهنمای کامل مراحل خرید از ویپانا - از جستجو تا تحویل محصول
          </motion.p>

          {/* Hero Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="w-96 h-72 mx-auto mb-8"
          >
            <HeroIllustration />
          </motion.div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex justify-center mb-12"
        >
          <div className="bg-white rounded-full p-2 shadow-lg">
            {[
              { id: 'steps', name: 'مراحل خرید', color: 'text-blue-600' },
              { id: 'features', name: 'ویژگی‌ها', color: 'text-green-600' }
            ].map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-full font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab.name}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Content Sections */}
        <AnimatePresence mode="wait">
          {activeTab === 'steps' && (
            <motion.div
              key="steps"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="mb-12"
            >
              <motion.h2 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="text-3xl font-bold text-gray-800 mb-8 text-center"
              >
                مراحل شش‌گانه خرید
              </motion.h2>
              
              <div className="max-w-6xl mx-auto space-y-8">
                {shoppingSteps.map((step, index) => (
                  <ShoppingStep
                    key={step.step}
                    step={step.step}
                    title={step.title}
                    description={step.description}
                    icon={step.icon}
                    color={step.color}
                    gradient={step.gradient}
                    delay={index * 0.2}
                    tips={step.tips}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'features' && (
            <motion.div
              key="features"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="mb-12"
            >
              <motion.h2 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="text-3xl font-bold text-gray-800 mb-8 text-center"
              >
                ویژگی‌های خرید در ویپانا
              </motion.h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {features.map((feature, index) => (
                  <FeatureCard
                    key={index}
                    title={feature.title}
                    description={feature.description}
                    icon={feature.icon}
                    color={feature.color}
                    gradient={feature.gradient}
                    delay={index * 0.1}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FAQ Section */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <motion.h2 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-gray-800 mb-8 text-center"
          >
            سوالات متداول خرید
          </motion.h2>
          
          <div className="max-w-4xl mx-auto space-y-4">
            {[
              {
                question: 'آیا خرید بدون ثبت نام امکان‌پذیر است؟',
                answer: 'خیر، برای خرید از ویپانا حتماً باید ثبت نام کنید تا بتوانید سفارش خود را پیگیری کنید.'
              },
              {
                question: 'چگونه می‌توانم سفارش خود را پیگیری کنم؟',
                answer: 'پس از ثبت سفارش، کد پیگیری برای شما ارسال می‌شود که می‌توانید از طریق پنل کاربری آن را پیگیری کنید.'
              },
              {
                question: 'آیا امکان لغو سفارش وجود دارد؟',
                answer: 'بله، تا قبل از ارسال محصول می‌توانید سفارش خود را لغو کنید.'
              },
              {
                question: 'چه روش‌های پرداختی پشتیبانی می‌شود؟',
                answer: 'کارت‌های بانکی، کیف پول، پرداخت در محل و سایر روش‌های امن پرداخت پشتیبانی می‌شود.'
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
              >
                <h3 className="text-lg font-bold text-gray-800 mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
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
          className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl p-8 text-white text-center relative overflow-hidden"
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
              آماده خرید هستید؟
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-blue-100 mb-8 text-lg"
            >
              همین حالا شروع به خرید کنید و از تجربه خرید آسان لذت ببرید
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
                شروع خرید
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
