import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserPlus, GraduationCap } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await axios.post('/api/auth/register', { username, password, role: 'STUDENT' });
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Pane - Image/Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-purple-900 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
          alt="Campus Students" 
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-purple-950 via-purple-900/60 to-transparent flex flex-col justify-end p-16">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl flex items-center justify-center mb-8">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl xl:text-5xl font-black text-white mb-6 leading-tight">
            Langkah Awal<br />
            Untuk Kampus <span className="text-purple-300">Lebih Baik.</span>
          </h1>
          <p className="text-purple-100 text-lg max-w-md leading-relaxed">
            Daftarkan akunmu sekarang dan jadilah bagian dari perubahan positif di lingkungan kampus kita.
          </p>
        </div>
      </div>

      {/* Right Pane - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 xl:p-24 bg-slate-50 relative">
        <div className="w-full max-w-md relative z-10">
          <div className="flex flex-col items-center lg:items-start mb-10">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex lg:hidden items-center justify-center shadow-lg shadow-purple-200 mb-6">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-black text-slate-800">Daftar Akun Baru 🚀</h2>
            <p className="text-slate-500 text-base mt-2">Bergabung dengan CampusCare hari ini</p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-semibold border border-red-100 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              {error}
            </div>
          )}
          {success && (
            <div className="mb-8 p-4 bg-emerald-50 text-emerald-600 rounded-xl text-sm font-semibold border border-emerald-100 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">{t('login.username')}</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-5 py-3.5 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 shadow-sm"
                placeholder="Pilih username Anda"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">{t('login.password')}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-3.5 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 shadow-sm"
                placeholder="••••••••"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-lg shadow-purple-200 focus:outline-none focus:ring-4 focus:ring-purple-500/50 transition-all duration-200 flex items-center justify-center gap-2 mt-4"
            >
              {loading ? 'Membuat akun...' : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Daftar Sekarang
                </>
              )}
            </button>
          </form>

          <p className="mt-10 text-center text-sm font-medium text-slate-600">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-purple-600 hover:text-purple-700 font-bold hover:underline">
              {t('login.signin')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
