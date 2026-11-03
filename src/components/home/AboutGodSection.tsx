import React, { useState, useEffect } from 'react';
import type { GospelText } from '../../types/database.types';
import { aboutGodService, DEFAULT_GOSPEL_TEXT } from '../../services/aboutGodService';

export interface AboutGodSectionProps {
  isLoading?: boolean;
}

export const AboutGodSection: React.FC<AboutGodSectionProps> = ({ isLoading }) => {
  const [gospelTexts, setGospelTexts] = useState<GospelText[]>([DEFAULT_GOSPEL_TEXT]);

  useEffect(() => {
    aboutGodService
      .getPublishedGospelTexts()
      .then((texts) => {
        if (texts && texts.length > 0) {
          setGospelTexts(texts);
        }
      })
      .catch((err) => {
        console.warn('Could not load gospel texts:', err);
      });
  }, []);

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
        {/* Section Header - Fixed The Gospel & Text : */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h2
            style={{ fontFamily: "'Inter', sans-serif" }}
            className="font-inter text-3xl sm:text-4xl lg:text-5xl font-bold text-navy-900 tracking-tight"
          >
            The Gospel
          </h2>
          <p
            style={{ fontFamily: "'Inter', sans-serif", fontSize: '16px' }}
            className="font-inter text-[16px] font-semibold text-slate-800"
          >
            Text :
          </p>

          {/* Cards of The Gospel (Scripture Verses) */}
          <div className="space-y-6 pt-2">
            {isLoading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-16 bg-slate-200 rounded-lg w-3/4 mx-auto" />
              </div>
            ) : (
              gospelTexts.map((gt) => (
                <div key={gt.id} className="max-w-2xl mx-auto">
                  {gt.scripture && (
                    <p
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '16px',
                        fontStyle: 'normal',
                      }}
                      className="font-inter text-[16px] font-semibold text-slate-800 leading-relaxed not-italic"
                    >
                      {gt.scripture}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
