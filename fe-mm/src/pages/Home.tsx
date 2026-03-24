import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useWatchlistStore } from '../store/useWatchlistStore.ts';
import { useSearchStore } from '../store/useSearchStore.ts';
import { useThemeStore } from '../store/useThemeStore.ts';
import { useNavStore } from '../store/useNavStore.ts';
import PriceCard from '../features/market/PriceCard.tsx';
import PriceModal from '../features/market/PriceModal.tsx';
import { Trash2, SearchX, Loader2, Grid3X3, List } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  category: string;
  avg_price: string;
  previous_price: string;
  image_url: string | null;
  last_updated: string;
}

const Home: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { searchQuery } = useSearchStore(); 
  const { isDark } = useThemeStore();
  const { viewMode, setViewMode } = useNavStore();
  const view = searchParams.get('view'); 
  const category = searchParams.get('category');
  const { items: watchlistItems, clearWatchlist } = useWatchlistStore();

  const [marketData, setMarketData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isWatchlistView = view === 'watchlist';

  const getCategoryTitle = (cat: string | null) => {
    switch (cat) {
      case 'gadgets': return 'Gadgets & Tech';
      case 'food': return 'Food & Groceries';
      case 'education': return 'Education';
      case 'automotive': return 'Automotive';
      case 'trending': return 'Trending Deals';
      case 'drops': return 'Price Drops';
      default: return 'Market Overview';
    }
  };

  const getCategoryDescription = (cat: string | null) => {
    switch (cat) {
      case 'gadgets': return 'Latest tech gadgets and electronics from Jumia Nigeria';
      case 'food': return 'Fresh groceries and food items at competitive prices';
      case 'education': return 'Books, courses, and educational materials';
      case 'automotive': return 'Cars, parts, and automotive accessories';
      case 'trending': return 'Hot deals and trending products right now';
      case 'drops': return 'Products with recent price reductions';
      default: return 'Live market intelligence from Jumia Nigeria';
    }
  };

  useEffect(() => {
    const fetchMarketData = async () => {
      if (isWatchlistView) return;
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.append('search', searchQuery);
        if (category) params.append('category', category);
        
        const queryString = params.toString();
        const url = `http://localhost:8080/products${queryString ? `?${queryString}` : ''}`;
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('API Response:', data);
        setMarketData(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Fetch error:", err);
        setMarketData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMarketData();
  }, [searchQuery, category, isWatchlistView]);

  const calculateDelta = (currentStr: string, previousStr: string) => {
    const current = parseFloat(currentStr);
    const previous = parseFloat(previousStr);
    if (!previous || previous === 0 || current === previous) return 0;
    const percentage = ((current - previous) / previous) * 100;
    return parseFloat(percentage.toFixed(2));
  };

  const handleCardClick = (product: any) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const displayData = isWatchlistView ? watchlistItems : marketData;

  return (
    <div className="space-y-8 pb-20">
      <header className={`flex flex-row items-end justify-between gap-2 pb-6 ${isDark ? 'border-b border-slate-800/50' : 'border-b border-slate-200/50'}`}>
        <div className="flex flex-col gap-1">
          <h1 className={`text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {isWatchlistView ? 'My Watchlist' : getCategoryTitle(category)}
          </h1>
          <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
            {searchQuery ? `Results for "${searchQuery}"` : getCategoryDescription(category)}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center bg-slate-800/50 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <Grid3X3 size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <List size={16} />
            </button>
          </div>

          {isWatchlistView && watchlistItems.length > 0 && (
            <button 
              onClick={clearWatchlist}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg border transition-all active:scale-95 ${isDark ? 'text-rose-500 hover:bg-rose-500/10 border-rose-500/20' : 'text-rose-600 hover:bg-rose-100 border-rose-200'}`}
            >
              <Trash2 size={14} />
              Clear Watchlist
            </button>
          )}
        </div>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          <p className={`animate-pulse font-medium ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>Scanning live prices...</p>
        </div>
      ) : displayData.length > 0 ? (
        <div className={viewMode === 'grid' 
          ? `grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6`
          : `space-y-4`
        }>
          {displayData.map((item: any) => {
            const avgPrice = typeof item.avg_price === 'string' ? parseFloat(item.avg_price) : (typeof item.avg_price === 'number' ? item.avg_price : 0);
            const previousPrice = item.previous_price ? (typeof item.previous_price === 'string' ? parseFloat(item.previous_price) : (typeof item.previous_price === 'number' ? item.previous_price : undefined)) : undefined;
            
            const currentPrice = avgPrice || (typeof item.price === 'string' ? parseFloat(item.price) : item.price) || 0;
            const deltaValue = previousPrice && previousPrice !== 0 && avgPrice !== previousPrice 
              ? calculateDelta(avgPrice.toString(), previousPrice.toString()) 
              : (item.delta || 0);

            return (
              <div key={item.id} onClick={() => handleCardClick({ id: item.id, name: item.name, price: currentPrice, delta: deltaValue })}>
                <PriceCard 
                  id={item.id}
                  name={item.name}
                  price={currentPrice} 
                  delta={deltaValue}
                  img={item.image_url || item.img || 'https://via.placeholder.com/400'}
                  isDark={isDark}
                  viewMode={viewMode}
                />
              </div>
            );
          })}
        </div>
      ) : (
        <div className={`flex flex-col items-center justify-center py-32 border border-dashed rounded-3xl text-center ${isDark ? 'bg-[#0f0f12] border-slate-800' : 'bg-slate-50 border-slate-300'}`}>
          <SearchX size={48} className={`mb-4 mx-auto ${isDark ? 'text-slate-700' : 'text-slate-400'}`} />
          <h2 className={`font-semibold text-xl ${isDark ? 'text-white' : 'text-slate-900'}`}>No items found</h2>
          <p className={`text-sm mt-2 max-w-xs mx-auto ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
            Try adjusting your search query or run your scraper.
          </p>
        </div>
      )}

      <PriceModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        product={selectedProduct} 
      />
    </div>
  );
};

export default Home;