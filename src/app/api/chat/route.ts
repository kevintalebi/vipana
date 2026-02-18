import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { MongoDBChatMessageHistory } from '@langchain/mongodb';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage } from '@langchain/core/messages';

const DB_NAME = 'vipana';
const COLLECTION_NAME = 'messages';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, conversationId: rawId, userId } = body as {
      message?: string;
      conversationId?: string;
      userId?: string;
    };

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json(
        { success: false, error: 'message is required' },
        { status: 400 }
      );
    }

    const apiKey =
      process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'Google AI API key not configured' },
        { status: 500 }
      );
    }

    const mongoUri =
      process.env.MONGODB_URI || process.env.NEXT_PUBLIC_MONGO_URL;
    if (!mongoUri) {
      return NextResponse.json(
        { success: false, error: 'MongoDB URI not configured' },
        { status: 500 }
      );
    }

    const conversationId = rawId || crypto.randomUUID();
    const sessionId = userId ? `${userId}_${conversationId}` : conversationId;

    const client = new MongoClient(mongoUri);
    await client.connect();
    const collection = client.db(DB_NAME).collection(COLLECTION_NAME);

    const chatHistory = new MongoDBChatMessageHistory({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- mongodb version mismatch with @langchain/mongodb
      collection: collection as any,
      sessionId,
    });

    const historyMessages = await chatHistory.getMessages();
    // gemini-pro works with standard Google AI Studio keys; preview/experimental models often return 403
    const model = new ChatGoogleGenerativeAI({
      model: 'gemini-3-flash-preview',
      apiKey,
      maxOutputTokens: 2048,
    });

    const fullMessages = [...historyMessages, new HumanMessage(message)];
    const response = await model.invoke(fullMessages);

    const content =
      typeof response?.content === 'string'
        ? response.content
        : Array.isArray(response?.content)
          ? (response.content as { text?: string }[]).map((c) => c?.text ?? '').join('')
          : String(response?.content ?? '');

    await chatHistory.addUserMessage(message);
    await chatHistory.addAIMessage(content);

    await client.close();

    return NextResponse.json({
      success: true,
      content,
      conversationId,
    });
  } catch (error) {
    console.error('[api/chat] Error:', error);
    const message = error instanceof Error ? error.message : 'Chat request failed';
    const is403 = String(message).includes('403') || String(message).includes('Forbidden');
    const errorForClient = is403
      ? 'خطای 403: کلید API گوگل محدود شده است. در Google Cloud Console برای این کلید، قسمت «Application restriction» را روی «None» بگذارید (یا «IP addresses» و IP سرور را اضافه کنید). درخواست از سرور با محدودیت «HTTP referrers» کار نمی‌کند.'
      : message;
    return NextResponse.json(
      { success: false, error: errorForClient },
      { status: 500 }
    );
  }
}
