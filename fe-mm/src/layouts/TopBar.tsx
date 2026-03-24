import { useState } from 'react';
import { Search, Bell, Menu, Heart, LogIn, X, Sun, Moon } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom'; 
import { useAuthStore } from '../store/useAuthStore.ts';
import { useNavStore } from '../store/useNavStore.ts';
import { useSearchStore } from '../store/useSearchStore.ts';
import { useThemeStore } from '../store/useThemeStore.ts';
import ProfileDropdown from './ProfileDropdown.tsx';

const TopBar = () => {
  const [searchParams] = useSearchParams();
  const { isAuthenticated, profileImage } = useAuthStore();
  const { toggleSidebar } = useNavStore();
  const { searchQuery, setSearchQuery, clearSearch } = useSearchStore();
  const { isDark, toggleTheme } = useThemeStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showThemeTooltip, setShowThemeTooltip] = useState(false);

  const getPlaceholder = () => {
    const view = searchParams.get('view');
    const category = searchParams.get('category');

    if (view === 'watchlist') return 'Search your watchlist...';
    
    switch (category) {
      case 'gadgets': return 'Search gadgets and tech...';
      case 'food': return 'Search groceries, snacks, drinks...';
      case 'education': return 'Search courses, books, tools...';
      case 'automotive': return 'Search cars, parts, accessories...';
      case 'trending': return 'Search trending deals...';
      case 'drops': return 'Search price drops...';
      default: return 'Search for items, food, cars...';
    }
  };

  return (
    <div className={`h-full w-full flex items-center justify-between px-3 md:px-6 ${isDark ? 'bg-[#0f0f12]' : 'bg-white'} border-b ${isDark ? 'border-slate-800/50' : 'border-slate-200/50'}`}>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button onClick={toggleSidebar} className={`lg:hidden p-2 ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'} transition-colors`}>
          <Menu size={22} />
        </button>

        <div className="relative flex-1 max-w-md group">
          <Search 
            className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500 group-focus-within:text-blue-500' : 'text-slate-400 group-focus-within:text-blue-500'} transition-colors`}
            size={16} 
          />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={getPlaceholder()}
            className={`w-full ${isDark ? 'bg-[#16161a] border-slate-800 text-slate-200 placeholder:text-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-500'} border rounded-xl py-2.5 pl-9 pr-10 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all`}
          />
          {searchQuery && (
            <button 
              onClick={clearSearch}
              className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-600'} p-1`}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 ml-4">
        <div className="relative group">
          <button 
            onClick={toggleTheme}
            onMouseEnter={() => setShowThemeTooltip(true)}
            onMouseLeave={() => setShowThemeTooltip(false)}
            className={`p-2 ${isDark ? 'text-slate-400 hover:text-yellow-400' : 'text-slate-600 hover:text-amber-500'} transition-colors`}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          {showThemeTooltip && (
            <div className={`absolute -bottom-10 left-1/2 -translate-x-1/2 text-white text-xs rounded px-2 py-1 shadow-lg whitespace-nowrap ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-700 border-slate-600'} border`}>
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </div>
          )}
        </div>

        <button className={`hidden sm:flex p-2 ${isDark ? 'text-slate-400 hover:text-rose-400' : 'text-slate-600 hover:text-rose-500'} transition-colors`}>
          <Heart size={20} />
        </button>

        <button className={`p-2 ${isDark ? 'text-slate-400 hover:text-blue-400' : 'text-slate-600 hover:text-blue-500'} transition-colors relative`}>
          <Bell size={20} />
          <span className={`absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full border-2 ${isDark ? 'border-[#0f0f12]' : 'border-white'} shadow-[0_0_8px_rgba(37,99,235,0.5)]`}></span>
        </button>

        <div className={`h-8 w-[1px] ${isDark ? 'bg-slate-800' : 'bg-slate-300'} mx-1 hidden sm:block`} />

        {!isAuthenticated ? (
          <Link to="/login" className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-600/10 transition-all active:scale-95">
            <LogIn size={18} />
            <span className="hidden sm:block">Sign In</span>
          </Link>
        ) : (
          <div className="relative">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)} 
              className={`p-0.5 rounded-full ring-2 ring-transparent ${isDark ? 'hover:ring-blue-500/50' : 'hover:ring-blue-400/50'} transition-all`}
            >
              <img 
                src={profileImage} 
                alt="Profile" 
                className={`w-9 h-9 rounded-full object-cover ${isDark ? 'border-slate-700' : 'border-slate-300'} border`}
              />
            </button>
            {isProfileOpen && <ProfileDropdown onClose={() => setIsProfileOpen(false)} isDark={isDark} />}
          </div>
        )}
      </div>
    </div>
  );
};

export default TopBar;