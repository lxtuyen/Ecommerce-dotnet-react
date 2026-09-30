import React from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import { CheckCircle2, Package, Home, CreditCard, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

export const OrderSuccessPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const order = location.state?.order;

  return (
    <div className="py-16 sm:py-24 max-w-2xl mx-auto px-4 text-center">
      {/* Success Badge */}
      <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/10">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
        Order Confirmed & Verified
      </span>
      <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-1 mb-3">
        Thank You for Your Order!
      </h1>
      <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
        Your order <strong className="text-zinc-900 dark:text-zinc-100">#{id}</strong> has been received and is now being processed by our fulfillment center.
      </p>

      {/* Order Card Preview */}
      {order && (
        <div className="mt-10 p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 text-left shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase">Payment Status</span>
              <div className="mt-1">
                {order.paymentStatus === 'Paid' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Paid (Stripe Verified)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
                    Payment Pending ({order.paymentMethod})
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Total Amount</span>
              <p className="text-base font-extrabold text-slate-900 dark:text-white">
                {formatCurrency(order.totalAmount)}
              </p>
            </div>
          </div>

          <div className="text-xs space-y-1.5 text-slate-600 dark:text-slate-400">
            <p>
              <strong className="text-slate-900 dark:text-white">Recipient:</strong> {order.customerName}
            </p>
            <p>
              <strong className="text-slate-900 dark:text-white">Email:</strong> {order.customerEmail}
            </p>
            <p>
              <strong className="text-slate-900 dark:text-white">Shipping Address:</strong> {order.shippingAddress}
            </p>
            <p className="flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-slate-400" />
              <strong className="text-slate-900 dark:text-white">Method:</strong> {order.paymentMethod}
              {order.paymentIntentId && (
                <span className="text-[11px] text-slate-400 font-mono">
                  (Ref: {order.paymentIntentId})
                </span>
              )}
            </p>
            {order.couponCode && (
              <p className="text-emerald-600 dark:text-emerald-400 font-semibold">
                <strong>Coupon Discount:</strong> {order.couponCode} (-{formatCurrency(order.discountAmount || 0)})
              </p>
            )}
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mt-8">
        <Link
          to="/orders"
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-zinc-950/20 transition-all"
        >
          <Package className="w-4 h-4" />
          <span>Track My Orders</span>
        </Link>
        <Link
          to="/"
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs uppercase tracking-wider border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  );
};
