// KIE.ai Video Generation Functions
// This file contains all video generation functions for different models

export const createVeoTask = async (prompt: string, imageUrls?: string[], videoLength?: string) => {
  try {
    const apiKey = process.env.NEXT_PUBLIC_KIE_API_KEY;
    
    if (!apiKey) {
      throw new Error('KIE API key is missing');
    }

    const payload = {
      prompt: prompt,
      model: "veo3",
      aspectRatio: videoLength || "16:9",
      ...(imageUrls && imageUrls.length > 0 && { imageUrls: imageUrls })
    };

    const response = await fetch('https://api.kie.ai/api/v1/veo/generate', {
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
    console.error('Error creating Veo task:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}

export const getVeoTask = async (taskId: string) => {
  try {
    const apiKey = process.env.NEXT_PUBLIC_KIE_API_KEY;
    
    if (!apiKey) {
      throw new Error('KIE API key is missing');
    }

    if (!taskId) {
      throw new Error('Task ID is required');
    }

    const response = await fetch(`https://api.kie.ai/api/v1/veo/record-info?taskId=${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    const data = await response.json();
    
    console.log('Veo API Status Response:', JSON.stringify(data, null, 2));
    
    if (!response.ok) {
      // Log the full error response from KIE.ai if the response is not OK
      console.error('Veo API Error Response (not ok):', JSON.stringify(data, null, 2));
      throw new Error(data.error || data.msg || 'Failed to get task status from KIE.ai');
    }

    const taskData = data.data;
    const successFlag = taskData?.successFlag;
    const responseData = taskData?.response;
    const resultUrls = responseData?.resultUrls;
    const resultUrl = resultUrls?.[0]; // Get the first video URL

    console.log('Veo Status Check:', {
      'taskData': taskData,
      'successFlag': successFlag,
      'responseData': responseData,
      'resultUrls': resultUrls,
      'resultUrl': resultUrl,
      'data.code': data.code
    });
    
    // Determine completion status based on successFlag and resultUrl
    const isCompleted = successFlag === 1 && !!resultUrl;
    const isFailed = successFlag === 0 && taskData?.completeTime && !resultUrl;
    
    console.log('Veo Status Logic:', {
      'successFlag': successFlag,
      'resultUrl': resultUrl,
      'completeTime': taskData?.completeTime,
      'isCompleted': isCompleted,
      'isFailed': isFailed
    });

    return {
      success: true,
      data: data,
      status: isCompleted ? 'completed' : 'processing',
      result: resultUrl,
      resultUrl: resultUrl,
      isCompleted: isCompleted,
      isFailed: isFailed
    };
  } catch (error) {
    console.error('Error getting Veo task status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
      isCompleted: false,
      isFailed: true
    };
  }
}

export const createKlingTask = async (prompt: string, imageUrls?: string[], videoLength?: string) => {
  try {
    const apiKey = process.env.NEXT_PUBLIC_KIE_API_KEY;
    
    if (!apiKey) {
      throw new Error('KIE API key is missing');
    }

    const payload = {
      model: imageUrls && imageUrls.length > 0 ? "kling/v2-1-master-image-to-video" : "kling/v2-1-master-text-to-video",
      input: {
        prompt: prompt,
        duration: "5",
        aspect_ratio: videoLength || "16:9",
        cfg_scale: 0.5,
        ...(imageUrls && imageUrls.length > 0 && { image_url: imageUrls[0] })
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

    const taskId = data.data?.taskId;
    const recordId = data.data?.recordId;
    if (!taskId) {
      throw new Error('Task ID not found in response');
    }

    return {
      success: true,
      data: data,
      taskId: taskId,
      recordId: recordId
    };
  } catch (error) {
    console.error('Error creating Kling task:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}

export const getKlingTask = async (taskId: string) => {
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

    const taskData = data.data;
    const state = taskData?.state;
    const resultJson = taskData?.resultJson;
    
    let resultUrl = null;
    if (resultJson) {
      try {
        const parsedResult = JSON.parse(resultJson);
        resultUrl = parsedResult.resultUrls?.[0];
      } catch (parseError) {
        console.error('Error parsing resultJson:', parseError);
      }
    }
    
    // Determine completion status based on state
    const isCompleted = state === 'success' && !!resultUrl;
    const isFailed = state === 'failed' || state === 'error' || (state === 'success' && !resultUrl);

    return {
      success: true,
      data: data,
      status: state,
      result: resultUrl,
      resultUrl: resultUrl,
      isCompleted: isCompleted,
      isFailed: isFailed
    };
  } catch (error) {
    console.error('Error getting Kling task status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
      isCompleted: false,
      isFailed: true
    };
  }
}

export const createWanTask = async (prompt: string, imageUrls?: string[], videoLength?: string) => {
  try {
    const apiKey = process.env.NEXT_PUBLIC_KIE_API_KEY;
    
    if (!apiKey) {
      throw new Error('KIE API key is missing');
    }

    const payload = {
      model: imageUrls && imageUrls.length > 0 ? "wan/2-2-a14b-image-to-video-turbo" : "wan/2-2-a14b-text-to-video-turbo",
      input: {
        prompt: prompt,
        aspect_ratio: videoLength || "16:9",
        ...(imageUrls && imageUrls.length > 0 && { image_url: imageUrls[0] })
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
    
    console.log('Wan API Response:', JSON.stringify(data, null, 2));
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to create task');
    }

    // Try multiple possible locations for task ID
    const taskId = data.data?.taskId || data.data?.id || data.taskId || data.id;
    const recordId = data.data?.recordId || data.data?.record_id || data.recordId;
    
    console.log('Wan Task ID extraction:', {
      'data.data?.taskId': data.data?.taskId,
      'data.data?.id': data.data?.id,
      'data.taskId': data.taskId,
      'data.id': data.id,
      'final taskId': taskId
    });
    
    if (!taskId) {
      console.error('Wan API Response structure:', data);
      throw new Error('Task ID not found in response');
    }

    return {
      success: true,
      data: data,
      taskId: taskId,
      recordId: recordId
    };
  } catch (error) {
    console.error('Error creating Wan task:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}

export const getWanTask = async (taskId: string) => {
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

    const taskData = data.data;
    const state = taskData?.state;
    const resultJson = taskData?.resultJson;
    
    let resultUrl = null;
    if (resultJson) {
      try {
        const parsedResult = JSON.parse(resultJson);
        resultUrl = parsedResult.resultUrls?.[0];
      } catch (parseError) {
        console.error('Error parsing resultJson:', parseError);
      }
    }
    
    // Determine completion status based on state
    const isCompleted = state === 'success' && !!resultUrl;
    const isFailed = state === 'failed' || state === 'error' || (state === 'success' && !resultUrl);

    return {
      success: true,
      data: data,
      status: state,
      result: resultUrl,
      resultUrl: resultUrl,
      isCompleted: isCompleted,
      isFailed: isFailed
    };
  } catch (error) {
    console.error('Error getting Wan task status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
      isCompleted: false,
      isFailed: true
    };
  }
}

export const createRunwayTask = async (prompt: string, imageUrls?: string[], videoLength?: string) => {
  try {
    const apiKey = process.env.NEXT_PUBLIC_KIE_API_KEY;
    
    if (!apiKey) {
      throw new Error('KIE API key is missing');
    }

    const payload = {
      prompt: prompt,
      aspectRatio: videoLength || "16:9",
      model: "runway-duration-5-generate",
      duration: "5",
      quality: "720p",
      waterMark: "kie.ai",
      ...(imageUrls && imageUrls.length > 0 && { imageUrl: imageUrls[0] })
    };

    console.log('Runway API Payload:', JSON.stringify(payload, null, 2));

    const response = await fetch('https://api.kie.ai/api/v1/runway/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    console.log('Runway API Response:', JSON.stringify(data, null, 2));
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to create task');
    }

    // Try multiple possible locations for task ID
    const taskId = data.data?.taskId || data.data?.id || data.taskId || data.id;
    
    console.log('Runway Task ID extraction:', {
      'data.data?.taskId': data.data?.taskId,
      'data.data?.id': data.data?.id,
      'data.taskId': data.taskId,
      'data.id': data.id,
      'final taskId': taskId
    });
    
    if (!taskId) {
      console.error('Runway API Response structure:', data);
      throw new Error('Task ID not found in response');
    }

    return {
      success: true,
      data: data,
      taskId: taskId
    };
  } catch (error) {
    console.error('Error creating Runway task:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}

export const getRunwayTask = async (taskId: string) => {
  try {
    const apiKey = process.env.NEXT_PUBLIC_KIE_API_KEY;
    
    if (!apiKey) {
      throw new Error('KIE API key is missing');
    }

    if (!taskId) {
      throw new Error('Task ID is required');
    }

    const response = await fetch(`https://api.kie.ai/api/v1/runway/record-detail?taskId=${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    const data = await response.json();
    
    console.log('Runway API Status Response:', JSON.stringify(data, null, 2));
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to get task status');
    }

    const taskData = data.data;
    const state = taskData?.state;
    const videoInfo = taskData?.videoInfo;
    const videoUrl = videoInfo?.videoUrl;
    const failCode = taskData?.failCode;
    const failMsg = taskData?.failMsg;
    
    console.log('Runway Status Check:', {
      'taskData': taskData,
      'state': state,
      'videoInfo': videoInfo,
      'videoUrl': videoUrl,
      'failCode': failCode,
      'failMsg': failMsg
    });
    
    // Determine completion status based on state and videoUrl
    const isCompleted = state === 'success' && !!videoUrl;
    const isFailed = state === 'failed' || (state === 'success' && !videoUrl);
    
    console.log('Runway Status Logic:', {
      'state': state,
      'videoUrl': videoUrl,
      'isCompleted': isCompleted,
      'isFailed': isFailed
    });

    return {
      success: true,
      data: data,
      status: state,
      result: videoUrl,
      resultUrl: videoUrl,
      isCompleted: isCompleted,
      isFailed: isFailed
    };
  } catch (error) {
    console.error('Error getting Runway task status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
      isCompleted: false,
      isFailed: true
    };
  }
}
