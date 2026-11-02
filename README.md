# Mizpah Ministries — Full-Stack Church Web Application & Admin Portal

A complete, production-ready, responsive Christian church website with a public-facing portal, secure role-protected admin dashboard, backend services, and Supabase (PostgreSQL, GoTrue Auth, Storage) integration.

Designed with an elegant, peaceful Christian church aesthetic featuring a **pure white (`#FFFFFF`) background**, **sky-blue (`#38BDF8`) buttons and accents**, dark navy typography (`#0F172A`), and refined serif headings (*Cinzel* & *Playfair Display*).

---

## 🌟 Key Features

### 1. Public Church Website (In Exact Sequence)
- **A. Header / Navigation:** Responsive navbar with church branding/logo, smooth in-page section scrolling (`#home`, `#about-god`, `#founder`, `#sermons`, `#gallery`, `#contact`), active section indicator, mobile drawer menu, and quick CTA buttons.
- **B. Hero Section:** Welcoming hero section with high-resolution background imagery, custom headline, subtitle, "Watch Sermons" and "Contact Us" CTA buttons, with support for multi-slide carousels and admin customization.
- **C. About God Section:** Structured faith cards describing God the Father, Jesus Christ, and the Holy Spirit in a responsive grid (**3 cards per row on desktop**, 2 on tablet, 1 on mobile). Clicking any card or its "Read Full Truth" action opens a comprehensive theological detail modal.
- **D. Pastoral Founder Section:** Visually appealing side-by-side layout presenting the founding pastor's portrait, vision statement quote, and complete ministry biography.
- **E. Sermons Section:** Filterable and searchable sermon archive with preacher name, preach date, description, YouTube streaming link, and custom thumbnail. Includes a **safe embedded YouTube player modal** supporting standard `youtube.com` and short `youtu.be` links.
- **F. Photo Gallery:** Image-focused gallery organized into 6 distinct categories:
  1. *All Photos*
  2. *Worship*
  3. *Community*
  4. *Prayer*
  5. *Youth*
  6. *Sanctuary*
  Features multiple photos per collection/album, responsive image grids, lazy loading, and an interactive **fullscreen lightbox** with previous/next navigation and keyboard controls (`ArrowLeft`, `ArrowRight`, `Escape`).
- **G. Interactive Contact Form:** Validated inquiry form with full name, email, phone (optional), subject, and prayer request/message. Direct Supabase database persistence, spam protection, client-side rate limiting, duplicate submission prevention, and toast notifications.
- **H. Footer:** Configurable logo, church name, sanctuary location, service times, contact numbers, email, social media links (Facebook, Instagram, YouTube, Twitter/X), and copyright notice.

---

### 2. Protected Admin Dashboard (`/admin`)
- **Authentication & Security:** Protected route wrapper verifying active Supabase GoTrue session and `admin_profiles` database role. Public visitors cannot register themselves.
- **Dashboard Overview:** Live summary counters fetched directly from PostgreSQL:
  - Total published sermons
  - Total About God faith cards
  - Total gallery collections
  - Total contact inquiries & unread inquiries badge
  - Real-time inbox feed of recent contact messages
  - Quick management shortcuts
- **Hero Management:** Create, edit, preview, reorder, and toggle publishing of hero banner slides. Direct image uploads to Supabase Storage `site-assets` bucket.
- **About God Management:** Full CRUD management of doctrinal cards, images, short summaries, and long descriptions with confirmation dialogs.
- **Founder Management:** Manage founding pastor profiles, vision statement quotes, portrait uploads, and set the primary featured founder.
- **Sermons Management:** Add, edit, search, filter, and delete sermons. Upload custom thumbnails or auto-derive YouTube thumbnail images, validate video links, and toggle public visibility.
- **Gallery Management:** Create albums, assign categories, upload album cover photos, and **batch-upload multiple high-resolution photos in a single operation** directly into the `gallery-images` storage bucket. Manage sub-images, delete photos, and preview albums before publishing.
- **Contact Messages Inbox:** Read full visitor messages, search by sender or subject, filter by status (`unread`, `read`, `replied`), record private internal pastoral follow-up notes, delete messages with confirmation, and trigger one-click email replies via `mailto:`.
- **Site Settings Management:** Centrally update the church name, logo, contact phone, contact email, street address, footer copy, and social links.
- **Admin Users:** View authorized administrators and allow superadmins to manage admin roles.

---

## 🛠 Technology Stack

