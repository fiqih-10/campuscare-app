import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Clock, CheckCircle2, AlertCircle, LayoutList, Search, Image as ImageIcon, Trash2, Edit, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import ImageViewer from '../components/ImageViewer';

interface Report {
  id: string;
  title: string;
  category: string;
  description: string;
  imageUrl?: string | null;
  isAnonymous: boolean;
  adminComment?: string | null;
  status: 'PENDING' | 'PROCESSING' | 'RESOLVED';
  createdAt: string;
  user: {
    username: string;
  };
}

const AdminDashboard = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  
  const [viewImage, setViewImage] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [statusUpdate, setStatusUpdate] = useState('');
  const [adminComment, setAdminComment] = useState('');
  
  const { t } = useTranslation();

  useEffect(() => {
    fetchReports();
    
    const socket = io(import.meta.env.VITE_API_URL || undefined);
    socket.on('reportCreated', (newReport: Report) => {
      setReports(prev => [newReport, ...prev]);
    });
    socket.on('reportUpdated', (updatedReport: Report) => {
      setReports(prev => prev.map(r => r.id === updatedReport.id ? updatedReport : r));
    });
    socket.on('reportDeleted', (deletedId: string) => {
      setReports(prev => prev.filter(r => r.id !== deletedId));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchReports = async () => {
    try {
      const res = await axios.get('/api/reports');
      setReports(res.data);
    } catch (error) {
      console.error('Failed to fetch reports');
    }
  };

  const openStatusModal = (report: Report) => {
    setSelectedReport(report);
    setStatusUpdate(report.status);
    setAdminComment(report.adminComment || '');
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;
    try {
      await axios.patch(`/api/reports/${selectedReport.id}/status`, { 
        status: statusUpdate,
        adminComment: adminComment 
      });
      setSelectedReport(null);
    } catch (error) {
      console.error('Failed to update status');
      alert('Gagal mengupdate status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('report_form.confirm_delete') || 'Apakah Anda yakin ingin menghapus laporan ini?')) return;
    try {
      await axios.delete(`/api/reports/${id}`);
      setReports(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error('Failed to delete report');
      alert('Gagal menghapus laporan');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 uppercase"><Clock className="w-3 h-3" /> {t('dashboard.pending')}</span>;
      case 'PROCESSING':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 uppercase"><AlertCircle className="w-3 h-3" /> {t('dashboard.processing')}</span>;
      case 'RESOLVED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 uppercase"><CheckCircle2 className="w-3 h-3" /> {t('dashboard.resolved')}</span>;
      default:
        return null;
    }
  };

  const filteredReports = reports.filter(r => {
    const username = r.isAnonymous ? 'Anonim' : r.user.username;
    const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) || username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || r.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getImageUrl = (url?: string | null) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('blob:')) return url;
    let baseUrl = import.meta.env.VITE_API_URL || '';
    baseUrl = baseUrl.replace(/\/api\/?$/, ''); // Remove /api if present
    return `${baseUrl.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
  };

  const totalReports = reports.length;
  const pendingReports = reports.filter(r => r.status === 'PENDING').length;
  const processingReports = reports.filter(r => r.status === 'PROCESSING').length;
  const resolvedReports = reports.filter(r => r.status === 'RESOLVED').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{t('admin.title')}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t('admin.subtitle')}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={t('admin.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 w-full sm:w-64 rounded-xl border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm transition-colors"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium bg-white dark:bg-slate-700 text-slate-800 dark:text-white transition-colors"
          >
            <option value="ALL">{t('admin.all_status')}</option>
            <option value="PENDING">{t('dashboard.pending')}</option>
            <option value="PROCESSING">{t('dashboard.processing')}</option>
            <option value="RESOLVED">{t('dashboard.resolved')}</option>
          </select>
        </div>
      </div>

      {/* Mini Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col gap-1 transition-all hover:scale-105 hover:shadow-md duration-300">
          <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Laporan</span>
          <span className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2"><FileText className="w-5 h-5 text-indigo-500" /> {totalReports}</span>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col gap-1 transition-all hover:scale-105 hover:shadow-md duration-300">
          <span className="text-amber-600 dark:text-amber-500 text-xs font-semibold uppercase tracking-wider">Menunggu</span>
          <span className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2"><Clock className="w-5 h-5 text-amber-500" /> {pendingReports}</span>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col gap-1 transition-all hover:scale-105 hover:shadow-md duration-300">
          <span className="text-blue-600 dark:text-blue-500 text-xs font-semibold uppercase tracking-wider">Diproses</span>
          <span className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2"><AlertCircle className="w-5 h-5 text-blue-500" /> {processingReports}</span>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col gap-1 transition-all hover:scale-105 hover:shadow-md duration-300">
          <span className="text-emerald-600 dark:text-emerald-500 text-xs font-semibold uppercase tracking-wider">Selesai</span>
          <span className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> {resolvedReports}</span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-200 text-xs uppercase font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4">{t('admin.report_details')}</th>
                <th className="px-6 py-4">{t('admin.category')}</th>
                <th className="px-6 py-4">{t('admin.reporter')}</th>
                <th className="px-6 py-4">{t('admin.status')}</th>
                <th className="px-6 py-4 text-right">{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
                      <div className="relative mb-4">
                        <div className="absolute inset-0 bg-indigo-100 dark:bg-indigo-900/30 rounded-full animate-ping opacity-75"></div>
                        <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 dark:bg-slate-800 border-2 border-indigo-100 dark:border-indigo-900/50">
                          <LayoutList className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />
                        </div>
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">Belum ada laporan</h3>
                      <p className="text-slate-500 dark:text-slate-400 font-medium mb-4 max-w-sm mx-auto">Saat ini belum ada laporan yang masuk atau sesuai dengan filter Anda.</p>
                      <button onClick={() => {setSearchTerm(''); setFilterStatus('ALL');}} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-semibold transition-colors">Reset Filter</button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex gap-4">
                        {report.imageUrl && (
                           <div 
                             className="w-16 h-16 shrink-0 bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden hidden sm:block relative cursor-pointer group/image"
                             onClick={() => setViewImage(getImageUrl(report.imageUrl as string))}
                           >
                             <img 
                               src={getImageUrl(report.imageUrl)} 
                               alt="Report" 
                               className="w-full h-full object-cover group-hover/image:scale-110 transition-transform duration-300" 
                               onError={(e) => {
                                 const target = e.target as HTMLImageElement;
                                 target.onerror = null; // Prevent infinite loop
                                 target.src = 'https://placehold.co/400x400/f8fafc/94a3b8?text=Gambar+Hilang';
                               }}
                             />
                             <div className="absolute inset-0 bg-black/0 hover:bg-black/10 flex items-center justify-center transition-colors">
                               <ImageIcon className="w-4 h-4 text-white opacity-0 group-hover/image:opacity-100" />
                             </div>
                           </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-800 dark:text-white mb-1">{report.title}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 max-w-xs">{report.description}</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-medium">{new Date(report.createdAt).toLocaleString('id-ID')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md text-xs font-bold tracking-wide uppercase">
                        {report.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-xs">
                          {report.isAnonymous ? 'A' : report.user.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-slate-700 dark:text-slate-300">{report.isAnonymous ? 'Anonim' : report.user.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(report.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openStatusModal(report)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                          title="Tanggapi & Update Status"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(report.id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Hapus Laporan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {viewImage && (
        <ImageViewer 
          src={viewImage} 
          alt="Report full view" 
          onClose={() => setViewImage(null)} 
        />
      )}

      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedReport(null)}></div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md relative z-10 p-6 transition-colors">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Update Status & Tanggapan</h2>
            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Status Laporan</label>
                <select
                  value={statusUpdate}
                  onChange={(e) => setStatusUpdate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-white transition-colors"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="PROCESSING">PROCESSING</option>
                  <option value="RESOLVED">RESOLVED</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Komentar / Tanggapan</label>
                <textarea
                  value={adminComment}
                  onChange={(e) => setAdminComment(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-white transition-colors resize-none"
                  placeholder="Tambahkan catatan untuk pelapor (misal: AC sudah dibenarkan ya)"
                />
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
