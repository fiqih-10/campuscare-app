import React, { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

const FeedbackWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    
    // In a real app, this would send to an API
    console.log('Feedback submitted:', feedback);
    setSubmitted(true);
    setTimeout(() => {
      setIsOpen(false);
      setSubmitted(false);
      setFeedback('');
    }, 3000);
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col-reverse items-start">
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
        aria-label="Kirim Saran atau Kritik"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-7 h-7" />}
      </button>

      {/* Popover Form */}
      {isOpen && (
        <div className="mb-4 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden animate-in slide-in-from-bottom-2 fade-in duration-200 origin-bottom-left">
          <div className="bg-blue-500 p-4 text-white">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Saran & Kritik
            </h3>
            <p className="text-blue-100 text-sm mt-1">Bantu kami meningkatkan aplikasi ini</p>
          </div>
          
          <div className="p-4">
            {submitted ? (
              <div className="py-6 text-center text-slate-600 dark:text-slate-300">
                <div className="w-12 h-12 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <p className="font-semibold">Terima kasih!</p>
                <p className="text-sm">Masukan Anda sangat berharga.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Ketik saran, komentar, atau kritik Anda di sini..."
                  rows={4}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white resize-none text-sm"
                  required
                />
                <button
                  type="submit"
                  className="w-full py-2.5 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  Kirim Masukan
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackWidget;