- **Frontend Framework:** React 18 with TypeScript and Vite
- **Styling:** Tailwind CSS with custom church design tokens
- **Icons:** Lucide React
- **Routing:** React Router v6
- **Form Validation:** React Hook Form with Zod schemas
- **Notifications:** Sonner rich toast notifications
- **Backend & Database:** Supabase (PostgreSQL 17)
- **Authentication:** Supabase Auth (GoTrue)
- **Cloud Storage:** Supabase Storage (Buckets: `site-assets`, `about-images`, `founder-images`, `sermon-thumbnails`, `gallery-images`)
- **Deployment Target:** Vercel / Netlify / Cloudflare Pages ready (`vercel.json` included)

---

## 🗄 Database Architecture & Row Level Security

The application runs on dedicated PostgreSQL tables with Row Level Security (RLS) enabled on every table:

| Table | Purpose | Security & RLS Policy |
| :--- | :--- | :--- |
| `site_settings` | Global branding, contact info, and social links | Public read; Admin-only update |
| `hero_sections` | Hero slides, headlines, CTAs, and background images | Public read for `is_published = true`; Admin full CRUD |
| `about_god_cards` | Faith & doctrinal cards with full description modal | Public read for `is_published = true`; Admin full CRUD |
| `founders` | Pastoral founder bios, portraits, and vision quotes | Public read for `is_published = true`; Admin full CRUD |
| `sermons` | Sermon archive, video links, speaker, and preach date | Public read for `is_published = true`; Admin full CRUD |
| `gallery_categories` | The 6 core categories (`all`, `worship`, `community`, `prayer`, `youth`, `sanctuary`) | Public read; Admin-only write |
| `gallery_collections`| Photo albums, categories, covers, and descriptions | Public read for `is_published = true`; Admin full CRUD |
| `gallery_images` | Individual high-res photos attached to collections | Public read if parent collection is published; Admin full CRUD |
| `contact_messages` | Inquiries and prayer requests from website visitors | Public insert (`anon`); Admin-only read, update & delete |
| `admin_profiles` | Authenticated admin user accounts and roles (`admin`, `superadmin`) | Authenticated read; Superadmin manage |

### Storage Buckets & Policies
- `site-assets`: Church logos and hero photography (Public read; Admin authenticated write)
- `about-images`: Theological card graphics (Public read; Admin authenticated write)
- `founder-images`: Pastoral portraits (Public read; Admin authenticated write)
- `sermon-thumbnails`: Video thumbnails (Public read; Admin authenticated write)
- `gallery-images`: High-resolution gallery photos (Public read; Admin authenticated write)

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/hemanthsairamjagatha/Mizpah-Ministries.git
cd Mizpah-Ministries
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the project root (see `.env.example`):
```env
VITE_SUPABASE_URL=https://ulxlpwipdvejzdzhmhwb.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVseGxwd2lwZHZlanpkemhtaHdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI5NDI1NTQsImV4cCI6MjEwODUxODU1NH0.rKWX5kFwxom9mxCR7NQlP2M6MJRtQveEb8UQMmZ86L0
```

### 4. Database Setup & Seed Execution
If you are configuring a brand new Supabase instance:
1. Open the **SQL Editor** in your Supabase dashboard.
2. Execute `supabase/migrations/001_initial_schema.sql` to establish tables, storage buckets, and RLS policies.
3. Execute `supabase/seed.sql` to populate initial categories, hero slides, About God cards, primary founder, and sermon entries.

### 5. Running the Application Locally
To launch the Vite development server with hot module replacement:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

To test the production build locally:
```bash
npm run build
npm run preview
```

---

## 🔐 Admin Authentication & Credentials

To access the church administration portal:
1. Navigate to `/admin` or click the **Admin** button in the public website header.
2. If not logged in, you will be directed to `/admin/login`.
3. Default administrator credentials:
   - **Email:** `admin@mizpahministries.org`
   - **Password:** `admin123456`

To create additional administrators:
- In your Supabase dashboard, navigate to **Authentication** > **Users** > **Invite User** or **Add User**.
- Once the user account is created, add an entry to the `public.admin_profiles` table:
```sql
INSERT INTO public.admin_profiles (id, display_name, role)
VALUES ('<USER_UUID>', 'Associate Pastor', 'admin');
```

---

## 📦 Deployment to Vercel

The project includes `vercel.json` configured with SPA fallback rewrites.

1. Push your repository to GitHub.
2. Log into [Vercel](https://vercel.com/) and click **Add New Project**.
3. Select your repository.
4. In **Environment Variables**, add:
   - `VITE_SUPABASE_URL`: Your Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon/Publishable API Key
5. Click **Deploy**. Vercel will run `npm run build` and output the optimized application directly from `/dist`.

---

## 📄 License
This project is licensed under the MIT License.

