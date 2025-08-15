'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

// Astonishing SVG Components for Shipping Guide
const TruckIcon = () => (
  <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h4c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
  </svg>
);

const LocationIcon = () => (
  <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
  </svg>
);

const TimeIcon = () => (
  <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
    <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
  </svg>
);

const PackageIcon = () => (
  <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l-5.5 9h11z"/>
    <path d="M17.5 17.5m-4.5 0a4.5 4.5 0 1 1 9 0a4.5 4.5 0 1 1 -9 0"/>
    <path d="M3 13.5h8v8H3z"/>
  </svg>
);

const CheckIcon = () => (
  <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
  </svg>
);

const SpeedIcon = () => (
  <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
  </svg>
);

const ShieldIcon = () => (
  <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 1L3 5v6c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V5l-9-4zM12 15c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
  </svg>
);

const MapIcon = () => (
  <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z"/>
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

// Shipping Method Component with Astonishing Animations
const ShippingMethod = ({ title, description, icon: Icon, color, gradient, delay, features, deliveryTime, cost }: {
  title: string;
  description: string;
  icon: React.ComponentType;
  color: string;
  gradient: string;
  delay: number;
  features: string[];
  deliveryTime: string;
  cost: string;
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
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
            <p className="text-gray-600 text-sm">{description}</p>
          </div>
        </div>
        
        {/* Delivery Info */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center text-sm text-gray-600 mb-1">
              <TimeIcon />
              <span className="mr-2">زمان تحویل:</span>
            </div>
            <span className="font-semibold text-gray-800">{deliveryTime}</span>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center text-sm text-gray-600 mb-1">
              <span className="mr-2">هزینه:</span>
            </div>
            <span className="font-semibold text-gray-800">{cost}</span>
          </div>
        </div>
        
        {/* Features */}
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
    {/* Main Shipping Platform */}
    <rect x="50" y="200" width="300" height="80" rx="20" fill="#F0FDF4" stroke="#BBF7D0" strokeWidth="2"/>
    
    {/* Delivery Truck */}
    <motion.rect x="80" y="220" width="60" height="40" rx="8" fill="#10B981" opacity="0.8">
      <animate attributeName="x" values="80;90;80" dur="4s" repeatCount="indefinite"/>
    </motion.rect>
    
    {/* Package */}
    <motion.rect x="170" y="220" width="60" height="40" rx="8" fill="#F59E0B" opacity="0.8">
      <animate attributeName="y" values="220;210;220" dur="3s" repeatCount="indefinite"/>
    </motion.rect>
    
    {/* Location Marker */}
    <motion.rect x="260" y="220" width="60" height="40" rx="8" fill="#3B82F6" opacity="0.8">
      <animate attributeName="y" values="220;205;220" dur="2.5s" repeatCount="indefinite"/>
    </motion.rect>
    
    {/* Floating Shipping Elements */}
    <motion.circle cx="100" cy="100" r="15" fill="#10B981" opacity="0.6">
      <animate attributeName="cy" values="100;80;100" dur="4s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite"/>
    </motion.circle>
    
    <motion.circle cx="300" cy="120" r="12" fill="#F59E0B" opacity="0.6">
      <animate attributeName="cy" values="120;100;120" dur="3.5s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.6;1;0.6" dur="2.5s" repeatCount="indefinite"/>
    </motion.circle>
    
    <motion.circle cx="200" cy="80" r="18" fill="#3B82F6" opacity="0.6">
      <animate attributeName="cy" values="80;60;80" dur="5s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.6;1;0.6" dur="4s" repeatCount="indefinite"/>
    </motion.circle>
    
    {/* Connection Lines with Animation */}
    <path d="M100 100 L200 80 L300 120" stroke="#BBF7D0" strokeWidth="3" strokeDasharray="5,5">
      <animate attributeName="stroke-dashoffset" values="0;10" dur="2s" repeatCount="indefinite"/>
      <animate attributeName="stroke-opacity" values="0.5;1;0.5" dur="3s" repeatCount="indefinite"/>
    </path>
    
    {/* Shipping Icons */}
    <motion.path d="M50 50 L70 30 L90 50 L70 70 Z" fill="#10B981" opacity="0.7">
      <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite"/>
    </motion.path>
    
    <motion.path d="M310 40 L330 20 L350 40 L330 60 Z" fill="#F59E0B" opacity="0.7">
      <animate attributeName="opacity" values="0.7;1;0.7" dur="2.5s" repeatCount="indefinite"/>
    </motion.path>
  </svg>
);

export default function ShippingPage() {
  const [activeTab, setActiveTab] = useState('methods');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const shippingMethods = [
    {
      title: 'ارسال استاندارد',
      description: 'ارسال معمولی با کامیون و تحویل در محل',
      icon: TruckIcon,
      color: 'text-green-500',
      gradient: 'from-green-400 to-emerald-500',
      deliveryTime: '3-5 روز کاری',
      cost: 'رایگان',
      features: [
        'تحویل در محل',
        'پیگیری آنلاین',
        'بسته‌بندی امن',
        'پشتیبانی 24/7'
      ]
    },
    {
      title: 'ارسال سریع',
      description: 'ارسال با اولویت بالا و تحویل سریع',
      icon: SpeedIcon,
      color: 'text-blue-500',
      gradient: 'from-blue-400 to-cyan-500',
      deliveryTime: '1-2 روز کاری',
      cost: '25,000 تومان',
      features: [
        'تحویل سریع',
        'اولویت بالا',
        'پیگیری لحظه‌ای',
        'بسته‌بندی ویژه'
      ]
    },
    {
      title: 'ارسال اکسپرس',
      description: 'ارسال با بالاترین سرعت و تحویل در همان روز',
      icon: PackageIcon,
      color: 'text-purple-500',
      gradient: 'from-purple-400 to-pink-500',
      deliveryTime: 'همان روز',
      cost: '50,000 تومان',
      features: [
        'تحویل در همان روز',
        'سرویس ویژه',
        'پیگیری دقیق',
        'بسته‌بندی لوکس'
      ]
    },
    {
      title: 'ارسال به صندوق پستی',
      description: 'ارسال به صندوق پستی نزدیک‌ترین اداره پست',
      icon: LocationIcon,
      color: 'text-orange-500',
      gradient: 'from-orange-400 to-red-500',
      deliveryTime: '2-3 روز کاری',
      cost: '15,000 تومان',
      features: [
        'تحویل در صندوق پستی',
        'هزینه کمتر',
        'امنیت بالا',
        'دسترسی آسان'
      ]
    }
  ];

  const features = [
    {
      title: 'پیگیری لحظه‌ای',
      description: 'پیگیری وضعیت سفارش از طریق کد پیگیری',
      icon: CheckIcon,
      color: 'text-green-500',
      gradient: 'from-green-400 to-emerald-500'
    },
    {
      title: 'تحویل امن',
      description: 'تحویل امن و مطمئن با بسته‌بندی استاندارد',
      icon: ShieldIcon,
      color: 'text-blue-500',
      gradient: 'from-blue-400 to-cyan-500'
    },
    {
      title: 'پوشش سراسری',
      description: 'ارسال به تمام نقاط ایران با پوشش کامل',
      icon: MapIcon,
      color: 'text-purple-500',
      gradient: 'from-purple-400 to-pink-500'
    },
    {
      title: 'پشتیبانی 24/7',
      description: 'پشتیبانی شبانه‌روزی برای سوالات ارسال',
      icon: TimeIcon,
      color: 'text-orange-500',
      gradient: 'from-orange-400 to-red-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-8 relative overflow-hidden">
      {/* Interactive Background */}
      <motion.div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(16, 185, 129, 0.1), transparent 80%)`
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
            className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mb-6 shadow-2xl relative"
          >
            <span className="text-5xl">🚚</span>
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
            رویه‌های ارسال کالا
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
          >
            راهنمای کامل روش‌های ارسال، زمان تحویل و هزینه‌های حمل و نقل
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
              { id: 'methods', name: 'روش‌های ارسال', color: 'text-green-600' },
              { id: 'features', name: 'ویژگی‌ها', color: 'text-blue-600' }
            ].map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-full font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
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
                روش‌های مختلف ارسال
              </motion.h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {shippingMethods.map((method, index) => (
                  <ShippingMethod
                    key={index}
                    title={method.title}
                    description={method.description}
                    icon={method.icon}
                    color={method.color}
                    gradient={method.gradient}
                    delay={index * 0.2}
                    features={method.features}
                    deliveryTime={method.deliveryTime}
                    cost={method.cost}
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
                ویژگی‌های ارسال در ویپانا
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
            سوالات متداول ارسال
          </motion.h2>
          
          <div className="max-w-4xl mx-auto space-y-4">
            {[
              {
                question: 'آیا ارسال رایگان برای همه سفارشات اعمال می‌شود؟',
                answer: 'ارسال رایگان برای سفارشات بالای 500,000 تومان اعمال می‌شود.'
              },
              {
                question: 'چگونه می‌توانم وضعیت ارسال سفارش خود را پیگیری کنم؟',
                answer: 'از طریق کد پیگیری که پس از ارسال برای شما ارسال می‌شود، می‌توانید وضعیت سفارش را پیگیری کنید.'
              },
              {
                question: 'آیا امکان تغییر آدرس تحویل پس از ثبت سفارش وجود دارد؟',
                answer: 'بله، تا قبل از ارسال محصول می‌توانید آدرس تحویل را تغییر دهید.'
              },
              {
                question: 'در صورت عدم حضور در محل تحویل چه اتفاقی می‌افتد؟',
                answer: 'در صورت عدم حضور، کالا به نزدیک‌ترین اداره پست تحویل داده می‌شود و می‌توانید آن را از آنجا دریافت کنید.'
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
          className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl p-8 text-white text-center relative overflow-hidden"
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
              سوالی درباره ارسال دارید؟
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-green-100 mb-8 text-lg"
            >
              تیم پشتیبانی ما آماده پاسخگویی به سوالات شما درباره ارسال است
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
                className="bg-white text-green-600 px-8 py-4 rounded-full font-medium hover:bg-gray-100 transition-colors shadow-lg"
              >
                تماس با پشتیبانی
              </motion.button>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  href="/instructions"
                  className="border-2 border-white text-white px-8 py-4 rounded-full font-medium hover:bg-white hover:text-green-600 transition-colors inline-block shadow-lg"
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
