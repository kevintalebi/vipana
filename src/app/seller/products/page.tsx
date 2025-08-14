'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Product {
  id: number;
  name: string;
  price: number;
  main_image: string;
  category_id: number;
  user_id: string;
  created_at: string;
  status?: string;
  stock?: number;
  categories?: {
    name: string;
  } | null;
}

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  productName: string;
  isLoading: boolean;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ isOpen, onClose, onConfirm, productName, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-md rounded-lg shadow-xl max-w-md w-full p-6 border border-white/20">
        <div className="text-center">
          {/* Warning Icon */}
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            حذف محصول
          </h3>
          
          <p className="text-sm text-gray-500 mb-6">
            آیا مطمئن هستید که می‌خواهید محصول <span className="font-semibold text-gray-900">"{productName}"</span> را حذف کنید؟
          </p>
          
          <p className="text-xs text-red-600 mb-6">
            این عملیات غیرقابل بازگشت است.
          </p>
          
          <div className="flex gap-3 justify-center">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100/80 hover:bg-gray-200/80 backdrop-blur-sm rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              انصراف
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600/90 hover:bg-red-700/90 backdrop-blur-sm rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'در حال حذف...' : 'حذف'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function SellerProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    productId: number | null;
    productName: string;
  }>({
    isOpen: false,
    productId: null,
    productName: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('کاربر یافت نشد. لطفاً دوباره وارد شوید.');
      }

      // Fetch products for the current user
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          main_image,
          category_id,
          user_id,
          created_at,
          categories(name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        throw new Error('خطا در دریافت محصولات');
      }

      // Transform the data to match our Product interface
      const transformedProducts: Product[] = (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        main_image: item.main_image,
        category_id: item.category_id,
        user_id: item.user_id,
        created_at: item.created_at,
        categories: item.categories ? { name: item.categories.name } : null
      }));

      setProducts(transformedProducts);
    } catch (err: any) {
      console.error('Fetch products error:', err);
      setError(err.message || 'خطای ناشناخته در دریافت محصولات');
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (productId: number, productName: string) => {
    setDeleteModal({
      isOpen: true,
      productId,
      productName
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      productId: null,
      productName: ''
    });
  };

  const handleDelete = async () => {
    if (!deleteModal.productId) return;

    try {
      setDeletingId(deleteModal.productId);

      // Get the product to find its images
      const productToDelete = products.find(p => p.id === deleteModal.productId);
      if (!productToDelete) {
        throw new Error('محصول یافت نشد');
      }

      // Delete the product from database
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', deleteModal.productId);

      if (deleteError) {
        console.error('Delete error:', deleteError);
        throw new Error(`خطا در حذف محصول: ${deleteError.message}`);
      }

      // Try to delete the main image from storage (optional - don't fail if this fails)
      if (productToDelete.main_image) {
        try {
          // Extract the file path from the URL
          const url = new URL(productToDelete.main_image);
          const pathParts = url.pathname.split('/');
          const filePath = pathParts.slice(-2).join('/'); // Get the last two parts (products/filename)
          
          const { error: storageError } = await supabase.storage
            .from('products')
            .remove([filePath]);
          
          if (storageError) {
            console.warn('Failed to delete image from storage:', storageError);
            // Don't throw error here, as the product was already deleted
          }
        } catch (storageErr) {
          console.warn('Error deleting image from storage:', storageErr);
          // Continue anyway
        }
      }

      // Remove the product from local state immediately for better UX
      setProducts(prev => prev.filter(p => p.id !== deleteModal.productId));
      
      // Close modal and show success message
      closeDeleteModal();
      alert('محصول با موفقیت حذف شد');
    } catch (err: any) {
      console.error('Delete product error:', err);
      alert(err.message || 'خطا در حذف محصول');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-4 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-blue-700">مدیریت محصولات من</h2>
          <Link href="/seller/products/new">
            <button className="mt-4 md:mt-0 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded w-full md:w-auto">
              افزودن محصول جدید
            </button>
          </Link>
        </div>
        <div className="text-center py-8">
          <div className="text-gray-500">در حال بارگذاری محصولات...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-blue-700">مدیریت محصولات من</h2>
        <Link href="/seller/products/new">
          <button className="mt-4 md:mt-0 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded w-full md:w-auto">
            افزودن محصول جدید
          </button>
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Desktop Header */}
        <div className="hidden md:grid md:grid-cols-6 gap-4 font-bold text-gray-600 p-2 bg-gray-100 rounded-lg text-right">
          <div>تصویر</div>
          <div>نام محصول</div>
          <div>قیمت (تومان)</div>
          <div>دسته‌بندی</div>
          <div>تاریخ ایجاد</div>
          <div className="text-center">عملیات</div>
        </div>

        {/* Product List */}
        {products.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-lg mb-2">هنوز محصولی اضافه نکرده‌اید</div>
            <Link href="/seller/products/new">
              <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">
                افزودن اولین محصول
              </button>
            </Link>
          </div>
        ) : (
          products.map(product => (
            <div key={product.id} className="bg-gray-50 rounded-lg p-4 md:grid md:grid-cols-6 md:gap-4 items-center text-right">
              {/* Image */}
              <div className="flex justify-between items-center md:block border-b md:border-none pb-2 mb-2 md:pb-0 md:mb-0">
                <span className="font-bold md:hidden">تصویر:</span>
                <div className="flex items-center">
                  {product.main_image ? (
                    <img 
                      src={product.main_image} 
                      alt={product.name} 
                      className="w-16 h-16 object-cover rounded border"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded border flex items-center justify-center text-gray-500 text-xs">
                      بدون تصویر
                    </div>
                  )}
                </div>
              </div>
              
              {/* Name */}
              <div className="flex justify-between items-center md:block border-b md:border-none pb-2 mb-2 md:pb-0 md:mb-0">
                <span className="font-bold md:hidden">نام محصول:</span>
                <span className="font-semibold">{product.name}</span>
              </div>
              
              {/* Price */}
              <div className="flex justify-between items-center md:block border-b md:border-none pb-2 mb-2 md:pb-0 md:mb-0">
                <span className="font-bold md:hidden">قیمت:</span>
                <span className="text-green-600 font-semibold">{product.price.toLocaleString()} تومان</span>
              </div>
              
              {/* Category */}
              <div className="flex justify-between items-center md:block border-b md:border-none pb-2 mb-2 md:pb-0 md:mb-0">
                <span className="font-bold md:hidden">دسته‌بندی:</span>
                <span className="text-gray-600">
                  {product.categories?.name || 'نامشخص'}
                </span>
              </div>
              
              {/* Created Date */}
              <div className="flex justify-between items-center md:block border-b md:border-none pb-2 mb-2 md:pb-0 md:mb-0">
                <span className="font-bold md:hidden">تاریخ ایجاد:</span>
                <span className="text-gray-600 text-sm">{formatDate(product.created_at)}</span>
              </div>
              
              {/* Actions */}
              <div className="mt-4 md:mt-0 flex flex-wrap gap-2 justify-center">
                <Link
                  href={`/seller/products/edit/${product.id}`}
                  className="flex-grow md:flex-grow-0 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm text-center"
                >
                  ویرایش
                </Link>
                <button 
                  className="flex-grow md:flex-grow-0 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => openDeleteModal(product.id, product.name)}
                  disabled={deletingId === product.id}
                >
                  {deletingId === product.id ? 'در حال حذف...' : 'حذف'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        productName={deleteModal.productName}
        isLoading={deletingId !== null}
      />
    </div>
  );
} 