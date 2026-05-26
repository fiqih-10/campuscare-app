import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut } from 'lucide-react';

interface ImageViewerProps {
  src: string;
  alt: string;
  onClose: () => void;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ src, alt, onClose }) => {
  const [scale, setScale] = useState(1);

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale(prev => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale(prev => Math.max(prev - 0.5, 0.5));
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 overflow-auto"
      onClick={onClose}
    >
      <div className="fixed top-4 right-4 flex gap-2 z-10">
        <button 
          onClick={handleZoomOut}
          className="p-2 bg-white/20 hover:bg-white/40 text-white rounded-full transition-colors backdrop-blur-md"
        >
          <ZoomOut className="w-6 h-6" />
        </button>
        <button 
          onClick={handleZoomIn}
          className="p-2 bg-white/20 hover:bg-white/40 text-white rounded-full transition-colors backdrop-blur-md"
        >
          <ZoomIn className="w-6 h-6" />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="p-2 bg-white/20 hover:bg-red-500/80 text-white rounded-full transition-colors backdrop-blur-md ml-4"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      
      <div 
        className="relative transition-transform duration-200 origin-center"
        style={{ transform: `scale(${scale})` }}
        onClick={(e) => e.stopPropagation()}
      >
        <img 
          src={src} 
          alt={alt} 
          className="max-w-none max-h-[90vh] object-contain rounded-sm shadow-2xl" 
        />
      </div>
    </div>
  );
};

export default ImageViewer;
