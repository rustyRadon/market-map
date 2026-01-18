import { useState } from 'react';
import { Search, Bell, Menu, Heart, LogIn, X } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom'; 
import { useAuthStore } from '../store/useAuthStore.ts';
import { useNavStore } from '../store/useNavStore.ts';
import { useSearchStore } from '../store/useSearchStore.ts';
import ProfileDropdown from './ProfileDropdown.tsx';

const TopBar = () => {
  const [searchParams] = useSearchParams();
  const { isAuthenticated, profileImage } = useAuthStore();
  const { toggleSidebar } = useNavStore();
  const { searchQuery, setSearchQuery, clearSearch } = useSearchStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const getPlaceholder = () => {
    const view = searchParams.get('view');
    const category = searchParams.get('category');

    if (view === 'watchlist') return 'Search your watchlist...';
    
    switch (category) {
      case 'food': return 'Search groceries, snacks, drinks...';
      case 'gadgets': return 'Search phones, laptops, tech...';
      case 'education': return 'Search courses, books, tools...';
      case 'automotive': return 'Search cars, parts, accessories...';
      case 'trending': return 'Search trending deals...';
      default: return 'Search for items, food, cars...';
    }
  };

  return (
    <div className="h-full w-full flex items-center justify-between px-3 md:px-6 bg-[#0f0f12]">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button onClick={toggleSidebar} className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors">
          <Menu size={22} />
        </button>

        <div className="relative flex-1 max-w-md group">
          <Search 
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" 
            size={16} 
          />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={getPlaceholder()}
            className="w-full bg-[#16161a] border border-slate-800 rounded-xl py-2.5 pl-9 pr-10 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
          />
          {searchQuery && (
            <button 
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white p-1"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 ml-4">
        <button className="hidden sm:flex p-2 text-slate-400 hover:text-rose-400 transition-colors">
          <Heart size={20} />
        </button>

        <button className="p-2 text-slate-400 hover:text-blue-400 transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full border-2 border-[#0f0f12] shadow-[0_0_8px_rgba(37,99,235,0.5)]"></span>
        </button>

        <div className="h-8 w-[1px] bg-slate-800 mx-1 hidden sm:block" />

        {!isAuthenticated ? (
          <Link to="/login" className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-600/10 transition-all active:scale-95">
            <LogIn size={18} />
            <span className="hidden sm:block">Sign In</span>
          </Link>
        ) : (
          <div className="relative">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)} 
              className="p-0.5 rounded-full ring-2 ring-transparent hover:ring-blue-500/50 transition-all"
            >
              <img 
                src={profileImage} 
                alt="Profile" 
                className="w-9 h-9 rounded-full object-cover border border-slate-700" 
              />
            </button>
            {isProfileOpen && <ProfileDropdown onClose={() => setIsProfileOpen(false)} />}
          </div>
        )}
      </div>
    </div>
  );
};

export default TopBar;