import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useCartStore } from '@/stores/useCartStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { ordersApi, paymentsApi, couponsApi } from '@/services/api';
import { PaymentIntentResponse, CouponValidationResult } from '@/types';
import { formatCurrency } from '@/utils/formatters';
import { StripePaymentForm } from '@/components/checkout/StripePaymentForm';
import {
  ShieldCheck,
  CreditCard,
  Truck,
  ArrowRight,
  ShoppingBag,
  Loader2,
  AlertCircle,
  Tag,
  Check,
  X,
  Sparkles,
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

  const [paymentMethod, setPaymentMethod] = useState<'Credit Card' | 'COD'>('Credit Card');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Coupon state
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationResult | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [couponMsg, setCouponMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Stripe Payment Intent State
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntentResponse | null>(null);
  const [isLoadingIntent, setIsLoadingIntent] = useState(false);

  const subtotal = getTotalPrice();
  const discountAmount = appliedCoupon?.isValid ? appliedCoupon.discountAmount : 0;
  const shippingFee = subtotal >= 150 ? 0 : 9.99;
  const grandTotal = Math.max(0, subtotal - discountAmount) + shippingFee;

  // Initialize or update Payment Intent whenever cart or applied coupon changes
  useEffect(() => {
    if (items.length === 0 || !isAuthenticated) return;

    let isMounted = true;
    const initPaymentIntent = async () => {
      try {
        setIsLoadingIntent(true);
        const res = await paymentsApi.createPaymentIntent({
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          customerEmail: formData.email,
          customerName: formData.name,
          couponCode: appliedCoupon?.code,
        });

        if (isMounted && res.success && res.data) {
          setPaymentIntent(res.data);
        }
      } catch (err: any) {
        console.error('Failed to initialize payment intent:', err);
      } finally {
        if (isMounted) setIsLoadingIntent(false);
      }
    };

    initPaymentIntent();

    return () => {
      isMounted = false;
    };
  }, [items, isAuthenticated, appliedCoupon?.code]);

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
          className="px-6 py-2.5 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold text-xs uppercase"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  const handleApplyCoupon = async (codeToApply?: string) => {
    const code = (codeToApply || couponCodeInput).trim();
    if (!code) {
      setCouponMsg({ text: 'Please enter a coupon code.', isError: true });
      return;
    }

    setIsValidatingCoupon(true);
    setCouponMsg(null);

    try {
      const res = await couponsApi.validate(code, subtotal);
      if (res.success && res.data && res.data.isValid) {
        setAppliedCoupon(res.data);
        setCouponMsg({ text: res.data.message, isError: false });
        setCouponCodeInput(res.data.code);
      } else {
        setCouponMsg({ text: res.message || 'Invalid coupon code.', isError: true });
        setAppliedCoupon(null);
      }
    } catch (err: any) {
      setCouponMsg({ text: err.message || 'Could not apply coupon.', isError: true });
      setAppliedCoupon(null);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCodeInput('');
    setCouponMsg(null);
  };

  const completeOrderWithBackend = async (paymentIntentId?: string) => {
    const payload = {
      customerName: formData.name,
      customerEmail: formData.email,
      phoneNumber: formData.phone,
      shippingAddress: `${formData.address}, ${formData.city} ${formData.zip}`.trim(),
      paymentMethod,
      paymentIntentId,
      shippingFee,
      couponCode: appliedCoupon?.code,
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.address || !formData.phone) {
      setErrorMsg('Please complete all required shipping fields.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      if (paymentMethod === 'Credit Card') {
        // For local test sandbox, simulate a secure Stripe transaction
        await new Promise((r) => setTimeout(r, 1200));
        const simulatedIntentId =
          paymentIntent?.clientSecret?.startsWith('pi_') &&
          !paymentIntent.clientSecret.includes('mock')
            ? paymentIntent.clientSecret.split('_secret')[0]
            : `pi_test_${Math.random().toString(36).substring(2, 10)}`;

        await completeOrderWithBackend(simulatedIntentId);
      } else {
        // Cash on Delivery
        await completeOrderWithBackend(undefined);
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
          Complete your contact details and pay securely via Stripe or Cash on Delivery
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
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
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
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-zinc-500 text-slate-900 dark:text-white"
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
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-zinc-500 text-slate-900 dark:text-white"
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
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-zinc-500 text-slate-900 dark:text-white"
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
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-zinc-500 text-slate-900 dark:text-white"
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
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-zinc-500 text-slate-900 dark:text-white"
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
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-zinc-500 text-slate-900 dark:text-white"
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
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-zinc-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              2. Payment Method
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label
                className={`p-4 rounded-2xl border cursor-pointer flex flex-col items-center text-center gap-2 transition-all ${
                  paymentMethod === 'Credit Card'
                    ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-bold ring-1 ring-emerald-500/30'
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
                <span className="text-xs">Credit Card (Stripe)</span>
              </label>

              <label
                className={`p-4 rounded-2xl border cursor-pointer flex flex-col items-center text-center gap-2 transition-all ${
                  paymentMethod === 'COD'
                    ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-bold ring-1 ring-emerald-500/30'
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
                <span className="text-xs">Cash on Delivery (COD)</span>
              </label>
            </div>

            {/* Credit Card / Stripe Form */}
            {paymentMethod === 'Credit Card' && (
              <div className="pt-2 animate-fade-in">
                {isLoadingIntent ? (
                  <div className="py-8 flex items-center justify-center gap-2 text-xs text-slate-500">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                    <span>Connecting to Stripe secure gateway...</span>
                  </div>
                ) : (
                  <StripePaymentForm
                    clientSecret={paymentIntent?.clientSecret}
                    publishableKey={paymentIntent?.publishableKey}
                    amount={grandTotal}
                    onPaymentSuccess={completeOrderWithBackend}
                    isSubmitting={isSubmitting}
                    setIsSubmitting={setIsSubmitting}
                    errorMessage={errorMsg}
                    setErrorMessage={setErrorMsg}
                  />
                )}
              </div>
            )}

            {/* COD info */}
            {paymentMethod === 'COD' && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-3 animate-fade-in">
                <Truck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <span>
                  You will pay <strong className="text-slate-900 dark:text-white">{formatCurrency(grandTotal)}</strong> directly in cash to the courier upon receiving your package.
                </span>
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

            {/* Coupon / Voucher Section */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
              <label className="block text-xs font-bold uppercase text-slate-500 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-emerald-500" />
                <span>Promotional Voucher</span>
              </label>

              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <span className="font-extrabold text-emerald-800 dark:text-emerald-300 font-mono tracking-wider">
                        {appliedCoupon.code}
                      </span>
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
                        {appliedCoupon.description}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                    title="Remove coupon"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCodeInput}
                      onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                      placeholder="e.g. WELCOME10"
                      className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white uppercase font-mono focus:outline-none focus:border-zinc-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleApplyCoupon()}
                      disabled={isValidatingCoupon || !couponCodeInput.trim()}
                      className="px-4 py-2 text-xs font-bold rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      {isValidatingCoupon ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <span>Apply</span>
                      )}
                    </button>
                  </div>

                  {couponMsg && (
                    <p
                      className={`text-[11px] font-medium ${
                        couponMsg.isError
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {couponMsg.text}
                    </p>
                  )}

                  {/* Quick Suggestions Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Try:</span>
                    <button
                      type="button"
                      onClick={() => handleApplyCoupon('WELCOME10')}
                      className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-600 transition-colors font-mono cursor-pointer"
                    >
                      WELCOME10 (-10%)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyCoupon('TECH50')}
                      className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-600 transition-colors font-mono cursor-pointer"
                    >
                      TECH50 (-$50)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyCoupon('FREESHIP')}
                      className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-600 transition-colors font-mono cursor-pointer"
                    >
                      FREESHIP
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Total Lines */}
            <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formatCurrency(subtotal)}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Coupon ({appliedCoupon?.code})</span>
                  </span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-500">
                <span>Shipping</span>
                <span className="font-semibold text-emerald-600">
                  {shippingFee === 0 ? 'FREE' : formatCurrency(shippingFee)}
                </span>
              </div>

              <div className="flex justify-between text-base font-extrabold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-800">
                <span>Total Due</span>
                <span className="text-zinc-900 dark:text-zinc-100">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 font-bold text-sm shadow-xl shadow-zinc-950/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>
                    {paymentMethod === 'Credit Card'
                      ? 'Processing Stripe Payment...'
                      : 'Placing Order...'}
                  </span>
                </>
              ) : (
                <>
                  <span>
                    {paymentMethod === 'Credit Card'
                      ? `Pay with Card • ${formatCurrency(grandTotal)}`
                      : `Place Order • ${formatCurrency(grandTotal)}`}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Stripe 256-bit SSL Encrypted Transaction</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
