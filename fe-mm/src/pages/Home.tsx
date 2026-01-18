import { useSearchParams } from 'react-router-dom';
import { useWatchlistStore } from '../store/useWatchlistStore.ts';
import { useSearchStore } from '../store/useSearchStore.ts';
import PriceCard from '../features/market/PriceCard.tsx';
import { Trash2, Heart, SearchX } from 'lucide-react';

const MOCK_MARKET_DATA = [
  { id: 1, name: 'Premium Coffee Beans', price: 45, delta: 2.5, img: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=400&auto=format&fit=crop' },
  { id: 2, name: 'Mechanical Keyboard', price: 120, delta: -1.2, img: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?q=80&w=400&auto=format&fit=crop' },
  { id: 3, name: 'Smart Watch v4', price: 299, delta: 0.8, img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400&auto=format&fit=crop' },
  { id: 4, name: 'Leather Carryall', price: 85, delta: 5.4, img: 'https://images.unsplash.com/photo-1547949003-9792a18a2601?q=80&w=400&auto=format&fit=crop' },
  { id: 5, name: 'Studio Headphones', price: 199, delta: -3.1, img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=400&auto=format&fit=crop' },
];

const Home = () => {
  const [searchParams] = useSearchParams();
  const { searchQuery } = useSearchStore(); 
  const view = searchParams.get('view'); 
  const { items: watchlistItems, clearWatchlist } = useWatchlistStore();

  const isWatchlistView = view === 'watchlist';
  const baseData = isWatchlistView ? watchlistItems : MOCK_MARKET_DATA;

  // Filter logic: Checks if item name matches search query
  const displayData = baseData.filter((item) => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-row items-end justify-between gap-2 border-b border-slate-800/50 pb-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            {isWatchlistView ? 'My Watchlist' : 'Market Overview'}
          </h1>
          <p className="text-slate-500 text-sm">
            {searchQuery 
              ? `Filtered results for "${searchQuery}"` 
              : isWatchlistView 
                ? `Tracking ${watchlistItems.length} saved items.` 
                : 'Real-time price tracking across all categories.'}
          </p>
        </div>

        {isWatchlistView && watchlistItems.length > 0 && (
          <button 
            onClick={clearWatchlist}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-rose-500 hover:bg-rose-500/10 rounded-lg border border-rose-500/20 transition-all active:scale-95"
          >
            <Trash2 size={14} />
            Clear All
          </button>
        )}
      </header>

      {displayData.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {displayData.map((item) => (
            <PriceCard 
              key={item.id}
              id={item.id}
              name={item.name}
              price={item.price}
              delta={item.delta}
              img={item.img}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 bg-[#0f0f12] border border-dashed border-slate-800 rounded-3xl">
          <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-6 text-slate-700">
             {searchQuery ? <SearchX size={32} /> : <Heart size={32} />}
          </div>
          <h2 className="text-white font-semibold text-xl">
            {searchQuery ? 'No matches found' : 'Watchlist is empty'}
          </h2>
          <p className="text-slate-500 text-sm mt-2 max-w-xs text-center leading-relaxed">
            {searchQuery 
              ? `We couldn't find "${searchQuery}" in your ${isWatchlistView ? 'watchlist' : 'market list'}.`
              : 'Start tracking products by clicking the heart icon on any market item.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Home;