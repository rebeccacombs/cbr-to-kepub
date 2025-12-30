# Troubleshooting Vercel 404 Error

## Current Issue
The build succeeds but the site returns 404.

## Checklist

### ✅ Already Done
- [x] Root directory set to `webapp` in Vercel dashboard
- [x] Build succeeds (no errors)
- [x] Public directory created
- [x] All files committed and pushed

### 🔍 Things to Check in Vercel Dashboard

1. **Framework Preset**
   - Go to Settings → General
   - Verify "Framework Preset" is set to **Next.js**
   - If not, change it to Next.js

2. **Build & Development Settings**
   - Go to Settings → General
   - Check "Build Command": Should be `npm run build` (or empty for auto-detect)
   - Check "Output Directory": Should be empty (Vercel auto-detects `.next`)
   - Check "Install Command": Should be `npm install` (or empty for auto-detect)

3. **Deployment Settings**
   - Go to Settings → General
   - Check "Node.js Version": Should be 18.x or 20.x
   - Check "Root Directory": Should be `webapp`

4. **Check Latest Deployment**
   - Go to Deployments tab
   - Click on the latest deployment
   - Check the "Functions" tab - you should see `/api/convert`
   - Check the "Routes" tab - you should see routes configured

### 🛠️ Try These Fixes

1. **Redeploy with Clean Build**
   - Go to Deployments
   - Click "..." on latest deployment
   - Click "Redeploy"
   - Check "Use existing Build Cache" = OFF
   - Click "Redeploy"

2. **Verify Project Structure**
   - In Vercel dashboard → Settings → General
   - Root Directory should be: `webapp`
   - Framework Preset should be: `Next.js`

3. **Check Build Logs**
   - Look for any warnings about routing
   - Verify the build output shows pages being generated

### 📝 If Still Not Working

The issue might be that Vercel isn't recognizing the App Router structure. Try:

1. **Force Framework Detection**
   - In Vercel dashboard, go to Settings → General
   - Change Framework Preset to "Other"
   - Save
   - Change it back to "Next.js"
   - Save
   - Redeploy

2. **Check if it's a routing issue**
   - Try accessing: `https://cbr-to-kepub.vercel.app/api/convert`
   - If that works but `/` doesn't, it's a routing issue

3. **Contact Vercel Support**
   - If nothing works, the deployment might need manual configuration
   - Vercel support can check the deployment configuration

## Expected Behavior

After successful deployment:
- `https://cbr-to-kepub.vercel.app/` should show the upload page
- `https://cbr-to-kepub.vercel.app/api/convert` should be a POST endpoint

