import React from 'react';
import { Link } from 'react-router-dom';

export const FounderDonationCTA: React.FC = () => {
  return (
    <section className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 text-center overflow-hidden">
      {/* Background with warm atmospheric imagery and dark cinematic overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/donate-hero.jpg"
          alt="Partner with us in ministry"
          className="w-full h-full object-cover object-center scale-105"
          style={{
            filter: 'contrast(1.1) brightness(0.4) saturate(0.9)',
          }}
        />
        {/* Warm vignette overlay mirroring the reference banner */}
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950/85 via-navy-950/70 to-navy-950/90" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center text-center text-white">
        {/* Large Elegant Heading */}
        <h2
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            letterSpacing: '-0.02em',
          }}
          className="text-3xl sm:text-5xl lg:text-6xl font-normal text-white mb-6 leading-tight drop-shadow-md"
        >
          Would You Like to Partner With Us in God’s Work?
        </h2>

        {/* Polite, Heartfelt Description */}
        <p
          style={{ fontFamily: "'Inter', sans-serif" }}
          className="font-inter text-base sm:text-lg lg:text-xl text-white/90 max-w-2xl mx-auto font-light leading-relaxed mb-10 sm:mb-12 drop-shadow-xs"
        >
          Your thoughtful support and prayers help us bring the Gospel to unreached souls, care for orphan children, equip village pastors, and extend compassionate relief to families facing hardship. We would be deeply honored and grateful for your partnership.
        </p>

        {/* Outline Pill Button */}
        <div>
          <Link
            to="/donate"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{ fontFamily: "'Inter', sans-serif" }}
            className="inline-flex items-center justify-center px-8 sm:px-10 py-3.5 sm:py-4 rounded-full border border-white/90 text-white font-medium text-xs sm:text-sm tracking-widest uppercase hover:bg-white hover:text-navy-950 transition-all duration-300 shadow-md cursor-pointer group"
          >
            <span>Donate</span>
          </Link>
        </div>
      </div>
    </section>
  );
};
