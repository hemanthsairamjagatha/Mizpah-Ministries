import React, { useEffect, useState } from 'react';
import Seo from '../../components/Seo';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { ContactSection } from '../../components/home/ContactSection';
import { siteSettingsService } from '../../services/siteSettingsService';
import type { SiteSettings } from '../../types/database.types';

export const ContactPage: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    const fetchSettings = async () => {
      try {
        const settingsData = await siteSettingsService.getSiteSettings();
        setSettings(settingsData);
      } catch (err) {
        console.error('Failed to load contact page settings:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F3F2]">
      <Seo path="/contact" />
      <Navbar settings={settings} />
      <main className="flex-grow pt-[100px]">
        {/* Small Hero Section */}
        <section className="relative min-h-[280px] sm:min-h-[340px] md:min-h-[380px] flex items-center justify-center overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <img
              src="/images/contact-hero.jpg"
              alt="Contact Mizpah Ministries"
              className="w-full h-full object-cover object-center"
              style={{
                filter: 'contrast(1.05) brightness(0.9)',
              }}
            />
            {/* Subtle dark overlay for text contrast */}
            <div className="absolute inset-0 bg-black/40" />
          </div>

          {/* Hero Content - Only CONTACT */}
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white py-14 sm:py-20 animate-in fade-in zoom-in-95 duration-500">
            <h1
              style={{ fontFamily: "'Inter', sans-serif" }}
              className="font-inter text-4xl sm:text-6xl md:text-7xl font-bold tracking-[0.2em] uppercase text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.7)]"
            >
              CONTACT
            </h1>
          </div>
        </section>

        <ContactSection settings={settings} />
      </main>
      <Footer settings={settings} />
    </div>
  );
};
