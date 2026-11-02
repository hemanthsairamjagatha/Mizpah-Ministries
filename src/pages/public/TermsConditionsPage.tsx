import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Seo from '../../components/Seo';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { siteSettingsService } from '../../services/siteSettingsService';
import type { SiteSettings } from '../../types/database.types';
import { FileCheck, Mail, MapPin, ChevronRight, AlertCircle, HeartHandshake } from 'lucide-react';

export const TermsConditionsPage: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    const fetchSettings = async () => {
      try {
        const data = await siteSettingsService.getSiteSettings();
        setSettings(data);
      } catch (err) {
        console.error('Failed to load settings:', err);
      }
    };
    fetchSettings();
  }, []);

  const churchName = settings?.church_name || 'Mizpah Ministries';
  const email = settings?.contact_email || 'mizpahministriesindia@gmail.com';
  const address = settings?.address || `MIZPAH MINISTRIES, NO:1 KR COLONY, PODILI ROAD, KANIGIRI, MARKAPURAM (D), ANDHRA PRADESH, INDIA. PIN-523230`;

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F3F2]">
      <Seo path="/terms" />
      <Navbar settings={settings} />

      <main className="flex-grow pt-[100px]">
        {/* Hero Section */}
        <section className="relative min-h-[220px] sm:min-h-[260px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src="/images/contact-hero.jpg"
              alt={`${churchName} Terms and Conditions`}
              className="w-full h-full object-cover object-center"
              style={{ filter: 'contrast(1.05) brightness(0.75)' }}
            />
            <div className="absolute inset-0 bg-navy-950/60" />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white py-12 animate-in fade-in zoom-in-95 duration-500">
            <h1
              style={{ fontFamily: "'Inter', sans-serif" }}
              className="font-inter text-3xl sm:text-5xl md:text-6xl font-bold tracking-[0.15em] uppercase text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.7)]"
            >
              TERMS
            </h1>
            <p className="mt-3 text-xs sm:text-sm text-slate-200 font-medium tracking-wide">
              Effective Date & Last Updated: October 2026
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6">
            <Link to="/" className="hover:text-sky-600 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-800 font-medium">Terms</span>
          </nav>

          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-10 shadow-xs border border-slate-200/80 space-y-8 text-slate-700 leading-relaxed text-sm sm:text-base">
            
            {/* Intro Header */}
            <div className="border-b border-slate-100 pb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                  <FileCheck className="w-5 h-5" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Terms of Website Use & Ministry Engagement
                </h2>
              </div>
              <p className="text-slate-600">
                Welcome to the official website of <strong>{churchName}</strong>. By accessing, browsing, or utilizing this website and its affiliated digital resources, you agree to be bound by the terms and conditions outlined below. If you do not agree with any part of these terms, please discontinue using this website.
              </p>
            </div>

            {/* 1. Purpose of the Website */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="text-[#1980CC]">1.</span> Ministry Purpose & Faith-Based Resources
              </h3>
              <p>
                This website is established and maintained by {churchName} for spiritual enrichment, gospel outreach, Christian fellowship, and communication with church members, visitors, and believers worldwide. All sermons, biblical reflections, pastoral guidance, event schedules, and ministry resources are provided in good faith to encourage spiritual growth in Jesus Christ.
              </p>
            </div>

            {/* 2. Voluntary Tithes, Offerings & Donations */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="text-[#1980CC]">2.</span> Voluntary Giving, Tithes & Contributions
              </h3>
              <p>
                All financial contributions, tithes, freewill offerings, mission gifts, and donations made to {churchName} are entirely voluntary acts of Christian worship and charity:
              </p>
              <ul className="list-disc pl-6 space-y-1.5 text-slate-600">
                <li><strong>Purpose of Funds:</strong> Contributions directly support our worship services, community benevolence care, gospel preaching, youth and children's ministries, and church campus maintenance.</li>
                <li><strong>Nature of Donations:</strong> Because contributions are voluntary charitable gifts, they are generally non-refundable once processed. If an unintentional duplicate transfer or clerical error occurs, please notify our church office within 7 days with your bank transaction reference (UTR) for assistance.</li>
                <li><strong>Official Receipts:</strong> Donors desiring an official receipt may email their transfer confirmation or screenshot to our official church email.</li>
              </ul>
            </div>

            {/* 3. Intellectual Property Rights */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="text-[#1980CC]">3.</span> Intellectual Property & Media Usage
              </h3>
              <p>
                All content published on this website—including church logos, branding, sermon videos, audio recordings, text articles, photography, graphics, and layout designs—is the proprietary property of {churchName} or used with proper permission:
              </p>
              <ul className="list-disc pl-6 space-y-1.5 text-slate-600">
                <li>You may view, download, and share sermon links, biblical quotes, and event details for personal, non-commercial, and devotional purposes.</li>
                <li>Modifying, selling, broadcasting, or reproducing any media or content for commercial gain without explicit written consent from {churchName} is strictly prohibited.</li>
              </ul>
            </div>

            {/* 4. Acceptable User Conduct */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="text-[#1980CC]">4.</span> Code of Conduct for Inquiries & Prayer Requests
              </h3>
              <p>When interacting with our contact forms, prayer request submissions, or digital channels, you agree to:</p>
              <ul className="list-disc pl-6 space-y-1.5 text-slate-600">
                <li>Provide accurate, truthful contact information so our pastoral team can follow up appropriately.</li>
                <li>Refrain from submitting profane, defamatory, harassing, sexually explicit, abusive, or unlawful material.</li>
                <li>Not attempt to disrupt, compromise, or introduce malicious software into the website's infrastructure.</li>
              </ul>
            </div>

            {/* 5. External Services & Embedded Content */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="text-[#1980CC]">5.</span> External Links & Third-Party Platforms
              </h3>
              <p>
                For your convenience, our website may include embedded videos (such as YouTube sermon live-streams) and links to external mapping services (such as Google Maps). {churchName} does not control and is not liable for the availability, policies, or practices of third-party platforms.
              </p>
            </div>

            {/* 6. Disclaimers & Limitation of Liability */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-2">
              <div className="flex items-center gap-2 text-slate-800 font-bold">
                <AlertCircle className="w-4 h-4 text-sky-600" />
                <h4>Disclaimers & Limitation of Liability</h4>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                While {churchName} makes every reasonable effort to keep service times, pastoral information, and event schedules accurate and up to date, this website and its materials are provided on an "as is" and "as available" basis without warranties of any kind. {churchName} shall not be held liable for any indirect, incidental, or consequential damages resulting from website downtime or technical interruptions.
              </p>
            </div>

            {/* 7. Governing Law */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="text-[#1980CC]">6.</span> Governing Law & Jurisdiction
              </h3>
              <p className="text-slate-600">
                These terms and conditions are governed by and construed in accordance with the laws of India. Any disputes arising from or relating to the use of this website or church donations shall be subject to the exclusive jurisdiction of the competent courts in Andhra Pradesh, India.
              </p>
            </div>

            {/* 8. Modifications to Terms */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="text-[#1980CC]">7.</span> Updates & Modifications
              </h3>
              <p className="text-slate-600">
                {churchName} reserves the right to revise or update these Terms & Conditions at any time. Any changes will be posted directly to this page with an updated effective date. Continued use of our website following any update signifies your acceptance of the revised terms.
              </p>
            </div>

            {/* 9. Contact */}
            <div className="border-t border-slate-100 pt-6 space-y-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="text-[#1980CC]">8.</span> Church Office Inquiries
              </h3>
              <p className="text-slate-600">
                For questions regarding these terms, our ministries, or worship schedules, please feel free to reach out to our pastoral office:
              </p>
              <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-xs sm:text-sm">
                <p className="font-semibold text-slate-900">{churchName}</p>
                <p className="flex items-start gap-2 text-slate-600">
                  <MapPin className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                  <span className="whitespace-pre-line">{address}</span>
                </p>
                <p className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-4 h-4 text-sky-500 shrink-0" />
                  <a href={`mailto:${email}`} className="text-[#1980CC] hover:underline font-medium">
                    {email}
                  </a>
                </p>
              </div>
            </div>

          </div>
        </section>
      </main>

      <Footer settings={settings} />
    </div>
  );
};
