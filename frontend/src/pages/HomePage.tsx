import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '@/services/api';
import { HeroSection } from '@/components/home/HeroSection';
import { CategorySection } from '@/components/home/CategorySection';
import { ProductCard } from '@/components/products/ProductCard';
import { ArrowRight, Sparkles, TrendingUp } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: productsApi.getAll,
  });

  const featuredProducts = (products || []).slice(0, 8);

  return (
    <div>
      {/* Hero Banner */}
      <HeroSection />

      {/* Category Pills & Grid */}
      <CategorySection />

      {/* Trending & Featured Products */}
      <section className="py-12 sm:py-16 bg-slate-100/60 dark:bg-slate-900/40 border-y border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span>Hand-picked recommendations</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Featured Flagships &amp; New Tech
              </h2>
            </div>
            <Link
              to="/shop"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors"
            >
              <span>Explore All Hardware</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Product Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse p-4 flex flex-col justify-between"
                >
                  <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                  <div className="space-y-2 mt-4">
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Modern Promotional Callout Banner */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-950 text-white p-8 sm:p-12 lg:p-16 shadow-2xl">
            <div className="max-w-xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-400/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Limited Seasonal Deal</span>
              </div>
              <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Upgrade Your Workspace Setup with M3 Max Workstations
              </h3>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Enjoy exceptional performance, Liquid Retina displays, and zero-interest installment options with free express delivery.
              </p>
              <div className="pt-2">
                <Link
                  to="/shop?category=Laptops"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-slate-900 font-bold text-xs uppercase tracking-wider hover:bg-slate-100 transition-colors shadow-lg"
                >
                  <span>Explore Laptops</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
