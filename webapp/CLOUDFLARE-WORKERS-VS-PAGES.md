# Cloudflare Workers vs Pages - Fix Guide

## Problem
Your site is deployed as a **Cloudflare Worker** (`workers.dev`) instead of a **Cloudflare Page** (`pages.dev`), showing "Hello world" instead of your actual site.

## Solution: Create a Cloudflare Pages Project

### Step 1: Delete the Worker Project (if needed)
1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Click **Workers & Pages** in the left sidebar
3. If you see a Worker named `cbr-to-kepub`, you can delete it (or just ignore it)

### Step 2: Create a NEW Pages Project
1. Still in **Workers & Pages**, click **Create application**
2. Select **Pages** tab (NOT Workers!)
3. Click **Connect to Git**
4. Select your GitHub repository (`cbr-to-kepub`)
5. Click **Begin setup**

### Step 3: Configure the Pages Project
1. **Project name:** `cbr-to-kepub` (or whatever you want)
2. **Production branch:** `main` (or `master`)
3. **Framework preset:** `None` (or leave blank)
4. **Build command:** `npm run build`
5. **Build output directory:** `out`
6. **Root directory:** `webapp`
7. **Deploy command:** `npm run deploy`
8. Click **Save and Deploy**

### Step 4: Wait for Deployment
- The build will start automatically
- Wait for it to complete (usually 1-2 minutes)
- You'll get a URL like: `https://cbr-to-kepub.pages.dev`

## Important Differences

- **Workers** (`workers.dev`) = Serverless functions, not for static sites
- **Pages** (`pages.dev`) = Static site hosting, what you need!

## Your Site Should Be At

After creating the Pages project, your site will be at:
- `https://cbr-to-kepub.pages.dev` (or similar)
- NOT `https://cbr-to-kepub.rcombs-192.workers.dev`

## If You Still See "Hello world"

1. Make sure you created a **Pages** project, not a Worker
2. Check that the build output directory is set to `out`
3. Verify the build completed successfully
4. Check the Deployments tab to see if the build succeeded

