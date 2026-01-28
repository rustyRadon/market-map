import React, { useState, useEffect } from 'react';
import { X, BarChart3, LineChart as LineIcon, Loader2 } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';

interface PriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string; // Added ID to fetch stats
    name: string;
    price: number;
    delta: number;
  } | null;
}

interface MarketStats {
  highest_price: number;
  lowest_price: number;
  average_price: number;
  similar_count: number;
}

const data = [
  { date: 'Jan 15', price: 450000 }, { date: 'Jan 30', price: 420000 },
  { date: 'Feb 15', price: 480000 }, { date: 'Feb 28', price: 460000 },
  { date: 'Mar 15', price: 520000 }, { date: 'Mar 30', price: 490000 },
];

const PriceModal: React.FC<PriceModalProps> = ({ isOpen, onClose, product }) => {
  const [view, setView] = useState<'chart' | 'stats'>('chart');
  const [stats, setStats] = useState<MarketStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && product?.id) {
      const fetchStats = async () => {
        setLoading(true);
        try {
          const response = await fetch(`http://localhost:8080/products/${product.id}/stats`);
          const result = await response.json();
          setStats(result);
        } catch (err) {
          console.error("Failed to fetch market intelligence:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchStats();
    } else {
      // Reset view and stats when modal closes
      setView('chart');
      setStats(null);
    }
  }, [isOpen, product?.id]);

  if (!isOpen || !product) return null;

  const handleDragEnd = (_e: any, info: PanInfo) => {
    const threshold = 50; 
    if (info.offset.x < -threshold && view === 'chart') setView('stats');
    else if (info.offset.x > threshold && view === 'stats') setView('chart');
  };

  const swipeVariants = {
    enter: (direction: number) => ({ x: direction > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction < 0 ? '100%' : '-100%', opacity: 0 })
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-[#16161a] border border-slate-800 w-full max-w-[95%] sm:max-w-2xl rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl relative"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex justify-between items-start bg-[#16161a] z-10 relative">
          <div className="flex-1 min-w-0">
            <h2 className="text-sm sm:text-xl font-bold text-white mb-1 truncate pr-4">{product.name}</h2>
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-lg sm:text-2xl font-black text-blue-500">₦{product.price.toLocaleString()}</span>
              
              <button 
                onClick={() => setView(view === 'chart' ? 'stats' : 'chart')}
                className="flex items-center gap-1.5 px-2 sm:px-3 py-1 bg-blue-600/10 hover:bg-blue-600/20 text-blue-500 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap"
              >
                {view === 'chart' ? (
                  <><BarChart3 size={12}/><span>Show Price Range</span></>
                ) : (
                  <><LineIcon size={12}/><span>Back to Trend</span></>
                )}
              </button>
            </div>
          </div>
          <button onClick={onClose} className="p-1 sm:p-2 hover:bg-slate-800 rounded-full text-slate-500">
            <X size={20} />
          </button>
        </div>

        {/* Content Area */}
        <motion.div 
          className="relative h-[280px] sm:h-[350px] w-full overflow-hidden cursor-grab active:cursor-grabbing"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={handleDragEnd}
        >
          <AnimatePresence initial={false} custom={view === 'chart' ? -1 : 1}>
            {view === 'chart' ? (
              <motion.div
                key="chart"
                custom={-1}
                variants={swipeVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="absolute inset-0 p-4 sm:p-6"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis hide domain={['auto', 'auto']} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '10px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="price" stroke="#2563eb" fillOpacity={1} fill="url(#colorPrice)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>
            ) : (
              <motion.div
                key="stats"
                custom={1}
                variants={swipeVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="absolute inset-0 p-4 sm:p-8 flex flex-col justify-center gap-3 sm:gap-6"
              >
                {loading ? (
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Querying Market Data...</p>
                  </div>
                ) : stats ? (
                  <>
                    <div className="grid grid-cols-1 gap-2 sm:gap-4">
                      <div className="p-3 sm:p-4 bg-slate-900/50 rounded-xl border border-slate-800 flex justify-between items-center group hover:border-rose-500/30 transition-all">
                        <span className="text-slate-400 text-[11px] sm:text-sm font-medium">List Price (Highest)</span>
                        <span className="text-rose-500 font-bold text-sm sm:text-lg">₦{stats.highest_price.toLocaleString()}</span>
                      </div>
                      <div className="p-3 sm:p-4 bg-slate-900/50 rounded-xl border border-slate-800 flex justify-between items-center group hover:border-blue-500/30 transition-all">
                        <span className="text-slate-400 text-[11px] sm:text-sm font-medium">Market Average</span>
                        <span className="text-blue-500 font-bold text-sm sm:text-lg">₦{stats.average_price.toLocaleString()}</span>
                      </div>
                      <div className="p-3 sm:p-4 bg-slate-900/50 rounded-xl border border-slate-800 flex justify-between items-center group hover:border-emerald-500/30 transition-all">
                        <span className="text-slate-400 text-[11px] sm:text-sm font-medium">Best Price (Lowest)</span>
                        <span className="text-emerald-500 font-bold text-sm sm:text-lg">₦{stats.lowest_price.toLocaleString()}</span>
                      </div>
                    </div>
                    <p className="text-[9px] sm:text-[10px] text-slate-600 text-center uppercase tracking-widest font-bold">
                      Based on {stats.similar_count} similar products found
                    </p>
                  </>
                ) : (
                  <p className="text-slate-500 text-center">No market data available.</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Indicator Dots */}
        <div className="flex justify-center gap-2 pb-4 sm:pb-6">
          <div className={`h-1 sm:h-1.5 rounded-full transition-all duration-300 ${view === 'chart' ? 'w-4 sm:w-6 bg-blue-600' : 'w-1.5 sm:w-2 bg-slate-800'}`} />
          <div className={`h-1 sm:h-1.5 rounded-full transition-all duration-300 ${view === 'stats' ? 'w-4 sm:w-6 bg-blue-600' : 'w-1.5 sm:w-2 bg-slate-800'}`} />
        </div>
      </motion.div>
    </div>
  );
};

export default PriceModal;