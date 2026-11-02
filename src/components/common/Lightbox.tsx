import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { resolveImageUrl } from '../../lib/utils';

export interface LightboxImage {
  url: string;
  title?: string | null;
  altText?: string | null;
}

export interface LightboxProps {
  isOpen: boolean;
  onClose: () => void;
  images: LightboxImage[];
  currentIndex: number;
  onNavigate: (newIndex: number) => void;
}

export const Lightbox: React.FC<LightboxProps> = ({
  isOpen,
  onClose,
  images,
  currentIndex,
  onNavigate,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, currentIndex, images.length]);

  if (!isOpen || images.length === 0) return null;

  const current = images[currentIndex] || images[0];

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const nextIdx = (currentIndex - 1 + images.length) % images.length;
    onNavigate(nextIdx);
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const nextIdx = (currentIndex + 1) % images.length;
    onNavigate(nextIdx);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/95 backdrop-blur-md select-none animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Top Header info and close button */}
      <div
        className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex items-center justify-between z-10 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <span className="text-xs uppercase tracking-wider px-2.5 py-1 bg-white/10 rounded-full font-mono text-sky-300">
            {currentIndex + 1} / {images.length}
          </span>
          {current.title && (
            <h4
              style={{ fontFamily: "'Inter', sans-serif" }}
              className="font-inter text-sm sm:text-base font-medium truncate max-w-md"
            >
              {current.title}
            </h4>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          aria-label="Close Lightbox"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Image View */}
      <div
        className="relative max-w-5xl max-h-[82vh] p-4 flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={resolveImageUrl(current.url)}
          alt={current.altText || current.title || 'Gallery photograph'}
          className="max-h-[80vh] max-w-full object-contain rounded-lg shadow-2xl transition-all duration-200 animate-in zoom-in-95"
          loading="eager"
        />
      </div>

      {/* Left Navigation Arrow */}
      {images.length > 1 && (
        <button
          onClick={handlePrev}
          className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 p-3 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-all hover:scale-110 active:scale-95"
          aria-label="Previous Image"
        >
          <ChevronLeft className="w-7 h-7" />
        </button>
      )}

      {/* Right Navigation Arrow */}
      {images.length > 1 && (
        <button
          onClick={handleNext}
          className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 p-3 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-all hover:scale-110 active:scale-95"
          aria-label="Next Image"
        >
          <ChevronRight className="w-7 h-7" />
        </button>
      )}
    </div>
  );
};
