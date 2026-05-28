import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { PlusCircle, Clock, CheckCircle2, AlertCircle, FileText, Image as ImageIcon, X, Trash2, Edit, MessageSquare } from 'lucide-react';
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
}

const StudentDashboard = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Fasilitas');
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [viewImage, setViewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { token } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    fetchReports();
    
    const socket = io(import.meta.env.VITE_API_URL || undefined);
    socket.on('reportCreated', (newReport: Report) => {
      // Students only see their own reports, so usually they won't need this unless they are the creator
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

  const getImageUrl = (url?: string | null) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('blob:')) return url;
    let baseUrl = import.meta.env.VITE_API_URL || '';
    baseUrl = baseUrl.replace(/\/api\/?$/, ''); // Remove /api if present
    return `${baseUrl.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const openCreateModal = () => {
    setEditingId(null);
    setTitle('');
    setCategory('Fasilitas');
    setDescription('');
    setIsAnonymous(false);
    setImageFile(null);
    setImagePreview(null);
    setIsModalOpen(true);
  };

  const openEditModal = (report: Report) => {
    setEditingId(report.id);
    setTitle(report.title);
    setCategory(report.category);
    setDescription(report.description);
    setIsAnonymous(report.isAnonymous);
    setImageFile(null);
    setImagePreview(report.imageUrl ? getImageUrl(report.imageUrl) : null);
    setIsModalOpen(true);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData();
    formData.append('title', title);
    formData.append('category', category);
    formData.append('description', description);
    formData.append('isAnonymous', String(isAnonymous));
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      if (editingId) {
        const res = await axios.put(`/api/reports/${editingId}`, formData);
        setReports(prev => prev.map(r => r.id === editingId ? res.data : r));
      } else {
        const res = await axios.post('/api/reports', formData);
        setReports([res.data, ...reports]);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save report');
      alert('Gagal menyimpan laporan');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"><Clock className="w-3.5 h-3.5" /> {t('dashboard.pending')}</span>;
      case 'PROCESSING':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"><AlertCircle className="w-3.5 h-3.5" /> {t('dashboard.processing')}</span>;
      case 'RESOLVED':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" /> {t('dashboard.resolved')}</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{t('dashboard.my_reports')}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t('dashboard.my_reports_sub')}</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-md shadow-indigo-200 dark:shadow-none transition-all duration-200"
        >
          <PlusCircle className="w-5 h-5" />
          {t('dashboard.create_report')}
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {reports.length === 0 ? (
          <div className="col-span-full py-16 flex flex-col items-center justify-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 transition-colors animate-in fade-in zoom-in duration-500 shadow-sm">
            <div className="relative mb-5">
               <div className="absolute inset-0 bg-indigo-100 dark:bg-indigo-900/30 rounded-full animate-ping opacity-75"></div>
               <div className="relative w-20 h-20 bg-indigo-50 dark:bg-slate-700/50 rounded-full flex items-center justify-center border-2 border-indigo-100 dark:border-indigo-900/50">
                 <FileText className="w-10 h-10 text-indigo-500 dark:text-indigo-400" />
               </div>
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{t('dashboard.no_reports')}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm text-center mb-6">{t('dashboard.no_reports_sub')}</p>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all duration-200 hover:scale-105"
            >
              <PlusCircle className="w-5 h-5" />
              Buat Laporan Pertama
            </button>
          </div>
        ) : (
          reports.map(report => (
            <div key={report.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md hover:border-indigo-100 dark:hover:border-indigo-900 transition-all duration-200 group flex flex-col overflow-hidden">
              {report.imageUrl && (
                <div 
                  className="h-48 w-full bg-slate-100 dark:bg-slate-900 relative overflow-hidden cursor-pointer"
                  onClick={() => setViewImage(getImageUrl(report.imageUrl as string))}
                >
                  <img 
                    src={getImageUrl(report.imageUrl)} 
                    alt="Report attachment" 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = 'https://placehold.co/600x400/f8fafc/94a3b8?text=Gambar+Hilang';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              )}
              <div className="p-6 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-4">
                  <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold tracking-wide uppercase">
                    {report.category}
                  </span>
                  {getStatusBadge(report.status)}
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{report.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-3 mb-4 flex-1">{report.description}</p>
                
                {report.adminComment && (
                  <div className="mb-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-900/50">
                    <div className="flex items-center gap-2 mb-1">
                      <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span className="text-xs font-bold text-indigo-800 dark:text-indigo-300">Tanggapan Admin:</span>
                    </div>
                    <p className="text-sm text-indigo-700 dark:text-indigo-200/80">{report.adminComment}</p>
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-700/50 mt-auto">
                  <div className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                    {new Date(report.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    {report.isAnonymous && <span className="ml-2 px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-slate-500">Anonim</span>}
                  </div>
                  
                  {report.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <button onClick={() => openEditModal(report)} className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors bg-slate-50 hover:bg-indigo-50 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-md">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(report.id)} className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors bg-slate-50 hover:bg-red-50 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-md">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden flex flex-col max-h-[90vh] transition-colors">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                {editingId ? 'Edit Laporan' : t('report_form.title')}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{t('report_form.title_label')}</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white transition-shadow"
                    placeholder={t('report_form.title_placeholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{t('report_form.category')}</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white transition-shadow appearance-none"
                  >
                    <option value="Fasilitas">Fasilitas</option>
                    <option value="Jaringan">Jaringan Internet</option>
                    <option value="Administrasi">Administrasi</option>
                    <option value="Akademik">Akademik</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{t('report_form.desc_label')}</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white transition-shadow resize-none"
                    placeholder={t('report_form.desc_placeholder')}
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="anonymousCheck"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 bg-slate-100 border-slate-300 rounded focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-slate-800 dark:bg-slate-700 dark:border-slate-600"
                  />
                  <label htmlFor="anonymousCheck" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                    Kirim laporan secara anonim
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{t('report_form.image')}</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-slate-200 dark:border-slate-600 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:border-indigo-300 transition-colors"
                  >
                    {imagePreview ? (
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-900">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                        <button 
                          type="button" 
                          onClick={(e) => { e.stopPropagation(); setImageFile(null); setImagePreview(null); }}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <ImageIcon className="w-8 h-8 text-slate-300 dark:text-slate-500 mx-auto mb-2" />
                        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Click to upload image</span>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>
              <div className="mt-8 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  {t('report_form.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-200 dark:shadow-none transition-all"
                >
                  {loading ? t('report_form.submitting') : (editingId ? 'Simpan Perubahan' : t('report_form.submit'))}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewImage && (
        <ImageViewer 
          src={viewImage} 
          alt="Report full view" 
          onClose={() => setViewImage(null)} 
        />
      )}
    </div>
  );
};

export default StudentDashboard;
