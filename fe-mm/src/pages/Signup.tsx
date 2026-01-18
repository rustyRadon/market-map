import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore.ts';
import { UserPlus, Mail, Lock, User as UserIcon, ArrowRight } from 'lucide-react';

const Signup = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ id: '1', name: formData.name, email: formData.email });
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0f0f12] border border-slate-800 rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
            <UserPlus className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white">Join MarketMap</h1>
          <p className="text-slate-500 mt-2">Start tracking prices like a pro.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="text"
              required
              placeholder="Full Name"
              className="w-full bg-[#16161a] border border-slate-800 rounded-xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500 transition-all"
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="email"
              required
              placeholder="Email Address"
              className="w-full bg-[#16161a] border border-slate-800 rounded-xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500 transition-all"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="password"
              required
              placeholder="Create Password"
              className="w-full bg-[#16161a] border border-slate-800 rounded-xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500 transition-all"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95">
            Create Account <ArrowRight size={18} />
          </button>
        </form>

        <p className="text-center text-slate-500 mt-8 text-sm">
          Already have an account? <Link to="/login" className="text-blue-500 hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;