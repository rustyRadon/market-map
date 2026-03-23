import { LayoutGrid, TrendingUp, ArrowDown, Utensils, Smartphone, GraduationCap, Car, X, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNavStore } from '../store/useNavStore.ts';
import { useAuthStore } from '../store/useAuthStore.ts';

const categories = [
  { name: 'All Items', icon: LayoutGrid, path: '/' },
  { name: 'Watchlist', icon: Heart, path: '/?view=watchlist' },
  { name: 'Trending', icon: TrendingUp, path: '/?category=trending' },
  { name: 'Price Drops', icon: ArrowDown, path: '/?category=drops' },
  { name: 'Food & Groceries', icon: Utensils, path: '/?category=food' },
  { name: 'Gadgets & Tech', icon: Smartphone, path: '/?category=gadgets' },
  { name: 'Education', icon: GraduationCap, path: '/?category=education' },
  { name: 'Automotive', icon: Car, path: '/?category=automotive' },
];

interface SideBarProps {
  isDark?: boolean;
}

const SideBar: React.FC<SideBarProps> = ({ isDark = true }) => {
  const { isSidebarOpen, closeSidebar } = useNavStore();
  const { login, isAuthenticated, user } = useAuthStore();

  const handleSimulateLogin = () => {
    login({ 
      id: '1', 
      name: 'Rusty Radon', 
      email: 'rusty@radon.com' 
    });
  };

  return (
    <>
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity" 
          onClick={closeSidebar}
        />
      )}

      <div className={`
        fixed inset-y-0 left-0 z-50 w-[260px] border-r transition-transform duration-300 ease-in-out flex flex-col
        lg:relative lg:translate-x-0 
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isDark ? 'bg-[#0f0f12] border-slate-800' : 'bg-slate-50 border-slate-200'}
      `}>
        <div className="p-4 flex flex-col h-full">
          <div className="flex items-center justify-between mb-8 px-2">
            <Link to="/" onClick={closeSidebar} className={`text-xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-xs shadow-lg shadow-blue-500/20">
                MM
              </div>
              MarketMap
            </Link>
            <button onClick={closeSidebar} className={`lg:hidden p-1 ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}>
              <X size={24} />
            </button>
          </div>

          <nav className="space-y-1 flex-1 overflow-y-auto custom-scrollbar">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                to={cat.path}
                onClick={closeSidebar}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800/50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'}`}
              >
                <cat.icon size={20} className="group-hover:text-blue-400 transition-colors" />
                <span className="text-sm font-medium">{cat.name}</span>
              </Link>
            ))}
          </nav>

          <div className={`mt-auto pt-4 px-2 ${isDark ? 'border-t border-slate-800' : 'border-t border-slate-200'}`}>
            {!isAuthenticated ? (
              <button 
                onClick={handleSimulateLogin}
                className={`w-full py-2.5 text-xs font-medium rounded-xl border transition-all active:scale-95 ${isDark ? 'bg-slate-800/50 hover:bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-200 hover:bg-slate-300 text-slate-900 border-slate-300'}`}
              >
                Dev: Simulate Login
              </button>
            ) : (
              <div className="flex items-center gap-3 py-2 px-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className={`text-xs truncate ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Logged in as <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>{user?.name}</span>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SideBar;