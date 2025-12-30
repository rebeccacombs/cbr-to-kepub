# File Size Limits & Solutions

## The Issue
Vercel has request body size limits:
- **Hobby Plan**: 4.5 MB maximum request body
- **Pro Plan**: 4.5 MB maximum request body
- **Enterprise**: Higher limits available

Large CBR files will hit this limit and show "Request Entity Too Large" error.

## Solutions

### Option 1: Use Vercel Blob Storage (Recommended for Large Files)

For files larger than 4.5 MB, you need to use Vercel Blob Storage:

1. **Create Vercel Blob Store**:
   - Go to Vercel Dashboard → Your Project
   - Go to **Storage** tab
   - Click **Create Database** → Select **Blob**
   - Name it (e.g., `cbr-temp-storage`)
   - Select a region

2. **The app will automatically use Blob storage** when `BLOB_READ_WRITE_TOKEN` is available (Vercel sets this automatically when you create a Blob store)

3. **How it works**:
   - Large files are uploaded to Blob storage first
   - Processed in the serverless function
   - Result stored in Blob
   - User downloads from Blob URL

### Option 2: Upgrade to Pro Plan

Pro plan has the same 4.5 MB limit, but you get:
- More function execution time
- Better performance
- More bandwidth

### Option 3: Split Large Files

For very large CBR files, users could:
- Split the CBR into smaller volumes
- Convert each separately
- Combine the KEPUB files (advanced)

## Current Configuration

The app is already set up to use Blob storage if available. To enable it:

1. Create a Blob store in Vercel (see Option 1 above)
2. Redeploy your app
3. The app will automatically detect and use Blob storage

## Testing

- **Small files (< 4.5 MB)**: Will work immediately
- **Large files (> 4.5 MB)**: Need Blob storage enabled

## Note

The `vercel.json` and `next.config.js` settings can't override Vercel's hard 4.5 MB limit. Blob storage is the only way to handle larger files on Vercel.

