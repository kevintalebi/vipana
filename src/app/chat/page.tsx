'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Settings, User, MessageSquare, Menu, X } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'text' | 'image';
  imageUrl?: string;
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

interface ErrorDetails {
  status: number;
  statusText: string;
  url: string;
  error: string;
  rawText?: string;
  textError?: string;
}

export default function ChatPage() {
  const { user, userProfile, signOut, loading, updateUserTokens } = useAuth();
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
  const [selectedType, setSelectedType] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [services, setServices] = useState<ServicesData>({});
  const [servicesLoading, setServicesLoading] = useState(true);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
              { id: '4', name: 'DALL-E', type: 'عکس', price: '0.02' },
              { id: '5', name: 'Midjourney', type: 'عکس', price: '0.03' }
            ],
            'ویدیو': [
              { id: '6', name: 'Runway', type: 'ویدیو', price: '0.05' },
              { id: '7', name: 'Pika', type: 'ویدیو', price: '0.04' }
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

          setServices(groupedServices);
          
          // Set default type and model
          const types = Object.keys(groupedServices);
          if (types.length > 0) {
            const firstType = types[0];
            setSelectedType(firstType);
            
            const firstModel = groupedServices[firstType]?.[0];
            if (firstModel && firstModel.name) {
              setSelectedModel(firstModel.name);
            }
          }
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
              { id: '4', name: 'DALL-E', type: 'عکس', price: '0.02' },
              { id: '5', name: 'Midjourney', type: 'عکس', price: '0.03' }
            ],
            'ویدیو': [
              { id: '6', name: 'Runway', type: 'ویدیو', price: '0.05' },
              { id: '7', name: 'Pika', type: 'ویدیو', price: '0.04' }
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
            { id: '4', name: 'DALL-E', type: 'عکس', price: '0.02' },
            { id: '5', name: 'Midjourney', type: 'عکس', price: '0.03' }
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

  const handleSendMessage = async () => {
    if (inputValue.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: inputValue,
        isUser: true,
        timestamp: new Date(),
      };
      setMessages([...messages, newMessage]);
      
      // Add waiting message
      const waitingMessage: Message = {
        id: Date.now().toString() + '_waiting',
        text: 'در حال پردازش... لطفاً صبر کنید',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prevMessages => [...prevMessages, waitingMessage]);
      
      setIsWaitingForResponse(true);
      
      // Send data to webhook
      try {
        const requestData = {
          type: selectedType,
          model: selectedModel,
          user_id: user?.id || userProfile?.user_id || '',
          prompt: inputValue
        };

        console.log('Sending data to webhook:', requestData);
        console.log('Using API route: /api/webhook');
        const webhookUrl = process.env.NEXT_PUBLIC_WEBHOOK_URL || 'https://n8n.vipana.ir/webhook/content-handler';
        console.log('Target webhook URL:', webhookUrl);

        console.log('Making fetch request to /api/webhook...');
        const response = await fetch('/api/webhook', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(requestData),
        });

        console.log('Fetch request completed');
        console.log('Response object:', response);
        console.log('Response status:', response.status);
        console.log('Response statusText:', response.statusText);
        console.log('Response ok:', response.ok);
        console.log('Response type:', response.type);
        console.log('Response url:', response.url);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));

        if (response.ok) {
          try {
            const responseData = await response.json();
            console.log('Message sent successfully to webhook:', responseData);
            console.log('Response data type:', typeof responseData);
            console.log('Response data keys:', Object.keys(responseData || {}));
            console.log('Response success:', responseData?.success);
            console.log('Response parsed data:', responseData?.parsed);
            
            // Check if webhook response contains a message
            let messageContent = null;
            let messageType = 'text';
            let imageUrl = null;
            let updatedTokens = null;
            
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
                url.includes('cdn.openai.com')
              );
              console.log('isImageUrl check:', { url: url?.substring(0, 100) + '...', isImage });
              return isImage;
            };
            
            // Handle API route response format: { success: true, data: "...", parsed: {...}, status: 200 }
            if (responseData && responseData.success && responseData.parsed) {
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
            else if (responseData && typeof responseData === 'object' && !Array.isArray(responseData)) {
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
            else if (Array.isArray(responseData) && responseData.length > 0) {
              console.log('Using array response format handler');
              const firstItem = responseData[0];
              if (firstItem.message && firstItem.message.content) {
                messageContent = firstItem.message.content;
                
                // Check if the content itself is an image URL
                if (isImageUrl(messageContent)) {
                  messageType = 'image';
                  imageUrl = messageContent;
                  messageContent = 'تصویر تولید شده:';
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
            else if (responseData && responseData.message && responseData.message.content) {
              console.log('Using simple message content handler');
              messageContent = responseData.message.content;
              
              // Check if the content itself is an image URL
              if (isImageUrl(messageContent)) {
                messageType = 'image';
                imageUrl = messageContent;
                messageContent = 'تصویر تولید شده:';
              }
            }
            // Check for parsed data with content
            else if (responseData && responseData.parsed && responseData.parsed.content) {
              console.log('Using parsed content handler');
              messageContent = responseData.parsed.content;
              
              // Check if the content itself is an image URL
              if (isImageUrl(messageContent)) {
                messageType = 'image';
                imageUrl = messageContent;
                messageContent = 'تصویر تولید شده:';
              }
            }
            // Check for direct data field (webhook route fallback)
            else if (responseData && responseData.data && typeof responseData.data === 'string') {
              console.log('Using direct data handler');
              messageContent = responseData.data;
              
              // Check if the data itself is an image URL
              if (isImageUrl(messageContent)) {
                messageType = 'image';
                imageUrl = messageContent;
                messageContent = 'تصویر تولید شده:';
              }
            }
            // Check for direct content in parsed data
            else if (responseData && responseData.parsed && responseData.parsed.message && responseData.parsed.message.content) {
              console.log('Using parsed message content handler');
              messageContent = responseData.parsed.message.content;
              
              // Check if the content itself is an image URL
              if (isImageUrl(messageContent)) {
                messageType = 'image';
                imageUrl = messageContent;
                messageContent = 'تصویر تولید شده:';
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
            
            console.log('Extracted messageContent:', messageContent);
            console.log('Extracted messageType:', messageType);
            console.log('Extracted imageUrl:', imageUrl);
            console.log('Extracted updatedTokens:', updatedTokens);
            
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
                };
                return [...filteredMessages, botMessage];
              });
              console.log('Added bot message to chat:', messageContent, 'Type:', messageType, 'Image URL:', imageUrl);
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
          console.log('Response is not OK, processing error...');
          const errorDetails: ErrorDetails = {
            status: response.status,
            statusText: response.statusText,
            url: response.url,
            error: 'Unknown error'
          };
          
          try {
            console.log('Attempting to read error response as text...');
            const errorText = await response.text();
            console.log('Error response text received:', errorText);
            errorDetails.error = errorText;
            errorDetails.rawText = errorText;
          } catch (textError) {
            console.log('Could not read error response as text:', textError);
            errorDetails.error = 'Could not read error response';
            errorDetails.textError = textError instanceof Error ? textError.message : String(textError);
          }
          
          console.log('Final errorDetails object:', errorDetails);
          console.error('Failed to send message to webhook:', errorDetails);
          
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
        
        // Show user-friendly error message
        alert('خطا در ارسال پیام. لطفاً اتصال اینترنت خود را بررسی کنید.');
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


  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                  ویپانا ارایه دهنده سرویس های هوش مصنوعی
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  آنلاین
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
              {/* Mobile Menu Button */}
              <button 
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <Menu className="w-5 h-5" />
              </button>
              {/* Desktop Settings Button */}
              <button className="hidden lg:block p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4 space-y-reverse">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.isUser
                    ? 'bg-blue-500 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                }`}
              >
                <p className="text-sm">{message.text}</p>
                {message.type === 'image' && message.imageUrl && (
                  <div className="mt-2">
                    <Image
                      src={message.imageUrl}
                      alt="Generated image"
                      width={300}
                      height={300}
                      className="rounded-lg max-w-full h-auto"
                      unoptimized
                    />
                  </div>
                )}
                <p
                  className={`text-xs mt-1 ${
                    message.isUser ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
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

        {/* Input Area */}
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="px-4 sm:px-6 py-4">
            <div className="flex items-start space-x-3">
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isWaitingForResponse}
                className="px-3 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0 flex items-center justify-center"
                style={{ height: '48px' }}
              >
                <Send className="w-5 h-5" />
              </button>
              <div className="flex-1">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={isWaitingForResponse ? "در حال پردازش..." : "پیام خود را بنویسید..."}
                  disabled={isWaitingForResponse}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  rows={1}
                  style={{ minHeight: '48px', maxHeight: '120px' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Right Sidebar */}
      <div className={`
        fixed lg:relative top-0 right-0 h-full w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col z-50
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        {/* Sidebar Header - User Profile */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">پروفایل کاربر</h2>
            {/* Mobile Close Button */}
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* User Profile Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-700 dark:to-gray-600 rounded-xl p-4 mb-4">
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-serif font-bold text-black dark:text-white uppercase tracking-wide">
                  {userProfile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || 'کاربر مهمان'}
                </h3>
              {userProfile?.image_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture ? (
                <Image
                  src={userProfile?.image_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture}
                  alt="User Avatar"
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full border-2 border-white dark:border-gray-500 shadow-sm"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-500 shadow-sm">
                  <User className="w-6 h-6 text-white" />
                </div>
              )}
              </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                  {userProfile?.email || user?.email}
                </p>
            </div>
            
            {/* Tokens Display */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">سکه باقی‌مانده</span>
                </div>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {userProfile?.tokens?.toLocaleString('fa-IR') || '0'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Logout Button */}
          <button 
            onClick={signOut}
            disabled={loading}
            className="w-full px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {loading ? 'در حال خروج...' : 'خروج از حساب'}
          </button>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 px-6 py-4 space-y-6 overflow-y-auto">
          {/* AI Model Settings */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center">
              <Settings className="w-4 h-4 ml-2" />
              تنظیمات مدل
            </h3>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-4">
              {/* Type Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">نوع محتوا:</label>
                <select 
                  value={selectedType}
                  onChange={(e) => handleTypeChange(e.target.value)}
                  disabled={servicesLoading}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:opacity-50"
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

              {/* Model Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">مدل:</label>
                <select 
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  disabled={servicesLoading || !selectedType}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:opacity-50"
                >
                  {servicesLoading ? (
                    <option value="">در حال بارگذاری...</option>
                  ) : !selectedType ? (
                    <option value="">ابتدا نوع محتوا را انتخاب کنید</option>
                  ) : !services[selectedType] || services[selectedType].length === 0 ? (
                    <option value="">هیچ مدلی برای این نوع یافت نشد</option>
                  ) : (
                    (() => {
                      const typeServices = services[selectedType];
                      console.log('Rendering model dropdown for type:', selectedType, 'Services:', typeServices);
                      return typeServices?.map((service) => (
                        <option key={service.id} value={service.name}>{service.name}</option>
                      ));
                    })()
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Chat History */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center">
              <MessageSquare className="w-4 h-4 ml-2" />
              تاریخچه چت
            </h3>
            <div className="space-y-2">
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  چت جدید
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  امروز
                </p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  بحث در مورد React
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  دیروز
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
