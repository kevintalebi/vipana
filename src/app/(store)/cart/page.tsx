'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface Product {
  id: number;
  name: string;
  price: number;
  main_image: string;
  category_id: number;
  user_id: string;
  created_at: string;
  categories?: {
    name: string;
  } | null;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const savedCart = localStorage.getItem('vipana-cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  const saveCartToStorage = (newCart: CartItem[]) => {
    localStorage.setItem('vipana-cart', JSON.stringify(newCart));
  };

  const removeFromCart = (productId: number) => {
    const updatedCart = cart.filter(item => item.product.id !== productId);
    setCart(updatedCart);
    saveCartToStorage(updatedCart);
  };

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const updatedCart = cart.map(item =>
      item.product.id === productId
        ? { ...item, quantity: newQuantity }
        : item
    );
    setCart(updatedCart);
    saveCartToStorage(updatedCart);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const handleCheckout = async () => {
    try {
      setCheckingOut(true);
      setError('');
      const amountTomans = getCartTotal();
      if (amountTomans <= 0) return;
      const amountRials = amountTomans * 10; // Zarinpal expects Rial
      // Persist last amount for verification page
      localStorage.setItem('vipana-last-amount', String(amountRials));
      // Persist product ids for orders creation after verification
      try {
        const productIds = cart.map((i) => i.product.id);
        localStorage.setItem('vipana-last-product-ids', JSON.stringify(productIds));
      } catch {}
      const callbackUrl = `${window.location.origin}/cart/verify`;
      const res = await fetch('/api/payment/zarinpal/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amountRials, description: 'پرداخت سفارش ویپانا', callback_url: callbackUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'خطا در ایجاد پرداخت');
      const startPayUrl = data?.startPayUrl;
      if (!startPayUrl) throw new Error('آدرس پرداخت یافت نشد');
      window.location.href = startPayUrl;
    } catch (e: any) {
      setError(e.message || 'خطا در اتصال به درگاه پرداخت');
    } finally {
      setCheckingOut(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <h1 className="text-2xl font-bold text-purple-700 mb-4">سبد خرید شما خالی است</h1>
        <Link href="/">
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold mt-4">
            بازگشت به فروشگاه
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-12">
      <h1 className="text-2xl font-bold text-purple-700 mb-8 text-center">سبد خرید</h1>
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="space-y-4">
          {cart.map(item => (
            <div key={item.product.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 overflow-hidden rounded-lg">
                  {item.product.main_image ? (
                    <img 
                      src={item.product.main_image} 
                      alt={item.product.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                      بدون تصویر
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{item.product.name}</h3>
                  <div className="flex flex-col items-start gap-1 mt-1">
                    <span className="text-green-600 font-semibold text-sm">{item.product.price.toLocaleString()} تومان</span>
                    <span className="text-gray-700 font-bold text-xs">جمع: {(item.product.price * item.quantity).toLocaleString()} تومان</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 sm:mt-0">
                <button
                  onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                  className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-gray-600"
                >
                  -
                </button>
                <span className="w-8 text-center font-semibold">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                  className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-gray-600"
                >
                  +
                </button>
                <button
                  onClick={() => removeFromCart(item.product.id)}
                  className="text-red-500 hover:text-red-700 text-xs"
                >
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center">
          <div className="text-lg font-bold text-gray-800">
            مجموع کل: {getCartTotal().toLocaleString()} تومان
          </div>
          <button onClick={handleCheckout} disabled={checkingOut} className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white px-6 py-2 rounded-lg font-semibold">
            {checkingOut ? 'در حال انتقال...' : 'تکمیل خرید'}
          </button>
        </div>
        {error && <div className="text-red-600 text-center mt-3 text-sm">{error}</div>}
      </div>
      <Link href="/">
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded">
          بازگشت به فروشگاه
        </button>
      </Link>
    </div>
  );
} 