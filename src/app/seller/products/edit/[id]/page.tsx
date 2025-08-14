'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Modal component
const EditModal = ({ open, status, onClose }: { open: boolean; status: 'loading' | 'success'; onClose: () => void }) => {
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
              <h3 className="text-lg font-bold text-blue-700 mb-2">در حال ذخیره تغییرات...</h3>
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
              <h3 className="text-lg font-bold text-green-700 mb-2">محصول با موفقیت ویرایش شد!</h3>
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

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [product, setProduct] = useState<any>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState<'loading' | 'success'>('loading');
  const [galleryImages, setGalleryImages] = useState<{ id: number; image_url: string }[]>([]);
  const [newGalleryFiles, setNewGalleryFiles] = useState<File[]>([]);
  const [deletedGalleryIds, setDeletedGalleryIds] = useState<number[]>([]);

  useEffect(() => {
    if (!productId) return;
    console.log('productId:', productId);
    const fetchProduct = async () => {
      setLoading(true);
      setError('');
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();
      if (error || !data) {
        setError('محصول یافت نشد');
      } else {
        setProduct(data);
        setName(data.name || '');
        setPrice(data.price ? String(data.price) : '');
        setMainImagePreview(data.main_image || null);
        // گالری را هم بخوان
        const { data: gallery, error: galleryError } = await supabase
          .from('products_images')
          .select('id, image_url, product_id')
          .eq('product_id', Number(productId));
        console.log('gallery:', gallery);
        console.log('galleryError:', galleryError);
        if (!galleryError && gallery) {
          setGalleryImages(gallery);
          console.log('galleryImages:', gallery);
        }
      }
      setLoading(false);
    };
    fetchProduct();
  }, [productId]);

  // حذف تصویر گالری (فقط از state و اضافه به لیست حذف‌شده‌ها)
  const handleRemoveGalleryImage = (imgId: number) => {
    setDeletedGalleryIds(prev => [...prev, imgId]);
    setGalleryImages(prev => prev.filter(img => img.id !== imgId));
  };

  // افزودن تصاویر جدید به state
  const handleAddGalleryImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setNewGalleryFiles(prev => [...prev, ...files]);
  };

  // حذف تصویر جدید انتخاب‌شده از state
  const handleRemoveNewGalleryFile = (idx: number) => {
    setNewGalleryFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setMainImage(file);
    if (file) {
      setMainImagePreview(URL.createObjectURL(file));
    } else {
      setMainImagePreview(product?.main_image || null);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    router.push('/seller/products');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setModalStatus('loading');
    setModalOpen(true);
    try {
      let mainImageUrl = product?.main_image || null;
      if (mainImage) {
        const ext = mainImage.name.split('.').pop();
        const filePath = `products/${Date.now()}-main.${ext}`;
        const { data: uploadData, error: uploadError } = await supabase.storage.from('products').upload(filePath, mainImage, { upsert: true });
        if (uploadError) throw new Error('خطا در آپلود تصویر جدید');
        const { data: urlData } = supabase.storage.from('products').getPublicUrl(filePath);
        mainImageUrl = urlData.publicUrl;
      }
      // حذف تصاویر گالری که کاربر حذف کرده است
      for (let imgId of deletedGalleryIds) {
        // ابتدا url تصویر را پیدا کن
        const img = galleryImages.find(g => g.id === imgId);
        if (img) {
          const url = new URL(img.image_url);
          const pathParts = url.pathname.split('/');
          const filePath = pathParts.slice(-2).join('/');
          await supabase.storage.from('products').remove([filePath]);
        }
        await supabase.from('products_images').delete().eq('id', imgId);
      }
      // آپدیت اطلاعات محصول
      const { error: updateError } = await supabase
        .from('products')
        .update({
          name,
          price: Number(price),
          main_image: mainImageUrl,
        })
        .eq('id', productId);
      if (updateError) throw new Error('خطا در ذخیره تغییرات');
      // آپلود تصاویر جدید گالری
      for (let i = 0; i < newGalleryFiles.length; i++) {
        const img = newGalleryFiles[i];
        const ext = img.name.split('.').pop();
        const path = `products/${Date.now()}-gallery-${i}.${ext}`;
        const { data: gUpload, error: gErr } = await supabase.storage.from('products').upload(path, img);
        if (!gErr) {
          const url = supabase.storage.from('products').getPublicUrl(path).data.publicUrl;
          await supabase.from('products_images').insert([
            { product_id: productId, image_url: url }
          ]);
        }
      }
      setModalStatus('success');
      setTimeout(() => {
        router.push('/seller/products');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'خطای ناشناخته در ذخیره تغییرات');
      setModalOpen(false);
    }
  };

  if (loading) return <div className="text-center py-12">در حال بارگذاری...</div>;
  if (error) return <div className="text-center text-red-500 py-12">{error}</div>;

  return (
    <div className="max-w mx-auto bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-center text-purple-700 mb-6">ویرایش محصول</h2>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div>
          <label className="block mb-1 font-semibold text-gray-700">نام محصول</label>
          <input
            type="text"
            className="w-full border rounded-lg px-3 py-2"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={product?.name || ''}
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold text-gray-700">قیمت (تومان)</label>
          <input
            type="number"
            className="w-full border rounded-lg px-3 py-2"
            value={price}
            onChange={e => setPrice(e.target.value)}
            placeholder={product?.price ? String(product.price) : ''}
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold text-gray-700">تصویر اصلی محصول</label>
          <input type="file" accept="image/*" onChange={handleMainImageChange} />
          {mainImagePreview && (
            <div className="mt-2">
              <img src={mainImagePreview} alt="تصویر اصلی" className="w-32 h-32 object-cover rounded border" />
            </div>
          )}
        </div>
        <div>
          <label className="block mb-1 font-semibold text-gray-700">گالری تصاویر</label>
          <div
            className="border-2 border-dashed border-gray-400 rounded-lg p-4 text-center cursor-pointer bg-gray-50 hover:bg-gray-100 mb-2"
            onDrop={e => {
              e.preventDefault();
              const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
              handleAddGalleryImages({ target: { files }, preventDefault: () => {} } as any);
            }}
            onDragOver={e => e.preventDefault()}
          >
            تصاویر را اینجا رها کنید یا
            <input
              type="file"
              accept="image/*"
              multiple
              className="block mx-auto mt-2"
              onChange={handleAddGalleryImages}
            />
          </div>
          <div className="flex flex-row gap-2 mt-2 flex-wrap">
            {galleryImages.length === 0 && newGalleryFiles.length === 0 && (
              <div className="text-gray-400 text-sm">تصویری برای این محصول ثبت نشده است.</div>
            )}
            {galleryImages.map(img => (
              <div key={img.id} className="relative group mb-2 w-24">
                <img src={img.image_url} alt="گالری" className="w-24 h-24 object-cover rounded border" />
                <button
                  type="button"
                  className="absolute top-0 left-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-80 group-hover:opacity-100"
                  onClick={() => handleRemoveGalleryImage(img.id)}
                >
                  ×
                </button>
              </div>
            ))}
            {newGalleryFiles.map((file, idx) => (
              <div key={file.name + idx} className="relative group mb-2 w-24">
                <img src={URL.createObjectURL(file)} alt="جدید" className="w-24 h-24 object-cover rounded border opacity-60" />
                <button
                  type="button"
                  className="absolute top-0 left-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-80 group-hover:opacity-100"
                  onClick={() => handleRemoveNewGalleryFile(idx)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-center">
          <button type="submit" className="w-50 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold">
            ذخیره تغییرات
          </button>
        </div>
      </form>
      <EditModal open={modalOpen} status={modalStatus} onClose={closeModal} />
    </div>
  );
} 