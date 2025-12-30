# Cloudflare Pages Deployment Fix

## Problem
Cloudflare Pages is trying to use `wrangler deploy` (for Workers) instead of deploying the static `out` directory.

## Solution

### Step 1: Check Cloudflare Pages Settings

1. Go to your Cloudflare Pages project dashboard
2. Click on **Settings** → **Builds & deployments**
3. Look for **"Deploy command"** or **"Custom deploy command"**
4. **DELETE or CLEAR any custom deploy command** - it should be empty
5. Cloudflare Pages should automatically deploy the output directory

### Step 2: Verify Build Configuration

Make sure your build settings are:
- **Framework preset:** `None` or `Next.js (Static HTML Export)`
- **Build command:** `npm run build`
- **Build output directory:** `out` (NOT `webapp/out`)
- **Root directory:** `webapp`

**Important:** Since you set root directory to `webapp`, the build output directory should be relative to that, so just `out` (not `webapp/out`).

### Step 3: Save and Redeploy

1. Save your settings
2. Go to **Deployments** tab
3. Click **Retry deployment** on the failed build, or push a new commit to trigger a new build

## Why This Happens

Cloudflare Pages sometimes auto-detects a custom deploy command when it shouldn't. For static sites, you should NOT have a deploy command - Cloudflare Pages automatically deploys whatever is in the output directory.

## Alternative: Use Netlify

If Cloudflare continues to have issues, Netlify is an excellent alternative:
- Same free tier benefits
- Easier configuration
- Similar performance

See `DEPLOYMENT-OPTIONS.md` for Netlify setup instructions.

