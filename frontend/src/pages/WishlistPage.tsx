import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlistStore } from '@/stores/useWishlistStore';
import { useCartStore } from '@/stores/useCartStore';
import { formatCurrency } from '@/utils/formatters';
import {
  Heart,
  ShoppingBag,
  Trash2,
  ArrowRight,
  Star,
  Check,
  PackageX,
  Sparkles,
} from 'lucide-react';

export const WishlistPage: React.FC = () => {
  const navigate = useNavigate();
  const { items: wishlistItems, removeItem, clearWishlist } = useWishlistStore();
  const { addItem, items: cartItems } = useCartStore();

  const handleMoveToCart = (product: any) => {
    addItem(product, 1);
    removeItem(product.id);
  };

  const handleMoveAllToCart = () => {
    wishlistItems.forEach((p) => addItem(p, 1));
    clearWishlist();
  };

  return (
    <div className="py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-rose-500 uppercase tracking-wider mb-1">
            <Heart className="w-3.5 h-3.5 fill-rose-500" />
            <span>Saved Favorites</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            My Wishlist ({wishlistItems.length})
          </h1>
        </div>

        {wishlistItems.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              onClick={clearWishlist}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Clear All
            </button>
            <button
              onClick={handleMoveAllToCart}
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 transition-all flex items-center gap-2 shadow-sm"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Move All to Cart</span>
            </button>
          </div>
        )}
      </div>

      {/* Empty State */}
      {wishlistItems.length === 0 ? (
        <div className="py-20 text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center mx-auto mb-4 border border-rose-100 dark:border-rose-900/60">
            <Heart className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">
            Your Wishlist is Empty
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
            Explore our curated catalog of elite tech gear and tap the heart icon on any product to save it for later.
          </p>
          <button
            onClick={() => navigate('/shop')}
            className="px-6 py-3 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity inline-flex items-center gap-2"
          >
            <span>Explore Store</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* Wishlist Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((product) => {
            const isInCart = cartItems.some((i) => i.productId === product.id);

            return (
              <div
                key={product.id}
                className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden"
              >
                {/* Image Container */}
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <Link to={`/product/${product.id}`}>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                  </Link>

                  {/* Category Pill Tag */}
                  {product.categoryName && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 text-[11px] font-bold rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-800 dark:text-slate-200 shadow-sm">
                      {product.categoryName}
                    </span>
                  )}

                  {/* Remove Button */}
                  <button
                    onClick={() => removeItem(product.id)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/90 dark:bg-slate-900/90 text-rose-500 shadow-sm hover:bg-rose-500 hover:text-white transition-colors"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Rating */}
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div className="flex text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                      </div>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {product.rating ? product.rating.toFixed(1) : '4.8'}
                      </span>
                    </div>

                    {/* Title */}
                    <Link to={`/product/${product.id}`}>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-primary-500 transition-colors">
                        {product.name}
                      </h3>
                    </Link>

                    <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-baseline justify-between mb-3">
                      <span className="text-base font-extrabold text-slate-900 dark:text-white">
                        {formatCurrency(product.price)}
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        In Stock ({product.stockQuantity || 50})
                      </span>
                    </div>

                    <button
                      onClick={() => handleMoveToCart(product)}
                      className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{isInCart ? 'Add Another to Cart' : 'Move to Cart'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
