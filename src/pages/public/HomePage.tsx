import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Seo from '../../components/Seo';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { HeroSection } from '../../components/home/HeroSection';
import { AboutGodSection } from '../../components/home/AboutGodSection';
import { FounderSection } from '../../components/home/FounderSection';
import { SermonsSection } from '../../components/home/SermonsSection';
import { GallerySection } from '../../components/home/GallerySection';
import { DonateSection } from '../../components/home/DonateSection';
import { ContactSection } from '../../components/home/ContactSection';

import { siteSettingsService } from '../../services/siteSettingsService';
import { heroService } from '../../services/heroService';
import { aboutGodService } from '../../services/aboutGodService';
import { founderService } from '../../services/founderService';
import { sermonService } from '../../services/sermonService';
import { galleryService } from '../../services/galleryService';

import type {
  SiteSettings,
  HeroSection as HeroSectionType,
  AboutGodCard,
  Founder,
  Sermon,
  GalleryCategory,
  GalleryCollectionWithImages,
} from '../../types/database.types';

export const HomePage: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [heroSlides, setHeroSlides] = useState<HeroSectionType[]>([]);
  const [aboutGodCards, setAboutGodCards] = useState<AboutGodCard[]>([]);
  const [founder, setFounder] = useState<Founder | null>(null);
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [galleryCategories, setGalleryCategories] = useState<GalleryCategory[]>([]);
  const [galleryCollections, setGalleryCollections] = useState<GalleryCollectionWithImages[]>([]);
  const [starredIds, setStarredIds] = useState<string[]>(() => galleryService.getStarredCollectionIds());

  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  // Listen for real-time star updates from admin gallery manager
  useEffect(() => {
    const handleStarredUpdate = () => {
      setStarredIds(galleryService.getStarredCollectionIds());
    };
    window.addEventListener('mizpah_starred_gallery_updated', handleStarredUpdate);
    window.addEventListener('storage', handleStarredUpdate);
    return () => {
      window.removeEventListener('mizpah_starred_gallery_updated', handleStarredUpdate);
      window.removeEventListener('storage', handleStarredUpdate);
    };
  }, []);

  useEffect(() => {
    if (!isLoading && location.hash) {
      const id = location.hash.replace('#', '');
      const timer = setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading, location.hash]);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [
          settingsData,
          heroData,
          aboutGodData,
          founderData,
          sermonsData,
          categoriesData,
          collectionsData,
        ] = await Promise.all([
          siteSettingsService.getSiteSettings(),
          heroService.getPublishedHeroSections(),
          aboutGodService.getPublishedAboutGodCards(),
          founderService.getPrimaryFounder(),
          sermonService.getPublishedSermons(),
          galleryService.getCategories(),
          galleryService.getPublishedCollections(),
        ]);

        setSettings(settingsData);
        setHeroSlides(heroData);
        setAboutGodCards(aboutGodData);
        setFounder(founderData);
        setSermons(sermonsData);
        setGalleryCategories(categoriesData);
        setGalleryCollections(collectionsData);
      } catch (err) {
        console.error('Failed to load home page content:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Seo path="/" />
      {/* A. Header / Navigation */}
      <Navbar settings={settings} />

      <main className="flex-grow">
        {/* B. Hero Section */}
        <HeroSection slides={heroSlides} isLoading={isLoading} />

        {/* C. About God Section */}
        <AboutGodSection
          cards={aboutGodCards}
          isLoading={isLoading}
          limit={3}
          showViewMore={true}
        />

        {/* D. Founder Section */}
        <FounderSection founder={founder} isLoading={isLoading} settings={settings} />

        {/* E. Sermons Section */}
        <SermonsSection
          sermons={sermons}
          isLoading={isLoading}
          limit={3}
          showViewMore={true}
          showSearch={false}
        />

        {/* F. Gallery Section (Only displays starred items; categories removed from home page) */}
        <GallerySection
          categories={galleryCategories}
          collections={galleryCollections.filter((c) =>
            galleryService.isCollectionStarred(c, starredIds)
          )}
          isLoading={isLoading}
          showCategories={false}
          showViewAll={true}
        />

        {/* G. Donating Section */}
        <DonateSection settings={settings} />

        {/* H. Contact Section */}
        <ContactSection settings={settings} />
      </main>

      {/* H. Footer */}
      <Footer settings={settings} />
    </div>
  );
};
