import React from 'react';

export interface GivingInitiative {
  title: string;
  description: string;
  image: string;
}

export const GIVING_INITIATIVES: GivingInitiative[] = [
  {
    title: 'Evangelism and Reaching Unreached People',
    description:
      'Your financial contributions fuel pioneer gospel journeys, scriptural literature distribution, and personal evangelism to bring the transforming light and hope of Jesus Christ to unreached settlements and remote communities.',
    image: '/images/donate-evangelism.jpg',
  },
  {
    title: 'Church Planting and Pastor Training',
    description:
      'Every gift helps establish vibrant local church sanctuaries in emerging areas while funding ongoing theological training, mentoring, and essential living allowances for rural pastors and frontline spiritual leaders.',
    image: '/images/donate-church-planting.jpg',
  },
  {
    title: 'Children and Orphan Care',
    description:
      'Donations provide caring shelter, nutritious meals, school uniforms, textbooks, medical support, and loving Christian mentorship to orphaned and vulnerable children, building a foundation of hope for their future.',
    image: '/images/donate-children-care.jpg',
  },
  {
    title: 'Tribal Outreach and Gospel Crusades',
    description:
      'Your generosity enables mobile audio-visual equipment to host Jesus Film screenings in indigenous tribal languages, along with open-air Gospel crusades that draw thousands to hear God’s life-changing Word.',
    image: '/images/donate-gospel-crusades.jpg',
  },
  {
    title: 'Medical Camps and Disaster Relief',
    description:
      'We organize free benevolent health clinics and distribute vital medicine to underprivileged elderly seniors, while delivering emergency relief kits, clean water, and rehabilitation aid to families affected by severe flooding and natural crises.',
    image: '/images/donate-medical-camps.jpg',
  },
];

export const GivingInitiativesSection: React.FC = () => {
  return (
    <section
      id="giving-initiatives"
      className="py-16 sm:py-24 bg-white border-t border-slate-100 relative overflow-hidden"
    >
      <div
        style={{ margin: '0px' }}
        className="w-full px-4 sm:px-6 lg:px-8 relative z-10 !m-0"
      >
        {/* Section Header */}
        <div className="text-center w-full mb-10 sm:mb-14">
          <h2
            style={{ fontFamily: "'Inter', sans-serif" }}
            className="font-inter text-3xl sm:text-4xl lg:text-5xl font-bold text-navy-900 tracking-tight"
          >
            Where Your Giving Goes
          </h2>
        </div>

        {/* Alternating Giving Cards List (Matches Founder's Page) */}
        <div className="w-full space-y-8 sm:space-y-10">
          {GIVING_INITIATIVES.map((item, index) => {
            // First item (index 0): Title & description left, image right
            // Second item (index 1): Image left, title & description right
            const isImageRight = index % 2 === 0;

            return (
              <div
                key={item.title}
                className="group bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-soft hover:shadow-card transition-all duration-300 flex flex-col md:flex-row overflow-hidden items-stretch"
              >
                {/* Text Content Column */}
                <div
                  className={`w-full md:w-1/2 p-6 sm:p-8 md:p-10 lg:p-12 flex flex-col justify-center ${
                    isImageRight ? 'order-2 md:order-1' : 'order-2 md:order-2'
                  }`}
                >
                  <h3
                    style={{ fontFamily: "'Inter', sans-serif" }}
                    className="font-inter text-2xl sm:text-3xl font-bold text-navy-900 mb-3 sm:mb-4 group-hover:text-sky-600 transition-colors leading-snug"
                  >
                    {item.title}
                  </h3>
                  <p
                    style={{ fontFamily: "'Inter', sans-serif" }}
                    className="font-inter text-base sm:text-lg text-slate-600 leading-relaxed font-normal"
                  >
                    {item.description}
                  </p>
                </div>

                {/* Image Column */}
                <div
                  className={`w-full md:w-1/2 h-64 sm:h-80 md:h-auto min-h-[260px] md:min-h-[340px] relative overflow-hidden bg-slate-100 ${
                    isImageRight ? 'order-1 md:order-2' : 'order-1 md:order-1'
                  }`}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
