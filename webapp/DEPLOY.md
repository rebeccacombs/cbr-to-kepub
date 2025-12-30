# Quick Deploy Guide

## Deploy to Vercel in 3 Steps

### Step 1: Push to GitHub
```bash
cd webapp
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

### Step 2: Import to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js

### Step 3: Configure & Deploy
- **Root Directory**: Set to `webapp` (if repo root is parent directory)
- **Framework Preset**: Next.js (auto-detected)
- Click "Deploy"

That's it! Your app will be live in ~2 minutes.

## Environment Variables
None required - this is a static site.

## Post-Deployment
- Share the Vercel URL with your friend
- They can download the Python script and run it locally
- No server-side processing - all conversion happens on their computer

## Troubleshooting

### Build Fails
- Make sure `package.json` is in the `webapp` directory
- Check that Node.js version is 18+ in Vercel settings

### 404 Errors
- Ensure **Root Directory** is set to `webapp` in Vercel project settings
- Redeploy after changing root directory

### Python Script Not Downloading
- Verify `public/cbr_to_kepub.py` exists
- Check that the file is committed to Git
