import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useWatchlistStore } from '../store/useWatchlistStore.ts';
import { useSearchStore } from '../store/useSearchStore.ts';
import { useThemeStore } from '../store/useThemeStore.ts';
import PriceCard from '../features/market/PriceCard.tsx';
import PriceModal from '../features/market/PriceModal.tsx';
import { Trash2, SearchX, Loader2 } from 'lucide-react';

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
  const view = searchParams.get('view'); 
  const { items: watchlistItems, clearWatchlist } = useWatchlistStore();

  const [marketData, setMarketData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isWatchlistView = view === 'watchlist';

  useEffect(() => {
    const fetchMarketData = async () => {
      if (isWatchlistView) return;
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:8080/products${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''}`);
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
  }, [searchQuery, isWatchlistView]);

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
            {isWatchlistView ? 'My Watchlist' : 'Market Overview'}
          </h1>
          <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
            {searchQuery ? `Results for "${searchQuery}"` : 'Live market intelligence from Jumia Nigeria'}
          </p>
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
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          <p className={`animate-pulse font-medium ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>Scanning live prices...</p>
        </div>
      ) : displayData.length > 0 ? (
        <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6`}>
          {displayData.map((item: any) => {
            // Handle BigDecimal from API (could be string or number)
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