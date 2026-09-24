import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '@/services/api';
import { useCartStore } from '@/stores/useCartStore';
import { formatCurrency } from '@/utils/formatters';
import { ProductCard } from '@/components/products/ProductCard';
import {
  Star,
  ShoppingBag,
  Plus,
  Minus,
  Truck,
  ShieldCheck,
  RotateCcw,
  ArrowLeft,
  Check,
} from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const productId = Number(id);

  const [quantity, setQuantity] = useState(1);
  const { addItem, items } = useCartStore();

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => productsApi.getById(productId),
    enabled: !isNaN(productId),
  });

  const { data: allProducts } = useQuery({
    queryKey: ['products'],
    queryFn: productsApi.getAll,
  });

  const relatedProducts = (allProducts || [])
    .filter((p) => p.categoryId === product?.categoryId && p.id !== product?.id)
    .slice(0, 4);

  const isInCart = items.some((i) => i.productId === productId);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-[4/3] rounded-3xl bg-slate-200 dark:bg-slate-800" />
          <div className="space-y-4">
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
            <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-24 text-center max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Product Not Found
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          The hardware item you are looking for does not exist or has been removed.
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

  const handleAddToCart = () => {
    addItem(product, quantity);
  };

  const handleBuyNow = () => {
    addItem(product, quantity);
    navigate('/checkout');
  };

  return (
    <div className="py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to results</span>
      </button>

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Left Image View */}
        <div className="lg:col-span-6">
          <div className="relative rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl aspect-[4/3] group">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            {product.categoryName && (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-800 dark:text-slate-200 shadow-sm">
                {product.categoryName}
              </span>
            )}
          </div>
        </div>

        {/* Right Details */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex text-amber-400">
                <Star className="w-4 h-4 fill-amber-400" />
              </div>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {product.rating || 4.9}
              </span>
              <span className="text-xs text-slate-400">• Verified Customer Rating</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {product.name}
            </h1>

            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
                {formatCurrency(product.price)}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                In Stock ({product.stockQuantity || 50} units)
              </span>
            </div>
          </div>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed pt-2 border-t border-slate-200 dark:border-slate-800">
            {product.description}
          </p>

          {/* Quantity Selector & Action Buttons */}
          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Quantity:
              </span>
              <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center text-sm font-bold text-slate-900 dark:text-white">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* CTAs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <button
                onClick={handleAddToCart}
                className="py-3.5 px-6 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all"
              >
                {isInCart ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                <span>{isInCart ? 'Added To Cart' : 'Add to Cart'}</span>
              </button>

              <button
                onClick={handleBuyNow}
                className="py-3.5 px-6 rounded-xl font-bold text-sm bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 shadow-lg transition-colors flex items-center justify-center"
              >
                Buy Now
              </button>
            </div>
          </div>

          {/* Reassurance Badges */}
          <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-200 dark:border-slate-800 text-center">
            <div className="p-3 rounded-2xl bg-slate-100/70 dark:bg-slate-800/50">
              <Truck className="w-5 h-5 mx-auto text-indigo-600 dark:text-indigo-400 mb-1" />
              <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                Free Express Delivery
              </div>
              <div className="text-[10px] text-slate-400">Orders $150+</div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-100/70 dark:bg-slate-800/50">
              <ShieldCheck className="w-5 h-5 mx-auto text-emerald-600 dark:text-emerald-400 mb-1" />
              <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                2-Year Warranty
              </div>
              <div className="text-[10px] text-slate-400">100% Genuine</div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-100/70 dark:bg-slate-800/50">
              <RotateCcw className="w-5 h-5 mx-auto text-amber-600 dark:text-amber-400 mb-1" />
              <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                30-Day Returns
              </div>
              <div className="text-[10px] text-slate-400">Instant Refund</div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="mt-20 pt-12 border-t border-slate-200 dark:border-slate-800">
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mb-8">
            You Might Also Like
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
