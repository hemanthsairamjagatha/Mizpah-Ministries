import React, { useEffect, useState } from 'react';
import Seo from '../../components/Seo';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { SermonsSection } from '../../components/home/SermonsSection';
import { SermonsContactCTA } from '../../components/sermons/SermonsContactCTA';
import { siteSettingsService } from '../../services/siteSettingsService';
import { sermonService } from '../../services/sermonService';
import type { SiteSettings, Sermon } from '../../types/database.types';

export const SermonsPage: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    const fetchSermonsData = async () => {
      try {
        const [settingsData, sermonsData] = await Promise.all([
          siteSettingsService.getSiteSettings(),
          sermonService.getPublishedSermons(),
        ]);
        setSettings(settingsData);
        setSermons(sermonsData);
      } catch (err) {
        console.error('Failed to load sermons page content:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSermonsData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Seo path="/sermons" />
      <Navbar settings={settings} />
      <main className="flex-grow pt-[100px]">
        {/* Small Hero Section */}
        <section className="relative min-h-[280px] sm:min-h-[340px] md:min-h-[380px] flex items-center justify-center overflow-hidden">
          {/* Background Image with Sanctuary & Sunlight */}
          <div className="absolute inset-0 z-0">
            <img
              src="/images/sermons-hero.jpg"
              alt="Messages & Sermons"
              className="w-full h-full object-cover object-center"
              style={{
                filter: 'contrast(1.05) brightness(0.9)',
              }}
            />
            {/* Atmospheric gradient overlay preserving warm sanctuary sunbeams */}
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-950/60 to-navy-950/35" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white py-14 sm:py-20 space-y-3 sm:space-y-4 animate-in fade-in zoom-in-95 duration-500">
            <h1
              style={{ fontFamily: "'Inter', sans-serif" }}
              className="font-inter text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white drop-shadow-md leading-tight"
            >
              Messages & Sermons
            </h1>

            <p
              style={{ fontFamily: "'Inter', sans-serif", color: '#FFFFFF' }}
              className="font-inter text-sm sm:text-base text-white/90 max-w-2xl mx-auto font-light leading-relaxed drop-shadow-xs"
            >
              Inspiring biblical teachings, Sunday worship messages, and spiritual nourishment to guide and strengthen your walk with God.
            </p>
          </div>
        </section>

        <SermonsSection sermons={sermons} isLoading={isLoading} />

        {/* Contact Invitation CTA Banner */}
        <SermonsContactCTA />
      </main>
      <Footer settings={settings} />
    </div>
  );
};
