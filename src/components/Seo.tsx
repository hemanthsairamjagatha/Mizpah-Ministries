// src/components/Seo.tsx
// Per-route <head>: unique title/description, canonical, Open Graph, Twitter and
// JSON-LD (Church + WebSite on the home page, BreadcrumbList elsewhere).
//
// Setup (once):
//   npm i react-helmet-async
//   main.tsx:  <HelmetProvider><App /></HelmetProvider>
// Use (top of every public page):  <Seo path="/sermons" />
// Admin pages:                      <Seo path="/admin" noindex />
import { Helmet } from 'react-helmet-async';

export const ORIGIN = 'https://mizpahministries.org';
const SITE_NAME = 'Mizpah Ministries India';
// [EDIT] Replace with a dedicated 1200x630 image when you have one.
const DEFAULT_IMAGE = `${ORIGIN}/images/hero-church.jpg`;

type PageMeta = {
  title: string; // keep under ~60 characters
  description: string; // keep under ~155 characters
  crumb: string;
  type?: 'website' | 'article';
};

export const PAGES: Record<string, PageMeta> = {
  '/': {
    title: 'Mizpah Ministries India | Church in Kanigiri, Andhra Pradesh',
    description:
      'A Christ-centered church and community ministry in Kanigiri, Andhra Pradesh. Watch sermons, learn what we believe, give, or send a prayer request.',
    crumb: 'Home',
  },
  '/sermons': {
    title: 'Sermons | Mizpah Ministries India',
    description:
      'Watch and search the Mizpah Ministries archive of video sermons and biblical teaching from Kanigiri, Andhra Pradesh.',
    crumb: 'Sermons',
  },
  '/about-god': {
    title: 'What We Believe About God | Mizpah Ministries India',
    description:
      "Mizpah Ministries' doctrinal statement on God: the Father, the Son Jesus Christ and the Holy Spirit.",
    crumb: 'About God',
  },
  '/about-god/god-the-father': {
    title: 'God the Father | Mizpah Ministries India',
    description: 'Biblical teaching on the nature, sovereignty, holiness and fatherhood of God.',
    crumb: 'God the Father',
    type: 'article',
  },
  '/about-god/jesus-christ-the-son-of-god': {
    title: 'Jesus Christ, the Son of God | Mizpah Ministries',
    description:
      'What Mizpah Ministries teaches about the divinity, incarnation, atonement and resurrection of Jesus Christ.',
    crumb: 'Jesus Christ, the Son of God',
    type: 'article',
  },
  '/about-god/the-holy-spirit': {
    title: 'The Holy Spirit | Mizpah Ministries India',
    description:
      'Scriptural teaching on the person, gifts, fruit and sanctifying work of the Holy Spirit.',
    crumb: 'The Holy Spirit',
    type: 'article',
  },
  '/founder': {
    title: 'Our Founding Pastor | Mizpah Ministries India',
    description:
      'The calling, testimony and vision of the pastor who founded Mizpah Ministries in Kanigiri, Andhra Pradesh.',
    crumb: 'Founder',
  },
  '/gallery': {
    title: 'Photo Gallery | Mizpah Ministries India',
    description:
      'Photos of worship, prayer, youth, community and sanctuary life at Mizpah Ministries.',
    crumb: 'Photo Gallery',
  },
  '/donate': {
    title: 'Give | Mizpah Ministries India',
    description: 'Give tithes, offerings and donations to Mizpah Ministries by bank transfer or UPI.',
    crumb: 'Give',
  },
  '/contact': {
    title: 'Contact & Prayer Requests | Mizpah Ministries India',
    description:
      'Find the address, phone and email of Mizpah Ministries, or send us a prayer request.',
    crumb: 'Contact',
  },
  '/privacy': {
    title: 'Privacy Policy | Mizpah Ministries India',
    description:
      'How Mizpah Ministries handles communications, donor information and data protection.',
    crumb: 'Privacy Policy',
  },
  '/terms': {
    title: 'Terms & Conditions | Mizpah Ministries India',
    description:
      'Terms governing use of the Mizpah Ministries website, its media and public resources.',
    crumb: 'Terms & Conditions',
  },
};

const church = {
  '@type': 'Church',
  '@id': `${ORIGIN}/#church`,
  name: SITE_NAME,
  url: `${ORIGIN}/`,
  logo: `${ORIGIN}/images/logo.png`,
  image: DEFAULT_IMAGE,
  description: PAGES['/'].description,
  telephone: '+91 9666709636',
  email: 'mizpahministriesindia@gmail.com',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'No. 1, K.R. Colony, Podili Road',
    addressLocality: 'Kanigiri',
    addressRegion: 'Andhra Pradesh',
    postalCode: '523230',
    addressCountry: 'IN',
  },
};

const website = {
  '@type': 'WebSite',
  '@id': `${ORIGIN}/#website`,
  url: `${ORIGIN}/`,
  name: SITE_NAME,
  inLanguage: 'en',
  publisher: { '@id': `${ORIGIN}/#church` },
};

function breadcrumbs(path: string) {
  const parts = path.split('/').filter(Boolean);
  const items = [{ path: '/', name: PAGES['/'].crumb }];
  parts.forEach((part, i) => {
    const p = '/' + parts.slice(0, i + 1).join('/');
    items.push({ path: p, name: PAGES[p]?.crumb ?? part });
  });
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: ORIGIN + it.path,
    })),
  };
}

type SeoProps = {
  path: string;
  title?: string;
  description?: string;
  image?: string;
  noindex?: boolean;
  extraJsonLd?: object[]; // e.g. VideoObject entries for sermons
};

export default function Seo({
  path,
  title,
  description,
  image,
  noindex = false,
  extraJsonLd = [],
}: SeoProps) {
  const page = PAGES[path];
  const t = title ?? page?.title ?? SITE_NAME;
  const d = description ?? page?.description ?? PAGES['/'].description;
  const url = ORIGIN + (path === '/' ? '/' : path.replace(/\/+$/, ''));
  const img = image ?? DEFAULT_IMAGE;

  const graph: object[] = [...extraJsonLd];
  if (!noindex) {
    if (path === '/') graph.push(church, website);
    else graph.push(breadcrumbs(path));
  }

  return (
    <Helmet>
      <html lang="en" />
      <title>{t}</title>
      <meta name="description" content={d} />
      <meta
        name="robots"
        content={
          noindex
            ? 'noindex, nofollow'
            : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
        }
      />
      {!noindex && <link rel="canonical" href={url} />}

      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_IN" />
      <meta property="og:type" content={page?.type ?? 'website'} />
      <meta property="og:title" content={t} />
      <meta property="og:description" content={d} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={img} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={t} />
      <meta name="twitter:description" content={d} />
      <meta name="twitter:image" content={img} />

      {graph.length > 0 && (
        <script type="application/ld+json">
          {JSON.stringify({ '@context': 'https://schema.org', '@graph': graph })}
        </script>
      )}
    </Helmet>
  );
}
