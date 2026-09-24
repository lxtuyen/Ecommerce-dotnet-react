import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingBag, Check } from 'lucide-react';
import { Product } from '@/types';
import { useCartStore } from '@/stores/useCartStore';
import { formatCurrency } from '@/utils/formatters';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem, items } = useCartStore();
  const isInCart = items.some((i) => i.productId === product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
  };

  return (
    <div className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Image Thumbnail Container */}
      <Link to={`/product/${product.id}`} className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        {/* Category Pill Tag */}
        {product.categoryName && (
          <span className="absolute top-3 left-3 px-2.5 py-1 text-[11px] font-bold rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-800 dark:text-slate-200 shadow-sm">
            {product.categoryName}
          </span>
        )}
        {/* Stock Badge */}
        {product.stockQuantity <= 5 && product.stockQuantity > 0 && (
          <span className="absolute bottom-3 left-3 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-rose-500 text-white shadow-sm">
            Only {product.stockQuantity} Left
          </span>
        )}
      </Link>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="flex text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
            </div>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {product.rating || 4.8}
            </span>
          </div>

          {/* Title */}
          <Link to={`/product/${product.id}`}>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Description snippet */}
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price & Action Button */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block -mb-0.5">
              Price
            </span>
            <span className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
              {formatCurrency(product.price)}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            className={`p-2.5 rounded-xl font-semibold text-xs transition-all flex items-center gap-1.5 ${
              isInCart
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/35'
            }`}
            title="Add to cart"
          >
            {isInCart ? (
              <>
                <Check className="w-4 h-4" />
                <span className="hidden sm:inline">Added</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline">Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
