import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { LogIn, GraduationCap } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/login', { username, password });
      login(response.data.token, response.data.user);
      navigate(response.data.user.role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Pane - Image/Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-indigo-900 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
          alt="Campus" 
          className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-900 via-indigo-900/60 to-transparent flex flex-col justify-end p-16">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl flex items-center justify-center mb-8">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl xl:text-5xl font-black text-white mb-6 leading-tight">
            CampusCare.<br />
            Suara Anda, <span className="text-indigo-300">Prioritas Kami.</span>
          </h1>
          <p className="text-indigo-100 text-lg max-w-md leading-relaxed">
            Bergabunglah dengan ribuan mahasiswa dan staf untuk bersama-sama menjaga dan meningkatkan fasilitas serta lingkungan kampus kita.
          </p>
        </div>
      </div>

      {/* Right Pane - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 xl:p-24 bg-slate-50 relative">
        <div className="w-full max-w-md relative z-10">
          <div className="flex flex-col items-center lg:items-start mb-10">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex lg:hidden items-center justify-center shadow-lg shadow-indigo-200 mb-6">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-black text-slate-800">{t('login.welcome')} 👋</h2>
            <p className="text-slate-500 text-base mt-2">{t('login.subtitle')}</p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-semibold border border-red-100 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">{t('login.username')}</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-5 py-3.5 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 shadow-sm"
                placeholder="Masukkan username Anda"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">{t('login.password')}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-3.5 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 shadow-sm"
                placeholder="••••••••"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 transition-all duration-200 flex items-center justify-center gap-2 mt-4"
            >
              {loading ? t('login.signing_in') : (
                <>
                  <LogIn className="w-5 h-5" />
                  {t('login.signin')}
                </>
              )}
            </button>
          </form>

          <p className="mt-10 text-center text-sm font-medium text-slate-600">
            {t('login.no_account')}{' '}
            <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-bold hover:underline">
              {t('login.register_here')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
