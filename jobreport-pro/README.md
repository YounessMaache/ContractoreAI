# JobReport Pro

Professional contractor document management mobile app for creating invoices, receipts, work orders, and more.

## Features

- 📱 Mobile-first Progressive Web App (PWA)
- 📄 10 Document Types (Invoice, Receipt, Work Order, Time Sheet, etc.)
- 📸 Photo attachments with automatic compression
- 💾 Offline support with IndexedDB
- 🔒 Secure authentication with Supabase
- 💳 Stripe payment integration
- 📊 PDF generation with jsPDF
- ☁️ Cloud sync and storage

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Payments**: Stripe
- **PDF**: jsPDF + jsPDF-AutoTable
- **Offline**: Dexie.js (IndexedDB)
- **State**: Zustand
- **Hosting**: Vercel

## Setup Instructions

### 1. Clone and Install

```bash
cd jobreport-pro
npm install
```

### 2. Set Up Supabase

1. Go to https://supabase.com and create a new project
2. Run the SQL migrations from `supabase/migrations/`:
   - Execute `001_initial_schema.sql` in SQL Editor
   - Execute `002_storage_policies.sql` in SQL Editor
3. Create storage buckets in Supabase Dashboard:
   - `company-logos` (public)
   - `document-photos` (private)
   - `generated-pdfs` (private)
4. Enable Google OAuth in Authentication > Providers
5. Get your API keys from Settings > API

### 3. Set Up Stripe

1. Go to https://stripe.com and create an account
2. Get API keys from Developers > API keys
3. Create products and prices in Products section
4. Set up webhook endpoint (after deployment):
   - URL: `https://yourdomain.com/api/stripe/webhook`
   - Events: `customer.subscription.*`, `invoice.*`

### 4. Configure Environment Variables

Create `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

NEXT_PUBLIC_URL=http://localhost:3000
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 6. Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Add environment variables in Vercel Dashboard under Settings > Environment Variables.

## Document Types

1. **Invoice** - Bill clients for completed work
2. **Receipt** - Record payments received
3. **Work Order** - Track service requests
4. **Time Sheet** - Log hours worked
5. **Material Log** - Track materials used
6. **Daily Job Report** - Daily progress tracking
7. **Estimate** - Provide project quotes
8. **Expense Log** - Track business expenses
9. **Warranty** - Issue warranty certificates
10. **Notes** - Quick notes and reminders

## Free vs Pro Features

### Free Tier
- 5 documents per month
- All document types
- Photo attachments
- PDF generation (with watermark)
- Cloud sync

### Pro Tier ($9.99/month)
- Unlimited documents
- No watermarks
- Priority support
- Advanced features

## Project Structure

```
jobreport-pro/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (Stripe)
│   ├── auth/              # Auth callbacks
│   ├── documents/         # Document pages
│   ├── login/             # Login page
│   ├── signup/            # Signup page
│   ├── settings/          # Settings page
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home dashboard
│   └── globals.css        # Global styles
├── components/
│   └── builders/          # Document builder components
├── lib/
│   ├── supabase.ts        # Supabase client
│   ├── db.ts              # IndexedDB (Dexie)
│   ├── store.ts           # Zustand stores
│   └── pdf-generator.ts   # PDF generation
├── supabase/
│   └── migrations/        # SQL migrations
├── public/
│   ├── manifest.json      # PWA manifest
│   └── sw.js              # Service worker
└── package.json
```

## Database Schema

### profiles
- User profile and company information
- Subscription status
- Document usage tracking

### documents
- All document types stored as JSONB
- Photos stored as array of URLs
- Full-text search support

### clients
- Client contact information
- Autocomplete support

### stripe_events
- Webhook event logging

## Security

- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Supabase Auth for authentication
- ✅ Secure file storage with private buckets
- ✅ Environment variables for secrets
- ✅ HTTPS only (Vercel)
- ✅ Stripe webhook signature verification

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
