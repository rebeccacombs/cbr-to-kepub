# Setting Up Vercel Blob Storage

This guide explains how to configure Vercel Blob Storage for temporary file storage in the webapp.

## Benefits of Using Vercel Blob

- **Large file handling**: Better for files > 50MB
- **Temporary storage**: Files automatically expire
- **Async processing**: Can process files asynchronously
- **Better memory management**: Reduces serverless function memory usage

## Setup Steps

### 1. Install Vercel Blob

The package is already in `package.json`. Install it:

```bash
cd webapp
npm install
```

### 2. Create Vercel Blob Store

1. Go to your Vercel project dashboard
2. Navigate to **Storage** tab
3. Click **Create Database** → Select **Blob**
4. Give it a name (e.g., `cbr-kepub-temp`)
5. Select a region (choose closest to your users)

### 3. Get Your Blob Token

1. In your Vercel project, go to **Settings** → **Environment Variables**
2. Vercel automatically creates `BLOB_READ_WRITE_TOKEN` when you create a Blob store
3. Make sure it's available in your environment

### 4. Configure Environment Variables

The app will automatically use Blob storage if `BLOB_READ_WRITE_TOKEN` is set.

**For local development:**
Create `.env.local`:
```env
BLOB_READ_WRITE_TOKEN=your_token_here
```

**For Vercel:**
- The token is automatically available in production
- No manual configuration needed if Blob store is created

## How It Works

### Without Blob Storage (Current Default)
- Files processed entirely in memory
- Works for files up to ~500MB
- Simpler, no setup required

### With Blob Storage (Optional)
- Large input files uploaded to Blob first
- Processed files can be stored in Blob
- Returns download URL instead of file stream
- Automatic cleanup of temporary files

## Usage Modes

The app works in two modes:

1. **Direct mode** (default): Returns file directly in response
2. **Blob mode** (if token set): Stores in Blob, returns JSON with download URL

The frontend automatically handles both modes.

## Cost Considerations

Vercel Blob pricing (as of 2024):
- **Free tier**: 1 GB storage, 100 GB bandwidth/month
- **Pro tier**: $0.15/GB storage, $0.15/GB bandwidth

For temporary storage:
- Files are stored briefly during processing
- Automatically cleaned up after download
- Typical usage: < 1 GB for active conversions

## Cleanup

The app automatically:
- Deletes input files from Blob after processing
- Optionally stores output files (can be configured to auto-delete)
- Handles errors and cleans up on failure

## Testing

1. Set up Blob storage in Vercel
2. Deploy your app
3. Upload a CBR file
4. Check Vercel dashboard → Storage to see temporary files

## Disabling Blob Storage

If you want to disable Blob storage:
- Simply don't create a Blob store in Vercel
- Or remove `BLOB_READ_WRITE_TOKEN` from environment
- The app will fall back to in-memory processing

## Notes

- Blob storage is **optional** - the app works without it
- Best for very large files (> 100MB)
- Helps with memory limits in serverless functions
- Still won't solve RAR extraction (needs system unrar)

