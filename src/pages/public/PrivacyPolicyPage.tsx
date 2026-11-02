import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Seo from '../../components/Seo';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { siteSettingsService } from '../../services/siteSettingsService';
import type { SiteSettings } from '../../types/database.types';
import { Shield, Lock, Mail, MapPin, ChevronRight, FileText } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
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
      <Seo path="/privacy" />
      <Navbar settings={settings} />

      <main className="flex-grow pt-[100px]">
        {/* Hero Section */}
        <section className="relative min-h-[220px] sm:min-h-[260px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src="/images/contact-hero.jpg"
              alt={`${churchName} Privacy Policy`}
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
              PRIVACY
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
            <span className="text-slate-800 font-medium">Privacy</span>
          </nav>

          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-10 shadow-xs border border-slate-200/80 space-y-8 text-slate-700 leading-relaxed text-sm sm:text-base">
            
            {/* Intro Header */}
            <div className="border-b border-slate-100 pb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Our Commitment to Your Privacy
                </h2>
              </div>
              <p className="text-slate-600">
                At <strong>{churchName}</strong>, we honor and respect your privacy. As a Christian church and faith-based ministry, we hold the trust of our congregation, visitors, and online community in the highest regard. This Privacy Policy explains how we collect, handle, protect, and use the information you share with us through our website and ministry services.
              </p>
            </div>

            {/* 1. Information We Collect */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="text-[#1980CC]">1.</span> Information We Collect
              </h3>
              <p>We only collect personal information that you voluntarily choose to provide to us. This may include:</p>
              <ul className="list-disc pl-6 space-y-1.5 text-slate-600">
                <li><strong>Contact Inquiries:</strong> Your name, email address, telephone number, and message content when submitting contact or general inquiry forms.</li>
                <li><strong>Prayer Requests & Pastoral Care:</strong> Spiritual prayer needs, thanksgiving testimonies, and messages shared directly with our pastoral team.</li>
                <li><strong>Donations & Tithes Information:</strong> Transfer reference numbers (UTR/Transaction IDs), donor name, and contact details shared when requesting donation confirmation or tax receipts. We do not process or store sensitive payment credentials such as debit/credit card numbers or UPI PINs on our servers.</li>
                <li><strong>Automated Device Data:</strong> Non-personally identifiable technical information such as browser type, operating system, and anonymous site traffic metrics to help us optimize website accessibility.</li>
              </ul>
            </div>

            {/* 2. How We Use Your Information */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="text-[#1980CC]">2.</span> How We Use Your Information
              </h3>
              <p>The information we collect is used strictly for pastoral and church administration purposes, including:</p>
              <ul className="list-disc pl-6 space-y-1.5 text-slate-600">
                <li>Responding to your inquiries, pastoral questions, and prayer requests.</li>
                <li>Providing information regarding church worship gatherings, sermons, conferences, and community outreach events.</li>
                <li>Verifying and acknowledging voluntary donations, tithes, and building fund contributions.</li>
                <li>Maintaining the security and operational integrity of our website.</li>
              </ul>
            </div>

            {/* 3. Strict Confidentiality of Prayer Requests */}
            <div className="bg-sky-50/60 border border-sky-100 rounded-2xl p-5 space-y-2">
              <div className="flex items-center gap-2 text-sky-800 font-bold">
                <Lock className="w-4 h-4 text-sky-600" />
                <h4>Confidentiality of Pastoral & Prayer Requests</h4>
              </div>
              <p className="text-xs sm:text-sm text-sky-950 leading-relaxed">
                All personal prayer requests and pastoral messages submitted through our website are treated with strict biblical confidentiality. They are accessible solely to our ordained pastors, pastoral elders, and designated prayer team members for intercessory prayer.
              </p>
            </div>

            {/* 4. Information Sharing & Third Parties */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="text-[#1980CC]">3.</span> Sharing & Disclosure of Information
              </h3>
              <p>
                <strong>We do not sell, rent, lease, trade, or monetize your personal information to third parties or marketing companies under any circumstances.</strong>
              </p>
              <p className="text-slate-600">
                We may only disclose personal information if required by applicable law, statutory authorities, or in good faith to protect the safety of our church community and public well-being.
              </p>
            </div>

            {/* 5. Online Giving & Payment Safety */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="text-[#1980CC]">4.</span> Online Giving & Financial Security
              </h3>
              <p>
                All online contributions and donations to {churchName} are initiated directly through your own banking or authorized UPI applications (e.g. Google Pay, PhonePe, Paytm, or direct IMPS/NEFT transfers) to our verified church trust accounts. Our website does not capture or store your personal banking credentials or banking PINs.
              </p>
            </div>

            {/* 6. External Links & Media */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="text-[#1980CC]">5.</span> External Media & Third-Party Platforms
              </h3>
              <p>
                Our website embeds sermons and worship videos hosted on YouTube and provides directions using Google Maps. These external platforms maintain their own independent privacy policies and data practices, and we encourage you to review their respective terms.
              </p>
            </div>

            {/* 7. Data Retention & Your Rights */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="text-[#1980CC]">6.</span> Data Retention & Your Rights
              </h3>
              <p>
                You may at any time request to review, update, or delete any contact details or messages you have submitted to our church office by contacting us via email. We will process your request promptly.
              </p>
            </div>

            {/* 8. Contact Our Church Office */}
            <div className="border-t border-slate-100 pt-6 space-y-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="text-[#1980CC]">7.</span> Contacting Us About Privacy
              </h3>
              <p className="text-slate-600">
                If you have questions, concerns, or requests regarding this Privacy Policy or our ministry data handling, please reach out to our church office:
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
