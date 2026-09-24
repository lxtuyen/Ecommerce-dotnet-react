import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '@/services/api';
import { useAuthStore } from '@/stores/useAuthStore';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Package, Clock, CheckCircle2, Truck, AlertCircle, ShoppingBag, RefreshCw } from 'lucide-react';

export const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const {
    data: orders,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['my-orders'],
    queryFn: ordersApi.getMyOrders,
    enabled: isAuthenticated,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" /> Delivered
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300">
            <Truck className="w-3.5 h-3.5" /> Shipped
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
            <Clock className="w-3.5 h-3.5" /> Processing
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <AlertCircle className="w-3.5 h-3.5" /> {status || 'Pending'}
          </span>
        );
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="py-24 text-center max-w-md mx-auto px-4">
        <Package className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          Sign In to Track Your Orders
        </h2>
        <p className="text-xs text-slate-500 mb-6">
          Access your real-time delivery status, order invoices and item history.
        </p>
        <button
          onClick={() => navigate('/login')}
          className="px-6 py-2.5 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white font-bold text-xs uppercase"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  return (
    <div className="py-8 sm:py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8 pb-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            My Order History
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review all your current orders, tracked delivery and purchased hardware ({orders?.length || 0} total)
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs shadow-sm transition-all disabled:opacity-50"
          title="Làm mới lịch sử đơn hàng"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 text-zinc-900 dark:text-zinc-100 ${
              isFetching ? 'animate-spin' : ''
            }`}
          />
          <span>{isFetching ? 'Đang cập nhật...' : 'Làm mới'}</span>
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-32 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
            />
          ))}
        </div>
      ) : !orders || orders.length === 0 ? (
        <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
          <ShoppingBag className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            No orders found
          </h3>
          <p className="text-xs text-slate-500 mb-6">
            You have not placed any orders yet.
          </p>
          <Link
            to="/shop"
            className="px-5 py-2.5 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white text-xs font-bold uppercase"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4"
            >
              {/* Order Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
                <div>
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    Order #{order.id}
                  </span>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Placed on {formatDate(order.createdDateTime)}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {getStatusBadge(order.status)}
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Total Amount
                    </span>
                    <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Items list */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {order.orderItems?.map((item) => (
                  <div key={item.id || item.productId} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {item.productImage && (
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-12 h-12 object-cover rounded-xl border border-slate-100 dark:border-slate-800"
                        />
                      )}
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          {item.productName}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Qty: {item.quantity} × {formatCurrency(item.price)}
                        </p>
                      </div>
                    </div>

                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      {formatCurrency(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
