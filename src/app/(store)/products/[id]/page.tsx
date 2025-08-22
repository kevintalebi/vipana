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

// Review Modal Component
const ReviewModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  loading 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSubmit: (rating: number, comment: string) => void;
  loading: boolean;
}) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(rating, comment);
  };

  const handleClose = () => {
    setRating(5);
    setComment('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={handleClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">نظر خود را ثبت کنید</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2 font-semibold text-gray-700">امتیاز</label>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-2xl ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                >
                  ★
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500 text-center mt-1">{rating} از 5 ستاره</p>
          </div>
          <div>
            <label className="block mb-2 font-semibold text-gray-700">نظر شما</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
              rows={4}
              placeholder="تجربه خود از این محصول را به اشتراک بگذارید..."
              required
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'در حال ثبت...' : 'ثبت نظر'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

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
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [userReview, setUserReview] = useState<any>(null);

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
        
                 // Get current user
         const { data: { user } } = await supabase.auth.getUser();
         setCurrentUser(user);
         
         // Get current user's profile data if user exists
         let currentUserProfile = null;
         if (user) {
           const { data: profileData } = await supabase
             .from('buyers')
             .select('name, image_url')
             .eq('user_id', user.id)
             .single();
           currentUserProfile = profileData;
         }
         setCurrentUser({ ...user, profile: currentUserProfile });
        
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

                 // Fetch reviews
         const { data: reviewsData } = await supabase
           .from('reviews')
           .select(`
             *,
             users (
               email,
               mobile,
               first_name,
               last_name
             )
           `)
           .eq('product_id', id)
           .order('created_at', { ascending: false });
         setReviews(reviewsData || []);

                 // Check if current user has purchased this product
         if (user) {
           // First, let's check all orders for this user and product without status filter
           const { data: allOrderData, error: allOrderError } = await supabase
             .from('orders')
             .select('*')
             .eq('buyer_id', user.id)
             .eq('product_id', id);
           
           console.log('All orders query result:', { allOrderData, allOrderError, userId: user.id, productId: id });
           
           // Then check with status filter
           const { data: completedOrderData, error: completedOrderError } = await supabase
             .from('orders')
             .select('*')
             .eq('buyer_id', user.id)
             .eq('product_id', id)
             .eq('status', 'completed');
           
           console.log('Completed orders query result:', { completedOrderData, completedOrderError, userId: user.id, productId: id });
           
           // Check if any order exists (considering any status for now)
           const hasAnyOrder = !!(allOrderData && allOrderData.length > 0);
           const hasCompletedOrder = !!(completedOrderData && completedOrderData.length > 0);
           
           console.log('Purchase detection:', { hasAnyOrder, hasCompletedOrder });
           
           // For now, consider any order as a purchase (we can refine this later)
           setHasPurchased(hasAnyOrder);

           // Check if user has already reviewed this product
           const { data: userReviewData } = await supabase
             .from('reviews')
             .select('*')
             .eq('user_id', user.id)
             .eq('product_id', id)
             .single();
           
           setUserReview(userReviewData);
         }
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

  const handleSubmitReview = async (rating: number, comment: string) => {
    if (!currentUser || !product) return;

    setReviewLoading(true);
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('خطای پیکربندی سرور');
      }
      
      const supabase = createClient(supabaseUrl, supabaseKey);

             // Insert or update review
       const { data, error } = await supabase
         .from('reviews')
         .upsert({
           user_id: currentUser.id,
           product_id: product.id,
           stars: rating,
           content: comment,
           created_at: new Date().toISOString()
         })
         .select()
         .single();

      if (error) throw error;

             // Update reviews list
       const { data: updatedReviews } = await supabase
         .from('reviews')
         .select(`
           *,
           users (
             email,
             mobile,
             first_name,
             last_name
           )
         `)
         .eq('product_id', id)
         .order('created_at', { ascending: false });

      setReviews(updatedReviews || []);
      setUserReview(data);
      setShowReviewModal(false);
    } catch (err: any) {
      console.error('Error submitting review:', err);
      alert('خطا در ثبت نظر: ' + err.message);
    } finally {
      setReviewLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={`text-lg ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}>
            ★
          </span>
        ))}
      </div>
    );
  };

  if (loading) return <div className="text-center py-12">در حال بارگذاری...</div>;
  if (error || !product) return <div className="text-center text-red-500 py-12">{error || 'محصول یافت نشد'}</div>;

  return (
    <main className="min-h-screen bg-gray-100">
      {/* Original Product Section - Centered Layout */}
      <div className="flex items-center justify-center p-4 md:p-6">
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
      </div>

                {/* Reviews Section - Full Width Below */}
          <div className="max-w-7xl mx-auto p-4 md:p-6">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">نظرات و امتیازات</h2>
                {currentUser && hasPurchased && !userReview && (
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    ثبت نظر
                  </button>
                )}
              </div>

              

                     {/* Review Stats */}
           {reviews.length > 0 && (
             <div className="bg-gray-50 rounded-xl p-4 mb-6">
               <div className="flex items-center gap-4">
                 <div className="text-center">
                   <div className="text-3xl font-bold text-purple-600">
                     {(reviews.reduce((sum, review) => sum + review.stars, 0) / reviews.length).toFixed(1)}
                   </div>
                   <div className="text-sm text-gray-600">میانگین امتیاز</div>
                 </div>
                 <div className="flex-1">
                   <div className="text-lg font-semibold mb-2">{reviews.length} نظر</div>
                   {renderStars(reviews.reduce((sum, review) => sum + review.stars, 0) / reviews.length)}
                 </div>
               </div>
             </div>
           )}

                     {/* User's Review */}
           {userReview && (
             <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6">
               <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                     {/* User Profile Image */}
                     {currentUser?.profile?.image_url ? (
                       <Image 
                         src={currentUser.profile.image_url} 
                         alt="Profile" 
                         width={40} 
                         height={40} 
                         className="w-10 h-10 rounded-full object-cover"
                       />
                     ) : (
                       <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                         <span className="text-sm font-semibold text-purple-600">
                           {(currentUser?.profile?.name?.charAt(0) || currentUser?.email?.charAt(0) || 'U').toUpperCase()}
                         </span>
                       </div>
                     )}
                     {/* User Name */}
                     <div>
                       <h3 className="font-semibold text-purple-800">
                         {currentUser?.profile?.name || currentUser?.email || 'کاربر'}
                       </h3>
                       <p className="text-xs text-gray-500">نظر شما</p>
                     </div>
                   </div>
                 <button
                   onClick={() => setShowReviewModal(true)}
                   className="text-sm text-purple-600 hover:text-purple-700"
                 >
                   ویرایش
                 </button>
               </div>
               <div className="flex items-center gap-2 mb-2">
                 {renderStars(userReview.stars)}
                 <span className="text-sm text-gray-600">{userReview.stars} از 5</span>
               </div>
               <p className="text-gray-700">{userReview.content}</p>
               <div className="text-xs text-gray-500 mt-2">
                 {new Date(userReview.created_at).toLocaleDateString('fa-IR')}
               </div>
             </div>
           )}

          {/* Review Form for Purchased Products */}
          {currentUser && hasPurchased && !userReview && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
              <h3 className="font-semibold text-green-800 mb-4 text-center">شما این محصول را خریداری کرده‌اید. نظر خود را ثبت کنید:</h3>
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 font-semibold text-gray-700">امتیاز</label>
                  <div className="flex gap-2 justify-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setShowReviewModal(true)}
                        className="text-2xl text-yellow-400 hover:text-yellow-500"
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <div className="text-center">
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    ثبت نظر و امتیاز
                  </button>
                </div>
              </div>
            </div>
          )}

                     {/* All Reviews */}
           <div className="space-y-4">
             {reviews.length === 0 && !userReview ? (
               <div className="text-center py-8 text-gray-500">
                 <div className="text-4xl mb-2">💬</div>
                 <p>هنوز نظری برای این محصول ثبت نشده است</p>
                 {!currentUser && (
                   <p className="text-sm mt-2">برای ثبت نظر ابتدا وارد حساب کاربری خود شوید</p>
                 )}
               </div>
             ) : (
               reviews
                 .filter(review => !userReview || review.user_id !== userReview.user_id)
                 .map((review) => (
                  <div key={review.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                                             <div className="flex items-center gap-2">
                         <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                           <span className="text-sm font-semibold text-purple-600">
                             {(review.users?.first_name?.charAt(0) || review.users?.email?.charAt(0) || 'U').toUpperCase()}
                           </span>
                         </div>
                         <span className="font-semibold text-gray-800">
                           {review.users?.first_name && review.users?.last_name 
                             ? `${review.users.first_name} ${review.users.last_name}`
                             : review.users?.first_name 
                             ? review.users.first_name
                             : review.users?.email || 'کاربر'}
                         </span>
                       </div>
                      <div className="text-sm text-gray-500">
                        {new Date(review.created_at).toLocaleDateString('fa-IR')}
                      </div>
                    </div>
                                         <div className="flex items-center gap-2 mb-2">
                       {renderStars(review.stars)}
                       <span className="text-sm text-gray-600">{review.stars} از 5</span>
                     </div>
                     <p className="text-gray-700">{review.content}</p>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
      
      <AddedToCartModal open={showAddedModal} onClose={() => setShowAddedModal(false)} />
      <ReviewModal 
        isOpen={showReviewModal} 
        onClose={() => setShowReviewModal(false)} 
        onSubmit={handleSubmitReview}
        loading={reviewLoading}
      />
    </main>
  );
} 