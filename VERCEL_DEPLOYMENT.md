# 🚀 Deploy Ucare Health to Vercel

## Quick Deployment

### 1. Prepare Repository
```bash
# Initialize git repository (if not already done)
git init
git add .
git commit -m "Initial commit"

# Push to GitHub/GitLab/Bitbucket
git remote add origin https://github.com/yourusername/ucare-health.git
git push -u origin main
```

### 2. Deploy to Vercel

#### Option A: Vercel CLI (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: ucare-health
# - Directory: ./
# - Override settings? No
```

#### Option B: Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your Git repository
4. Configure build settings (auto-detected)
5. Click "Deploy"

## Environment Variables Setup

### Required Variables (Set in Vercel Dashboard)

1. **Go to Project Settings** → Environment Variables
2. **Add these variables:**

```env
# App Configuration
VITE_APP_NAME=Ucare Health Tracker
VITE_APP_VERSION=1.0.0
VITE_APP_URL=https://your-app.vercel.app

# Firebase (Optional - for authentication)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# Analytics (Optional)
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

### Environment Setup Steps

1. **Copy `.env.example` to `.env.local`**
2. **Fill in your actual values**
3. **Add to Vercel Dashboard:**
   - Project Settings → Environment Variables
   - Add each variable for Production, Preview, and Development

## Build Configuration

The app is pre-configured with:
- ✅ `vercel.json` - Vercel deployment config
- ✅ `vite.config.js` - Optimized build settings
- ✅ PWA support with service worker
- ✅ SPA routing configuration

## Custom Domain (Optional)

### Add Custom Domain
1. **Go to Project Settings** → Domains
2. **Add your domain:** `yourdomain.com`
3. **Configure DNS:**
   ```
   Type: CNAME
   Name: www (or @)
   Value: cname.vercel-dns.com
   ```
4. **SSL automatically configured**

## Performance Optimizations

### Already Configured:
- ✅ **Code Splitting** - Vendor, MUI, Charts bundles
- ✅ **Asset Optimization** - Images, fonts compressed
- ✅ **Service Worker** - Offline caching
- ✅ **PWA Manifest** - App installation
- ✅ **Gzip Compression** - Automatic on Vercel

### Lighthouse Scores Expected:
- 🟢 **Performance:** 90+
- 🟢 **Accessibility:** 95+
- 🟢 **Best Practices:** 90+
- 🟢 **SEO:** 85+
- 🟢 **PWA:** 100

## Monitoring & Analytics

### Built-in Vercel Analytics
- **Real User Monitoring** - Automatic
- **Web Vitals** - Core performance metrics
- **Function Logs** - Error tracking

### Optional: Google Analytics
```javascript
// Add to environment variables
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

## Troubleshooting

### Build Failures
```bash
# Check build locally
npm run build

# Common issues:
# - Missing environment variables
# - Import path errors
# - TypeScript errors
```

### PWA Not Installing
- ✅ Check `manifest.json` is accessible
- ✅ Verify HTTPS (automatic on Vercel)
- ✅ Service worker registered correctly
- ✅ Icons are proper sizes

### Environment Variables Not Working
- ✅ Prefix with `VITE_` for client-side access
- ✅ Redeploy after adding variables
- ✅ Check variable names match exactly

## Security Considerations

### Automatic Security Features:
- ✅ **HTTPS Everywhere** - Automatic SSL
- ✅ **Security Headers** - HSTS, CSP configured
- ✅ **DDoS Protection** - Built-in
- ✅ **Edge Caching** - Global CDN

### Data Privacy:
- ✅ **Local Storage** - Health data stays on device
- ✅ **No Server Logs** - Personal data not logged
- ✅ **GDPR Compliant** - No tracking by default

## Post-Deployment Checklist

- [ ] **Test PWA Installation** on mobile
- [ ] **Verify Notifications** work
- [ ] **Check Offline Functionality**
- [ ] **Test All Features** in production
- [ ] **Monitor Performance** in Vercel dashboard
- [ ] **Set up Custom Domain** (optional)
- [ ] **Configure Analytics** (optional)

## Updating the App

```bash
# Make changes locally
git add .
git commit -m "Update feature"
git push

# Vercel automatically deploys on push
# Check deployment status at vercel.com
```

Your Ucare Health app will be live at: `https://your-app.vercel.app`
