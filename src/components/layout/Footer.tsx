import React from 'react';
import { Link } from 'react-router-dom';
import { Church, Mail, Phone, MapPin, Facebook, Instagram, Youtube, Twitter } from 'lucide-react';
import type { SiteSettings } from '../../types/database.types';

export interface FooterProps {
  settings: SiteSettings | null;
}

const DEFAULT_SANCTUARY_ADDRESS = `MIZPAH MINISTRIES 
NO:1 KR COLONY,
PODILI ROAD, KANIGIRI,
MARKAPURAM (D)
ANDHRA PRADESH
INDIA. PIN-523230`;

export const Footer: React.FC<FooterProps> = ({ settings }) => {
  const currentYear = new Date().getFullYear();

  const churchName = settings?.church_name || 'Mizpah Ministries';
  const description = settings?.footer_description || settings?.short_description || 'A warm and welcoming Christ-centered church committed to loving God, building authentic community, and serving our neighbors.';
  const email = settings?.contact_email || '';
  const phone = settings?.contact_phone || '';
  const address = settings?.address || DEFAULT_SANCTUARY_ADDRESS;
  const rawSocials = settings?.social_links;
  const socials = typeof rawSocials === 'string'
    ? (() => { try { return JSON.parse(rawSocials); } catch { return {}; } })()
    : (rawSocials || {});
  const customMapUrl = (socials as any)?.map_url;
  const fallbackMapUrl = address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address.replace(/\n/g, ', '))}`
    : '#';
  const rawMapUrl = customMapUrl && customMapUrl.trim() ? customMapUrl.trim() : fallbackMapUrl;
  const mapUrl = rawMapUrl && rawMapUrl !== '#'
    ? (/^https?:\/\//i.test(rawMapUrl) ? rawMapUrl : `https://${rawMapUrl}`)
    : '#';

  const rawYoutubeUrl = (socials?.youtube as string | undefined)?.trim();
  const youtubeUrl = rawYoutubeUrl
    ? (/^https?:\/\//i.test(rawYoutubeUrl) ? rawYoutubeUrl : `https://${rawYoutubeUrl}`)
    : 'https://www.youtube.com/@mizpahministriesap1515';

  return (
    <footer className="bg-navy-950 text-slate-300 pt-16 pb-12 border-t border-navy-900">
      <div
        style={{ margin: '0px' }}
        className="w-full px-4 sm:px-6 lg:px-8 !m-0"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-10">
          {/* Col 1: Brand & Description */}
          <div className="md:col-span-6 lg:col-span-5 space-y-4 max-w-md">
            <div className="flex items-center">
              <img
                src={settings?.logo_path || '/images/logo.png'}
                alt={churchName}
                width={130}
                height={100}
                className="w-[130px] h-[100px] object-contain rounded-lg drop-shadow-xs"
              />
            </div>
            <p
              style={{ color: '#FFFFFF', fontFamily: "'Inter', sans-serif" }}
              className="text-sm text-white leading-relaxed"
            >
              {description}
            </p>
            {/* Other Social Links if configured */}
            {(socials.facebook || socials.instagram || socials.twitter) && (
              <div className="flex items-center gap-3 pt-2">
                {socials.facebook && (
                  <a
                    href={socials.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg bg-navy-900 flex items-center justify-center text-slate-400 hover:text-white hover:bg-sky-500 transition-colors"
                    aria-label="Facebook"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                )}
                {socials.instagram && (
                  <a
                    href={socials.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg bg-navy-900 flex items-center justify-center text-slate-400 hover:text-white hover:bg-sky-500 transition-colors"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                )}
                {socials.twitter && (
                  <a
                    href={socials.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg bg-navy-900 flex items-center justify-center text-slate-400 hover:text-white hover:bg-sky-500 transition-colors"
                    aria-label="Twitter / X"
                  >
                    <Twitter className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Col 2: Quick Links */}
          <div className="md:col-span-6 lg:col-start-7 lg:col-span-2 space-y-4 w-fit max-w-[240px]">
            <h4
              style={{ fontFamily: "'Inter', sans-serif" }}
              className="font-inter text-white font-semibold text-base tracking-wide"
            >
              Quick Navigation
            </h4>
            <ul className="space-y-[20px] text-sm w-fit">
              <li>
                <Link
                  to="/"
                  style={{ color: '#FFFFFF', fontFamily: "'Inter', sans-serif" }}
                  className="font-inter text-white hover:text-sky-400 transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/the-gospel"
                  style={{ color: '#FFFFFF', fontFamily: "'Inter', sans-serif" }}
                  className="font-inter text-white hover:text-sky-400 transition-colors"
                >
                  The Gospel
                </Link>
              </li>
              <li>
                <Link
                  to="/my-vision"
                  style={{ color: '#FFFFFF', fontFamily: "'Inter', sans-serif" }}
                  className="font-inter text-white hover:text-sky-400 transition-colors"
                >
                  My Vision
                </Link>
              </li>
              <li>
                <Link
                  to="/founder"
                  style={{ color: '#FFFFFF', fontFamily: "'Inter', sans-serif" }}
                  className="font-inter text-white hover:text-sky-400 transition-colors"
                >
                  Pastor
                </Link>
              </li>
              <li>
                <Link
                  to="/sermons"
                  style={{ color: '#FFFFFF', fontFamily: "'Inter', sans-serif" }}
                  className="font-inter text-white hover:text-sky-400 transition-colors"
                >
                  Baptisms
                </Link>
              </li>
              <li>
                <Link
                  to="/gallery"
                  style={{ color: '#FFFFFF', fontFamily: "'Inter', sans-serif" }}
                  className="font-inter text-white hover:text-sky-400 transition-colors"
                >
                  Photo Gallery
                </Link>
              </li>
              <li>
                <Link
                  to="/donate"
                  style={{ color: '#FFFFFF', fontFamily: "'Inter', sans-serif" }}
                  className="font-inter text-white hover:text-sky-400 transition-colors"
                >
                  Donate
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  style={{ color: '#FFFFFF', fontFamily: "'Inter', sans-serif" }}
                  className="font-inter text-white hover:text-sky-400 transition-colors"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact Information */}
          <div className="md:col-span-12 lg:col-start-9 lg:col-span-4 space-y-4">
            <h4
              style={{ fontFamily: "'Inter', sans-serif" }}
              className="font-inter text-white font-semibold text-base tracking-wide"
            >
              Our Location
            </h4>
            <ul className="space-y-3 text-sm text-white">
              {address && (
                <li className="flex items-start gap-3">
                  <a
                    href={mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 text-white hover:text-sky-300 transition-colors group cursor-pointer"

                  >
                    <MapPin className="w-5 h-5 text-sky-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <span
                      style={{ color: '#FFFFFF', fontFamily: "'Inter', sans-serif" }}
                      className="font-inter text-white whitespace-pre-line leading-relaxed group-hover:underline"
                    >
                      {address}
                    </span>
                  </a>
                </li>
              )}
              {phone && (
                <li className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-sky-400 shrink-0" />
                  <a
                    href={`tel:${phone}`}
                    style={{ color: '#FFFFFF', fontFamily: "'Inter', sans-serif" }}
                    className="font-inter text-white hover:text-sky-400 transition-colors"
                  >
                    {phone}
                  </a>
                </li>
              )}
              {email && (
                <li className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                  <a
                    href={`mailto:${email}`}
                    style={{ color: '#FFFFFF', fontFamily: "'Inter', sans-serif" }}
                    className="font-inter text-white hover:text-sky-400 transition-colors"
                  >
                    {email}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Privacy & Terms on left, YouTube symbol on right in the same line */}
        <div className="pt-4 pb-3 flex items-center justify-between text-xs text-white">
          <div className="flex items-center gap-5">
            <Link
              to="/privacy"
              style={{ color: '#FFFFFF', fontFamily: "'Inter', sans-serif" }}
              className="font-inter text-white hover:text-sky-300 hover:underline transition-colors"
            >
              Privacy
            </Link>
            <span className="text-slate-600 select-none">|</span>
            <Link
              to="/terms"
              style={{ color: '#FFFFFF', fontFamily: "'Inter', sans-serif" }}
              className="font-inter text-white hover:text-sky-300 hover:underline transition-colors"
            >
              Terms
            </Link>
          </div>

          <a
            href={youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-navy-900 border border-navy-700/80 flex items-center justify-center text-white hover:bg-red-600 hover:border-red-600 transition-all shadow-sm shrink-0 group"
            aria-label="YouTube"
            title="Subscribe on YouTube"
          >
            <Youtube className="w-6 h-6 sm:w-7 sm:h-7 text-white group-hover:scale-105 transition-transform" />
          </a>
        </div>

        {/* The line of the footer with copyright below */}
        <div className="border-t border-navy-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-white gap-4">
          <p style={{ color: '#FFFFFF', fontFamily: "'Inter', sans-serif" }}>
            © {currentYear} {churchName}. All rights reserved.
          </p>
          <p style={{ color: '#FFFFFF', fontFamily: "'Inter', sans-serif" }}>
            Design by{' '}
            <a
              href="https://www.pixenox.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-sky-300 hover:underline transition-colors font-medium"
            >
              Pixenox Solutions
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};
