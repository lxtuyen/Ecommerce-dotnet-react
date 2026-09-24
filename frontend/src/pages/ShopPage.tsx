import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productsApi, categoriesApi } from '@/services/api';
import { ProductCard } from '@/components/products/ProductCard';
import { Search, SlidersHorizontal, X, ArrowUpDown } from 'lucide-react';

export const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || '';
  const searchKeyword = searchParams.get('search') || '';

  const [localSearch, setLocalSearch] = useState(searchKeyword);
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'rating' | 'name'>(
    'default'
  );
  const [maxPrice, setMaxPrice] = useState<number>(3000);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Queries
  const { data: products, isLoading: isProductsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: productsApi.getAll,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
  });

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    if (!products) return [];

    return products
      .filter((p) => {
        // Category filter
        if (activeCategory && p.categoryName?.toLowerCase() !== activeCategory.toLowerCase()) {
          return false;
        }
        // Search filter
        if (
          searchKeyword &&
          !p.name.toLowerCase().includes(searchKeyword.toLowerCase()) &&
          !p.description.toLowerCase().includes(searchKeyword.toLowerCase())
        ) {
          return false;
        }
        // Price filter
        if (p.price > maxPrice) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return a.id - b.id;
      });
  }, [products, activeCategory, searchKeyword, maxPrice, sortBy]);

  const handleCategoryChange = (catName: string) => {
    const next = new URLSearchParams(searchParams);
    if (!catName || catName === activeCategory) {
      next.delete('category');
    } else {
      next.set('category', catName);
    }
    setSearchParams(next);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (localSearch.trim()) {
      next.set('search', localSearch.trim());
    } else {
      next.delete('search');
    }
    setSearchParams(next);
  };

  const clearAllFilters = () => {
    setSearchParams({});
    setLocalSearch('');
    setMaxPrice(3000);
    setSortBy('default');
  };

  return (
    <div className="py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header & Breadcrumb */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          {activeCategory ? `${activeCategory}` : 'All Products'}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Showing {filteredProducts.length} hardware products &amp; accessories
        </p>
      </div>

      {/* Filter and Search Bar Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
        {/* Search input */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search within products..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-10 pr-9 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/20 text-slate-900 dark:text-slate-100"
          />
          {localSearch && (
            <button
              type="button"
              onClick={() => {
                setLocalSearch('');
                const next = new URLSearchParams(searchParams);
                next.delete('search');
                setSearchParams(next);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>

        {/* Sort & Mobile Filter Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
            className="sm:hidden flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-slate-400 hidden sm:inline" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-zinc-500 text-slate-800 dark:text-slate-200"
            >
              <option value="default">Sort by: Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="name">Alphabetical (A - Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Catalog Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters (Desktop) */}
        <div className={`space-y-6 ${isMobileFiltersOpen ? 'block' : 'hidden lg:block'}`}>
          {/* Categories Filter */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Categories
            </h3>
            <div className="space-y-1">
              <button
                onClick={() => handleCategoryChange('')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between ${
                  !activeCategory
                    ? 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span>All Categories</span>
              </button>
              {categories?.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.name)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between ${
                    activeCategory.toLowerCase() === cat.name.toLowerCase()
                      ? 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Max Price
              </h3>
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                ${maxPrice}
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="3000"
              step="50"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-zinc-900 dark:accent-white"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-medium">
              <span>$50</span>
              <span>$1,500</span>
              <span>$3,000+</span>
            </div>
          </div>

          {/* Clear Filters Button */}
          {(activeCategory || searchKeyword || maxPrice < 3000 || sortBy !== 'default') && (
            <button
              onClick={clearAllFilters}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Reset All Filters
            </button>
          )}
        </div>

        {/* Product Cards Grid */}
        <div className="lg:col-span-3">
          {isProductsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
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
          ) : filteredProducts.length === 0 ? (
            <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-4">
                <Search className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                No matching products found
              </h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
                Try loosening your filters or searching with a different keyword.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-5 py-2.5 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white font-bold text-xs uppercase tracking-wider transition-all"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
