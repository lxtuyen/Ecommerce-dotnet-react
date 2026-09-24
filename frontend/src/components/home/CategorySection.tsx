import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { categoriesApi } from '@/services/api';
import { Smartphone, Laptop, Headphones, Watch, Cable, Grid, ArrowRight } from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  Smartphone: <Smartphone className="w-6 h-6" />,
  Laptop: <Laptop className="w-6 h-6" />,
  Headphones: <Headphones className="w-6 h-6" />,
  Watch: <Watch className="w-6 h-6" />,
  Cable: <Cable className="w-6 h-6" />,
};

export const CategorySection: React.FC = () => {
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
  });

  return (
    <section className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8 sm:mb-10">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 mb-1">
              Browse Collections
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Shop by Category
            </h3>
          </div>
          <Link
            to="/shop"
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-zinc-100 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            <span>See All Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-36 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse"
                />
              ))
            : categories?.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/shop?category=${encodeURIComponent(cat.name)}`}
                  className="group relative rounded-2xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-zinc-400 dark:hover:border-zinc-400 transition-all duration-300 flex flex-col items-center text-center overflow-hidden"
                >
                  <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-zinc-900 dark:group-hover:bg-white group-hover:text-white transition-all duration-300 shadow-sm">
                    {iconMap[cat.icon || ''] || <Grid className="w-6 h-6" />}
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-zinc-900 dark:text-zinc-100 dark:group-hover:text-zinc-400 transition-colors">
                    {cat.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                    {cat.description || 'Explore collection'}
                  </p>
                </Link>
              ))}
        </div>
      </div>
    </section>
  );
};
