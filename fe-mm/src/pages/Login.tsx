import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore'; // Import your store

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const login = useAuthStore((state) => state.login); // Get login function from store
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:8080/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const userData = await response.json();
        login(userData); // This saves to local storage and updates the app state
        navigate('/'); // Go to market overview
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('Connection to server failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6 bg-[#16161a] p-8 rounded-2xl border border-slate-800">
        <h2 className="text-2xl font-bold text-white text-center">Welcome Back</h2>
        
        {error && <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm rounded-lg">{error}</div>}

        <input 
          type="email" 
          placeholder="Email" 
          className="w-full p-3 bg-[#0a0a0c] border border-slate-800 rounded-lg text-white focus:border-blue-600 outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input 
          type="password" 
          placeholder="Password" 
          className="w-full p-3 bg-[#0a0a0c] border border-slate-800 rounded-lg text-white focus:border-blue-600 outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all">
          Login
        </button>

        <p className="text-center text-slate-500 text-sm">
          New here? <Link to="/signup" className="text-blue-500">Create an account</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;