import React from 'react';
import { Instagram, Twitter, Phone as Whatsapp, Mail, MapPin, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="mt-auto py-8 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 transition-colors">
      <div className="max-w-6xl mx-auto px-4 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="space-y-4 max-w-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
                C
              </div>
              <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                CampusCare
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 font-semibold italic">
              "Suara Anda, Prioritas Kami"
            </p>
            <div className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Medan, Sumatera Utara, 2025</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>+62 838 5392 1276</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>c4mpuscare@gmail.com</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-4">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Temukan kami di:
            </p>
            <div className="flex gap-4">
              <a href="https://www.instagram.com/c4mpus_care/" target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-pink-600 dark:hover:text-pink-400 rounded-full transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://x.com/CampusCare" target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-blue-400 rounded-full transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://wa.me/6283853921276" target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-green-500 rounded-full transition-colors">
                <Whatsapp className="w-5 h-5" />
              </a>
            </div>
            <p className="text-xs text-slate-400 mt-4">
              &copy; {new Date().getFullYear()} CampusCare. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
