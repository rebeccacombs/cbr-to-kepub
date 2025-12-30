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
None required for basic functionality.

## Post-Deployment
- Share the Vercel URL with your friend
- They can drag & drop CBR files and download KEPUB files
- No installation needed!

## Troubleshooting

### Build Fails
- Make sure `package.json` is in the `webapp` directory
- Check that Node.js version is 18+ in Vercel settings

### Large Files Timeout
- Vercel Hobby plan: 5-minute limit
- Upgrade to Pro for 15-minute limit
- Or use Python script locally for very large files

### RAR Files Don't Work
- Many CBR files are actually ZIP (these work fine)
- True RAR files need the Python script locally
- The web app will show a helpful error message

