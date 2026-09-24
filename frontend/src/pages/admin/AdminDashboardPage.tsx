import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productsApi, categoriesApi, ordersApi } from '@/services/api';
import { formatCurrency, formatDate } from '@/utils/formatters';
import {
  DollarSign,
  Package,
  ShoppingBag,
  Layers,
  ArrowRight,
  Plus,
  RefreshCw,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { data: products, refetch: refetchProducts } = useQuery({
    queryKey: ['products'],
    queryFn: productsApi.getAll,
    staleTime: 0,
    refetchOnMount: 'always',
  });
  const { data: categories, refetch: refetchCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
    staleTime: 0,
    refetchOnMount: 'always',
  });
  const {
    data: orders,
    refetch: refetchOrders,
    isFetching: isFetchingOrders,
  } = useQuery({
    queryKey: ['all-orders'],
    queryFn: ordersApi.getAll,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const handleRefreshAll = () => {
    refetchOrders();
    refetchProducts();
    refetchCategories();
  };

  const totalRevenue = (orders || []).reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const recentOrders = (orders || []).slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Dashboard Overview
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time business performance and catalog health
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefreshAll}
            disabled={isFetchingOrders}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs shadow-sm transition-all disabled:opacity-50"
            title="Làm mới số liệu Dashboard"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 ${
                isFetchingOrders ? 'animate-spin' : ''
              }`}
            />
            <span>{isFetchingOrders ? 'Đang cập nhật...' : 'Làm mới'}</span>
          </button>
          <Link
            to="/admin/products"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Product</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Revenue */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-400">Total Revenue</span>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white">
              {formatCurrency(totalRevenue)}
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-400">Total Orders</span>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white">
              {orders?.length || 0}
            </div>
          </div>
        </div>

        {/* Active Products */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-400">Active Products</span>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white">
              {products?.length || 0}
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-400">Categories</span>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white">
              {categories?.length || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Recent Orders
          </h2>
          <Link
            to="/admin/orders"
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            No customer orders placed yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-2.5 px-3">Order ID</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-3 font-bold text-indigo-600 dark:text-indigo-400">
                      #{o.id}
                    </td>
                    <td className="py-3 px-3 text-slate-900 dark:text-white font-medium">
                      {o.customerName}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      {formatDate(o.createdDateTime)}
                    </td>
                    <td className="py-3 px-3 text-right font-extrabold text-slate-900 dark:text-white">
                      {formatCurrency(o.totalAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
