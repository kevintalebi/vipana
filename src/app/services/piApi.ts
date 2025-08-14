// PIAPI Service for AI Content Generation
export interface PIAPIConfig {
  apiKey: string;
  baseURL?: string;
}

export interface TextGenerationRequest {
  prompt: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

export interface ImageGenerationRequest {
  prompt: string;
  model?: string;
  size?: '256x256' | '512x512' | '1024x1024';
  quality?: 'standard' | 'hd';
  style?: 'vivid' | 'natural';
  n?: number;
}

export interface VideoGenerationRequest {
  prompt: string;
  model?: string;
  size?: '256x256' | '512x512' | '1024x1024';
  duration?: number;
  fps?: number;
}

export interface AudioGenerationRequest {
  prompt: string;
  model?: string;
  voice?: string;
  responseFormat?: 'mp3' | 'opus' | 'aac' | 'flac';
  speed?: number;
}

export interface GenerationResponse {
  success: boolean;
  content: string;
  title?: string;
  error?: string;
  metadata?: any;
}

class PIAPIService {
  private apiKey: string;
  private baseURL: string;

  constructor(config: PIAPIConfig) {
    this.apiKey = config.apiKey;
    this.baseURL = config.baseURL || 'https://api.piapi.ai';
  }

  private async makeRequest(endpoint: string, data: any): Promise<any> {
    const url = `${this.baseURL}${endpoint}`;
    console.log('Making PIAPI request to:', url);
    console.log('Request data:', data);
    console.log('API Key (first 10 chars):', this.apiKey.substring(0, 10) + '...');

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': this.apiKey,
        },
        body: JSON.stringify(data),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('PIAPI Error Response:', errorText);
        throw new Error(`PIAPI Error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const responseData = await response.json();
      console.log('PIAPI Response:', responseData);
      return responseData;
    } catch (error) {
      console.error('PIAPI Request Error:', error);
      console.error('Request URL:', url);
      console.error('Request data:', data);
      throw error;
    }
  }

  async generateText(request: TextGenerationRequest): Promise<GenerationResponse> {
    try {
      // Determine task type based on model
      let taskType = 'text-generation';
      if (request.model?.includes('gpt') || request.model?.includes('claude') || request.model?.includes('gemini')) {
        taskType = 'chat-completion';
      } else if (request.model?.includes('llama') || request.model?.includes('meta')) {
        taskType = 'text-generation';
      }

      const response = await this.makeRequest('/api/v1/task', {
        model: request.model || 'Qubico/flux1-dev',
        task_type: taskType,
        input: {
          prompt: request.prompt,
          max_tokens: request.maxTokens || 1000,
          temperature: request.temperature || 0.7,
        }
      });

      const taskId = response.task_id;
      if (!taskId) {
        throw new Error('Task ID not received from API');
      }

      // Wait for task completion
      const taskResult = await this.waitForTaskCompletion(taskId);
      
      // Extract the generated text from the output
      const generatedText = taskResult.output?.text || taskResult.output || 'No output received';

      return {
        success: true,
        content: generatedText,
        title: this.generateTitle(request.prompt),
        metadata: {
          task_id: taskId,
          model: request.model,
          original_response: taskResult,
        }
      };
    } catch (error) {
      return {
        success: false,
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async generateImage(request: ImageGenerationRequest): Promise<GenerationResponse> {
    try {
      // Parse size to get width and height
      const [width, height] = (request.size || '1024x1024').split('x').map(Number);
      
      const response = await this.makeRequest('/api/v1/task', {
        model: request.model || 'Qubico/flux1-dev',
        task_type: 'txt2img',
        input: {
          prompt: request.prompt,
          width: width,
          height: height
        }
      });

      const taskId = response.task_id;
      if (!taskId) {
        throw new Error('Task ID not received from API');
      }

      // Wait for task completion
      const taskResult = await this.waitForTaskCompletion(taskId);
      
      // Extract the generated image URL from the output
      const imageUrl = taskResult.output?.url || taskResult.output || '';

      return {
        success: true,
        content: imageUrl,
        title: this.generateTitle(request.prompt),
        metadata: {
          task_id: taskId,
          model: request.model,
          size: request.size,
          original_response: taskResult,
        }
      };
    } catch (error) {
      return {
        success: false,
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async generateVideo(request: VideoGenerationRequest): Promise<GenerationResponse> {
    try {
      const [width, height] = (request.size || '1024x1024').split('x').map(Number);
      
      const response = await this.makeRequest('/api/v1/task', {
        model: request.model || 'damo-vilab/text-to-video-ms-1.7b',
        task_type: 'text-to-video',
        input: {
          prompt: request.prompt,
          width: width,
          height: height,
          duration: request.duration || 3,
          fps: request.fps || 24,
        }
      });

      const taskId = response.task_id;
      if (!taskId) {
        throw new Error('Task ID not received from API');
      }

      // Wait for task completion
      const taskResult = await this.waitForTaskCompletion(taskId);
      
      // Extract the generated video URL from the output
      const videoUrl = taskResult.output?.url || taskResult.output || '';

      return {
        success: true,
        content: videoUrl,
        title: this.generateTitle(request.prompt),
        metadata: {
          task_id: taskId,
          model: request.model,
          size: request.size,
          original_response: taskResult,
        }
      };
    } catch (error) {
      return {
        success: false,
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async generateAudio(request: AudioGenerationRequest): Promise<GenerationResponse> {
    try {
      const response = await this.makeRequest('/api/v1/task', {
        model: request.model || 'facebook/fastspeech2-en-ljspeech',
        task_type: 'text-to-speech',
        input: {
          prompt: request.prompt,
          voice: request.voice || 'alloy',
          response_format: request.responseFormat || 'mp3',
          speed: request.speed || 1.0,
        }
      });

      const taskId = response.task_id;
      if (!taskId) {
        throw new Error('Task ID not received from API');
      }

      // Wait for task completion
      const taskResult = await this.waitForTaskCompletion(taskId);
      
      // Extract the generated audio URL from the output
      const audioUrl = taskResult.output?.url || taskResult.output || '';

      return {
        success: true,
        content: audioUrl,
        title: this.generateTitle(request.prompt),
        metadata: {
          task_id: taskId,
          model: request.model,
          voice: request.voice,
          original_response: taskResult,
        }
      };
    } catch (error) {
      return {
        success: false,
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async generateMultimodal(request: TextGenerationRequest): Promise<GenerationResponse> {
    try {
      const response = await this.makeRequest('/api/v1/task', {
        model: request.model || 'microsoft/DialoGPT-medium',
        task_type: 'chat-completion',
        input: {
          prompt: request.prompt,
          max_tokens: request.maxTokens || 1000,
          temperature: request.temperature || 0.7,
        }
      });

      const taskId = response.task_id;
      if (!taskId) {
        throw new Error('Task ID not received from API');
      }

      // Wait for task completion
      const taskResult = await this.waitForTaskCompletion(taskId);
      
      // Extract the generated content from the output
      const generatedContent = taskResult.output?.text || taskResult.output || 'No output received';

      return {
        success: true,
        content: generatedContent,
        title: this.generateTitle(request.prompt),
        metadata: {
          task_id: taskId,
          model: request.model,
          original_response: taskResult,
        }
      };
    } catch (error) {
      return {
        success: false,
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  private generateTitle(prompt: string): string {
    // Extract a title from the prompt or generate a simple one
    const words = prompt.split(' ').slice(0, 5);
    return words.join(' ') + (words.length >= 5 ? '...' : '');
  }

  // Test API connection and get available models
  async testConnection(): Promise<{ success: boolean; models?: any[] }> {
    try {
      console.log('Testing PIAPI connection...');
      const response = await fetch(`${this.baseURL}/api/v1/models`, {
        headers: {
          'X-API-KEY': this.apiKey,
        },
      });

      console.log('Connection test response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Connection test failed:', errorText);
        return { success: false };
      }

      const data = await response.json();
      console.log('Connection test successful, available models:', data);
      return { success: true, models: data.data || [] };
    } catch (error) {
      console.error('Connection test error:', error);
      return { success: false };
    }
  }

  // Get available models
  async getAvailableModels(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseURL}/api/v1/models`, {
        headers: {
          'X-API-KEY': this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`PIAPI Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching models:', error);
      return [];
    }
  }

  // Check task status
  async checkTaskStatus(taskId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/api/v1/task/${taskId}`, {
        headers: {
          'X-API-KEY': this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`PIAPI Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error checking task status:', error);
      throw error;
    }
  }

  // Wait for task completion and get result
  async waitForTaskCompletion(taskId: string, maxWaitTime: number = 60000): Promise<any> {
    const startTime = Date.now();
    const checkInterval = 2000; // Check every 2 seconds

    while (Date.now() - startTime < maxWaitTime) {
      try {
        const status = await this.checkTaskStatus(taskId);
        
        if (status.status === 'completed') {
          return status;
        } else if (status.status === 'failed') {
          throw new Error(`Task failed: ${status.error || 'Unknown error'}`);
        }
        
        // Wait before next check
        await new Promise(resolve => setTimeout(resolve, checkInterval));
      } catch (error) {
        console.error('Error checking task status:', error);
        throw error;
      }
    }
    
    throw new Error('Task timeout - task did not complete within the specified time');
  }
}

  // Create and export a singleton instance
  let piApiInstance: PIAPIService | null = null;

  export const getPIAPIService = (): PIAPIService => {
  if (!piApiInstance) {
    const apiKey = process.env.NEXT_PUBLIC_PIAPI_KEY || process.env.PIAPI_KEY;
    console.log('PIAPI Key check:', {
      hasNextPublicKey: !!process.env.NEXT_PUBLIC_PIAPI_KEY,
      hasEnvKey: !!process.env.PIAPI_KEY,
      keyLength: apiKey ? apiKey.length : 0
    });
    
    if (!apiKey) {
      throw new Error('PIAPI key not found in environment variables. Please set NEXT_PUBLIC_PIAPI_KEY in your .env.local file');
    }
    
    if (apiKey.length < 10) {
      throw new Error('PIAPI key seems too short. Please check your API key');
    }
    
    piApiInstance = new PIAPIService({ apiKey });
  }
  return piApiInstance;
};

  export default PIAPIService; 