import React from 'react';

export interface MinistryInitiative {
  title: string;
  description: string;
  image: string;
}

export const MINISTRIES_DATA: MinistryInitiative[] = [
  {
    title: 'Soul Winning',
    description:
      "Fulfilling the Great Commission through passionate personal evangelism, continuous prayer, and leading precious souls into the eternal transforming grace and salvation of Jesus Christ.",
    image:
      'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Spread the Gospel to Unreached People',
    description:
      'Venturing into remote hamlets, distant frontiers, and culturally distinct communities where the name and light of Christ have not yet been proclaimed.',
    image:
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Church Planting',
    description:
      'Establishing dynamic, biblically founded local churches in unchurched areas to serve as spiritual sanctuaries, centers of fervent worship, and lighthouses of truth.',
    image: '/images/church-planting.jpg',
  },
  {
    title: 'Bible College',
    description:
      'Grounding students in deep scriptural knowledge, sound doctrine, and practical ministry training to equip visionary pastors, evangelists, and missionary leaders.',
    image:
      'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Children Ministry',
    description:
      'Nurturing young hearts in the ways of the Lord through inspiring Sunday school classes, Bible storytelling, joyful action songs, and loving mentorship.',
    image:
      'https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Children VBS (Vacation Bible School) Conventions',
    description:
      'Conducting lively annual Vacation Bible School camps and conventions filled with faith lessons, interactive crafts, gospel skits, and scripture memorization.',
    image:
      'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Open-Air Gospel Crusades',
    description:
      'Gathering vast outdoor multitudes for powerful proclamation of the Gospel, spirit-filled prayers, deliverance, and communal spiritual awakening under the open skies.',
    image:
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Church Ministry',
    description:
      'Faithfully shepherding the local congregation through weekly worship assemblies, pastoral care, believer fellowship, prayer cells, and holistic discipleship.',
    image:
      'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Village Church Pastors & Leaders Training Classes',
    description:
      'Empowering grassroots pastors and spiritual leaders laboring in rural villages through regular biblical instruction, pastoral mentoring, and ministerial fellowship.',
    image:
      'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Conduct Training Programs',
    description:
      'Organizing specialized leadership seminars, ministry workshops, and volunteer development courses to raise up capable and consecrated workers for the harvest field.',
    image:
      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Help Orphan Children',
    description:
      "Embodying Christ's pure compassion by extending parental care, daily nutrition, clean shelter, school supplies, and spiritual guidance to orphaned and fatherless children.",
    image:
      'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Conduct Jesus Film Shows in Tribal Areas',
    description:
      'Bringing portable audio-visual projection equipment into tribal and forest settlements to show the life, crucifixion, and resurrection of Christ in native vernaculars.',
    image:
      'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Help Flood Disaster-Affected People',
    description:
      'Mobilizing rapid emergency relief during seasonal floods and catastrophes—providing dry ration kits, clean drinking water, emergency medical supplies, and rehabilitation aid.',
    image:
      'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Youth Ministry',
    description:
      'Igniting the passion of the next generation to stand resolute in biblical values, develop deep devotional lives, and bring positive godly influence to their campuses.',
    image:
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Music Ministry',
    description:
      'Cultivating anointed worship leaders, vocalists, and instrumentalists dedicated to leading believers into authentic, heart-felt praise and adoration of God.',
    image:
      'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Medical Checkups for Old-Age People',
    description:
      'Conducting benevolent health clinics, geriatric consultations, eye screenings, and free medication distributions for underprivileged senior citizens in need.',
    image:
      'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=800&q=80',
  },
];

export const FounderMinistriesSection: React.FC = () => {
  return (
    <section
      id="founder-ministries"
      className="py-16 sm:py-24 bg-slate-50/70 border-b border-slate-100 relative overflow-hidden"
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
            Ministries
          </h2>
        </div>

        {/* Alternating Ministries Cards List */}
        <div className="w-full space-y-8 sm:space-y-10">
          {MINISTRIES_DATA.map((item, index) => {
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
                  className={`w-full md:w-1/2 p-6 sm:p-8 md:p-10 lg:p-12 flex flex-col justify-center ${isImageRight ? 'order-2 md:order-1' : 'order-2 md:order-2'
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
                  className={`w-full md:w-1/2 h-64 sm:h-80 md:h-auto min-h-[260px] md:min-h-[340px] relative overflow-hidden bg-slate-100 ${isImageRight ? 'order-1 md:order-2' : 'order-1 md:order-1'
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
