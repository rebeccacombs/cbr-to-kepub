# Cloudflare Pages Deployment Fix

## Problem
Cloudflare Pages is trying to use `npx wrangler deploy` (for Workers) instead of deploying the static `out` directory.

**Error you're seeing:**
```
Executing user deploy command: npx wrangler deploy
✘ [ERROR] Missing entry-point to Worker script or to assets directory
```

## Solution: Remove Custom Deploy Command

### Step 1: Go to Cloudflare Pages Dashboard

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Click on **Pages** in the left sidebar
3. Click on your project name

### Step 2: Set Correct Deploy Command

1. Click on **Settings** tab (at the top)
2. Scroll down to **Builds & deployments** section
3. Look for **"Deploy command"** field
4. Set it to: `npm run deploy`
5. Click **Save** at the bottom

**Note:** The deploy command uses `wrangler pages deploy` which is the correct command for Cloudflare Pages static sites.

### Step 3: Verify Build Settings

While you're in Settings, make sure:
- **Framework preset:** `None` (or leave blank)
- **Build command:** `npm run build`
- **Build output directory:** `out` (NOT `webapp/out`)
- **Root directory:** `webapp`
- **Deploy command:** `npm run deploy` (uses wrangler pages deploy)

### Step 4: Redeploy

1. Go to **Deployments** tab
2. Click the **...** menu on the failed deployment
3. Click **Retry deployment**

OR just push a new commit to trigger a fresh build.

## Why This Happens

Cloudflare Pages needs the correct deploy command. The default `npx wrangler deploy` is for Workers, not Pages. Use `npm run deploy` which runs `wrangler pages deploy` - the correct command for static sites.

## Still Not Working?

### Option 1: Delete and Recreate Project

If removing the deploy command doesn't work:
1. Create a new Cloudflare Pages project
2. Connect the same GitHub repo
3. **Make sure to leave "Deploy command" empty** when setting it up
4. Set build output directory to `out`
5. Set root directory to `webapp`

### Option 2: Use Netlify Instead (Easier!)

Netlify is much simpler and has the same free tier benefits:
1. Go to [netlify.com](https://netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect your GitHub repo
4. Configure:
   - **Base directory:** `webapp`
   - **Build command:** `npm run build`
   - **Publish directory:** `out`
5. Deploy!

No deploy command needed - it just works! See `DEPLOYMENT-OPTIONS.md` for details.

