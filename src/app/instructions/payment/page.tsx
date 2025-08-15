'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

// SVG Components for Payment Methods
const CreditCardIcon = () => (
  <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
  </svg>
);

const WalletIcon = () => (
  <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
  </svg>
);

const CashIcon = () => (
  <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
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

const LockIcon = () => (
  <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM9 8V6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9z"/>
  </svg>
);

const TimeIcon = () => (
  <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
    <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
  </svg>
);

// Floating Elements Component
const FloatingElement = ({ delay, duration, children, className }: {
  delay: number;
  duration: number;
  children: React.ReactNode;
  className?: string;
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
    className={`absolute ${className || ''}`}
  >
    {children}
  </motion.div>
);

// Payment Method Component
const PaymentMethod = ({ title, description, icon: Icon, color, gradient, delay, features, processingTime, security }: {
  title: string;
  description: string;
  icon: React.ComponentType;
  color: string;
  gradient: string;
  delay: number;
  features: string[];
  processingTime: string;
  security: string;
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
      <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
      
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
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
            <p className="text-gray-600 text-sm">{description}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center text-sm text-gray-600 mb-1">
              <TimeIcon />
              <span className="mr-2">زمان پردازش:</span>
            </div>
            <span className="font-semibold text-gray-800">{processingTime}</span>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center text-sm text-gray-600 mb-1">
              <ShieldIcon />
              <span className="mr-2">امنیت:</span>
            </div>
            <span className="font-semibold text-gray-800">{security}</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <h4 className="font-semibold text-gray-700 mb-2">ویژگی‌ها:</h4>
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: delay + index * 0.1 }}
              viewport={{ once: true }}
              className="flex items-center text-sm text-gray-600"
            >
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
              {feature}
            </motion.div>
          ))}
        </div>
        
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

// Feature Card Component
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
    <motion.div 
      className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
      animate={{ 
        backgroundPosition: ['0% 0%', '100% 100%'],
      }}
      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
    />
    
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

// Hero Illustration
const HeroIllustration = () => (
  <svg className="w-full h-full" viewBox="0 0 400 300" fill="none">
    <rect x="50" y="200" width="300" height="80" rx="20" fill="#FEF3C7" stroke="#FDE68A" strokeWidth="2"/>
    
    <motion.rect x="80" y="220" width="60" height="40" rx="8" fill="#F59E0B" opacity="0.8">
      <animate attributeName="y" values="220;210;220" dur="3s" repeatCount="indefinite"/>
    </motion.rect>
    
    <motion.rect x="170" y="220" width="60" height="40" rx="8" fill="#10B981" opacity="0.8">
      <animate attributeName="y" values="220;215;220" dur="2.5s" repeatCount="indefinite"/>
    </motion.rect>
    
    <motion.rect x="260" y="220" width="60" height="40" rx="8" fill="#3B82F6" opacity="0.8">
      <animate attributeName="y" values="220;205;220" dur="4s" repeatCount="indefinite"/>
    </motion.rect>
    
    <motion.circle cx="100" cy="100" r="15" fill="#F59E0B" opacity="0.6">
      <animate attributeName="cy" values="100;80;100" dur="4s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite"/>
    </motion.circle>
    
    <motion.circle cx="300" cy="120" r="12" fill="#10B981" opacity="0.6">
      <animate attributeName="cy" values="120;100;120" dur="3.5s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.6;1;0.6" dur="2.5s" repeatCount="indefinite"/>
    </motion.circle>
    
    <motion.circle cx="200" cy="80" r="18" fill="#3B82F6" opacity="0.6">
      <animate attributeName="cy" values="80;60;80" dur="5s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.6;1;0.6" dur="4s" repeatCount="indefinite"/>
    </motion.circle>
    
    <path d="M100 100 L200 80 L300 120" stroke="#FDE68A" strokeWidth="3" strokeDasharray="5,5">
      <animate attributeName="stroke-dashoffset" values="0;10" dur="2s" repeatCount="indefinite"/>
      <animate attributeName="stroke-opacity" values="0.5;1;0.5" dur="3s" repeatCount="indefinite"/>
    </path>
    
    <motion.path d="M50 50 L70 30 L90 50 L70 70 Z" fill="#F59E0B" opacity="0.7">
      <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite"/>
    </motion.path>
    
    <motion.path d="M310 40 L330 20 L350 40 L330 60 Z" fill="#10B981" opacity="0.7">
      <animate attributeName="opacity" values="0.7;1;0.7" dur="2.5s" repeatCount="indefinite"/>
    </motion.path>
  </svg>
);

