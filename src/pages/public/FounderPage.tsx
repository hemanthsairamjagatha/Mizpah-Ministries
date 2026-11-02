import React, { useEffect, useState } from 'react';
import Seo from '../../components/Seo';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { FounderSection } from '../../components/home/FounderSection';
import { FounderMinistriesSection } from '../../components/founder/FounderMinistriesSection';
import { FounderDonationCTA } from '../../components/founder/FounderDonationCTA';
import { siteSettingsService } from '../../services/siteSettingsService';
import { founderService } from '../../services/founderService';
import type { SiteSettings, Founder } from '../../types/database.types';

export const FounderPage: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [founder, setFounder] = useState<Founder | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    const fetchFounderData = async () => {
      try {
        const [settingsData, founderData] = await Promise.all([
          siteSettingsService.getSiteSettings(),
          founderService.getPrimaryFounder(),
        ]);
        setSettings(settingsData);
        setFounder(founderData);
      } catch (err) {
        console.error('Failed to load founder page content:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFounderData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Seo path="/founder" />
      <Navbar settings={settings} />
      <main className="flex-grow pt-[100px]">
        {/* Small Hero Section */}
        <section className="relative min-h-[280px] sm:min-h-[340px] md:min-h-[380px] flex items-center justify-center overflow-hidden">
          {/* Background Image with Sanctuary & Warm Light */}
          <div className="absolute inset-0 z-0">
            <img
              src="/images/founder-hero.jpg"
              alt="Pastoral Leadership & Founder"
              className="w-full h-full object-cover object-center"
              style={{
                filter: 'contrast(1.05) brightness(0.9)',
              }}
            />
            {/* Atmospheric gradient overlay preserving warm sanctuary ambiance */}
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-950/60 to-navy-950/35" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white py-14 sm:py-20 space-y-3 sm:space-y-4 animate-in fade-in zoom-in-95 duration-500">
            <h1
              style={{ fontFamily: "'Inter', sans-serif" }}
              className="font-inter text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white drop-shadow-md leading-tight"
            >
              Pastoral Leadership
            </h1>

            <p
              style={{ fontFamily: "'Inter', sans-serif", color: '#FFFFFF' }}
              className="font-inter text-sm sm:text-base text-white/90 max-w-2xl mx-auto font-light leading-relaxed drop-shadow-xs"
            >
              Serving God and His people with faithful shepherding, visionary leadership, and a heart for ministry.
            </p>
          </div>
        </section>

        <FounderSection
          founder={founder}
          isLoading={isLoading}
          qualification={(founder as any)?.qualification || 'B.A, B.sc, LLB, LLM, B.Th'}
          showActions={false}
        />

        {/* Ministries & Initiatives Section under Founder */}
        <FounderMinistriesSection />

        {/* Donation Invitation CTA Banner */}
        <FounderDonationCTA />
      </main>
      <Footer settings={settings} />
    </div>
  );
};
