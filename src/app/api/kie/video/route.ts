import { NextResponse } from 'next/server'
import { 
  createVeoTask, 
  getVeoTask, 
  createKlingTask, 
  getKlingTask, 
  createWanTask, 
  getWanTask, 
  createRunwayTask, 
  getRunwayTask 
} from './functions'

// POST /api/kie/video - Create video generation task
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { prompt, imageUrls, videoLength, model } = body

    if (!prompt) {
      return NextResponse.json({ success: false, error: 'Prompt is required' }, { status: 400 })
    }

    // Determine which function to use based on model
    const isVeoModel = model === 'Veo';
    const isKlingModel = model === 'Kling';
    const isWanModel = model === 'Wan';
    const isRunwayModel = model === 'Runway';
    
    console.log('Video Route: Model received:', model);
    console.log('Video Route: isVeoModel:', isVeoModel, 'isKlingModel:', isKlingModel, 'isWanModel:', isWanModel, 'isRunwayModel:', isRunwayModel);
    console.log('Video Route: Request body:', JSON.stringify(body, null, 2));
    
    let result;
    if (isVeoModel) {
      result = await createVeoTask(prompt, imageUrls, videoLength);
    } else if (isKlingModel) {
      result = await createKlingTask(prompt, imageUrls, videoLength);
    } else if (isWanModel) {
      console.log('Video Route: Calling createWanTask with:', { prompt, imageUrls, videoLength });
      result = await createWanTask(prompt, imageUrls, videoLength);
      console.log('Video Route: createWanTask result:', JSON.stringify(result, null, 2));
    } else if (isRunwayModel) {
      result = await createRunwayTask(prompt, imageUrls, videoLength);
    } else {
      // Default to Veo if no model specified
      result = await createVeoTask(prompt, imageUrls, videoLength);
    }
    
    console.log('Video Route: Function result:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('Video Route: Task creation successful, returning taskId:', result.taskId);
      return NextResponse.json({
        success: true,
        data: result.data,
        taskId: result.taskId
      })
    } else {
      console.log('Video Route: Task creation failed:', result.error);
      return NextResponse.json({ 
        success: false, 
        error: result.error 
      }, { status: 500 })
    }
  } catch (error) {
    console.log('Video Route: POST error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

// GET /api/kie/video - Check video generation task status
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get('taskId')
    const model = searchParams.get('model')

    if (!taskId) {
      return NextResponse.json({ success: false, error: 'Task ID is required' }, { status: 400 })
    }

    // Determine which function to use based on model
    const isVeoModel = model === 'Veo';
    const isKlingModel = model === 'Kling';
    const isWanModel = model === 'Wan';
    const isRunwayModel = model === 'Runway';
    
    let result;
    if (isVeoModel) {
      result = await getVeoTask(taskId);
    } else if (isKlingModel) {
      result = await getKlingTask(taskId);
    } else if (isWanModel) {
      result = await getWanTask(taskId);
    } else if (isRunwayModel) {
      result = await getRunwayTask(taskId);
    } else {
      // Default to Veo if no model specified
      result = await getVeoTask(taskId);
    }
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data,
        status: result.status,
        result: result.result,
        resultUrl: result.resultUrl,
        isCompleted: result.isCompleted,
        isFailed: result.isFailed
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        error: result.error 
      }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
