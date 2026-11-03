import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Sermon } from '../../types/database.types';
import { Play, Calendar, User, Search, Tv, ArrowRight } from 'lucide-react';
import { formatDate, getYouTubeEmbedUrl, getYouTubeThumbnailUrl, resolveImageUrl } from '../../lib/utils';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { CardSkeleton } from '../common/Skeleton';

export interface SermonsSectionProps {
  sermons: Sermon[];
  isLoading?: boolean;
  limit?: number;
  showViewMore?: boolean;
  showSearch?: boolean;
  title?: string;
}

export const SermonsSection: React.FC<SermonsSectionProps> = ({
  sermons,
  isLoading,
  limit,
  showViewMore = false,
  showSearch = true,
  title = 'Baptisms',
}) => {
  const navigate = useNavigate();
  const [activeVideoSermon, setActiveVideoSermon] = useState<Sermon | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSermons = sermons.filter((s) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      s.title.toLowerCase().includes(term) ||
      s.pastor_name.toLowerCase().includes(term) ||
      s.description.toLowerCase().includes(term)
    );
  });

  const displayedSermons = limit ? filteredSermons.slice(0, limit) : filteredSermons;

  return (
    <section
      id="sermons"
      style={{ padding: '60px 0px' }}
      className="py-[60px] px-0 bg-white border-b border-slate-100"
    >
      <div
        style={{ margin: '0px' }}
        className="w-full px-4 sm:px-6 lg:px-8 !m-0"
      >
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            {title && (
              <h2
                style={{ fontFamily: "'Inter', sans-serif" }}
                className="font-inter text-3xl sm:text-4xl lg:text-5xl font-bold text-navy-900 tracking-tight"
              >
                {title}
              </h2>
            )}
          </div>

          {/* View More button in place of search bar on home page, or search bar on full sermons page */}
          {showViewMore ? (
            <div className="shrink-0 hidden md:block">
              <a
                href="/sermons"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/sermons');
                }}
                style={{
                  backgroundColor: '#FFBA33',
                  color: '#1F2937',
                  fontFamily: "'Inter', sans-serif",
                }}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 sm:px-7 sm:py-3 rounded-full font-semibold text-sm shadow-sm hover:brightness-105 transition-colors cursor-pointer"
              >
                <span>View More</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          ) : showSearch ? (
            <div className="w-full md:w-72 relative">
              <Search className="w-4 h-4 text-navy-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search sermons or speakers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400 focus:bg-white transition-all text-navy-800"
              />
            </div>
          ) : null}
        </div>

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        )}

        {/* Sermon Cards Grid */}
        {!isLoading && displayedSermons.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayedSermons.map((sermon) => {
              const thumbnail = sermon.thumbnail_path
                ? resolveImageUrl(sermon.thumbnail_path)
                : getYouTubeThumbnailUrl(sermon.youtube_url) || '/images/hero-church.jpg';

              return (
                <div
                  key={sermon.id}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-soft hover:shadow-card transition-all duration-300 flex flex-col overflow-hidden group"
                >
                  {/* Thumbnail with Play Hover */}
                  <div
                    className="relative h-52 w-full overflow-hidden bg-slate-900 cursor-pointer"
                    onClick={() => setActiveVideoSermon(sermon)}
                  >
                    <img
                      src={thumbnail}
                      alt={sermon.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 group-hover:opacity-90 transition-all duration-500 ease-out"
                    />
                    {/* Play Badge Overlay */}
                    <div className="absolute inset-0 bg-navy-950/30 flex items-center justify-center transition-opacity">
                      <div className="w-14 h-14 rounded-full bg-white/95 text-sky-600 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-sky-400 group-hover:text-white transition-all">
                        <Play className="w-6 h-6 fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Sermon Details */}
                  <div className="p-6 sm:p-7 flex flex-col flex-1">
                    {/* Meta Info: Speaker and Date */}
                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-navy-500 mb-3">
                      <span
                        style={{ fontFamily: "'Inter', sans-serif" }}
                        className="font-inter flex items-center gap-1.5 font-medium text-sky-600"
                      >
                        <User className="w-3.5 h-3.5 text-sky-500" />
                        {sermon.pastor_name}
                      </span>
                      <span
                        style={{ fontFamily: "'Inter', sans-serif" }}
                        className="font-inter flex items-center gap-1.5"
                      >
                        <Calendar className="w-3.5 h-3.5 text-navy-400" />
                        {formatDate(sermon.sermon_date)}
                      </span>
                    </div>

                    <h3
                      style={{ fontFamily: "'Inter', sans-serif" }}
                      className="font-inter text-xl font-bold text-navy-900 mb-2.5 line-clamp-2 hover:text-sky-600 cursor-pointer transition-colors"
                      onClick={() => setActiveVideoSermon(sermon)}
                    >
                      {sermon.title}
                    </h3>

                    <p
                      style={{ fontFamily: "'Inter', sans-serif" }}
                      className="font-inter text-sm text-navy-600 leading-relaxed mb-6 flex-1 line-clamp-3"
                    >
                      {sermon.description}
                    </p>

                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<Play className="w-4 h-4 fill-current" />}
                      onClick={() => setActiveVideoSermon(sermon)}
                      className="w-full justify-center"
                    >
                      Watch Sermon
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* View More Button placed under the section cards on mobile responsive only */}
        {showViewMore && displayedSermons.length > 0 && (
          <div className="mt-8 text-center md:hidden">
            <a
              href="/sermons"
              onClick={(e) => {
                e.preventDefault();
                navigate('/sermons');
              }}
              style={{
                backgroundColor: '#FFBA33',
                color: '#1F2937',
                fontFamily: "'Inter', sans-serif",
              }}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 sm:px-7 sm:py-3 rounded-full font-semibold text-sm shadow-sm hover:brightness-105 transition-colors cursor-pointer"
            >
              <span>View More</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && displayedSermons.length === 0 && (
          <div className="text-center py-16 text-navy-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <Tv className="w-12 h-12 mx-auto mb-3 opacity-40 text-navy-500" />
            <p className="text-base font-medium text-navy-700">No sermons matched your search.</p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-xs text-sky-600 font-semibold mt-2 hover:underline"
              >
                Clear search filter
              </button>
            )}
          </div>
        )}
      </div>

      {/* Safe YouTube Video Player Modal */}
      <Modal
        isOpen={!!activeVideoSermon}
        onClose={() => setActiveVideoSermon(null)}
        maxWidth="4xl"
      >
        {activeVideoSermon && (
          <div className="space-y-4">
            <div className="aspect-video w-full rounded-xl overflow-hidden bg-black shadow-lg">
              {getYouTubeEmbedUrl(activeVideoSermon.youtube_url) ? (
                <iframe
                  src={getYouTubeEmbedUrl(activeVideoSermon.youtube_url)!}
                  title={activeVideoSermon.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-white p-6 text-center">
                  <p className="text-sm mb-4">Could not load player for this video link.</p>
                  <a
                    href={activeVideoSermon.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="primary">Open on YouTube</Button>
                  </a>
                </div>
              )}
            </div>

            <div className="pt-2">
              <div className="flex items-center gap-3 text-xs text-navy-500 mb-1.5">
                <span className="font-semibold text-sky-600">{activeVideoSermon.pastor_name}</span>
                <span>•</span>
                <span>{formatDate(activeVideoSermon.sermon_date)}</span>
              </div>
              <h3
                style={{ fontFamily: "'Inter', sans-serif" }}
                className="font-inter text-2xl font-bold text-navy-900"
              >
                {activeVideoSermon.title}
              </h3>
              <p
                style={{ fontFamily: "'Inter', sans-serif" }}
                className="font-inter text-sm text-navy-600 mt-2 leading-relaxed"
              >
                {activeVideoSermon.description}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
};
