'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { useParams } from 'next/navigation';
import { useCallback } from 'react';
import LoginPromptModal from '../../../components/LoginPromptModal';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Success Modal Component
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
          <button
            onClick={onClose}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};

export default function ShopDetailPage() {
  const { shopId: userId } = useParams();
  const [shop, setShop] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [successModal, setSuccessModal] = useState<{ open: boolean; productName: string }>({ open: false, productName: '' });
  const [socials, setSocials] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [collectionModalOpen, setCollectionModalOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<any>(null);
  const [collectionProducts, setCollectionProducts] = useState<any[]>([]);
  const [collectionProductsLoading, setCollectionProductsLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const [followersCount, setFollowersCount] = useState<number>(0);

  useEffect(() => {
    // Set loading title
    document.title = 'در حال بارگذاری فروشگاه | ویپانا بزرگترین مرکز خرید ایران';
    
    const fetchShop = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch shop info by user_id
        const { data, error } = await supabase
          .from('sellers')
          .select('*')
          .eq('user_id', userId)
          .single();
        if (error || !data) throw error || new Error('Shop not found');
        setShop(data);
        
        // Update page title with shop name
        document.title = `${data.name} | ویپانا بزرگترین مرکز خرید ایران`;
        
        console.log('Shop data:', data);
        console.log('Shop user_id:', data.user_id);
        console.log('Shop id:', data.id);
        console.log('Shop name:', data.name);

        // Fetch products for this seller
        const { data: productsData } = await supabase
          .from('products')
          .select('*')
          .eq('user_id', data.user_id);
        setProducts(productsData || []);

        // Fetch collections for this seller
        const { data: collectionsData } = await supabase
          .from('collections')
          .select('*')
          .eq('user_id', data.user_id)
          .order('created_at', { ascending: false });
        setCollections(collectionsData || []);

        // Fetch recent posts for this seller
        console.log('Fetching posts for user_id:', data.user_id);
        
        // Get posts for this specific seller using user_id
        let { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select('*')
          .eq('user_id', data.user_id)
          .order('id', { ascending: false })
          .limit(6);
        
        console.log('Fetching posts for user_id:', data.user_id);
        if (postsError) {
          console.error('Error fetching posts by user_id:', postsError);
        } else {
          console.log('Posts found by user_id:', postsData?.length || 0);
        }
        
        // If no posts found for this seller, let's get all posts to see what's available
        if (!postsData || postsData.length === 0) {
          console.log('No posts found for user_id:', data.user_id, '- fetching all posts...');
          
          // First, let's check if the posts table exists and has any data
          const { data: allPostsData, error: allPostsError } = await supabase
            .from('posts')
            .select('*')
            .order('id', { ascending: false })
            .limit(10);
          
          if (!allPostsError && allPostsData && allPostsData.length > 0) {
            console.log('Found posts in database:', allPostsData.length);
            console.log('Available user_ids:', [...new Set(allPostsData.map(p => p.user_id))]);
            console.log('Shop user_id:', data.user_id);
            console.log('Sample posts:', allPostsData.slice(0, 3));
            
            // Check if any posts match the shop's user_id (case insensitive)
            const matchingPosts = allPostsData.filter(post => 
              post.user_id && post.user_id.toLowerCase() === data.user_id.toLowerCase()
            );
            console.log('Matching posts (case insensitive):', matchingPosts.length);
            
            // Show all posts for debugging
            postsData = allPostsData;
          } else {
            console.log('No posts found in database at all');
            console.log('Posts error:', allPostsError);
            
            // Let's also check if there are any other tables that might contain posts
            console.log('Checking for alternative post tables...');
            const { data: tableList, error: tableError } = await supabase
              .from('information_schema.tables')
              .select('table_name')
              .eq('table_schema', 'public');
            
            if (!tableError && tableList) {
              console.log('Available tables:', tableList.map(t => t.table_name));
            }
          }
        }
        
        if (postsError) {
          console.error('Error fetching posts:', postsError);
        } else {
          console.log('Posts found:', postsData?.length || 0);
          console.log('Posts data:', postsData);
        }
        

        
        setRecentPosts(postsData || []);
      } catch (err: any) {
        setError(err.message || 'خطا در دریافت اطلاعات فروشگاه');
        document.title = 'فروشگاه یافت نشد | ویپانا بزرگترین مرکز خرید ایران';
      } finally {
        setLoading(false);
      }
    };
    fetchShop();
  }, [userId]);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
      if (user && shop) {
        // Check if already following
        const { data: followData } = await supabase
          .from('follows')
          .select('*')
          .eq('user_id', user.id)
          .eq('seller_id', shop.user_id)
          .single();
        setIsFollowing(!!followData);
      }

      // Fetch followers count for this shop
      if (shop?.user_id) {
        const { count } = await supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('seller_id', shop.user_id);
        setFollowersCount(count || 0);
      }
    };
    getCurrentUser();
  }, [shop]);

  // Open collection modal and fetch its products
  const openCollectionModal = async (collection: any) => {
    setSelectedCollection(collection);
    setCollectionModalOpen(true);
    setCollectionProductsLoading(true);
    setCollectionProducts([]);
    
    try {
      // Fetch products in this collection using the join table
      const { data: collectionProductsData, error } = await supabase
        .from('products_collections')
        .select(`
          product_id,
          products (
            id,
            name,
            price,
            main_image
          )
        `)
        .eq('collection_id', collection.id);
      
      if (error) throw new Error('خطا در دریافت محصولات کلکسیون');
      
      // Extract the products from the join result
      const products = (collectionProductsData || [])
        .map((item: any) => item.products)
        .filter(Boolean);
      
      setCollectionProducts(products);
    } catch (err: any) {
      console.error('Error fetching collection products:', err);
    } finally {
      setCollectionProductsLoading(false);
    }
  };

  const closeCollectionModal = () => {
    setCollectionModalOpen(false);
    setSelectedCollection(null);
    setCollectionProducts([]);
  };

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

  const addToCart = (product: any) => {
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
    setSuccessModal({ open: true, productName: product.name });
    setTimeout(() => setSuccessModal({ open: false, productName: '' }), 2000);
  };

  const handleFollow = async () => {
    if (!currentUserId) {
      setLoginPromptOpen(true);
      return;
    }
    if (!shop) return;
    
    try {
      if (isFollowing) {
        // Unfollow: Delete from follows table
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('user_id', currentUserId)
          .eq('seller_id', shop.user_id);

        if (error) {
          console.error('Error unfollowing seller:', error);
          return;
        }

        console.log('Successfully unfollowed:', { 
          user_id: currentUserId, 
          seller_id: shop.user_id,
          shop_id: shop.id 
        });
        setIsFollowing(false);
        setFollowersCount(prev => Math.max(prev - 1, 0));
      } else {
        // Follow: Insert into follows table
        const { error } = await supabase
          .from('follows')
          .insert({
            user_id: currentUserId,
            seller_id: shop.user_id
          });

        if (error) {
          console.error('Error following seller:', error);
          return;
        }

        console.log('Successfully followed:', { 
          user_id: currentUserId, 
          seller_id: shop.user_id,
          shop_id: shop.id 
        });
        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error handling follow/unfollow:', error);
    }
  };

  // Social media icons
  const socialMediaIcons: Record<string, React.ReactNode> = {
    Instagram: (
      <svg className="w-6 h-6 text-pink-500" fill="currentColor" viewBox="0 0 24 24"><path d="M7.75 2A5.75 5.75 0 0 0 2 7.75v8.5A5.75 5.75 0 0 0 7.75 22h8.5A5.75 5.75 0 0 0 22 16.25v-8.5A5.75 5.75 0 0 0 16.25 2h-8.5zm0 1.5h8.5A4.25 4.25 0 0 1 20.5 7.75v8.5A4.25 4.25 0 0 1 16.25 20.5h-8.5A4.25 4.25 0 0 1 3.5 16.25v-8.5A4.25 4.25 0 0 1 7.75 3.5zm8.25 2a1 1 0 1 0 0 2 1 1 0 0 0 0-2zM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 1.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7z" /></svg>
    ),
    Telegram: (
      <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M21.944 4.667a1.5 1.5 0 0 0-1.7-.217L3.7 12.25a1.5 1.5 0 0 0 .1 2.75l3.7 1.5 1.5 3.7a1.5 1.5 0 0 0 2.75.1l7.8-16.544a1.5 1.5 0 0 0-.106-1.589z" /></svg>
    ),
    WhatsApp: (
      <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 0-8.94 14.19l-1.06 3.88a1 1 0 0 0 1.22 1.22l3.88-1.06A10 10 0 1 0 12 2zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm4.29-5.71a1 1 0 0 0-1.42 0l-.88.88a7.07 7.07 0 0 1-3.29-3.29l.88-.88a1 1 0 0 0 0-1.42l-2-2a1 1 0 0 0-1.42 0A5.94 5.94 0 0 0 6 12a6 6 0 0 0 6 6 5.94 5.94 0 0 0 3.41-1.29 1 1 0 0 0 0-1.42z" /></svg>
    ),
    LinkedIn: (
      <svg className="w-6 h-6 text-blue-700" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.28c-.97 0-1.75-.79-1.75-1.75s.78-1.75 1.75-1.75 1.75.79 1.75 1.75-.78 1.75-1.75 1.75zm13.5 11.28h-3v-5.5c0-1.1-.9-2-2-2s-2 .9-2 2v5.5h-3v-10h3v1.5c.41-.59 1.19-1.5 2.5-1.5 1.93 0 3.5 1.57 3.5 3.5v6.5z" /></svg>
    ),
    Twitter: (
      <svg className="w-6 h-6 text-sky-400" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557a9.93 9.93 0 0 1-2.828.775 4.932 4.932 0 0 0 2.165-2.724c-.951.564-2.005.974-3.127 1.195a4.92 4.92 0 0 0-8.384 4.482C7.691 8.095 4.066 6.13 1.64 3.161c-.542.929-.856 2.01-.857 3.17 0 2.188 1.115 4.117 2.823 5.254a4.904 4.904 0 0 1-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.936 4.936 0 0 1-2.224.084c.627 1.956 2.444 3.377 4.6 3.417A9.867 9.867 0 0 1 0 21.543a13.94 13.94 0 0 0 7.548 2.209c9.057 0 14.009-7.496 14.009-13.986 0-.213-.005-.425-.014-.636A10.012 10.012 0 0 0 24 4.557z" /></svg>
    ),
    Facebook: (
      <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.326 24h11.495v-9.294H9.691v-3.622h3.13V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0"/></svg>
    ),
    YouTube: (
      <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a2.994 2.994 0 0 0-2.112-2.112C19.458 3.5 12 3.5 12 3.5s-7.458 0-9.386.574A2.994 2.994 0 0 0 .502 6.186C0 8.114 0 12 0 12s0 3.886.502 5.814a2.994 2.994 0 0 0 2.112 2.112C4.542 20.5 12 20.5 12 20.5s7.458 0 9.386-.574a2.994 2.994 0 0 0 2.112-2.112C24 15.886 24 12 24 12s0-3.886-.502-5.814zM9.75 15.5v-7l6.5 3.5-6.5 3.5z"/></svg>
    ),
    Aparat: (
      <svg className="w-6 h-6 text-rose-500" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="4" fill="#fff" /><circle cx="12" cy="12" r="2" /><rect x="11" y="6" width="2" height="2" /><rect x="11" y="16" width="2" height="2" /><rect x="6" y="11" width="2" height="2" /><rect x="16" y="11" width="2" height="2" /></svg>
    ),
    Other: (
      <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 8h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2" /><rect x="7" y="4" width="10" height="4" rx="2" /></svg>
    ),
  };

  useEffect(() => {
    if (shop && shop.user_id) {
      supabase
        .from('socials')
        .select('*')
        .eq('user_id', shop.user_id)
        .then(({ data, error }) => {
          if (!error && data) setSocials(data);
        });
    }
  }, [shop]);

  if (loading) return <div className="text-center py-12">در حال بارگذاری...</div>;
  if (error || !shop) {
    return (
      <main className="min-h-screen p-4 sm:p-6 bg-gray-50/50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">فروشگاه یافت نشد</h1>
          <p className="text-gray-600 mt-2">{error || 'این فروشگاه در سیستم وجود ندارد.'}</p>
          <Link href="/shops">
            <div className="mt-4 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 cursor-pointer">
              بازگشت به لیست فروشگاه‌ها
            </div>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50/50">
        <div className="max-w mx-auto p-4 sm:p-6">
          <div className="bg-white rounded-3xl shadow-2xl p-10 mb-8 flex flex-col items-center max-w mx-auto border border-gray-100">
            {/* پروفایل با حلقه گرادینت */}
            <div className="relative mb-4">
              <div className="w-36 h-36 rounded-full bg-gradient-to-tr from-purple-400 via-pink-300 to-blue-400 p-1">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                  {shop.profile_image ? (
                    <Image src={shop.profile_image} alt={shop.name} fill className="object-cover w-36 h-36 rounded-full" />
                  ) : (
                    <div className="w-24 h-24 bg-gray-200 flex items-center justify-center text-gray-400 text-4xl">?</div>
                  )}
                </div>
              </div>
            </div>

            {/* نام فروشگاه */}
            <h1 className="text-4xl font-extrabold text-gray-800 mb-2 text-center">{shop.name}</h1>

            {/* تعداد محصولات و دنبال‌کننده */}
            <div className="flex flex-col items-center justify-center mb-4 bg-gray-50 rounded-xl px-4 py-2 shadow-inner w-full max-w-xs mx-auto">
              <div className="flex flex-row items-center justify-center gap-8 mb-1 w-full text-center">
                <div className="flex flex-col items-center justify-center text-purple-700 font-semibold w-full text-center">
                  <svg className="w-6 h-6 mb-1 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><circle cx="17.5" cy="17.5" r="3.5"/><line x1="20" y1="20" x2="23" y2="23" strokeWidth="2" strokeLinecap="round"/></svg>
                  <span className="text-base sm:text-lg mx-auto">{products.length}</span>
                </div>
                <div className="flex flex-col items-center justify-center text-pink-600 font-semibold w-full text-center">
                  <svg className="w-6 h-6 mb-1 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  <span className="text-base sm:text-lg mx-auto">{followersCount}</span>
                </div>
              </div>
              <div className="flex flex-row items-center justify-center gap-8 w-full text-center">
                <span className="text-xs sm:text-base text-purple-700 font-semibold w-full text-center">محصول</span>
                <span className="text-xs sm:text-base text-pink-600 font-semibold w-full text-center">دنبال‌کننده</span>
              </div>
            </div>

            {/* خط جداکننده */}
            <div className="w-24 h-0.5 bg-gradient-to-r from-purple-300 via-gray-200 to-pink-300 my-4" />

            {/* توضیحات */}
            <p className="text-gray-600 text-lg text-center leading-relaxed mb-4">{shop.description}</p>

            {/* صاحب فروشگاه */}
            <div className="text-gray-500 text-base mb-1">
              <span className="font-bold">صاحب فروشگاه:</span> {shop.holder_name} {shop.holder_surname}
            </div>
            {/* تاریخ تاسیس */}
            <div className="text-gray-400 text-xs mb-4">
              تاریخ تاسیس فروشگاه: {shop.created_at ? new Date(shop.created_at).toLocaleDateString('fa-IR') : '-'}
            </div>

            {/* شبکه‌های اجتماعی */}
            {socials.length > 0 && (
              <div className="flex flex-col items-center w-full">
                <div className="flex gap-4 mt-2 mb-4">
                  {socials.map((item) => (
                    <a
                      key={item.id}
                      href={item.social_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={item.social_type}
                      className="transition-transform hover:scale-110"
                    >
                      {socialMediaIcons[item.social_type] || socialMediaIcons.Other}
                    </a>
                  ))}
                </div>
                <button
                  className={`w-full sm:w-auto font-bold py-2 px-6 rounded-lg transition-colors mt-2 ${
                    isFollowing 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                  onClick={handleFollow}
                >
                  {isFollowing ? 'لغو دنبال کردن' : 'دنبال کنید'}
                </button>
              </div>
            )}
          </div>
          {collections.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">کلکسیون‌های فروشگاه</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {collections.map(collection => (
                  <div key={collection.id} className="bg-white rounded-2xl shadow-md p-4 flex flex-col items-center">
                    <div className="w-40 h-40 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center mb-4">
                      {collection.image_url ? (
                        <Image
                          src={collection.image_url}
                          alt={collection.name}
                          width={160}
                          height={160}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-3xl">?</div>
                      )}
                    </div>
                    <h3 className="font-bold text-lg text-center text-gray-800 mb-2">{collection.name}</h3>
                    {collection.description && (
                      <p className="text-gray-600 text-sm text-center mb-4 line-clamp-2">{collection.description}</p>
                    )}
                    <button 
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded-lg transition-colors"
                      onClick={() => openCollectionModal(collection)}
                    >
                      مشاهده کلکسیون
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {recentPosts.length > 0 && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  پست‌های اخیر
                  {recentPosts.some(post => post.user_id !== shop.user_id) && (
                    <span className="text-sm text-gray-500 font-normal ml-2">(نمایش همه پست‌ها)</span>
                  )}
                </h2>
                <Link href={`/ads?seller=${shop.user_id}`}>
                  <div className="text-purple-600 hover:text-purple-700 font-semibold text-sm cursor-pointer">
                    مشاهده همه پست‌ها →
                  </div>
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {recentPosts.map(post => (
                  <div key={post.id} className="bg-white rounded-2xl shadow-md p-4 flex flex-col hover:shadow-lg transition-shadow">
                    {post.media_url && (
                      <div className="w-full h-48 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center mb-4">
                        <Image
                          src={post.media_url}
                          alt="Post media"
                          width={300}
                          height={200}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-gray-700 text-sm leading-relaxed mb-3 line-clamp-3">
                        {post.content}
                      </p>
                      <div className="text-xs text-gray-400 text-left">
                        {post.created_at ? new Date(post.created_at).toLocaleDateString('fa-IR') : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {recentPosts.length === 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">پست‌های اخیر</h2>
              <div className="bg-white rounded-2xl shadow-md p-8 text-center">
                <div className="text-gray-400 text-6xl mb-4">📝</div>
                <p className="text-gray-600 text-lg">هنوز پستی منتشر نشده است</p>
                <p className="text-gray-400 text-sm mt-2">این فروشگاه هنوز محتوایی منتشر نکرده است</p>
                <div className="mt-4 p-4 bg-gray-100 rounded-lg text-left">
                  <p className="text-sm text-gray-600 mb-2">Debug Info:</p>
                  <p className="text-xs text-gray-500">Shop user_id: {shop?.user_id || 'N/A'}</p>
                  <p className="text-xs text-gray-500">Shop ID (user_id): {userId}</p>
                  <p className="text-xs text-gray-500">Check browser console for more details</p>
                  <div className="mt-2">
                    <Link href="/ads">
                      <div className="text-blue-600 hover:text-blue-700 text-xs cursor-pointer">
                        ← مشاهده همه پست‌ها در صفحه تبلیغات
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
          {products.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">محصولات فروشگاه</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map(product => (
                  <div key={product.id} className="bg-white rounded-2xl shadow-md p-4 flex flex-col items-center">
                    <Link href={`/products/${product.id}`} className="w-full flex flex-col items-center hover:shadow-lg transition mb-2">
                      <div className="w-40 h-40 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center mb-4">
                        {product.main_image ? (
                          <Image
                            src={product.main_image}
                            alt={product.name}
                            width={160}
                            height={160}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-3xl">?</div>
                        )}
                      </div>
                      <h3 className="font-bold text-lg text-center text-gray-800 mb-2">{product.name}</h3>
                      <p className="text-green-600 font-bold text-center mb-4">{product.price?.toLocaleString()} تومان</p>
                    </Link>
                    <button
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded-lg transition-colors"
                      onClick={() => addToCart(product)}
                    >
                      افزودن به سبد خرید
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Collection Products Modal */}
          {collectionModalOpen && (
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={closeCollectionModal}>
              <div className="bg-white rounded-lg shadow-xl p-8 max-w-4xl w-full text-center relative" onClick={e => e.stopPropagation()}>
                <button className="absolute top-2 left-2 text-gray-500 hover:text-gray-700" onClick={closeCollectionModal}>&times;</button>
                <h2 className="text-xl font-bold mb-4">محصولات کلکسیون "{selectedCollection?.name}"</h2>
                {collectionProductsLoading ? (
                  <div className="text-gray-500">در حال دریافت محصولات...</div>
                ) : collectionProducts.length === 0 ? (
                  <div className="text-gray-400">محصولی در این کلکسیون وجود ندارد.</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
                    {collectionProducts.map(product => (
                      <div key={product.id} className="bg-white rounded-xl shadow-md p-4 flex flex-col items-center border">
                        <Link href={`/products/${product.id}`} className="w-full flex flex-col items-center hover:shadow-lg transition mb-2">
                          <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center mb-3">
                            {product.main_image ? (
                              <Image
                                src={product.main_image}
                                alt={product.name}
                                width={128}
                                height={128}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">?</div>
                            )}
                          </div>
                          <h3 className="font-bold text-base text-center text-gray-800 mb-2">{product.name}</h3>
                          <p className="text-green-600 font-bold text-center mb-3">{product.price?.toLocaleString()} تومان</p>
                        </Link>
                        <button
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded-lg transition-colors text-sm"
                          onClick={() => addToCart(product)}
                        >
                          افزودن به سبد خرید
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          <SuccessModal
            isOpen={successModal.open}
            onClose={() => setSuccessModal({ open: false, productName: '' })}
            productName={successModal.productName}
          />
          <LoginPromptModal 
            open={loginPromptOpen} 
            onClose={() => setLoginPromptOpen(false)} 
            message="برای دنبال کردن فروشگاه ابتدا وارد حساب کاربری خود شوید." 
          />
        </div>
      </main>
  );
} 