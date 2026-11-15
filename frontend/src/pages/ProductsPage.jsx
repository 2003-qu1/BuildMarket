import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, Filter, SlidersHorizontal, RotateCcw, PackageSearch } from 'lucide-react';
import api from '../api/client';
import ProductCard from '../components/common/ProductCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function ProductsPage() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language?.startsWith('ar');
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const categoryParam = searchParams.get('category') || 'all';
  const searchParam = searchParams.get('search') || '';
  const sortParam = searchParams.get('sort') || 'newest';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';

  const [searchInput, setSearchInput] = useState(searchParam);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await api.get('/categories');
        if (res.data?.categories) setCategories(res.data.categories);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (categoryParam && categoryParam !== 'all') params.append('category', categoryParam);
        if (searchParam) params.append('search', searchParam);
        if (sortParam) params.append('sort', sortParam);
        if (minPriceParam) params.append('minPrice', minPriceParam);
        if (maxPriceParam) params.append('maxPrice', maxPriceParam);

        const res = await api.get(`/products?${params.toString()}`);
        if (res.data?.products) {
          setProducts(res.data.products);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [categoryParam, searchParam, sortParam, minPriceParam, maxPriceParam]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    setSearchParams(next);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParam('search', searchInput.trim());
  };

  const resetFilters = () => {
    setSearchInput('');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Page Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t('products.title')}
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            {t('products.subtitle')}
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-md">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t('products.search')}
            className="w-full bg-slate-800 text-white placeholder-slate-400 rounded-xl ps-10 pe-20 py-2.5 text-sm border border-slate-700 focus:outline-none focus:border-orange-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute inset-y-0 start-0 ps-3.5 my-auto" />
          <button
            type="submit"
            className="absolute inset-y-1 end-1 px-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            {t('common.search')}
          </button>
        </form>
      </div>

      {/* Main Layout: Filters & Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Filters (Desktop) */}
        <div className="hidden lg:block space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-6">
            
            {/* Header with Reset */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-orange-500" />
                {t('products.filterCategory')}
              </span>
              {(categoryParam !== 'all' || searchParam || minPriceParam || maxPriceParam) && (
                <button
                  onClick={resetFilters}
                  type="button"
                  className="text-xs text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  {t('products.resetFilters')}
                </button>
              )}
            </div>

            {/* Categories List */}
            <div className="space-y-1">
              <button
                onClick={() => updateParam('category', 'all')}
                type="button"
                className={`w-full text-start px-3 py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-between ${
                  categoryParam === 'all'
                    ? 'bg-orange-50 text-orange-600 font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>{t('products.allCategories')}</span>
              </button>

              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => updateParam('category', cat.slug)}
                  type="button"
                  className={`w-full text-start px-3 py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-between ${
                    categoryParam === cat.slug
                      ? 'bg-orange-50 text-orange-600 font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{isArabic ? cat.name_ar : cat.name_en}</span>
                  {cat.product_count !== undefined && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-mono">
                      {cat.product_count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Price Filter */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <span className="font-bold text-slate-900 text-xs uppercase tracking-wider block">
                {t('products.priceRange')} ({t('common.currency')})
              </span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPriceParam}
                  onChange={(e) => updateParam('minPrice', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-orange-500"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPriceParam}
                  onChange={(e) => updateParam('maxPrice', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-orange-500"
                />
              </div>
            </div>

          </div>
        </div>

        {/* Products Listing Area */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Controls Bar: Sort, Count, Mobile Filter Button */}
          <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-orange-500" />
                <span>{t('products.filterCategory')}</span>
              </button>

              <span className="text-xs font-medium text-slate-500">
                {products.length} {isArabic ? 'منتج متوفر' : 'items found'}
              </span>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                {t('products.sortBy')}:
              </label>
              <select
                value={sortParam}
                onChange={(e) => updateParam('sort', e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium px-2.5 py-1.5 text-slate-700 focus:ring-1 focus:ring-orange-500"
              >
                <option value="newest">{t('products.sortNewest')}</option>
                <option value="price-asc">{t('products.sortPriceAsc')}</option>
                <option value="price-desc">{t('products.sortPriceDesc')}</option>
                <option value="name-asc">{t('products.sortNameAsc')}</option>
                <option value="stock">{t('products.sortStock')}</option>
              </select>
            </div>
          </div>

          {/* Mobile Filter Drawer / Collapsible */}
          {mobileFilterOpen && (
            <div className="lg:hidden bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <span className="font-bold text-xs uppercase tracking-wider text-slate-500 block">
                {t('products.filterCategory')}
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => { updateParam('category', 'all'); setMobileFilterOpen(false); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                    categoryParam === 'all' ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {t('products.allCategories')}
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => { updateParam('category', c.slug); setMobileFilterOpen(false); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                      categoryParam === c.slug ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {isArabic ? c.name_ar : c.name_en}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Products Grid */}
          {loading ? (
            <LoadingSpinner size="lg" text={t('common.loading')} />
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <PackageSearch className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800 text-base">{t('products.noProducts')}</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Try adjusting your search query, selecting another category, or resetting filters.
              </p>
              <button
                onClick={resetFilters}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {t('products.resetFilters')}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
