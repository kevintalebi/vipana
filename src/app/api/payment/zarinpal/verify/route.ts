import { NextResponse } from 'next/server';
import { zarinpalVerify } from '@/app/services/zarinpal';

export async function POST(req: Request) {
  try {
    const { authority, amount } = await req.json();
    if (!authority || !amount) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
    const result = await zarinpalVerify(authority, Number(amount));
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Payment verify failed' }, { status: 500 });
  }
}


