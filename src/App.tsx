import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { Toaster } from 'sonner';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { SermonsPage } from './pages/public/SermonsPage';
import { AboutGodPage } from './pages/public/AboutGodPage';
import { AboutGodDetailPage } from './pages/public/AboutGodDetailPage';
import { OurVisionPage } from './pages/public/OurVisionPage';
import { FounderPage } from './pages/public/FounderPage';
import { GalleryPage } from './pages/public/GalleryPage';
import { ContactPage } from './pages/public/ContactPage';
import { DonatePage } from './pages/public/DonatePage';
import { PrivacyPolicyPage } from './pages/public/PrivacyPolicyPage';
import { TermsConditionsPage } from './pages/public/TermsConditionsPage';

// Admin Pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminLayout } from './components/layout/AdminLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AdminOverviewPage } from './pages/admin/AdminOverviewPage';
import { HeroManagerPage } from './pages/admin/HeroManagerPage';
import { AboutGodManagerPage } from './pages/admin/AboutGodManagerPage';
import { FounderManagerPage } from './pages/admin/FounderManagerPage';
import { SermonsManagerPage } from './pages/admin/SermonsManagerPage';
import { GalleryManagerPage } from './pages/admin/GalleryManagerPage';
import { ContactMessagesPage } from './pages/admin/ContactMessagesPage';
import { SiteSettingsPage } from './pages/admin/SiteSettingsPage';
import { DonationManagerPage } from './pages/admin/DonationManagerPage';
import { CampusesManagerPage } from './pages/admin/CampusesManagerPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { Church } from 'lucide-react';
import { Button } from './components/common/Button';
import Seo from './components/Seo';

// 404 Page
const NotFoundPage: React.FC = () => (
  <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
    <Seo
      path="/404"
      title="404 — Page Not Found | Mizpah Ministries India"
      description="The sanctuary page you are looking for may have been moved or does not exist."
      noindex
    />
    <div className="w-16 h-16 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mb-4">
      <Church className="w-8 h-8" />
    </div>
    <h1
      style={{ fontFamily: "'Inter', sans-serif" }}
      className="font-inter text-4xl sm:text-5xl font-bold text-navy-900 mb-2"
    >
      404
    </h1>
    <h2
      style={{ fontFamily: "'Inter', sans-serif" }}
      className="font-inter text-xl sm:text-2xl font-semibold text-navy-800 mb-3"
    >
      Page Not Found
    </h2>
    <p className="text-sm text-navy-500 max-w-md mb-8 leading-relaxed">
      The sanctuary page you are looking for may have been moved or does not exist. Let us guide you back home.
    </p>
    <Link to="/">
      <Button variant="primary" size="lg">
        Return to Home
      </Button>
    </Link>
  </div>
);

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Toaster position="top-right" richColors />
      <Routes>
        {/* Public Website */}
        <Route path="/" element={<HomePage />} />
        <Route path="/sermons" element={<SermonsPage />} />
        <Route path="/the-gospel" element={<AboutGodPage />} />
        <Route path="/the-gospel/:slug" element={<AboutGodDetailPage />} />
        <Route path="/about-god" element={<Navigate to="/the-gospel" replace />} />
        <Route path="/about-god/:slug" element={<Navigate to="/the-gospel/:slug" replace />} />
        <Route path="/the-gospal" element={<Navigate to="/the-gospel" replace />} />
        <Route path="/gospel" element={<Navigate to="/the-gospel" replace />} />
        <Route path="/the_gospel" element={<Navigate to="/the-gospel" replace />} />
        <Route path="/about_god" element={<Navigate to="/the-gospel" replace />} />
        <Route path="/about_god/:slug" element={<Navigate to="/the-gospel/:slug" replace />} />
        <Route path="/about%20god" element={<Navigate to="/the-gospel" replace />} />
        <Route path="/about god" element={<Navigate to="/the-gospel" replace />} />
        <Route path="/our-vision" element={<OurVisionPage />} />
        <Route path="/our_vision" element={<Navigate to="/our-vision" replace />} />
        <Route path="/vision" element={<Navigate to="/our-vision" replace />} />
        <Route path="/founder" element={<FounderPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/donate" element={<DonatePage />} />
        <Route path="/donating" element={<Navigate to="/donate" replace />} />
        <Route path="/giving" element={<Navigate to="/donate" replace />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsConditionsPage />} />
        <Route path="/terms-and-conditions" element={<TermsConditionsPage />} />

        {/* Admin Login */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Protected Admin Console */}
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminOverviewPage />} />
            <Route path="hero" element={<HeroManagerPage />} />
            <Route path="the-gospel" element={<AboutGodManagerPage />} />
            <Route path="about-god" element={<Navigate to="/admin/the-gospel" replace />} />
            <Route path="founder" element={<FounderManagerPage />} />
            <Route path="sermons" element={<SermonsManagerPage />} />
            <Route path="gallery" element={<GalleryManagerPage />} />
            <Route path="donate" element={<DonationManagerPage />} />
            <Route path="campuses" element={<CampusesManagerPage />} />
            <Route path="messages" element={<ContactMessagesPage />} />
            <Route path="settings" element={<SiteSettingsPage />} />
            <Route path="users" element={<AdminUsersPage />} />
          </Route>
        </Route>

        {/* Fallback 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  );
};
