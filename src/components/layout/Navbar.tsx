import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { SiteSettings } from '../../types/database.types';

export interface NavbarProps {
  settings: SiteSettings | null;
}

export const Navbar: React.FC<NavbarProps> = ({ settings }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname === '/sermons') {
      setActiveSection('sermons');
      setIsScrolled(true);
      return;
    }

    if (location.pathname === '/about-god' || location.pathname.startsWith('/about')) {
      setActiveSection('about-god');
      setIsScrolled(true);
      return;
    }

    if (location.pathname === '/founder') {
      setActiveSection('founder');
      setIsScrolled(true);
      return;
    }

    if (location.pathname === '/gallery') {
      setActiveSection('gallery');
      setIsScrolled(true);
      return;
    }

    if (location.pathname === '/contact') {
      setActiveSection('contact');
      setIsScrolled(true);
      return;
    }

    if (location.pathname === '/donate' || location.pathname.startsWith('/donate')) {
      setActiveSection('donate');
      setIsScrolled(true);
      return;
    }

    // On home page, stay on 'home' and do not spy/change on scroll
    setActiveSection('home');

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', href: '#home', id: 'home' },
    { name: 'About God', href: '/about-god', id: 'about-god' },
    { name: 'Founder', href: '/founder', id: 'founder' },
    { name: 'Baptisms', href: '/sermons', id: 'sermons' },
    { name: 'Gallery', href: '/gallery', id: 'gallery' },
    { name: 'Donate', href: '/donate', id: 'donate' },
    { name: 'Contact', href: '/contact', id: 'contact' },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    setMobileMenuOpen(false);

    if (href === '/sermons') {
      e.preventDefault();
      if (location.pathname !== '/sermons') {
        navigate('/sermons');
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    if (href === '/about-god') {
      e.preventDefault();
      if (location.pathname !== '/about-god') {
        navigate('/about-god');
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    if (href === '/founder') {
      e.preventDefault();
      if (location.pathname !== '/founder') {
        navigate('/founder');
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    if (href === '/gallery') {
      e.preventDefault();
      if (location.pathname !== '/gallery') {
        navigate('/gallery');
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    if (href === '/donate') {
      e.preventDefault();
      if (location.pathname !== '/donate') {
        navigate('/donate');
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    if (href === '/contact') {
      e.preventDefault();
      if (location.pathname !== '/contact') {
        navigate('/contact');
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    // If on /sermons or another page, and clicking a home section link
    if (location.pathname !== '/') {
      e.preventDefault();
      const targetId = href.replace('#', '');
      if (targetId === 'home') {
        navigate('/');
      } else {
        navigate(`/${href}`);
      }
      return;
    }

    // If on home page ('/')
    e.preventDefault();
    const targetId = href.replace('#', '');
    if (targetId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const showSolidBg = isScrolled || mobileMenuOpen || location.pathname !== '/';

  return (
    <header
      style={{ padding: '0px' }}
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 py-0 ${
        showSolidBg
          ? 'bg-white shadow-sm border-b border-slate-100'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div
        style={{ margin: '0px' }}
        className="w-full px-4 sm:px-6 lg:px-8 !m-0"
      >
        <div className="flex items-center justify-between">
          {/* Church Logo */}
          <a
            href="#home"
            onClick={(e) => handleNavClick(e, '#home')}
            className="flex items-center group focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-lg"
            aria-label={settings?.church_name || 'Home'}
          >
            <img
              src={settings?.logo_path || '/images/logo.png'}
              alt={settings?.church_name || 'Logo'}
              width={130}
              height={100}
              className="w-[130px] h-[100px] object-contain transition-transform duration-200 group-hover:scale-105 drop-shadow-xs rounded-lg"
            />
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <a
                  key={link.id}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    showSolidBg
                      ? isActive
                        ? 'text-sky-600 bg-sky-50 font-semibold'
                        : 'text-navy-700 hover:text-sky-600 hover:bg-slate-50'
                      : isActive
                        ? 'text-white bg-white/20 backdrop-blur-md font-semibold'
                        : 'text-white/90 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {link.name}
                </a>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href="/contact"
              onClick={(e) => handleNavClick(e, '/contact')}
              style={{ backgroundColor: '#FFBA33', color: '#1F2937' }}
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold shadow-sm hover:brightness-105 transition-all"
            >
              Plan a Visit
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-lg transition-colors ${
                showSolidBg
                  ? 'text-navy-800 hover:text-sky-600 hover:bg-slate-100'
                  : 'text-white hover:text-sky-300 hover:bg-white/10'
              }`}
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 mt-3 space-y-2 animate-in slide-in-from-top-2">
          {navLinks.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <a
                key={link.id}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={`block px-4 py-2.5 rounded-lg text-base font-medium transition-colors ${
                  isActive
                    ? 'text-sky-600 bg-sky-50 font-semibold'
                    : 'text-navy-800 hover:bg-slate-50'
                }`}
              >
                {link.name}
              </a>
            );
          })}
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <a
              href="/contact"
              onClick={(e) => handleNavClick(e, '/contact')}
              style={{ backgroundColor: '#FFBA33', color: '#1F2937' }}
              className="block w-full text-center py-2.5 rounded-lg text-sm font-semibold shadow-sm hover:brightness-105 transition-all"
            >
              Plan Your Visit
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
