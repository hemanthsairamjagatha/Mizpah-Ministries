import React, { useEffect, useState } from 'react';
import Seo from '../../components/Seo';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { FounderMinistriesSection } from '../../components/founder/FounderMinistriesSection';
import { FounderDonationCTA } from '../../components/founder/FounderDonationCTA';
import { siteSettingsService } from '../../services/siteSettingsService';
import type { SiteSettings } from '../../types/database.types';

export const MyVisionPage: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [, setIsLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    const fetchSettings = async () => {
      try {
        const settingsData = await siteSettingsService.getSiteSettings();
        setSettings(settingsData);
      } catch (err) {
        console.error('Failed to load site settings for vision page:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Seo path="/my-vision" />
      <Navbar settings={settings} />
      <main className="flex-grow pt-[100px]">
        {/* Small Hero Section */}
        <section className="relative min-h-[280px] sm:min-h-[340px] md:min-h-[380px] flex items-center justify-center overflow-hidden">
          {/* Background Image with Sanctuary & Warm Celestial Light */}
          <div className="absolute inset-0 z-0">
            <img
              src="/images/hero-church.jpg"
              alt="My Vision - Mizpah Ministries"
              className="w-full h-full object-cover object-center"
              style={{
                filter: 'contrast(1.05) brightness(0.85)',
              }}
            />
            {/* Atmospheric gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/65 to-navy-950/40" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white py-14 sm:py-20 space-y-3 sm:space-y-4 animate-in fade-in zoom-in-95 duration-500">
            <h1
              style={{ fontFamily: "'Inter', sans-serif" }}
              className="font-inter text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white drop-shadow-md leading-tight"
            >
              My Vision
            </h1>

            <p
              style={{ fontFamily: "'Inter', sans-serif", color: '#FFFFFF' }}
              className="font-inter text-sm sm:text-base md:text-lg text-white/95 max-w-2xl mx-auto font-light leading-relaxed drop-shadow-xs"
            >
              Advancing the Kingdom of God through passionate personal evangelism, establishing vibrant churches, equipping Christian leaders, and bringing compassionate aid to communities in need.
            </p>
          </div>
        </section>

        {/* Ministries Section */}
        <FounderMinistriesSection />

        {/* Donation / Partnership Invitation CTA Banner */}
        <FounderDonationCTA />
      </main>
      <Footer settings={settings} />
    </div>
  );
};

export const OurVisionPage = MyVisionPage;
