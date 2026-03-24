import React from 'react';
import { Heart } from 'lucide-react';
import { useWatchlistStore } from '../../store/useWatchlistStore.ts';

interface PriceCardProps {
  id: string; 
  name: string;
  price: number;
  delta: number;
  img: string;
  isDark?: boolean;
  viewMode?: 'grid' | 'list';
}

const PriceCard: React.FC<PriceCardProps> = ({ id, name, price, delta, img, isDark = true, viewMode = 'grid' }) => {
  const { toggleWatchlist, isInWatchlist } = useWatchlistStore();
  
  const active = isInWatchlist(id);

  const handleHeartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleWatchlist({ id, name, price, delta, img });
  };

  return viewMode === 'list' ? (
    <div className={`rounded-2xl p-4 hover:border transition-all group relative cursor-pointer ${isDark ? 'bg-[#16161a] border border-slate-800 hover:border-blue-500/50' : 'bg-white border border-slate-200 hover:border-blue-500/50'}`}>
      <div className="flex gap-4">
        <div className={`w-20 h-20 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-[#0a0a0c]' : 'bg-slate-100'}`}>
          <img 
            src={img} 
            alt={name} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" 
          />
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          <div className="relative group/tooltip">
            <h3 className={`font-medium text-sm truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {name}
            </h3>
            
            <div className="absolute bottom-full left-0 mb-2 hidden group-hover/tooltip:block z-50 pointer-events-none">
              <div className={`text-[10px] rounded px-2 py-1 shadow-xl border w-max max-w-[300px] whitespace-normal ${isDark ? 'bg-slate-800 text-white border-slate-700' : 'bg-slate-700 text-white border-slate-600'}`}>
                {name}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>₦{price.toLocaleString()}</span>
            <div className={`flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded ${
              delta < 0 ? isDark ? 'bg-rose-500/10 text-rose-500' : 'bg-rose-100 text-rose-600' : isDark ? 'bg-emerald-500/10 text-emerald-500' : 'bg-emerald-100 text-emerald-600'
            }`}>
              {delta > 0 ? '+' : ''}{delta}%
            </div>
          </div>
        </div>
      </div>

      <button 
        onClick={handleHeartClick}
        className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-md border transition-all active:scale-90 ${isDark ? 'bg-black/40 border-white/10 hover:scale-110' : 'bg-white/40 border-slate-300/50 hover:scale-110'}`}
      >
        <Heart 
          size={16} 
          className={`transition-colors ${active ? "fill-rose-500 text-rose-500" : isDark ? "text-slate-400 group-hover:text-slate-200" : "text-slate-600 group-hover:text-slate-800"}`} 
        />
      </button>
    </div>
  ) : (
    <div className={`rounded-2xl p-4 hover:border transition-all group relative cursor-pointer ${isDark ? 'bg-[#16161a] border border-slate-800 hover:border-blue-500/50' : 'bg-white border border-slate-200 hover:border-blue-500/50'}`}>
      <button 
        onClick={handleHeartClick}
        className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-md border transition-all active:scale-90 ${isDark ? 'bg-black/40 border-white/10 hover:scale-110' : 'bg-white/40 border-slate-300/50 hover:scale-110'}`}
      >
        <Heart 
          size={16} 
          className={`transition-colors ${active ? "fill-rose-500 text-rose-500" : isDark ? "text-slate-400 group-hover:text-slate-200" : "text-slate-600 group-hover:text-slate-800"}`} 
        />
      </button>

      <div className={`aspect-square rounded-xl overflow-hidden mb-4 flex items-center justify-center ${isDark ? 'bg-[#0a0a0c]' : 'bg-slate-100'}`}>
        <img 
          src={img} 
          alt={name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" 
        />
      </div>

      <div className="space-y-1">
        <div className="relative group/tooltip">
          <h3 className={`font-medium text-sm truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {name}
          </h3>
          
          <div className="absolute bottom-full left-0 mb-2 hidden group-hover/tooltip:block z-50 pointer-events-none">
            <div className={`text-[10px] rounded px-2 py-1 shadow-xl border w-max max-w-[200px] whitespace-normal ${isDark ? 'bg-slate-800 text-white border-slate-700' : 'bg-slate-700 text-white border-slate-600'}`}>
              {name}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>₦{price.toLocaleString()}</span>
          <div className={`flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded ${
            delta < 0 ? isDark ? 'bg-rose-500/10 text-rose-500' : 'bg-rose-100 text-rose-600' : isDark ? 'bg-emerald-500/10 text-emerald-500' : 'bg-emerald-100 text-emerald-600'
          }`}>
            {delta > 0 ? '+' : ''}{delta}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceCard;