# JobReport Pro - Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Environment Variables
- [ ] Create `.env.local` file with all required variables
- [ ] Add `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Add `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Add `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Add `STRIPE_SECRET_KEY` (optional)
- [ ] Add `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (optional)
- [ ] Add `STRIPE_WEBHOOK_SECRET` (optional)
- [ ] Add `NEXT_PUBLIC_URL`

### 2. Supabase Setup
- [ ] Create Supabase project
- [ ] Run migration: `001_initial_schema.sql`
- [ ] Run migration: `002_storage_policies.sql`
- [ ] Create storage bucket: `company-logos` (public)
- [ ] Create storage bucket: `document-photos` (private)
- [ ] Create storage bucket: `generated-pdfs` (private)
- [ ] Enable Google OAuth (optional)
- [ ] Copy API keys to `.env.local`
- [ ] Test database connection

### 3. Stripe Setup (Optional)
- [ ] Create Stripe account
- [ ] Create product "JobReport Pro"
- [ ] Set pricing ($9.99/month)
- [ ] Copy Price ID to `app/settings/page.tsx` line 177
- [ ] Copy API keys to `.env.local`
- [ ] Configure webhook endpoint (after deployment)

### 4. Local Testing
- [ ] Run `npm install`
- [ ] Run `npm run dev`
- [ ] Test signup/login
- [ ] Test document creation (all 10 types)
- [ ] Test photo upload
- [ ] Test PDF generation
- [ ] Test settings page
- [ ] Test offline functionality

### 5. Code Review
- [ ] Review all environment variables
- [ ] Check Stripe Price ID is updated
- [ ] Verify Supabase URLs are correct
- [ ] Test error handling
- [ ] Check mobile responsiveness

---

## 🚀 Deployment Steps

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit: JobReport Pro"
git branch -M main
git remote add origin https://github.com/yourusername/jobreport-pro.git
git push -u origin main
```

### Step 2: Deploy to Vercel
1. Go to https://vercel.com
2. Sign in with GitHub
3. Click "New Project"
4. Import `jobreport-pro` repository
5. Configure:
   - Framework: Next.js
   - Build Command: `next build`
   - Output Directory: `.next`
6. Click "Deploy"

### Step 3: Add Environment Variables to Vercel
In Vercel Dashboard > Settings > Environment Variables, add:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_URL` (your Vercel domain)

### Step 4: Update Stripe Webhook
1. Go to Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://your-domain.vercel.app/api/stripe/webhook`
3. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
4. Copy signing secret to Vercel environment variables

### Step 5: Update Supabase URLs
1. Go to Supabase Dashboard > Authentication > URL Configuration
2. Add Site URL: `https://your-domain.vercel.app`
3. Add Redirect URLs: `https://your-domain.vercel.app/**`

### Step 6: Verify Deployment
- [ ] Visit deployed app
- [ ] Test signup/login
- [ ] Create test document
- [ ] Download PDF
- [ ] Test payment flow (use Stripe test card: 4242 4242 4242 4242)

---

## 📱 PWA Installation Testing

### iOS (Safari)
1. Open app in Safari
2. Tap Share button
3. Tap "Add to Home Screen"
4. Verify icon and name
5. Launch from home screen
6. Test offline mode

### Android (Chrome)
1. Open app in Chrome
2. Tap menu (3 dots)
3. Tap "Install app" or "Add to Home Screen"
4. Verify icon and name
5. Launch from home screen
6. Test offline mode

---

## 🔒 Security Verification

- [ ] RLS enabled on all Supabase tables
- [ ] Storage buckets have proper policies
- [ ] Environment variables not in Git
- [ ] HTTPS only in production
- [ ] Stripe webhook signature verified
- [ ] Service role key only used server-side

---

## 🧪 Post-Deployment Testing

### Authentication
- [ ] Email/password signup
- [ ] Email verification
- [ ] Login
- [ ] Logout
- [ ] Google OAuth (if enabled)
- [ ] Password reset

### Documents
- [ ] Create invoice
- [ ] Create receipt
- [ ] Create work order
- [ ] Create time sheet
- [ ] Create material log
- [ ] Create daily job report
- [ ] Create estimate
- [ ] Create expense log
- [ ] Create warranty
- [ ] Create note

### Features
- [ ] Photo upload and compression
- [ ] PDF generation and download
- [ ] Document list and search
- [ ] Document editing
- [ ] Document deletion
- [ ] Settings save
- [ ] Profile update
- [ ] Logo upload

### Subscription (if Stripe enabled)
- [ ] View free plan limits
- [ ] Upgrade to Pro
- [ ] Payment processing
- [ ] Subscription activation
- [ ] Customer portal access
- [ ] Subscription cancellation

### Mobile
- [ ] Responsive on iPhone
- [ ] Responsive on Android
- [ ] PWA installation
- [ ] Offline document creation
- [ ] Sync when online
- [ ] Camera integration

---

## 📊 Monitoring

### Vercel
- Monitor in Vercel Dashboard > Analytics
- Check deployment logs
- Monitor function execution times

### Supabase
- Monitor database usage
- Check storage usage
- Review auth logs
- Monitor API requests

### Stripe
- Monitor payment events
- Check webhook logs
- Review failed payments

---

## 🐛 Common Issues & Solutions

### Issue: "Module not found" errors
**Solution**: Run `npm install` and restart dev server

### Issue: Photos not uploading
**Solution**: Verify storage buckets exist and have correct RLS policies

### Issue: PDF not generating
**Solution**: Check console for errors, verify jsPDF is installed

### Issue: Stripe not working
**Solution**: Verify Price ID is updated in code, check webhook URL

### Issue: Auth not working
**Solution**: Verify Supabase redirect URLs include your domain

---

## 📈 Next Steps After Deployment

1. **Custom Domain** (Optional)
   - Add custom domain in Vercel
   - Update DNS records
   - Update environment variables

2. **Email Templates**
   - Customize in Supabase Dashboard
   - Add company branding

3. **Marketing**
   - Create landing page
   - Add SEO metadata
   - Set up analytics

4. **Monitoring**
   - Set up error tracking (Sentry)
   - Configure uptime monitoring
   - Set up alerts

5. **Backup**
   - Set up Supabase backups
   - Export data regularly

---

## 🎉 Congratulations!

Your JobReport Pro app is now live and ready to help contractors create professional documents!

For support, refer to:
- README.md
- SETUP_GUIDE.md
- Supabase Documentation
- Stripe Documentation
- Next.js Documentation
