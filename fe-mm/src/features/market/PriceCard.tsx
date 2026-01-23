import React from 'react';
import { Heart } from 'lucide-react';
import { useWatchlistStore } from '../../store/useWatchlistStore.ts';

interface PriceCardProps {
  id: string; // Changed to string to match your Home.tsx Product interface
  name: string;
  price: number;
  delta: number;
  img: string;
}

const PriceCard: React.FC<PriceCardProps> = ({ id, name, price, delta, img }) => {
  const { toggleWatchlist, isInWatchlist } = useWatchlistStore();
  
  const active = isInWatchlist(id);

  const handleHeartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // We pass the data exactly as the store expects it
    toggleWatchlist({ id, name, price, delta, img });
  };

  return (
    <div className="bg-[#16161a] border border-slate-800 rounded-2xl p-4 hover:border-blue-500/50 transition-all group relative cursor-pointer">
      <button 
        onClick={handleHeartClick}
        className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:scale-110 transition-all active:scale-90"
      >
        <Heart 
          size={16} 
          className={`transition-colors ${active ? "fill-rose-500 text-rose-500" : "text-slate-400 group-hover:text-slate-200"}`} 
        />
      </button>

      {/* Product Image */}
      <div className="aspect-square rounded-xl overflow-hidden mb-4 bg-[#0a0a0c] flex items-center justify-center">
        <img 
          src={img} 
          alt={name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" 
        />
      </div>

      {/* Product Info */}
      <div className="space-y-1">
        {/* Name with Hover Tooltip */}
        <div className="relative group/tooltip">
          <h3 className="text-white font-medium text-sm truncate">
            {name}
          </h3>
          
          {/* The Tooltip - Only shows when hovering over the name area */}
          <div className="absolute bottom-full left-0 mb-2 hidden group-hover/tooltip:block z-50 pointer-events-none">
            <div className="bg-slate-800 text-white text-[10px] rounded px-2 py-1 shadow-xl border border-slate-700 w-max max-w-[200px] whitespace-normal">
              {name}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-white">₦{price.toLocaleString()}</span>
          <div className={`flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded ${
            delta < 0 ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'
          }`}>
            {delta > 0 ? '+' : ''}{delta}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceCard;