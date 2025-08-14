import { NextResponse } from 'next/server';
import { zarinpalRequest } from '@/app/services/zarinpal';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, description, callback_url, metadata } = body || {};
    if (!amount || !description || !callback_url) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
    const result = await zarinpalRequest({ amount, description, callback_url, metadata });
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Payment request failed' }, { status: 500 });
  }
}


