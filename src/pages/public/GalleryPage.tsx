import React, { useEffect, useState } from 'react';
import Seo from '../../components/Seo';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { GallerySection } from '../../components/home/GallerySection';
import { siteSettingsService } from '../../services/siteSettingsService';
import { galleryService } from '../../services/galleryService';
import type {
  SiteSettings,
  GalleryCategory,
  GalleryCollectionWithImages,
} from '../../types/database.types';

export const GalleryPage: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [categories, setCategories] = useState<GalleryCategory[]>([]);
  const [collections, setCollections] = useState<GalleryCollectionWithImages[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    const fetchGalleryData = async () => {
      try {
        const [settingsData, categoriesData, collectionsData] = await Promise.all([
          siteSettingsService.getSiteSettings(),
          galleryService.getCategories(),
          galleryService.getPublishedCollections(),
        ]);
        setSettings(settingsData);
        setCategories(categoriesData);
        setCollections(collectionsData);
      } catch (err) {
        console.error('Failed to load gallery page content:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGalleryData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Seo path="/gallery" />
      <Navbar settings={settings} />
      <main className="flex-grow pt-[100px]">
        {/* Small Hero Section */}
        <section className="relative min-h-[280px] sm:min-h-[340px] flex items-center justify-center overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <img
              src="/images/gallery-hero.png"
              alt="Church Photo Gallery & Celebrations"
              className="w-full h-full object-cover object-center"
              style={{
                filter: 'contrast(1.05) brightness(0.88)',
              }}
            />
            {/* Dark atmospheric gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/65 to-navy-950/40" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white py-12 sm:py-16 space-y-3 sm:space-y-4 animate-in fade-in zoom-in-95 duration-500">
            <h1
              style={{ fontFamily: "'Inter', sans-serif" }}
              className="font-inter text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white drop-shadow-md leading-tight"
            >
              Church Photo Gallery
            </h1>

            <p
              style={{ fontFamily: "'Inter', sans-serif", color: '#FFFFFF' }}
              className="font-inter text-sm sm:text-base text-white/90 max-w-2xl mx-auto font-light leading-relaxed drop-shadow-xs"
            >
              Moments of worship, heartfelt praise, fellowship, and ministry life captured in pictures.
            </p>
          </div>
        </section>

        <GallerySection
          title=""
          categories={categories}
          collections={collections}
          isLoading={isLoading}
        />
      </main>
      <Footer settings={settings} />
    </div>
  );
};
