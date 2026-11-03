import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { HeroSection as HeroSectionType } from '../../types/database.types';
import { resolveImageUrl } from '../../lib/utils';

export interface HeroSectionProps {
  slides: HeroSectionType[];
  isLoading?: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ slides, isLoading }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Auto rotate if multiple slides
  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [slides.length]);

  if (isLoading) {
    return (
      <section id="home" className="relative min-h-[680px] lg:min-h-[750px] bg-slate-100 flex items-center justify-center animate-pulse pt-20">
        <div className="max-w-3xl mx-auto text-center px-4 space-y-4">
          <div className="h-10 bg-slate-300 rounded-lg w-3/4 mx-auto" />
          <div className="h-5 bg-slate-200 rounded-lg w-1/2 mx-auto" />
          <div className="h-12 bg-slate-300 rounded-lg w-40 mx-auto mt-6" />
        </div>
      </section>
    );
  }

  // Fallback slide if database is empty
  const defaultSlide: HeroSectionType = {
    id: 'default',
    title: 'Walking Together in Grace & Truth',
    description: 'Experience heartfelt worship, authentic community, and the life-changing truth of God’s Word every Sunday.',
    image_path: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=1920&q=80',
    button_text: 'Watch Sermons',
    button_url: '/sermons',
    is_published: true,
    sort_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: null,
  };

  const activeSlides = slides.length > 0 ? slides : [defaultSlide];
  const currentSlide = activeSlides[currentSlideIndex] || activeSlides[0];

  const handlePrev = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  };

  const handleNext = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % activeSlides.length);
  };

  return (
    <section id="home" className="relative min-h-[660px] sm:min-h-[740px] lg:min-h-[820px] flex items-center justify-center pt-28 sm:pt-32 pb-16 overflow-hidden">
      {/* Background Image with Crisp Presentation & Clean Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          key={currentSlide.id}
          src={resolveImageUrl(currentSlide.image_path)}
          alt={currentSlide.title}
          className="w-full h-full object-cover object-center"
          style={{
            imageRendering: 'auto',
            filter: 'contrast(1.05) brightness(1.02)',
          }}
        />
        {/* Crisp, clean dark overlay for readability without blurring */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/35 to-black/40" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-[1276px] w-full mx-auto px-4 sm:px-6 lg:px-8 text-center text-white space-y-6 sm:space-y-8 -translate-y-8 sm:-translate-y-10 animate-in fade-in zoom-in-95 duration-500">
        <p
          style={{ color: '#FFFFFF', fontFamily: "'Inter', sans-serif" }}
          className="font-inter text-xs sm:text-sm font-semibold tracking-[0.25em] uppercase text-white drop-shadow-sm"
        >
          Welcome
        </p>

        <h1
          style={{
            margin: '10px auto 0px',
            fontFamily: "'Inter', sans-serif",
            width: '1212px',
            maxWidth: '100%',
          }}
          className="font-inter text-3xl sm:text-5xl md:text-[70px] lg:text-[70px] font-bold tracking-tight text-white drop-shadow-md leading-[1.15] !mt-[10px] w-full max-w-[1212px] mx-auto"
        >
          {currentSlide.title}
        </h1>

        <p
          style={{
            margin: '0px auto',
            fontFamily: "'Inter', sans-serif",
            color: '#FFFFFF',
            width: '1196px',
            maxWidth: '100%',
          }}
          className="hero-description-responsive w-full max-w-[1196px] mx-auto font-inter text-[15px] sm:text-[35px] text-white font-light leading-relaxed drop-shadow-xs !m-0"
        >
          {currentSlide.description}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center">
          <a
            href={currentSlide.button_url === '#sermons' ? '/sermons' : (currentSlide.button_url || '/sermons')}
            style={{
              color: '#1F2937',
              backgroundColor: '#FFBA33',
              fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
              fontSize: '14px',
            }}
            className="hero-btn-primary w-full sm:w-auto inline-flex items-center justify-center font-medium rounded-full shadow-sm hover:brightness-105 transition-all text-center sm:!mr-4"
          >
            {currentSlide.button_text || 'Watch Sermons'}
          </a>
          <a
            href="#contact"
            style={{
              color: '#1F2937',
              backgroundColor: '#FFFFFF',
              fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
              fontSize: '14px',
            }}
            className="hero-btn-secondary !mt-2 sm:!mt-0 w-full sm:w-auto inline-flex items-center justify-center font-medium rounded-full shadow-sm hover:bg-white/95 transition-all text-center"
          >
            Contact Us
          </a>
        </div>
      </div>

      {/* Carousel Navigation Arrows if multiple slides */}
      {activeSlides.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 sm:p-3 text-white/80 hover:text-white bg-white/10 hover:bg-white/25 backdrop-blur-md rounded-full transition-all"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 sm:p-3 text-white/80 hover:text-white bg-white/10 hover:bg-white/25 backdrop-blur-md rounded-full transition-all"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {activeSlides.map((slide, idx) => (
              <button
                key={slide.id}
                onClick={() => setCurrentSlideIndex(idx)}
                className={`h-2.5 rounded-full transition-all ${idx === currentSlideIndex
                    ? 'w-8 bg-sky-400'
                    : 'w-2.5 bg-white/40 hover:bg-white/70'
                  }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};
