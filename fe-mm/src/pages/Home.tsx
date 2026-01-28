import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useWatchlistStore } from '../store/useWatchlistStore.ts';
import { useSearchStore } from '../store/useSearchStore.ts';
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
        const response = await fetch(`http://localhost:8080/products?search=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();
        setMarketData(data);
      } catch (err) {
        console.error("Fetch error:", err);
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
      <header className="flex flex-row items-end justify-between gap-2 border-b border-slate-800/50 pb-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            {isWatchlistView ? 'My Watchlist' : 'Market Overview'}
          </h1>
          <p className="text-slate-500 text-sm">
            {searchQuery ? `Results for "${searchQuery}"` : 'Live market intelligence from Jumia Nigeria'}
          </p>
        </div>

        {isWatchlistView && watchlistItems.length > 0 && (
          <button 
            onClick={clearWatchlist}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-rose-500 hover:bg-rose-500/10 rounded-lg border border-rose-500/20 transition-all active:scale-95"
          >
            <Trash2 size={14} />
            Clear Watchlist
          </button>
        )}
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          <p className="text-slate-500 animate-pulse font-medium">Scanning live prices...</p>
        </div>
      ) : displayData.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {displayData.map((item: any) => {
            const currentPrice = typeof item.avg_price === 'string' ? parseFloat(item.avg_price) : item.price;
            const deltaValue = item.previous_price ? calculateDelta(item.avg_price, item.previous_price) : (item.delta || 0);

            return (
              <div key={item.id} onClick={() => handleCardClick({ id: item.id, name: item.name, price: currentPrice, delta: deltaValue })}>
                <PriceCard 
                  id={item.id}
                  name={item.name}
                  price={currentPrice} 
                  delta={deltaValue}
                  img={item.image_url || item.img || 'https://via.placeholder.com/400'}
                />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 bg-[#0f0f12] border border-dashed border-slate-800 rounded-3xl text-center">
          <SearchX size={48} className="text-slate-700 mb-4 mx-auto" />
          <h2 className="text-white font-semibold text-xl">No items found</h2>
          <p className="text-slate-500 text-sm mt-2 max-w-xs mx-auto">
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