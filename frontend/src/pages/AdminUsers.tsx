import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, Trash2, PlusCircle, UserPlus, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AdminUser {
  id: string;
  username: string;
  role: string;
  createdAt: string;
}

const AdminUsers = () => {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const res = await axios.get('/api/users/admins');
      setAdmins(res.data);
    } catch (error) {
      console.error('Failed to fetch admins');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await axios.post('/api/users/admins', {
        username,
        password
      });
      setAdmins(prev => [...prev, res.data]);
      setIsModalOpen(false);
      setUsername('');
      setPassword('');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal menambahkan admin');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (id === currentUser?.id) {
      alert('Anda tidak bisa menghapus akun Anda sendiri');
      return;
    }
    
    if (!window.confirm('Apakah Anda yakin ingin menghapus akun admin ini?')) return;
    
    try {
      await axios.delete(`/api/users/admins/${id}`);
      setAdmins(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      alert('Gagal menghapus admin');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Kelola Admin</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Tambah atau hapus akses akun admin</p>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-md shadow-indigo-200 dark:shadow-none transition-all duration-200"
        >
          <UserPlus className="w-5 h-5" />
          Tambah Admin
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-200 text-xs uppercase font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4">Username</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Terdaftar Pada</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold">
                        {admin.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold text-slate-800 dark:text-white">
                        {admin.username} {admin.id === currentUser?.id && <span className="text-xs font-normal text-indigo-500 ml-2">(Anda)</span>}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400 uppercase">
                      <Shield className="w-3.5 h-3.5" /> {admin.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                    {new Date(admin.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {admin.id !== currentUser?.id && (
                      <button
                        onClick={() => handleDelete(admin.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Hapus Admin"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md relative z-10 p-6 transition-colors">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">Tambah Akun Admin</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-white transition-colors"
                  placeholder="Masukkan username admin baru"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-white transition-colors"
                  placeholder="Masukkan password"
                />
              </div>
              
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                >
                  {loading ? 'Menyimpan...' : 'Tambah Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
