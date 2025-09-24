import { NextResponse } from 'next/server'
import { createNanoBananaTask, getNanoBananaTask, createGPTImageTask, getGPTImageTask, createFluxTask, getFluxTask, createMidjourneyTask, getMidjourneyTask } from './functions'

// POST /api/kie/image - Create image generation task
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { prompt, imageUrls, imageSize, model } = body

    if (!prompt) {
      return NextResponse.json({ success: false, error: 'Prompt is required' }, { status: 400 })
    }

    // Determine which function to use based on model
    const isGPTModel = model === 'GPT-Image-1';
    const isFluxModel = model === 'Flux';
    const isMidjourneyModel = model === 'Midjourney' || model === 'midjourney';
    console.log('Route: Model received:', model, 'isGPTModel:', isGPTModel, 'isFluxModel:', isFluxModel, 'isMidjourneyModel:', isMidjourneyModel);
    
    let result;
    if (isGPTModel) {
      result = await createGPTImageTask(prompt, imageUrls, imageSize);
    } else if (isFluxModel) {
      result = await createFluxTask(prompt, imageUrls, imageSize);
    } else if (isMidjourneyModel) {
      result = await createMidjourneyTask(prompt, imageUrls, imageSize);
    } else {
      result = await createNanoBananaTask(prompt, imageUrls, imageSize);
    }
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data,
        taskId: result.taskId
      })
    } else {
      console.log('Route: Task creation failed:', result.error);
      return NextResponse.json({ 
        success: false, 
        error: result.error 
      }, { status: 500 })
    }
  } catch (error) {
    console.log('Route: POST error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

// GET /api/kie/image - Get task status
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get('taskId')
    const model = searchParams.get('model')

    if (!taskId) {
      return NextResponse.json({ success: false, error: 'Task ID is required' }, { status: 400 })
    }

    // Determine which function to use based on model
    const isGPTModel = model === 'GPT-Image-1';
    const isFluxModel = model === 'Flux';
    const isMidjourneyModel = model === 'Midjourney' || model === 'midjourney';
    
    let result;
    if (isGPTModel) {
      result = await getGPTImageTask(taskId);
    } else if (isFluxModel) {
      result = await getFluxTask(taskId);
    } else if (isMidjourneyModel) {
      result = await getMidjourneyTask(taskId);
    } else {
      result = await getNanoBananaTask(taskId);
    }
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data,
        status: result.status,
        result: result.result,
        resultUrls: (result as { resultUrls?: string[] }).resultUrls,
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