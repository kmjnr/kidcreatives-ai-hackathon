# Netlify Deployment Plan for KidCreatives AI

**Date**: January 31, 2026  
**Objective**: Deploy KidCreatives AI to Netlify with secure environment variable management  
**Estimated Time**: 15 minutes

---

## Overview

Deploy the React + Vite application to Netlify with:
- Secure environment variables (API keys)
- Automatic deployments from GitHub
- Custom domain support (optional)
- Production-ready configuration

---

## Prerequisites

### Required Accounts
- ✅ GitHub account (already have - repository exists)
- ✅ Netlify account (free tier sufficient)
- ✅ Supabase project (already configured)
- ✅ Google Gemini API key (already have)

### Required Information
You'll need these values ready:
1. **Gemini API Key**: `VITE_GEMINI_API_KEY`
2. **Supabase URL**: `VITE_SUPABASE_URL`
3. **Supabase Anon Key**: `VITE_SUPABASE_ANON_KEY`

---

## Deployment Steps

### Step 1: Create Netlify Configuration File
**File**: `kidcreatives-ai/netlify.toml` (NEW)

**Purpose**: Configure build settings and redirects for SPA routing

**Content**:
```toml
[build]
  # Build command
  command = "npm run build"
  
  # Output directory (Vite default)
  publish = "dist"
  
  # Node version
  [build.environment]
    NODE_VERSION = "20"

# SPA redirect - all routes go to index.html
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# Security headers
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"

# Cache static assets
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

**Why needed**:
- Tells Netlify how to build the app
- Handles React Router client-side routing
- Adds security headers
- Optimizes caching for static assets

---

### Step 2: Update .gitignore (Verify)
**File**: `kidcreatives-ai/.gitignore`

**Ensure these are ignored**:
```
# Environment variables (CRITICAL - never commit)
.env
.env.local
.env.production
.env.*.local

# Build output
dist
dist-ssr
*.local

# Dependencies
node_modules
```

**Verification**: Check that `.env` files are NOT in git
```bash
git ls-files | grep "\.env"
# Should return nothing
```

---

### Step 3: Clean Up .env.example
**File**: `kidcreatives-ai/.env.example`

**Current Issue**: Duplicate Supabase entries

**Fix**:
```env
# Gemini API
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Development (optional)
VITE_DEV_MODE=false

