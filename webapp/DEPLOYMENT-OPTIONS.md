# Deployment Options

Since this is a **static Next.js site**, you can deploy it to many different platforms. Here are the best options:

## 🚀 Recommended Options

### 1. **Netlify** (Easiest Alternative to Vercel)
**Best for:** Simple deployment, similar to Vercel

**Pros:**
- ✅ Free tier with generous limits
- ✅ Automatic deployments from GitHub
- ✅ Custom domains
- ✅ Built-in CDN
- ✅ No size limits for static sites

**Setup:**
1. Push to GitHub
2. Go to [netlify.com](https://netlify.com) and sign up
3. Click "Add new site" → "Import an existing project"
4. Connect your GitHub repo
5. Configure:
   - **Base directory:** `webapp`
   - **Build command:** `npm run build`
   - **Publish directory:** `webapp/out` (Next.js static export)
6. Deploy!

**Note:** After enabling static export, the build output goes to `out/` directory.

---

### 2. **Cloudflare Pages** (Fastest & Most Generous Free Tier)
**Best for:** Maximum performance and free tier limits

**Pros:**
- ✅ Completely free (no credit card needed)
- ✅ Unlimited bandwidth
- ✅ Fast global CDN
- ✅ Automatic deployments from GitHub
- ✅ Custom domains
- ✅ No build time limits

**Setup:**
1. Push to GitHub
2. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → Pages
3. Click "Create a project" → "Connect to Git"
4. Select your repository
5. Configure:
   - **Framework preset:** Next.js (Static HTML Export) or "None" if not available
   - **Build command:** `npm run build`
   - **Build output directory:** `out` (NOT `webapp/out` - this is relative to root directory)
   - **Root directory:** `webapp`
   - **Environment variables:** None needed
6. **IMPORTANT:** Make sure there is NO custom deploy command set. Cloudflare Pages should automatically deploy the `out` directory.
7. Deploy!

**Troubleshooting:**
- If you see "Missing entry-point to Worker script" error, go to your project settings → Builds & deployments → and make sure there's NO custom deploy command
- The build output directory should be `out` (relative to the root directory, which is `webapp`)
- If using root directory `webapp`, the output path is automatically `webapp/out`, so set output directory to just `out`

---

### 3. **GitHub Pages** (Completely Free)
**Best for:** Simple static hosting, already using GitHub

**Pros:**
- ✅ 100% free
- ✅ Integrated with GitHub
- ✅ Custom domains supported
- ✅ No account limits

**Cons:**
- ⚠️ Requires GitHub Actions for automatic builds
- ⚠️ Slightly more setup

**Setup:**
1. Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: |
          cd webapp
          npm install
      - name: Build
        run: |
          cd webapp
          npm run build
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./webapp/out
```

2. In GitHub repo settings → Pages:
   - Source: Deploy from a branch
   - Branch: `gh-pages` / `/ (root)`

---

### 4. **Render** (Simple & Reliable)
**Best for:** Easy deployment with good free tier

**Pros:**
- ✅ Free tier available
- ✅ Automatic deployments
- ✅ Custom domains
- ✅ Simple interface

**Setup:**
1. Push to GitHub
2. Go to [render.com](https://render.com)
3. Click "New" → "Static Site"
4. Connect your GitHub repo
5. Configure:
   - **Name:** Your site name
   - **Root Directory:** `webapp`
   - **Build Command:** `npm run build`
   - **Publish Directory:** `out`
6. Deploy!

---

### 5. **AWS S3 + CloudFront** (Most Scalable)
**Best for:** Maximum control and scalability

**Pros:**
- ✅ Highly scalable
- ✅ Very fast with CloudFront
- ✅ Pay only for what you use
- ✅ Enterprise-grade

**Cons:**
- ⚠️ More complex setup
- ⚠️ Requires AWS account

**Setup:**
1. Build the site: `cd webapp && npm run build`
2. Create S3 bucket (enable static website hosting)
3. Upload `out/` directory contents to S3
4. Optionally set up CloudFront for CDN
5. Configure custom domain

**Automation:** Use AWS CLI or GitHub Actions

---

### 6. **Surge.sh** (Quick & Simple)
**Best for:** Quick deployments without Git integration

**Pros:**
- ✅ Very simple
- ✅ Free tier
- ✅ Instant deployment
- ✅ Custom domains

**Setup:**
```bash
cd webapp
npm run build
npx surge out/ your-site-name.surge.sh
```

---

### 7. **Firebase Hosting** (Google's Platform)
**Best for:** Integration with other Google services

**Pros:**
- ✅ Free tier
- ✅ Fast CDN
- ✅ Easy custom domains
- ✅ Good for Google ecosystem

**Setup:**
1. Install Firebase CLI: `npm i -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `cd webapp && firebase init hosting`
4. Build: `npm run build`
5. Deploy: `firebase deploy`

---

## 📊 Comparison Table

| Platform | Free Tier | Ease of Setup | Performance | Best For |
|----------|-----------|---------------|-------------|----------|
| **Netlify** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Easiest alternative to Vercel |
| **Cloudflare Pages** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Best free tier & speed |
| **GitHub Pages** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | Already using GitHub |
| **Render** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Simple & reliable |
| **Vercel** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Original choice |
| **AWS S3** | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | Maximum control |
| **Surge** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | Quick deployments |

## 🎯 My Recommendation

**For your use case (simple static site):**
1. **Cloudflare Pages** - Best free tier, fastest, no limits
2. **Netlify** - Easiest if you want something similar to Vercel
3. **GitHub Pages** - If you want everything in one place

All three are excellent choices and will work perfectly for your static site!

## 🔧 Before Deploying

Make sure you've enabled static export in `next.config.js`:
```js
output: 'export',
```

Then build locally to test:
```bash
cd webapp
npm run build
```

The static files will be in `webapp/out/` directory.

