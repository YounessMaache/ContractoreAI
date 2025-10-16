# JobReport Pro - Complete Setup Guide

## Step-by-Step Setup Instructions

### Prerequisites
- Node.js 18+ installed
- A Supabase account
- A Stripe account (for payments)
- Git installed

---

## Part 1: Supabase Setup

### 1.1 Create Supabase Project
1. Go to https://supabase.com
2. Sign in or create an account
3. Click "New Project"
4. Fill in:
   - Name: `jobreport-pro`
   - Database Password: (save this securely)
   - Region: Choose closest to you
5. Wait for project to be created (~2 minutes)

### 1.2 Run Database Migrations
1. In Supabase Dashboard, go to **SQL Editor**
2. Copy and paste the entire contents of `supabase/migrations/001_initial_schema.sql`
3. Click **Run**
4. Wait for success message
5. Copy and paste the entire contents of `supabase/migrations/002_storage_policies.sql`
6. Click **Run**
7. Wait for success message

### 1.3 Create Storage Buckets
1. Go to **Storage** in Supabase Dashboard
2. Click **New bucket**
3. Create these 3 buckets:

**Bucket 1: company-logos**
- Name: `company-logos`
- Public bucket: ✅ YES
- File size limit: 2 MB
- Allowed MIME types: `image/png,image/jpeg,image/svg+xml`

**Bucket 2: document-photos**
- Name: `document-photos`
- Public bucket: ❌ NO
- File size limit: 5 MB
- Allowed MIME types: `image/jpeg,image/png`

**Bucket 3: generated-pdfs**
- Name: `generated-pdfs`
- Public bucket: ❌ NO
- File size limit: 10 MB
- Allowed MIME types: `application/pdf`

### 1.4 Enable Google OAuth (Optional)
1. Go to **Authentication** > **Providers**
2. Enable **Google**
3. Follow instructions to get Google Client ID and Secret
4. Add authorized redirect URLs

### 1.5 Get API Keys
1. Go to **Settings** > **API**
2. Copy these values (you'll need them later):
   - Project URL
   - anon public key
   - service_role key (keep this SECRET!)

---

## Part 2: Stripe Setup (Optional - for payments)

### 2.1 Create Stripe Account
1. Go to https://stripe.com
2. Sign up for an account
3. Complete verification

### 2.2 Get API Keys
1. Go to **Developers** > **API keys**
2. Copy:
   - Publishable key (starts with `pk_test_`)
   - Secret key (starts with `sk_test_`)

### 2.3 Create Products and Prices
1. Go to **Products** > **Add product**
2. Create a product:
   - Name: "JobReport Pro"
   - Description: "Unlimited documents and features"
   - Pricing: $9.99/month (recurring)
3. Copy the **Price ID** (starts with `price_`)

### 2.4 Configure Webhook (After Deployment)
1. Go to **Developers** > **Webhooks**
2. Click **Add endpoint**
3. Endpoint URL: `https://your-domain.vercel.app/api/stripe/webhook`
4. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
5. Copy the **Signing secret** (starts with `whsec_`)

---

## Part 3: Local Development Setup

### 3.1 Install Dependencies
```bash
cd jobreport-pro
npm install
```

### 3.2 Create Environment File
Create `.env.local` in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe (Optional)
STRIPE_SECRET_KEY=sk_test_51...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51...
STRIPE_WEBHOOK_SECRET=whsec_...

# App URL
NEXT_PUBLIC_URL=http://localhost:3000
```

Replace the values with your actual keys from Supabase and Stripe.

### 3.3 Update Stripe Price ID
In `app/settings/page.tsx`, line ~177, update:
```typescript
priceId: 'price_1234567890', // Replace with your actual Stripe Price ID
```

### 3.4 Run Development Server
```bash
npm run dev
```

Open http://localhost:3000

---

## Part 4: Deploy to Vercel

### 4.1 Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/jobreport-pro.git
git push -u origin main
```

### 4.2 Deploy to Vercel
1. Go to https://vercel.com
2. Sign in with GitHub
3. Click **New Project**
4. Import your repository
5. Configure project:
   - Framework Preset: Next.js
   - Root Directory: `./`
   - Build Command: `next build`
   - Output Directory: `.next`

### 4.3 Add Environment Variables in Vercel
1. In Vercel project settings, go to **Settings** > **Environment Variables**
2. Add all variables from `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `NEXT_PUBLIC_URL` (use your Vercel domain)

### 4.4 Deploy
1. Click **Deploy**
2. Wait for deployment to complete (~2 minutes)
3. Copy your deployment URL (e.g., `https://jobreport-pro.vercel.app`)

### 4.5 Update Stripe Webhook
1. Go back to Stripe Dashboard > **Developers** > **Webhooks**
2. Update your webhook endpoint URL to your Vercel domain:
   - `https://your-domain.vercel.app/api/stripe/webhook`

### 4.6 Update Supabase Redirect URLs
1. Go to Supabase Dashboard > **Authentication** > **URL Configuration**
2. Add your Vercel domain to:
   - Site URL: `https://your-domain.vercel.app`
   - Redirect URLs: `https://your-domain.vercel.app/**`

---

## Part 5: Testing

### 5.1 Test Authentication
1. Open your app
2. Click "Sign Up"
3. Create an account
4. Verify email (check inbox)
5. Log in

### 5.2 Test Document Creation
1. Click "+" button
2. Select "Invoice"
3. Fill in details
4. Add a photo
5. Click "Save"
6. Verify it appears in dashboard

### 5.3 Test PDF Generation
1. Open a saved document
2. Click "Download PDF"
3. Verify PDF opens correctly

### 5.4 Test Stripe (Optional)
1. Go to Settings
2. Click "Upgrade to Pro"
3. Use test card: `4242 4242 4242 4242`
4. Expiry: Any future date
5. CVC: Any 3 digits
6. Verify subscription activates

---

## Troubleshooting

### Issue: "Invalid API Key"
**Solution**: Double-check your environment variables in `.env.local` and Vercel settings.

### Issue: "Storage bucket not found"
**Solution**: Make sure you created all 3 storage buckets in Supabase with exact names.

### Issue: "RLS Policy error"
**Solution**: Run the storage policies SQL again from `002_storage_policies.sql`.

### Issue: "Stripe webhook failing"
**Solution**: Verify webhook URL is correct and includes `/api/stripe/webhook`.

### Issue: Photos not uploading
**Solution**: Check storage bucket permissions and RLS policies.

---

## Next Steps

1. Customize company profile in Settings
2. Create your first invoice
3. Share the app with your team
4. Set up custom domain (optional)
5. Configure email templates in Supabase

---

## Support

For issues, check:
- GitHub Issues
- Supabase Documentation: https://supabase.com/docs
- Stripe Documentation: https://stripe.com/docs
- Next.js Documentation: https://nextjs.org/docs

---

## Security Checklist

- ✅ RLS enabled on all tables
- ✅ Private storage buckets for sensitive data
- ✅ Environment variables not committed to Git
- ✅ Service role key only used server-side
- ✅ Stripe webhook signature verification
- ✅ HTTPS only in production

---

**Congratulations! Your JobReport Pro app is now live! 🎉**
