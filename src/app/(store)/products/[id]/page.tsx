'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { useParams } from 'next/navigation';

function AddedToCartModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-xs w-full text-center" onClick={e => e.stopPropagation()}>
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
          <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="text-lg font-bold text-green-700 mb-2">محصول با موفقیت به سبد خرید اضافه شد!</div>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors mt-4"
        >
          بستن
        </button>
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams() as { id: string };
  const [product, setProduct] = useState<any>(null);
  const [shop, setShop] = useState<any>(null);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cart, setCart] = useState<any[]>([]);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [showAddedModal, setShowAddedModal] = useState(false);

  useEffect(() => {
    // Set loading title
    document.title = 'در حال بارگذاری محصول | ویپانا بزرگترین مرکز خرید ایران';
    
    const fetchData = async () => {
      try {
        // Create Supabase client
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseKey) {
          setError('خطای پیکربندی سرور');
          setLoading(false);
          return;
        }
        
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        setLoading(true);
        setError('');
        
        // Fetch product
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();
        if (productError || !productData) throw new Error('محصول یافت نشد');
        setProduct(productData);
        
        // Update page title with product name
        document.title = `${productData.name} | ویپانا بزرگترین مرکز خرید ایران`;
        
        // Fetch shop
        const { data: shopData, error: shopError } = await supabase
          .from('sellers')
          .select('id, user_id, name, profile_image')
          .eq('user_id', productData.user_id)
          .single();
        setShop(shopData || null);
        // Fetch product images
        const { data: galleryData } = await supabase
          .from('products_images')
          .select('image_url')
          .eq('product_id', id);
        const galleryImages = galleryData ? galleryData.map((img: any) => img.image_url) : [];
        // Main image first
        const allImages = [productData.main_image, ...galleryImages].filter(Boolean);
        setImages(allImages);
        setMainImage(productData.main_image || (galleryImages[0] || null));
      } catch (err: any) {
        setError(err.message || 'خطا در دریافت اطلاعات محصول');
        document.title = 'محصول یافت نشد | ویپانا بزرگترین مرکز خرید ایران';
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('vipana-cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch {}
  }, []);

  // Save cart to localStorage whenever cart changes
  const saveCartToStorage = (newCart: any[]) => {
    try {
      localStorage.setItem('vipana-cart', JSON.stringify(newCart));
    } catch {}
  };

  const addToCart = () => {
    if (!product) return;
    setCart(prevCart => {
      const existingItem = prevCart.find((item: any) => item.product.id === product.id);
      let updatedCart;
      if (existingItem) {
        updatedCart = prevCart.map((item: any) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        updatedCart = [...prevCart, { product, quantity: 1 }];
      }
      saveCartToStorage(updatedCart);
      return updatedCart;
    });
    setShowAddedModal(true);
  };

  if (loading) return <div className="text-center py-12">در حال بارگذاری...</div>;
  if (error || !product) return <div className="text-center text-red-500 py-12">{error || 'محصول یافت نشد'}</div>;

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w p-4 md:p-6 grid grid-cols-1 md:grid-cols-8 gap-4 md:gap-6">
        {/* Product Images */}
        <div className="col-span-1 md:col-span-3 order-1 flex flex-col items-center gap-4 mb-4 md:mb-0">
          <div className="bg-gray-50 rounded-xl p-4 w-full flex flex-col items-center">
            <div className="font-bold text-xl mb-2">تصاویر محصول</div>
            {/* Main Image */}
            <div className="w-full max-w-xs md:max-w-[400px] aspect-square relative mb-2 flex items-center justify-center">
              {mainImage ? (
                <Image src={mainImage} alt={product.name} fill className="object-cover rounded-lg" />
              ) : (
                <div className="w-full h-full rounded-lg bg-gray-200" />
              )}
            </div>
            {/* Gallery Thumbnails */}
            <div className="flex gap-2 mt-2 flex-wrap justify-center">
              {images.map((img, idx) => (
                <button
                  key={img}
                  className={`w-20 h-20 md:w-24 md:h-24 rounded border ${mainImage === img ? 'border-purple-600' : 'border-gray-200'} overflow-hidden`}
                  onClick={() => setMainImage(img)}
                  tabIndex={-1}
                >
                  <Image src={img} alt={product.name + '-' + idx} width={96} height={96} className="object-cover w-full h-full" />
                </button>
              ))}
            </div>
          </div>
        </div>
        {/* Product Name & Description */}
        <div className="col-span-1 md:col-span-3 order-2 flex flex-col gap-4 justify-center mb-4 md:mb-0">
          <div className="font-extrabold text-3xl text-center">{product.name}</div>
          <div
            className="prose prose-lg prose-headings:text-right prose-p:text-right prose-ul:text-right prose-rtl text-right max-w-none"
            dir="rtl"
            style={{ direction: 'rtl' }}
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        </div>
        {/* Shop Info & Price/Add to Cart */}
        <div className="col-span-1 md:col-span-2 order-3 flex flex-col gap-4 h-full">
          <div className="bg-gray-50 rounded-xl p-4 flex flex-col items-center flex-grow h-full">
            {/* Shop Image */}
            {shop?.profile_image ? (
              <Image src={shop.profile_image} alt={shop.name} width={96} height={96} className="w-24 h-24 rounded-full object-cover mb-2" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 mb-2" />
            )}
            {/* Shop Name */}
            <Link href={`/shops/${shop?.user_id || product?.user_id || ''}`} className="font-bold text-lg text-center text-purple-700 hover:underline">
              {shop?.name || ''}
            </Link>
            <div className="flex-grow" />
            {/* Product Price at the bottom */}
            <div className="font-bold text-2xl mb-4 text-green-600">{product.price?.toLocaleString()} تومان</div>
            {/* Add to Cart Button at the bottom */}
            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded-lg transition-colors mt-2" onClick={addToCart}>
              افزودن به سبد خرید
            </button>
          </div>
        </div>
      </div>
      <AddedToCartModal open={showAddedModal} onClose={() => setShowAddedModal(false)} />
    </main>
  );
} 