export default function PaymentPage() {
  const [activeTab, setActiveTab] = useState('methods');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const paymentMethods = [
    {
      title: 'کارت‌های بانکی',
      description: 'پرداخت امن با تمام کارت‌های بانکی',
      icon: CreditCardIcon,
      color: 'text-blue-500',
      gradient: 'from-blue-400 to-cyan-500',
      processingTime: 'لحظه‌ای',
      security: 'SSL 256-bit',
      features: [
        'پشتیبانی از تمام بانک‌ها',
        'پرداخت امن و رمزگذاری شده',
        'تایید دو مرحله‌ای',
        'پشتیبانی 24/7'
      ]
    },
    {
      title: 'کیف پول دیجیتال',
      description: 'پرداخت سریع با کیف پول‌های دیجیتال',
      icon: WalletIcon,
      color: 'text-green-500',
      gradient: 'from-green-400 to-emerald-500',
      processingTime: 'لحظه‌ای',
      security: 'رمزنگاری پیشرفته',
      features: [
        'پرداخت سریع و آسان',
        'امنیت بالا',
        'بدون نیاز به کارت',
        'پشتیبانی از کیف پول‌های مختلف'
      ]
    },
    {
      title: 'پرداخت در محل',
      description: 'پرداخت نقدی در زمان تحویل کالا',
      icon: CashIcon,
      color: 'text-orange-500',
      gradient: 'from-orange-400 to-red-500',
      processingTime: 'در زمان تحویل',
      security: 'تحویل امن',
      features: [
        'پرداخت نقدی',
        'بررسی کالا قبل از پرداخت',
        'بدون نیاز به کارت بانکی',
        'امنیت بالا'
      ]
    }
  ];

  const features = [
    {
      title: 'امنیت بالا',
      description: 'استفاده از پروتکل‌های امنیتی پیشرفته',
      icon: ShieldIcon,
      color: 'text-green-500',
      gradient: 'from-green-400 to-emerald-500'
    },
    {
      title: 'پرداخت سریع',
      description: 'پردازش سریع و لحظه‌ای تراکنش‌ها',
      icon: TimeIcon,
      color: 'text-blue-500',
      gradient: 'from-blue-400 to-cyan-500'
    },
    {
      title: 'رمزگذاری پیشرفته',
      description: 'رمزگذاری 256-bit برای امنیت کامل',
      icon: LockIcon,
      color: 'text-purple-500',
      gradient: 'from-purple-400 to-pink-500'
    },
    {
      title: 'پشتیبانی کامل',
      description: 'پشتیبانی 24/7 برای تمام روش‌های پرداخت',
      icon: CheckIcon,
      color: 'text-orange-500',
      gradient: 'from-orange-400 to-red-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 py-8 relative overflow-hidden">
      <motion.div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(245, 158, 11, 0.1), transparent 80%)`
        }}
      />

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
            className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mb-6 shadow-2xl relative"
          >
            <span className="text-5xl">💳</span>
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
            شیوه‌های پرداخت
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
          >
            راهنمای کامل روش‌های پرداخت امن و سریع در ویپانا
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="w-96 h-72 mx-auto mb-8"
          >
            <HeroIllustration />
          </motion.div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex justify-center mb-12"
        >
          <div className="bg-white rounded-full p-2 shadow-lg">
            {[
              { id: 'methods', name: 'روش‌های پرداخت', color: 'text-yellow-600' },
              { id: 'features', name: 'ویژگی‌ها', color: 'text-blue-600' }
            ].map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-full font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab.name}
              </motion.button>
            ))}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {activeTab === 'methods' && (
            <motion.div
              key="methods"
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
                روش‌های مختلف پرداخت
              </motion.h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {paymentMethods.map((method, index) => (
                  <PaymentMethod
                    key={index}
                    title={method.title}
                    description={method.description}
                    icon={method.icon}
                    color={method.color}
                    gradient={method.gradient}
                    delay={index * 0.2}
                    features={method.features}
                    processingTime={method.processingTime}
                    security={method.security}
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
                ویژگی‌های پرداخت در ویپانا
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
            سوالات متداول پرداخت
          </motion.h2>
          
          <div className="max-w-4xl mx-auto space-y-4">
            {[
              {
                question: 'آیا پرداخت در ویپانا امن است؟',
                answer: 'بله، تمام پرداخت‌ها با استفاده از پروتکل‌های امنیتی پیشرفته و رمزگذاری 256-bit انجام می‌شود.'
              },
              {
                question: 'چه کارت‌های بانکی پشتیبانی می‌شود؟',
                answer: 'تمام کارت‌های بانکی عضو شتاب پشتیبانی می‌شود.'
              },
              {
                question: 'آیا امکان بازگشت وجه وجود دارد؟',
                answer: 'بله، در صورت لغو سفارش یا بازگشت کالا، وجه به همان روش پرداخت بازگردانده می‌شود.'
              },
              {
                question: 'مدت زمان پردازش پرداخت چقدر است؟',
                answer: 'پرداخت‌های آنلاین لحظه‌ای و پرداخت در محل در زمان تحویل انجام می‌شود.'
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

        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-yellow-500 to-orange-600 rounded-3xl p-8 text-white text-center relative overflow-hidden"
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
              سوالی درباره پرداخت دارید؟
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-yellow-100 mb-8 text-lg"
            >
              تیم پشتیبانی ما آماده پاسخگویی به سوالات شما درباره پرداخت است
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
                className="bg-white text-yellow-600 px-8 py-4 rounded-full font-medium hover:bg-gray-100 transition-colors shadow-lg"
              >
                تماس با پشتیبانی
              </motion.button>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  href="/instructions"
                  className="border-2 border-white text-white px-8 py-4 rounded-full font-medium hover:bg-white hover:text-yellow-600 transition-colors inline-block shadow-lg"
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

