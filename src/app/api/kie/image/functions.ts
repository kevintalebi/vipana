// KIE.ai Image Generation Functions
// This file contains the core functions for Kie.ai API integration

export const createNanoBananaTask = async (prompt: string, imageUrls?: string[], imageSize?: string) => {
  try {
    const apiKey = process.env.NEXT_PUBLIC_KIE_API_KEY;
    
    if (!apiKey) {
      throw new Error('KIE API key is missing');
    }

    // Determine model based on whether image URLs are provided
    const model = imageUrls && imageUrls.length > 0 ? 'google/nano-banana-edit' : 'google/nano-banana';
    
    const payload = {
      model: model,
      input: {
        prompt: prompt,
        output_format: "png",
        image_size: imageSize || "1:1",
        ...(imageUrls && imageUrls.length > 0 && { image_urls: imageUrls })
      }
    };

    const response = await fetch('https://api.kie.ai/api/v1/jobs/createTask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to create task');
    }

    return {
      success: true,
      data: data,
      taskId: data.task_id || data.id
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export const getNanoBananaTask = async (taskId: string) => {
  try {
    const apiKey = process.env.NEXT_PUBLIC_KIE_API_KEY;
    
    if (!apiKey) {
      throw new Error('KIE API key is missing');
    }

    if (!taskId) {
      throw new Error('Task ID is required');
    }

    const response = await fetch(`https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to get task status');
    }

    // Extract the actual task data from the nested 'data' field
    const kieTaskData = data.data;
    const status = kieTaskData?.state || kieTaskData?.status; // KIE uses 'state' field
    const result = kieTaskData?.resultJson || kieTaskData?.result;

    return {
      success: true,
      data: data,
      status: status,
      result: result,
      isCompleted: status === 'completed' || status === 'success' || status === 'done' || status === 'finished',
      isFailed: status === 'failed' || status === 'error'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export const createGPTImageTask = async (prompt: string, imageUrls?: string[], imageSize?: string) => {
  try {
    const apiKey = process.env.NEXT_PUBLIC_KIE_API_KEY;
    
    if (!apiKey) {
      throw new Error('KIE API key is missing');
    }

    const payload = {
      prompt: prompt,
      size: imageSize || "1:1",
      isEnhance: false,
      uploadCn: false,
      nVariants: 1,
      enableFallback: false,
      fallbackModel: "FLUX_MAX",
      ...(imageUrls && imageUrls.length > 0 && { filesUrl: imageUrls })
    };

    const response = await fetch('https://api.kie.ai/api/v1/gpt4o-image/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to create task');
    }

    return {
      success: true,
      data: data,
      taskId: data.taskId || data.id || data.data?.taskId
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export const getGPTImageTask = async (taskId: string) => {
  try {
    const apiKey = process.env.NEXT_PUBLIC_KIE_API_KEY;
    
    if (!apiKey) {
      throw new Error('KIE API key is missing');
    }

    if (!taskId) {
      throw new Error('Task ID is required');
    }

    const response = await fetch(`https://api.kie.ai/api/v1/gpt4o-image/record-info?taskId=${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to get task status');
    }

    const taskData = data.data;
    const status = taskData?.status;
    const resultUrls = taskData?.response?.resultUrls;
    const successFlag = taskData?.successFlag;
    const isCompleted = status === 'SUCCESS' && successFlag === 1;
    const isFailed = status === 'FAILED' || status === 'ERROR' || (status === 'SUCCESS' && successFlag === 0);

    return {
      success: true,
      data: data,
      status: status,
      result: resultUrls,
      resultUrls: resultUrls,
      isCompleted: isCompleted,
      isFailed: isFailed
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      isCompleted: false,
      isFailed: true
    };
  }
}

export const createFluxTask = async (prompt: string, imageUrls?: string[], imageSize?: string) => {
  try {
    const apiKey = process.env.NEXT_PUBLIC_KIE_API_KEY;
    
    if (!apiKey) {
      throw new Error('KIE API key is missing');
    }

    const payload = {
      prompt: prompt,
      enableTranslation: true,
      aspectRatio: imageSize || "1:1",
      outputFormat: "jpeg",
      promptUpsampling: false,
      model: "flux-kontext-pro"
    };

    const response = await fetch('https://api.kie.ai/api/v1/flux/kontext/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to create task');
    }

    const taskId = data.data?.taskId;
    if (!taskId) {
      throw new Error('Task ID not found in response');
    }

    return {
      success: true,
      data: data,
      taskId: taskId
    };
  } catch (error) {
    console.error('Error creating Flux task:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}

export const getFluxTask = async (taskId: string) => {
  try {
    const apiKey = process.env.NEXT_PUBLIC_KIE_API_KEY;
    
    if (!apiKey) {
      throw new Error('KIE API key is missing');
    }

    if (!taskId) {
      throw new Error('Task ID is required');
    }

    const response = await fetch(`https://api.kie.ai/api/v1/flux/kontext/record-info?taskId=${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to get task status');
    }

    const taskData = data.data;
    const successFlag = taskData?.successFlag;
    const responseData = taskData?.response;
    const resultImageUrl = responseData?.resultImageUrl;
    const originImageUrl = responseData?.originImageUrl;
    
    // Determine completion status based on successFlag
    const isCompleted = successFlag === 1;
    const isFailed = successFlag === 0 && taskData?.completeTime;

    return {
      success: true,
      data: data,
      status: isCompleted ? 'completed' : 'processing',
      result: resultImageUrl,
      resultImageUrl: resultImageUrl,
      originImageUrl: originImageUrl,
      isCompleted: isCompleted,
      isFailed: isFailed
    };
  } catch (error) {
    console.error('Error getting Flux task status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
      isCompleted: false,
      isFailed: true
    };
  }
}

export const createMidjourneyTask = async (prompt: string, imageUrls?: string[], imageSize?: string) => {
  try {
    const apiKey = process.env.NEXT_PUBLIC_KIE_API_KEY;
    
    if (!apiKey) {
      throw new Error('KIE API key is missing');
    }

    const payload = {
      taskType: "mj_txt2img",
      speed: "relaxed",
      prompt: prompt,
      aspectRatio: imageSize || "1:1",
      version: "7",
      variety: 10,
      stylization: 1,
      weirdness: 1,
      waterMark: "",
      enableTranslation: false,
      videoBatchSize: 1,
      motion: "high",
      ...(imageUrls && imageUrls.length > 0 && { fileUrls: imageUrls })
    };

    const response = await fetch('https://api.kie.ai/api/v1/mj/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to create task');
    }

    const taskId = data.data?.taskId || data.taskId;
    if (!taskId) {
      throw new Error('Task ID not found in response');
    }

    return {
      success: true,
      data: data,
      taskId: taskId
    };
  } catch (error) {
    console.error('Error creating Midjourney task:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}

export const getMidjourneyTask = async (taskId: string) => {
  try {
    const apiKey = process.env.NEXT_PUBLIC_KIE_API_KEY;
    
    if (!apiKey) {
      throw new Error('KIE API key is missing');
    }

    if (!taskId) {
      throw new Error('Task ID is required');
    }

    const response = await fetch(`https://api.kie.ai/api/v1/mj/record-info?taskId=${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to get task status');
    }

    const taskData = data.data;
    const successFlag = taskData?.successFlag;
    const resultInfoJson = taskData?.resultInfoJson;
    const resultUrls = resultInfoJson?.resultUrls;
    const firstResultUrl = resultUrls?.[0]?.resultUrl;
    
    // Determine completion status based on successFlag
    const isCompleted = successFlag === 1;
    const isFailed = successFlag === 0 && taskData?.completeTime;

    return {
      success: true,
      data: data,
      status: isCompleted ? 'completed' : 'processing',
      result: firstResultUrl,
      resultUrls: resultUrls,
      isCompleted: isCompleted,
      isFailed: isFailed
    };
  } catch (error) {
    console.error('Error getting Midjourney task status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
      isCompleted: false,
      isFailed: true
    };
  }
}
