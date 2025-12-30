# Vercel 404 Debugging

## Current Status
- ✅ Build succeeds locally
- ✅ Build succeeds on Vercel
- ❌ Site returns 404 on Vercel
- ❌ API route also returns 404

## Possible Causes

### 1. Vercel Not Detecting Next.js App Router
Even though Framework Preset is set to Next.js, Vercel might not be recognizing the App Router structure.

### 2. Deployment Configuration Issue
The deployment might be using cached/old configuration.

## Solutions to Try

### Option 1: Delete and Recreate Project
1. Go to Vercel Dashboard
2. Delete the project `cbr-to-kepub`
3. Create a new project
4. Import the same GitHub repo
5. Set Root Directory to `webapp` immediately
6. Deploy

### Option 2: Check Deployment Logs
1. Go to latest deployment
2. Check "Build Logs" tab
3. Look for any warnings about routing or framework detection
4. Check "Functions" tab - should show `/api/convert`
5. Check "Routes" tab - should show routes

### Option 3: Verify File Structure in Deployment
In Vercel dashboard → Deployments → latest → "Source" tab:
- Verify `app/page.tsx` exists
- Verify `app/layout.tsx` exists
- Verify `package.json` exists

### Option 4: Contact Vercel Support
If nothing works, this might be a Vercel platform issue. Contact support with:
- Project name: `cbr-to-kepub`
- Deployment URL: `https://cbr-to-kepub.vercel.app/`
- Error: 404 NOT_FOUND
- Build succeeds but site doesn't serve

## Quick Test
Try accessing these URLs to see what works:
- `https://cbr-to-kepub.vercel.app/` - Should show homepage (currently 404)
- `https://cbr-to-kepub.vercel.app/api/convert` - Should be API endpoint (currently 404)

If both return 404, Vercel isn't recognizing the Next.js app at all.

