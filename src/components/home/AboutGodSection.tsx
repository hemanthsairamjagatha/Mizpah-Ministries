import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { AboutGodCard } from '../../types/database.types';
import { CardSkeleton } from '../common/Skeleton';
import { resolveImageUrl, slugify } from '../../lib/utils';
import { BookOpen, ArrowRight } from 'lucide-react';

export interface AboutGodSectionProps {
  cards: AboutGodCard[];
  isLoading?: boolean;
  limit?: number;
  showViewMore?: boolean;
}

export const AboutGodSection: React.FC<AboutGodSectionProps> = ({
  cards,
  isLoading,
  limit,
  showViewMore = false,
}) => {
  const navigate = useNavigate();
  const displayedCards = limit ? cards.slice(0, limit) : cards;

  return (
    <section
      id="about-god"
      style={{ padding: '60px 0px' }}
      className="py-[60px] px-0 bg-white border-b border-slate-100"
    >
      <div
        style={{ margin: '0px' }}
        className="w-full px-4 sm:px-6 lg:px-8 !m-0"
      >
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2
            style={{ fontFamily: "'Inter', sans-serif" }}
            className="font-inter text-3xl sm:text-4xl lg:text-5xl font-bold text-navy-900 tracking-tight"
          >
            Who is God?
          </h2>
        </div>

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        )}

        {/* Cards Grid: 3 on desktop, 2 on tablet, 1 on mobile */}
        {!isLoading && displayedCards.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayedCards.map((card) => {
                const cardSlug = slugify(card.title) || card.id;
                return (
                  <div
                    key={card.id}
                    onClick={() => navigate(`/about-god/${cardSlug}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        navigate(`/about-god/${cardSlug}`);
                      }
                    }}
                    className="group cursor-pointer bg-white rounded-2xl border border-slate-200/80 shadow-soft hover:shadow-card transition-all duration-300 flex flex-col overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                  >
                    {/* Image */}
                    <div className="relative h-56 w-full overflow-hidden bg-slate-100">
                      <img
                        src={resolveImageUrl(card.image_path)}
                        alt={card.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-navy-950/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    {/* Card Content */}
                    <div className="p-6 sm:p-7 flex flex-col flex-1">
                      <h3
                        style={{ fontFamily: "'Inter', sans-serif" }}
                        className="font-inter text-xl sm:text-2xl font-bold text-navy-900 mb-3 group-hover:text-sky-600 transition-colors"
                      >
                        {card.title}
                      </h3>
                      <p
                        style={{ fontFamily: "'Inter', sans-serif" }}
                        className="font-inter text-sm text-navy-600 leading-relaxed mb-6 flex-1 line-clamp-3 font-normal"
                      >
                        {card.short_description}
                      </p>
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-sky-600 text-sm font-semibold">
                        <span
                          style={{ fontFamily: "'Inter', sans-serif" }}
                          className="font-inter flex items-center gap-1.5 group-hover:underline"
                        >
                          Read Full Truth
                          <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* View More Button under the 3 cards */}
            {showViewMore && (
              <div
                style={{ margin: '24px 0px 0px' }}
                className="text-center"
              >
                <a
                  href="/about-god"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/about-god');
                  }}
                  style={{
                    backgroundColor: '#FFBA33',
                    color: '#1F2937',
                    fontFamily: "'Inter', sans-serif",
                  }}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-semibold text-sm shadow-sm hover:brightness-105 transition-colors cursor-pointer"
                >
                  <span>View More</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            )}
          </>
        )}

        {/* Empty state */}
        {!isLoading && cards.length === 0 && (
          <div className="text-center py-12 text-navy-400">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="text-base font-medium">No faith cards available right now.</p>
          </div>
        )}
      </div>
    </section>
  );
};