# Feature Flags (optional)
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_RATE_LIMITING=true
```

**Why**: Remove duplicate Supabase entries, set production defaults

---

### Step 4: Create _redirects File (Backup)
**File**: `kidcreatives-ai/public/_redirects` (NEW)

**Purpose**: Fallback for SPA routing if netlify.toml doesn't work

**Content**:
```
/*    /index.html   200
```

**Why**: Ensures React Router works even if netlify.toml is missed

---

### Step 5: Verify Build Locally
**Commands**:
```bash
cd kidcreatives-ai

# Install dependencies (if needed)
npm install

# Build for production
npm run build

# Verify dist folder created
ls -la dist/

# Test production build locally
npm run preview
```

**Expected Output**:
- `dist/` folder created
- `dist/index.html` exists
- `dist/assets/` contains JS and CSS
- Preview server runs without errors

---

### Step 6: Deploy to Netlify

#### Option A: Netlify UI (Recommended for First Deploy)

1. **Go to Netlify Dashboard**
   - Visit: https://app.netlify.com/
   - Sign up or log in

2. **Import from GitHub**
   - Click "Add new site" → "Import an existing project"
   - Choose "Deploy with GitHub"
   - Authorize Netlify to access your GitHub
   - Select repository: `kmjnr/kidcreatives-ai-hackathon`

3. **Configure Build Settings**
   - **Base directory**: `kidcreatives-ai`
   - **Build command**: `npm run build`
   - **Publish directory**: `kidcreatives-ai/dist`
   - **Node version**: 20 (set in netlify.toml)

4. **Add Environment Variables** (CRITICAL)
   - Click "Show advanced" → "New variable"
   - Add each variable:

   ```
   Key: VITE_GEMINI_API_KEY
   Value: [your actual Gemini API key]

   Key: VITE_SUPABASE_URL
   Value: [your actual Supabase URL]

   Key: VITE_SUPABASE_ANON_KEY
   Value: [your actual Supabase anon key]
   ```

   **⚠️ IMPORTANT**: 
   - Use actual values, not placeholders
   - Double-check for typos
   - These are build-time variables (Vite embeds them)

5. **Deploy**
   - Click "Deploy site"
   - Wait for build to complete (~2-3 minutes)
   - Check build logs for errors

#### Option B: Netlify CLI (Alternative)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize site
cd kidcreatives-ai
netlify init

# Follow prompts:
# - Create & configure a new site
# - Build command: npm run build
# - Publish directory: dist

# Set environment variables
netlify env:set VITE_GEMINI_API_KEY "your_key_here"
netlify env:set VITE_SUPABASE_URL "your_url_here"
netlify env:set VITE_SUPABASE_ANON_KEY "your_key_here"

# Deploy
netlify deploy --prod
```

---

### Step 7: Configure Supabase for Netlify Domain

**Why**: Supabase needs to allow your Netlify domain for authentication

1. **Get Netlify URL**
   - After deployment, note your URL: `https://your-site-name.netlify.app`

2. **Update Supabase Settings**
   - Go to Supabase Dashboard
   - Navigate to: Authentication → URL Configuration
   - Add to **Site URL**: `https://your-site-name.netlify.app`
   - Add to **Redirect URLs**: 
     - `https://your-site-name.netlify.app`
     - `https://your-site-name.netlify.app/**`

3. **Save Changes**

---

### Step 8: Test Deployment

**Test Checklist**:
- [ ] Site loads at Netlify URL
- [ ] Landing page displays correctly
- [ ] Images load (certificate, prompt card, etc.)
- [ ] "Start Creating" button works
- [ ] Username modal appears
- [ ] Can enter username and access app
- [ ] All 5 phases work
- [ ] Image upload works (Phase 1)
- [ ] AI generation works (Phase 3)
- [ ] Gallery saves work
- [ ] No console errors
- [ ] Mobile responsive

**If Issues**:
- Check Netlify build logs
- Verify environment variables are set
- Check browser console for errors
- Verify Supabase URL configuration

---

### Step 9: Custom Domain (Optional)

**If you have a custom domain**:

1. **In Netlify Dashboard**
   - Go to: Site settings → Domain management
   - Click "Add custom domain"
   - Enter your domain (e.g., `kidcreatives.ai`)

2. **Configure DNS**
   - Add DNS records as shown by Netlify
   - Wait for DNS propagation (5-60 minutes)

3. **Enable HTTPS**
   - Netlify auto-provisions SSL certificate
   - Wait for certificate to be issued

4. **Update Supabase**
   - Add custom domain to Supabase redirect URLs

---

## Environment Variables Reference

### Required Variables (Must Set)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_GEMINI_API_KEY` | Google Gemini API key | `AIzaSy...` |
| `VITE_SUPABASE_URL` | Supabase project URL | `https://abc123.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGc...` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_DEV_MODE` | Development mode flag | `false` |
| `VITE_ENABLE_ANALYTICS` | Enable analytics | `false` |
| `VITE_ENABLE_RATE_LIMITING` | Enable rate limiting | `true` |

---

## Security Considerations

### ✅ Safe to Expose (Public)
- `VITE_SUPABASE_URL` - Public URL
- `VITE_SUPABASE_ANON_KEY` - Public anonymous key (protected by RLS)

### ⚠️ Keep Secure (But Embedded in Build)
- `VITE_GEMINI_API_KEY` - API key with usage limits

**Note**: Vite embeds environment variables in the build. They're visible in browser but:
- Supabase anon key is safe (protected by Row Level Security)
- Gemini API key should have usage limits and domain restrictions

### Recommended: Add API Key Restrictions

**For Gemini API Key**:
1. Go to Google Cloud Console
2. Find your API key
3. Add restrictions:
   - **Application restrictions**: HTTP referrers
   - **Website restrictions**: 
     - `https://your-site-name.netlify.app/*`
     - `https://your-custom-domain.com/*` (if applicable)

---

## Continuous Deployment

### Automatic Deployments
Once connected to GitHub, Netlify automatically:
- Deploys on every push to `master` branch
- Creates preview deployments for pull requests
- Shows build status in GitHub

### Manual Deployments
```bash
# Deploy from CLI
netlify deploy --prod

# Or trigger from Netlify UI
# Site settings → Deploys → Trigger deploy
```

---

## Troubleshooting

### Build Fails

**Check**:
1. Build logs in Netlify dashboard
2. Environment variables are set correctly
3. Node version matches (20)
4. All dependencies in package.json

**Common Issues**:
- Missing environment variables
- TypeScript errors
- Node version mismatch

### Site Loads But Features Don't Work

**Check**:
1. Browser console for errors
2. Network tab for failed API calls
3. Environment variables in build logs (redacted)
4. Supabase URL configuration

### Authentication Doesn't Work

**Check**:
1. Supabase redirect URLs include Netlify domain
2. Anonymous auth is enabled in Supabase
3. Browser console for auth errors

### Images Don't Load

**Check**:
1. Images are in `public/Images/` folder
2. Image paths use `/Images/` (absolute)
3. Build includes public folder contents

---

## Post-Deployment Checklist

- [ ] Site accessible at Netlify URL
- [ ] All environment variables set
- [ ] Supabase configured with Netlify domain
- [ ] Full user flow tested
- [ ] Mobile responsive verified
- [ ] No console errors
- [ ] Build time < 5 minutes
- [ ] SSL certificate active (HTTPS)
- [ ] Custom domain configured (if applicable)
- [ ] Gemini API key restricted to domain

---

## Files to Create/Modify

### New Files
1. `kidcreatives-ai/netlify.toml` - Netlify configuration
2. `kidcreatives-ai/public/_redirects` - SPA routing fallback

### Modified Files
1. `kidcreatives-ai/.env.example` - Clean up duplicates

### No Changes Needed
- Source code (already production-ready)
- Build scripts (already correct)
- Dependencies (all compatible)

---

## Estimated Costs

### Netlify
- **Free Tier**: 
  - 100 GB bandwidth/month
  - 300 build minutes/month
  - Automatic HTTPS
  - **Cost**: $0

**Sufficient for**: Hackathon demo and moderate traffic

### Supabase
- **Free Tier**:
  - 500 MB database
  - 1 GB file storage
  - 50,000 monthly active users
  - **Cost**: $0

**Sufficient for**: Hackathon demo and testing

### Google Gemini API
- **Free Tier**:
  - 15 requests per minute
  - 1,500 requests per day
  - **Cost**: $0 (with limits)

**Sufficient for**: Demo and light usage

**Total Cost**: $0 for hackathon demo

---

## Timeline

| Step | Duration | Total |
|------|----------|-------|
| Create netlify.toml | 2 min | 2 min |
| Clean .env.example | 1 min | 3 min |
| Create _redirects | 1 min | 4 min |
| Verify build locally | 2 min | 6 min |
| Set up Netlify account | 2 min | 8 min |
| Configure deployment | 3 min | 11 min |
| Add environment variables | 2 min | 13 min |
| Configure Supabase | 1 min | 14 min |
| Test deployment | 3 min | 17 min |

**Total**: ~17 minutes (first time)

**Subsequent deploys**: Automatic (< 3 minutes)

---

## Success Criteria

- ✅ Site deployed and accessible
- ✅ All features working
- ✅ Environment variables secure
- ✅ Automatic deployments enabled
- ✅ HTTPS enabled
- ✅ Mobile responsive
- ✅ No console errors
- ✅ Fast load times (< 3 seconds)

---

## Next Steps After Deployment

1. **Test thoroughly** - Complete user flow
2. **Share URL** - With hackathon judges
3. **Monitor** - Check Netlify analytics
4. **Update README** - Add live demo link
5. **Record demo** - Using live site

---

**Status**: Ready for implementation  
**Risk Level**: Low (can redeploy easily)  
**Reversibility**: High (can rollback or delete)  
**Estimated Success Rate**: 95%+
