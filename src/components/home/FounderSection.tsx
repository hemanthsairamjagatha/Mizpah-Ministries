import React from 'react';
import { Link } from 'react-router-dom';
import type { Founder } from '../../types/database.types';
import { resolveImageUrl } from '../../lib/utils';
import { Skeleton } from '../common/Skeleton';

export interface FounderSectionProps {
  founder: Founder | null;
  isLoading?: boolean;
  qualification?: string;
  showActions?: boolean;
}

export const FounderSection: React.FC<FounderSectionProps> = ({
  founder,
  isLoading,
  qualification: propQualification,
  showActions = true,
}) => {
  if (isLoading) {
    return (
      <section
        id="founder"
        style={{ padding: '60px 0px', backgroundColor: '#FFFFFF' }}
        className="py-[60px] px-0 bg-white border-b border-slate-100"
      >
        <div style={{ margin: '0px' }} className="w-full px-4 sm:px-6 lg:px-8 !m-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5">
              <Skeleton className="h-[450px] w-full rounded-2xl" />
            </div>
            <div className="lg:col-span-7 space-y-4">
              <Skeleton className="h-6 w-36" />
              <Skeleton className="h-10 w-2/3" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!founder) return null;

  const pastorName = founder.name.toLowerCase().startsWith('pastor')
    ? founder.name
    : `Pastor ${founder.name}`;

  const qualification =
    propQualification !== undefined
      ? propQualification
      : ((founder as any)?.qualification || 'B.A, B.sc, LLB, LLM, B.Th');

  const firstName =
    founder.name.replace(/^pastor\s+/i, '').trim().split(' ')[0] || 'Our Pastor';

  const quoteContent =
    founder.vision ||
    'For every way that someone can be lost, we want to provide a practical way for them to be found in the very place that they have ended up.';

  return (
    <section
      id="founder"
      style={{ padding: '60px 0px', backgroundColor: '#FFFFFF' }}
      className="py-[60px] px-0 bg-white border-b border-slate-100 relative overflow-hidden"
    >
      <div
        style={{ margin: '0px' }}
        className="w-full px-4 sm:px-6 lg:px-8 relative z-10 !m-0"
      >
        <div className="flex flex-col sm:flex-row items-center">
          {/* Side 1: Founder Portrait (on top on mobile: order-1, side-by-side on desktop: sm:order-1) */}
          <div className="founder-portrait-col w-full sm:w-1/2 flex justify-center items-center order-1 sm:order-1 mb-8 sm:mb-0">
            <div className="founder-image-container relative rounded-none sm:rounded-2xl overflow-hidden shadow-none sm:shadow-card border-0 sm:border border-slate-100 bg-white">
              <img
                src={resolveImageUrl(founder.image_path, '/images/pastor.png')}
                alt={pastorName}
                loading="lazy"
                width={630}
                height={729}
                className="founder-image object-cover object-top hover:scale-102 transition-transform duration-500"
              />
            </div>
          </div>

          {/* Side 2: Pastor Leadership Content matching reference */}
          <div
            style={{
              color: '#374151',
              fontFamily: 'Inter, sans-serif',
            }}
            className="pastor-content-container flex flex-col justify-center sm:w-1/2 p-0 sm:px-16 sm:py-0 order-2 sm:order-2"
          >
            {/* Top kicker */}
            <div
              style={{
                color: '#848B98',
                fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
                fontSize: '14px',
                margin: '0px 0px 16px',
              }}
              className="font-semibold uppercase tracking-wider text-sm mb-4"
            >
              OUR PASTOR
            </div>

            {/* Pastor Name Heading with Subtle Qualification */}
            <h2
              style={{
                color: '#374151',
                fontFamily: "'Inter', sans-serif",
                margin: '0px 0px 16px',
                lineHeight: 1.15,
              }}
              className="pastor-heading-responsive font-inter font-medium tracking-tight mb-4 text-[29.6px] sm:text-[32.8px]"
            >
              <span>{pastorName}{qualification ? ',' : ''}</span>
              {qualification && (
                <span
                  style={{
                    color: '#64748B',
                    fontFamily: "'Inter', sans-serif",
                  }}
                  className="text-sm sm:text-base font-normal text-slate-500 tracking-normal ml-1.5"
                >
                  {qualification.replace(/^,\s*/, '')}
                </span>
              )}
            </h2>

            {/* Quote / Body Copy */}
            <div
              style={{
                color: '#414B5A',
                fontFamily: 'Inter, sans-serif',
                fontSize: '16px',
                lineHeight: '26px',
              }}
              className="body-copy font-normal mb-0 sm:mb-8 max-w-xl"
            >
              “{quoteContent}” –{founder.name}
            </div>

            {/* Biography if available */}
            {founder.biography && (
              <div className="text-base text-slate-600 leading-relaxed space-y-4 font-light mb-8">
                <p className="whitespace-pre-line">{founder.biography}</p>
              </div>
            )}

            {/* Action Buttons */}
            {showActions && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6 pt-0 sm:pt-2">
                <div className="mt-4 px-4 sm:mt-0 sm:px-0">
                  <Link
                    to="/founder"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="inline-flex items-center justify-center px-7 py-3 rounded-full font-semibold text-sm text-white bg-[#00A3E0] hover:bg-[#008fcc] shadow-sm transition-all"
                  >
                    About {firstName}
                  </Link>
                </div>
                <div className="mt-4 px-4 sm:mt-0 sm:px-0">
                  <a
                    href="#contact"
                    className="inline-flex items-center text-sm font-semibold text-[#00A3E0] hover:text-[#008fcc] hover:underline transition-colors"
                  >
                    Follow on Instagram
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
