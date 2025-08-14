'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

// Advanced SVG Components for Cancellation
const CancelIcon = () => (
  <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/>
  </svg>
);

const RefundIcon = () => (
  <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
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

const WarningIcon = () => (
  <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
  </svg>
);

// Process Step Component
const ProcessStep = ({ step, title, description, icon: Icon, color, delay }: {
  step: number;
  title: string;
  description: string;
  icon: React.ComponentType;
  color: string;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, x: -50 }}
    whileInView={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.6, delay }}
    viewport={{ once: true }}
    className="flex items-start space-x-4 space-x-reverse"
  >
    <motion.div
      whileHover={{ scale: 1.1, rotate: 5 }}
      className={`flex-shrink-0 w-16 h-16 rounded-full ${color} flex items-center justify-center text-white shadow-lg`}
    >
      <Icon />
    </motion.div>
    <div className="flex-1">
      <div className="flex items-center mb-2">
        <span className="bg-gray-200 text-gray-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
          {step}
        </span>
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
                  </div>
      <p className="text-gray-600 leading-relaxed">{description}</p>
                </div>
  </motion.div>
);

// Policy Card Component
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
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    viewport={{ once: true }}
    whileHover={{ y: -10, scale: 1.02 }}
    className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 relative overflow-hidden group"
  >
    <div className={`absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-5 transition-opacity duration-300 ${gradient}`}></div>
    <div className="relative z-10">
      <motion.div 
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ duration: 3, repeat: Infinity, delay: delay * 0.2 }}
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
            transition={{ duration: 0.3, delay: delay + index * 0.1 }}
            viewport={{ once: true }}
            className="flex items-center text-sm text-gray-600"
          >
            <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
            {feature}
          </motion.li>
        ))}
                    </ul>
                  </div>
  </motion.div>
);

// Hero Illustration
const HeroIllustration = () => (
  <svg className="w-full h-full" viewBox="0 0 400 300" fill="none">
    {/* Main Platform */}
    <rect x="50" y="200" width="300" height="80" rx="20" fill="#FEF2F2" stroke="#FECACA" strokeWidth="2"/>
    
    {/* Process Flow */}
    <motion.circle cx="100" cy="100" r="20" fill="#EF4444" opacity="0.8">
      <animate attributeName="cy" values="100;80;100" dur="3s" repeatCount="indefinite"/>
    </motion.circle>
    <motion.circle cx="200" cy="120" r="15" fill="#F59E0B" opacity="0.8">
      <animate attributeName="cy" values="120;100;120" dur="4s" repeatCount="indefinite"/>
    </motion.circle>
    <motion.circle cx="300" cy="80" r="18" fill="#10B981" opacity="0.8">
      <animate attributeName="cy" values="80;60;80" dur="2.5s" repeatCount="indefinite"/>
    </motion.circle>
    
    {/* Connection Lines */}
    <path d="M100 100 L200 120 L300 80" stroke="#FECACA" strokeWidth="3" strokeDasharray="5,5">
      <animate attributeName="stroke-dashoffset" values="0;10" dur="2s" repeatCount="indefinite"/>
    </path>
    
    {/* Process Steps */}
    <rect x="70" y="220" width="60" height="40" rx="8" fill="#EF4444"/>
    <rect x="170" y="220" width="60" height="40" rx="8" fill="#F59E0B"/>
    <rect x="270" y="220" width="60" height="40" rx="8" fill="#10B981"/>
    
    {/* Floating Elements */}
    <motion.rect x="50" y="50" width="20" height="20" rx="4" fill="#FECACA" opacity="0.6">
      <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite"/>
    </motion.rect>
    <motion.rect x="330" y="30" width="15" height="15" rx="3" fill="#FED7AA" opacity="0.6">
      <animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite"/>
    </motion.rect>
  </svg>
);

