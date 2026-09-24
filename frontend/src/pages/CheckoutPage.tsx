import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useCartStore } from '@/stores/useCartStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { ordersApi } from '@/services/api';
import { formatCurrency } from '@/utils/formatters';
import {
  ShieldCheck,
  CreditCard,
  QrCode,
  Truck,
  ArrowRight,
  ShoppingBag,
  Loader2,
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
    }
  }, [isAuthenticated, navigate]);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    zip: '',
    notes: '',
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.name || '',
        email: prev.email || user.email || '',
      }));
    }
  }, [user]);

  const [paymentMethod, setPaymentMethod] = useState<'Credit Card' | 'QR Pay' | 'COD'>(
    'Credit Card'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const subtotal = getTotalPrice();
  const shippingFee = subtotal >= 150 ? 0 : 9.99;
  const grandTotal = subtotal + shippingFee;

  if (!isAuthenticated) {
    return null;
  }

  if (items.length === 0) {
    return (
      <div className="py-24 text-center max-w-md mx-auto">
        <ShoppingBag className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          Your cart is empty
        </h2>
        <p className="text-xs text-slate-500 mb-6">
          Add items to your cart before proceeding to checkout.
        </p>
        <button
          onClick={() => navigate('/shop')}
          className="px-6 py-2.5 rounded-full bg-indigo-600 text-white font-bold text-xs uppercase"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.address || !formData.phone) {
      setErrorMsg('Please complete all required shipping fields.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const payload = {
        customerName: formData.name,
        customerEmail: formData.email,
        phoneNumber: formData.phone,
        shippingAddress: `${formData.address}, ${formData.city} ${formData.zip}`.trim(),
        paymentMethod,
        notes: formData.notes,
        items: items.map((i) => ({
          productId: i.productId,
          productName: i.name,
          productImage: i.image,
          price: i.price,
          quantity: i.quantity,
        })),
      };

      const res = await ordersApi.create(payload);
      if (res.success && res.data) {
        queryClient.invalidateQueries({ queryKey: ['all-orders'] });
        queryClient.invalidateQueries({ queryKey: ['my-orders'] });
        clearCart();
        navigate(`/order-success/${res.data.id}`, { state: { order: res.data } });
      } else {
        throw new Error(res.message || 'Failed to place order.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while placing the order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8 pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Secure Checkout
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Complete your contact details and choose your preferred payment method
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Shipping & Payment Details */}
        <div className="lg:col-span-7 space-y-8">
          {/* Shipping Form */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              1. Shipping Address
            </h2>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. john@example.com"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. +1 555-0199"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Street Address *
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g. 123 Tech Avenue, Apt 4B"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g. San Francisco"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={formData.zip}
                  onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                  placeholder="e.g. 94107"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Order Delivery Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Special instructions for the courier..."
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              2. Payment Method
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label
                className={`p-4 rounded-2xl border cursor-pointer flex flex-col items-center text-center gap-2 transition-all ${
                  paymentMethod === 'Credit Card'
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'Credit Card'}
                  onChange={() => setPaymentMethod('Credit Card')}
                  className="sr-only"
                />
                <CreditCard className="w-6 h-6" />
                <span className="text-xs font-bold">Credit Card</span>
              </label>

              <label
                className={`p-4 rounded-2xl border cursor-pointer flex flex-col items-center text-center gap-2 transition-all ${
                  paymentMethod === 'QR Pay'
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'QR Pay'}
                  onChange={() => setPaymentMethod('QR Pay')}
                  className="sr-only"
                />
                <QrCode className="w-6 h-6" />
                <span className="text-xs font-bold">Instant QR Pay</span>
              </label>

              <label
                className={`p-4 rounded-2xl border cursor-pointer flex flex-col items-center text-center gap-2 transition-all ${
                  paymentMethod === 'COD'
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="sr-only"
                />
                <Truck className="w-6 h-6" />
                <span className="text-xs font-bold">Cash on Delivery</span>
              </label>
            </div>

            {paymentMethod === 'Credit Card' && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-3 animate-fade-in text-xs">
                <input
                  type="text"
                  placeholder="Card Number (4242 4242 4242 4242)"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="MM / YY"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="CVC"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Order Review Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Order Review ({items.length} items)
            </h3>

            {/* Items scroll */}
            <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 pr-1">
              {items.map((item) => (
                <div key={item.productId} className="py-3 flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded-xl border border-slate-100 dark:border-slate-800 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                      {item.name}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Qty: {item.quantity} × {formatCurrency(item.price)}
                    </p>
                  </div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {formatCurrency(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            {/* Total Lines */}
            <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Shipping</span>
                <span className="font-semibold text-emerald-600">
                  {shippingFee === 0 ? 'FREE' : formatCurrency(shippingFee)}
                </span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-800">
                <span>Total Due</span>
                <span className="text-indigo-600 dark:text-indigo-400">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Order...</span>
                </>
              ) : (
                <>
                  <span>Place Order • {formatCurrency(grandTotal)}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>256-bit SSL Encrypted Transaction</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
