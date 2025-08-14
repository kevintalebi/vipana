'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

// Astonishing SVG Components for Seller Cancellation
const ContractIcon = () => (
  <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
  </svg>
);

const CancelIcon = () => (
  <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/>
  </svg>
);

const WarningIcon = () => (
  <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
  </svg>
);

const TimeIcon = () => (
  <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
    <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
  </svg>
);

const DocumentIcon = () => (
  <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
  </svg>
);

const SupportIcon = () => (
  <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
  </svg>
);

const ShieldIcon = () => (
  <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 1L3 5v6c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V5l-9-4zM12 15c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
  </svg>
);

const CheckIcon = () => (
  <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
  </svg>
);

const MoneyIcon = () => (
  <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
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

// Process Step Component with Astonishing Animations
const ProcessStep = ({ step, title, description, icon: Icon, color, gradient, delay }: {
  step: number;
  title: string;
  description: string;
  icon: React.ComponentType;
  color: string;
  gradient: string;
  delay: number;
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
        <p className="text-gray-600 leading-relaxed">{description}</p>
        
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

// Policy Card with Advanced Animations
const PolicyCard = ({ title, description, icon: Icon, color, gradient, delay, features }: {
  title: string;
  description: string;
  icon: React.ComponentType;
  color: string;
  gradient: string;
  delay: number;
  features: string[];
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
      <p className="text-gray-600 leading-relaxed mb-4">{description}</p>
      
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <motion.li
            key={index}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: delay + index * 0.1 }}
            viewport={{ once: true }}
            className="flex items-center text-sm text-gray-600"
          >
            <motion.span 
              className="w-2 h-2 bg-green-400 rounded-full mr-3"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
            />
            {feature}
          </motion.li>
        ))}
      </ul>
    </div>
  </motion.div>
);

// Astonishing Hero Illustration
const HeroIllustration = () => (
  <svg className="w-full h-full" viewBox="0 0 400 300" fill="none">
    {/* Main Contract Platform */}
    <rect x="50" y="200" width="300" height="80" rx="20" fill="#FEF2F2" stroke="#FECACA" strokeWidth="2"/>
    
    {/* Contract Document */}
    <motion.rect x="80" y="220" width="60" height="40" rx="8" fill="#EF4444" opacity="0.8">
      <animate attributeName="y" values="220;210;220" dur="3s" repeatCount="indefinite"/>
    </motion.rect>
    
    {/* Cancel Button */}
    <motion.rect x="180" y="220" width="60" height="40" rx="8" fill="#F59E0B" opacity="0.8">
      <animate attributeName="y" values="220;215;220" dur="2.5s" repeatCount="indefinite"/>
    </motion.rect>
    
    {/* Success Check */}
    <motion.rect x="280" y="220" width="60" height="40" rx="8" fill="#10B981" opacity="0.8">
      <animate attributeName="y" values="220;205;220" dur="4s" repeatCount="indefinite"/>
    </motion.rect>
    
    {/* Floating Contract Elements */}
    <motion.circle cx="100" cy="100" r="15" fill="#EF4444" opacity="0.6">
      <animate attributeName="cy" values="100;80;100" dur="4s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite"/>
    </motion.circle>
    
    <motion.circle cx="300" cy="120" r="12" fill="#F59E0B" opacity="0.6">
      <animate attributeName="cy" values="120;100;120" dur="3.5s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.6;1;0.6" dur="2.5s" repeatCount="indefinite"/>
    </motion.circle>
    
    <motion.circle cx="200" cy="80" r="18" fill="#10B981" opacity="0.6">
      <animate attributeName="cy" values="80;60;80" dur="5s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.6;1;0.6" dur="4s" repeatCount="indefinite"/>
    </motion.circle>
    
    {/* Connection Lines with Animation */}
    <path d="M100 100 L200 80 L300 120" stroke="#FECACA" strokeWidth="3" strokeDasharray="5,5">
      <animate attributeName="stroke-dashoffset" values="0;10" dur="2s" repeatCount="indefinite"/>
      <animate attributeName="stroke-opacity" values="0.5;1;0.5" dur="3s" repeatCount="indefinite"/>
    </path>
    
    {/* Warning Signs */}
    <motion.path d="M50 50 L70 30 L90 50 L70 70 Z" fill="#F59E0B" opacity="0.7">
      <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite"/>
    </motion.path>
    
    <motion.path d="M310 40 L330 20 L350 40 L330 60 Z" fill="#EF4444" opacity="0.7">
      <animate attributeName="opacity" values="0.7;1;0.7" dur="2.5s" repeatCount="indefinite"/>
    </motion.path>
  </svg>
);

