import React from 'react';
import { X, TrendingDown, TrendingUp } from 'lucide-react';
import {  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface PriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    name: string;
    price: number;
    delta: number;
  } | null;
}

// Mock data 
const data = [
  { date: 'Jan 15', price: 450000 },
  { date: 'Jan 30', price: 420000 },
  { date: 'feb 15', price: 480000 },
  { date: 'feb 28', price: 460000 },
  { date: 'Mar 15', price: 520000 },
  { date: 'Mar 30', price: 490000 },
];

const PriceModal: React.FC<PriceModalProps> = ({ isOpen, onClose, product }) => {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#16161a] border border-slate-800 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">{product.name}</h2>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-black text-blue-500">₦{product.price.toLocaleString()}</span>
              <span className={`text-xs font-bold px-2 py-1 rounded ${product.delta < 0 ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                {product.delta > 0 ? <TrendingUp size={12} className="inline mr-1"/> : <TrendingDown size={12} className="inline mr-1"/>}
                {product.delta}%
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis hide domain={['auto', 'auto']} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Area type="monotone" dataKey="price" stroke="#2563eb" fillOpacity={1} fill="url(#colorPrice)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="p-4 bg-[#0a0a0c] text-center">
          <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">Price performance over last 90 days</p>
        </div>
      </div>
    </div>
  );
};

export default PriceModal;