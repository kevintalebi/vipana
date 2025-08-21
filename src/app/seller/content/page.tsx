'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { getPIAPIService, GenerationResponse } from '../../services/piApi';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Debug environment variables
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set');
console.log('Supabase Anon Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set');

interface GeneratedContent {
  id: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'multimodal';
  title: string;
  content: string;
  prompt: string;
  engine: string;
  created_at: string;
  status: 'generating' | 'completed' | 'failed';
  metadata?: {
    task_id?: string;
    model?: string;
    original_response?: any;
    [key: string]: any;
  };
}

interface Post {
  id: string;
  user_id: string;
  content: string;
  media_url?: string | null;
}

export default function ContentManagementPage() {
  const [activeTab, setActiveTab] = useState<'factory' | 'newpost' | 'ads'>('factory');
  
  // AI Factory State
  const [contentType, setContentType] = useState<'text' | 'image' | 'video' | 'audio'>('text');
  const [engine, setEngine] = useState('meta-llama/Llama-2-7b-chat-hf'); // Set a default model that's more likely to be available
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState('');
  
  // Gallery State
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>([]);
  const [selectedContent, setSelectedContent] = useState<GeneratedContent | null>(null);
  
  // New Post State
  const [postContent, setPostContent] = useState('');
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  
  // File Upload State
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [isUploading, setIsUploading] = useState(false);
  
  // Image Generation State
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isImageGenerating, setIsImageGenerating] = useState(false);
  const [imageTaskId, setImageTaskId] = useState<string | null>(null);
  
  // Download Modal State
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadMessage, setDownloadMessage] = useState('');
  const [downloadStatus, setDownloadStatus] = useState<'success' | 'error' | 'loading'>('loading');
  
  // Ads State
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  
  // AI Credits State
  const [aiCredits, setAiCredits] = useState<number>(0);
  const [creditsLoading, setCreditsLoading] = useState(true);
  
  // Test Supabase connection and fetch AI credits on component mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        console.log('Supabase connection test:', error ? 'Failed' : 'Success');
        if (error) console.error('Connection error:', error);
        
        // Fetch AI credits if user is authenticated
        if (data.user) {
          const { data: sellerData, error: sellerError } = await supabase
            .from('sellers')
            .select('ai_credits')
            .eq('user_id', data.user.id)
            .single();
          
          if (sellerError) {
            console.error('Error fetching AI credits:', sellerError);
            setAiCredits(0);
          } else {
            setAiCredits(sellerData?.ai_credits || 0);
          }
        }
        setCreditsLoading(false);
      } catch (err) {
        console.error('Supabase connection test failed:', err);
        setCreditsLoading(false);
      }
    };
    testConnection();
  }, []);
  

  // Function to display generated image
  const displayGeneratedImage = (imageUrl: string, taskId: string, model: string = 'Qubico/flux1-dev') => {
    console.log('Displaying image with URL:', imageUrl);
    
    // Create a temporary content entry to display the image
    const tempContent: GeneratedContent = {
      id: taskId,
      type: 'image',
      title: `تصویر تولید شده - ${taskId}`,
      content: imageUrl,
      prompt: 'a little cat',
      engine: model,
      created_at: new Date().toISOString(),
      status: 'completed',
      metadata: {
        task_id: taskId,
        model: model,
        image_url: imageUrl
      }
    };

    setGeneratedContent(prev => [tempContent, ...prev]);
    
    // Also switch to gallery tab to show the image
    setActiveTab('ads'); // Changed from 'gallery' to 'ads'
  };

  // Function to monitor task status and update UI
  const monitorTaskStatus = async (taskId: string, tempContent: GeneratedContent) => {
    const API_KEY = process.env.NEXT_PUBLIC_PIAPI_KEY;
    if (!API_KEY) return;

    try {
      console.log(`Monitoring task status for: ${taskId}`);
      
      const response = await fetch(`https://api.piapi.ai/api/v1/task/${taskId}`, {
        method: 'GET',
        headers: {
          'X-API-KEY': API_KEY,
        }
      });

      if (response.ok) {
        const data = JSON.parse(await response.text());
        const taskData = data.data;
        
        console.log('Task status update:', taskData);
        
        if (taskData.status === 'completed') {
          // Task is completed, fetch the full task data to get output URL
          console.log('Task completed! Fetching output URL for monitoring...');
          
          const outputResponse = await fetch(`https://api.piapi.ai/api/v1/task/${taskId}`, {
            method: 'GET',
            headers: {
              'X-API-KEY': API_KEY,
            }
          });
          
          if (outputResponse.ok) {
            const outputData = JSON.parse(await outputResponse.text());
            console.log('Full task output data for monitoring:', outputData);
            
            const taskOutput = outputData.data;
            console.log('Full task output for monitoring:', taskOutput);
            
            // Check for image URL in different possible locations
            let imageUrl = null;
            
            if (taskOutput.output && taskOutput.output.images && taskOutput.output.images.length > 0) {
              imageUrl = taskOutput.output.images[0];
            } else if (taskOutput.output && taskOutput.output.image_url) {
              imageUrl = taskOutput.output.image_url;
            } else if (taskOutput.image_url) {
              imageUrl = taskOutput.image_url;
            }
            
            if (imageUrl) {
              console.log('Image URL found for monitoring:', imageUrl);
              
              // Set the generated image URL in state
              setGeneratedImageUrl(imageUrl);
              setIsImageGenerating(false);
              
              const updatedContent = {
                ...tempContent,
                content: imageUrl,
                title: `تصویر تولید شده - ${taskId}`,
                status: 'completed' as const
              };

              setGeneratedContent(prev => 
                prev.map(item => 
                  item.id === taskId ? updatedContent : item
                )
              );
            } else {
              console.log('No image URL found in output for monitoring:', taskOutput);
              setIsImageGenerating(false);
              // Task completed but no image URL
              const failedContent = {
                ...tempContent,
                status: 'failed' as const
              };

              setGeneratedContent(prev => 
                prev.map(item => 
                  item.id === taskId ? failedContent : item
                )
              );
            }
          } else {
            console.error('Failed to fetch output for monitoring:', outputResponse.status);
            // Retry after 5 seconds
            setTimeout(() => monitorTaskStatus(taskId, tempContent), 5000);
          }
        } else if (taskData.status === 'pending' || taskData.status === 'processing') {
          // Task is still processing, check again in 10 seconds
          setTimeout(() => monitorTaskStatus(taskId, tempContent), 10000);
        } else if (taskData.status === 'failed') {
          // Task failed
          const failedContent = {
            ...tempContent,
            status: 'failed' as const
          };

          setGeneratedContent(prev => 
            prev.map(item => 
              item.id === taskId ? failedContent : item
            )
          );
        }
      } else {
        console.error('Failed to check task status:', response.status);
        // Retry after 5 seconds
        setTimeout(() => monitorTaskStatus(taskId, tempContent), 5000);
      }
    } catch (error) {
      console.error('Task monitoring error:', error);
      // Retry after 5 seconds
      setTimeout(() => monitorTaskStatus(taskId, tempContent), 5000);
    }
  };

  // AI Engines configuration - Will be populated from PIAPI
  const [aiEngines, setAiEngines] = useState({
    text: [
      { id: 'chatgpt', name: 'ChatGPT', description: 'مدل چت OpenAI ChatGPT' }
    ],
    image: [
      { id: 'Qubico/flux1-dev', name: 'Qubico Flux1 Dev', description: 'مدل تولید تصویر Qubico' },
      { id: 'midjourney', name: 'Midjourney', description: 'مدل تولید تصویر Midjourney (پیشنهادی)' }
    ],
    video: [
      { id: 'damo-vilab/text-to-video-ms-1.7b', name: 'Text to Video MS 1.7B', description: 'مدل ویدیو DAMO (پیشنهادی)' },
      { id: 'cerspense/zeroscope_v2_XL', name: 'Zeroscope V2 XL', description: 'مدل ویدیو سریع' }
    ],
    audio: [
      { id: 'facebook/fastspeech2-en-ljspeech', name: 'FastSpeech2', description: 'مدل سریع Facebook (پیشنهادی)' },
      { id: 'microsoft/speecht5_tts', name: 'SpeechT5 TTS', description: 'مدل TTS Microsoft' }
    ]
  });


  const generateContentWithPIAPI = async (type: string, prompt: string, engine: string) => {
    try {
      const piApiService = getPIAPIService();
      let response: GenerationResponse;

      switch (type) {
        case 'text':
          response = await piApiService.generateText({
            prompt,
            model: engine,
            maxTokens: 1000,
            temperature: 0.7,
          });
          break;
        case 'image':
          response = await piApiService.generateImage({
            prompt,
            model: engine,
            size: '1024x1024',
            quality: 'standard',
            style: 'vivid',
          });
          break;
        case 'video':
          response = await piApiService.generateVideo({
            prompt,
            model: engine,
            size: '1024x1024',
            duration: 3,
            fps: 24,
          });
          break;
        case 'audio':
          response = await piApiService.generateAudio({
            prompt,
            model: engine,
            voice: 'alloy',
            responseFormat: 'mp3',
            speed: 1.0,
          });
          break;
        case 'multimodal':
          response = await piApiService.generateMultimodal({
            prompt,
            model: engine,
            maxTokens: 1000,
            temperature: 0.7,
          });
          break;
        default:
          throw new Error('نوع محتوای نامعتبر');
      }

      if (!response.success) {
        throw new Error(response.error || 'خطا در تولید محتوا');
      }

      return {
        content: response.content,
        title: response.title || `محتوای ${type === 'text' ? 'متنی' : type === 'image' ? 'تصویری' : type === 'video' ? 'ویدیویی' : type === 'audio' ? 'صوتی' : 'چندرسانه‌ای'}: ${prompt.substring(0, 30)}...`
      };
    } catch (error) {
      console.error('PIAPI Generation Error:', error);
      throw error;
    }
  };

  const generateContent = async () => {
    if (!engine || !prompt) return;

    setIsGenerating(true);
    setGenerationError('');

    try {
      if (contentType === 'image' as any) {
        console.log('Testing image generation with Qubico/flux1-dev...');
        
        const API_KEY = process.env.NEXT_PUBLIC_PIAPI_KEY;
        if (!API_KEY) {
          setGenerationError('لطفاً NEXT_PUBLIC_PIAPI_KEY را در فایل .env.local تنظیم کنید');
          return;
        }

        try {
          // Set loading state
          setIsImageGenerating(true);
          setGeneratedImageUrl(null);
          setImageTaskId(null);
          setGenerationError('');
          
          // Prepare request body based on model
          let requestBody;
          
          if (engine === 'midjourney') {
            requestBody = {
              model: 'midjourney',
              task_type: 'imagine',
              input: {
                prompt: prompt,
                aspect_ratio: '1:1',
                process_mode: 'turbo',
                skip_prompt_check: false
              }
            };
          } else {
            // Default for Qubico/flux1-dev
            requestBody = {
              model: 'Qubico/flux1-dev',
              task_type: 'txt2img',
              input: {
                prompt: prompt,
                width: 1024,
                height: 1024
              }
            };
          }
          
          console.log('Request body for image generation:', requestBody);
          
          // Create task
          const response = await fetch('https://api.piapi.ai/api/v1/task', {
            method: 'POST',
            headers: {
              'X-API-KEY': API_KEY,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
          });

          const responseText = await response.text();
          console.log('Image generation response:', responseText);

          if (response.ok) {
            const data = JSON.parse(responseText);
            const taskId = data.data?.task_id;
            
            if (taskId) {
              setImageTaskId(taskId);
              
              // Create temporary content entry
              const tempContent: GeneratedContent = {
                id: taskId,
                type: 'image',
                title: `تصویر در حال تولید - ${taskId}`,
                content: '',
                prompt: prompt,
                engine: engine,
                created_at: new Date().toISOString(),
                status: 'generating',
                metadata: {
                  task_id: taskId,
                  model: engine
                }
              };

              setGeneratedContent(prev => [tempContent, ...prev]);
              
              // Start monitoring task status
              monitorTaskStatus(taskId, tempContent);
              
              setPrompt('');
            } else {
              setGenerationError('Task ID دریافت نشد!');
              setIsImageGenerating(false);
            }
          } else {
            setGenerationError(`خطا: ${response.status} - ${responseText}`);
            setIsImageGenerating(false);
          }
        } catch (error) {
          console.error('Image generation error:', error);
          setGenerationError(`خطا در تولید تصویر: ${error}`);
          setIsImageGenerating(false);
        }
        return;
      }

      if (contentType === 'text' as any) {
        const API_KEY = process.env.NEXT_PUBLIC_PIAPI_KEY;
        console.log('Text generation triggered. API_KEY:', API_KEY, 'prompt:', prompt, 'engine:', engine);
        if (!API_KEY) {
          setGenerationError('لطفاً NEXT_PUBLIC_PIAPI_KEY را در فایل .env.local تنظیم کنید');
          console.error('API_KEY is missing');
          return;
        }
        try {
          console.log('Starting text generation...');
          const tempContent: GeneratedContent = {
            id: Date.now().toString(),
            type: 'text',
            title: 'متن تولید شده',
            content: '',
            prompt,
            engine,
            created_at: new Date().toISOString(),
            status: 'generating'
          };
          setGeneratedContent(prev => [tempContent, ...prev]);
          const response = await generateText(prompt, API_KEY);
          console.log('Text generation response:', response);
          const updatedContent = {
            ...tempContent,
            content: response.content,
            title: response.title,
            status: 'completed' as const
          };
          setGeneratedContent(prev => prev.map(item => item.id === tempContent.id ? updatedContent : item));
          setPrompt('');
          setEngine('');
        } catch (error: any) {
          setGenerationError(error.message || 'خطا در تولید محتوا');
          console.error('Generation error:', error);
        } finally {
          setIsGenerating(false);
        }
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('کاربر یافت نشد');

      // Create a temporary content entry
      const tempContent: GeneratedContent = {
        id: Date.now().toString(),
        type: contentType,
        title: `محتوای ${contentType === 'text' ? 'متنی' : contentType === 'image' ? 'تصویری' : contentType === 'video' ? 'ویدیویی' : contentType === 'audio' ? 'صوتی' : 'چندرسانه‌ای'}`,
        content: '',
        prompt,
        engine,
        created_at: new Date().toISOString(),
        status: 'generating'
      };

      setGeneratedContent(prev => [tempContent, ...prev]);

      // Use PIAPI for content generation
      const response = await generateContentWithPIAPI(contentType, prompt, engine);
      
      // Update the content with generated result
      const updatedContent = {
        ...tempContent,
        content: response.content,
        title: response.title,
        status: 'completed' as const
      };

      // Save to database
      try {
        const { error: dbError } = await supabase
          .from('generated_content')
          .insert([{
            ...updatedContent,
            user_id: user.id
          }]);

        if (dbError) {
          console.error('Database save error:', dbError);
          // If table doesn't exist, just continue with local state
          if (dbError.code === 'PGRST116' || dbError.message?.includes('relation') || dbError.message?.includes('table')) {
            console.log('Table generated_content does not exist, saving only to local state');
          } else {
            throw dbError;
          }
        }
      } catch (dbError) {
        console.error('Database error:', dbError);
        // Continue with local state even if database save fails
      }

      // Update local state
      setGeneratedContent(prev => 
        prev.map(item => 
          item.id === tempContent.id ? updatedContent : item
        )
      );

      setPrompt('');
      setEngine('');
    } catch (error: any) {
      setGenerationError(error.message || 'خطا در تولید محتوا');
      console.error('Generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const simulateAIGeneration = async (type: string, prompt: string, engine: string) => {
    const API_KEY = process.env.NEXT_PUBLIC_PIAPI_KEY;
    
    
    if (!API_KEY) {
      throw new Error('کلید API یافت نشد. لطفاً NEXT_PUBLIC_PIAPI_KEY را در فایل .env.local تنظیم کنید.');
    }

    switch (type) {
      case 'text':
        return await generateText(prompt, API_KEY);
      case 'image':
        return await generateImage(prompt, engine, API_KEY);
      case 'video':
        return await generateVideo(prompt, engine, API_KEY);
      case 'audio':
        return await generateAudio(prompt, engine, API_KEY);
      case 'multimodal':
        return await generateMultimodal(prompt, engine, API_KEY);
      default:
        throw new Error('نوع محتوا نامعتبر است');
    }
  };

  // تابع generateText فقط برای حالت متن (ChatGPT)
  const generateText = async (prompt: string, apiKey: string) => {
    if (!prompt || prompt.trim() === '') {
      throw new Error('لطفاً متن پرامپت را وارد کنید.');
    }
    const sanitizedPrompt = prompt.trim().substring(0, 4000);
    const response = await fetch('https://api.piapi.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: sanitizedPrompt }
        ]
      }),
    });
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(`API Error: ${errorMessage}`);
    }
    const data = await response.json();
    const generatedText = data.choices?.[0]?.message?.content || 'خطا در تولید متن';
    return {
      title: `متن تولید شده با ChatGPT`,
      content: generatedText
    };
  };

  // تابع generateImage فقط برای حالت عکس (مدل‌های تصویر)
  const generateImage = async (prompt: string, engine: string, apiKey: string) => {
    try {
      const response = await fetch('https://api.piapi.ai/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: engine, // Use the exact model ID from the dropdown
          prompt: prompt,
          n: 1,
          size: engine === 'dall-e-3' ? '1024x1024' : 
                engine === 'stable-diffusion-xl-1.0' || engine === 'stable-diffusion-v1-6' ? '1024x1024' : '512x512',
          quality: 'standard',
        }),
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        console.error('Image API Error Response:', errorMessage);
        
        if (response.status === 503) {
          throw new Error('سرویس تولید تصویر موقتاً در دسترس نیست. لطفاً چند دقیقه بعد دوباره تلاش کنید.');
        } else if (response.status === 401) {
          throw new Error('کلید API نامعتبر است. لطفاً کلید API خود را بررسی کنید.');
        } else if (response.status === 429) {
          throw new Error('تعداد درخواست‌ها بیش از حد مجاز است. لطفاً کمی صبر کنید.');
        } else if (response.status >= 500) {
          throw new Error('خطای سرور در تولید تصویر. لطفاً بعداً دوباره تلاش کنید.');
        } else {
          throw new Error(`خطا در تولید تصویر (کد ${response.status}): ${response.statusText}`);
        }
      }

      const data = await response.json();
      const imageUrl = data.data[0]?.url;

      if (!imageUrl) {
        throw new Error('تصویر تولید نشد');
      }

      return {
        title: `تصویر تولید شده با ${engine}`,
        content: imageUrl
      };
    } catch (error: any) {
      console.error('Image generation error:', error);
      if (error.message.includes('fetch') || error.message.includes('network')) {
        throw new Error('خطا در اتصال به سرور. لطفاً اتصال اینترنت خود را بررسی کنید.');
      }
      throw new Error(`خطا در تولید تصویر: ${error.message}`);
    }
  };

  const generateVideo = async (prompt: string, engine: string, apiKey: string) => {
    try {
      // Using piapi.ai for video generation
      const response = await fetch('https://api.piapi.ai/v1/videos/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'text-to-video-1',
          prompt: prompt,
          n: 1,
          size: '1024x576',
        }),
      });

      if (!response.ok) {
        throw new Error(`خطا در تولید ویدیو: ${response.statusText}`);
      }

      const data = await response.json();
      const videoUrl = data.data[0]?.url;

      if (!videoUrl) {
        throw new Error('ویدیو تولید نشد');
      }

      return {
        title: `ویدیو تولید شده با ${engine}`,
        content: videoUrl
      };
    } catch (error: any) {
      console.error('Video generation error:', error);
      throw new Error(`خطا در تولید ویدیو: ${error.message}`);
    }
  };

  const generateAudio = async (prompt: string, engine: string, apiKey: string) => {
    try {
      // Using piapi.ai for audio generation
      const response = await fetch('https://api.piapi.ai/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'tts-1',
          input: prompt,
          voice: 'alloy',
        }),
      });

      if (!response.ok) {
        throw new Error(`خطا در تولید صدا: ${response.statusText}`);
      }

      // Convert the audio blob to a URL
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      return {
        title: `فایل صوتی تولید شده با ${engine}`,
        content: audioUrl
      };
    } catch (error: any) {
      console.error('Audio generation error:', error);
      throw new Error(`خطا در تولید صدا: ${error.message}`);
    }
  };

  const generateMultimodal = async (prompt: string, engine: string, apiKey: string) => {
    // For multimodal content, we'll use the chat completions API with text-only input for now
    // In the future, this could be extended to support image inputs
    try {
      const response = await fetch('https://api.piapi.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: engine,
          messages: [
            {
              role: 'system',
              content: 'شما یک متخصص در تولید محتوای چندرسانه‌ای و خلاقانه هستید. محتوای تولید شده باید جذاب و مناسب برای شبکه‌های اجتماعی باشد.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        console.error('Multimodal API Error Response:', errorMessage);
        
        // Try to parse the error response for more specific messages
        try {
          const errorData = JSON.parse(errorMessage);
          if (errorData.message && errorData.message.includes('no available resource')) {
            throw new Error('این مدل برای اشتراک شما در دسترس نیست. لطفاً مدل دیگری انتخاب کنید یا اشتراک خود را ارتقا دهید.');
          } else if (errorData.message && errorData.message.includes('subscription plan')) {
            throw new Error('این مدل نیاز به اشتراک بالاتر دارد. لطفاً مدل دیگری انتخاب کنید.');
          } else if (errorData.message) {
            throw new Error(`خطای API: ${errorData.message}`);
          }
        } catch (parseError) {
          // If we can't parse the error, use status-based error handling
        }
        
        if (response.status === 503) {
          throw new Error('سرویس API موقتاً در دسترس نیست. لطفاً چند دقیقه بعد دوباره تلاش کنید.');
        } else if (response.status === 401) {
          throw new Error('کلید API نامعتبر است. لطفاً کلید API خود را بررسی کنید.');
        } else if (response.status === 429) {
          throw new Error('تعداد درخواست‌ها بیش از حد مجاز است. لطفاً کمی صبر کنید.');
        } else if (response.status === 403) {
          throw new Error('دسترسی به این مدل محدود شده است. لطفاً مدل دیگری انتخاب کنید.');
        } else if (response.status >= 500) {
          throw new Error('خطای سرور. لطفاً بعداً دوباره تلاش کنید.');
        } else {
          throw new Error(`خطا در تولید محتوای چندرسانه‌ای (کد ${response.status}): ${response.statusText}`);
        }
      }

      const data = await response.json();
      const generatedText = data.choices[0]?.message?.content || 'خطا در تولید محتوا';

      return {
        title: `محتوای چندرسانه‌ای تولید شده با ${engine}`,
        content: generatedText
      };
    } catch (error: any) {
      console.error('Multimodal generation error:', error);
      if (error.message.includes('fetch') || error.message.includes('network')) {
        throw new Error('خطا در اتصال به سرور. لطفاً اتصال اینترنت خود را بررسی کنید.');
      }
      throw new Error(`خطا در تولید محتوای چندرسانه‌ای: ${error.message}`);
    }
  };

  const createPost = async () => {
    if (!postContent) return;

    setIsCreatingPost(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('کاربر یافت نشد');

      // Upload files to Supabase storage if any files are selected
      let mediaUrls: string[] = [];
      
      if (uploadedFiles.length > 0) {
        console.log('Uploading files to Supabase storage...');
        setIsUploading(true);
        
        // Check if posts bucket exists
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
        if (bucketsError) {
          console.error('Error listing buckets:', bucketsError);
          throw new Error(`خطا در دسترسی به storage: ${bucketsError.message}`);
        }
        
        const postsBucketExists = buckets?.some(bucket => bucket.name === 'posts');
        if (!postsBucketExists) {
          console.error('Posts bucket does not exist');
          throw new Error('Bucket "posts" در storage موجود نیست. لطفاً ابتدا آن را ایجاد کنید.');
        }
        
        for (let i = 0; i < uploadedFiles.length; i++) {
          const file = uploadedFiles[i];
          try {
            // Update progress for current file
            setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
            
            // Create a unique file name
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            
            // Simulate upload progress
            const progressInterval = setInterval(() => {
              setUploadProgress(prev => {
                const currentProgress = prev[file.name] || 0;
                if (currentProgress >= 90) {
                  clearInterval(progressInterval);
                  return prev;
                }
                return { ...prev, [file.name]: currentProgress + 10 };
              });
            }, 200);
            
            // Upload file to Supabase storage
            console.log('Attempting to upload file:', fileName, 'to posts bucket');
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('posts')
              .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
              });

            if (uploadError) {
              console.error('File upload error:', uploadError);
              clearInterval(progressInterval);
              throw new Error(`خطا در آپلود فایل ${file.name}: ${uploadError.message}`);
            }

            // Get the public URL for the uploaded file
            const { data: urlData } = supabase.storage
              .from('posts')
              .getPublicUrl(fileName);

            if (urlData?.publicUrl) {
              mediaUrls.push(urlData.publicUrl);
              console.log(`File ${file.name} uploaded successfully:`, urlData.publicUrl);
              
              // Set progress to 100% for completed upload
              setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
            } else {
              clearInterval(progressInterval);
              throw new Error(`خطا در دریافت URL فایل ${file.name}`);
            }
            
            clearInterval(progressInterval);
          } catch (fileError: any) {
            console.error(`Error uploading file ${file.name}:`, fileError);
            throw new Error(`خطا در آپلود فایل ${file.name}: ${fileError.message}`);
          }
        }
        
        setIsUploading(false);
      }

      const postData = {
        user_id: user.id,
        content: postContent,
        media_url: mediaUrls.length > 0 ? mediaUrls.join(',') : null
      };

      const { data, error } = await supabase
        .from('posts')
        .insert([postData])
        .select()
        .single();

      if (error) {
        console.error('Supabase insert error:', error);
        throw new Error(`خطا در ذخیره پست: ${error.message}`);
      }

      setPosts(prev => [data, ...prev]);
      setPostContent('');
      setSelectedContent(null);
      setUploadedFiles([]);
      setUploadProgress({});
      setActiveTab('ads');
      
      console.log('Post created successfully with media URLs:', mediaUrls);
    } catch (error: any) {
      console.error('Error creating post:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      alert(error.message || 'خطا در ایجاد پست');
    } finally {
      setIsCreatingPost(false);
    }
  };



  const deletePost = async (postId: string) => {
    if (!confirm('آیا مطمئن هستید که می‌خواهید این پست را حذف کنید؟')) return;

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      setPosts(prev => prev.filter(post => post.id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const useContentForPost = (content: GeneratedContent) => {
    setSelectedContent(content);
    setPostContent(content.content);
    setActiveTab('newpost');
  };

  // File Upload Functions
  const handleFileUpload = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => {
      const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/');
      const isValidSize = file.size <= 50 * 1024 * 1024; // 50MB limit
      return isValidType && isValidSize;
    });
    
    if (validFiles.length !== fileArray.length) {
      alert('برخی فایل‌ها نامعتبر هستند. فقط تصاویر و ویدیو تا 50 مگابایت پذیرفته می‌شوند.');
    }
    
    setUploadedFiles(prev => [...prev, ...validFiles]);
    
    // Simulate upload progress
    validFiles.forEach(file => {
      setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
      simulateFileUpload(file);
    });
  };

  const simulateFileUpload = (file: File) => {
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const currentProgress = prev[file.name] || 0;
        if (currentProgress >= 100) {
          clearInterval(interval);
          return prev;
        }
        return { ...prev, [file.name]: currentProgress + 10 };
      });
    }, 200);
  };

  const removeFile = (fileName: string) => {
    setUploadedFiles(prev => prev.filter(file => file.name !== fileName));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileName];
      return newProgress;
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    handleFileUpload(files);
  };

  // Load posts on component mount
  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('id', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
        setPostsLoading(false);
        return;
      }
      setPosts(data);
      setPostsLoading(false);
    };

    fetchPosts();
    const interval = setInterval(fetchPosts, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w mx-auto bg-white rounded-lg shadow p-8">
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-4" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('factory')}
            className={`whitespace-nowrap py-4 px-1 font-medium text-sm ${
              activeTab === 'factory'
                ? 'border-b-2 border-purple-600 text-purple-700'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            تولید محتوا
          </button>
          <button
            onClick={() => setActiveTab('newpost')}
            className={`whitespace-nowrap py-4 px-1 font-medium text-sm ${
              activeTab === 'newpost'
                ? 'border-b-2 border-purple-600 text-purple-700'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            پست جدید
          </button>
          <button
            onClick={() => setActiveTab('ads')}
            className={`whitespace-nowrap py-4 px-1 font-medium text-sm ${
              activeTab === 'ads'
                ? 'border-b-2 border-purple-600 text-purple-700'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            لیست تبلیغات
          </button>
        </nav>
      </div>

      <div className="mt-8">
        {/* AI Content Factory */}
        {activeTab === 'factory' && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl font-bold mb-6 text-purple-700 text-center">تولید محتوا با هوش مصنوعی</h2>
            
            {/* AI Credits Display */}
            <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
              <div className="flex items-center justify-center gap-3">
                                 <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-full">
                   <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                   </svg>
                 </div>
                                 <div className="text-center">
                   <p className="text-sm text-purple-600 font-medium">اعتبار باقی مانده</p>
                  {creditsLoading ? (
                    <div className="flex items-center justify-center mt-1">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                    </div>
                  ) : (
                    <p className="text-2xl font-bold text-purple-700">{aiCredits.toLocaleString()} سکه</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block mb-2 font-semibold text-gray-700">نوع محتوا</label>
                <select
                  className="w-full border rounded-lg px-4 py-3 text-right"
                  value={contentType}
                  onChange={e => {
                    const newType = e.target.value as any;
                    setContentType(newType);
                    // Auto-select Qubico/flux1-dev for image type
                    if (newType === 'image') {
                      setEngine('Qubico/flux1-dev');
                    } else {
                      setEngine('');
                    }
                  }}
                >
                  <option value="text">متن</option>
                  <option value="image">عکس</option>
                  <option value="video">ویدیو</option>
                  <option value="audio">صدا</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 font-semibold text-gray-700">انتخاب موتور هوش مصنوعی</label>
                <div className="mb-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    💡 <strong>نکته:</strong> مدل‌های با علامت (پیشنهادی) معمولاً در اشتراک‌های رایگان و پایه در دسترس هستند. 
                    اگر با خطای "no available resource" مواجه شدید، مدل دیگری انتخاب کنید.
                  </p>
                </div>
                <select
                  className="w-full border rounded-lg px-4 py-3 text-right"
                  value={engine}
                  onChange={e => setEngine(e.target.value)}
                >
                  <option value="">انتخاب کنید...</option>
                  {aiEngines[contentType].map(eng => (
                    <option key={eng.id} value={eng.id}>
                      {eng.name} - {eng.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-2 font-semibold text-gray-700">پرامپت</label>
                <textarea
                  className="w-full border rounded-lg px-4 py-3 min-h-[120px] text-right"
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  placeholder={`پرامپت خود را برای تولید ${contentType === 'text' ? 'متن' : contentType === 'image' ? 'تصویر' : contentType === 'video' ? 'ویدیو' : 'صدا'} وارد کنید...`}
                />
              </div>

              {generationError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                  {generationError}
                </div>
              )}

              <div className="flex justify-center">
                <button
                  className="bg-purple-600 hover:bg-purple-700 text-white py-3 px-8 rounded-lg font-bold disabled:opacity-50 transition-colors"
                  disabled={!engine || !prompt || isGenerating}
                  onClick={generateContent}
                >
                  {isGenerating ? 'در حال تولید...' : 'تولید محتوا'}
                </button>
              </div>

              {/* نمایش خروجی متنی تولید شده */}
              {contentType === 'text' && generatedContent.length > 0 && generatedContent[0].type === 'text' && generatedContent[0].status === 'completed' && (
                <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h3 className="font-bold mb-2 text-purple-700">متن تولید شده:</h3>
                  <div className="text-gray-800 whitespace-pre-line">{generatedContent[0].content}</div>
                </div>
              )}

              {/* Image Generation Status */}
              {contentType === 'image' && (
                <div className="mt-6">
                  {isImageGenerating && (
                    <div className="text-center p-6 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-center mb-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                      <p className="text-blue-800 font-medium">در حال تولید تصویر...</p>
                      {imageTaskId && (
                        <p className="text-blue-600 text-sm mt-2">Task ID: {imageTaskId}</p>
                      )}
                      <p className="text-blue-600 text-sm mt-1">لطفاً صبر کنید، این فرآیند ممکن است چند دقیقه طول بکشد.</p>
                    </div>
                  )}

                  {generatedImageUrl && !isImageGenerating && (
                    <div className="text-center p-6 bg-green-50 border border-green-200 rounded-lg">
                      <h3 className="text-green-800 font-bold mb-4">تصویر با موفقیت تولید شد!</h3>
                      <img 
                        src={generatedImageUrl} 
                        alt="Generated Image" 
                        className="max-w-full h-auto rounded-lg shadow-lg mx-auto"
                        style={{ maxHeight: '400px' }}
                      />
                      <div className="mt-4 space-y-2">
                        <p className="text-green-700 text-sm">
                          <strong>URL:</strong> {generatedImageUrl}
                        </p>
                        {imageTaskId && (
                          <p className="text-green-600 text-sm">
                            <strong>Task ID:</strong> {imageTaskId}
                          </p>
                        )}
                        <div className="flex justify-center space-x-3">
                          <button
                            onClick={async () => {
                              // Show download modal
                              setShowDownloadModal(true);
                              setDownloadStatus('loading');
                              setDownloadMessage('در حال دانلود تصویر...');
                              
                              try {
                                console.log('Starting download for URL:', generatedImageUrl);
                                
                                // Fetch the image first
                                const response = await fetch(generatedImageUrl, {
                                  method: 'GET',
                                  mode: 'cors',
                                  headers: {
                                    'Accept': 'image/*',
                                  }
                                });
                                
                                console.log('Fetch response status:', response.status);
                                console.log('Fetch response headers:', response.headers);
                                
                                if (!response.ok) {
                                  throw new Error(`HTTP error! status: ${response.status}`);
                                }
                                
                                const blob = await response.blob();
                                console.log('Blob size:', blob.size, 'bytes');
                                console.log('Blob type:', blob.type);
                                
                                if (blob.size === 0) {
                                  throw new Error('تصویر خالی است');
                                }
                                
                                // Create download link
                                const url = window.URL.createObjectURL(blob);
                                const link = document.createElement('a');
                                link.href = url;
                                link.download = `generated-image-${imageTaskId || Date.now()}.png`;
                                link.style.display = 'none';
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                                
                                // Clean up the URL object
                                window.URL.revokeObjectURL(url);
                                
                                console.log('Download completed successfully');
                                setDownloadStatus('success');
                                setDownloadMessage('تصویر با موفقیت دانلود شد!');
                                
                                // Auto close modal after 2 seconds
                                setTimeout(() => {
                                  setShowDownloadModal(false);
                                }, 2000);
                                
                              } catch (error) {
                                console.error('Download error details:', error);
                                if (error instanceof Error) {
                                  console.error('Error name:', error.name);
                                  console.error('Error message:', error.message);
                                  console.error('Error stack:', error.stack);
                                }
                                
                                // Try alternative download method using canvas
                                try {
                                  console.log('Trying alternative download method with canvas...');
                                  setDownloadMessage('تلاش مجدد با روش جایگزین...');
                                  
                                  // Create an image element
                                  const img = new Image();
                                  img.crossOrigin = 'anonymous';
                                  
                                  img.onload = () => {
                                    // Create canvas
                                    const canvas = document.createElement('canvas');
                                    const ctx = canvas.getContext('2d');
                                    
                                    if (ctx) {
                                      canvas.width = img.width;
                                      canvas.height = img.height;
                                      
                                      // Draw image on canvas
                                      ctx.drawImage(img, 0, 0);
                                      
                                      // Convert to blob and download
                                      canvas.toBlob((blob) => {
                                        if (blob) {
                                          const url = window.URL.createObjectURL(blob);
                                          const link = document.createElement('a');
                                          link.href = url;
                                          link.download = `generated-image-${imageTaskId || Date.now()}.png`;
                                          link.style.display = 'none';
                                          document.body.appendChild(link);
                                          link.click();
                                          document.body.removeChild(link);
                                          window.URL.revokeObjectURL(url);
                                          console.log('Canvas download method completed');
                                          
                                          setDownloadStatus('success');
                                          setDownloadMessage('تصویر با موفقیت دانلود شد!');
                                          
                                          // Auto close modal after 2 seconds
                                          setTimeout(() => {
                                            setShowDownloadModal(false);
                                          }, 2000);
                                        } else {
                                          setDownloadStatus('error');
                                          setDownloadMessage('خطا در تبدیل تصویر. لطفاً تصویر را راست کلیک کرده و "ذخیره تصویر به عنوان" را انتخاب کنید.');
                                        }
                                      }, 'image/png');
                                    }
                                  };
                                  
                                  img.onerror = () => {
                                    console.error('Failed to load image for canvas method');
                                    setDownloadStatus('error');
                                    setDownloadMessage('خطا در بارگذاری تصویر. لطفاً تصویر را راست کلیک کرده و "ذخیره تصویر به عنوان" را انتخاب کنید.');
                                  };
                                  
                                  img.src = generatedImageUrl;
                                  
                                } catch (altError) {
                                  console.error('Canvas download method also failed:', altError);
                                  const errorMessage = error instanceof Error ? error.message : 'خطای نامشخص';
                                  setDownloadStatus('error');
                                  setDownloadMessage(`خطا در دانلود تصویر: ${errorMessage}\nلطفاً تصویر را راست کلیک کرده و "ذخیره تصویر به عنوان" را انتخاب کنید.`);
                                }
                              }
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-sm font-medium transition-colors"
                          >
                            دانلود
                          </button>
                          
                          <button
                            onClick={() => {
                              setGeneratedImageUrl(null);
                              setImageTaskId(null);
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded text-sm font-medium transition-colors"
                          >
                            پاک کردن
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* New Post Creation */}
        {activeTab === 'newpost' && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl font-bold mb-6 text-purple-700 text-center">تولید پست جدید</h2>
            
            <div className="space-y-6">
              {selectedContent && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-bold text-purple-800 mb-2">محتوای انتخاب شده:</h3>
                  <p className="text-purple-700 text-sm">{selectedContent.title}</p>
                </div>
              )}
              
              <div>
                <label className="block mb-2 font-semibold text-gray-700">محتوای پست</label>
                <textarea
                  className="w-full border rounded-lg px-4 py-3 min-h-[200px] text-right"
                  value={postContent}
                  onChange={e => setPostContent(e.target.value)}
                  placeholder="محتوای پست را وارد کنید..."
                />
              </div>
              
              {/* Drag and Drop File Uploader */}
              <div>
                <label className="block mb-2 font-semibold text-gray-700">آپلود فایل (تصویر یا ویدیو)</label>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    isDragOver 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-300 hover:border-purple-400'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-700">فایل‌های خود را اینجا بکشید</p>
                      <p className="text-sm text-gray-500 mt-1">یا کلیک کنید تا فایل انتخاب کنید</p>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 cursor-pointer transition-colors"
                    >
                      انتخاب فایل
                    </label>
                  </div>
                </div>
                
                {/* Uploaded Files List */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-4 space-y-3">
                    <h4 className="font-medium text-gray-700">فایل‌های آپلود شده:</h4>
                    <div className="space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3 space-x-reverse">
                            <div className="flex-shrink-0">
                              {file.type.startsWith('image/') ? (
                                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              ) : (
                                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                              <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 space-x-reverse">
                            {uploadProgress[file.name] !== undefined && uploadProgress[file.name] < 100 && (
                              <div className="flex items-center space-x-1 space-x-reverse">
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full transition-all duration-300 ${
                                      isCreatingPost && isUploading ? 'bg-blue-600' : 'bg-purple-600'
                                    }`}
                                    style={{ width: `${uploadProgress[file.name]}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs text-gray-500">{uploadProgress[file.name]}%</span>
                              </div>
                            )}
                            {uploadProgress[file.name] === 100 && (
                              <span className="text-green-500 text-sm">✓ آپلود شد</span>
                            )}
                            <button
                              onClick={() => removeFile(file.name)}
                              className="text-red-500 hover:text-red-700 transition-colors"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex gap-4 justify-center">
                <button
                  className="bg-purple-600 hover:bg-purple-700 text-white py-3 px-8 rounded-lg font-bold disabled:opacity-50 transition-colors"
                  disabled={!postContent || isCreatingPost}
                  onClick={createPost}
                >
                  {isCreatingPost ? (
                    isUploading ? 'در حال آپلود فایل‌ها...' : 'در حال ایجاد پست...'
                  ) : 'ایجاد پست'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Download Modal */}
        {showDownloadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white/95 backdrop-blur-md rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl border border-white/20">
              <div className="text-center">
                {downloadStatus === 'loading' && (
                  <div className="mb-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                )}
                
                {downloadStatus === 'success' && (
                  <div className="mb-4">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                      <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}
                
                {downloadStatus === 'error' && (
                  <div className="mb-4">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                      <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  </div>
                )}
                
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {downloadStatus === 'loading' && 'دانلود تصویر'}
                  {downloadStatus === 'success' && 'دانلود موفق'}
                  {downloadStatus === 'error' && 'خطا در دانلود'}
                </h3>
                
                <p className="text-sm text-gray-600 mb-4 whitespace-pre-line">
                  {downloadMessage}
                </p>
                
                {downloadStatus === 'error' && (
                  <button
                    onClick={() => setShowDownloadModal(false)}
                    className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded text-sm font-medium transition-colors"
                  >
                    بستن
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Ads List */}
        {activeTab === 'ads' && (
          <div>
            <h2 className="text-xl font-bold mb-6 text-purple-700 text-center">لیست تبلیغات و پست‌ها</h2>
            
            {postsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-500">در حال بارگذاری...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center text-gray-500 py-12">
                <p>هنوز پستی ایجاد نشده است.</p>
                <p className="mt-2">به تب "تولید پست جدید" بروید و پست جدید ایجاد کنید.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map(post => (
                  <div key={post.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                          پست
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        پست #{post.id}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{post.content}</p>
                    
                    {/* Display uploaded media */}
                    {post.media_url && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">فایل‌های پیوست:</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {post.media_url.split(',').map((url, index) => {
                            const isVideo = url.match(/\.(mp4|webm|ogg|mov|avi)$/i);
                            return (
                              <div key={index} className="relative">
                                {isVideo ? (
                                  <video 
                                    className="w-full h-24 object-cover rounded-lg"
                                    controls
                                    preload="metadata"
                                  >
                                    <source src={url} type="video/mp4" />
                                    مرورگر شما از پخش ویدیو پشتیبانی نمی‌کند.
                                  </video>
                                ) : (
                                  <img 
                                    src={url} 
                                    alt={`Media ${index + 1}`}
                                    className="w-full h-24 object-cover rounded-lg"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                    }}
                                  />
                                )}
                                <a 
                                  href={url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="absolute top-1 right-1 bg-black bg-opacity-50 text-white p-1 rounded text-xs hover:bg-opacity-70 transition-colors"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                </a>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => deletePost(post.id)}
                        className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded text-sm font-medium transition-colors"
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 