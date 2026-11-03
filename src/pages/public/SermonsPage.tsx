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
        <section className="relative min-h-[300px] sm:min-h-[360px] md:min-h-[400px] flex items-center justify-center overflow-hidden">
          {/* Background Image with Sanctuary & Sunlight */}
          <div className="absolute inset-0 z-0">
            <img
              src="/images/sermons-hero.jpg"
              alt="Water Baptisms at Mizpah Ministries"
              className="w-full h-full object-cover object-center"
              style={{
                filter: 'contrast(1.05) brightness(0.9)',
              }}
            />
            {/* Atmospheric gradient overlay preserving warm sanctuary sunbeams */}
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/65 to-navy-950/40" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white py-14 sm:py-20 space-y-3 sm:space-y-4 animate-in fade-in zoom-in-95 duration-500">
            <span
              style={{ color: '#38BDF8', fontFamily: "'Inter', sans-serif" }}
              className="inline-block text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] drop-shadow-sm"
            >
              New Life in Christ
            </span>

            <h1
              style={{ fontFamily: "'Inter', sans-serif" }}
              className="font-inter text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white drop-shadow-md leading-tight"
            >
              Baptisms
            </h1>

            <p
              style={{ fontFamily: "'Inter', sans-serif", color: '#FFFFFF' }}
              className="font-inter text-sm sm:text-base text-white/95 max-w-2xl mx-auto font-normal leading-relaxed drop-shadow-xs"
            >
              Celebrating new life in Christ through water baptism—a public declaration of faith, repentance, and spiritual transformation. Witness believers making their sacred step of obedience in Jesus Christ.
            </p>

            <p
              style={{ fontFamily: "'Inter', sans-serif", color: '#BAE6FD' }}
              className="font-inter text-xs sm:text-sm text-sky-200 max-w-xl mx-auto italic font-light drop-shadow-xs pt-1"
            >
              “Therefore, if anyone is in Christ, the new creation has come: The old has gone, the new is here!” — 2 Corinthians 5:17
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
