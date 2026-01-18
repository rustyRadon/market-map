import { useState, useRef } from 'react';
import { useAuthStore } from '../store/useAuthStore.ts';
import { Camera, ArrowLeft, Save, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfileSettings = () => {
  const navigate = useNavigate();
  const { profileImage, setProfileImage, user } = useAuthStore();
  const [tempImage, setTempImage] = useState(profileImage);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setProfileImage(tempImage);
    navigate('/');
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
        Back to Dashboard
      </button>

      <div className="bg-[#16161a] border border-slate-800 rounded-3xl p-6 md:p-10 shadow-2xl">
        <h1 className="text-2xl font-bold text-white mb-2">Profile Settings</h1>
        <p className="text-slate-500 mb-10">Manage your public identity and avatar.</p>

        <div className="flex flex-col items-center mb-10">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <img 
              src={tempImage} 
              alt="Preview" 
              className="w-32 h-32 rounded-full object-cover border-4 border-blue-600/20 shadow-2xl transition-all group-hover:border-blue-500/50" 
            />
            <div className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-white text-xs gap-1">
              <Camera size={24} />
              <span className="font-semibold">Update Photo</span>
            </div>
          </div>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
        </div>

        <div className="space-y-8">
          <div className="bg-[#0a0a0c] p-4 rounded-2xl border border-slate-800/50">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 px-1">
              Display Name
            </label>
            <p className="text-white font-medium px-1">{user?.name || 'Rusty Radon'}</p>
          </div>

          <div className="pt-4 space-y-4">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-[#1c1c22] hover:bg-[#25252e] border border-slate-700 py-4 rounded-xl flex items-center justify-center gap-2 text-slate-300 transition-all"
            >
              <Upload size={18} /> 
              Upload New Image
            </button>

            <button 
              onClick={handleSave} 
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98]"
            >
              <Save size={20} /> 
              Save Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;