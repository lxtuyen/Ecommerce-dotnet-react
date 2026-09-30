import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '@/services/api';
import { HeroSection } from '@/components/home/HeroSection';
import { CategorySection } from '@/components/home/CategorySection';
import { ProductCard } from '@/components/products/ProductCard';
import { ArrowRight, Sparkles, TrendingUp, Cpu, Monitor, Zap } from 'lucide-react';

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
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span>Hand-picked recommendations</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Featured Flagships &amp; New Tech
              </h2>
            </div>
            <Link
              to="/shop"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-zinc-100 hover:text-zinc-900 dark:hover:text-white transition-colors"
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
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-zinc-100 via-slate-50 to-zinc-200/80 dark:from-zinc-900 dark:via-zinc-900/95 dark:to-zinc-950 text-zinc-900 dark:text-white p-8 sm:p-12 lg:p-16 shadow-xl dark:shadow-2xl border border-zinc-200/80 dark:border-zinc-800 transition-colors">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-zinc-300/40 dark:bg-zinc-700/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

            <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Column: Text & CTA */}
              <div className="lg:col-span-7 space-y-6 text-left">
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-zinc-900 dark:text-white">
                  Upgrade Your Workspace Setup with M3 Max Workstations
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base leading-relaxed max-w-xl">
                  Enjoy exceptional performance, Liquid Retina displays, and zero-interest installment options with free express delivery.
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-4">
                  <Link
                    to="/shop?category=Laptops"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-electric hover:shadow-electric-lg group"
                  >
                    <span>Explore Laptops</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                    Starting from $1,699.99
                  </span>
                </div>
              </div>

              {/* Right Column: High-end Showcase Visual (Floating Glass Card) */}
              <div className="lg:col-span-5 relative flex items-center justify-center">
                <div className="relative group w-full max-w-md">
                  {/* Ambient Backdrop Halo */}
                  <div className="absolute -inset-1.5 bg-gradient-to-tr from-primary-400/30 via-slate-200/40 to-primary-500/20 dark:from-primary-600/30 dark:via-zinc-700/40 dark:to-primary-500/20 rounded-3xl blur-2xl opacity-60 group-hover:opacity-85 transition duration-700" />

                  {/* Main Floating Glass Container */}
                  <div className="relative rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-700/80 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl shadow-xl dark:shadow-2xl p-4 sm:p-5 flex flex-col gap-4 text-zinc-900 dark:text-white transition-colors">

                    {/* Image Frame with Depth */}
                    <div className="relative rounded-2xl overflow-hidden bg-zinc-100 dark:bg-black/60 border border-zinc-200/80 dark:border-zinc-800 group/img">
                      <img
                        src="https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=80"
                        alt="MacBook Pro 16 M3 Max"
                        className="w-full h-48 sm:h-52 object-cover object-center group-hover/img:scale-105 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-4">
                        <div>
                          <p className="text-xs uppercase tracking-widest text-zinc-300 font-semibold">Pro Workstation</p>
                          <h4 className="text-lg font-extrabold text-white tracking-tight">MacBook Pro 16&quot; M3 Max</h4>
                        </div>
                      </div>
                    </div>

                    {/* Tech Spec Badges Grid */}
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <div className="rounded-xl bg-zinc-100/90 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 p-2.5 text-center transition-colors">
                        <div className="flex items-center justify-center text-zinc-700 dark:text-zinc-300 mb-1">
                          <Cpu className="w-3.5 h-3.5" />
                        </div>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium uppercase">Chip</p>
                        <p className="text-xs font-bold text-zinc-900 dark:text-white tracking-tight">M3 Max</p>
                      </div>

                      <div className="rounded-xl bg-zinc-100/90 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 p-2.5 text-center transition-colors">
                        <div className="flex items-center justify-center text-zinc-700 dark:text-zinc-300 mb-1">
                          <Zap className="w-3.5 h-3.5" />
                        </div>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium uppercase">Memory</p>
                        <p className="text-xs font-bold text-zinc-900 dark:text-white tracking-tight">36GB</p>
                      </div>

                      <div className="rounded-xl bg-zinc-100/90 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 p-2.5 text-center transition-colors">
                        <div className="flex items-center justify-center text-zinc-700 dark:text-zinc-300 mb-1">
                          <Monitor className="w-3.5 h-3.5" />
                        </div>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium uppercase">Display</p>
                        <p className="text-xs font-bold text-zinc-900 dark:text-white tracking-tight">Liquid XDR</p>
                      </div>
                    </div>

                    {/* Pricing & Quick Action */}
                    <div className="pt-2 border-t border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block font-medium">Starting at</span>
                        <span className="text-base font-extrabold text-zinc-900 dark:text-white">$2,499.00</span>
                      </div>
                      <Link
                        to="/shop?category=Laptops"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold transition-all shadow-electric hover:shadow-electric-lg group/btn"
                      >
                        <span>View Specs</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
