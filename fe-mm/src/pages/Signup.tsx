import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { API_BASE_URL } from '../config';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.status === 201) {
        alert("Account created! Please login.");
        navigate('/login');
      } else {
        const data = await response.text();
        setError(data || "Registration failed");
      }
    } catch (err) {
      console.error("Signup Error:", err);
      setError("Could not connect to the backend server.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4 bg-[#16161a] p-8 rounded-2xl border border-slate-800">
        <h2 className="text-2xl font-bold text-white">Create Account</h2>
        {error && <p className="text-rose-500 text-sm bg-rose-500/10 p-2 rounded">{error}</p>}
        <input 
          type="email" placeholder="Email" className="w-full p-3 bg-black border border-slate-800 rounded text-white"
          onChange={(e) => setEmail(e.target.value)} required 
        />
        <div className="relative">
          <input 
            type={showPassword ? "text" : "password"} 
            placeholder="Password" 
            className="w-full p-3 bg-black border border-slate-800 rounded text-white pr-12"
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <div className="relative">
          <input 
            type={showConfirmPassword ? "text" : "password"} 
            placeholder="Confirm Password" 
            className="w-full p-3 bg-black border border-slate-800 rounded text-white pr-12"
            onChange={(e) => setConfirmPassword(e.target.value)} 
            required 
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <button className="w-full py-3 bg-blue-600 text-white rounded font-bold">Sign Up</button>
        <p className="text-slate-500 text-sm">Already have an account? <Link to="/login" className="text-blue-400">Login</Link></p>
      </form>
    </div>
  );
};

export default Signup;