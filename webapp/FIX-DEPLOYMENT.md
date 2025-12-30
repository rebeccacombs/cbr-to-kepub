# Fix: Configuration Mismatch

## The Problem
Your deployment is using old configuration settings that don't match your current project settings.

## The Solution

### Step 1: Redeploy with New Settings

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your project**: `cbr-to-kepub`
3. **Go to Deployments tab**
4. **Find the latest deployment** (should show the warning about configuration mismatch)
5. **Click the "..." menu** (three dots) on that deployment
6. **Click "Redeploy"**
7. **IMPORTANT**: Make sure "Use existing Build Cache" is **UNCHECKED** (or just leave defaults)
8. **Click "Redeploy"**

### Step 2: Verify Settings After Redeploy

After redeployment completes, verify:
- ✅ Root Directory: `webapp`
- ✅ Framework Preset: `Next.js`
- ✅ Build Command: `npm run build` (or auto-detected)
- ✅ Output Directory: `.next` (auto-detected)

### Why This Happens

When you change project settings (like Root Directory), existing deployments still use the old configuration. You need to create a new deployment with the updated settings.

### After Redeploy

Your app should be accessible at:
- https://cbr-to-kepub.vercel.app/

The new deployment will use your current project settings (Root Directory: `webapp`, Framework: Next.js).

