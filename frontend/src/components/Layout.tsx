import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, Menu, X, User as UserIcon, Globe, Moon, Sun, ShieldAlert, FileText, CheckCircle2, MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Footer from './Footer';
import FeedbackWidget from './FeedbackWidget';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) {
      setIsDark(true);
    }
  }, []);

  const toggleDarkMode = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'id' ? 'en' : 'id';
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex transition-colors">
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/40 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transform transition-transform duration-300 ease-in-out flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
              C
            </div>
            <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              CampusCare
            </span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <button
            onClick={() => navigate(user?.role === 'ADMIN' ? '/admin' : '/dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
              location.pathname === '/dashboard' || location.pathname === '/admin'
                ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 shadow-sm shadow-indigo-100 dark:shadow-none'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-indigo-600 dark:hover:text-indigo-400'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            {t('layout.dashboard')}
          </button>

          {user?.role === 'ADMIN' && (
            <>
              <button
                onClick={() => navigate('/admin/users')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                  location.pathname.includes('/admin/users')
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 shadow-sm shadow-indigo-100 dark:shadow-none'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
              >
                <ShieldAlert className="w-5 h-5" />
                Kelola Admin
              </button>
              <button
                onClick={() => navigate('/admin/feedbacks')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                  location.pathname.includes('/admin/feedbacks')
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 shadow-sm shadow-indigo-100 dark:shadow-none'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
              >
                <MessageSquare className="w-5 h-5" />
                Saran & Kritik
              </button>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl mb-4">
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <UserIcon className="w-5 h-5" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{user?.username}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl transition-colors duration-200"
          >
            <LogOut className="w-4 h-4" />
            {t('layout.logout')}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 flex items-center px-4 lg:px-8 sticky top-0 z-10 transition-colors">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2 mr-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1" />
          
          <div className="flex items-center gap-3 sm:gap-4">
            {user?.role === 'STUDENT' && (
              <button
                onClick={() => setShowGuide(true)}
                className="flex items-center gap-2 p-2 sm:px-3 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors font-medium text-sm"
                title="Panduan Singkat"
              >
                <FileText className="w-5 h-5" />
                <span className="hidden sm:inline">Panduan Singkat</span>
              </button>
            )}
            <button
              onClick={toggleDarkMode}
              className="p-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              title="Toggle Dark Mode"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button 
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors uppercase"
            >
              <Globe className="w-4 h-4" />
              {i18n.language || 'id'}
            </button>
            <div className="text-sm font-medium text-slate-600 dark:text-slate-300 hidden sm:block border-l border-slate-200 dark:border-slate-600 pl-4">
              {t('layout.welcome')}, <span className="text-indigo-600 dark:text-indigo-400 font-bold">{user?.username}</span>!
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto flex flex-col">
          <div className="p-4 lg:p-8 flex-1">
            <div className="max-w-6xl mx-auto">
              <Outlet />
            </div>
          </div>
          <Footer />
        </div>
      </main>
      {user?.role === 'STUDENT' && <FeedbackWidget />}

      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowGuide(false)}></div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh] transition-colors animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-gradient-to-r from-indigo-500 to-purple-600">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText className="w-6 h-6" />
                Panduan Singkat: Cara Membuat Laporan
              </h2>
              <button onClick={() => setShowGuide(false)} className="text-white hover:text-indigo-100 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto bg-slate-50 dark:bg-slate-900">
              <ol className="list-decimal list-inside space-y-3 mb-6 text-slate-700 dark:text-slate-300">
                <li>Klik tombol <strong className="text-indigo-600 dark:text-indigo-400">"Buat Laporan"</strong> di dasbor Anda.</li>
                <li>Isi judul, pilih kategori, dan tulis deskripsi masalah yang Anda temui dengan jelas.</li>
                <li>Unggah foto bukti (opsional namun sangat disarankan untuk memudahkan tindak lanjut).</li>
                <li>Centang <strong className="text-indigo-600 dark:text-indigo-400">"Kirim laporan secara anonim"</strong> jika ingin merahasiakan identitas Anda.</li>
                <li>Klik <strong className="text-indigo-600 dark:text-indigo-400">"Kirim"</strong>. Laporan Anda akan masuk dalam status <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-xs font-bold">Menunggu</span> dan akan segera diproses.</li>
              </ol>
              <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-indigo-500" /> Mengapa Menggunakan Laporan Anonim?
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Fitur pelaporan anonim dirancang untuk melindungi privasi Anda. Gunakan opsi ini saat melaporkan isu-isu sensitif agar Anda merasa lebih aman dan nyaman. Meskipun identitas Anda disembunyikan, laporan Anda tetap menjadi prioritas kami dan akan ditindaklanjuti secara profesional oleh pihak kampus.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