export default function CancellationPage() {
  const [activeTab, setActiveTab] = useState('process');

  const cancellationProcess = [
    {
      step: 1,
      title: 'درخواست لغو',
      description: 'از طریق پنل کاربری یا تماس با پشتیبانی، درخواست لغو خود را ثبت کنید',
      icon: CancelIcon,
      color: 'bg-red-500'
    },
    {
      step: 2,
      title: 'بررسی درخواست',
      description: 'تیم پشتیبانی درخواست شما را بررسی کرده و شرایط لغو را ارزیابی می‌کند',
      icon: DocumentIcon,
      color: 'bg-yellow-500'
    },
    {
      step: 3,
      title: 'تایید و بازگشت',
      description: 'پس از تایید، مبلغ به حساب شما بازگردانده می‌شود',
      icon: RefundIcon,
      color: 'bg-green-500'
    }
  ];

  const policies = [
    {
      title: 'شرایط عمومی لغو',
      description: 'قوانین و شرایط کلی برای لغو سفارشات و همکاری',
      icon: DocumentIcon,
      color: 'text-blue-500',
      gradient: 'from-blue-400 to-cyan-500',
      features: [
        'لغو تا 24 ساعت پس از ثبت سفارش',
        'بازگشت کامل وجه در صورت عدم ارسال',
        'کسر هزینه‌های انجام شده در صورت ارسال',
        'امکان لغو جزئی برای محصولات چندتایی'
      ]
    },
    {
      title: 'زمان‌بندی بازگشت',
      description: 'مدت زمان لازم برای بازگشت وجه و تسویه حساب',
      icon: TimeIcon,
      color: 'text-green-500',
      gradient: 'from-green-400 to-emerald-500',
      features: [
        'بازگشت وجه: 3-5 روز کاری',
        'تسویه حساب: حداکثر 7 روز',
        'اعتبار کیف پول: فوری',
        'کارت بانکی: 3-7 روز کاری'
      ]
    },
    {
      title: 'ضمانت‌های امنیتی',
      description: 'تضمین امنیت کامل فرآیند لغو و بازگشت وجه',
      icon: ShieldIcon,
      color: 'text-purple-500',
      gradient: 'from-purple-400 to-pink-500',
      features: [
        'رمزگذاری کامل اطلاعات',
        'تایید هویت چندمرحله‌ای',
        'گزارش کامل تراکنش‌ها',
        'پشتیبانی 24/7'
      ]
    }
  ];

  const restrictions = [
    {
      title: 'موارد غیرقابل لغو',
      description: 'سفارشات و خدمات که امکان لغو آنها وجود ندارد',
      icon: WarningIcon,
      color: 'text-red-500',
      gradient: 'from-red-400 to-pink-500',
      features: [
        'محصولات دیجیتال فعال شده',
        'خدمات شخصی‌سازی شده',
        'سفارشات با تخفیف ویژه',
        'محصولات فاسدشدنی'
      ]
    },
    {
      title: 'هزینه‌های کسر شده',
      description: 'هزینه‌هایی که در صورت لغو از مبلغ بازگشتی کسر می‌شود',
      icon: CancelIcon,
      color: 'text-orange-500',
      gradient: 'from-orange-400 to-red-500',
      features: [
        'هزینه‌های پردازش (2%)',
        'هزینه‌های ارسال انجام شده',
        'هزینه‌های بسته‌بندی',
        'کارمزد درگاه پرداخت'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 py-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 left-10 w-40 h-40 opacity-5"
        >
          <HeroIllustration />
        </motion.div>
        <motion.div
          animate={{ y: [0, -30, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-40 right-20 w-32 h-32 opacity-5"
        >
          <HeroIllustration />
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
            className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-r from-red-400 to-orange-500 rounded-full mb-6 shadow-2xl relative"
          >
            <span className="text-5xl">🔄</span>
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
            شرایط و نحوه لغو همکاری
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
          >
            راهنمای کامل فرآیند لغو سفارشات، شرایط بازگشت وجه و قوانین مربوط به لغو همکاری
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
              { id: 'process', name: 'فرآیند لغو', color: 'text-red-600' },
              { id: 'policies', name: 'قوانین و شرایط', color: 'text-blue-600' },
              { id: 'restrictions', name: 'محدودیت‌ها', color: 'text-orange-600' }
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
                فرآیند سه‌مرحله‌ای لغو
              </motion.h2>
              
              <div className="max-w-4xl mx-auto space-y-8">
                {cancellationProcess.map((process, index) => (
                  <ProcessStep
                    key={process.step}
                    step={process.step}
                    title={process.title}
                    description={process.description}
                    icon={process.icon}
                    color={process.color}
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
                قوانین و شرایط لغو
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

          {activeTab === 'restrictions' && (
            <motion.div
              key="restrictions"
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
                محدودیت‌ها و هزینه‌ها
              </motion.h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {restrictions.map((restriction, index) => (
                  <PolicyCard
                    key={index}
                    title={restriction.title}
                    description={restriction.description}
                    icon={restriction.icon}
                    color={restriction.color}
                    gradient={restriction.gradient}
                    delay={index * 0.1}
                    features={restriction.features}
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
            سوالات متداول
          </motion.h2>
          
          <div className="max-w-4xl mx-auto space-y-4">
            {[
              {
                question: 'آیا می‌توانم سفارش خود را قبل از ارسال لغو کنم؟',
                answer: 'بله، شما می‌توانید سفارش خود را تا 24 ساعت پس از ثبت و قبل از ارسال لغو کنید.'
              },
              {
                question: 'مدت زمان بازگشت وجه چقدر است؟',
                answer: 'بازگشت وجه معمولاً بین 3 تا 5 روز کاری انجام می‌شود.'
              },
              {
                question: 'آیا هزینه‌ای برای لغو کسر می‌شود؟',
                answer: 'در صورت لغو قبل از ارسال، هیچ هزینه‌ای کسر نمی‌شود.'
              },
              {
                question: 'چگونه می‌توانم درخواست لغو ثبت کنم؟',
                answer: 'از طریق پنل کاربری، بخش سفارشات یا تماس با پشتیبانی می‌توانید درخواست لغو ثبت کنید.'
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
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
              نیاز به کمک دارید؟
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-red-100 mb-8 text-lg"
            >
              تیم پشتیبانی ما آماده کمک به شما در فرآیند لغو است
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
                تماس با پشتیبانی
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
