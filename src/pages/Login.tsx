import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../auth/AuthContext';
import { AlertCircle, Loader2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('rahul.admin@Finance.zorvyn.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post('https://zorvyn-backend-0n6d.onrender.com/api/auth/login', {
        email,
        password,
      });

      if (response.data && response.data.token && response.data.data) {
        login(response.data.token, response.data.data);
        navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to login. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-950 p-4 font-sans relative overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute top-1/3 -left-48 w-96 h-96 bg-primary-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 -right-48 w-96 h-96 bg-accent-500/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md animate-fade-in animate-slide-up z-10">
        <div className="glass-card p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 flex items-center justify-center mb-2">
              <img 
                src="https://companyasset.blob.core.windows.net/assets/zorvynlogolight.png" 
                alt="Zorvyn Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
            <p className="text-gray-400 text-center">Sign in to your financial dashboard to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl flex items-start space-x-3 text-sm">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5" htmlFor="email">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  className="input-field"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  className="input-field"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary flex items-center justify-center h-12"
            >
              {isLoading ? <Loader2 size={20} className="animate-spin text-white" /> : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Demo Credentials */}
        <div className="mt-4 glass-card p-5 border-surface-border">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 text-center">
            🔑 Demo Accounts — Click to Auto-Fill
          </p>
          <div className="space-y-2">
            {[
              { role: 'ADMIN', name: 'Rahul', email: 'rahul.admin@Finance.zorvyn.com', color: 'border-red-500/30 hover:bg-red-500/5', badge: 'bg-red-500/10 text-red-400' },
              { role: 'ANALYST', name: 'Priya', email: 'priya.analyst@Finance.zorvyn.com', color: 'border-yellow-500/30 hover:bg-yellow-500/5', badge: 'bg-yellow-500/10 text-yellow-400' },
              { role: 'VIEWER', name: 'Amit', email: 'amit.viewer@Finance.zorvyn.com', color: 'border-blue-500/30 hover:bg-blue-500/5', badge: 'bg-blue-500/10 text-blue-400' },
            ].map(u => (
              <button
                key={u.role}
                type="button"
                onClick={() => { setEmail(u.email); setPassword('password123'); }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all duration-200 text-left ${u.color}`}
              >
                <div>
                  <p className="text-sm font-semibold text-gray-200">{u.name}</p>
                  <p className="text-[11px] text-gray-500 truncate">{u.email}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0 ml-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${u.badge}`}>{u.role}</span>
                  <span className="text-[10px] text-gray-600 font-mono">password123</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
