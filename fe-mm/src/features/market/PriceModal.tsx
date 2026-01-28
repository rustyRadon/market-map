import React, { useState } from 'react';
import { X,  BarChart3, LineChart as LineIcon,  } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

interface PriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    name: string;
    price: number;
    delta: number;
  } | null;
}

const data = [
  { date: 'Jan 15', price: 450000 }, { date: 'Jan 30', price: 420000 },
  { date: 'Feb 15', price: 480000 }, { date: 'Feb 28', price: 460000 },
  { date: 'Mar 15', price: 520000 }, { date: 'Mar 30', price: 490000 },
];

const PriceModal: React.FC<PriceModalProps> = ({ isOpen, onClose, product }) => {
  const [view, setView] = useState<'chart' | 'stats'>('chart');

  if (!isOpen || !product) return null;

  const swipeVariants = {
    enter: (direction: number) => ({ x: direction > 0 ? 500 : -500, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction < 0 ? 500 : -500, opacity: 0 })
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[#16161a] border border-slate-800 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl relative"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-start bg-[#16161a] z-10 relative">
          <div>
            <h2 className="text-xl font-bold text-white mb-1 truncate max-w-[400px]">{product.name}</h2>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-black text-blue-500">₦{product.price.toLocaleString()}</span>
              <button 
                onClick={() => setView(view === 'chart' ? 'stats' : 'chart')}
                className="flex items-center gap-1.5 px-3 py-1 bg-blue-600/10 hover:bg-blue-600/20 text-blue-500 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all"
              >
                {view === 'chart' ? <BarChart3 size={12}/> : <LineIcon size={12}/>}
                {view === 'chart' ? 'Show Price Range' : 'Back to Trend'}
              </button>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Swipeable Content */}
        <div className="relative h-[350px] w-full overflow-hidden">
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
                className="absolute inset-0 p-6"
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
                    <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis hide domain={['auto', 'auto']} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
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
                className="absolute inset-0 p-8 flex flex-col justify-center gap-6"
              >
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800 flex justify-between items-center group hover:border-rose-500/50 transition-all">
                    <span className="text-slate-400 text-sm font-medium">List Price (Highest)</span>
                    <span className="text-rose-500 font-bold text-lg">₦{(product.price * 1.2).toLocaleString()}</span>
                  </div>
                  <div className="p-4 bg-slate-900/50 rounded-2xl border border-blue-500/30 flex justify-between items-center">
                    <span className="text-slate-400 text-sm font-medium">Market Average</span>
                    <span className="text-blue-500 font-bold text-lg">₦{(product.price * 1.05).toLocaleString()}</span>
                  </div>
                  <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800 flex justify-between items-center group hover:border-emerald-500/50 transition-all">
                    <span className="text-slate-400 text-sm font-medium">Best Price (Lowest)</span>
                    <span className="text-emerald-500 font-bold text-lg">₦{(product.price * 0.9).toLocaleString()}</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-600 text-center uppercase tracking-[0.2em] font-bold">Based on 14 similar products found</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Indicator Dots */}
        <div className="flex justify-center gap-2 pb-6">
          <div className={`h-1.5 rounded-full transition-all duration-300 ${view === 'chart' ? 'w-6 bg-blue-600' : 'w-2 bg-slate-800'}`} />
          <div className={`h-1.5 rounded-full transition-all duration-300 ${view === 'stats' ? 'w-6 bg-blue-600' : 'w-2 bg-slate-800'}`} />
        </div>
      </motion.div>
    </div>
  );
};

export default PriceModal;