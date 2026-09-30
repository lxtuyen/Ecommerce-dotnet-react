import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '@/services/api';
import { useAuthStore } from '@/stores/useAuthStore';
import { formatCurrency, formatDate } from '@/utils/formatters';
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  AlertCircle,
  ShoppingBag,
  RefreshCw,
  XCircle,
  ShieldCheck,
  RotateCcw,
  Loader2,
} from 'lucide-react';

export const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();

  // State for cancel order modal
  const [cancellingOrderId, setCancellingOrderId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState('Changed my mind');
  const [customReason, setCustomReason] = useState('');
  const [cancelError, setCancelError] = useState('');

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

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      ordersApi.cancel(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      queryClient.invalidateQueries({ queryKey: ['all-orders'] });
      setCancellingOrderId(null);
      setCustomReason('');
      setCancelError('');
    },
    onError: (err: any) => {
      setCancelError(err.message || 'Failed to cancel order.');
    },
  });

  const handleConfirmCancel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancellingOrderId) return;
    const finalReason = cancelReason === 'Other' ? customReason : cancelReason;
    cancelMutation.mutate({ id: cancellingOrderId, reason: finalReason });
  };

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
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
            <XCircle className="w-3.5 h-3.5" /> Cancelled
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

  const getPaymentStatusBadge = (paymentStatus?: string) => {
    switch (paymentStatus?.toLowerCase()) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
            <ShieldCheck className="w-3 h-3" /> Paid
          </span>
        );
      case 'refunded':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800/60">
            <RotateCcw className="w-3 h-3" /> Refunded
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
            Payment Pending
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
          className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs shadow-sm transition-all disabled:opacity-50 cursor-pointer"
          title="Refresh orders list"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 text-zinc-900 dark:text-zinc-100 ${
              isFetching ? 'animate-spin' : ''
            }`}
          />
          <span>{isFetching ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-36 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
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
          {orders.map((order) => {
            const canCancel =
              order.status?.toLowerCase() === 'pending' ||
              order.status?.toLowerCase() === 'processing';

            return (
              <div
                key={order.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4"
              >
                {/* Order Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        Order #{order.id}
                      </span>
                      {getPaymentStatusBadge(order.paymentStatus)}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Placed on {formatDate(order.createdDateTime)} • {order.paymentMethod}
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

                {/* Cancellation Notice if Cancelled */}
                {order.status?.toLowerCase() === 'cancelled' && (
                  <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-700 dark:text-rose-300">
                    <p className="font-bold flex items-center gap-1.5">
                      <XCircle className="w-3.5 h-3.5" /> Order Cancelled
                    </p>
                    {order.cancelReason && (
                      <p className="text-[11px] mt-0.5 text-rose-600 dark:text-rose-400">
                        Reason: {order.cancelReason}
                      </p>
                    )}
                    <p className="text-[11px] mt-1 text-slate-500">
                      All item stock has been restored to inventory.
                    </p>
                  </div>
                )}

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

                {/* Order Action Buttons */}
                {canCancel && (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <button
                      onClick={() => {
                        setCancellingOrderId(order.id);
                        setCancelError('');
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 transition-colors cursor-pointer"
                    >
                      Cancel Order
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancellingOrderId !== null && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4 animate-scale-in">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Cancel Order #{cancellingOrderId}?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Your items will be automatically returned to store stock. If you have already paid via Stripe card, your payment status will be updated to Refunded.
              </p>
            </div>

            {cancelError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                {cancelError}
              </div>
            )}

            <form onSubmit={handleConfirmCancel} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Reason for Cancellation
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-zinc-500"
                >
                  <option value="Changed my mind">Changed my mind</option>
                  <option value="Found a better price elsewhere">Found a better price elsewhere</option>
                  <option value="Created order by mistake">Created order by mistake</option>
                  <option value="Shipping time is too long">Shipping time is too long</option>
                  <option value="Other">Other reason...</option>
                </select>
              </div>

              {cancelReason === 'Other' && (
                <div>
                  <textarea
                    rows={2}
                    required
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Please specify why you are cancelling..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-zinc-500"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setCancellingOrderId(null)}
                  disabled={cancelMutation.isPending}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Keep Order
                </button>
                <button
                  type="submit"
                  disabled={cancelMutation.isPending}
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-lg shadow-rose-600/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {cancelMutation.isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Cancelling...</span>
                    </>
                  ) : (
                    <span>Confirm Cancel</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
