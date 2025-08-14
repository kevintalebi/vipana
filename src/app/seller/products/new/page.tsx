'use client';
import React, { useState, DragEvent, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Modal component
const UploadModal = ({ open, status, onClose }: { open: boolean; status: 'loading' | 'success'; onClose: () => void }) => {
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
              <h3 className="text-lg font-bold text-blue-700 mb-2">در حال ثبت محصول...</h3>
              <p className="text-gray-700 mb-2">لطفاً منتظر بمانید</p>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-green-700 mb-2">محصول با موفقیت آپلود شد!</h3>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors mt-4"
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

export default function NewProductPage() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState('');
  
  // Dynamic category levels - can handle unlimited nesting
  const [categoryLevels, setCategoryLevels] = useState<{
    id: number | null;
    options: { id: number; name: string }[];
    loading: boolean;
    error: string;
  }[]>([]);
  
  const [selectedCategoryPath, setSelectedCategoryPath] = useState<number[]>([]);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState<'loading' | 'success'>('loading');
  const closeModal = () => {
    setModalOpen(false);
    router.push('/seller/products');
  };
  const [fullDescription, setFullDescription] = useState('');



  // Dynamic function to fetch categories for any level
  const fetchCategoryLevel = async (parentId: number, levelIndex: number) => {
    // Set loading state for this level
    setCategoryLevels(prev => prev.map((level, index) => 
      index === levelIndex ? { ...level, loading: true, error: '' } : level
    ));
    
    const { data, error } = await supabase
      .from('categories')
      .select('id, name')
      .eq('parent_id', parentId);
    
    if (error) {
      console.error(`Category level ${levelIndex} fetch error:`, error);
      setCategoryLevels(prev => prev.map((level, index) => 
        index === levelIndex ? { ...level, options: [], loading: false, error: 'خطا در دریافت دسته‌بندی‌ها' } : level
      ));
    } else {
      const options = (data || []).map((cat: any) => ({ id: cat.id, name: cat.name }));
      setCategoryLevels(prev => prev.map((level, index) => 
        index === levelIndex ? { ...level, options, loading: false, error: '' } : level
      ));
      console.log(`Category level ${levelIndex} for parent_id ${parentId}:`, options);
    }
  };

  // Function to handle category selection at any level
  const handleCategorySelection = async (levelIndex: number, categoryId: number | null) => {
    // Update the selected path
    const newPath = selectedCategoryPath.slice(0, levelIndex);
    if (categoryId) {
      newPath.push(categoryId);
    }
    setSelectedCategoryPath(newPath);
    
    // Update the category levels
    setCategoryLevels(prev => prev.map((level, index) => {
      if (index === levelIndex) {
        return { ...level, id: categoryId };
      } else if (index > levelIndex) {
        // Reset all levels after the selected level
        return { id: null, options: [], loading: false, error: '' };
      }
      return level;
    }));
    
    // If a category was selected, fetch its subcategories
    if (categoryId) {
      // Ensure we have enough levels
      setCategoryLevels(prev => {
        const newLevels = [...prev];
        while (newLevels.length <= levelIndex + 1) {
          newLevels.push({ id: null, options: [], loading: false, error: '' });
        }
        return newLevels;
      });
      
      // Fetch subcategories for the next level
      await fetchCategoryLevel(categoryId, levelIndex + 1);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      setCategoriesError('');
      
      // First, let's check the schema
      console.log('Checking database schema...');
      
      // Test the products table structure
      try {
        const { data: schemaTest, error: schemaError } = await supabase
          .from('products')
          .select('*')
          .limit(0);
        
        if (schemaError) {
          console.error('Schema test error:', schemaError);
        } else {
          console.log('Products table is accessible');
        }
      } catch (err) {
        console.error('Schema test failed:', err);
      }
      
      // Get only main categories (parent_id = null)
      let { data, error } = await supabase.from('categories').select('id, name, parent_id');
      
      if (!error && data) {
        // Filter to get only categories with parent_id = null
        data = data.filter(cat => cat.parent_id === null);
      }
      
      if (error) {
        setCategoriesError('خطا در دریافت دسته‌بندی‌ها');
        console.error('Categories fetch error:', error);
      } else {
        const cats = (data || []).map((cat: any) => ({ id: cat.id, name: cat.name }));
        setCategories(cats);
        
        // Initialize category levels with main categories
        setCategoryLevels([{
          id: null,
          options: cats,
          loading: false,
          error: ''
        }]);
      }
      setCategoriesLoading(false);
    };
    fetchCategories();
  }, []);

  // Handle main image upload
  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setMainImage(file);
    if (file) {
      setMainImagePreview(URL.createObjectURL(file));
    } else {
      setMainImagePreview(null);
    }
  };

  // Handle gallery images via drop or file input
  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setGalleryImages(prev => [...prev, ...files]);
    setGalleryPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    setGalleryImages(prev => [...prev, ...files]);
    setGalleryPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleRemoveGalleryImage = (idx: number) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== idx));
    setGalleryPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setModalStatus('loading');
    setModalOpen(true);
    if (!name || !price || !mainImage || !categoryId) {
      setError('لطفاً همه فیلدها، تصویر اصلی و دسته‌بندی را پر کنید.');
      setLoading(false);
      setModalOpen(false);
      return;
    }
    try {
      console.log('Starting product creation process...');
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('User error:', userError);
        throw new Error('کاربر یافت نشد. لطفاً دوباره وارد شوید.');
      }
      console.log('User authenticated:', user.id);

      // 1. Upload main image to Supabase Storage
      const mainImageExt = mainImage.name.split('.').pop();
      const mainImagePath = `products/${Date.now()}-main.${mainImageExt}`;
      console.log('Uploading main image to:', mainImagePath);
      console.log('File details:', {
        name: mainImage.name,
        size: mainImage.size,
        type: mainImage.type
      });
      
      // Check if storage bucket exists
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      if (bucketsError) {
        console.error('Error listing buckets:', bucketsError);
        throw new Error(`خطا در بررسی storage buckets: ${bucketsError.message}`);
      }
      console.log('Available buckets:', buckets);
      
      const productsBucket = buckets?.find(bucket => bucket.name === 'products');
      if (!productsBucket) {
        throw new Error('Storage bucket "products" یافت نشد. لطفاً با مدیر سیستم تماس بگیرید.');
      }
      console.log('Products bucket found:', productsBucket);
      
      const { data: mainImgUpload, error: mainImgErr } = await supabase.storage.from('products').upload(mainImagePath, mainImage);
      if (mainImgErr) {
        console.error('Main image upload error details:', {
          error: mainImgErr,
          message: mainImgErr.message
        });
        throw new Error(`خطا در آپلود تصویر اصلی: ${mainImgErr.message || 'Unknown upload error'}`);
      }
      console.log('Main image uploaded successfully');
      
      const mainImageUrl = supabase.storage.from('products').getPublicUrl(mainImagePath).data.publicUrl;
      console.log('Main image URL:', mainImageUrl);

      // 2. Upload gallery images
      let galleryImageUrls: string[] = [];
      for (let i = 0; i < galleryImages.length; i++) {
        const img = galleryImages[i];
        const ext = img.name.split('.').pop();
        const path = `products/${Date.now()}-gallery-${i}.${ext}`;
        console.log(`Uploading gallery image ${i + 1} to:`, path);
        
        const { data: gUpload, error: gErr } = await supabase.storage.from('products').upload(path, img);
        if (gErr) {
          console.error('Gallery image upload error:', gErr);
          throw new Error(`خطا در آپلود تصاویر گالری: ${gErr.message}`);
        }
        const url = supabase.storage.from('products').getPublicUrl(path).data.publicUrl;
        galleryImageUrls.push(url);
        console.log(`Gallery image ${i + 1} uploaded successfully`);
      }

      // 3. Insert product into products table with user_id
      const productData = {
        name,
        price: Number(price),
        description: fullDescription, // Add description field
        category_id: selectedCategoryPath[selectedCategoryPath.length - 1], // Use the deepest selected category
        main_image: mainImageUrl,
        user_id: user.id,
      };
      console.log('Inserting product with data:', productData);
      console.log('Category ID type:', typeof categoryId, 'Value:', categoryId);
      console.log('User ID type:', typeof user.id, 'Value:', user.id);
      console.log('Price type:', typeof Number(price), 'Value:', Number(price));
      
      // Let's also check the exact structure
      console.log('Product data structure:', {
        name: { value: name, type: typeof name },
        price: { value: Number(price), type: typeof Number(price) },
        description: { value: fullDescription, type: typeof fullDescription },
        category_id: { value: categoryId, type: typeof categoryId },
        main_image: { value: mainImageUrl, type: typeof mainImageUrl },
        user_id: { value: user.id, type: typeof user.id }
      });
      
      // Test insertion with minimal data first
      console.log('Testing minimal insertion...');
      const testData = {
        name: 'Test Product',
        price: 1000,
        description: 'Test description',
        category_id: categoryId,
        main_image: mainImageUrl,
        user_id: user.id,
      };
      
      const { data: testResult, error: testError } = await supabase.from('products').insert([testData]).select().single();
      if (testError) {
        console.error('Test insertion failed:', testError);
        console.error('Test data:', testData);
        throw new Error(`Test insertion failed: ${testError.message}`);
      } else {
        console.log('Test insertion successful:', testResult);
        // Delete the test record
        await supabase.from('products').delete().eq('id', testResult.id);
      }
      
      const { data: productDataResult, error: productErr } = await supabase.from('products').insert([productData]).select().single();
      if (productErr || !productDataResult) {
        console.error('Product insertion error:', productErr);
        console.error('Product data that failed:', productData);
        console.error('Error details:', {
          message: productErr?.message,
          details: productErr?.details,
          hint: productErr?.hint,
          code: productErr?.code
        });
        throw new Error(`خطا در ثبت محصول: ${productErr?.message || 'Unknown error'}`);
      }
      console.log('Product inserted successfully:', productDataResult);

      // 4. Insert gallery images into products_images table
      if (galleryImageUrls.length > 0) {
        console.log('Inserting gallery images...');
        for (let url of galleryImageUrls) {
          const { error: galleryErr } = await supabase.from('products_images').insert([
            {
              product_id: productDataResult.id,
              image_url: url,
            }
          ]);
          if (galleryErr) {
            console.error('Gallery image insertion error:', galleryErr);
            // Don't throw error here, just log it
            console.warn('Failed to insert gallery image:', url);
          }
        }
        console.log('Gallery images inserted successfully');
      }

      setModalStatus('success');
      setLoading(false);
      setTimeout(() => {
        router.push('/seller/products');
      }, 1500);
    } catch (err: any) {
      console.error('Product creation error:', err);
      setError(err.message || 'خطای ناشناخته در ثبت محصول');
      setModalOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w mx-auto bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-center text-purple-700 mb-6">افزودن محصول جدید</h2>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div>
          <label className="block mb-1 font-semibold text-gray-700">نام محصول</label>
          <input type="text" className="w-full border rounded-lg px-3 py-2" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div>
          <label className="block mb-1 font-semibold text-gray-700">قیمت (تومان)</label>
          <input type="number" className="w-full border rounded-lg px-3 py-2" value={price} onChange={e => setPrice(e.target.value)} required />
        </div>
        <div>
          <label className="block mb-1 font-semibold text-gray-700">توضیحات</label>
          <textarea
            className="w-full border rounded-lg px-3 py-2 min-h-[120px] resize-vertical"
            value={fullDescription}
            onChange={e => setFullDescription(e.target.value)}
            placeholder="توضیحات محصول را وارد کنید..."
            style={{ direction: 'rtl' }}
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold text-gray-700">دسته‌بندی اصلی</label>
          {categoriesLoading ? (
            <div className="text-gray-500 text-sm">در حال دریافت دسته‌بندی‌ها...</div>
          ) : categoriesError ? (
            <div className="text-red-500 text-sm">{categoriesError}</div>
          ) : (
            <select
              className="w-full border rounded-lg px-3 py-2"
              value={categoryId ?? ''}
              onChange={e => {
                const selectedCategoryId = Number(e.target.value);
                setCategoryId(selectedCategoryId);
                handleCategorySelection(0, selectedCategoryId || null);
              }}
              required
            >
              <option value="" disabled>انتخاب دسته‌بندی اصلی</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          )}
        </div>
        {/* Dynamic Category Levels */}
        {categoryLevels.slice(1).map((level, levelIndex) => (
          <div key={levelIndex + 1}>
            {level.loading ? (
              <div className="text-gray-500 text-sm">در حال دریافت دسته‌بندی‌های سطح {levelIndex + 2}...</div>
            ) : level.error ? (
              <div className="text-red-500 text-sm">{level.error}</div>
            ) : level.options.length > 0 ? (
              <div>
                <label className="block mb-1 font-semibold text-gray-700">دسته‌بندی سطح {levelIndex + 2}</label>
                <select
                  className="w-full border rounded-lg px-3 py-2"
                  value={level.id ?? ''}
                  onChange={e => handleCategorySelection(levelIndex + 1, Number(e.target.value) || null)}
                >
                  <option value="">انتخاب دسته‌بندی سطح {levelIndex + 2}</option>
                  {level.options.map(option => (
                    <option key={option.id} value={option.id}>{option.name}</option>
                  ))}
                </select>
              </div>
            ) : null}
          </div>
        ))}
        {/* Main Image Upload */}
        <div>
          <label className="block mb-1 font-semibold text-gray-700">تصویر اصلی محصول</label>
          <input type="file" accept="image/*" onChange={handleMainImageChange} />
          {mainImagePreview && (
            <div className="mt-2">
              <img src={mainImagePreview} alt="تصویر اصلی" className="w-32 h-32 object-cover rounded border" />
            </div>
          )}
        </div>
        {/* Gallery Images Dropzone */}
        <div>
          <label className="block mb-1 font-semibold text-gray-700">گالری تصاویر (قابل درگ و دراپ)</label>
          <div
            className="border-2 border-dashed border-gray-400 rounded-lg p-4 text-center cursor-pointer bg-gray-50 hover:bg-gray-100"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            تصاویر را اینجا رها کنید یا
            <input
              type="file"
              accept="image/*"
              multiple
              className="block mx-auto mt-2"
              onChange={handleGalleryChange}
            />
          </div>
          {galleryPreviews.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {galleryPreviews.map((src, idx) => (
                <div key={idx} className="relative group">
                  <img src={src} alt={`گالری ${idx + 1}`} className="w-20 h-20 object-cover rounded border" />
                  <button
                    type="button"
                    className="absolute top-0 left-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-80 group-hover:opacity-100"
                    onClick={() => handleRemoveGalleryImage(idx)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <div className="flex justify-center">
          <button type="submit" className="w-50 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold" disabled={loading}>
            {loading ? 'در حال ثبت...' : 'ثبت محصول'}
          </button>
        </div>
      </form>
      <UploadModal open={modalOpen} status={modalStatus} onClose={closeModal} />
    </div>
  );
} 