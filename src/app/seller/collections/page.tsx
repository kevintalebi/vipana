'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const mockCollections: { id: number; name: string; description: string; image: File | null }[] = [
  { id: 1, name: 'کالای دیجیتال', description: 'مجموعه‌ای از بهترین محصولات دیجیتال', image: null },
  { id: 2, name: 'کتاب', description: 'کتاب‌های آموزشی و داستانی', image: null },
  { id: 3, name: 'لوازم جانبی', description: 'لوازم جانبی متنوع برای همه سلیقه‌ها', image: null },
];

export default function SellerCollectionsPage() {
  const [activeTab, setActiveTab] = useState<'create' | 'list'>('create');
  const [collectionName, setCollectionName] = useState('');
  const [collectionDescription, setCollectionDescription] = useState('');
  const [collectionImage, setCollectionImage] = useState<File | null>(null);
  const [collectionImagePreview, setCollectionImagePreview] = useState<string | null>(null);
  const [collections, setCollections] = useState<{ id: number; name: string; description: string; image_url?: string }[]>([]);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [collectionsLoading, setCollectionsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [modalMessage, setModalMessage] = useState('');
  const [productsModalOpen, setProductsModalOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<any>(null);
  const [sellerProducts, setSellerProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState('');
  const [productsInCollection, setProductsInCollection] = useState<number[]>([]); // product ids
  const [addingProductId, setAddingProductId] = useState<number | null>(null);
  const [removingProductId, setRemovingProductId] = useState<number | null>(null);

  // Modal component
  const Modal = ({ open, status, message, onClose }: { 
    open: boolean; 
    status: 'loading' | 'success' | 'error'; 
    message: string;
    onClose: () => void;
  }) => {
    if (!open) return null;
    
    return (
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white/95 backdrop-blur-md rounded-lg shadow-xl max-w-xs w-full p-6 border border-white/20 text-center">
          {status === 'loading' ? (
            <>
              <div className="flex flex-col items-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                  <svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-blue-700 mb-2">در حال ایجاد کلکسیون...</h3>
                <p className="text-gray-700 mb-2">لطفاً منتظر بمانید</p>
              </div>
            </>
          ) : status === 'success' ? (
            <>
              <div className="flex flex-col items-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-green-700 mb-2">کلکسیون با موفقیت ایجاد شد!</h3>
                <p className="text-gray-700 mb-4">{message}</p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                >
                  بستن
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col items-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-red-700 mb-2">خطا در ایجاد کلکسیون</h3>
                <p className="text-gray-700 mb-4">{message}</p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
                >
                  بستن
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  // Fetch collections from database
  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    setCollectionsLoading(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('کاربر یافت نشد');
      }

      const { data, error } = await supabase
        .from('collections')
        .select('id, name, description, image_url')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setCollections(data || []);
    } catch (err: any) {
      console.error('Error fetching collections:', err);
      setError('خطا در دریافت کلکسیون‌ها');
    } finally {
      setCollectionsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setCollectionImage(file);
    if (file) {
      setCollectionImagePreview(URL.createObjectURL(file));
    } else {
      setCollectionImagePreview(null);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!collectionName.trim()) {
      setError('لطفاً نام کلکسیون را وارد کنید');
      return;
    }

    // Open modal with loading state
    setModalOpen(true);
    setModalStatus('loading');
    setModalMessage('');
    
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('کاربر یافت نشد. لطفاً دوباره وارد شوید.');
      }

      let imageUrl = null;

      // Upload image if provided
      if (collectionImage) {
        const imageExt = collectionImage.name.split('.').pop();
        // Generate unique file name using timestamp and random string
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const imagePath = `collections/${timestamp}_${randomString}.${imageExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('collections')
          .upload(imagePath, collectionImage);
        
        if (uploadError) {
          throw new Error(`خطا در آپلود تصویر: ${uploadError.message}`);
        }
        
        imageUrl = supabase.storage.from('collections').getPublicUrl(imagePath).data.publicUrl;
      }

      // Insert collection into database
      const { data: collectionData, error: insertError } = await supabase
        .from('collections')
        .insert([{
          name: collectionName,
          description: collectionDescription,
          image_url: imageUrl,
          user_id: user.id
        }])
        .select()
        .single();

      if (insertError) {
        throw new Error(`خطا در ثبت کلکسیون: ${insertError.message}`);
      }

      // Reset form
      setCollectionName('');
      setCollectionDescription('');
      setCollectionImage(null);
      setCollectionImagePreview(null);
      
      // Refresh collections list
      await fetchCollections();
      
      // Show success modal
      setModalStatus('success');
      setModalMessage(`کلکسیون "${collectionName}" با موفقیت ایجاد شد.`);
      
      // Auto close modal after 3 seconds
      setTimeout(() => {
        setModalOpen(false);
      }, 3000);
      
    } catch (err: any) {
      console.error('Error creating collection:', err);
      // Show error modal
      setModalStatus('error');
      setModalMessage(err.message || 'خطا در ایجاد کلکسیون');
    }
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  // Open products modal for a collection
  const openProductsModal = async (collection: any) => {
    setSelectedCollection(collection);
    setProductsModalOpen(true);
    setProductsLoading(true);
    setProductsError('');
    setSellerProducts([]);
    setProductsInCollection([]);
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('کاربر یافت نشد');
      // Fetch all products for this seller
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, name, main_image')
        .eq('user_id', user.id);
      if (productsError) throw new Error('خطا در دریافت محصولات');
      setSellerProducts(products || []);
      // Fetch products already in this collection
      const { data: rels, error: relsError } = await supabase
        .from('products_collections')
        .select('product_id')
        .eq('collection_id', collection.id);
      if (relsError) throw new Error('خطا در دریافت محصولات کلکسیون');
      setProductsInCollection((rels || []).map((r: any) => r.product_id));
    } catch (err: any) {
      setProductsError(err.message || 'خطا در دریافت محصولات');
    } finally {
      setProductsLoading(false);
    }
  };

  const closeProductsModal = () => {
    setProductsModalOpen(false);
    setSelectedCollection(null);
    setSellerProducts([]);
    setProductsInCollection([]);
  };

  // Add product to collection
  const handleAddToCollection = async (productId: number) => {
    if (!selectedCollection) return;
    setAddingProductId(productId);
    try {
      const { error } = await supabase
        .from('products_collections')
        .insert([{ collection_id: selectedCollection.id, product_id: productId }]);
      if (error) throw new Error('خطا در افزودن محصول به کلکسیون');
      setProductsInCollection(prev => [...prev, productId]);
    } catch (err: any) {
      alert(err.message || 'خطا در افزودن محصول');
    } finally {
      setAddingProductId(null);
    }
  };

  // Remove product from collection
  const handleRemoveFromCollection = async (productId: number) => {
    if (!selectedCollection) return;
    setRemovingProductId(productId);
    try {
      const { error } = await supabase
        .from('products_collections')
        .delete()
        .eq('collection_id', selectedCollection.id)
        .eq('product_id', productId);
      if (error) throw new Error('خطا در حذف محصول از کلکسیون');
      setProductsInCollection(prev => prev.filter(id => id !== productId));
    } catch (err: any) {
      alert(err.message || 'خطا در حذف محصول');
    } finally {
      setRemovingProductId(null);
    }
  };

  return (
    <div className="max-w mx-auto bg-white rounded-lg shadow p-6 mt-8">
      <div className="flex border-b mb-6">
        <button
          className={`py-2 px-4 font-semibold text-sm border-b-2 transition-colors ${activeTab === 'create' ? 'border-purple-600 text-purple-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('create')}
        >
          ایجاد کلکسیون جدید
        </button>
        <button
          className={`py-2 px-4 font-semibold text-sm border-b-2 transition-colors ${activeTab === 'list' ? 'border-purple-600 text-purple-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('list')}
        >
          لیست کلکسیون‌های من
        </button>
      </div>
      {activeTab === 'create' ? (
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block mb-1 font-semibold">نام کلکسیون</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={collectionName}
              onChange={e => setCollectionName(e.target.value)}
              placeholder="نام کلکسیون را وارد کنید..."
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">توضیحات کلکسیون</label>
            <textarea
              className="w-full border rounded px-3 py-2 min-h-[100px] resize-vertical"
              value={collectionDescription}
              onChange={e => setCollectionDescription(e.target.value)}
              placeholder="توضیحات کلکسیون را وارد کنید..."
              style={{ direction: 'rtl' }}
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">تصویر کلکسیون</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full border rounded px-3 py-2"
            />
            {collectionImagePreview && (
              <div className="mt-2">
                <img 
                  src={collectionImagePreview} 
                  alt="تصویر کلکسیون" 
                  className="w-32 h-32 object-cover rounded border" 
                />
              </div>
            )}
          </div>
          <div className="flex justify-center">
            <button 
              type="submit" 
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-2 rounded font-bold"
            >
              ایجاد کلکسیون
            </button>
          </div>
          {success && <div className="text-green-600 text-center mt-2">{success}</div>}
          {error && <div className="text-red-600 text-center mt-2">{error}</div>}
        </form>
      ) : (
        <div>
          {collectionsLoading ? (
            <div className="text-gray-400 text-center">در حال بارگذاری کلکسیون‌ها...</div>
          ) : collections.length === 0 ? (
            <div className="text-gray-400 text-center">کلکسیونی ثبت نشده است.</div>
          ) : (
            <ul className="divide-y">
              {collections.map(collection => (
                <li key={collection.id} className="py-4 px-2 flex items-start gap-4 cursor-pointer hover:bg-gray-50 rounded-lg transition"
                  onClick={() => openProductsModal(collection)}>
                  {collection.image_url && (
                    <img 
                      src={collection.image_url} 
                      alt={collection.name}
                      className="w-16 h-16 object-cover rounded border flex-shrink-0"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{collection.name}</h3>
                    {collection.description && (
                      <p className="text-gray-600 text-sm mt-1">{collection.description}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
          {error && <div className="text-red-600 text-center mt-2">{error}</div>}
        </div>
      )}
      {/* Products Modal */}
      {productsModalOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={closeProductsModal}>
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-3xl w-full text-center relative" onClick={e => e.stopPropagation()}>
            <button className="absolute top-2 left-2 text-gray-500 hover:text-gray-700" onClick={closeProductsModal}>&times;</button>
            <h2 className="text-xl font-bold mb-4">افزودن محصول به کلکسیون "{selectedCollection?.name}"</h2>
            {productsLoading ? (
              <div className="text-gray-500">در حال دریافت محصولات...</div>
            ) : productsError ? (
              <div className="text-red-500">{productsError}</div>
            ) : sellerProducts.length === 0 ? (
              <div className="text-gray-400">محصولی برای افزودن وجود ندارد.</div>
            ) : (
              <ul className="divide-y max-h-96 overflow-y-auto text-right">
                {sellerProducts.map(product => (
                  <li key={product.id} className="flex items-center gap-4 py-3 px-2">
                    {product.main_image && (
                      <img src={product.main_image} alt={product.name} className="w-12 h-12 object-cover rounded border" />
                    )}
                    <span className="flex-1 text-base">{product.name}</span>
                    {productsInCollection.includes(product.id) ? (
                      <button
                        className="px-3 py-1 rounded-lg font-semibold text-sm transition-colors bg-red-600 hover:bg-red-700 text-white"
                        disabled={removingProductId === product.id}
                        onClick={() => handleRemoveFromCollection(product.id)}
                      >
                        {removingProductId === product.id ? 'در حال حذف...' : 'حذف از کلکسیون'}
                      </button>
                    ) : (
                      <button
                        className="px-3 py-1 rounded-lg font-semibold text-sm transition-colors bg-purple-600 hover:bg-purple-700 text-white"
                        disabled={addingProductId === product.id}
                        onClick={() => handleAddToCollection(product.id)}
                      >
                        {addingProductId === product.id ? 'در حال افزودن...' : 'افزودن به کلکسیون'}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
      <Modal
        open={modalOpen}
        status={modalStatus}
        message={modalMessage}
        onClose={closeModal}
      />
    </div>
  );
} 