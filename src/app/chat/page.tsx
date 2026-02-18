'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Settings, User, X, Zap, Download, Upload, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
// Token consumption function moved inline

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'text' | 'image' | 'video' | 'ai-waiting';
  imageUrl?: string;
  videoUrl?: string;
  showRetryButton?: boolean;
}

interface Service {
  id: string;
  name: string;
  type: string;
  price: string;
}

interface ServicesData {
  [key: string]: Service[];
}

interface TokenConsumptionResult {
  success: boolean;
  newTokenBalance?: number;
  error?: string;
}

interface DatabaseService {
  id: string;
  type: string;
  name?: string;
  title?: string;
  model_name?: string;
  model?: string;
  price?: string;
  cost?: string;
  amount?: string;
  [key: string]: unknown;
}

interface SupabaseResponse<T = unknown> {
  data: T | null;
  error: {
    code?: string;
    message?: string;
    details?: string;
    hint?: string;
  } | null;
}

interface ErrorDetails {
  status: number;
  statusText: string;
  url: string;
  error: string;
  rawText?: string;
  textError?: string;
}

export default function ChatPage() {
  const { user, userProfile, updateUserTokens } = useAuth();
  const [localUserProfile, setLocalUserProfile] = useState(userProfile);

  // Sync local profile with auth context
  useEffect(() => {
    setLocalUserProfile(userProfile);
  }, [userProfile]);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'سلام! چطور می‌تونم کمکتون کنم؟',
      isUser: false,
      timestamp: new Date('2024-01-01T12:00:00'),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedType, setSelectedType] = useState('TEXT');
  const [selectedModel, setSelectedModel] = useState('');
  const [services, setServices] = useState<ServicesData>({});
  const [servicesLoading, setServicesLoading] = useState(true);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [serverBusyMessage, setServerBusyMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [coinPrice, setCoinPrice] = useState<number | null>(null);
  const [rechargeOpen, setRechargeOpen] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState<number>(100000);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<string>('1:1');
  // const [waitingTime] = useState<number>(0);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isRecharging, setIsRecharging] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  
  // Circuit breaker state for database operations
  const [databaseHealthy, setDatabaseHealthy] = useState(true);
  const [lastDatabaseFailure, setLastDatabaseFailure] = useState(0);
  
  // Mutex lock to prevent concurrent token consumption
  const [isConsumingTokens, setIsConsumingTokens] = useState(false);
  
  // Force unlock function for debugging
  const forceUnlock = () => {
    console.log('🔓 Force unlocking token consumption...');
    setIsConsumingTokens(false);
  };
  
  // Auto-reset lock if it's been held too long (safety mechanism)
  useEffect(() => {
    if (isConsumingTokens) {
      const resetTimeout = setTimeout(() => {
        console.log('⚠️ Auto-resetting stuck lock after 5 seconds');
        setIsConsumingTokens(false);
      }, 5000); // 5 seconds
      
      return () => clearTimeout(resetTimeout);
    }
  }, [isConsumingTokens]);
  

  // Reset upload state function
  const resetUploadState = () => {
    console.log('Resetting upload state');
    setIsUploading(false);
  };

  // Reset upload state on component mount
  useEffect(() => {
    setIsUploading(false);
  }, []);
  
  // Monitor messages for image completion and reset waiting state
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.type === 'image' && lastMessage.text === 'عکس شما آماده شد!') {
      console.log('Image message detected, resetting waiting state');
      setIsWaitingForResponse(false);
      setIsPolling(false);
    }
  }, [messages]);
  // Image upload function
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('لطفاً فقط فایل‌های تصویری انتخاب کنید');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('حجم فایل نباید بیشتر از 10 مگابایت باشد');
      return;
    }

    console.log('Starting image upload...');
    setIsUploading(true);

    // Add timeout to prevent infinite loading
    const uploadTimeout = setTimeout(() => {
      console.error('Upload timeout after 30 seconds');
      alert('زمان آپلود به پایان رسید. لطفاً دوباره تلاش کنید.');
      setIsUploading(false);
    }, 30000); // 30 second timeout

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      // Upload to Supabase storage
      console.log('Attempting to upload to bucket: AI');
      console.log('File path:', filePath);
      console.log('File size:', file.size);
      console.log('File type:', file.type);
      
      const { data, error } = await supabase.storage
        .from('AI')
        .upload(filePath, file);

      if (error) {
        console.error('Upload error details:', {
          error,
          message: error.message,
          statusCode: (error as { statusCode?: number }).statusCode,
          errorCode: (error as { error?: string }).error
        });
        alert('خطا در آپلود تصویر: ' + error.message);
        setIsUploading(false);
        return;
      }

      console.log('Upload successful, data:', data);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('AI')
        .getPublicUrl(filePath);

      const imageUrl = urlData.publicUrl;
      setUploadedImages(prev => [...prev, imageUrl]);
      
      console.log('✅ Image uploaded successfully!');
      console.log('📁 File path:', filePath);
      console.log('🔗 Public URL:', imageUrl);
      console.log('📸 Total images:', uploadedImages.length + 1);
      
    } catch (error) {
      console.error('Upload error:', error);
      alert('خطا در آپلود تصویر');
    } finally {
      console.log('Upload process finished, setting isUploading to false');
      clearTimeout(uploadTimeout);
      setIsUploading(false);
    }
  };

  // Simple theme toggle function
  const handleThemeToggle = () => {
    const newTheme = localUserProfile?.theme === 'day' ? 'night' : 'day';
    
    // Update local state immediately
    setLocalUserProfile(prev => {
      return prev ? { ...prev, theme: newTheme } : null;
    });
    
    // Apply theme to document immediately
    document.documentElement.setAttribute('data-theme', newTheme);
    
    // Update database in background
    if (user?.id) {
      supabase
        .from('users')
        .update({ theme: newTheme })
        .eq('user_id', user.id)
        .then(({ error }) => {
          if (error) {
            console.error('Database update error:', error);
          }
        });
    }
  };
  // const [retryCount] = useState<number>(0);
  const [isPolling, setIsPolling] = useState<boolean>(false);
  // const [pollingCount] = useState<number>(0);
  // const [currentRequestId] = useState<string | null>(null);
  // const [isUpdatingTheme] = useState(false);
  // const [lastThemeUpdate] = useState<number>(0);

  // نوع محتوا متنی (هم «متن» و هم «TEXT» از سرویس/دیتابیس)
  const isTextType = selectedType === 'متن' || selectedType === 'TEXT';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Restore conversationId from sessionStorage on mount (text chat)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('vipana_chat_conversation_id');
      if (stored) setConversationId(stored);
    }
  }, []);
  // Persist conversationId when it changes
  useEffect(() => {
    if (conversationId && typeof window !== 'undefined') {
      sessionStorage.setItem('vipana_chat_conversation_id', conversationId);
    }
  }, [conversationId]);

  // Reset circuit breaker when database becomes healthy
  useEffect(() => {
    if (!databaseHealthy && Date.now() - lastDatabaseFailure > 60000) {
      console.log('🔄 Attempting to reset database circuit breaker...');
      checkDatabaseHealth().then(isHealthy => {
        if (isHealthy) {
          console.log('✅ Database is healthy again, resetting circuit breaker');
          setDatabaseHealthy(true);
        }
      });
    }
  }, [databaseHealthy, lastDatabaseFailure]);

  // Add debugging functions to window object for console access
  useEffect(() => {
    (window as unknown as { debugVipana: Record<string, unknown> }).debugVipana = {
      checkDatabaseHealth,
      resetCircuitBreaker,
      databaseHealthy,
      lastDatabaseFailure,
      testDatabaseConnection,
      testNetworkConnection,
      forceUnlock,
      isConsumingTokens,
      // Add new debugging functions
      testSupabaseConnection: async () => {
        console.log('🔍 Testing Supabase connection...');
        try {
          const { data, error } = await supabase.from('users').select('count').limit(1);
          console.log('Supabase test result:', { data, error });
          return !error;
        } catch (err) {
          console.error('Supabase connection test failed:', err);
          return false;
        }
      },
      testUserAccess: async (userId: string) => {
        console.log('🔍 Testing user access for:', userId);
        try {
          const { data, error } = await supabase
            .from('users')
            .select('user_id, tokens')
            .eq('user_id', userId)
            .single();
          console.log('User access test result:', { data, error });
          return { success: !error, data, error };
        } catch (err) {
          console.error('User access test failed:', err);
          return { success: false, error: err };
        }
      }
    };
    console.log('🔧 Debug functions available: window.debugVipana');
  }, [databaseHealthy, lastDatabaseFailure, isConsumingTokens]);

  // Timer for waiting time
  useEffect(() => {
    let interval: NodeJS.Timeout;
    let waitingTime = 0;
    if (isWaitingForResponse && !isPolling) {
      waitingTime = 0;
      interval = setInterval(() => {
        waitingTime += 1;
        // Update waiting message with elapsed time
        setMessages(prevMessages => 
          prevMessages.map(msg => {
            if (msg.id.endsWith('_waiting')) {
              const minutes = Math.floor(waitingTime / 60);
              const seconds = waitingTime % 60;
              const timeStr = minutes > 0 ? `${minutes}:${seconds.toString().padStart(2, '0')}` : `${seconds} ثانیه`;
              
              const baseText = selectedType === 'ویدیو' 
                ? 'در حال تولید ویدیو... این فرآیند ممکن است 5-10 دقیقه طول بکشد'
                : 'در حال پردازش...';
              
              return {
                ...msg,
                text: `${baseText} (${timeStr})`
              };
            }
            return msg;
          })
        );
      }, 1000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isWaitingForResponse, isPolling, selectedType]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        console.log('=== FETCHING SERVICES FROM SUPABASE ===');
        console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
        
        // First, let's see what columns exist in the services table
        console.log('Testing Supabase connection and checking table structure...');
        const { data: testData, error: testError } = await supabase
          .from('services')
          .select('*')
          .limit(1);
        
        console.log('Connection test result:', { testData, testError });
        
        if (testError) {
          console.error('Supabase connection failed:', testError);
          throw testError;
        }
        
        // Log the structure of the first record to see what columns exist
        if (testData && testData.length > 0) {
          console.log('=== TABLE STRUCTURE ===');
          console.log('Available columns:', Object.keys(testData[0]));
          console.log('Sample record:', testData[0]);
        }
        
        // Now fetch all services with only existing columns
        const { data: services, error } = await supabase
          .from('services')
          .select('*')
          .order('type', { ascending: true });

        console.log('=== RAW SERVICES DATA ===');
        console.log('Services:', services);
        console.log('Error:', error);
        console.log('Count:', services?.length || 0);

        if (error) {
          console.error('Error fetching services:', error);
          // Use fallback services if database fails
          const fallbackServices = {
            'متن': [
              { id: '1', name: 'GPT', type: 'متن', price: '0.01' },
              { id: '2', name: 'Claude', type: 'متن', price: '0.02' },
              { id: '3', name: 'Gemini', type: 'متن', price: '0.01' }
            ],
            'عکس': [
              { id: '4', name: 'Nano Banana', type: 'عکس', price: '0.01' },
              { id: '5', name: 'Flux', type: 'عکس', price: '0.02' },
              { id: '6', name: 'GPT-Image-1', type: 'عکس', price: '0.03' },
              { id: '7', name: 'Midjourney', type: 'عکس', price: '0.04' }
            ],
            'ویدیو': [
              { id: '8', name: 'Veo', type: 'ویدیو', price: '0.05' },
              { id: '9', name: 'Kling', type: 'ویدیو', price: '0.04' },
              { id: '10', name: 'Wan', type: 'ویدیو', price: '0.03' },
              { id: '11', name: 'Runway', type: 'ویدیو', price: '0.06' }
            ]
          };
          console.log('=== USING FALLBACK SERVICES ===');
          console.log(fallbackServices);
          setServices(fallbackServices);
          setSelectedType('متن');
          setSelectedModel('GPT');
          setServicesLoading(false);
          return;
        }

        if (services && services.length > 0) {
          // Group services by type - adapt to whatever columns exist
          const groupedServices = services.reduce((acc: ServicesData, service: DatabaseService) => {
            const type = service.type || 'unknown';
            if (!acc[type]) {
              acc[type] = [];
            }
            
            // Create service object with available fields
            const serviceObj: Service = {
              id: service.id || service.id,
              type: type,
              name: service.name || service.title || service.model_name || service.model || `Service ${service.id}`,
              price: service.price || service.cost || service.amount || '0.00'
            };
            
            console.log('Processed service object:', serviceObj);
            acc[type].push(serviceObj);
            return acc;
          }, {});

          console.log('=== GROUPED SERVICES ===');
          console.log(groupedServices);
          console.log('Types:', Object.keys(groupedServices));
          console.log('Services for each type:');
          Object.keys(groupedServices).forEach(type => {
            console.log(`${type}:`, groupedServices[type]);
          });
          
          // Special debugging for image services
          if (groupedServices['عکس']) {
            groupedServices['عکس'].forEach((service: Service) => {
              console.log('Image service name:', `"${service.name}"`);
            });
          }

          setServices(groupedServices);
          
          // Set default type to TEXT (or متن if TEXT not in services), then first model for that type
          const defaultType = groupedServices['TEXT'] ? 'TEXT' : (groupedServices['متن'] ? 'متن' : Object.keys(groupedServices)[0]);
          const defaultTypeServices = groupedServices[defaultType];
          setSelectedType(defaultType);
          setSelectedModel(defaultTypeServices?.[0]?.name ?? '');
        } else {
          console.log('=== NO SERVICES FOUND ===');
          // Use fallback services if no data
          const fallbackServices = {
            'متن': [
              { id: '1', name: 'GPT', type: 'متن', price: '0.01' },
              { id: '2', name: 'Claude', type: 'متن', price: '0.02' },
              { id: '3', name: 'Gemini', type: 'متن', price: '0.01' }
            ],
            'عکس': [
              { id: '4', name: 'Nano Banana', type: 'عکس', price: '0.01' },
              { id: '5', name: 'Flux', type: 'عکس', price: '0.02' },
              { id: '6', name: 'GPT-Image-1', type: 'عکس', price: '0.03' },
              { id: '7', name: 'Midjourney', type: 'عکس', price: '0.04' }
            ],
            'ویدیو': [
              { id: '8', name: 'Veo', type: 'ویدیو', price: '0.05' },
              { id: '9', name: 'Kling', type: 'ویدیو', price: '0.04' },
              { id: '10', name: 'Wan', type: 'ویدیو', price: '0.03' },
              { id: '11', name: 'Runway', type: 'ویدیو', price: '0.06' }
            ]
          };
          console.log('=== USING FALLBACK SERVICES ===');
          console.log(fallbackServices);
          setServices(fallbackServices);
          setSelectedType('متن');
          setSelectedModel('GPT');
        }
      } catch (error) {
        console.error('=== ERROR FETCHING SERVICES ===');
        console.error(error);
        // Use fallback services on error
        const fallbackServices = {
          'متن': [
            { id: '1', name: 'GPT', type: 'متن', price: '0.01' },
            { id: '2', name: 'Claude', type: 'متن', price: '0.02' },
            { id: '3', name: 'Gemini', type: 'متن', price: '0.01' }
          ],
          'عکس': [
            { id: '4', name: 'Nano Banana', type: 'عکس', price: '0.01' }
          ],
          'ویدیو': [
            { id: '6', name: 'Runway', type: 'ویدیو', price: '0.05' },
            { id: '7', name: 'Pika', type: 'ویدیو', price: '0.04' }
          ]
        };
        console.log('=== USING FALLBACK SERVICES DUE TO ERROR ===');
        console.log(fallbackServices);
        setServices(fallbackServices);
        setSelectedType('متن');
        setSelectedModel('GPT');
      } finally {
        setServicesLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Fetch coin price from database (price table)
  useEffect(() => {
    const fetchCoinPrice = async () => {
      try {
        console.log('=== FETCHING COIN PRICE ===');
        const { data, error } = await supabase
          .from('price')
          .select('price')
          .limit(1);

        if (error) {
          console.error('Error fetching coin price:', error);
        }

        const value = Array.isArray(data) && data.length > 0 ? Number(data[0]?.price) : null;
        if (Number.isFinite(value)) {
          setCoinPrice(value as number);
        } else {
          setCoinPrice(null);
        }
      } catch (e) {
        console.error('Unexpected error fetching coin price:', e);
        setCoinPrice(null);
      }
    };

    fetchCoinPrice();
  }, []);

  const handleTypeChange = (type: string) => {
    console.log('=== TYPE CHANGED ===');
    console.log('Selected type:', type);
    console.log('Available services:', services);
    console.log('Services for this type:', services[type]);
    
    setSelectedType(type);
    const typeServices = services[type];
    if (typeServices && typeServices.length > 0) {
      console.log('Setting model to:', typeServices[0].name);
      setSelectedModel(typeServices[0].name);
    } else {
      console.log('No services found for type:', type);
      setSelectedModel('');
    }
  };

  // Payment functions
  const handleRecharge = async () => {
    if (!user || !localUserProfile) {
      console.error('User not authenticated')
      return
    }

    try {
      setIsRecharging(true)
      
      // Test if API is accessible first
      console.log('Testing API accessibility...')
      try {
        const healthResponse = await fetch('/api/health', {
          method: 'GET',
          signal: AbortSignal.timeout(5000) // 5 second timeout for test
        })
        console.log('Health check result:', healthResponse.status)
        if (!healthResponse.ok) {
          throw new Error(`Health check failed: ${healthResponse.status}`)
        }
      } catch (healthError) {
        console.error('Health check failed:', healthError)
        throw new Error('سرور در دسترس نیست - لطفاً صفحه را رفرش کنید')
      }

      
      // Add timeout to the fetch request
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout
      
      console.log('Making payment request...')
      const response = await fetch('/api/zarinpal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: rechargeAmount,
          user_id: user.id,
          email: user.email,
          description: `شارژ حساب ویپانا - ${rechargeAmount} ریال`
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      console.log('Payment request completed, status:', response.status)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (data.success && data.url) {
        // Redirect to Zarinpal gateway
        window.location.href = data.url
      } else {
        console.error('Payment initiation failed:', data.error)
        alert(`خطا در شروع پرداخت: ${data.error}`)
      }
    } catch (error) {
      console.error('Payment error:', error)
      console.error('Error type:', typeof error)
      console.error('Error name:', error instanceof Error ? error.name : 'N/A')
      console.error('Error message:', error instanceof Error ? error.message : 'N/A')
      
      if (error instanceof Error && error.name === 'AbortError') {
        alert('زمان اتصال به سرور به پایان رسید')
      } else if (error instanceof Error && error.message.includes('fetch failed')) {
        alert('خطا در ارتباط با سرور - لطفاً اتصال اینترنت خود را بررسی کنید')
      } else if (error instanceof TypeError && error.message.includes('fetch')) {
        alert('خطا در درخواست شبکه - لطفاً صفحه را رفرش کنید')
      } else if (error instanceof Error && error.message.includes('NetworkError')) {
        alert('خطا در شبکه - لطفاً اتصال اینترنت خود را بررسی کنید')
      } else if (error instanceof Error && error.message.includes('سرور در دسترس نیست')) {
        alert(error.message)
      } else {
        console.error('Unknown error type:', error)
        alert(`خطا در ارتباط با سرور: ${error instanceof Error ? error.message : 'خطای نامشخص'}`)
      }
    } finally {
      setIsRecharging(false)
    }
  }

  // Handle payment callback parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const success = urlParams.get('success')
    const error = urlParams.get('error')
    const tokens = urlParams.get('tokens')

    if (success === 'payment_successful' && tokens) {
      const newTokens = parseInt(tokens)
      updateUserTokens((localUserProfile?.tokens || 0) + newTokens)
      alert(`پرداخت موفق! ${tokens} سکه به حساب شما اضافه شد.`)
      
      // Clean URL
      window.history.replaceState({}, '', '/chat')
    } else if (error) {
      let errorMessage = 'خطا در پرداخت'
      switch (error) {
        case 'payment_failed':
          errorMessage = 'پرداخت ناموفق بود'
          break
        case 'payment_verification_failed':
          errorMessage = 'تأیید پرداخت ناموفق بود'
          break
        case 'authority_missing':
          errorMessage = 'شناسه پرداخت یافت نشد'
          break
        case 'payment_record_not_found':
          errorMessage = 'رکورد پرداخت یافت نشد'
          break
        case 'token_update_failed':
          errorMessage = 'خطا در به‌روزرسانی سکه‌ها'
          break
        case 'callback_error':
          errorMessage = 'خطا در پردازش پرداخت'
          break
        case 'price_fetch_failed':
          errorMessage = 'خطا در دریافت قیمت سکه'
          break
        case 'user_fetch_failed':
          errorMessage = 'خطا در دریافت اطلاعات کاربر'
          break
        case 'invalid_tokens':
          errorMessage = 'تعداد سکه‌های نامعتبر'
          break
        case 'payment_already_processed':
          errorMessage = 'این پرداخت قبلاً پردازش شده است'
          break
      }
      alert(errorMessage)
      
      // Clean URL
      window.history.replaceState({}, '', '/chat')
    }
  }, [localUserProfile, updateUserTokens])

  const handleSendMessage = async () => {
    console.log('=== HANDLE SEND MESSAGE START ===');
    console.log('inputValue:', inputValue);
    console.log('selectedType:', selectedType);
    console.log('selectedModel:', selectedModel);
    
    if (inputValue.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: inputValue,
        isUser: true,
        timestamp: new Date(),
      };
      setMessages([...messages, newMessage]);
      
      // Add waiting message with different text based on content type and model
        const waitingText = selectedType === 'ویدیو' 
          ? 'در حال تولید ویدیو... این فرآیند ممکن است 5-20 دقیقه طول بکشد. لطفاً صبر کنید'
          : isTextType
          ? 'در حال تولید متن... لطفاً صبر کنید'
          : 'در حال تولید عکس با KIE... لطفاً صبر کنید';
        
      const waitingMessage: Message = {
        id: Date.now().toString() + '_waiting',
        text: waitingText,
        isUser: false,
        timestamp: new Date(),
        type: 'ai-waiting'
      };
      setMessages(prevMessages => [...prevMessages, waitingMessage]);
      
      // Reset retry count
      // setRetryCount(0);
      
      setIsWaitingForResponse(true);
      
      // Check if using KIE for image generation (ALL image types)
      console.log('About to check KIE condition...');
      
      if (selectedType === 'عکس') {
        try {
          console.log('Using KIE for image generation with model:', selectedModel);
          
          // 🚨 CRITICAL: DEDUCT TOKENS FIRST (FINANCIAL SAFETY)
          console.log('💰 DEDUCTING TOKENS BEFORE IMAGE GENERATION (FINANCIAL SAFETY)');
          const tokenResult = await consumeTokensForService('عکس');
          
          if (!tokenResult) {
            console.log('❌ Token deduction failed - ABORTING image generation to prevent financial loss');
            setIsWaitingForResponse(false);
            setServerBusyMessage('سرور مشغول است، لطفا بعدا دوباره تلاش کنید');
            
            // Remove waiting message from chat
            setMessages(prevMessages => prevMessages.filter(msg => !msg.id.endsWith('_waiting')));
            return;
          }
          
          console.log('✅ Tokens successfully deducted - proceeding with image generation');
          
          // Determine model type for aspect ratio mapping
          const isGPTModel = selectedModel === 'GPT-Image-1';
          const isFluxModel = selectedModel === 'Flux';
          const isMidjourneyModel = selectedModel === 'Midjourney' || selectedModel === 'midjourney';
          
          console.log('Model detection debug - selectedModel:', selectedModel);
          console.log('Model detection debug - isGPTModel:', isGPTModel, 'isFluxModel:', isFluxModel, 'isMidjourneyModel:', isMidjourneyModel);
          console.log('Using KIE API for model:', selectedModel);
          
          const response = await fetch('/api/kie/image', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              prompt: inputValue,
              imageUrls: uploadedImages.length > 0 ? uploadedImages : undefined,
              imageSize: isGPTModel 
                ? (selectedAspectRatio === '1:1' ? '1:1' : 
                   selectedAspectRatio === '16:9' ? '3:2' : 
                   selectedAspectRatio === '9:16' ? '2:3' : '1:1')
                : (selectedAspectRatio === '1:1' ? '1:1' : 
                   selectedAspectRatio === '16:9' ? '16:9' : 
                   selectedAspectRatio === '9:16' ? '9:16' : '1:1'),
              model: selectedModel
            })
          });

          const responseData = await response.json();
          
          // Debug logging
          console.log('=== FRONTEND RESPONSE DEBUG ===');
          console.log('Response Data:', responseData);
          console.log('Response Success:', responseData.success);
          console.log('Response Data Structure:', responseData.data);
          console.log('Task ID Check:', responseData.data?.data?.taskId);
          console.log('===============================');

          if (responseData.success && responseData.data?.data?.taskId) {
            // KIE Nano Banana - Start polling for task completion
            const taskId = responseData.data.data.taskId;
            console.log('✅ KIE task creation successful, starting polling with taskId:', taskId);
            
            // Update waiting message with AI animation
            setMessages(prevMessages => {
              const filteredMessages = prevMessages.filter(msg => !msg.id.endsWith('_waiting'));
              const updatedWaitingMessage: Message = {
                id: Date.now().toString() + '_waiting',
                text: `در حال تولید عکس با ${selectedModel}... لطفاً صبر کنید`,
                isUser: false,
                timestamp: new Date(),
                type: 'ai-waiting'
              };
              return [...filteredMessages, updatedWaitingMessage];
            });

            // Start polling for completion
            pollImageGenerationStatus(taskId, isGPTModel, isFluxModel, isMidjourneyModel);
            return;
          } else {
            // KIE task creation failed
            console.log('=== KIE TASK CREATION FAILED ===');
            throw new Error(responseData.error || 'Failed to create image generation task');
          }
        } catch (error) {
          console.error('KIE Image generation error:', error);
          setMessages(prevMessages => {
            const filteredMessages = prevMessages.filter(msg => !msg.id.endsWith('_waiting'));
            const errorMessage: Message = {
              id: Date.now().toString() + '_error',
              text: 'خطا در تولید عکس: ' + (error instanceof Error ? error.message : 'خطای نامشخص'),
              isUser: false,
              timestamp: new Date(),
            };
            return [...filteredMessages, errorMessage];
          });
          setIsWaitingForResponse(false);
          return;
        }
      }
      
      // Check if using KIE for video generation
      if (selectedType === 'ویدیو') {
        try {
          console.log('Using KIE for video generation with model:', selectedModel);
          
          // 🚨 CRITICAL: DEDUCT TOKENS FIRST (FINANCIAL SAFETY)
          console.log('💰 DEDUCTING TOKENS BEFORE VIDEO GENERATION (FINANCIAL SAFETY)');
          const tokenResult = await consumeTokensForService('ویدیو');
          
          if (!tokenResult) {
            console.log('❌ Token deduction failed - ABORTING video generation to prevent financial loss');
            setIsWaitingForResponse(false);
            setServerBusyMessage('سرور مشغول است، لطفا بعدا دوباره تلاش کنید');
            
            // Remove waiting message from chat
            setMessages(prevMessages => prevMessages.filter(msg => !msg.id.endsWith('_waiting')));
            return;
          }
          
          console.log('✅ Tokens successfully deducted - proceeding with video generation');
          
          const response = await fetch('/api/kie/video', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              prompt: inputValue,
              imageUrls: uploadedImages.length > 0 ? uploadedImages : undefined,
              videoLength: selectedAspectRatio,
              model: selectedModel
            })
          });

          const responseData = await response.json();
          
          console.log('=== VIDEO GENERATION RESPONSE DEBUG ===');
          console.log('Response Data:', responseData);
          console.log('Response Success:', responseData.success);
          console.log('Response Data Structure:', responseData.data);
          console.log('Task ID Check:', responseData.data?.data?.taskId);
          console.log('========================================');

          if (responseData.success && responseData.data?.data?.taskId) {
            const taskId = responseData.data.data.taskId;
            console.log('✅ KIE video task creation successful, starting polling with taskId:', taskId);
            
            // Update waiting message
            setMessages(prevMessages => {
              const filteredMessages = prevMessages.filter(msg => !msg.id.endsWith('_waiting'));
              const updatedWaitingMessage: Message = {
                id: Date.now().toString() + '_waiting',
                text: `در حال تولید ویدیو با ${selectedModel}... لطفاً صبر کنید`,
                isUser: false,
                timestamp: new Date(),
                type: 'ai-waiting'
              };
              return [...filteredMessages, updatedWaitingMessage];
            });

            // Start polling for completion
            pollVideoGenerationStatus(taskId, selectedModel);
            return;
          } else {
            console.log('=== KIE VIDEO TASK CREATION FAILED ===');
            throw new Error(responseData.error || 'Failed to create video generation task');
          }
        } catch (error) {
          console.error('KIE Video generation error:', error);
          setMessages(prevMessages => {
            const filteredMessages = prevMessages.filter(msg => !msg.id.endsWith('_waiting'));
            const errorMessage: Message = {
              id: Date.now().toString() + '_error',
              text: 'خطا در تولید ویدیو: ' + (error instanceof Error ? error.message : 'خطای نامشخص'),
              isUser: false,
              timestamp: new Date(),
            };
            return [...filteredMessages, errorMessage];
          });
          setIsWaitingForResponse(false);
          return;
        }
      }
      
      // Text chat: Google Gemini + LangChain + MongoDB (no webhook)
      if (isTextType) {
        try {
          const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: inputValue.trim(),
              conversationId: conversationId ?? undefined,
              userId: user?.id || userProfile?.user_id || '',
            }),
          });
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.error || `HTTP ${res.status}`);
          }
          if (data.success && typeof data.content === 'string') {
            const newId = data.conversationId ? String(data.conversationId) : null;
            if (newId) {
              setConversationId(newId);
            }
            setMessages(prev => {
              const withoutWaiting = prev.filter(m => !m.id.endsWith('_waiting'));
              return [
                ...withoutWaiting,
                {
                  id: Date.now().toString() + '_ai',
                  text: data.content,
                  isUser: false,
                  timestamp: new Date(),
                },
              ];
            });
            setInputValue('');
          } else {
            throw new Error(data.error || 'پاسخ نامعتبر');
          }
        } catch (err) {
          setMessages(prev => {
            const withoutWaiting = prev.filter(m => !m.id.endsWith('_waiting'));
            return [
              ...withoutWaiting,
              {
                id: Date.now().toString() + '_error',
                text: 'خطا در چت: ' + (err instanceof Error ? err.message : 'خطای نامشخص'),
                isUser: false,
                timestamp: new Date(),
              },
            ];
          });
        } finally {
          setIsWaitingForResponse(false);
        }
        return;
      }
      
      // Check webhook status for non-image types
      // Skip webhook status check - n8n webhooks don't support GET requests
      const webhookStatus = { available: true, isTestMode: false };
      if (!webhookStatus.available) {
        console.log('Webhook is not available, showing error message');
        setMessages(prevMessages => {
          const filteredMessages = prevMessages.filter(msg => !msg.id.endsWith('_waiting'));
          const errorMessage: Message = {
            id: Date.now().toString() + '_error',
            text: (webhookStatus as { message?: string }).message || 'خطا: وب‌هوک در دسترس نیست.',
            isUser: false,
            timestamp: new Date(),
          };
          return [...filteredMessages, errorMessage];
        });
        
        // If it's test mode, add retry button and instructions
        if (webhookStatus.isTestMode) {
          const instructionMessage: Message = {
            id: Date.now().toString() + '_instruction',
            text: 'راهنمای فعال‌سازی workflow:\n1. به n8n بروید\n2. روی "Execute workflow" کلیک کنید\n3. سپس دکمه تلاش مجدد را بزنید',
            isUser: false,
            timestamp: new Date(),
          };
          setMessages(prevMessages => [...prevMessages, instructionMessage]);
          
          const retryMessage: Message = {
            id: Date.now().toString() + '_retry',
            text: 'برای تلاش مجدد، دکمه زیر را کلیک کنید:',
            isUser: false,
            timestamp: new Date(),
            showRetryButton: true,
          };
          setMessages(prevMessages => [...prevMessages, retryMessage]);
        }
        
        setIsWaitingForResponse(false);
        setInputValue('');
        return;
      }

      // Send data to webhook (for text and video services only)
      console.log('=== GOING TO WEBHOOK PATH ===');
      console.log('Using webhook for type:', selectedType);
      
      // Check if this is text generation - use n8n webhook
      if (isTextType) {
        console.log('Text generation detected - using n8n webhook');
      }
      try {
        const requestId = Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9);
        // setCurrentRequestId(requestId);
        
        const requestData = {
          type: selectedType,
          model: selectedModel,
          user_id: user?.id || userProfile?.user_id || '',
          prompt: inputValue,
          request_id: requestId,
          ...((selectedType === 'ویدیو') && { aspect_ratio: selectedAspectRatio })
        };

        console.log('Sending data to webhook:', requestData);
        console.log('Calling n8n webhook directly');
        const webhookUrl = process.env.NEXT_PUBLIC_WEBHOOK_URL;
        console.log('Environment variable NEXT_PUBLIC_WEBHOOK_URL:', process.env.NEXT_PUBLIC_WEBHOOK_URL);
        console.log('Target webhook URL:', webhookUrl);

        console.log('Making direct request to n8n webhook...');
        
        if (!webhookUrl) {
          throw new Error('Webhook URL is not configured');
        }
        
        // Call n8n webhook directly
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(requestData),
        });

        console.log('Fetch request completed');
        console.log('Response object:', response);
        
        if (!response) {
          throw new Error('No response received from webhook');
        }
        
        console.log('Response status:', response.status);
        console.log('Response statusText:', response.statusText);
        console.log('Response ok:', response.ok);
        console.log('Response type:', response.type);
        console.log('Response url:', response.url);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));

        // Check if response is successful (200-299) or has content
        const isSuccessful = response.ok || (response.status >= 200 && response.status < 300);
        console.log('Is response successful:', isSuccessful);

        if (isSuccessful) {
          try {
            const responseData = await response.json();
            console.log('=== RAW WEBHOOK RESPONSE ===');
            console.log('Full response data:', JSON.stringify(responseData, null, 2));
            console.log('Response data type:', typeof responseData);
            console.log('Is array?', Array.isArray(responseData));
            console.log('Array length:', Array.isArray(responseData) ? responseData.length : 'N/A');
            console.log('Response data keys:', Object.keys(responseData || {}));
            console.log('Response success:', responseData?.success);
            console.log('Response parsed data:', responseData?.parsed);
            
            // Check if this is a video request that needs polling
            if (selectedType === 'ویدیو') {
              console.log('Video request detected, starting polling...');
              // Start polling for video completion regardless of initial response
              startPolling(requestId, 20);
              return; // Exit early, polling will handle the rest
            }
            
            // For text requests, don't start polling - wait for immediate response
            if (isTextType) {
              console.log('Text request detected, processing immediate response...');
            }
            
            // Check if webhook response contains a message
            let messageContent = null;
            let messageType: 'text' | 'image' | 'video' = 'text';
            let imageUrl = null;
            let videoUrl = null;
            let updatedTokens = null;
            
            // Log for text generation
            if (isTextType) {
              console.log('🔤 Processing text generation response from n8n webhook');
            }
            
            // Helper function to detect if content is an image URL
            const isImageUrl = (url: string) => {
              const isImage = url && (
                url.includes('.png') || 
                url.includes('.jpg') || 
                url.includes('.jpeg') || 
                url.includes('.gif') || 
                url.includes('.webp') ||
                url.includes('blob.core.windows.net') ||
                url.includes('replicate.delivery') ||
                url.includes('cdn.openai.com') ||
                url.includes('img.theapi.app') ||
                url.includes('theapi.app')
              );
              console.log('isImageUrl check:', { url: url?.substring(0, 100) + '...', isImage });
              return isImage;
            };

            // Helper function to detect if content is a video URL
            const isVideoUrl = (url: string) => {
              const isVideo = url && (
                url.includes('.mp4') || 
                url.includes('.mov') || 
                url.includes('.avi') || 
                url.includes('.webm') || 
                url.includes('.mkv') ||
                url.includes('runwayml.com') ||
                url.includes('pika.art') ||
                url.includes('video') ||
                url.includes('stream')
              );
              console.log('isVideoUrl check:', { url: url?.substring(0, 100) + '...', isVideo });
              return isVideo;
            };
            
            // Special handling for direct array format like [{"message": {"content": "url"}, "tokens": "1424\n"}]
            if (Array.isArray(responseData) && responseData.length > 0) {
              console.log('=== DIRECT ARRAY FORMAT DETECTED ===');
              const item = responseData[0];
              console.log('First array item:', JSON.stringify(item, null, 2));
              if (item.message && item.message.content) {
                const content = item.message.content;
                console.log('Direct array content:', content);
                console.log('Content type check:', typeof content);
                console.log('Content length:', content?.length);
                if (isImageUrl(content)) {
                  console.log('Direct array: Content is image URL - SETTING IMAGE TYPE');
                  messageContent = 'تصویر تولید شده:';
                  messageType = 'image';
                  imageUrl = content;
                  console.log('Set messageContent:', messageContent);
                  console.log('Set messageType:', messageType);
                  console.log('Set imageUrl:', imageUrl);
                } else if (isVideoUrl(content)) {
                  console.log('Direct array: Content is video URL - SETTING VIDEO TYPE');
                  messageContent = 'ویدیو تولید شده:';
                  messageType = 'video';
                  videoUrl = content;
                  console.log('Set messageContent:', messageContent);
                  console.log('Set messageType:', messageType);
                  console.log('Set videoUrl:', videoUrl);
                } else {
                  console.log('Direct array: Content is NOT image or video URL');
                  messageContent = content;
                }
                if (item.tokens) {
                  updatedTokens = parseInt(item.tokens.toString().replace(/\n/g, ''), 10);
                  console.log('Set updatedTokens:', updatedTokens);
                }
              } else {
                console.log('No message.content found in array item');
              }
            } else {
              console.log('Response is not an array or is empty');
            }
            
            // Handle API route response format: { success: true, data: "...", parsed: {...}, status: 200 }
            if (!messageContent && responseData && responseData.success && responseData.parsed) {
              console.log('Using API route response format handler');
              const parsedData = responseData.parsed;
              
              // Handle the new response format: { "235\n": { message: { content: "..." }, tokens: "235\n" } }
              if (parsedData && typeof parsedData === 'object' && !Array.isArray(parsedData)) {
                // Find the first key that contains the data
                const dataKey = Object.keys(parsedData).find(key => 
                  parsedData[key] && 
                  typeof parsedData[key] === 'object' && 
                  parsedData[key].message
                );
                
                if (dataKey && parsedData[dataKey]) {
                  const data = parsedData[dataKey];
                  if (data.message && data.message.content) {
                    messageContent = data.message.content;
                    
                    // Check if the content itself is an image URL
                    if (isImageUrl(messageContent)) {
                      messageType = 'image';
                      imageUrl = messageContent;
                      messageContent = 'تصویر تولید شده:';
                    } else if (isVideoUrl(messageContent)) {
                      messageType = 'video';
                      videoUrl = messageContent;
                      messageContent = 'ویدیو تولید شده:';
                    }
                  }
                  // Check if this is an image response with separate fields
                  if (data.type === 'image' && data.image_url) {
                    messageType = 'image';
                    imageUrl = data.image_url;
                    messageContent = 'تصویر تولید شده:';
                  }
                  if (data.tokens !== undefined) {
                    // Convert tokens to number (remove \n if present)
                    updatedTokens = parseInt(data.tokens.toString().replace(/\n/g, ''), 10);
                  }
                }
              }
            }
            // Handle direct response format: { "235\n": { message: { content: "..." }, tokens: "235\n" } }
            if (!messageContent && responseData && typeof responseData === 'object' && !Array.isArray(responseData)) {
              console.log('Using direct response format handler');
              // Find the first key that contains the data
              const dataKey = Object.keys(responseData).find(key => 
                responseData[key] && 
                typeof responseData[key] === 'object' && 
                responseData[key].message
              );
              
              if (dataKey && responseData[dataKey]) {
                const data = responseData[dataKey];
                if (data.message && data.message.content) {
                  messageContent = data.message.content;
                  
                  // Check if the content itself is an image URL
                  if (isImageUrl(messageContent)) {
                    messageType = 'image';
                    imageUrl = messageContent;
                    messageContent = 'تصویر تولید شده:';
                  } else if (isVideoUrl(messageContent)) {
                    messageType = 'video';
                    videoUrl = messageContent;
                    messageContent = 'ویدیو تولید شده:';
                  }
                }
                // Check if this is an image response with separate fields
                if (data.type === 'image' && data.image_url) {
                  messageType = 'image';
                  imageUrl = data.image_url;
                  messageContent = 'تصویر تولید شده:';
                }
                if (data.tokens !== undefined) {
                  // Convert tokens to number (remove \n if present)
                  updatedTokens = parseInt(data.tokens.toString().replace(/\n/g, ''), 10);
                }
              }
            }
            // Handle array response format
            if (!messageContent && Array.isArray(responseData) && responseData.length > 0) {
              console.log('Using array response format handler');
              console.log('Array response data:', responseData);
              const firstItem = responseData[0];
              console.log('First item:', firstItem);
              if (firstItem.message && firstItem.message.content) {
                messageContent = firstItem.message.content;
                console.log('Found message content:', messageContent);
                
                // Check if the content itself is an image URL
                if (isImageUrl(messageContent)) {
                  console.log('Content is image URL, setting image type');
                  messageType = 'image';
                  imageUrl = messageContent;
                  messageContent = 'تصویر تولید شده:';
                } else if (isVideoUrl(messageContent)) {
                  console.log('Content is video URL, setting video type');
                  messageType = 'video';
                  videoUrl = messageContent;
                  messageContent = 'ویدیو تولید شده:';
                }
              }
              // Check if this is an image response with separate fields
              if (firstItem.type === 'image' && firstItem.image_url) {
                messageType = 'image';
                imageUrl = firstItem.image_url;
                messageContent = 'تصویر تولید شده:';
              }
              if (firstItem.tokens !== undefined) {
                // Convert tokens to number (remove \n if present)
                updatedTokens = parseInt(firstItem.tokens.toString().replace(/\n/g, ''), 10);
              }
            }
            // Check for message.content in the response
            if (!messageContent && responseData && responseData.message && responseData.message.content) {
              console.log('Using simple message content handler');
              messageContent = responseData.message.content;
              
              // Check if the content itself is an image URL
              if (isImageUrl(messageContent)) {
                messageType = 'image';
                imageUrl = messageContent;
                messageContent = 'تصویر تولید شده:';
              } else if (isVideoUrl(messageContent)) {
                messageType = 'video';
                videoUrl = messageContent;
                messageContent = 'ویدیو تولید شده:';
              }
            }
            // Check for parsed data with content
            if (!messageContent && responseData && responseData.parsed && responseData.parsed.content) {
              console.log('Using parsed content handler');
              messageContent = responseData.parsed.content;
              
              // Check if the content itself is an image URL
              if (isImageUrl(messageContent)) {
                messageType = 'image';
                imageUrl = messageContent;
                messageContent = 'تصویر تولید شده:';
              } else if (isVideoUrl(messageContent)) {
                messageType = 'video';
                videoUrl = messageContent;
                messageContent = 'ویدیو تولید شده:';
              }
            }
            // Check for direct data field (webhook route fallback)
            if (!messageContent && responseData && responseData.data && typeof responseData.data === 'string') {
              console.log('Using direct data handler');
              messageContent = responseData.data;
              
              // Check if the data itself is an image URL
              if (isImageUrl(messageContent)) {
                messageType = 'image';
                imageUrl = messageContent;
                messageContent = 'تصویر تولید شده:';
              } else if (isVideoUrl(messageContent)) {
                messageType = 'video';
                videoUrl = messageContent;
                messageContent = 'ویدیو تولید شده:';
              }
            }
            // Check for direct content in parsed data
            if (!messageContent && responseData && responseData.parsed && responseData.parsed.message && responseData.parsed.message.content) {
              console.log('Using parsed message content handler');
              messageContent = responseData.parsed.message.content;
              
              // Check if the content itself is an image URL
              if (isImageUrl(messageContent)) {
                messageType = 'image';
                imageUrl = messageContent;
                messageContent = 'تصویر تولید شده:';
              } else if (isVideoUrl(messageContent)) {
                messageType = 'video';
                videoUrl = messageContent;
                messageContent = 'ویدیو تولید شده:';
              }
            }
            
            // Check for updated tokens in various response formats
            if (updatedTokens === null) {
              if (responseData && responseData.tokens !== undefined) {
                updatedTokens = parseInt(responseData.tokens.toString().replace(/\n/g, ''), 10);
              } else if (responseData && responseData.parsed && responseData.parsed.tokens !== undefined) {
                updatedTokens = parseInt(responseData.parsed.tokens.toString().replace(/\n/g, ''), 10);
              } else if (responseData && responseData.user && responseData.user.tokens !== undefined) {
                updatedTokens = parseInt(responseData.user.tokens.toString().replace(/\n/g, ''), 10);
              }
            }
            
            console.log('=== FINAL EXTRACTION RESULTS ===');
            console.log('Extracted messageContent:', messageContent);
            console.log('Extracted messageType:', messageType);
            console.log('Extracted imageUrl:', imageUrl);
            console.log('Extracted videoUrl:', videoUrl);
            console.log('Extracted updatedTokens:', updatedTokens);
            
            // Final fallback: if we have content but no image/video type set, check if it's an image or video URL
            if (messageContent && messageType === 'text' && isImageUrl(messageContent)) {
              console.log('Final fallback: Content is image URL, converting to image type');
              messageType = 'image';
              imageUrl = messageContent;
              messageContent = 'تصویر تولید شده:';
            } else if (messageContent && messageType === 'text' && isVideoUrl(messageContent)) {
              console.log('Final fallback: Content is video URL, converting to video type');
              messageType = 'video';
              videoUrl = messageContent;
              messageContent = 'ویدیو تولید شده:';
            }
            
            if (messageContent) {
              // Remove waiting message and add bot response
              setMessages(prevMessages => {
                const filteredMessages = prevMessages.filter(msg => !msg.id.endsWith('_waiting'));
                const botMessage: Message = {
                  id: Date.now().toString() + '_bot',
                  text: messageContent,
                  isUser: false,
                  timestamp: new Date(),
                  type: messageType,
                  imageUrl: imageUrl,
                  videoUrl: videoUrl,
                };
                return [...filteredMessages, botMessage];
              });
              
              // Log specific message for text generation
              if (isTextType && messageType === 'text') {
                console.log('✅ Text generation response received and displayed to user');
                console.log('Text content:', messageContent);
              } else {
                console.log('Added bot message to chat:', messageContent, 'Type:', messageType, 'Image URL:', imageUrl, 'Video URL:', videoUrl);
              }
            } else {
              // Remove waiting message even if no content
              setMessages(prevMessages => prevMessages.filter(msg => !msg.id.endsWith('_waiting')));
              console.log('No message content found in webhook response');
            }
            
            if (updatedTokens !== null) {
              console.log('Updated tokens from webhook:', updatedTokens);
              // Update user profile tokens
              updateUserTokens(updatedTokens);
              console.log('User tokens updated successfully');
            } else {
              console.log('No tokens found in webhook response');
            }
            
            // Clear waiting state
            setIsWaitingForResponse(false);
          } catch (jsonError) {
            console.error('Error parsing JSON response:', jsonError);
            console.log('Response is OK but not JSON, getting text:', await response.text());
            // Clear waiting state on error
            setIsWaitingForResponse(false);
          }
        } else {
          console.log('Response is not OK, but checking if it contains valid content...');
          console.log('Response status:', response.status);
          console.log('Response statusText:', response.statusText);
          console.log('Response headers:', Object.fromEntries(response.headers.entries()));
          
          try {
            // Try to read response as JSON first
            const responseText = await response.text();
            console.log('Response text received:', responseText);
            
            try {
              const responseData = JSON.parse(responseText);
              console.log('Response as JSON:', responseData);
              
              // Check if the response contains valid content (like the video URL)
              if (Array.isArray(responseData) && responseData.length > 0) {
                const item = responseData[0];
                if (item.message && item.message.content) {
                  console.log('Found valid content in non-OK response, processing...');
                  
                  // Process the content as if it was a successful response
                  let messageContent = null;
                  let messageType: 'text' | 'image' | 'video' = 'text';
                  let imageUrl = null;
                  let videoUrl = null;
                  let updatedTokens = null;
                  
                  const content = item.message.content;
                  
                  // Helper functions
                  const isImageUrl = (url: string) => {
                    return url && (
                      url.includes('.png') || 
                      url.includes('.jpg') || 
                      url.includes('.jpeg') || 
                      url.includes('.gif') || 
                      url.includes('.webp') ||
                      url.includes('blob.core.windows.net') ||
                      url.includes('replicate.delivery') ||
                      url.includes('cdn.openai.com') ||
                      url.includes('img.theapi.app') ||
                      url.includes('theapi.app')
                    );
                  };
                  
                  const isVideoUrl = (url: string) => {
                    return url && (
                      url.includes('.mp4') || 
                      url.includes('.mov') || 
                      url.includes('.avi') || 
                      url.includes('.webm') || 
                      url.includes('.mkv') ||
                      url.includes('runwayml.com') ||
                      url.includes('pika.art') ||
                      url.includes('video') ||
                      url.includes('stream') ||
                      url.includes('storage.theapi.app')
                    );
                  };
                  
                  if (isImageUrl(content)) {
                    messageContent = 'تصویر تولید شده:';
                    messageType = 'image';
                    imageUrl = content;
                  } else if (isVideoUrl(content)) {
                    messageContent = 'ویدیو تولید شده:';
                    messageType = 'video';
                    videoUrl = content;
                  } else {
                    messageContent = content;
                  }
                  
                  if (item.tokens) {
                    updatedTokens = parseInt(item.tokens.toString().replace(/\n/g, ''), 10);
                  }
                  
                  if (messageContent) {
                    // Remove waiting message and add bot response
                    setMessages(prevMessages => {
                      const filteredMessages = prevMessages.filter(msg => !msg.id.endsWith('_waiting'));
                      const botMessage: Message = {
                        id: Date.now().toString() + '_bot',
                        text: messageContent,
                        isUser: false,
                        timestamp: new Date(),
                        type: messageType,
                        imageUrl: imageUrl,
                        videoUrl: videoUrl,
                      };
                      return [...filteredMessages, botMessage];
                    });
                    
                    if (updatedTokens !== null) {
                      updateUserTokens(updatedTokens);
                    }
                    
                    setIsWaitingForResponse(false);
                    setInputValue('');
                    return; // Exit successfully
                  }
                }
              }
            } catch (jsonError) {
              console.log('Response is not valid JSON:', jsonError);
            }
          } catch (textError) {
            console.log('Could not read response as text:', textError);
          }
          
          // If we get here, it's a real error
          const errorDetails: ErrorDetails = {
            status: response.status,
            statusText: response.statusText,
            url: response.url,
            error: 'Unknown error'
          };
          
          // Check for specific n8n webhook errors
          let errorMessage = `خطا در تولید محتوا: ${errorDetails.status} - ${errorDetails.statusText}`;
          
          if (response.status === 404) {
            try {
              const responseText = await response.text();
              const errorData = JSON.parse(responseText);
              if (errorData.message && errorData.message.includes('webhook') && errorData.message.includes('not registered')) {
                errorMessage = 'خطا: وب‌هوک n8n در حالت تست است. لطفاً workflow را فعال کنید.';
              }
            } catch {
              // Use default error message
            }
          }
          
          console.log('Final errorDetails object:', errorDetails);
          console.error('Failed to send message to webhook:', errorDetails);
          
          // Remove waiting message and show error message
          setMessages(prevMessages => prevMessages.filter(msg => !msg.id.endsWith('_waiting')));
          
          // Add error message to chat
          const errorMsg: Message = {
            id: Date.now().toString() + '_error',
            text: errorMessage,
            isUser: false,
            timestamp: new Date(),
          };
          setMessages(prevMessages => [...prevMessages, errorMsg]);
          
          // Add retry button for webhook errors
          if (response.status === 404) {
            const retryMsg: Message = {
              id: Date.now().toString() + '_retry',
              text: 'برای تلاش مجدد، دکمه زیر را کلیک کنید:',
              isUser: false,
              timestamp: new Date(),
              showRetryButton: true,
            };
            setMessages(prevMessages => [...prevMessages, retryMsg]);
          }
          
          // Clear waiting state on error
          setIsWaitingForResponse(false);
        }
      } catch (error) {
        console.error('Error sending message to webhook:', {
          error: error,
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        });
        
        // Clear waiting state on error
        setIsWaitingForResponse(false);
        
        // Remove waiting message on error
        setMessages(prevMessages => prevMessages.filter(msg => !msg.id.endsWith('_waiting')));
        
        // Show user-friendly error message based on error type
        if (error instanceof Error && error.name === 'AbortError') {
          const timeoutMessage = selectedType === 'ویدیو' 
            ? 'زمان انتظار (20 دقیقه) به پایان رسید. تولید ویدیو ممکن است زمان بیشتری نیاز داشته باشد. لطفاً دوباره تلاش کنید.'
            : 'زمان انتظار (5 دقیقه) به پایان رسید. لطفاً دوباره تلاش کنید.';
          alert(timeoutMessage);
        } else {
          alert('خطا در ارسال پیام. لطفاً اتصال اینترنت خود را بررسی کنید.');
        }
      }
      
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Function to get service price from existing services data
  const getServicePriceFromData = (serviceType: string, modelName: string): number => {
    try {
      console.log('🔍 Getting price for:', { serviceType, modelName });
      console.log('🔍 Available services:', services);
      
      const typeServices = services[serviceType];
      if (!typeServices || typeServices.length === 0) {
        console.log('❌ No services found for type:', serviceType);
        return getFallbackPrice(serviceType);
      }
      
      const service = typeServices.find(s => s.name === modelName);
      if (!service) {
        console.log('❌ Service not found for model:', modelName);
        return getFallbackPrice(serviceType);
      }
      
      const price = Number(service.price) || 0;
      console.log('✅ Found service price:', price);
      return price;
      
    } catch (error) {
      console.error('❌ Error getting service price from data:', error);
      return getFallbackPrice(serviceType);
    }
  };

  // Function to get fallback price
  const getFallbackPrice = (serviceType: string): number => {
    if (serviceType === 'عکس') {
      return 4; // 4 tokens for image generation
    } else if (serviceType === 'ویدیو') {
      return 8; // 8 tokens for video generation
    } else {
      return 4; // Default fallback
    }
  };

  // Simple token consumption without database (fallback mode)
  const consumeTokensSimple = async (
    userId: string,
    model: string,
    price: number
  ): Promise<TokenConsumptionResult> => {
    try {
      console.log('🪙 === SIMPLE TOKEN CONSUMPTION (NO DATABASE) ===');
      console.log('🪙 Parameters:', { userId, model, price });
      
      // Validate input
      if (!userId || !model || price <= 0) {
        return {
          success: false,
          error: 'Invalid parameters'
        }
      }

      // Get current user balance from state
      const currentBalance = localUserProfile?.tokens || userProfile?.tokens || 0;
      console.log('✅ Current balance from state:', currentBalance);
      
      // Check if user has enough tokens
      if (currentBalance < price) {
        console.error('❌ Insufficient tokens');
        return {
          success: false,
          error: `Insufficient tokens. Current: ${currentBalance}, Required: ${price}`
        }
      }

      // Calculate new balance
      const newBalance = currentBalance - price;
      console.log('✅ New balance calculated:', newBalance);
      
      // Update local state immediately
      console.log('🔄 Updating local state...');
      updateUserTokens(newBalance);
      
      console.log('✅ Tokens consumed successfully (local state only)');
      
      return {
        success: true,
        newTokenBalance: newBalance
      }
      
    } catch (error) {
      console.error('❌ Simple token consumption error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  };

  // Database health check function
  const checkDatabaseHealth = useCallback(async (): Promise<boolean> => {
    try {
      console.log('🔍 Checking database health...');
      const { error } = await supabase
        .from('users')
        .select('user_id')
        .limit(1);
      
      const isHealthy = !error;
      console.log(isHealthy ? '✅ Database is healthy' : '❌ Database is unhealthy');
      return isHealthy;
    } catch (error) {
      console.error('❌ Database health check failed:', error);
      return false;
    }
  }, []);

  // Manual circuit breaker reset function
  const resetCircuitBreaker = useCallback(async () => {
    console.log('🔄 Manually resetting circuit breaker...');
    const isHealthy = await checkDatabaseHealth();
    if (isHealthy) {
      setDatabaseHealthy(true);
      setLastDatabaseFailure(0);
      console.log('✅ Circuit breaker reset successfully');
    } else {
      console.log('❌ Cannot reset circuit breaker - database is still unhealthy');
    }
  }, [checkDatabaseHealth]);

  // Add resetCircuitBreaker to debug functions after it's defined
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as unknown as Record<string, unknown>).resetCircuitBreaker = resetCircuitBreaker;
    }
  }, [resetCircuitBreaker]);

  // Token consumption via server API (atomic)
  const consumeTokens = async (
    userId: string,
    model: string,
    price: number
  ): Promise<TokenConsumptionResult> => {
    try {
      console.log('🪙 Starting token consumption via server API:', { userId, model, price });

      if (!userId || !model || price <= 0) {
        return {
          success: false,
          error: 'Invalid parameters'
        }
      }

      // Get current balance for immediate UX
      const currentBalance = localUserProfile?.tokens || userProfile?.tokens || 0;
      if (currentBalance < price) {
        console.error('❌ Insufficient tokens');
        return {
          success: false,
          error: `Insufficient tokens. Current: ${currentBalance}, Required: ${price}`
        }
      }

      // Optimistically update local state
      const newBalance = currentBalance - price;
      updateUserTokens(newBalance);
      console.log('✅ Local state updated optimistically:', newBalance);

      // Call server API with retries
      const maxAttempts = 3;
      let attempt = 0;
      let lastError: unknown = null;

      while (attempt < maxAttempts) {
        attempt++;
        const start = Date.now();
        
        try {
          console.log(`🔁 Attempt ${attempt}/${maxAttempts} - calling server API...`);
          
          const res = await fetch('/api/tokens/consume', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, model, price })
          });

          const json = await res.json().catch(() => ({})) as { success?: boolean; newBalance?: number; error?: string };
          const durationMs = Date.now() - start;
          
          console.log(`🔁 Attempt ${attempt} result:`, { 
            status: res.status, 
            durationMs, 
            success: json.success, 
            newBalance: json.newBalance,
            error: json.error 
          });

          if (res.ok && json.success && typeof json.newBalance === 'number') {
            // Update with server-returned balance (more accurate)
            updateUserTokens(json.newBalance);
            console.log('✅ Token consumption successful via server API');
            return { success: true, newTokenBalance: json.newBalance };
          } else {
            console.log('❌ Server response validation failed:', {
              resOk: res.ok,
              jsonSuccess: json.success,
              newBalanceType: typeof json.newBalance,
              newBalanceValue: json.newBalance,
              jsonError: json.error
            });
          }

          lastError = json.error || `HTTP ${res.status}`;
        } catch (e) {
          lastError = e;
          console.error(`❌ Attempt ${attempt} failed:`, e);
        }

        // Wait before retry (exponential backoff with jitter)
        if (attempt < maxAttempts) {
          const base = Math.pow(2, attempt - 1) * 1000;
          const jitter = base * (0.6 + Math.random() * 0.8);
          console.log(`⏳ Waiting ${Math.round(jitter)}ms before retry...`);
          await new Promise(r => setTimeout(r, jitter));
        }
      }

      // All attempts failed - revert optimistic update
      updateUserTokens(currentBalance);
      console.error('❌ All server API attempts failed:', lastError);
      return { 
        success: false, 
        error: lastError instanceof Error ? lastError.message : String(lastError) 
      };
      
    } catch (error) {
      console.error('❌ Unexpected error:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  };

  // Diagnostic function to test database performance and RLS policies
  const testDatabasePerformance = async (): Promise<void> => {
    try {
      console.log('🔍 === DATABASE PERFORMANCE & RLS TEST ===');
      
      const userId = '7f5c074b-8e63-49de-94c1-54b091f3fe11';
      
      // Test 1: Simple select
      console.log('🔍 Test 1: Simple select...');
      const start1 = Date.now();
      const { data: selectData, error: selectError } = await supabase
        .from('users')
        .select('user_id, tokens')
        .eq('user_id', userId)
        .limit(1);
      const selectTime = Date.now() - start1;
      console.log(`✅ Select completed in ${selectTime}ms:`, selectData, selectError);
      
      if (selectError) {
        console.error('❌ SELECT failed - Check RLS policies for users table (SELECT permission)');
      }
      
      // Test 2: Simple update
      console.log('🔍 Test 2: Simple update...');
      const start2 = Date.now();
      const { error: updateError } = await supabase
        .from('users')
        .update({ tokens: selectData?.[0]?.tokens || 0 })
        .eq('user_id', userId);
      const updateTime = Date.now() - start2;
      console.log(`✅ Update completed in ${updateTime}ms:`, updateError);
      
      if (updateError) {
        console.error('❌ UPDATE failed - Check RLS policies for users table (UPDATE permission)');
        console.error('❌ Error details:', updateError);
      }
      
      // Test 3: Usage table insert
      console.log('🔍 Test 3: Usage table insert...');
      const start3 = Date.now();
      const { error: insertError } = await supabase
        .from('usage')
        .insert({
          user_id: userId,
          model: 'Test Model',
          price: 1
        });
      const insertTime = Date.now() - start3;
      console.log(`✅ Insert completed in ${insertTime}ms:`, insertError);
      
      if (insertError) {
        console.error('❌ INSERT failed - Check RLS policies for usage table (INSERT permission)');
        console.error('❌ Error details:', insertError);
      }
      
      console.log('📊 Performance Summary:');
      console.log(`- Select: ${selectTime}ms`);
      console.log(`- Update: ${updateTime}ms`);
      console.log(`- Insert: ${insertTime}ms`);
      
      // RLS Policy Recommendations
      console.log('🔧 RLS Policy Recommendations:');
      console.log('1. For users table - Allow UPDATE: (uid() = user_id)');
      console.log('2. For usage table - Allow INSERT: (uid() = user_id)');
      console.log('3. Check Supabase Dashboard > Authentication > Policies');
      
    } catch (error) {
      console.error('❌ Database performance test failed:', error);
    }
  };

  // Test function for token consumption
  const testTokenConsumption = async (): Promise<void> => {
    try {
      console.log('🧪 === TESTING TOKEN CONSUMPTION ===');
      
      const result = await consumeTokens('7f5c074b-8e63-49de-94c1-54b091f3fe11', 'Flux', 4);
      console.log('🧪 Result:', result);
      
      if (result.success) {
        console.log('✅ Success! New balance:', result.newTokenBalance);
      } else {
        console.log('❌ Failed:', result.error);
      }
      
    } catch (error) {
      console.error('❌ Test failed:', error);
    }
  };

  // Comprehensive database diagnostic test
  const testDatabaseConnection = async (): Promise<void> => {
    try {
      console.log('🔍 === COMPREHENSIVE DATABASE DIAGNOSTIC ===');
      
      const userId = '7f5c074b-8e63-49de-94c1-54b091f3fe11';
      
      // Test 1: Check Supabase connection
      console.log('🔍 Test 1: Supabase connection...');
      console.log('🔍 Supabase client initialized:', !!supabase);
      
      // Test 2: Simple SELECT
      console.log('🔍 Test 2: Simple SELECT...');
      const start1 = Date.now();
      const { data: selectData, error: selectError } = await supabase
        .from('users')
        .select('user_id, tokens')
        .eq('user_id', userId)
        .limit(1);
      const selectTime = Date.now() - start1;
      console.log(`✅ SELECT completed in ${selectTime}ms:`, selectData, selectError);
      
      if (selectError) {
        console.error('❌ SELECT failed:', selectError);
        console.error('❌ This indicates a fundamental connection issue');
        return;
      }
      
      // Test 3: Check if user exists
      if (!selectData || selectData.length === 0) {
        console.error('❌ User not found in database!');
        console.error('❌ User ID:', userId);
        console.error('❌ This might be why UPDATE fails');
        return;
      }
      
      console.log('✅ User found in database:', selectData[0]);
      
      // Test 4: Simple UPDATE with timeout
      console.log('🔍 Test 4: Simple UPDATE with 5s timeout...');
      const start2 = Date.now();
      
      const updatePromise = supabase
        .from('users')
        .update({ tokens: selectData[0].tokens })
        .eq('user_id', userId);
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('UPDATE timeout after 5 seconds')), 5000);
      });
      
      try {
        const { error: updateError } = await Promise.race([
          updatePromise,
          timeoutPromise
        ]) as SupabaseResponse;
        
        const updateTime = Date.now() - start2;
        console.log(`✅ UPDATE completed in ${updateTime}ms:`, updateError);
        
        if (updateError) {
          console.error('❌ UPDATE failed with error:', updateError);
          console.error('❌ Error code:', updateError.code);
          console.error('❌ Error message:', updateError.message);
          console.error('❌ Error details:', updateError.details);
          console.error('❌ Error hint:', updateError.hint);
        } else {
          console.log('✅ UPDATE works - Database connection is fine');
        }
        
      } catch {
        console.error('❌ UPDATE timed out after 5 seconds');
        console.error('❌ This suggests a network or database performance issue');
      }
      
      // Test 5: Usage table INSERT
      console.log('🔍 Test 5: Usage table INSERT...');
      const start3 = Date.now();
      
      const insertPromise = supabase
        .from('usage')
        .insert({
          user_id: userId,
          model: 'Test Model',
          price: 1
        });
      
      const insertTimeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('INSERT timeout after 3 seconds')), 3000);
      });
      
      try {
        const { error: insertError } = await Promise.race([
          insertPromise,
          insertTimeoutPromise
        ]) as SupabaseResponse;
        
        const insertTime = Date.now() - start3;
        console.log(`✅ INSERT completed in ${insertTime}ms:`, insertError);
        
        if (insertError) {
          console.error('❌ INSERT failed with error:', insertError);
          console.error('❌ Error code:', insertError.code);
          console.error('❌ Error message:', insertError.message);
        } else {
          console.log('✅ INSERT works - Usage table is accessible');
        }
        
      } catch {
        console.error('❌ INSERT timed out after 3 seconds');
        console.error('❌ This suggests a network or database performance issue');
      }
      
      // Summary
      console.log('📊 DIAGNOSTIC SUMMARY:');
      console.log('- SELECT time:', selectTime + 'ms');
      console.log('- User found:', !!selectData && selectData.length > 0);
      console.log('- If UPDATE/INSERT timeout: Check network connection to Supabase');
      console.log('- If UPDATE/INSERT fail with error: Check database schema and permissions');
      
    } catch (error) {
      console.error('❌ Database diagnostic test failed:', error);
    }
  };

  // Network connectivity test
  const testNetworkConnection = async (): Promise<void> => {
    try {
      console.log('🌐 === NETWORK CONNECTIVITY TEST ===');
      
      // Test 1: Basic internet connectivity
      console.log('🌐 Test 1: Basic internet connectivity...');
      const start1 = Date.now();
      await fetch('https://httpbin.org/get', { 
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      const internetTime = Date.now() - start1;
      console.log(`✅ Internet connectivity: ${internetTime}ms`);
      
      // Test 2: Supabase API connectivity (simplified)
      console.log('🌐 Test 2: Supabase API connectivity...');
      console.log('🌐 Testing Supabase client functionality...');
      
      try {
        const start2 = Date.now();
        const { error } = await supabase.from('users').select('count').limit(1);
        const supabaseTime = Date.now() - start2;
        console.log(`✅ Supabase API connectivity: ${supabaseTime}ms`);
        
        if (error) {
          console.error('❌ Supabase API error:', error);
        } else {
          console.log('✅ Supabase API is accessible');
        }
      } catch (apiError) {
        console.error('❌ Supabase API not accessible:', apiError);
      }
      
    } catch (error) {
      console.error('❌ Network connectivity test failed:', error);
      if (error instanceof Error && error.name === 'TimeoutError') {
        console.error('❌ Network timeout - Check your internet connection');
      }
    }
  };

  // Simple database test function
  const testDatabaseOperations = async (): Promise<void> => {
    try {
      console.log('🧪 === TESTING DATABASE OPERATIONS ===');
      
      const userId = '7f5c074b-8e63-49de-94c1-54b091f3fe11';
      
      // Test 1: Check if user exists
      console.log('🔍 Test 1: Check if user exists...');
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('user_id, tokens')
        .eq('user_id', userId)
        .limit(1);
      
      console.log('User query result:', { userData, userError });
      
      if (userError) {
        console.error('❌ User query failed:', userError);
        return;
      }
      
      if (!userData || userData.length === 0) {
        console.error('❌ User not found in database!');
        return;
      }
      
      console.log('✅ User found:', userData[0]);
      
      // Test 2: Try to update tokens
      console.log('🔍 Test 2: Try to update tokens...');
      const { data: updateData, error: updateError } = await supabase
        .from('users')
        .update({ tokens: userData[0].tokens })
        .eq('user_id', userId);
      
      console.log('Update result:', { updateData, updateError });
      
      if (updateError) {
        console.error('❌ Update failed:', updateError);
        console.error('❌ Error code:', updateError.code);
        console.error('❌ Error message:', updateError.message);
        console.error('❌ Error details:', updateError.details);
        console.error('❌ Error hint:', updateError.hint);
      } else {
        console.log('✅ Update successful');
      }
      
      // Test 3: Try to insert usage record
      console.log('🔍 Test 3: Try to insert usage record...');
      const { data: insertData, error: insertError } = await supabase
        .from('usage')
        .insert({
          user_id: userId,
          model: 'Test Model',
          price: 1
        });
      
      console.log('Insert result:', { insertData, insertError });
      
      if (insertError) {
        console.error('❌ Insert failed:', insertError);
        console.error('❌ Error code:', insertError.code);
        console.error('❌ Error message:', insertError.message);
        console.error('❌ Error details:', insertError.details);
        console.error('❌ Error hint:', insertError.hint);
      } else {
        console.log('✅ Insert successful');
      }
      
    } catch (error) {
      console.error('❌ Database test failed:', error);
    }
  };

  // Function to consume tokens for AI services (image and video) - FINANCIAL SAFETY
  const consumeTokensForService = async (serviceType: 'عکس' | 'ویدیو'): Promise<boolean> => {
    try {
      console.log('🪙 === TOKEN CONSUMPTION FUNCTION CALLED (FINANCIAL SAFETY) ===');
      console.log('🪙 Service type:', serviceType);
      console.log('🪙 User ID:', user?.id);
      console.log('🪙 Selected Model:', selectedModel);
      
      if (!user?.id || !selectedModel) {
        console.error('❌ Missing user ID or selected model');
        alert('خطا: اطلاعات کاربر یا مدل یافت نشد');
        return false;
      }

      // Get service price from existing services data
      console.log('🔍 Getting service price from existing data...');
      const servicePrice = getServicePriceFromData(serviceType, selectedModel);
      console.log('🪙 Service price:', servicePrice);
      
      // Use robust token consumption with database
      console.log('🪙 Consuming tokens with database...');
      const result = await consumeTokens(user.id, selectedModel, servicePrice);
      console.log('🪙 consumeTokens result:', result);

      if (result.success) {
        console.log('✅ Token consumption successful!');
        // Update local state
        if (result.newTokenBalance !== undefined) {
          updateUserTokens(result.newTokenBalance);
        }
        
        // Token deduction successful (no message shown to user)
        
        return true;
      } else {
        console.error('❌ Token consumption failed:', result.error);
        return false;
      }

    } catch (error) {
      console.error('❌ Error in consumeTokensForService:', error);
      return false;
    }
  };

  // Make test functions available globally
  if (typeof window !== 'undefined') {
    (window as unknown as Record<string, unknown>).testTokenConsumption = testTokenConsumption;
    (window as unknown as Record<string, unknown>).testDatabasePerformance = testDatabasePerformance;
    (window as unknown as Record<string, unknown>).testDatabaseConnection = testDatabaseConnection;
    (window as unknown as Record<string, unknown>).testNetworkConnection = testNetworkConnection;
    (window as unknown as Record<string, unknown>).consumeTokensSimple = consumeTokensSimple;
    (window as unknown as Record<string, unknown>).testDatabaseOperations = testDatabaseOperations;
  }

  const pollImageGenerationStatus = async (taskId: string, isGPTModel: boolean = false, isFluxModel: boolean = false, isMidjourneyModel: boolean = false) => {
    const maxAttempts = 60; // 30 minutes with 30-second intervals
    let attempts = 0;
    
    // Add a safety timeout to reset state after 5 minutes regardless
    const safetyTimeout = setTimeout(() => {
      console.log('Safety timeout reached, resetting waiting state');
      setIsWaitingForResponse(false);
      setIsPolling(false);
    }, 5 * 60 * 1000); // 5 minutes
    
    const poll = async () => {
      try {
        attempts++;
        console.log(`Checking image generation status (attempt ${attempts}/${maxAttempts}) for task:`, taskId);
        
        // Use single API endpoint with model parameter
        console.log('Polling debug - isGPTModel:', isGPTModel, 'isFluxModel:', isFluxModel, 'isMidjourneyModel:', isMidjourneyModel);
        const modelName = isGPTModel ? 'GPT-Image-1' : (isFluxModel ? 'Flux' : (isMidjourneyModel ? 'Midjourney' : 'Nano Banana'));
        console.log('Polling with model:', modelName);
        
        const response = await fetch(`/api/kie/image?taskId=${taskId}&model=${modelName}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        const responseData = await response.json();
        
        console.log('Image generation status response:', responseData);
        
        if (response.ok && responseData.success) {
          // Handle KIE API response structure
          const status = responseData.status;
          const isCompleted = responseData.isCompleted;
          const isFailed = responseData.isFailed;
          
          console.log('KIE Task data:', responseData.data);
          console.log('Status:', status);
          console.log('Is Completed:', isCompleted);
          console.log('Is Failed:', isFailed);
          console.log('Should continue polling:', !isCompleted && !isFailed);
          
          if (isCompleted && (responseData.result || responseData.data?.resultJson)) {
            // Image generation completed
            console.log('KIE Image generation completed!');
            console.log('Task result:', responseData.result);
            
            // Extract image URL from KIE resultJson
            let imageUrl = null;
            
            // Handle different response structures based on model type
            if (isGPTModel) {
              // GPT model response structure
              console.log('Processing GPT model response');
              imageUrl = responseData.resultUrls?.[0] || responseData.result?.[0];
              console.log('GPT image URL from resultUrls:', imageUrl);
            } else if (isMidjourneyModel) {
              // Midjourney model response structure
              console.log('Processing Midjourney model response');
              imageUrl = responseData.result || responseData.resultUrls?.[0]?.resultUrl;
              console.log('Midjourney image URL:', imageUrl);
            } else {
              // Nano Banana model response structure
              console.log('Processing Nano Banana model response');
              console.log('Checking for resultJson:', responseData.data?.resultJson);
              if (responseData.data?.resultJson) {
                try {
                  const resultJson = JSON.parse(responseData.data.resultJson);
                  imageUrl = resultJson.resultUrls?.[0];
                  console.log('Parsed resultJson:', resultJson);
                  console.log('Extracted image URL from resultJson:', imageUrl);
                } catch (parseError) {
                  console.error('Error parsing resultJson:', parseError);
                  console.error('Raw resultJson:', responseData.data.resultJson);
                }
              }
              
              // Fallback to other possible locations for Nano Banana
              if (!imageUrl) {
                // Check if result is a JSON string that needs parsing
                if (responseData.result && typeof responseData.result === 'string') {
                  try {
                    const parsedResult = JSON.parse(responseData.result);
                    if (parsedResult.resultUrls) {
                      imageUrl = parsedResult.resultUrls[0];
                      console.log('Extracted image URL from parsed result:', imageUrl);
                    }
                  } catch {
                    console.log('Result is not JSON, using as direct URL');
                    imageUrl = responseData.result;
                  }
                } else {
                  imageUrl = responseData.result?.image_url ||
                            responseData.result?.image_urls?.[0] ||
                            responseData.result ||
                            responseData.data?.result;
                }
              }
            }
            console.log('Using image URL:', imageUrl);
            console.log('Image URL type:', typeof imageUrl);
            console.log('Image URL length:', imageUrl?.length);
            console.log('Full KIE response object:', responseData);
            
            // Validate image URL
            if (!imageUrl || imageUrl === '' || imageUrl === null || imageUrl === undefined) {
              console.error('No valid image URL found in response');
              console.log('Available fields in KIE response:', Object.keys(responseData));
              console.log('responseData.result:', responseData.result);
              console.log('responseData.data:', responseData.data);
              
              setMessages(prevMessages => {
                const filteredMessages = prevMessages.filter(msg => !msg.id.endsWith('_waiting'));
                const errorMessage: Message = {
                  id: Date.now().toString() + '_error',
                  text: 'عکس آماده شد اما آدرس آن یافت نشد. لطفاً دوباره تلاش کنید.',
                  isUser: false,
                  timestamp: new Date(),
                };
                return [...filteredMessages, errorMessage];
              });
              setIsWaitingForResponse(false);
              return;
            }
            
            setMessages(prevMessages => {
              const filteredMessages = prevMessages.filter(msg => !msg.id.endsWith('_waiting'));
              const imageMessage: Message = {
                id: Date.now().toString() + '_image',
                text: 'عکس شما آماده شد!',
                isUser: false,
                timestamp: new Date(),
                type: 'image',
                imageUrl: imageUrl
              };
              return [...filteredMessages, imageMessage];
            });
            
            // Immediately reset the waiting state after adding the image message
            console.log('Image message added, immediately resetting waiting state');
            setIsWaitingForResponse(false);
            setIsPolling(false);
            setInputValue('');
            
            // Tokens already deducted before generation (FINANCIAL SAFETY)
            console.log('✅ Tokens already deducted before image generation - no additional deduction needed');
            
            console.log('Setting isWaitingForResponse to false after successful image generation');
            clearTimeout(safetyTimeout);
            setIsWaitingForResponse(false);
            setIsPolling(false); // Also reset polling state
            setInputValue(''); // Clear the input field
            return;
          } else if (isFailed) {
            // Image generation failed
            console.log('KIE Image generation failed:', responseData.error);
            
            setMessages(prevMessages => {
              const filteredMessages = prevMessages.filter(msg => !msg.id.endsWith('_waiting'));
              const errorMessage: Message = {
                id: Date.now().toString() + '_error',
                text: 'خطا در تولید عکس: ' + (responseData.error || 'خطای نامشخص'),
                isUser: false,
                timestamp: new Date(),
              };
              return [...filteredMessages, errorMessage];
            });
            
            clearTimeout(safetyTimeout);
            setIsWaitingForResponse(false);
            return;
          } else if (!isCompleted && !isFailed) {
            // Still processing, continue polling
            if (attempts < maxAttempts) {
              setTimeout(poll, 30000); // Wait 30 seconds before next check
            } else {
              // Timeout
              console.log('Image generation timeout after 30 minutes');
              
              setMessages(prevMessages => {
                const filteredMessages = prevMessages.filter(msg => !msg.id.endsWith('_waiting'));
                const timeoutMessage: Message = {
                  id: Date.now().toString() + '_timeout',
                  text: 'زمان تولید عکس به پایان رسید. لطفاً دوباره تلاش کنید.',
                  isUser: false,
                  timestamp: new Date(),
                };
                return [...filteredMessages, timeoutMessage];
              });
              
              setIsWaitingForResponse(false);
            }
          }
        } else {
          // API error
          console.error('Failed to check image generation status:', responseData?.error || responseData?.message || 'Unknown error');
          
          if (attempts < maxAttempts) {
            setTimeout(poll, 30000); // Wait 30 seconds before retry
          } else {
            setMessages(prevMessages => {
              const filteredMessages = prevMessages.filter(msg => !msg.id.endsWith('_waiting'));
              const errorMessage: Message = {
                id: Date.now().toString() + '_error',
                text: 'خطا در بررسی وضعیت تولید عکس',
                isUser: false,
                timestamp: new Date(),
              };
              return [...filteredMessages, errorMessage];
            });
            
            setIsWaitingForResponse(false);
          }
        }
      } catch (error) {
        console.error('Error polling image generation status:', error);
        
        if (attempts < maxAttempts) {
          setTimeout(poll, 30000); // Wait 30 seconds before retry
        } else {
          setMessages(prevMessages => {
            const filteredMessages = prevMessages.filter(msg => !msg.id.endsWith('_waiting'));
            const errorMessage: Message = {
              id: Date.now().toString() + '_error',
              text: 'خطا در بررسی وضعیت تولید عکس',
              isUser: false,
              timestamp: new Date(),
            };
            return [...filteredMessages, errorMessage];
          });
          
          setIsWaitingForResponse(false);
        }
      }
    };
    
    // Start polling
    poll();
  };

  const pollVideoGenerationStatus = async (taskId: string, model: string) => {
    const maxAttempts = 120; // 60 minutes with 30-second intervals for video
    let attempts = 0;
    
    // Set polling state
    setIsPolling(true);
    
    // Add a safety timeout to reset state after 10 minutes regardless
    const safetyTimeout = setTimeout(() => {
      console.log('Video safety timeout reached, resetting waiting state');
      setIsWaitingForResponse(false);
      setIsPolling(false);
    }, 10 * 60 * 1000); // 10 minutes
    
    const poll = async () => {
      try {
        attempts++;
        console.log(`Checking video generation status (attempt ${attempts}/${maxAttempts}) for task:`, taskId);
        
        const response = await fetch(`/api/kie/video?taskId=${taskId}&model=${model}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        const responseData = await response.json();
        console.log('Video generation status response:', responseData);
        
        if (response.ok && responseData.success) {
          const status = responseData.status;
          const isCompleted = responseData.isCompleted;
          const isFailed = responseData.isFailed;
          const videoUrl = responseData.result || responseData.resultUrl;
          
          console.log('Video Task data:', responseData.data);
          console.log('Status:', status);
          console.log('Is Completed:', isCompleted);
          console.log('Is Failed:', isFailed);
          console.log('Video URL:', videoUrl);
          console.log('Should continue polling:', !isCompleted && !isFailed);
          
          if (isCompleted && videoUrl) {
            console.log('Video generation completed!');
            
            setMessages(prevMessages => {
              const filteredMessages = prevMessages.filter(msg => !msg.id.endsWith('_waiting'));
              const videoMessage: Message = {
                id: Date.now().toString(),
                text: 'ویدیو شما آماده شد!',
                isUser: false,
                timestamp: new Date(),
                type: 'video',
                videoUrl: videoUrl
              };
              return [...filteredMessages, videoMessage];
            });
            
            clearTimeout(safetyTimeout);
            setIsWaitingForResponse(false);
            setIsPolling(false);
            setInputValue('');
            
            // Tokens already deducted before generation (FINANCIAL SAFETY)
            console.log('✅ Tokens already deducted before video generation - no additional deduction needed');
            
            return;
          } else if (isFailed) {
            console.log('Video generation failed:', responseData.error);
            setMessages(prevMessages => {
              const filteredMessages = prevMessages.filter(msg => !msg.id.endsWith('_waiting'));
              const errorMessage: Message = {
                id: Date.now().toString() + '_error',
                text: 'خطا در تولید ویدیو: ' + (responseData.error || 'خطای نامشخص'),
                isUser: false,
                timestamp: new Date(),
              };
              return [...filteredMessages, errorMessage];
            });
            clearTimeout(safetyTimeout);
            setIsWaitingForResponse(false);
            return;
          } else if (!isCompleted && !isFailed) {
            if (attempts < maxAttempts) {
              setTimeout(poll, 30000); // Wait 30 seconds before next check
            } else {
              console.log('Video generation timeout after 60 minutes');
              setMessages(prevMessages => {
                const filteredMessages = prevMessages.filter(msg => !msg.id.endsWith('_waiting'));
                const timeoutMessage: Message = {
                  id: Date.now().toString() + '_timeout',
                  text: 'زمان تولید ویدیو به پایان رسید. لطفاً دوباره تلاش کنید.',
                  isUser: false,
                  timestamp: new Date(),
                };
                return [...filteredMessages, timeoutMessage];
              });
              clearTimeout(safetyTimeout);
              setIsWaitingForResponse(false);
              return;
            }
          }
        } else {
          console.error('Error fetching video generation status:', responseData.error || 'Unknown error');
          if (attempts < maxAttempts) {
            setTimeout(poll, 30000);
          } else {
            setMessages(prevMessages => {
              const filteredMessages = prevMessages.filter(msg => !msg.id.endsWith('_waiting'));
              const errorMessage: Message = {
                id: Date.now().toString() + '_error',
                text: 'خطا در دریافت وضعیت تولید ویدیو: ' + (responseData.error || 'خطای نامشخص'),
                isUser: false,
                timestamp: new Date(),
              };
              return [...filteredMessages, errorMessage];
            });
            clearTimeout(safetyTimeout);
            setIsWaitingForResponse(false);
          }
        }
      } catch (error) {
        console.error('Polling error:', error);
        setMessages(prevMessages => {
          const filteredMessages = prevMessages.filter(msg => !msg.id.endsWith('_waiting'));
          const errorMessage: Message = {
            id: Date.now().toString() + '_error',
            text: 'خطا در بررسی وضعیت تولید ویدیو: ' + (error instanceof Error ? error.message : 'خطای نامشخص'),
            isUser: false,
            timestamp: new Date(),
          };
          return [...filteredMessages, errorMessage];
        });
        clearTimeout(safetyTimeout);
        setIsWaitingForResponse(false);
      }
    };
    
    // Start polling
    poll();
  };

  const checkVideoStatus = async (requestId: string): Promise<{ success: boolean; data?: unknown; error?: string }> => {
    try {
      console.log(`Checking video status for request: ${requestId}`);
      
      // First try the status endpoint
      try {
        const webhookUrl = 'https://n8n.vipana.ir/webhook/content-handler';
        const statusUrl = `${webhookUrl}/status`;
        
        const response = await fetch(statusUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({ request_id: requestId }),
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Video status response:', data);
          return { success: true, data };
        } else {
          console.log('Status endpoint failed, trying main webhook...');
        }
      } catch (statusError) {
        console.log('Status endpoint error, trying main webhook...', statusError);
      }
      
      // Fallback: try the main webhook with a status check request
      try {
        const webhookUrl = 'https://n8n.vipana.ir/webhook/content-handler';
      const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({ 
            type: 'status_check',
            request_id: requestId,
            user_id: user?.id || userProfile?.user_id || ''
          }),
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Main webhook status response:', data);
          return { success: true, data };
        } else {
          const errorText = await response.text();
          console.log('Main webhook status error:', response.status, errorText);
          return { success: false, error: `Status check failed: ${response.status}` };
        }
      } catch (webhookError) {
        console.log('Main webhook status check failed:', webhookError);
        return { success: false, error: webhookError instanceof Error ? webhookError.message : 'Unknown error' };
      }
    } catch (error) {
      console.log('Video status check failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  const activateWorkflow = async (): Promise<boolean> => {
    try {
      console.log('Attempting to activate n8n workflow...');
      
      // Try to send a simple request to activate the workflow
      const webhookUrl = process.env.NEXT_PUBLIC_WEBHOOK_URL || 'https://n8n.vipana.ir/webhook/content-handler';
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          type: 'activate',
          user_id: user?.id || userProfile?.user_id || '',
          prompt: 'activate'
        }),
      });
      
      console.log('Workflow activation response:', response.status, response.statusText);
      return response.status !== 404;
    } catch (error) {
      console.log('Workflow activation failed:', error);
      return false;
    }
  };

  const startPolling = async (requestId: string, maxPolls: number = 20) => {
    console.log(`Starting polling for request: ${requestId}, max polls: ${maxPolls}`);
    setIsPolling(true);
    // setPollingCount(0);
    
    for (let poll = 1; poll <= maxPolls; poll++) {
      console.log(`Polling attempt ${poll}/${maxPolls}`);
      // setPollingCount(poll);
      
      // Update waiting message to show polling status
      setMessages(prevMessages => 
        prevMessages.map(msg => {
          if (msg.id.endsWith('_waiting')) {
            const baseText = selectedType === 'ویدیو' 
              ? 'در حال تولید ویدیو... این فرآیند ممکن است 5-20 دقیقه طول بکشد'
              : 'در حال پردازش...';
            return {
              ...msg,
              text: `${baseText} (بررسی وضعیت ${poll}/${maxPolls})`
            };
          }
          return msg;
        })
      );
      
      const result = await checkVideoStatus(requestId);
      
      if (result.success && result.data) {
        const data = result.data as { status?: string; video_url?: string; tokens?: number };
        // Check if video is ready
        if (data.status === 'completed' && data.video_url) {
          console.log('Video is ready!', data);
          
          // Process the completed video
          const videoUrl = data.video_url;
          const tokens = data.tokens || 0;
          
          // Remove waiting message and add video message
          setMessages(prevMessages => {
            const filteredMessages = prevMessages.filter(msg => !msg.id.endsWith('_waiting'));
            const videoMessage: Message = {
              id: Date.now().toString() + '_video',
              text: 'ویدیو تولید شده:',
              isUser: false,
              timestamp: new Date(),
              type: 'video',
              videoUrl: videoUrl,
            };
            return [...filteredMessages, videoMessage];
          });
          
          // Update tokens
          if (tokens > 0) {
            updateUserTokens(tokens);
          }
          
          setIsPolling(false);
          setIsWaitingForResponse(false);
          setInputValue('');
          return;
        } else if (data.status === 'failed') {
          console.log('Video generation failed:', data);
          
          // Remove waiting message and show error
          setMessages(prevMessages => {
            const filteredMessages = prevMessages.filter(msg => !msg.id.endsWith('_waiting'));
            const errorMessage: Message = {
              id: Date.now().toString() + '_error',
              text: 'خطا در تولید ویدیو. لطفاً دوباره تلاش کنید.',
              isUser: false,
              timestamp: new Date(),
            };
            return [...filteredMessages, errorMessage];
          });
          
          setIsPolling(false);
          setIsWaitingForResponse(false);
          return;
        }
        // If status is 'processing' or 'pending', continue polling
      } else {
        console.log('Status check failed:', result.error);
        // Continue polling even if status check fails
        // This is important for when webhook is in test mode
      }
      
      // Wait 1 minute before next poll (except for the last attempt)
      if (poll < maxPolls) {
        console.log('Waiting 60 seconds before next poll...');
        await new Promise(resolve => setTimeout(resolve, 60000)); // 60 seconds
      }
      
      // After 3 polls (3 minutes), try to resend the original request
      if (poll === 3) {
        console.log('After 3 minutes, trying to resend original request...');
        try {
          const originalRequestData = {
            type: selectedType,
            model: selectedModel,
            user_id: user?.id || userProfile?.user_id || '',
            prompt: inputValue,
            request_id: requestId,
            ...((selectedType === 'عکس' || selectedType === 'ویدیو') && { aspect_ratio: selectedAspectRatio })
          };
          
          const retryResponse = await fetch('/api/n8n/handler', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify(originalRequestData),
          });
          
          if (retryResponse.ok) {
            const retryData = await retryResponse.json();
            console.log('Retry response:', retryData);
            
            // Check if we got a video URL directly
            if (Array.isArray(retryData) && retryData.length > 0) {
              const item = retryData[0];
              if (item.message && item.message.content) {
                const content = item.message.content;
                if (content.includes('.mp4') || content.includes('storage.theapi.app')) {
                  console.log('Got video URL from retry!');
                  
                  // Process the video
                  setMessages(prevMessages => {
                    const filteredMessages = prevMessages.filter(msg => !msg.id.endsWith('_waiting'));
                    const videoMessage: Message = {
                      id: Date.now().toString() + '_video',
                      text: 'ویدیو تولید شده:',
                      isUser: false,
                      timestamp: new Date(),
                      type: 'video',
                      videoUrl: content,
                    };
                    return [...filteredMessages, videoMessage];
                  });
                  
                  if (item.tokens) {
                    const tokens = parseInt(item.tokens.toString().replace(/\n/g, ''), 10);
                    updateUserTokens(tokens);
                  }
                  
                  setIsPolling(false);
                  setIsWaitingForResponse(false);
                  setInputValue('');
                  return;
                }
              }
            }
          }
        } catch (retryError) {
          console.log('Retry request failed:', retryError);
        }
      }
    }
    
    // If we get here, polling completed without success
    console.log('Polling completed without success');
    setMessages(prevMessages => {
      const filteredMessages = prevMessages.filter(msg => !msg.id.endsWith('_waiting'));
      const timeoutMessage: Message = {
        id: Date.now().toString() + '_timeout',
        text: 'زمان انتظار (20 دقیقه) به پایان رسید. تولید ویدیو ممکن است زمان بیشتری نیاز داشته باشد.',
        isUser: false,
        timestamp: new Date(),
      };
      return [...filteredMessages, timeoutMessage];
    });
    
    setIsPolling(false);
    setIsWaitingForResponse(false);
  };


  return (
    <div className="flex h-screen relative overflow-hidden" style={{
      backgroundImage: localUserProfile?.theme === 'day' 
        ? 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 25%, #cbd5e1 50%, #e2e8f0 75%, #f8fafc 100%)'
        : 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 25%, #16213e 50%, #1a1a2e 75%, #0a0a0f 100%)',
      backgroundSize: '400% 400%',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      animation: 'gradient-shift 15s ease infinite'
    }}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse ${
          localUserProfile?.theme === 'day' ? 'bg-cyan-500/20' : 'bg-cyan-500/10'
        }`}></div>
        <div className={`absolute top-3/4 right-1/4 w-80 h-80 rounded-full blur-3xl animate-pulse ${
          localUserProfile?.theme === 'day' ? 'bg-purple-500/20' : 'bg-purple-500/10'
        }`} style={{animationDelay: '1s'}}></div>
        <div className={`absolute bottom-1/4 left-1/3 w-64 h-64 rounded-full blur-3xl animate-pulse ${
          localUserProfile?.theme === 'day' ? 'bg-green-500/20' : 'bg-green-500/10'
        }`} style={{animationDelay: '2s'}}></div>
      </div>
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header - Fixed at top */}
        <div className="fixed top-0 left-0 right-0 z-30 glass border-b border-cyan-500/30 px-4 sm:px-6 py-4 backdrop-blur-md bg-opacity-90" style={{ paddingTop: 'max(16px, env(safe-area-inset-top))' }}>
          <div className="flex items-center justify-between relative">
            <div className="flex items-center space-x-3 space-x-reverse">
              <button 
                onClick={() => setProfileOpen(true)}
                className="p-2 text-cyan-400 hover:text-cyan-300 transition-colors duration-300 hover:drop-shadow-[0_0_10px_rgba(0,245,255,0.5)]"
                aria-label="User profile"
                title="پروفایل"
              >
                <User className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="p-2 text-cyan-400 hover:text-cyan-300 transition-colors duration-300 hover:drop-shadow-[0_0_10px_rgba(0,245,255,0.5)]"
                aria-label="Settings"
                title="تنظیمات"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <h1 className="text-lg sm:text-xl font-semibold neon-text">ویپانا</h1>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4 space-y-reverse" style={{ paddingTop: '80px', paddingBottom: '120px' }}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-xs lg:max-w-4xl px-4 py-2 rounded-lg relative ${
                  message.isUser
                    ? `shadow-lg shadow-cyan-500/25 ${localUserProfile?.theme === 'day' ? 'text-black' : 'text-white'}`
                    : `glass border border-cyan-500/30 shadow-lg shadow-cyan-500/10 ${
                        localUserProfile?.theme === 'day' ? 'text-slate-800' : 'text-white'
                      }`
                }`}
                style={{
                  border: '2px solid transparent',
                  background: `linear-gradient(var(--bg-card), var(--bg-card)) padding-box, 
                              linear-gradient(45deg, #00f5ff, #DAF527, #00ff88, #DAF527) border-box`,
                  animation: 'neon-border 24s ease-in-out infinite'
                }}
              >
                <p className="text-[18px]">{message.text}</p>
                
                {/* AI Waiting Animation or Server Busy Message */}
                {message.type === 'ai-waiting' && (
                  <div className="mt-4 flex justify-center">
                    {serverBusyMessage ? (
                      /* Server Busy Message */
                      <div className="relative p-6 rounded-2xl bg-gradient-to-br from-red-900/20 to-orange-900/20 border border-red-500/30 shadow-lg shadow-red-500/20">
                        <div className="text-center">
                          <div className="text-2xl mb-3">⚠️</div>
                          <div className="text-lg text-red-300 font-medium mb-2">سرور مشغول است</div>
                          <div className="text-sm text-red-400">لطفاً بعداً دوباره تلاش کنید</div>
                          <button 
                            onClick={() => {
                              window.location.reload();
                            }}
                            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                          >
                            🔄 تلاش مجدد
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Robot Container with Glow */
                      <div className="relative">
                        <div 
                          className="relative p-4 rounded-2xl bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border border-cyan-500/30 shadow-lg shadow-cyan-500/20"
                          style={{
                            animation: 'robot-glow 3s ease-in-out infinite'
                          }}
                        >
                        {/* Robot Head */}
                        <div 
                          className="w-16 h-14 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl relative overflow-hidden mx-auto shadow-lg"
                          style={{
                            animation: 'robot-thinking 4s ease-in-out infinite'
                          }}
                        >
                          {/* Robot Eyes */}
                          <div 
                            className="absolute top-3 left-3 w-3 h-3 bg-white rounded-full shadow-sm"
                            style={{
                              animation: 'robot-eyes-blink 3s ease-in-out infinite'
                            }}
                          ></div>
                          <div 
                            className="absolute top-3 right-3 w-3 h-3 bg-white rounded-full shadow-sm"
                            style={{
                              animation: 'robot-eyes-blink 3s ease-in-out infinite',
                              animationDelay: '0.5s'
                            }}
                          ></div>
                          
                          {/* Robot Mouth */}
                          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 w-6 h-2 bg-white rounded-full animate-pulse shadow-sm" style={{animationDelay: '1s'}}></div>
                          
                          {/* Scanning Lines */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-300 to-transparent opacity-40 animate-pulse" style={{animationDuration: '2s'}}></div>
                          
                          {/* Glow Effect */}
                          <div className="absolute inset-0 bg-gradient-to-br from-cyan-300/20 to-blue-400/20 rounded-xl animate-pulse" style={{animationDuration: '3s'}}></div>
                        </div>
                        
                        {/* Robot Body */}
                        <div className="w-20 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl mx-auto mt-2 relative shadow-lg">
                          {/* Status Lights */}
                          <div className="absolute top-3 left-3 w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-sm"></div>
                          <div className="absolute top-3 right-3 w-2 h-2 bg-yellow-400 rounded-full animate-pulse shadow-sm" style={{animationDelay: '0.3s'}}></div>
                          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-red-400 rounded-full animate-pulse shadow-sm" style={{animationDelay: '0.6s'}}></div>
                          
                          {/* Body Details */}
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-1.5 bg-cyan-300 rounded-full opacity-60"></div>
                          
                          {/* Processing Indicator */}
                          <div 
                            className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-cyan-300 to-blue-400 rounded-full"
                            style={{
                              animation: 'robot-processing 2s ease-in-out infinite'
                            }}
                          ></div>
                        </div>
                        
                        {/* Processing Dots */}
                        <div className="flex justify-center mt-3 space-x-2">
                          <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-bounce shadow-sm"></div>
                          <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-bounce shadow-sm" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-bounce shadow-sm" style={{animationDelay: '0.2s'}}></div>
                        </div>
                        
                        {/* AI Text */}
                        <div className="text-center mt-3">
                          <div className="text-sm text-cyan-300 animate-pulse font-medium">🤖 AI در حال کار...</div>
                          <div className="text-xs text-cyan-400 mt-1 animate-pulse" style={{animationDelay: '0.5s'}}>لطفاً صبر کنید</div>
                        </div>
                        
                        {/* Thinking Dots */}
                        <div className="flex justify-center mt-2 space-x-1">
                          <div className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce" style={{animationDuration: '1s'}}></div>
                          <div className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce" style={{animationDuration: '1s', animationDelay: '0.2s'}}></div>
                          <div className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce" style={{animationDuration: '1s', animationDelay: '0.4s'}}></div>
                        </div>
                      </div>
                    </div>
                    )}
                  </div>
                )}
                
                {message.type === 'image' && message.imageUrl && typeof message.imageUrl === 'string' && message.imageUrl.trim() !== '' && (
                  <div className="mt-2">
                    <Image
                      src={message.imageUrl}
                      alt="Generated image"
                      width={300}
                      height={300}
                      className="rounded-lg max-w-full h-auto"
                      unoptimized
                      onError={(e) => {
                        console.error('Image failed to load:', message.imageUrl);
                        console.error('Image error:', e);
                      }}
                      onLoad={() => {
                        console.log('Image loaded successfully:', message.imageUrl);
                      }}
                    />
                    <button
                      onClick={() => {
                        window.open(message.imageUrl!, '_blank');
                      }}
                      className="mt-2 inline-flex items-center gap-1 px-3 py-1 bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 rounded-md hover:bg-cyan-500/30 hover:border-cyan-400 transition-all duration-300 text-xs hover:shadow-lg hover:shadow-cyan-500/25"
                    >
                      <Download className="w-3 h-3" />
                      دانلود
                    </button>
                  </div>
                )}
                {message.type === 'video' && message.videoUrl && typeof message.videoUrl === 'string' && message.videoUrl.trim() !== '' && (
                  <div className="mt-2">
                    <video
                      src={message.videoUrl}
                      controls
                      className="rounded-lg max-w-full h-auto"
                      style={{ maxHeight: '400px' }}
                    >
                      مرورگر شما از پخش ویدیو پشتیبانی نمی‌کند.
                    </video>
                    <button
                      onClick={() => {
                        window.open(message.videoUrl!, '_blank');
                      }}
                      className="mt-2 inline-flex items-center gap-1 px-3 py-1 bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 rounded-md hover:bg-cyan-500/30 hover:border-cyan-400 transition-all duration-300 text-xs hover:shadow-lg hover:shadow-cyan-500/25"
                    >
                      <Download className="w-3 h-3" />
                      دانلود
                    </button>
                  </div>
                )}
                {message.showRetryButton && (
                  <div className="mt-2 space-y-2">
                    <button
                      onClick={async () => {
                        // Remove retry message and error message
                        setMessages(prevMessages => 
                          prevMessages.filter(msg => 
                            !msg.id.endsWith('_retry') && 
                            !msg.id.endsWith('_error')
                          )
                        );
                        
                        // Try to activate workflow first
                        const activated = await activateWorkflow();
                        if (activated) {
                          console.log('Workflow activated, retrying...');
                        } else {
                          console.log('Workflow activation failed, retrying anyway...');
                        }
                        
                        // Retry the last message
                        handleSendMessage();
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-md transition-all duration-300 text-xs shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40"
                    >
                      <Send className="w-3 h-3" />
                      تلاش مجدد
                    </button>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      💡 اگر خطا ادامه دارد، لطفاً در n8n روی &quot;Execute workflow&quot; کلیک کنید
                    </p>
                  </div>
                )}
                <p
                  className={`text-xs mt-1 ${
                    message.isUser 
                      ? (localUserProfile?.theme === 'day' ? 'text-gray-600' : 'text-blue-100')
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {message.timestamp.toLocaleTimeString('fa-IR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area - Fixed at bottom */}
        <div className="fixed bottom-0 left-0 right-0 z-30 glass border-t border-cyan-500/30 backdrop-blur-md bg-opacity-90" style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
          <div className="px-4 sm:px-6 py-4">
            <div className="flex items-start space-x-3">
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isWaitingForResponse}
                className="px-3 py-3 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex-shrink-0 flex items-center justify-center shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40"
                style={{ 
                  height: '48px',
                  border: '2px solid transparent',
                  background: `linear-gradient(135deg, #00f5ff, #0066ff) padding-box, 
                              linear-gradient(45deg, #00f5ff, #DAF527, #00ff88, #DAF527) border-box`,
                  animation: 'neon-border 24s ease-in-out infinite'
                }}
              >
                <Send className="w-5 h-5" />
              </button>
              <div className="flex-1 relative">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={isWaitingForResponse ? "در حال پردازش..." : "پیام خود را بنویسید..."}
                  disabled={isWaitingForResponse}
                  className="w-full px-4 py-3 neon-input rounded-lg resize-none focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  rows={1}
                  style={{ 
                    minHeight: '48px', 
                    maxHeight: '120px',
                    border: '2px solid transparent',
                  background: `linear-gradient(var(--bg-input), var(--bg-input)) padding-box, 
                              linear-gradient(45deg, #00f5ff, #DAF527, #00ff88, #00f5ff, #DAF527, #00ff88) border-box`,
                    animation: 'neon-border 24s ease-in-out infinite'
                  }}
                />
                
                {/* Upload Button and Image Preview Container */}
                <div className="absolute left-3 bottom-3 z-10 flex items-center gap-2">
                  {/* Image Upload Button */}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                    disabled={isUploading || isWaitingForResponse}
                  />
                  <label
                    htmlFor="image-upload"
                    className={`group cursor-pointer w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 ${
                      isUploading 
                        ? 'bg-amber-500/20 text-amber-400' 
                        : uploadedImages.length > 0
                          ? 'bg-emerald-500/20 text-emerald-400' 
                          : 'bg-slate-600/40 text-slate-300 hover:bg-slate-500/50 hover:text-slate-200'
                    } ${isWaitingForResponse ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title={uploadedImages.length > 0 ? `${uploadedImages.length} تصویر آپلود شده` : 'آپلود تصویر'}
                  >
                    {isUploading ? (
                      <div className="w-4 h-4 animate-spin border-2 border-amber-400 border-t-transparent rounded-full"></div>
                    ) : uploadedImages.length > 0 ? (
                      <ImageIcon className="w-4 h-4" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                  </label>
                  
                  {/* Debug: Reset upload state button */}
                  {isUploading && (
                    <button
                      onClick={resetUploadState}
                      className="w-8 h-8 bg-red-500/20 text-red-400 rounded-lg flex items-center justify-center text-xs"
                      title="Reset upload state (debug)"
                    >
                      R
                    </button>
                  )}
                  
                  {/* Debug: Reset waiting state button */}
                  {isWaitingForResponse && (
                    <button
                      onClick={() => {
                        console.log('Manually resetting waiting state');
                        setIsWaitingForResponse(false);
                        setIsPolling(false);
                      }}
                      className="w-8 h-8 bg-yellow-500/20 text-yellow-400 rounded-lg flex items-center justify-center text-xs"
                      title="Reset waiting state (debug)"
                    >
                      W
                    </button>
                  )}
                  
                  {/* Show uploaded images preview beside upload button */}
                  {uploadedImages.map((imageUrl, index) => (
                    <div key={index} className="relative">
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-emerald-500/30 bg-emerald-500/10">
                        <Image
                          src={imageUrl}
                          alt={`Uploaded image ${index + 1}`}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      </div>
                      <button
                        onClick={() => setUploadedImages(prev => prev.filter((_, i) => i !== index))}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600 transition-colors duration-200"
                        title="حذف تصویر"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {sidebarOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md max-h-[85vh] overflow-hidden rounded-2xl glass border border-cyan-500/30 shadow-2xl shadow-cyan-500/20 neon-glow">
              {/* Modal Header */}
              <div className="p-6 border-b border-cyan-500/30">
                <div className="flex items-center justify-between mb-4">
                  <h2 className={`text-lg font-semibold neon-text ${
                    localUserProfile?.theme === 'day' ? 'text-slate-800' : 'text-white'
                  }`}>تنظیمات</h2>
                  <button 
                    onClick={() => setSidebarOpen(false)}
                    className="p-1 text-cyan-400 hover:text-cyan-300 transition-colors duration-300 hover:drop-shadow-[0_0_10px_rgba(0,245,255,0.5)]"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {/* (Profile and tokens removed from settings modal as requested) */}
              </div>
              {/* Modal Content */}
              <div className="px-6 py-4 space-y-6 overflow-y-auto max-h-[55vh]">
                {/* AI Model Settings */}
                <div className="space-y-4">
                  <h3 className={`text-base font-semibold flex items-center ${
                    localUserProfile?.theme === 'day' ? 'text-slate-800' : 'text-white'
                  }`}>
                    <Settings className="w-4 h-4 ml-2 text-cyan-400" />
                    تنظیمات مدل
                  </h3>
                  <div className={`border border-cyan-500/20 rounded-lg p-4 space-y-4 ${
                    localUserProfile?.theme === 'day' ? 'bg-slate-100/50' : 'bg-slate-800/50'
                  }`}>
                    {/* Type Selection */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-cyan-300">نوع محتوا:</label>
                      <select 
                        value={selectedType}
                        onChange={(e) => handleTypeChange(e.target.value)}
                        disabled={servicesLoading}
                        className="w-full px-3 py-2 neon-input rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm disabled:opacity-50"
                      >
                        {servicesLoading ? (
                          <option value="">در حال بارگذاری...</option>
                        ) : (
                          Object.keys(services).map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))
                        )}
                      </select>
                    </div>

                    {/* دکمه انتخاب - در حالت متن زیر نوع محتوا (متن یا TEXT) */}
                    {(selectedType === 'متن' || selectedType === 'TEXT') && (
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={() => setSidebarOpen(false)}
                          className="w-full px-3 py-2.5 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
                        >
                          انتخاب
                        </button>
                      </div>
                    )}

                    {/* نسبت و دکمه انتخاب - برای عکس و ویدیو (عکس / IMAGE و ویدیو / VIDEO) */}
                    {(selectedType === 'عکس' || selectedType === 'IMAGE' || selectedType === 'ویدیو' || selectedType === 'VIDEO') && (
                      <>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-cyan-300">
                            {(selectedType === 'عکس' || selectedType === 'IMAGE') ? 'نسبت تصویر:' : 'نسبت ویدیو:'}
                          </label>
                          <select 
                            value={selectedAspectRatio}
                            onChange={(e) => setSelectedAspectRatio(e.target.value)}
                            className="w-full px-3 py-2 neon-input rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                          >
                            <option value="9:16">9:16 (عمودی)</option>
                            <option value="16:9">16:9 (افقی)</option>
                            <option value="1:1">1:1 (مربع)</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <button
                            type="button"
                            onClick={() => setSidebarOpen(false)}
                            className="w-full px-3 py-2.5 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
                          >
                            انتخاب
                          </button>
                        </div>
                      </>
                    )}

                    {/* دکمه انتخاب - برای صدا (صدا یا VOICE) */}
                    {(selectedType === 'صدا' || selectedType === 'VOICE') && (
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={() => setSidebarOpen(false)}
                          className="w-full px-3 py-2.5 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
                        >
                          انتخاب
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {/* Chat history removed as requested */}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Profile Modal */}
      {profileOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            onClick={() => setProfileOpen(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md overflow-hidden rounded-2xl glass border border-cyan-500/30 shadow-2xl shadow-cyan-500/20 neon-glow">
              {/* Modal Header */}
              <div className="p-6 border-b border-cyan-500/30">
                <div className="flex items-center justify-between">
                  <h2 className={`text-lg font-semibold neon-text ${
                    localUserProfile?.theme === 'day' ? 'text-slate-800' : 'text-white'
                  }`}>پروفایل کاربر</h2>
                  <button 
                    onClick={() => setProfileOpen(false)}
                    className="p-1 text-cyan-400 hover:text-cyan-300 transition-colors duration-300 hover:drop-shadow-[0_0_10px_rgba(0,245,255,0.5)]"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              {/* Modal Body */}
              <div className="p-6 space-y-4">
                {/* User Profile Card */}
                <div className="bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className={`text-lg font-serif font-bold uppercase tracking-wide ${
                        localUserProfile?.theme === 'day' ? 'text-slate-800' : 'text-white'
                      }`}>
                        {userProfile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || 'کاربر مهمان'}
                      </h3>
                      <p className="text-sm text-cyan-300 truncate">
                        {userProfile?.email || user?.email}
                      </p>
                    </div>
                    {userProfile?.image_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture ? (
                      <Image
                        src={userProfile?.image_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture}
                        alt="User Avatar"
                        width={56}
                        height={56}
                        className="w-14 h-14 rounded-full border-2 border-white dark:border-gray-500 shadow-sm"
                      />
                    ) : (
                      <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center border-2 border-cyan-300 shadow-lg shadow-cyan-500/25">
                        <User className="w-7 h-7 text-white" />
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Theme Toggle */}
                <div className={`border border-cyan-500/20 rounded-lg p-4 ${
                  localUserProfile?.theme === 'day' ? 'bg-slate-100/50' : 'bg-slate-800/50'
                }`}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-cyan-300">تم نمایش</h4>
                        <p className="text-xs text-cyan-400/70 mt-1">انتخاب تم روز یا شب</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-medium ${localUserProfile?.theme === 'night' ? 'text-cyan-300' : 'text-gray-400'}`}>
                          شب
                        </span>
                        <button
                          onClick={handleThemeToggle}
                          className="relative inline-flex h-7 w-16 items-center rounded-full border border-gray-300 cursor-pointer overflow-hidden"
                          type="button"
                        >
                          {/* Background sections */}
                          <div 
                            className={`absolute inset-0 transition-all duration-300 ${
                              localUserProfile?.theme === 'night' 
                                ? 'bg-transparent' 
                                : 'bg-transparent'
                            }`} 
                            style={{
                              width: localUserProfile?.theme === 'night' ? '66%' : '33%',
                              pointerEvents: 'none'
                            }} 
                          />
                          <div 
                            className={`absolute inset-0 transition-all duration-300 ${
                              localUserProfile?.theme === 'night' 
                                ? 'bg-transparent' 
                                : 'bg-transparent'
                            }`} 
                            style={{
                              width: localUserProfile?.theme === 'night' ? '34%' : '67%',
                              right: 0,
                              pointerEvents: 'none'
                            }} 
                          />
                          
                          {/* Thumb */}
                          <span
                            className={`absolute h-5 w-5 bg-white rounded-full border border-gray-300 transition-all duration-300 ${
                              localUserProfile?.theme === 'night' ? 'right-1' : 'left-1'
                            }`}
                            style={{ pointerEvents: 'none' }}
                          />
                        </button>
                        <span className={`text-sm font-medium ${localUserProfile?.theme === 'day' ? 'text-cyan-300' : 'text-gray-400'}`}>
                          روز
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Tokens */}
                <div className={`border border-cyan-500/20 rounded-lg p-4 ${
                  localUserProfile?.theme === 'day' ? 'bg-slate-100/50' : 'bg-slate-800/50'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-cyan-300">سکه باقی‌مانده</span>
                    <span className={`text-xl font-bold ${
                      localUserProfile?.theme === 'day' ? 'text-slate-800' : 'text-white'
                    }`}>
                      {(localUserProfile?.tokens || userProfile?.tokens || '0').toLocaleString('fa-IR')}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-cyan-300 text-center mt-1 mb-2">
                  {coinPrice !== null
                    ? `قیمت هر سکه معادل ${coinPrice.toLocaleString('fa-IR')} ریال می‌باشد`
                    : 'در حال دریافت قیمت هر سکه...'}
                </p>
                <button
                  onClick={() => setRechargeOpen(true)}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white rounded-lg transition-all duration-300 shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40"
                  title="شارژ حساب"
                >
                  <Zap className="w-5 h-5" />
                  <span className="font-medium">شارژ حساب</span>
                </button>
                
                
              </div>
            </div>
          </div>
        </>
      )}

      {/* Recharge Modal */}
      {rechargeOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            onClick={() => setRechargeOpen(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md overflow-hidden rounded-2xl glass border border-cyan-500/30 shadow-2xl shadow-cyan-500/20 neon-glow">
              <div className="p-6 border-b border-cyan-500/30 flex items-center justify-between">
                <h2 className={`text-lg font-semibold neon-text ${
                  localUserProfile?.theme === 'day' ? 'text-slate-800' : 'text-white'
                }`}>شارژ حساب</h2>
                <button 
                  onClick={() => setRechargeOpen(false)}
                  className="p-1 text-cyan-400 hover:text-cyan-300 transition-colors duration-300 hover:drop-shadow-[0_0_10px_rgba(0,245,255,0.5)]"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <label className="block text-sm font-medium text-cyan-300 mb-1">مبلغ افزایش شارژ (ریال)</label>
                <div className="relative">
                  <input
                    type="number"
                    min={1000}
                    step={1000}
                    value={rechargeAmount}
                    onChange={(e) => setRechargeAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 neon-input rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  {rechargeAmount > 0 && (
                    <div className="absolute inset-0 rounded-lg neon-border pointer-events-none"></div>
                  )}
                </div>
                {coinPrice && rechargeAmount > 0 && (
                  <p className="text-sm text-cyan-300">
                    معادل تقریبی سکه: {(Math.floor(rechargeAmount / coinPrice)).toLocaleString('fa-IR')}
                  </p>
                )}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setRechargeOpen(false)}
                    className="px-4 py-2 rounded-lg border border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400 transition-all duration-300"
                  >
                    انصراف
                  </button>
                  <button
                    onClick={handleRecharge}
                    disabled={isRecharging}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-lg transition-all duration-300 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isRecharging ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        در حال پردازش...
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5" />
                        پرداخت
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}