import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Seo, { ORIGIN, PAGES } from '../../components/Seo';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { siteSettingsService } from '../../services/siteSettingsService';
import { aboutGodService } from '../../services/aboutGodService';
import { resolveImageUrl, slugify } from '../../lib/utils';
import type { SiteSettings, AboutGodCard } from '../../types/database.types';
import { ArrowLeft, BookOpen, Share2, MessageCircle } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { toast } from 'sonner';

export const AboutGodDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [currentCard, setCurrentCard] = useState<AboutGodCard | null>(null);
  const [allCards, setAllCards] = useState<AboutGodCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });

    const fetchDetailData = async () => {
      setIsLoading(true);
      try {
        const [settingsData, cardsData] = await Promise.all([
          siteSettingsService.getSiteSettings(),
          aboutGodService.getPublishedAboutGodCards(),
        ]);

        setSettings(settingsData);
        setAllCards(cardsData);

        if (slug) {
          const normalizedSlug = decodeURIComponent(slug).toLowerCase().trim();
          const matchedCard = cardsData.find(
            (c) => c.id === slug || slugify(c.title) === normalizedSlug
          );
          setCurrentCard(matchedCard || null);
        }
      } catch (err) {
        console.error('Failed to load card detail page:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetailData();
  }, [slug]);

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: currentCard?.title || 'About God',
          text: currentCard?.short_description || '',
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const otherCards = allCards.filter((c) => c.id !== currentCard?.id);

  // Build the canonical slug path for Seo (prefer known PAGES key, else construct it)
  const isNotFound = !isLoading && !currentCard;
  const cardPath = `/about-god/${slug ?? ''}`;
  const seoTitle = isNotFound
    ? 'Topic Not Found | Mizpah Ministries India'
    : currentCard?.title
      ? `${currentCard.title} | Mizpah Ministries India`
      : undefined;
  const seoDescription = isNotFound
    ? 'The requested biblical foundation could not be found.'
    : currentCard?.short_description ?? undefined;
  const seoImage = currentCard?.image_path
    ? currentCard.image_path.startsWith('http')
      ? currentCard.image_path
      : `${ORIGIN}/${currentCard.image_path}`
    : undefined;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Seo
        path={PAGES[cardPath] ? cardPath : '/about-god'}
        title={seoTitle}
        description={seoDescription}
        image={seoImage}
        noindex={isNotFound}
      />
      <Navbar settings={settings} />

      <main className="flex-grow pt-[100px] pb-16">
        {/* Loading State */}
        {isLoading && (
          <div
            style={{ margin: '0px' }}
            className="w-full px-4 sm:px-6 lg:px-8 py-12 animate-pulse space-y-6 !m-0"
          >
            <div className="h-6 bg-slate-200 rounded w-48" />
            <div className="h-12 bg-slate-300 rounded w-3/4" />
            <div className="h-96 bg-slate-200 rounded-2xl w-full" />
            <div className="space-y-3 pt-4">
              <div className="h-5 bg-slate-200 rounded w-full" />
              <div className="h-5 bg-slate-200 rounded w-5/6" />
              <div className="h-5 bg-slate-200 rounded w-4/6" />
            </div>
          </div>
        )}

        {/* Not Found State */}
        {!isLoading && !currentCard && (
          <div
            style={{ margin: '0px' }}
            className="w-full px-4 py-20 text-center space-y-4 !m-0"
          >
            <div className="w-16 h-16 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mx-auto">
              <BookOpen className="w-8 h-8" />
            </div>
            <h1 style={{ fontFamily: "'Inter', sans-serif" }} className="font-inter text-3xl font-bold text-navy-900">
              Topic Not Found
            </h1>
            <p className="text-base text-navy-600 max-w-md mx-auto">
              We couldn’t find the specific biblical foundation you were looking for. Explore our core foundations below.
            </p>
            <div className="pt-2">
              <Link to="/about-god">
                <Button variant="primary">
                  View All Truths
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Content State */}
        {!isLoading && currentCard && (
          <div
            style={{ margin: '0px' }}
            className="w-full px-4 sm:px-6 lg:px-8 py-8 !m-0"
          >
            {/* Share Action */}
            <div className="flex items-center justify-end mb-6">
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-2 text-sm font-medium px-3.5 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-navy-700 transition"
              >
                <Share2 className="w-3.5 h-3.5" />
                Share
              </button>
            </div>

            {/* Article Header */}
            <header className="mb-8 space-y-3">
              <h1 style={{ fontFamily: "'Inter', sans-serif" }} className="font-inter text-3xl sm:text-5xl font-bold text-navy-900 tracking-tight leading-tight">
                {currentCard.title}
              </h1>
              {currentCard.short_description && (
                <p className="text-lg sm:text-xl text-navy-600 font-light leading-relaxed max-w-3xl pt-1">
                  {currentCard.short_description}
                </p>
              )}
            </header>

            {/* Main Featured Image */}
            <div className="relative w-full h-[320px] sm:h-[450px] lg:h-[520px] rounded-2xl overflow-hidden bg-slate-900 shadow-card border border-slate-100 mb-10">
              <img
                src={resolveImageUrl(currentCard.image_path)}
                alt={currentCard.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content & Sidebar Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              {/* Main Body */}
              <article className="lg:col-span-8 space-y-6">
                <div className="prose prose-slate max-w-none text-navy-800 text-base sm:text-lg leading-relaxed whitespace-pre-line font-light">
                  {currentCard.full_description}
                </div>

                <div className="pt-8 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
                  <Link to="/about-god">
                    <Button variant="outline" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                      Explore More Truths
                    </Button>
                  </Link>

                  <Link to="/contact">
                    <Button variant="primary" leftIcon={<MessageCircle className="w-4 h-4" />}>
                      Ask a Question
                    </Button>
                  </Link>
                </div>
              </article>

              {/* Sidebar */}
              <aside className="lg:col-span-4 space-y-6">
                {/* Other Cards */}
                {otherCards.length > 0 && (
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80 space-y-4">
                    <h3 style={{ fontFamily: "'Inter', sans-serif" }} className="font-inter text-lg font-bold text-navy-900">
                      Explore Other Foundations
                    </h3>
                    <div className="space-y-3">
                      {otherCards.map((other) => (
                        <Link
                          key={other.id}
                          to={`/about-god/${slugify(other.title)}`}
                          className="block p-3.5 rounded-xl bg-white hover:bg-sky-50 border border-slate-100 transition-colors group"
                        >
                          <div className="text-xs font-semibold text-sky-600 mb-1">
                            Foundations of Faith
                          </div>
                          <div style={{ fontFamily: "'Inter', sans-serif" }} className="text-sm font-bold text-navy-900 group-hover:text-sky-600 transition-colors line-clamp-1">
                            {other.title}
                          </div>
                          <div className="text-xs text-navy-500 line-clamp-2 mt-1">
                            {other.short_description}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </aside>
            </div>
          </div>
        )}
      </main>

      <Footer settings={settings} />
    </div>
  );
};
