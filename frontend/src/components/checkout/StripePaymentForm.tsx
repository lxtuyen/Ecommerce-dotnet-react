import React, { useState, useEffect } from 'react';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { CreditCard, Lock, Sparkles, CheckCircle2 } from 'lucide-react';

interface StripePaymentFormProps {
  clientSecret?: string;
  publishableKey?: string;
  amount: number;
  onPaymentSuccess: (paymentIntentId: string) => Promise<void>;
  isSubmitting: boolean;
  setIsSubmitting: (submitting: boolean) => void;
  errorMessage: string;
  setErrorMessage: (msg: string) => void;
}

const RealStripeCheckout: React.FC<{
  onPaymentSuccess: (paymentIntentId: string) => Promise<void>;
  isSubmitting: boolean;
  setIsSubmitting: (submitting: boolean) => void;
  setErrorMessage: (msg: string) => void;
}> = ({ onPaymentSuccess, isSubmitting, setIsSubmitting, setErrorMessage }) => {
  const stripe = useStripe();
  const elements = useElements();

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });

      if (error) {
        setErrorMessage(error.message || 'Payment processing failed. Please check your card info.');
        setIsSubmitting(false);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        await onPaymentSuccess(paymentIntent.id);
      } else {
        setErrorMessage('Payment did not complete. Status: ' + (paymentIntent?.status || 'Unknown'));
        setIsSubmitting(false);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during Stripe payment confirmation.');
      setIsSubmitting(false);
    }
  };

  return (
    <div id="stripe-real-form" className="space-y-4">
      <PaymentElement
        options={{
          layout: 'tabs',
        }}
      />
    </div>
  );
};

export const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  clientSecret,
  publishableKey,
  amount,
  onPaymentSuccess,
  isSubmitting,
  setIsSubmitting,
  errorMessage,
  setErrorMessage,
}) => {
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);

  // Simulated Test Card state for local testing when keys are placeholder
  const [testCard, setTestCard] = useState({
    number: '4242 4242 4242 4242',
    expiry: '12/28',
    cvc: '123',
    zip: '94107',
  });

  const isRealStripeKey =
    Boolean(publishableKey) &&
    (publishableKey?.startsWith('pk_test_') || publishableKey?.startsWith('pk_live_')) &&
    !publishableKey.includes('MockKey') &&
    !publishableKey.includes('ReplaceWith');

  useEffect(() => {
    if (isRealStripeKey && publishableKey) {
      setStripePromise(loadStripe(publishableKey));
    }
  }, [isRealStripeKey, publishableKey]);

  const handleFillDemoCard = () => {
    setTestCard({
      number: '4242 4242 4242 4242',
      expiry: '12/28',
      cvc: '314',
      zip: '94107',
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Stripe Secure Card Payment
          </span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-slate-500">
          <Lock className="w-3.5 h-3.5 text-emerald-500" />
          <span>End-to-End Encrypted</span>
        </div>
      </div>

      {isRealStripeKey && clientSecret && stripePromise ? (
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: {
              theme: 'night',
              variables: {
                colorPrimary: '#10b981',
                borderRadius: '12px',
              },
            },
          }}
        >
          <RealStripeCheckout
            onPaymentSuccess={onPaymentSuccess}
            isSubmitting={isSubmitting}
            setIsSubmitting={setIsSubmitting}
            setErrorMessage={setErrorMessage}
          />
        </Elements>
      ) : (
        /* Intelligent Test Sandbox for instant development verification */
        <div className="space-y-3.5 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80">
          <div className="flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
              <Sparkles className="w-3 h-3" />
              Stripe Test Sandbox
            </span>
            <button
              type="button"
              onClick={handleFillDemoCard}
              className="text-[11px] text-zinc-600 dark:text-zinc-300 hover:text-emerald-600 underline font-medium cursor-pointer"
            >
              Fill standard test card
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Card Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={testCard.number}
                  onChange={(e) => setTestCard({ ...testCard, number: e.target.value })}
                  placeholder="4242 4242 4242 4242"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono"
                />
                <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Expires
                </label>
                <input
                  type="text"
                  value={testCard.expiry}
                  onChange={(e) => setTestCard({ ...testCard, expiry: e.target.value })}
                  placeholder="MM/YY"
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono text-center"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  CVC
                </label>
                <input
                  type="text"
                  value={testCard.cvc}
                  onChange={(e) => setTestCard({ ...testCard, cvc: e.target.value })}
                  placeholder="123"
                  maxLength={4}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono text-center"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={testCard.zip}
                  onChange={(e) => setTestCard({ ...testCard, zip: e.target.value })}
                  placeholder="94107"
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono text-center"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
            <span>Ready for instant test order confirmation. Real Stripe keys can be set in backend config.</span>
          </div>
        </div>
      )}
    </div>
  );
};
