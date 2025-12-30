# CBR to KEPUB Web App

A Next.js web application for converting Comic Book RAR (`.cbr`) files to Kobo EPUB (`.kepub`) format. Deploy to Vercel for easy access.

## Features

- 🎨 Beautiful drag-and-drop interface
- ⚡ Fast conversion with progress tracking
- 📱 Responsive design with dark mode support
- 🔒 Client-side processing (files stay in browser/serverless function)
- ✨ Preserves original image quality
- 🚀 Ready for Vercel deployment

## Local Development

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
cd webapp
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment to Vercel

### Option 1: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   cd webapp
   vercel
   ```

3. Follow the prompts to link your project

### Option 2: Deploy via GitHub

1. Push this repository to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Vercel will automatically detect Next.js and deploy

### Option 3: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your Git repository or upload the `webapp` folder
4. Configure:
   - Framework Preset: Next.js
   - Root Directory: `webapp`
5. Deploy!

## Configuration

The app is configured to handle large files (up to 500MB) and long-running conversions (up to 5 minutes) suitable for Vercel's serverless functions.

## How It Works

1. User uploads a `.cbr` file via drag-and-drop or file picker
2. File is sent to the API route (`/api/convert`)
3. Server extracts images from the RAR/ZIP archive
4. KEPUB structure is generated with proper metadata
5. File is returned for download

## Technical Details

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **RAR Extraction**: unrar-js (with ZIP fallback)
- **EPUB Generation**: JSZip

## Limitations

- Maximum file size: 500MB (configurable in `next.config.js`)
- Maximum processing time: 5 minutes (Vercel serverless limit)
- **Important**: True RAR files (not ZIP-based CBR) require system `unrar` which isn't available in Vercel serverless functions. Many CBR files are actually ZIP files renamed, which will work fine. For true RAR files, use the Python script locally.

## Troubleshooting

### "Failed to extract archive"

- The file might be corrupted
- Try a different CBR file
- Some CBR files are actually ZIP files - the app will try both formats

### Large files timeout

- Vercel serverless functions have a 5-minute limit on Hobby plan
- Consider upgrading to Pro plan for longer timeouts
- Or process files locally using the Python script

## License

MIT