export default function CancellationPage() {
  const [activeTab, setActiveTab] = useState('process');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const cancellationProcess = [
    {
      step: 1,
      title: 'درخواست لغو قرارداد',
      description: 'ثبت درخواست رسمی لغو قرارداد همکاری از طریق پنل فروشندگان یا تماس مستقیم',
      icon: ContractIcon,
      color: 'text-red-500',
      gradient: 'from-red-400 to-pink-500'
    },
    {
      step: 2,
      title: 'بررسی و تایید',
      description: 'تیم حقوقی و مالی درخواست شما را بررسی کرده و شرایط فسخ قرارداد را ارزیابی می‌کند',
      icon: DocumentIcon,
      color: 'text-yellow-500',
      gradient: 'from-yellow-400 to-orange-500'
    },
    {
      step: 3,
      title: 'تسویه حساب',
      description: 'محاسبه و تسویه کامل حساب‌های مالی، موجودی و تعهدات طرفین',
      icon: MoneyIcon,
      color: 'text-green-500',
      gradient: 'from-green-400 to-emerald-500'
    },
    {
      step: 4,
      title: 'فسخ رسمی',
      description: 'امضای مدارک فسخ قرارداد و پایان رسمی همکاری',
      icon: CheckIcon,
      color: 'text-blue-500',
      gradient: 'from-blue-400 to-cyan-500'
    }
  ];

  const policies = [
    {
      title: 'شرایط فسخ قرارداد',
      description: 'قوانین و شرایط لازم برای فسخ قانونی قرارداد همکاری',
      icon: DocumentIcon,
      color: 'text-blue-500',
      gradient: 'from-blue-400 to-cyan-500',
      features: [
        'اعلام 30 روزه قبل از فسخ',
        'تسویه کامل حساب‌های مالی',
        'تحویل تمام اموال و مدارک',
        'حفظ اسرار تجاری',
        'پایان تعهدات طرفین'
      ]
    },
    {
      title: 'هزینه‌های فسخ',
      description: 'هزینه‌ها و جریمه‌های احتمالی در صورت فسخ زودهنگام',
      icon: MoneyIcon,
      color: 'text-green-500',
      gradient: 'from-green-400 to-emerald-500',
      features: [
        'هزینه‌های اداری (5%)',
        'جریمه فسخ زودهنگام (10%)',
        'هزینه‌های حقوقی',
        'کسر از موجودی حساب',
        'هزینه‌های انتقال'
      ]
    },
    {
      title: 'زمان‌بندی فرآیند',
      description: 'مدت زمان لازم برای تکمیل فرآیند فسخ قرارداد',
      icon: TimeIcon,
      color: 'text-purple-500',
      gradient: 'from-purple-400 to-pink-500',
      features: [
        'بررسی درخواست: 3-5 روز',
        'تسویه مالی: 7-10 روز',
        'تحویل اموال: 5-7 روز',
        'فسخ رسمی: 1-2 روز',
        'کل فرآیند: 15-25 روز'
      ]
    }
  ];

  const consequences = [
    {
      title: 'تاثیرات فسخ قرارداد',
      description: 'عواقب و تاثیرات فسخ قرارداد بر کسب و کار شما',
      icon: WarningIcon,
      color: 'text-red-500',
      gradient: 'from-red-400 to-pink-500',
      features: [
        'قطع دسترسی به پنل فروشندگان',
        'حذف محصولات از فروشگاه',
        'پایان پشتیبانی فنی',
        'قطع خدمات بازاریابی',
        'حذف از لیست فروشندگان'
      ]
    },
    {
      title: 'تعهدات پس از فسخ',
      description: 'تعهداتی که پس از فسخ قرارداد باید رعایت کنید',
      icon: ShieldIcon,
      color: 'text-orange-500',
      gradient: 'from-orange-400 to-red-500',
      features: [
        'حفظ اسرار تجاری',
        'عدم رقابت مستقیم',
        'تحویل اموال شرکت',
        'حذف اطلاعات محرمانه',
        'عدم استفاده از برند'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 py-8 relative overflow-hidden">
      {/* Interactive Background */}
      <motion.div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(239, 68, 68, 0.1), transparent 80%)`
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
            className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-r from-red-400 to-orange-500 rounded-full mb-6 shadow-2xl relative"
          >
            <span className="text-5xl">📋</span>
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
            لغو قرارداد همکاری
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
          >
            راهنمای کامل فرآیند فسخ قرارداد همکاری با ویپانا و شرایط مربوط به آن
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
              { id: 'process', name: 'فرآیند فسخ', color: 'text-red-600' },
              { id: 'policies', name: 'قوانین و شرایط', color: 'text-blue-600' },
              { id: 'consequences', name: 'عواقب و تعهدات', color: 'text-orange-600' }
            ].map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-full font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-red-500 to-orange-600 text-white shadow-lg'
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
          {activeTab === 'process' && (
            <motion.div
              key="process"
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
                فرآیند چهارمرحله‌ای فسخ قرارداد
              </motion.h2>
              
              <div className="max-w-5xl mx-auto space-y-8">
                {cancellationProcess.map((process, index) => (
                  <ProcessStep
                    key={process.step}
                    step={process.step}
                    title={process.title}
                    description={process.description}
                    icon={process.icon}
                    color={process.color}
                    gradient={process.gradient}
                    delay={index * 0.2}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'policies' && (
            <motion.div
              key="policies"
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
                قوانین و شرایط فسخ
              </motion.h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {policies.map((policy, index) => (
                  <PolicyCard
                    key={index}
                    title={policy.title}
                    description={policy.description}
                    icon={policy.icon}
                    color={policy.color}
                    gradient={policy.gradient}
                    delay={index * 0.1}
                    features={policy.features}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'consequences' && (
            <motion.div
              key="consequences"
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
                عواقب و تعهدات پس از فسخ
              </motion.h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {consequences.map((consequence, index) => (
                  <PolicyCard
                    key={index}
                    title={consequence.title}
                    description={consequence.description}
                    icon={consequence.icon}
                    color={consequence.color}
                    gradient={consequence.gradient}
                    delay={index * 0.1}
                    features={consequence.features}
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
            سوالات متداول فسخ قرارداد
          </motion.h2>
          
          <div className="max-w-4xl mx-auto space-y-4">
            {[
              {
                question: 'آیا می‌توانم قرارداد را بدون دلیل فسخ کنم؟',
                answer: 'خیر، فسخ قرارداد نیاز به دلیل موجه و رعایت شرایط مندرج در قرارداد دارد.'
              },
              {
                question: 'مدت زمان لازم برای فسخ قرارداد چقدر است؟',
                answer: 'کل فرآیند فسخ قرارداد معمولاً بین 15 تا 25 روز کاری طول می‌کشد.'
              },
              {
                question: 'آیا پس از فسخ می‌توانم دوباره همکاری کنم؟',
                answer: 'بله، در صورت رعایت تمام تعهدات، امکان همکاری مجدد وجود دارد.'
              },
              {
                question: 'چه هزینه‌هایی در صورت فسخ زودهنگام کسر می‌شود؟',
                answer: 'هزینه‌های اداری (5%) و جریمه فسخ زودهنگام (10%) از موجودی حساب کسر می‌شود.'
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
          className="bg-gradient-to-r from-red-500 to-orange-600 rounded-3xl p-8 text-white text-center relative overflow-hidden"
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
              نیاز به مشاوره حقوقی دارید؟
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-red-100 mb-8 text-lg"
            >
              تیم حقوقی ما آماده کمک به شما در فرآیند فسخ قرارداد است
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
                className="bg-white text-red-600 px-8 py-4 rounded-full font-medium hover:bg-gray-100 transition-colors shadow-lg"
              >
                تماس با حقوقی
              </motion.button>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  href="/instructions"
                  className="border-2 border-white text-white px-8 py-4 rounded-full font-medium hover:bg-white hover:text-red-600 transition-colors inline-block shadow-lg"
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
