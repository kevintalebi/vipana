'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ReportData {
  totalProducts: number;
  totalSales: number;
  totalOrders: number;
  bestSellingProduct: {
    name: string;
    sales: number;
  } | null;
  monthlySales: Array<{
    month: string;
    amount: number;
  }>;
  recentOrders: Array<{
    id: number;
    product_name: string;
    buyer_name: string;
    amount: number;
    status: string;
    created_at: string;
  }>;
}

export default function SellerReportsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reportData, setReportData] = useState<ReportData>({
    totalProducts: 0,
    totalSales: 0,
    totalOrders: 0,
    bestSellingProduct: null,
    monthlySales: [],
    recentOrders: []
  });

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError('');

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('کاربر یافت نشد. لطفاً دوباره وارد شوید.');
      }

      console.log('Current user ID:', user.id);

      // Fetch seller's products first
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, name, price')
        .eq('user_id', user.id);

      if (productsError) throw productsError;
      const productList = products || [];
      console.log('Products found:', productList.length, productList);

      // Fetch orders directly by seller_id
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;
      const orderList = orders || [];
      console.log('Orders found for this seller:', orderList.length, orderList);

      // Debug: Check the structure of first order
      if (orderList.length > 0) {
        console.log('First order structure:', orderList[0]);
        console.log('Available fields:', Object.keys(orderList[0]));
      }

      // Get all product IDs from orders to fetch their details
      const orderProductIds = Array.from(new Set(orderList.map(o => o.product_id)));
      console.log('Product IDs from orders:', orderProductIds);

      // Fetch all products that are referenced in orders
      let allProducts = [...productList];
      if (orderProductIds.length > 0) {
        const { data: orderProducts, error: orderProductsError } = await supabase
          .from('products')
          .select('id, name, price')
          .in('id', orderProductIds);
        
        console.log('Order products fetched:', orderProducts);
        console.log('Order products error:', orderProductsError);
        
        if (!orderProductsError && orderProducts) {
          // Merge products, avoiding duplicates
          const existingIds = new Set(productList.map(p => p.id));
          const newProducts = orderProducts.filter(p => !existingIds.has(p.id));
          allProducts = [...productList, ...newProducts];
        }
      }

      console.log('All products (seller + order products):', allProducts.length, allProducts);

      // Check if any product IDs from orders are missing
      const missingProductIds = orderProductIds.filter(id => 
        !allProducts.some(p => p.id === id)
      );
      if (missingProductIds.length > 0) {
        console.warn('Missing products for IDs:', missingProductIds);
        
        // Try to fetch missing products individually to see what's wrong
        for (const missingId of missingProductIds) {
          const { data: singleProduct, error: singleError } = await supabase
            .from('products')
            .select('id, name, price')
            .eq('id', missingId)
            .single();
          
          console.log(`Trying to fetch product ${missingId}:`, singleProduct, 'Error:', singleError);
        }
      }

      // Calculate total sales from ALL orders
      const totalSales = orderList.reduce((sum, order) => {
        const product = allProducts.find(p => p.id === order.product_id || p.id === Number(order.product_id));
        const productPrice = product?.price || 0;
        console.log(`Order ${order.id}: Product ${order.product_id}, Product Name: ${product?.name || 'NOT FOUND'}, Price: ${productPrice}, Status: ${order.status}, Seller: ${order.seller_id}, Buyer: ${order.buyer_id}`);
        return sum + productPrice;
      }, 0);

      console.log('Total sales calculated:', totalSales);

      // Calculate best selling product (from all orders)
      const productSales = allProducts.map(product => {
        const sales = orderList.filter(order => 
          order.product_id === product.id || order.product_id === Number(product.id)
        ).length;
        console.log(`Product ${product.name}: ${sales} sales`);
        return { name: product.name, sales };
      });
      
      const bestSellingProduct = productSales.reduce((best, current) => 
        current.sales > best.sales ? current : best
      );

      console.log('Best selling product:', bestSellingProduct);

      // Calculate monthly sales for the last 6 months (from all orders)
      const monthlySales = calculateMonthlySales(orderList, allProducts);

      // Fetch recent orders with buyer information (show all orders)
      const recentOrders = await fetchRecentOrders(orderList.slice(0, 5), allProducts);

      setReportData({
        totalProducts: productList.length,
        totalSales,
        totalOrders: orderList.length,
        bestSellingProduct: bestSellingProduct.sales > 0 ? bestSellingProduct : null,
        monthlySales,
        recentOrders
      });

    } catch (err: any) {
      console.error('Error fetching report data:', err);
      setError(err.message || 'خطا در دریافت اطلاعات گزارش');
    } finally {
      setLoading(false);
    }
  };

  const calculateMonthlySales = (orders: any[], products: any[]) => {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('fa-IR', { month: 'short' });
      
      const monthOrders = orders.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate.getMonth() === date.getMonth() && 
               orderDate.getFullYear() === date.getFullYear();
      });

      const monthSales = monthOrders.reduce((sum, order) => {
        const product = products.find(p => p.id === order.product_id || p.id === Number(order.product_id));
        return sum + (product?.price || 0);
      }, 0);

      months.push({ month: monthName, amount: monthSales });
    }

    return months;
  };

  const fetchRecentOrders = async (orders: any[], products: any[]) => {
    if (orders.length === 0) return [];

    const buyerIds = Array.from(new Set(orders.map(o => o.buyer_id)));
    let buyersMap: Record<string, string> = {};

    if (buyerIds.length > 0) {
      const { data: buyers } = await supabase
        .from('buyers')
        .select('user_id, name')
        .in('user_id', buyerIds);
      
      (buyers || []).forEach((b: any) => {
        buyersMap[b.user_id] = b.name;
      });
    }

    return orders.map(order => {
      const product = products.find(p => p.id === order.product_id || p.id === Number(order.product_id));
      console.log(`Recent order ${order.id}: Product ID ${order.product_id}, Found product:`, product);
      console.log(`Recent order ${order.id}: All products available:`, products.map(p => ({ id: p.id, name: p.name })));
      console.log(`Recent order ${order.id}: Looking for product ID: ${order.product_id}, Type: ${typeof order.product_id}`);
      
      // Try to find the product with different approaches
      const productById = products.find(p => p.id === order.product_id);
      const productByNumber = products.find(p => p.id === Number(order.product_id));
      const productByString = products.find(p => p.id === String(order.product_id));
      
      console.log(`Recent order ${order.id}: Product by ID:`, productById);
      console.log(`Recent order ${order.id}: Product by Number:`, productByNumber);
      console.log(`Recent order ${order.id}: Product by String:`, productByString);
      
      return {
        id: order.id,
        product_name: product?.name || 'محصول نامشخص',
        buyer_name: buyersMap[order.buyer_id] || 'کاربر نامشخص',
        amount: product?.price || 0,
        status: order.status,
        created_at: order.created_at
      };
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fa-IR').format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'paid': return 'text-green-600 bg-green-100';
      case 'confirmed': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'در انتظار';
      case 'completed': return 'تکمیل شده';
      case 'paid': return 'پرداخت شده';
      case 'confirmed': return 'تایید شده';
      case 'cancelled': return 'لغو شده';
      case 'failed': return 'ناموفق';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-gray-200 rounded-lg p-4 h-24"></div>
            ))}
          </div>
          <div className="bg-gray-200 rounded-lg p-6 h-48"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center text-red-600">
          <p className="text-lg font-semibold mb-2">خطا در دریافت اطلاعات</p>
          <p>{error}</p>
          <button 
            onClick={fetchReportData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-xl font-bold text-yellow-700 mb-6">آمار و گزارشات من</h2>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-100 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-700">{reportData.totalProducts}</div>
          <div className="text-gray-600">تعداد محصولات</div>
        </div>
        <div className="bg-green-100 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-700">{formatCurrency(reportData.totalSales)}</div>
          <div className="text-gray-600">مجموع فروش (تومان)</div>
        </div>
        <div className="bg-purple-100 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-700">{reportData.totalOrders}</div>
          <div className="text-gray-600">تعداد سفارشات</div>
        </div>
      </div>

      {/* Best Selling Product */}
      {reportData.bestSellingProduct && (
        <div className="bg-orange-100 rounded-lg p-4 mb-6">
          <div className="text-center">
            <div className="text-lg font-semibold text-orange-700">محصول پرفروش</div>
            <div className="text-xl font-bold text-orange-800">{reportData.bestSellingProduct.name}</div>
            <div className="text-sm text-orange-600">{reportData.bestSellingProduct.sales} فروش</div>
          </div>
        </div>
      )}

      {/* Sales Chart */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="text-gray-700 mb-4">نمودار فروش ۶ ماه اخیر</div>
        <div className="w-full h-32 bg-gradient-to-l from-green-200 to-blue-200 rounded-lg flex items-end justify-between px-4">
          {reportData.monthlySales.map((month, index) => {
            const maxAmount = Math.max(...reportData.monthlySales.map(m => m.amount));
            const height = maxAmount > 0 ? (month.amount / maxAmount) * 100 : 0;
            return (
              <div key={index} className="flex flex-col items-center">
                <div 
                  className="w-8 bg-blue-500 rounded-t transition-all duration-300"
                  style={{ height: `${height}%` }}
                ></div>
                <div className="text-xs text-gray-600 mt-2">{month.month}</div>
                <div className="text-xs text-gray-500">{formatCurrency(month.amount)}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Orders */}
      {reportData.recentOrders.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-700 mb-4">سفارشات اخیر</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-right py-2">محصول</th>
                  <th className="text-right py-2">خریدار</th>
                  <th className="text-right py-2">مبلغ</th>
                  <th className="text-right py-2">وضعیت</th>
                  <th className="text-right py-2">تاریخ</th>
                </tr>
              </thead>
              <tbody>
                {reportData.recentOrders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="py-2">{order.product_name}</td>
                    <td className="py-2">{order.buyer_name}</td>
                    <td className="py-2">{formatCurrency(order.amount)}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </td>
                    <td className="py-2 text-xs text-gray-500">
                      {new Date(order.created_at).toLocaleDateString('fa-IR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {reportData.totalProducts === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-4">هنوز محصولی اضافه نکرده‌اید</div>
          <p className="text-gray-500">برای مشاهده گزارشات، ابتدا محصولات خود را اضافه کنید</p>
        </div>
      )}
    </div>
  );
} 