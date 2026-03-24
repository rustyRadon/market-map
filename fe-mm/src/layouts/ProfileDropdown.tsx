import { Camera, Settings, LogOut, Crown, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore.ts';
import ProUpgradeModal from '../features/market/ProUpgradeModal';

interface ProfileDropdownProps {
  onClose: () => void;
  isDark?: boolean;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ onClose, isDark = true }) => {
  const navigate = useNavigate();
  const { user, profileImage, logout } = useAuthStore();
  const [showProModal, setShowProModal] = useState(false);

  const handleLogout = () => {
    logout();      
    onClose();     
    navigate('/'); 
  };

  return (
    <>
      <div className="fixed inset-0 z-10" onClick={onClose} />
      
      <div className={`absolute right-0 mt-3 w-64 rounded-2xl shadow-2xl z-20 overflow-hidden animate-in fade-in zoom-in duration-200 ${isDark ? 'bg-[#16161a] border-slate-800' : 'bg-white border-slate-300'} border`}>
        <div className={`p-6 flex flex-col items-center ${isDark ? 'border-b border-slate-800 bg-[#1c1c22]/50' : 'border-b border-slate-200 bg-slate-50'}`}>
          <div className="relative group">
            <img 
              src={profileImage} 
              alt="Profile" 
              className={`w-20 h-20 rounded-full object-cover border-4 border-blue-600/20 shadow-xl ${isDark ? '' : ''}`}
            />
            <div className={`absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-4 ${isDark ? 'border-[#16161a]' : 'border-white'} rounded-full`} />
          </div>
          <h3 className={`mt-3 font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>{user?.name || 'User'}</h3>
          <p className={`text-[10px] uppercase tracking-[0.2em] font-semibold ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
            {user?.is_pro ? 'Pro Member' : 'Free Account'}
          </p>
        </div>

        <div className="p-2">
          <button className={`w-full flex items-center gap-3 px-4 py-3 text-sm rounded-xl transition-all ${isDark ? 'text-slate-300 hover:bg-blue-600 hover:text-white' : 'text-slate-700 hover:bg-blue-600 hover:text-white'}`}>
            <Camera size={18} className={isDark ? 'text-slate-500 group-hover:text-white' : 'text-slate-600 group-hover:text-white'} />
            Change Profile Picture
          </button>
          
          {!user?.is_pro && (
            <button 
              onClick={() => setShowProModal(true)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm rounded-xl transition-all ${isDark ? 'text-yellow-400 hover:bg-yellow-500/10' : 'text-yellow-600 hover:bg-yellow-100'}`}
            >
              <Crown size={18} className={isDark ? 'text-yellow-500' : 'text-yellow-600'} />
              Upgrade to Pro
            </button>
          )}

          {user?.is_admin && (
            <button 
              onClick={() => { navigate('/admin/users'); onClose(); }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm rounded-xl transition-all ${isDark ? 'text-purple-400 hover:bg-purple-500/10' : 'text-purple-600 hover:bg-purple-100'}`}
            >
              <Shield size={18} className={isDark ? 'text-purple-500' : 'text-purple-600'} />
              Admin Panel
            </button>
          )}
          
          <button className={`w-full flex items-center gap-3 px-4 py-3 text-sm rounded-xl transition-all ${isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-200'}`}>
            <Settings size={18} className={isDark ? 'text-slate-500' : 'text-slate-600'} />
            Account Settings
          </button>

          <div className={`my-1 border-t ${isDark ? 'border-slate-800/50' : 'border-slate-200/50'}`} />

          <button 
            onClick={handleLogout} 
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm rounded-xl transition-all ${isDark ? 'text-rose-400 hover:bg-rose-500/10' : 'text-rose-500 hover:bg-rose-100'}`}
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </div>

      <ProUpgradeModal 
        isOpen={showProModal} 
        onClose={() => setShowProModal(false)} 
      />
    </>
  );
};

export default ProfileDropdown;