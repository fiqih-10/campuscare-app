import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, Calendar, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Feedback {
  id: string;
  message: string;
  createdAt: string;
  user: {
    username: string;
  };
}

const AdminFeedbacks = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const res = await axios.get('/api/feedbacks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFeedbacks(res.data);
    } catch (error) {
      console.error('Failed to fetch feedbacks', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-indigo-500" />
            Saran & Kritik Pengguna
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Lihat semua masukan yang dikirimkan oleh pengguna aplikasi.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        </div>
      ) : feedbacks.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
          <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200">Belum ada saran & kritik</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Saran yang masuk akan tampil di sini.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {feedbacks.map((feedback) => (
            <div key={feedback.id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
              <p className="text-slate-700 dark:text-slate-300 text-sm mb-4 leading-relaxed whitespace-pre-wrap">
                "{feedback.message}"
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-700/50 mt-auto">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                  <UserIcon className="w-3.5 h-3.5 text-indigo-500" />
                  {feedback.user.username}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
                  <Calendar className="w-3 h-3" />
                  {new Date(feedback.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminFeedbacks;
