// scripts/generate-sitemap.mjs
// Utility script to generate or update public/sitemap.xml
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');

// Parse domain from command line arguments if provided (--domain=https://...)
const args = process.argv.slice(2);
const domainArg = args.find((a) => a.startsWith('--domain='));
const BASE_URL = (domainArg ? domainArg.split('=')[1] : process.env.VITE_SITE_URL || 'https://mizpahministries.org').replace(/\/$/, '');

const today = new Date().toISOString().split('T')[0];

const routes = [
  { path: '/', priority: '1.0', changefreq: 'weekly', comment: 'Home Sanctuary' },
  { path: '/sermons', priority: '0.9', changefreq: 'weekly', comment: 'Sermons Archive' },
  { path: '/the-gospel', priority: '0.9', changefreq: 'monthly', comment: 'The Gospel' },
  { path: '/about-god/god-the-father', priority: '0.8', changefreq: 'monthly', comment: 'God the Father' },
  { path: '/about-god/jesus-christ-the-son-of-god', priority: '0.8', changefreq: 'monthly', comment: 'Jesus Christ' },
  { path: '/about-god/the-holy-spirit', priority: '0.8', changefreq: 'monthly', comment: 'The Holy Spirit' },
  { path: '/our-vision', priority: '0.8', changefreq: 'monthly', comment: 'Our Vision & Ministries' },
  { path: '/founder', priority: '0.8', changefreq: 'monthly', comment: 'Pastoral Founder Biography' },
  { path: '/gallery', priority: '0.8', changefreq: 'weekly', comment: 'Photo Gallery' },
  { path: '/donate', priority: '0.8', changefreq: 'monthly', comment: 'Online Giving & Stewardship' },
  { path: '/contact', priority: '0.8', changefreq: 'monthly', comment: 'Contact Us & Prayer Requests' },
  { path: '/privacy', priority: '0.4', changefreq: 'yearly', comment: 'Privacy Policy' },
  { path: '/terms', priority: '0.4', changefreq: 'yearly', comment: 'Terms & Conditions' },
];

let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

for (const route of routes) {
  xml += `  <!-- ${route.comment} -->\n`;
  xml += `  <url>\n`;
  xml += `    <loc>${BASE_URL}${route.path === '/' ? '/' : route.path}</loc>\n`;
  xml += `    <lastmod>${today}</lastmod>\n`;
  xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
  xml += `    <priority>${route.priority}</priority>\n`;
  xml += `  </url>\n`;
}

xml += `</urlset>\n`;

const sitemapPath = path.join(publicDir, 'sitemap.xml');
fs.writeFileSync(sitemapPath, xml, 'utf-8');
console.log(`[PASS] Generated sitemap at ${sitemapPath} with base URL: ${BASE_URL}`);
