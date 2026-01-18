import { Camera, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore.ts';

interface ProfileDropdownProps {
  onClose: () => void;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const { user, profileImage, logout } = useAuthStore();

  const handleLogout = () => {
    logout();      
    onClose();     
    navigate('/'); 
  };

  return (
    <>
      <div className="fixed inset-0 z-10" onClick={onClose} />
      
      <div className="absolute right-0 mt-3 w-64 bg-[#16161a] border border-slate-800 rounded-2xl shadow-2xl z-20 overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 flex flex-col items-center border-b border-slate-800 bg-[#1c1c22]/50">
          <div className="relative group">
            <img 
              src={profileImage} 
              alt="Profile" 
              className="w-20 h-20 rounded-full object-cover border-4 border-blue-600/20 shadow-xl"
            />
            <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-4 border-[#16161a] rounded-full" />
          </div>
          <h3 className="mt-3 font-bold text-white text-lg">{user?.name || 'User'}</h3>
          <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-semibold">Pro Member</p>
        </div>

        <div className="p-2">
          <button 
            onClick={() => { navigate('/settings/profile'); onClose(); }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-blue-600 hover:text-white rounded-xl transition-all group"
          >
            <Camera size={18} className="text-slate-500 group-hover:text-white" />
            Change Profile Picture
          </button>
          
          <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 rounded-xl transition-all">
            <Settings size={18} className="text-slate-500" />
            Account Settings
          </button>

          <div className="my-1 border-t border-slate-800/50" />

          <button 
            onClick={handleLogout} 
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
};

export default ProfileDropdown;