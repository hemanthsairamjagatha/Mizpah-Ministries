import React, { useEffect, useState } from 'react';
import Seo from '../../components/Seo';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { AboutGodSection } from '../../components/home/AboutGodSection';
import { AboutGodSermonsCTA } from '../../components/about-god/AboutGodSermonsCTA';
import { siteSettingsService } from '../../services/siteSettingsService';
import type { SiteSettings } from '../../types/database.types';

export const AboutGodPage: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    const fetchAboutGodData = async () => {
      try {
        const settingsData = await siteSettingsService.getSiteSettings();
        setSettings(settingsData);
      } catch (err) {
        console.error('Failed to load About God page content:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAboutGodData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Seo path="/the-gospel" />
      <Navbar settings={settings} />
      <main className="flex-grow pt-[100px]">
        {/* Small Hero Section Representing The Gospel */}
        <section className="relative min-h-[380px] sm:min-h-[440px] flex items-center justify-center overflow-hidden">
          {/* Background Image with Celestial Light & Reverence */}
          <div className="absolute inset-0 z-0">
            <img
              src="/images/about-god-hero.jpg"
              alt="The Gospel of Jesus Christ"
              className="w-full h-full object-cover object-center"
              style={{
                filter: 'contrast(1.05) brightness(0.92)',
              }}
            />
            {/* Dark celestial gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/70 to-navy-950/45" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white py-16 space-y-4 sm:space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <h1
              style={{ fontFamily: "'Inter', sans-serif" }}
              className="font-inter text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white drop-shadow-md leading-tight"
            >
              The Gospel
            </h1>

            <p
              style={{ fontFamily: "'Inter', sans-serif", color: '#FFFFFF' }}
              className="font-inter text-base sm:text-xl text-white max-w-2xl mx-auto font-light leading-relaxed drop-shadow-xs italic"
            >
              “For I am not ashamed of the gospel of Christ: for it is the power of God unto salvation to every one that believeth.” — Romans 1:16
            </p>
          </div>
        </section>

        {/* The Gospel Section */}
        <AboutGodSection isLoading={isLoading} />

        {/* Sermons CTA Banner */}
        <AboutGodSermonsCTA />
      </main>
      <Footer settings={settings} />
    </div>
  );
};
