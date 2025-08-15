'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import LoginPromptModal from './LoginPromptModal';
import Link from 'next/link';

interface Product {
  id: number;
  name: string;
  price: number;
  main_image: string;
  category_id: number;
  user_id: string;
  created_at: string;
  categories?: { name: string } | null;
}

interface CartItem {
  product: Product;
  quantity: number;
}

const SuccessModal = ({ isOpen, onClose, productName }: { isOpen: boolean; onClose: () => void; productName: string }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-md rounded-lg shadow-xl max-w-xs w-full p-6 border border-white/20 text-center">
        <div className="flex flex-col items-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-green-700 mb-2">با موفقیت افزوده شد!</h3>
          <p className="text-gray-700 mb-4">محصول <span className="font-semibold">"{productName}"</span> به سبد خرید اضافه شد.</p>
          <button onClick={onClose} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors">بستن</button>
        </div>
      </div>
    </div>
  );
};

export default function ProductsHome() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [successModal, setSuccessModal] = useState<{ open: boolean; productName: string }>({ open: false, productName: '' });
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const [favoriting, setFavoriting] = useState<Set<number>>(new Set());
  const [favoritesLoading, setFavoritesLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Create Supabase client
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseKey) {
          console.error('Supabase environment variables are not configured');
          setError('خطای پیکربندی سرور');
          setLoading(false);
          return;
        }
        
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // First, load user and favorites
        setFavoritesLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        console.log('Current user:', user?.id);
        
        if (user) {
          setCurrentUserId(user.id);
          const { data, error } = await supabase
            .from('favorites')
            .select('product_id')
            .eq('user_id', user.id);
          
          if (error) {
            console.error('Error loading favorites:', error);
          } else {
            const ids = new Set<number>((data || []).map((r: any) => Number(r.product_id)));
            console.log('Loaded favorites:', Array.from(ids));
            console.log('Setting favoriteIds to:', Array.from(ids));
            setFavoriteIds(ids);
            
            // Force a re-render after setting favorites
            setTimeout(() => {
              console.log('Favorites loaded, forcing re-render');
              setFavoriteIds(new Set(ids)); // Force re-render
            }, 100);
          }
        } else {
          console.log('No user logged in');
        }
      } catch (error) {
        console.error('Error in favorites loading:', error);
      } finally {
        setFavoritesLoading(false);
      }
    };

    // Load favorites first, then other data
    loadData().then(() => {
      fetchProducts();
      fetchCategories();
      loadCartFromStorage();
    });
  }, []);

  const loadCartFromStorage = () => {
    try {
      const savedCart = localStorage.getItem('vipana-cart');
      if (savedCart) setCart(JSON.parse(savedCart));
    } catch {}
  };

  const saveCartToStorage = (newCart: CartItem[]) => {
    try {
      localStorage.setItem('vipana-cart', JSON.stringify(newCart));
    } catch {}
  };

  const fetchProducts = async () => {
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
      const { data, error } = await supabase
        .from('products')
        .select(`id, name, price, main_image, category_id, user_id, created_at, categories(name)`) 
        .order('created_at', { ascending: false });
      if (error) throw new Error('خطا در دریافت محصولات');
      const transformed: Product[] = (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        main_image: item.main_image,
        category_id: item.category_id,
        user_id: item.user_id,
        created_at: item.created_at,
        categories: item.categories ? { name: item.categories.name } : null,
      }));
      setProducts(transformed);
    } catch (e: any) {
      setError(e.message || 'خطا در دریافت محصولات');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      // Create Supabase client
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data } = await supabase.from('categories').select('id, name');
        setCategories(data || []);
      }
    } catch {}
  };

  const filteredAndSorted = products
    .filter((p) => {
      const s = searchTerm.toLowerCase();
      const matchesSearch = p.name.toLowerCase().includes(s);
      const matchesCategory = !selectedCategory || p.categories?.name === selectedCategory;
      const minV = minPrice ? Number(minPrice) : undefined;
      const maxV = maxPrice ? Number(maxPrice) : undefined;
      const matchesMin = minV === undefined || p.price >= minV;
      const matchesMax = maxV === undefined || p.price <= maxV;
      return matchesSearch && matchesCategory && matchesMin && matchesMax;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        default:
          return 0;
      }
    });

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      const updated = existing
        ? prev.map((i) => (i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i))
        : [...prev, { product, quantity: 1 }];
      saveCartToStorage(updated);
      return updated;
    });
    setSuccessModal({ open: true, productName: product.name });
    setTimeout(() => setSuccessModal({ open: false, productName: '' }), 2500);
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => {
      const updated = prev.filter((i) => i.product.id !== productId);
      saveCartToStorage(updated);
      return updated;
    });
  };

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) return removeFromCart(productId);
    setCart((prev) => {
      const updated = prev.map((i) => (i.product.id === productId ? { ...i, quantity: newQuantity } : i));
      saveCartToStorage(updated);
      return updated;
    });
  };

  const getCartTotal = () => cart.reduce((t, i) => t + i.product.price * i.quantity, 0);

  const toggleFavorite = async (productId: number) => {
    if (!currentUserId) {
      setLoginPromptOpen(true);
      return;
    }
    try {
      // Create Supabase client
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        console.error('Supabase environment variables are not configured');
        return;
      }
      
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      if (favoriting.has(productId)) return;
      setFavoriting(prev => new Set(prev).add(productId));
      const shouldFavorite = !favoriteIds.has(productId);
      console.log(`Toggling favorite for product ${productId}, shouldFavorite: ${shouldFavorite}`);
      
      if (shouldFavorite) {
        // Check if the record already exists before inserting
        const { data: existingRecord } = await supabase
          .from('favorites')
          .select('id')
          .eq('user_id', currentUserId)
          .eq('product_id', productId.toString())
          .single();
        
        if (existingRecord) {
          console.log(`Favorite record already exists for product ${productId}, skipping insert`);
          // Record already exists, just update the UI
          setFavoriteIds(prev => {
            const next = new Set(prev);
            next.add(productId);
            console.log('Updated favoriteIds (record already existed):', Array.from(next));
            return next;
          });
        } else {
          // Record doesn't exist, insert it
          console.log(`Inserting new favorite record for product ${productId}`);
          const { error } = await supabase
            .from('favorites')
            .insert({ user_id: currentUserId, product_id: productId.toString() });
          if (error) throw error;
          
          // Optimistic UI update
          setFavoriteIds(prev => {
            const next = new Set(prev);
            next.add(productId);
            console.log('Updated favoriteIds (new record):', Array.from(next));
            return next;
          });
        }
      } else {
        // Remove from favorites
        console.log(`Removing favorite record for product ${productId}`);
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', currentUserId)
          .eq('product_id', productId.toString());
        if (error) throw error;
        
        // Optimistic UI update
        setFavoriteIds(prev => {
          const next = new Set(prev);
          next.delete(productId);
          console.log('Updated favoriteIds (removed):', Array.from(next));
          return next;
        });
      }
    } catch (e) {
      // Revert on error
      setFavoriteIds(prev => {
        const next = new Set(prev);
        if (next.has(productId)) next.delete(productId); else next.add(productId);
        return next;
      });
      console.error('Favorite toggle failed:', e);
    } finally {
      setFavoriting(prev => { const next = new Set(prev); next.delete(productId); return next; });
    }
  };

  if (loading || favoritesLoading) {
    return (
      <main className="min-h-screen p-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-center text-purple-700 mb-8">فروشگاه محصولات</h1>
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">در حال بارگذاری محصولات...</div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 bg-gray-50 overflow-x-hidden">
      <div className="w-full mx-auto px-2 overflow-x-hidden">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-purple-700 text-center">فروشگاه محصولات</h1>
        </div>

        {/* Advanced Search / Filters */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm mb-1 text-gray-600">جستجو</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="جستجو بر اساس نام محصول..."
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm mb-1 text-gray-600">دسته‌بندی</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">همه دسته‌ها</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm mb-1 text-gray-600">حداقل قیمت</label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-600">حداکثر قیمت</label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm mb-1 text-gray-600">مرتب‌سازی</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">بدون مرتب‌سازی</option>
                <option value="price-asc">ارزان‌ترین</option>
                <option value="price-desc">گران‌ترین</option>
                <option value="newest">جدیدترین</option>
                <option value="oldest">قدیمی‌ترین</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3 justify-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
                setSortBy('');
                setMinPrice('');
                setMaxPrice('');
              }}
              className="px-4 py-2 rounded-lg border text-sm hover:bg-gray-50"
            >
              پاک کردن فیلترها
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 text-center">{error}</div>
        )}

        {cart.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-4 mb-8">
            <h2 className="text-lg font-bold text-gray-800 mb-4 text-center">سبد خرید</h2>
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.product.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg w-full">
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-12 overflow-hidden rounded-lg">
                      {item.product.main_image ? (
                        <img src={item.product.main_image} alt={item.product.name} className="w-full h-full object-cover max-w-full" />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">بدون تصویر</div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 text-sm break-words max-w-[120px]">{item.product.name}</h3>
                      <p className="text-green-600 font-semibold text-xs">{item.product.price.toLocaleString()} تومان</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="w-7 h-7 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-lg max-w-full">-</button>
                    <span className="w-6 text-center font-semibold text-base">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="w-7 h-7 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-lg max-w-full">+</button>
                    <button onClick={() => removeFromCart(item.product.id)} className="text-red-500 hover:text-red-700 text-xs ml-2 max-w-full">حذف</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-2 border-t border-gray-200 flex justify-between items-center">
              <div className="text-base font-bold text-gray-800">مجموع کل: {getCartTotal().toLocaleString()} تومان</div>
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold text-sm max-w-full">تکمیل خرید</button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full overflow-x-hidden">
          {filteredAndSorted.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-4">{searchTerm || selectedCategory ? 'محصولی با این فیلترها یافت نشد' : 'هنوز محصولی در فروشگاه وجود ندارد'}</div>
              {(searchTerm || selectedCategory) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('');
                    setSortBy('');
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition"
                >
                  پاک کردن فیلترها
                </button>
              )}
            </div>
          ) : (
            filteredAndSorted.map((product) => {
              const isFavorited = favoriteIds.has(product.id);
              console.log(`Rendering product ${product.id} (${product.name}) - isFavorited: ${isFavorited}, favoriteIds: [${Array.from(favoriteIds)}]`);
              if (isFavorited) {
                console.log(`✅ Product ${product.id} (${product.name}) is favorited - should show RED heart`);
              } else {
                console.log(`❌ Product ${product.id} (${product.name}) is NOT favorited - should show gray heart`);
              }
              return (
              <div key={`${product.id}-${favoritesLoading}-${isFavorited}`} className="relative bg-white rounded-xl shadow p-4 flex flex-col items-center w-full overflow-x-hidden mb-4 sm:mb-0 sm:shadow-lg sm:hover:shadow-xl sm:transition-shadow">
                <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
                                     <button
                     type="button"
                     aria-label="favorite"
                     className={`p-1.5 rounded-full transition-all duration-200 hover:scale-105 ${
                       favoriteIds.has(product.id) 
                         ? 'bg-red-500 shadow-xl ring-2 ring-red-600 text-white scale-110 animate-pulse' 
                         : 'bg-white shadow ring-1 ring-gray-200 text-gray-500 hover:text-red-500 hover:ring-red-200'
                     }`}
                     onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                     onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(product.id); }}
                   >
                     {favoriteIds.has(product.id) ? (
                       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                         <path d="M11.995 21.35l-.855-.76C6.54 16.16 3.5 13.3 3.5 9.5 3.5 7.015 5.515 5 8 5c1.54 0 3.04.7 3.995 1.82C12.95 5.7 14.45 5 15.99 5c2.485 0 4.5 2.015 4.5 4.5 0 3.8-3.04 6.66-7.64 11.09l-.855.76z" />
                       </svg>
                     ) : (
                       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                       </svg>
                     )}
                   </button>
                  <button
                    type="button"
                    aria-label="share"
                    className="p-1.5 rounded-full bg-white shadow ring-1 ring-gray-200 text-gray-600 hover:text-purple-600"
                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      try {
                        const url = `${window.location.origin}/products/${product.id}`;
                        if (navigator.share) {
                          navigator.share({ title: product.name, url });
                        } else if (navigator.clipboard) {
                          navigator.clipboard.writeText(url);
                        }
                      } catch {}
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 010 5.656l-1.414 1.414a4 4 0 01-5.656 0l-1.414-1.414a4 4 0 010-5.656l1.086-1.086" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.172 13.828a4 4 0 010-5.656l1.414-1.414a4 4 0 015.656 0l1.414 1.414a4 4 0 010 5.656l-1.086 1.086" />
                    </svg>
                  </button>
                </div>
                <Link href={`/products/${product.id}`} className="w-full flex flex-col items-center hover:opacity-95 transition mb-2">
                  <div className="w-32 h-32 mb-3 flex items-center justify-center bg-gray-50 rounded-lg shadow sm:w-40 sm:h-40 sm:mb-4">
                    {product.main_image ? (
                      <img src={product.main_image} alt={product.name} className="w-full h-full object-cover rounded-lg sm:rounded-xl" />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs rounded-lg sm:rounded-xl">بدون تصویر</div>
                    )}
                  </div>
                  <h2 className="font-bold text-base mb-1 text-center w-full break-words sm:text-lg sm:mb-2">{product.name}</h2>
                  <div className="text-green-700 font-bold text-center w-full text-base sm:text-lg">{product.price.toLocaleString()} تومان</div>
                </Link>
                                 <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition mt-3 font-bold text-base w-full sm:w-full sm:mt-1" onClick={() => addToCart(product)}>
                   افزودن به سبد خرید
                 </button>
               </div>
             );
           })
          )}
        </div>
      </div>
      <SuccessModal isOpen={successModal.open} onClose={() => setSuccessModal({ open: false, productName: '' })} productName={successModal.productName} />
    </main>
  );
}


