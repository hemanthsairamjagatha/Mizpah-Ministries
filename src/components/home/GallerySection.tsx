import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { GalleryCategory, GalleryCollectionWithImages } from '../../types/database.types';
import { Lightbox, type LightboxImage } from '../common/Lightbox';
import { resolveImageUrl } from '../../lib/utils';
import { Camera, Images, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Skeleton } from '../common/Skeleton';

export interface GallerySectionProps {
  categories: GalleryCategory[];
  collections: GalleryCollectionWithImages[];
  isLoading?: boolean;
  showCategories?: boolean;
  showViewAll?: boolean;
  title?: string;
}

interface CollectionCardProps {
  col: GalleryCollectionWithImages;
  index: number;
  onOpenLightbox: (col: GalleryCollectionWithImages, startIndex: number) => void;
}

/**
 * Individual Collection Card with smooth auto-scrolling across all card images
 */
const CollectionCard: React.FC<CollectionCardProps> = ({ col, index, onOpenLightbox }) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Collect cover image and all sub-images for this card
  const allImages = useMemo(() => {
    const list: { url: string; title: string; altText: string }[] = [
      {
        url: col.cover_image_path,
        title: `${col.title} (Cover)`,
        altText: col.title,
      },
    ];
    if (col.images && col.images.length > 0) {
      for (const img of col.images) {
        list.push({
          url: img.image_path,
          title: img.title || col.title,
          altText: img.alt_text || img.title || col.title,
        });
      }
    }
    return list;
  }, [col]);

  const hasMultipleImages = allImages.length > 1;

  // Auto-scroll through images if multiple photos are added to this card
  useEffect(() => {
    if (!hasMultipleImages || isHovered) return;

    // Slight stagger per card index so adjacent cards cycle harmoniously
    const intervalTime = 3200 + (index % 3) * 400;
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % allImages.length);
    }, intervalTime);

    return () => clearInterval(timer);
  }, [hasMultipleImages, isHovered, allImages.length, index]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIdx((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIdx((prev) => (prev + 1) % allImages.length);
  };

  return (
    <div
      className="bg-white rounded-2xl border border-slate-200/80 shadow-soft hover:shadow-card transition-all duration-300 overflow-hidden group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Auto-scrolling Card Image Area */}
      <div
        className="relative h-72 sm:h-80 w-full overflow-hidden bg-slate-900 cursor-pointer select-none"
        onClick={() => onOpenLightbox(col, activeIdx)}
      >
        {/* Render all images layered with smooth cross-fade animation */}
        {allImages.map((img, idx) => (
          <img
            key={idx}
            src={resolveImageUrl(img.url)}
            alt={img.altText}
            loading="lazy"
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out ${idx === activeIdx
                ? 'opacity-100 scale-100 z-10'
                : 'opacity-0 scale-105 pointer-events-none z-0'
              }`}
          />
        ))}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-950/20 to-transparent z-10 opacity-80 group-hover:opacity-95 transition-opacity" />

        {/* Category Pill */}
        {col.category && (
          <span
            style={{ fontFamily: "'Inter', sans-serif" }}
            className="font-inter absolute top-4 left-4 px-2.5 py-1 rounded-md bg-white/95 text-navy-800 text-xs font-semibold backdrop-blur-xs shadow-xs z-20"
          >
            {col.category.name}
          </span>
        )}

        {/* Photo Count & Slide Badge */}
        <span
          style={{ fontFamily: "'Inter', sans-serif" }}
          className="font-inter absolute top-4 right-4 px-2.5 py-1 rounded-md bg-navy-950/75 text-white text-xs font-medium backdrop-blur-xs flex items-center gap-1.5 z-20 shadow-xs"
        >
          <Images className="w-3.5 h-3.5 text-sky-400" />
          <span>
            {hasMultipleImages ? `${activeIdx + 1} / ${allImages.length} photos` : '1 photo'}
          </span>
        </span>

        {/* Manual Left / Right Chevron Arrows on Hover */}
        {hasMultipleImages && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-navy-950/65 hover:bg-navy-950 text-white backdrop-blur-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md hover:scale-105"
              aria-label="Previous photo in card"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-navy-950/65 hover:bg-navy-950 text-white backdrop-blur-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md hover:scale-105"
              aria-label="Next photo in card"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Bottom Title on Image */}
        <div className="absolute bottom-4 left-4 right-4 z-20 text-white flex items-end justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3
              style={{ fontFamily: "'Inter', sans-serif" }}
              className="font-inter font-bold text-lg leading-snug drop-shadow-xs truncate"
            >
              {col.title}
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export const GallerySection: React.FC<GallerySectionProps> = ({
  categories,
  collections,
  isLoading,
  showCategories = true,
  showViewAll = false,
  title = 'Ministry Pictures',
}) => {
  const [selectedCategorySlug, setSelectedCategorySlug] = useState('all');

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<LightboxImage[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Filter collections based on active category (if showCategories is false, all provided collections are displayed)
  const filteredCollections = useMemo(() => {
    if (!showCategories || selectedCategorySlug === 'all') return collections;
    return collections.filter((c) => c.category?.slug === selectedCategorySlug);
  }, [collections, selectedCategorySlug, showCategories]);

  // Open lightbox with collection images starting from any selected index
  const openCollectionLightbox = (collection: GalleryCollectionWithImages, startIndex: number = 0) => {
    const list: LightboxImage[] = [];

    // First add cover
    list.push({
      url: collection.cover_image_path,
      title: `${collection.title} (Cover)`,
      altText: collection.title,
    });

    // Then add all sub images
    if (collection.images && collection.images.length > 0) {
      for (const img of collection.images) {
        list.push({
          url: img.image_path,
          title: img.title || collection.title,
          altText: img.alt_text || img.title || collection.title,
        });
      }
    }

    setLightboxImages(list);
    setLightboxIndex(startIndex);
    setLightboxOpen(true);
  };

  return (
    <section
      id="gallery"
      style={{ padding: '60px 0px' }}
      className="py-[60px] px-0 bg-slate-50/70 border-b border-slate-100"
    >
      <div
        style={{ margin: '0px' }}
        className="w-full px-4 sm:px-6 lg:px-8 !m-0"
      >
        {/* Section Header */}
        {title ? (
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h2
              style={{ fontFamily: "'Inter', sans-serif" }}
              className="font-inter text-3xl sm:text-4xl lg:text-5xl font-bold text-navy-900 tracking-tight"
            >
              {title}
            </h2>
          </div>
        ) : null}

        {/* Category Filter Pills (rendered only when showCategories is true) */}
        {showCategories && (
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-12">
            <button
              onClick={() => setSelectedCategorySlug('all')}
              style={{ fontFamily: "'Inter', sans-serif" }}
              className={`font-inter px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${selectedCategorySlug === 'all'
                  ? 'bg-sky-400 text-white shadow-sm font-semibold'
                  : 'bg-white text-navy-700 hover:bg-slate-100 border border-slate-200'
                }`}
            >
              All Photos
            </button>
            {categories
              .filter((cat) => cat.slug !== 'all')
              .map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategorySlug(cat.slug)}
                  style={{ fontFamily: "'Inter', sans-serif" }}
                  className={`font-inter px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${selectedCategorySlug === cat.slug
                      ? 'bg-sky-400 text-white shadow-sm font-semibold'
                      : 'bg-white text-navy-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                >
                  {cat.name}
                </button>
              ))}
          </div>
        )}

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <Skeleton className="h-80 w-full rounded-2xl" />
            <Skeleton className="h-80 w-full rounded-2xl" />
            <Skeleton className="h-80 w-full rounded-2xl" />
          </div>
        )}

        {/* Collections Grid with Auto-Scrolling Cards */}
        {!isLoading && filteredCollections.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCollections.map((col, index) => (
              <CollectionCard
                key={col.id}
                col={col}
                index={index}
                onOpenLightbox={openCollectionLightbox}
              />
            ))}
          </div>
        )}

        {/* View All Photos Button */}
        {showViewAll && filteredCollections.length > 0 && (
          <div className="mt-12 text-center">
            <Link
              to="/gallery"
              style={{
                fontFamily: "'Inter', sans-serif",
                backgroundColor: '#FFBA33',
                color: '#0F172A',
              }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm shadow-md hover:brightness-105 transition-all"
            >
              <span>View All Photos</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && filteredCollections.length === 0 && (
          <div className="text-center py-16 text-navy-400 bg-white rounded-2xl border border-dashed border-slate-200">
            <Camera className="w-12 h-12 mx-auto mb-3 opacity-40 text-navy-500" />
            <p
              style={{ fontFamily: "'Inter', sans-serif" }}
              className="font-inter text-base font-medium text-navy-700"
            >
              {showCategories ? 'No photos in this category yet.' : 'No featured photos marked yet. Star photos in Admin Gallery to feature them here.'}
            </p>
          </div>
        )}
      </div>

      {/* Lightbox for large photo exploration */}
      <Lightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        images={lightboxImages}
        currentIndex={lightboxIndex}
        onNavigate={(newIdx) => setLightboxIndex(newIdx)}
      />
    </section>
  );
};
