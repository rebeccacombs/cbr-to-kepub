# Vercel Configuration Required

## ⚠️ IMPORTANT: Set Root Directory in Vercel Dashboard

Your Next.js app is in the `webapp/` subdirectory, but Vercel is trying to build from the repository root.

### Fix Steps:

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your project**: `cbr-to-kepub`
3. **Go to Settings** → **General** tab
4. **Scroll to "Root Directory"** section
5. **Click "Edit"** button
6. **Enter**: `webapp`
7. **Click "Save"**
8. **Redeploy**: 
   - Go to **Deployments** tab
   - Click the **"..."** menu on the latest deployment
   - Click **"Redeploy"**

### What This Does:

- Tells Vercel to look for `package.json` in `webapp/` instead of root
- Vercel will run `npm install` and `npm run build` in `webapp/`
- Your app will deploy successfully

### After Setting Root Directory:

Vercel will automatically:
- ✅ Find `package.json` in `webapp/`
- ✅ Install dependencies from `webapp/package.json`
- ✅ Build the Next.js app
- ✅ Deploy successfully

Your app will be live at: https://cbr-to-kepub.vercel.app/

---

**Note**: The root-level `vercel.json` has been removed. The `webapp/vercel.json` contains the function timeout settings and will work once the root directory is set.

