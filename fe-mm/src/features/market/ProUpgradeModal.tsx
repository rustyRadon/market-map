import React, { useState } from 'react';
import { X, Crown, Check, Star, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/useAuthStore';

interface ProUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProUpgradeModal: React.FC<ProUpgradeModalProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const { user, login } = useAuthStore();

  if (!isOpen) return null;

  const handleUpgrade = async () => {
    if (!user?.email) return;
    
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/users/upgrade-pro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_email: user.email }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        // Update user in store
        login(updatedUser, 'dummy-token'); // Keep the same token
        onClose();
      } else {
        console.error('Failed to upgrade');
      }
    } catch (err) {
      console.error('Upgrade error:', err);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    'Real-time market intelligence with live price tracking',
    'Advanced competitor analysis and price comparisons',
    'Historical price trends and market predictions',
    'Priority customer support with dedicated account manager',
    'Unlimited product searches and watchlist items',
    'Export market data and generate custom reports'
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-[#16161a] border border-slate-800 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
      >
        <div className="p-6 border-b border-slate-800 flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Upgrade to Pro</h2>
              <p className="text-slate-400 text-sm">Unlock premium features</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-500">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-2">
              <span className="text-3xl font-black text-white">₦2,999</span>
              <span className="text-slate-500">/month</span>
            </div>
            <p className="text-slate-400 text-sm">Cancel anytime</p>
          </div>

          <div className="space-y-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="p-1 bg-green-500/10 rounded-full">
                  <Check size={14} className="text-green-500" />
                </div>
                <span className="text-slate-300 text-sm">{feature}</span>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-yellow-500 font-semibold text-sm">Limited Time Offer</span>
            </div>
            <p className="text-slate-300 text-xs">Get your first month 50% off with code WELCOME50</p>
          </div>

          <div className="space-y-3">
            <button 
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-xl shadow-lg hover:from-yellow-600 hover:to-orange-600 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                'Upgrade Now'
              )}
            </button>
            <button 
              onClick={onClose}
              disabled={loading}
              className="w-full py-3 text-slate-400 hover:text-white text-sm font-medium transition-colors disabled:opacity-50"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProUpgradeModal;