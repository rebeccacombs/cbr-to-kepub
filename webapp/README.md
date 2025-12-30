# CBR to KEPUB Converter

A simple Next.js landing page for downloading the Python script to convert Comic Book RAR (`.cbr`) files to Kobo EPUB (`.kepub`) format.

## Features

- 📥 Download the Python conversion script
- 📖 Clear installation and usage instructions
- 🎨 Beautiful, responsive design with dark mode support
- 🚀 Ready for Vercel deployment (static site, no serverless functions)

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

## Deployment

This is a **static Next.js site** that can be deployed to many platforms. See **[DEPLOYMENT-OPTIONS.md](./DEPLOYMENT-OPTIONS.md)** for a complete guide.

### Quick Options:

1. **Cloudflare Pages** (Recommended - Best free tier)
   - Connect GitHub repo
   - Build command: `npm run build`
   - Output directory: `out`
   - Root directory: `webapp`

2. **Netlify** (Easiest - Similar to Vercel)
   - Connect GitHub repo
   - Build command: `npm run build`
   - Publish directory: `out`
   - Base directory: `webapp`

3. **Vercel** (Original choice)
   - Connect GitHub repo
   - Root Directory: `webapp`
   - Framework Preset: Next.js (auto-detected)

4. **GitHub Pages** (Free, requires GitHub Actions)
   - See `DEPLOYMENT-OPTIONS.md` for setup

All platforms work the same since this is a static export!

## How It Works

This is a static Next.js site that serves:
- A landing page with download instructions
- A download page for the Python script (`/download-script`)
- The Python script itself (`/cbr_to_kepub.py`)

**No server-side processing** - all conversion happens locally using the downloaded Python script.

## Technical Details

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Deployment**: Static site (no serverless functions)

## License

MIT
