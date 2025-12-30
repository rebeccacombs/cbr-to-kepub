# Fixing Vercel 404 Error

The 404 error is happening because Vercel doesn't know that your Next.js app is in the `webapp` subdirectory.

## Solution: Configure Root Directory in Vercel Dashboard

Since the repository root contains both the Python script and the webapp, you need to tell Vercel where the Next.js app is:

### Steps:

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your project**: `cbr-to-kepub`
3. **Go to Settings** → **General**
4. **Find "Root Directory"** section
5. **Click "Edit"**
6. **Set Root Directory to**: `webapp`
7. **Click "Save"**
8. **Redeploy**: Go to Deployments tab and click "Redeploy" on the latest deployment

### Alternative: Delete root vercel.json

If you set the root directory in the dashboard, you can delete the root-level `vercel.json` file (keep the one in `webapp/`).

## Why This Happens

- Your repo structure: `repo-root/` contains `webapp/` (Next.js app)
- Vercel by default looks for Next.js at the repo root
- Since your Next.js app is in `webapp/`, Vercel can't find it

## After Fixing

Once you set the root directory to `webapp` in Vercel:
- Vercel will look for `package.json` in `webapp/`
- It will run `npm install` and `npm run build` in `webapp/`
- The app should deploy successfully

Your app should then be accessible at: https://cbr-to-kepub.vercel.app/

