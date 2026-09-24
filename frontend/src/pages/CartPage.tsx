import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '@/stores/useCartStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { formatCurrency } from '@/utils/formatters';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Tag, ArrowLeft } from 'lucide-react';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { items, updateQuantity, removeItem, clearCart, getTotalPrice } = useCartStore();
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoError, setPromoError] = useState('');

  const subtotal = getTotalPrice();
  const discountAmount = (subtotal * discountPercent) / 100;
  const shippingFee = subtotal >= 150 || subtotal === 0 ? 0 : 9.99;
  const finalTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  const applyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'TECH10') {
      setDiscountPercent(10);
      setPromoError('');
    } else {
      setPromoError('Invalid promo code. Try "TECH10" for 10% off!');
    }
  };

  if (items.length === 0) {
    return (
      <div className="py-24 text-center max-w-md mx-auto px-4">
        <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-4">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Your shopping cart is empty
        </h2>
        <p className="text-sm text-slate-500 mb-8">
          Browse our collections and discover the latest electronics and gear.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg"
        >
          <span>Explore Products</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Shopping Cart
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review your items before proceeding to checkout
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-rose-500 hover:text-rose-600 transition-colors"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm divide-y divide-slate-100 dark:divide-slate-800 p-2 sm:p-4">
            {items.map((item) => (
              <div
                key={item.productId}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-2xl border border-slate-100 dark:border-slate-800 flex-shrink-0"
                  />
                  <div>
                    <Link
                      to={`/product/${item.productId}`}
                      className="text-sm sm:text-base font-bold text-slate-900 dark:text-white hover:text-indigo-600 transition-colors"
                    >
                      {item.name}
                    </Link>
                    <div className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-1">
                      {formatCurrency(item.price)} each
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="p-1.5 text-slate-500 hover:text-indigo-600"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-slate-900 dark:text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="p-1.5 text-slate-500 hover:text-indigo-600"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Subtotal & Delete */}
                  <div className="text-right min-w-[80px]">
                    <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                      {formatCurrency(item.price * item.quantity)}
                    </div>
                  </div>

                  <button
                    onClick={() => removeItem(item.productId)}
                    className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline pt-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Continue Shopping</span>
          </Link>
        </div>

        {/* Order Summary & Coupon Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 space-y-5">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Order Summary
            </h3>

            {/* Coupon Box */}
            <form onSubmit={applyPromo} className="space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Coupon code (e.g. TECH10)"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white uppercase"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-bold transition-colors"
                >
                  Apply
                </button>
              </div>
              {discountPercent > 0 && (
                <p className="text-xs text-emerald-600 font-semibold">
                  Coupon applied: {discountPercent}% discount!
                </p>
              )}
              {promoError && (
                <p className="text-xs text-rose-500 font-semibold">{promoError}</p>
              )}
            </form>

            {/* Calculation Lines */}
            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formatCurrency(subtotal)}
                </span>
              </div>

              {discountPercent > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount ({discountPercent}%)</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Shipping Estimate</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {shippingFee === 0 ? 'FREE' : formatCurrency(shippingFee)}
                </span>
              </div>

              <div className="flex justify-between text-base font-extrabold text-slate-900 dark:text-white pt-3 border-t border-slate-200 dark:border-slate-800">
                <span>Grand Total</span>
                <span className="text-indigo-600 dark:text-indigo-400">
                  {formatCurrency(finalTotal)}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                if (!isAuthenticated) {
                  navigate('/login?redirect=/checkout');
                } else {
                  navigate('/checkout');
                }
              }}
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
