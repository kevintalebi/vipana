export type ZarinpalRequestPayload = {
  amount: number; // in Rials
  description: string;
  callback_url: string;
  metadata?: { email?: string; mobile?: string };
};

export type ZarinpalRequestResponse = {
  authority: string;
  startPayUrl: string;
};

export type ZarinpalVerifyResponse = {
  ref_id: number;
  card_pan?: string;
};

export async function zarinpalRequest(payload: ZarinpalRequestPayload) {
  const apiKey = process.env.NEXT_PUBLIC_ZARINPAL_API_KEY;
  if (!apiKey) throw new Error('Zarinpal API key not configured');
  const res = await fetch('https://api.zarinpal.com/pg/v4/payment/request.json', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ...payload, merchant_id: apiKey }),
    cache: 'no-store',
  });
  const data = await res.json();
  if (!res.ok || data?.data?.code !== 100) {
    const message = data?.errors?.message || data?.data?.message || 'Zarinpal request failed';
    throw new Error(message);
  }
  const authority = data.data.authority as string;
  return {
    authority,
    startPayUrl: `https://www.zarinpal.com/pg/StartPay/${authority}`,
  } as ZarinpalRequestResponse;
}

export async function zarinpalVerify(authority: string, amount: number) {
  const apiKey = process.env.NEXT_PUBLIC_ZARINPAL_API_KEY;
  if (!apiKey) throw new Error('Zarinpal API key not configured');
  const res = await fetch('https://api.zarinpal.com/pg/v4/payment/verify.json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ merchant_id: apiKey, authority, amount }),
    cache: 'no-store',
  });
  const data = await res.json();
  if (!res.ok || data?.data?.code !== 100) {
    const message = data?.errors?.message || data?.data?.message || 'Zarinpal verify failed';
    throw new Error(message);
  }
  return { ref_id: data.data.ref_id, card_pan: data.data.card_pan } as ZarinpalVerifyResponse;
}


