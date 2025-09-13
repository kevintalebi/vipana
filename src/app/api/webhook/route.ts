import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('API Route - Received webhook data:', body);
    const webhookUrl = process.env.NEXT_PUBLIC_WEBHOOK_URL || 'https://n8n.vipana.ir/webhook/content-handler';
    console.log('API Route - Forwarding to:', webhookUrl);
    
    // Forward the request to the external webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.log('API Route - External response status:', response.status);
    console.log('API Route - External response ok:', response.ok);
    
    const responseData = await response.text();
    console.log('API Route - External response data:', responseData);
    
    if (response.ok) {
      console.log('API Route - Success, returning response');
      
      // Try to parse the response as JSON to extract message content
      let parsedData;
      try {
        parsedData = JSON.parse(responseData);
        console.log('API Route - Parsed response data:', parsedData);
        
        // Handle array response format
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          const firstItem = parsedData[0];
          console.log('API Route - Array response detected, first item:', firstItem);
        }
      } catch {
        console.log('API Route - Response is not JSON, using raw text');
        parsedData = { content: responseData };
      }
      
      return NextResponse.json({ 
        success: true, 
        data: responseData,
        parsed: parsedData,
        status: response.status
      });
    } else {
      console.error('API Route - External webhook error:', {
        status: response.status,
        statusText: response.statusText,
        data: responseData
      });
      return NextResponse.json({ 
        success: false, 
        error: responseData,
        status: response.status,
        statusText: response.statusText
      }, { status: response.status });
    }
  } catch (error) {
    console.error('API Route - Internal error:', {
      error: error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error',
      details: 'API route internal error'
    }, { status: 500 });
  }
}
